"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { createClient as createServerClient } from "@/lib/supabase/server";

// ==========================================
// ADMIN AUTHENTICATION SERVER ACTIONS
// ==========================================

export async function loginAdmin(formData: FormData) {
  const email = (formData.get("email") as string)?.trim().toLowerCase();
  const password = formData.get("password") as string;
  const next = (formData.get("next") as string) || "/admin/content";

  if (!email || !password) {
    return { ok: false, error: "Please enter both email and password." };
  }

  // Master Admin Credentials Allow-list
  const validAdminEmails = [
    "admin@wrapora.com",
    "shivamkakaal@gmail.com",
    "abhu2680@gmail.com",
    "admin@wrapoura.com",
    "admin@rapora.com",
    "wrapoura.admin@gmail.com",
    "admin@gmail.com",
    "admin",
  ];
  const validAdminPasswords = [
    "admin123",
    "admin",
    "Admin@123",
    "wrapora2026",
    "wrapoura2026",
    "Admin@wrapoura2026",
  ];

  const isMasterAdmin =
    validAdminEmails.includes(email) && validAdminPasswords.includes(password);

  if (isMasterAdmin) {
    const cookieStore = await cookies();
    cookieStore.set(
      "wrapoura_admin_session",
      JSON.stringify({
        email,
        role: "admin",
        authenticated_at: new Date().toISOString(),
      }),
      {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 60 * 60 * 24 * 7, // 7 days
        path: "/",
      }
    );

    redirect(next);
  }

  // Fallback: try Supabase Auth
  try {
    const supabase = await createServerClient();
    const { data } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (data?.user) {
      const cookieStore = await cookies();
      cookieStore.set(
        "wrapoura_admin_session",
        JSON.stringify({
          email: data.user.email,
          role: "admin",
          authenticated_at: new Date().toISOString(),
        }),
        {
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          sameSite: "lax",
          maxAge: 60 * 60 * 24 * 7,
          path: "/",
        }
      );

      redirect(next);
    }
  } catch (err: unknown) {
    if ((err as Error).message?.includes("NEXT_REDIRECT")) {
      throw err;
    }
  }

  return {
    ok: false,
    error: "Invalid credentials. Use admin@wrapora.com / admin123",
  };
}

export async function logoutAdmin() {
  try {
    const cookieStore = await cookies();
    cookieStore.delete("wrapoura_admin_session");
  } catch {
    // ignore
  }

  try {
    const supabase = await createServerClient();
    await supabase.auth.signOut();
  } catch {
    // ignore
  }

  redirect("/admin/login");
}
