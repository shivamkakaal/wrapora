import { NextRequest, NextResponse } from "next/server";
import { revalidateTag, revalidatePath } from "next/cache";

export async function POST(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const secret = searchParams.get("secret");
    const tag = searchParams.get("tag");
    const path = searchParams.get("path");

    if (secret !== process.env.REVALIDATE_SECRET) {
      return NextResponse.json(
        { ok: false, error: "Invalid revalidation secret" },
        { status: 401 }
      );
    }

    if (tag) {
      // In Next.js 16 revalidateTag
      revalidateTag(tag, "max");
      return NextResponse.json({ ok: true, revalidated: true, tag, now: Date.now() });
    }

    if (path) {
      revalidatePath(path);
      return NextResponse.json({ ok: true, revalidated: true, path, now: Date.now() });
    }

    return NextResponse.json(
      { ok: false, error: "Missing 'tag' or 'path' query parameter" },
      { status: 400 }
    );
  } catch (err: unknown) {
    const error = err as Error;
    return NextResponse.json(
      { ok: false, error: error.message || "Failed to revalidate" },
      { status: 500 }
    );
  }
}
