"use server";

import { writeFile } from "fs/promises";
import { join } from "path";
import { existsSync, mkdirSync } from "fs";

export interface UploadActionResult {
  ok: boolean;
  url?: string;
  size?: number;
  name?: string;
  error?: string;
}

export async function uploadImageAction(formData: FormData): Promise<UploadActionResult> {
  try {
    const file = formData.get("file") as File | null;
    if (!file) {
      return { ok: false, error: "No file uploaded" };
    }

    if (!file.type.startsWith("image/")) {
      return { ok: false, error: "File must be an image (PNG, JPG, WEBP, etc.)" };
    }

    const MAX_SIZE = 10 * 1024 * 1024;
    if (file.size > MAX_SIZE) {
      return { ok: false, error: "Image size exceeds 10MB limit. Please choose an image under 10MB." };
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const uploadsDir = join(process.cwd(), "public", "uploads");
    if (!existsSync(uploadsDir)) {
      mkdirSync(uploadsDir, { recursive: true });
    }

    const originalExt = file.name.split(".").pop() || "jpg";
    const cleanExt = originalExt.toLowerCase().replace(/[^a-z0-9]/g, "");
    const safeName = file.name
      .replace(/\.[^/.]+$/, "")
      .toLowerCase()
      .replace(/[^a-z0-9]/g, "-")
      .substring(0, 30);
    const fileName = `${safeName}-${Date.now()}.${cleanExt || "jpg"}`;
    const filePath = join(uploadsDir, fileName);

    await writeFile(filePath, buffer);

    return {
      ok: true,
      url: `/uploads/${fileName}`,
      size: file.size,
      name: file.name,
    };
  } catch (err: unknown) {
    const error = err as Error;
    return { ok: false, error: error.message || "Failed to process upload" };
  }
}
