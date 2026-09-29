"use client";

import { Suspense, useState } from "react";
import { useSearchParams } from "next/navigation";
import { loginAdmin } from "@/lib/actions/auth";
import { Eye, EyeOff, Lock } from "lucide-react";

function LoginForm() {
  const searchParams = useSearchParams();
  const nextUrl = searchParams.get("next") || "/admin/content";
  const [email, setEmail] = useState("admin@wrapora.com");
  const [password, setPassword] = useState("admin123");
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

  const handleAutofill = () => {
    setEmail("admin@wrapora.com");
    setPassword("admin123");
  };

  return (
    <div className="bg-white rounded-2xl p-8 shadow-2xl">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl brand-gradient flex items-center justify-center">
          <Lock className="w-5 h-5 text-white" />
        </div>
        <div>
          <h1 className="text-lg font-bold text-ink">Sign In</h1>
          <p className="text-xs text-ink/50">Enter your admin credentials</p>
        </div>
      </div>

      {error && <p className="text-red-500 text-sm bg-red-50 p-3 rounded-xl mb-4">{error}</p>}

      {/* Default credentials badge */}
      <div className="mb-5 p-3.5 rounded-xl bg-purple-50/80 border border-purple-100 flex items-center justify-between text-xs">
        <div>
          <span className="font-bold text-[#250842] block">Default Admin Login:</span>
          <span className="text-purple-700 font-mono text-[11px]">
            admin@wrapora.com / <strong className="text-[#D91B60]">admin123</strong>
          </span>
        </div>
        <button
          type="button"
          onClick={handleAutofill}
          className="px-2.5 py-1 rounded-lg bg-white border border-purple-200 text-purple-900 font-bold hover:bg-purple-100/50 shadow-xs cursor-pointer text-[11px]"
        >
          Auto-fill
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-ink mb-1">Email</label>
          <input
            name="email"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-royal focus:ring-1 focus:ring-royal outline-none text-sm"
            placeholder="admin@wrapora.com"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-ink mb-1">Password</label>
          <div className="relative">
            <input
              name="password"
              type={showPassword ? "text" : "password"}
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 pr-12 rounded-xl border border-gray-200 focus:border-royal focus:ring-1 focus:ring-royal outline-none text-sm font-mono"
              placeholder="admin123"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-ink/40 hover:text-ink/70"
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>
        <button
          type="submit"
          disabled={loading}
          className="w-full brand-gradient text-white py-3 rounded-xl font-semibold text-sm disabled:opacity-50 hover:opacity-90 transition-all cursor-pointer shadow-md shadow-[#D91B60]/30"
        >
          {loading ? "Signing in..." : "Sign In to Admin Console"}
        </button>
      </form>
    </div>
  );
}

export default function AdminLoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#250842] via-[#330856] to-[#1E0535] px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8 flex flex-col items-center">
          <div className="w-20 h-20 rounded-full overflow-hidden shadow-2xl ring-4 ring-pink-500/30 bg-white mb-3">
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
            Wrapped With Love · Admin Console
          </p>
        </div>
        <Suspense fallback={<div className="bg-white rounded-2xl p-8 shadow-2xl text-center text-ink/50">Loading...</div>}>
          <LoginForm />
        </Suspense>
      </div>
    </div>
  );
}
