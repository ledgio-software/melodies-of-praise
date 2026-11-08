import "server-only";
import { randomBytes } from "node:crypto";
import { FormError } from "./admin";

/**
 * Photo storage. Production uses Vercel Blob (BLOB_READ_WRITE_TOKEN is set when
 * a Blob store is connected to the project). In local development without a
 * token, files are written to public/uploads so the dashboard can be tried out.
 */

/**
 * The Blob store's key. Vercel names it BLOB_READ_WRITE_TOKEN, or
 * <PREFIX>_READ_WRITE_TOKEN when a custom prefix was typed while connecting
 * the store, so accept either.
 */
export function blobToken(): string | undefined {
  if (process.env.BLOB_READ_WRITE_TOKEN) return process.env.BLOB_READ_WRITE_TOKEN;
  const key = Object.keys(process.env).find((k) => k.endsWith("_READ_WRITE_TOKEN") && process.env[k]?.startsWith("vercel_blob_rw_"));
  return key ? process.env[key] : undefined;
}

export const storageEnabled = Boolean(blobToken()) || process.env.NODE_ENV !== "production";

const MAX_BYTES = 4 * 1024 * 1024;
const TYPES: Record<string, string> = { "image/jpeg": "jpg", "image/png": "png", "image/webp": "webp" };

/** Upload problems are shown to the user like any other form error. */
export class UploadError extends FormError {}

export async function savePhoto(file: File, folder: "photos" | "leaders"): Promise<string> {
  if (!file || file.size === 0) throw new UploadError("Please choose a photo.");
  const ext = TYPES[file.type];
  if (!ext) throw new UploadError("Please upload a JPG, PNG or WebP photo.");
  if (file.size > MAX_BYTES) throw new UploadError("That photo is too large (max 4 MB).");
  const name = `${folder}/${Date.now()}-${randomBytes(4).toString("hex")}.${ext}`;

  const token = blobToken();
  if (token) {
    const { put } = await import("@vercel/blob");
    try {
      const blob = await put(name, file, { access: "public", contentType: file.type, token });
      return blob.url;
    } catch (err) {
      console.error("Blob upload failed", err);
      const msg = err instanceof Error ? err.message : "";
      if (/private/i.test(msg)) throw new UploadError("The photo store is set to Private. Create a Public Blob store in Vercel and connect it to the project.");
      throw new UploadError("The photo could not be uploaded. Please try again.");
    }
  }
  if (process.env.NODE_ENV !== "production") {
    const { mkdir, writeFile } = await import("node:fs/promises");
    const path = await import("node:path");
    const dest = path.join(process.cwd(), "public", "uploads", name);
    await mkdir(path.dirname(dest), { recursive: true });
    await writeFile(dest, Buffer.from(await file.arrayBuffer()));
    return `/uploads/${name}`;
  }
  throw new UploadError("Photo storage is not set up yet. In Vercel, connect a Public Blob store to this project (Production and Preview), then redeploy.");
}

/** Remove an uploaded photo. Built-in photos under /photos are left alone. */
export async function deletePhoto(url: string | null | undefined) {
  if (!url) return;
  try {
    const token = blobToken();
    if (url.includes(".blob.vercel-storage.com") && token) {
      const { del } = await import("@vercel/blob");
      await del(url, { token });
    } else if (url.startsWith("/uploads/") && process.env.NODE_ENV !== "production") {
      const { unlink } = await import("node:fs/promises");
      const path = await import("node:path");
      await unlink(path.join(process.cwd(), "public", url));
    }
  } catch (err) {
    console.error("Could not delete photo", url, err);
  }
}
