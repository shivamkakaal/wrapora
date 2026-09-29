import { NextResponse } from "next/server";
import { sendTestNotification } from "@/lib/services/push";

export async function POST() {
  try {
    const result = await sendTestNotification("admin");
    return NextResponse.json({
      ok: result.success,
      ...result,
    });
  } catch (err: unknown) {
    const error = err as Error;
    return NextResponse.json(
      { ok: false, error: error.message || "Failed to trigger test push" },
      { status: 500 }
    );
  }
}
