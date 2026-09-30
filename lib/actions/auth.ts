"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";

// Master Admin Authorized Mobile Numbers & Password
const ALLOWED_ADMIN_PHONES = (
  process.env.ADMIN_ALLOWED_PHONES || "7006506721,9541223100"
)
  .split(",")
  .map((p) => p.trim().replace(/\D/g, "").slice(-10))
  .filter(Boolean);

const ALLOWED_ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "Enter@123";

/**
 * Normalizes input phone to the last 10 clean digits
 */
function normalizePhone(raw: string): string {
  if (!raw) return "";
  const digits = raw.replace(/\D/g, "");
  return digits.slice(-10);
}

// ==========================================
// ADMIN AUTHENTICATION SERVER ACTIONS
// ==========================================

export async function loginAdmin(formData: FormData) {
  const phoneRaw = (
    (formData.get("phone") as string) ||
    (formData.get("email") as string) ||
    ""
  ).trim();
  const password = (formData.get("password") as string)?.trim();
  const next = (formData.get("next") as string) || "/admin/dashboard";

  if (!phoneRaw || !password) {
    return { ok: false, error: "Please enter your admin mobile number and password." };
  }

  const normalizedPhone = normalizePhone(phoneRaw);

  const isPhoneAuthorized = ALLOWED_ADMIN_PHONES.includes(normalizedPhone);
  const isPasswordCorrect = password === ALLOWED_ADMIN_PASSWORD;

  if (!isPhoneAuthorized || !isPasswordCorrect) {
    return {
      ok: false,
      error:
        "Access Denied. Admin panel is strictly restricted to authorized numbers (7006506721, 9541223100) with password 'Enter@123'.",
    };
  }

  const cookieStore = await cookies();
  cookieStore.set(
    "wrapoura_admin_session",
    JSON.stringify({
      phone: normalizedPhone,
      role: "admin",
      authenticated_at: new Date().toISOString(),
    }),
    {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7, // 7 days session
      path: "/",
    }
  );

  redirect(next);
}

export async function logoutAdmin() {
  try {
    const cookieStore = await cookies();
    cookieStore.delete("wrapoura_admin_session");
  } catch {
    // ignore
  }

  redirect("/admin/login");
}
