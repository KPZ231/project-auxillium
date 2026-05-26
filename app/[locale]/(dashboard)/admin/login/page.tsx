"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { adminLoginAction } from "@/actions/admin-auth";

export default function AdminLoginPage() {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const result = await adminLoginAction(password);
    
    if (result.error) {
      setError(result.error);
      setLoading(false);
    } else {
      router.push("/admin/verify");
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-[#FAFAFA] text-[#0A0A0A] font-inter">
      <div className="w-full max-w-sm p-8 bg-white border border-[#E5E5E5]">
        <h1 className="text-2xl font-bold mb-6 text-center">Admin Panel</h1>
        
        {error && (
          <div className="mb-4 p-3 border border-[#DC2626] text-[#DC2626] text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2 text-[#0A0A0A]">
              Step 1 Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full h-10 px-3 text-sm bg-white border border-[#D4D4D8] focus:outline-none focus:border-[#0A0A0A] focus:border-2 transition-none rounded-none"
              placeholder="Enter ADMIN_PASSWORD"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full h-12 bg-[#0A0A0A] text-[#FAFAFA] text-sm font-medium hover:bg-transparent hover:text-[#0A0A0A] hover:border hover:border-[#0A0A0A] transition-none disabled:opacity-30 disabled:cursor-not-allowed rounded-none"
          >
            {loading ? "Authenticating..." : "Continue"}
          </button>
        </form>
      </div>
    </div>
  );
}
