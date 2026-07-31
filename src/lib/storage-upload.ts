import {
  ref,
  uploadBytesResumable,
  getDownloadURL,
  UploadTaskSnapshot,
} from "firebase/storage";
import { storage } from "@/lib/firebase";

export interface UploadResult {
  downloadUrl: string;
}

/**
 * Uploads a file to Firebase Storage at the given path, reporting progress
 * (0-100) via onProgress as it streams. Resolves with the public download URL.
 */
export function uploadFileWithProgress(
  storagePath: string,
  file: File,
  onProgress?: (percent: number) => void,
): Promise<UploadResult> {
  return new Promise((resolve, reject) => {
    const storageRef = ref(storage, storagePath);
    const task = uploadBytesResumable(storageRef, file);

    task.on(
      "state_changed",
      (snapshot: UploadTaskSnapshot) => {
        const percent = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        onProgress?.(Math.round(percent));
      },
      (error) => reject(error),
      async () => {
        const downloadUrl = await getDownloadURL(task.snapshot.ref);
        resolve({ downloadUrl });
      },
    );
  });
}

export function profilePhotoPath(userId: string, file: File): string {
  const ext = file.name.split(".").pop();
  return `profile-photos/${userId}/photo.${ext}`;
}

export function nicDocumentPath(userId: string, file: File): string {
  const ext = file.name.split(".").pop();
  return `nic-documents/${userId}/nic.${ext}`;
}
