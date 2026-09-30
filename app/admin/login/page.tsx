"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { loginAdmin } from "@/lib/actions/auth";
import { Eye, EyeOff, Lock, ShieldCheck, Smartphone } from "lucide-react";
import AdminPwaManager from "@/components/admin/AdminPwaManager";

function LoginForm() {
  const searchParams = useSearchParams();
  const nextUrl = searchParams.get("next") || "/admin/dashboard";
  const [phone, setPhone] = useState("7006506721");
  const [password, setPassword] = useState("Enter@123");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    const formData = new FormData(e.currentTarget);
    formData.set("next", nextUrl);
    const result = await loginAdmin(formData);
    if (result && !result.ok) {
      setError(result.error || "Login failed.");
    }
    setLoading(false);
  };

  const setAdminAccount = (phoneNumber: string) => {
    setPhone(phoneNumber);
    setPassword("Enter@123");
    setError("");
  };

  return (
    <div className="bg-white rounded-3xl p-7 sm:p-8 shadow-2xl border border-pink-100">
      <div className="flex items-center gap-3.5 mb-6">
        <div className="w-11 h-11 rounded-2xl brand-gradient flex items-center justify-center shadow-md shadow-pink-500/20">
          <ShieldCheck className="w-6 h-6 text-white" />
        </div>
        <div>
          <h1 className="text-xl font-bold font-playfair text-ink leading-tight">Admin Executive Login</h1>
          <p className="text-xs text-ink/50 mt-0.5">Restricted to authorized mobile numbers</p>
        </div>
      </div>

      {error && (
        <div className="bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold p-3.5 rounded-2xl mb-5 flex items-start gap-2 animate-in fade-in duration-200">
          <span className="w-1.5 h-1.5 rounded-full bg-rose-500 mt-1 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Quick Authorized Accounts Selector */}
      <div className="mb-5 p-3.5 rounded-2xl bg-[#1F0838]/5 border border-[#1F0838]/10 text-xs">
        <div className="flex items-center justify-between mb-2">
          <span className="font-bold text-[#1F0838] uppercase tracking-wider text-[10px]">
            Authorized Mobile Numbers:
          </span>
          <span className="text-[10px] text-pink-700 font-semibold bg-pink-100/70 px-2 py-0.5 rounded-full">
            Key: Enter@123
          </span>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => setAdminAccount("7006506721")}
            className={`py-2 px-3 rounded-xl border text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              phone.includes("7006506721")
                ? "bg-[#1F0838] text-white border-[#1F0838] shadow-sm"
                : "bg-white text-[#1F0838] border-purple-200 hover:border-[#1F0838]/50"
            }`}
          >
            <Smartphone className="w-3.5 h-3.5 text-amber-500" />
            <span>7006506721</span>
          </button>
          <button
            type="button"
            onClick={() => setAdminAccount("9541223100")}
            className={`py-2 px-3 rounded-xl border text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              phone.includes("9541223100")
                ? "bg-[#1F0838] text-white border-[#1F0838] shadow-sm"
                : "bg-white text-[#1F0838] border-purple-200 hover:border-[#1F0838]/50"
            }`}
          >
            <Smartphone className="w-3.5 h-3.5 text-amber-500" />
            <span>9541223100</span>
          </button>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-ink/70 mb-1.5">
            Admin Mobile Number
          </label>
          <div className="flex rounded-xl border border-gray-200 focus-within:border-royal focus-within:ring-1 focus-within:ring-royal overflow-hidden transition-all bg-white">
            <span className="px-3.5 py-3 bg-gray-50 text-gray-500 font-semibold text-xs border-r border-gray-200 select-none flex items-center gap-1.5">
              <span>🇮🇳</span> +91
            </span>
            <input
              name="phone"
              type="tel"
              required
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full px-4 py-3 outline-none text-sm font-semibold tracking-wide text-ink"
              placeholder="7006506721 / 9541223100"
              autoComplete="tel"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-ink/70 mb-1.5">
            Password
          </label>
          <div className="relative">
            <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400">
              <Lock className="w-4 h-4" />
            </div>
            <input
              name="password"
              type={showPassword ? "text" : "password"}
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full pl-10 pr-12 py-3 rounded-xl border border-gray-200 focus:border-royal focus:ring-1 focus:ring-royal outline-none text-sm font-mono text-ink tracking-wide"
              placeholder="Enter@123"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 text-gray-400 hover:text-ink cursor-pointer rounded-lg"
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full brand-gradient text-white py-3.5 rounded-xl font-bold text-sm disabled:opacity-50 hover:opacity-95 transition-all cursor-pointer shadow-lg shadow-pink-500/25 active:scale-99 flex items-center justify-center gap-2 mt-2"
        >
          {loading ? (
            <>
              <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              <span>Verifying Executive Access...</span>
            </>
          ) : (
            <>
              <ShieldCheck className="w-4 h-4" />
              <span>Sign In to Admin Console</span>
            </>
          )}
        </button>
      </form>
    </div>
  );
}

export default function AdminLoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#250842] via-[#330856] to-[#1E0535] px-4 py-8">
      <div className="w-full max-w-md">
        <div className="text-center mb-8 flex flex-col items-center">
          <div className="w-20 h-20 rounded-3xl overflow-hidden shadow-2xl ring-4 ring-pink-500/30 bg-white mb-3 flex items-center justify-center">
            <img
              src="/images/wrapora-logo.png"
              alt="WRAPORA Logo"
              className="w-full h-full object-cover scale-105"
            />
          </div>
          <span className="text-3xl font-extrabold font-serif text-white tracking-widest uppercase">
            WRAPORA
          </span>
          <p className="text-pink-200/80 text-xs tracking-widest uppercase mt-0.5 font-bold">
            Executive Admin Console
          </p>
        </div>

        <Suspense fallback={<div className="bg-white rounded-3xl p-8 shadow-2xl text-center text-ink/50">Loading...</div>}>
          <LoginForm />
        </Suspense>

        <div className="mt-6 flex flex-col items-center gap-3">
          <AdminPwaManager variant="pill" />
          <Link href="/" className="text-xs text-white/60 hover:text-white transition-colors">
            ← Return to WRAPORA Storefront
          </Link>
        </div>
        <AdminPwaManager variant="floating-only" />
      </div>
    </div>
  );
}
