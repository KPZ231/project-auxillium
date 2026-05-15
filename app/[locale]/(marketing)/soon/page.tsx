"use client";

import { useState } from "react";
import { useTranslation } from "@/app/context/TranslationContext";
import Head from "next/head";
import { CheckCircle, Mail, ArrowRight } from "lucide-react";

export default function ComingSoonPage() {
  const { t, language } = useTranslation();
  const [email, setEmail] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      // Validate email
      if (!email || !email.includes("@")) {
        setError("Please enter a valid email address");
        return;
      }

      // Call MailerLite API
      const response = await fetch("/api/subscribe", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to subscribe");
      }

      setIsSubmitted(true);
      setEmail("");
    } catch (err: any) {
      setError(err.message || "Something went wrong");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Head>
        <title>Auxillium - Coming Soon</title>
        <meta
          name="description"
          content="Auxillium - Business management platform. Coming soon."
        />
        <meta property="og:title" content="Auxillium - Coming Soon" />
        <meta
          property="og:description"
          content="Auxillium - Business management platform. Coming soon."
        />
        <meta property="og:type" content="website" />
        <meta
          property="og:image"
          content="/images/auxillium-og.jpg"
        />
      </Head>

      <div className="min-h-screen bg-[#FAFAFA] flex flex-col">
        {/* Main Content */}
        <main className="flex-1 flex items-center justify-center px-4 py-16 md:py-24">
          <div className="max-w-4xl mx-auto text-center">
            {/* Logo/Brand */}
            <div className="mb-8 md:mb-12">
              <h1 className="text-6xl font-bold text-[#0A0A0A] mb-4">
                Auxillium
              </h1>
              <p className="text-xl text-[#71717A]">
                Business Management Platform
              </p>
            </div>

            {/* Hero Section */}
            <div className="mb-12 md:mb-16">
              <h2 className="text-5xl font-bold text-[#0A0A0A] mb-6">
                Something Amazing
                <br />
                <span className="text-[#0A0A0A]">Is Coming</span>
              </h2>
              <p className="text-lg text-[#71717A] max-w-2xl mx-auto leading-relaxed">
                We're crafting the future of business management.
                Join our launch list to be the first to experience
                Auxillium and transform how you manage your projects,
                clients, and finances.
              </p>
            </div>

            {/* Countdown Timer */}
            <div className="mb-12 md:mb-16">
              <div className="flex justify-center gap-4 md:gap-8">
                <div className="text-center">
                  <div className="text-4xl md:text-6xl font-bold text-[#0A0A0A]">
                    00
                  </div>
                  <div className="text-sm md:text-base text-[#71717A] uppercase tracking-wider">
                    Days
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-4xl md:text-6xl font-bold text-[#0A0A0A]">
                    00
                  </div>
                  <div className="text-sm md:text-base text-[#71717A] uppercase tracking-wider">
                    Hours
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-4xl md:text-6xl font-bold text-[#0A0A0A]">
                    00
                  </div>
                  <div className="text-sm md:text-base text-[#71717A] uppercase tracking-wider">
                    Minutes
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-4xl md:text-6xl font-bold text-[#0A0A0A]">
                    00
                  </div>
                  <div className="text-sm md:text-base text-[#71717A] uppercase tracking-wider">
                    Seconds
                  </div>
                </div>
              </div>
            </div>

            {/* Email Signup Form */}
            {!isSubmitted ? (
              <div className="max-w-md mx-auto">
                <form onSubmit={handleSubmit} className="flex gap-2">
                  <div className="flex-1">
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Enter your email"
                      className="w-full px-4 py-3 border border-[#D4D4D8] focus:border-[#0A0A0A] focus:outline-none transition-colors"
                      disabled={isLoading}
                    />
                    {error && (
                      <p className="text-sm text-[#DC2626] mt-1">{error}</p>
                    )}
                  </div>
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="px-6 py-3 bg-[#0A0A0A] text-white hover:bg-[#1F1F1F] transition-colors disabled:opacity-50 flex items-center gap-2"
                  >
                    {isLoading ? (
                      "..."
                    ) : (
                      <>
                        Get Notified
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </form>
                <p className="text-sm text-[#71717A] mt-3">
                  We respect your privacy. Unsubscribe at any time.
                </p>
              </div>
            ) : (
              {/* Success Message */}
              <div className="max-w-md mx-auto">
                <div className="flex flex-col items-center gap-4">
                  <CheckCircle className="w-16 h-16 text-[#16A34A]" />
                  <h3 className="text-2xl font-bold text-[#0A0A0A]">
                    Thank You!
                  </h3>
                  <p className="text-[#71717A]">
                    You've been added to our launch list.
                    We'll notify you when Auxillium is ready.
                  </p>
                </div>
              </div>
            )

            {/* Features Preview */}
            <div className="mt-16 md:mt-24 grid md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="mb-4">
                  <Mail className="w-12 h-12 text-[#0A0A0A] mx-auto" />
                </div>
                <h3 className="text-lg font-semibold text-[#0A0A0A] mb-2">
                  Project Management
                </h3>
                <p className="text-sm text-[#71717A]">
                  Organize, track, and deliver projects efficiently
                </p>
              </div>
              <div className="text-center">
                <div className="mb-4">
                  <Mail className="w-12 h-12 text-[#0A0A0A] mx-auto" />
                </div>
                <h3 className="text-lg font-semibold text-[#0A0A0A] mb-2">
                  Lead Tracking
                </h3>
                <p className="text-sm text-[#71717A]">
                  Capture and nurture leads to grow your business
                </p>
              </div>
              <div className="text-center">
                <div className="mb-4">
                  <Mail className="w-12 h-12 text-[#0A0A0A] mx-auto" />
                </div>
                <h3 className="text-lg font-semibold text-[#0A0A0A] mb-2">
                  Financial Control
                </h3>
                <p className="text-sm text-[#71717A]">
                  Manage expenses, income, and revenue goals
                </p>
              </div>
            </div>
          </div>
        </main>

        {/* Footer */}
        <footer className="py-8 md:py-12 border-t border-[#D4D4D8]">
          <div className="max-w-4xl mx-auto px-4 text-center">
            <p className="text-sm text-[#71717A]">
              © {new Date().getFullYear()} Auxillium. All rights reserved.
            </p>
            <div className="flex justify-center gap-6 mt-4">
              <a
                href={`/${language}/privacy`}
                className="text-sm text-[#71717A] hover:text-[#0A0A0A] transition-colors"
              >
                Privacy Policy
              </a>
              <a
                href={`/${language}/terms`}
                className="text-sm text-[#71717A] hover:text-[#0A0A0A] transition-colors"
              >
                Terms of Service
              </a>
              <a
                href={`/${language}/contact`}
                className="text-sm text-[#71717A] hover:text-[#0A0A0A] transition-colors"
              >
                Contact
              </a>
            </div>
          </div>
        </footer>
      </div>
    </>
  );
}