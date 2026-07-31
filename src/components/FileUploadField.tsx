"use client";

import { useState } from "react";
import { uploadFileWithProgress } from "@/lib/storage-upload";

interface FileUploadFieldProps {
  label: string;
  accept: string;
  storagePath: (file: File) => string;
  showImagePreview?: boolean;
  onUploaded: (downloadUrl: string) => void;
  existingUrl?: string | null;
}

export function FileUploadField({
  label,
  accept,
  storagePath,
  showImagePreview = false,
  onUploaded,
  existingUrl,
}: FileUploadFieldProps) {
  const [preview, setPreview] = useState<string | null>(existingUrl ?? null);
  const [fileName, setFileName] = useState<string | null>(null);
  const [progress, setProgress] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setError(null);
    setFileName(file.name);
    if (showImagePreview) {
      setPreview(URL.createObjectURL(file));
    }

    setProgress(0);
    try {
      const { downloadUrl } = await uploadFileWithProgress(
        storagePath(file),
        file,
        (pct) => setProgress(pct),
      );
      onUploaded(downloadUrl);
      setProgress(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed");
      setProgress(null);
    }
  }

  return (
    <div>
      <label className="text-sm font-medium text-foreground">{label}</label>
      <input
        type="file"
        accept={accept}
        onChange={handleChange}
        className="mt-2 block w-full text-sm text-foreground/70"
      />

      {showImagePreview && preview && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={preview}
          alt={`${label} preview`}
          className="mt-3 h-20 w-20 rounded-full object-cover"
        />
      )}

      {!showImagePreview && fileName && (
        <p className="mt-1 text-xs text-foreground/60">{fileName}</p>
      )}

      {progress !== null && (
        <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-brand-soft/40">
          <div
            className="h-full bg-brand transition-all"
            style={{ width: `${progress}%` }}
          />
        </div>
      )}

      {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
    </div>
  );
}
