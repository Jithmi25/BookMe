export type UserRole = "customer" | "provider" | "admin";

export interface AppUser {
  uid: string;
  role: UserRole | null; // null until role-selection is completed
  name: string;
  email: string | null;
  phone: string | null;
  profilePhoto: string | null;
  suspended?: boolean;
  createdAt: number;
  updatedAt: number;
}
