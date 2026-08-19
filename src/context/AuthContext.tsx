"use client";

import {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  ReactNode,
} from "react";
import {
  onAuthStateChanged,
  signOut as firebaseSignOut,
  RecaptchaVerifier,
  signInWithPhoneNumber,
  ConfirmationResult,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  User as FirebaseUser,
} from "firebase/auth";
import { doc, setDoc, serverTimestamp, onSnapshot } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";
import { AppUser, UserRole } from "@/types/user";

interface AuthContextValue {
  firebaseUser: FirebaseUser | null;
  appUser: AppUser | null;
  loading: boolean;
  error: string | null;

  // Phone OTP flow
  setupRecaptcha: (containerId: string) => RecaptchaVerifier;
  sendOtp: (phoneNumber: string, containerId: string) => Promise<void>;
  confirmOtp: (code: string) => Promise<FirebaseUser>;

  // Email fallback
  signUpWithEmail: (email: string, password: string) => Promise<FirebaseUser>;
  signInWithEmail: (email: string, password: string) => Promise<FirebaseUser>;

  // Shared
  completeRoleSelection: (role: UserRole, name: string) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [appUser, setAppUser] = useState<AppUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const confirmationResultRef = useRef<ConfirmationResult | null>(null);
  const recaptchaVerifierRef = useRef<RecaptchaVerifier | null>(null);

  // Track Firebase auth state, then subscribe to the matching Firestore user doc
  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, (fbUser) => {
      setFirebaseUser(fbUser);
      if (!fbUser) {
        setAppUser(null);
        setLoading(false);
      }
    });
    return () => unsubscribeAuth();
  }, []);

  useEffect(() => {
    if (!firebaseUser) return;

    setLoading(true);
    const userDocRef = doc(db, "users", firebaseUser.uid);

    const unsubscribeDoc = onSnapshot(
      userDocRef,
      (snap) => {
        if (snap.exists()) {
          setAppUser({
            uid: firebaseUser.uid,
            ...(snap.data() as Omit<AppUser, "uid">),
          });
        } else {
          // First-time sign-in: no profile doc yet, role selection pending
          setAppUser(null);
        }
        setLoading(false);
      },
      (err) => {
        setError(err.message);
        setLoading(false);
      },
    );

    return () => unsubscribeDoc();
  }, [firebaseUser]);

  function setupRecaptcha(containerId: string): RecaptchaVerifier {
    if (recaptchaVerifierRef.current) return recaptchaVerifierRef.current;
    const verifier = new RecaptchaVerifier(auth, containerId, {
      size: "invisible",
    });
    recaptchaVerifierRef.current = verifier;
    return verifier;
  }

  async function sendOtp(phoneNumber: string, containerId: string) {
    setError(null);
    try {
      const verifier = setupRecaptcha(containerId);
      const confirmation = await signInWithPhoneNumber(
        auth,
        phoneNumber,
        verifier,
      );
      confirmationResultRef.current = confirmation;
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to send OTP";
      setError(message);
      throw err;
    }
  }

  async function confirmOtp(code: string): Promise<FirebaseUser> {
    setError(null);
    if (!confirmationResultRef.current) {
      throw new Error("No OTP request in progress. Call sendOtp first.");
    }
    try {
      const result = await confirmationResultRef.current.confirm(code);
      return result.user;
    } catch (err) {
      const message = err instanceof Error ? err.message : "Invalid OTP code";
      setError(message);
      throw err;
    }
  }

  async function signUpWithEmail(email: string, password: string) {
    setError(null);
    try {
      const cred = await createUserWithEmailAndPassword(auth, email, password);
      return cred.user;
    } catch (err) {
      const message = err instanceof Error ? err.message : "Sign up failed";
      setError(message);
      throw err;
    }
  }

  async function signInWithEmail(email: string, password: string) {
    setError(null);
    try {
      const cred = await signInWithEmailAndPassword(auth, email, password);
      return cred.user;
    } catch (err) {
      const message = err instanceof Error ? err.message : "Sign in failed";
      setError(message);
      throw err;
    }
  }

  // Called from /auth/role-selection once the user picks customer/provider.
  // Use direct Firestore writes so this works on the free plan without deploying
  // a callable Cloud Function.
  async function completeRoleSelection(role: UserRole, name: string) {
    if (!firebaseUser) throw new Error("Not signed in");

    try {
      await setDoc(
        doc(db, "users", firebaseUser.uid),
        {
          role,
          name,
          email: firebaseUser.email ?? null,
          phone: firebaseUser.phoneNumber ?? null,
          profilePhoto: null,
          updatedAt: serverTimestamp(),
          createdAt: serverTimestamp(),
        },
        { merge: true },
      );
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to save profile";
      setError(message);
      throw err;
    }
  }

  async function signOut() {
    await firebaseSignOut(auth);
    confirmationResultRef.current = null;
  }

  const value: AuthContextValue = {
    firebaseUser,
    appUser,
    loading,
    error,
    setupRecaptcha,
    sendOtp,
    confirmOtp,
    signUpWithEmail,
    signInWithEmail,
    completeRoleSelection,
    signOut,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuthContext(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuthContext must be used within an AuthProvider");
  }
  return ctx;
}
