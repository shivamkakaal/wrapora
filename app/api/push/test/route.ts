import { NextRequest, NextResponse } from "next/server";
import { sendTestNotification } from "@/lib/services/push";

export async function POST(request: NextRequest) {
  try {
    let audience: "customer" | "admin" = "customer";
    try {
      const body = await request.json();
      if (body.audience === "admin" || body.audience === "customer") {
        audience = body.audience;
      }
    } catch {
      // default customer
    }

    const result = await sendTestNotification(audience);
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
