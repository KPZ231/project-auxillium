"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { getCookie, setCookie } from "cookies-next";
import { motion, AnimatePresence } from "motion/react";

export default function CookieBanner() {
  const [mounted, setMounted] = useState(false);
  const [showBanner, setShowBanner] = useState(false);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
    const cookieConsent = getCookie("cookieConsent");
    if (!cookieConsent) {
      setShowBanner(true);
    }
  }, []);

  const handleAccept = () => {
    setCookie("cookieConsent", "accepted", {
      maxAge: 365 * 24 * 60 * 60,
      path: "/",
    });
    setShowBanner(false);
  };

  const handleDecline = () => {
    setCookie("cookieConsent", "declined", {
      maxAge: 365 * 24 * 60 * 60,
      path: "/",
    });
    setShowBanner(false);
  };

  // Prevent SSR issues by not rendering anything on the server
  if (!mounted) return null;

  return createPortal(
    <AnimatePresence>
      {showBanner && (
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 50 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
          className="fixed bottom-0 left-0 right-0 z-9999 bg-(--primary) p-4 text-(--secondary) border-t border-(--secondary)/10"
        >
          <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex flex-col gap-1">
              <p className="text-sm font-medium tracking-wide">
                Polityka prywatności i pliki cookie
              </p>
              <p className="text-xs opacity-70 tracking-tight max-w-2xl">
                Używamy plików cookie, aby zapewnić najlepszą jakość korzystania z naszej strony. 
                Klikając &quot;Akceptuję&quot;, zgadzasz się na ich przechowywanie na Twoim urządzeniu.
              </p>
            </div>
            <div className="flex items-center gap-3 shrink-0">
              <button
                onClick={handleDecline}
                className="px-6 py-2.5 border border-(--secondary)/20 text-(--secondary) font-bold text-[10px] tracking-widest uppercase hover:bg-(--secondary) hover:text-(--primary) transition-all cursor-pointer"
              >
                Odrzucam
              </button>
              <button
                onClick={handleAccept}
                className="px-8 py-2.5 bg-(--secondary) text-(--primary) font-bold text-[10px] tracking-widest uppercase hover:opacity-90 transition-all cursor-pointer"
              >
                Akceptuję
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body
  );
}
