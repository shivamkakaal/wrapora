import { NextRequest, NextResponse } from "next/server";
import { writeFile } from "fs/promises";
import { join } from "path";
import { existsSync, mkdirSync } from "fs";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ ok: false, error: "No file uploaded" }, { status: 400 });
    }

    // Verify it's an image
    if (!file.type.startsWith("image/")) {
      return NextResponse.json({ ok: false, error: "File must be an image (PNG, JPG, WEBP, etc.)" }, { status: 400 });
    }

    // Max 10MB check (10 * 1024 * 1024 bytes)
    const MAX_SIZE = 10 * 1024 * 1024;
    if (file.size > MAX_SIZE) {
      return NextResponse.json({ ok: false, error: "Image size exceeds 10MB limit. Please upload an image under 10MB." }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Ensure uploads directory exists
    const uploadsDir = join(process.cwd(), "public", "uploads");
    if (!existsSync(uploadsDir)) {
      mkdirSync(uploadsDir, { recursive: true });
    }

    // Clean filename
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

    const publicUrl = `/uploads/${fileName}`;

    return NextResponse.json({
      ok: true,
      url: publicUrl,
      size: file.size,
      name: file.name,
    });
  } catch (err: unknown) {
    const error = err as Error;
    return NextResponse.json({ ok: false, error: error.message || "Failed to process upload" }, { status: 500 });
  }
}
