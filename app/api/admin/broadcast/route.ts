import { NextRequest, NextResponse } from "next/server";
import { broadcastAnnouncement, getAllPushSubscriptions, getAnnouncementHistory } from "@/lib/services/push";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const allSubs = await getAllPushSubscriptions();
    const customerSubs = allSubs.filter((s) => s.audience === "customer");
    const adminSubs = allSubs.filter((s) => s.audience === "admin");
    const history = await getAnnouncementHistory();

    return NextResponse.json({
      ok: true,
      stats: {
        totalSubscribers: allSubs.length,
        customerSubscribers: customerSubs.length,
        adminSubscribers: adminSubs.length,
      },
      history,
    });
  } catch (err: unknown) {
    const error = err as Error;
    console.error("Error fetching broadcast stats:", error);
    return NextResponse.json(
      { ok: false, error: error.message || "Failed to fetch stats" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { title, body: messageBody, url = "/", audience = "all" } = body;

    if (!title || !title.trim()) {
      return NextResponse.json(
        { ok: false, error: "Announcement title is required" },
        { status: 400 }
      );
    }

    if (!messageBody || !messageBody.trim()) {
      return NextResponse.json(
        { ok: false, error: "Announcement message body is required" },
        { status: 400 }
      );
    }

    const result = await broadcastAnnouncement({
      title: title.trim(),
      body: messageBody.trim(),
      url: (url || "/").trim(),
      audience: audience === "customer" || audience === "admin" ? audience : "all",
    });

    return NextResponse.json({
      ok: true,
      ...result,
    });
  } catch (err: unknown) {
    const error = err as Error;
    console.error("Error broadcasting announcement:", error);
    return NextResponse.json(
      { ok: false, error: error.message || "Failed to broadcast announcement" },
      { status: 500 }
    );
  }
}
