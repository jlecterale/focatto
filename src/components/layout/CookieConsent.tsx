"use client";

import { useState, useEffect } from "react";
import { Cookie, X } from "@phosphor-icons/react";
import { Button } from "@/components/ui/Button";

export function CookieConsent() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem("cookie-consent");
    if (!consent) {
      // Small delay for better UX flow
      const timer = setTimeout(() => setVisible(true), 1500);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem("cookie-consent", "accepted");
    setVisible(false);
  };

  const handleDecline = () => {
    localStorage.setItem("cookie-consent", "declined");
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div className="fixed bottom-22 md:bottom-6 left-4 right-4 md:left-auto md:right-6 md:max-w-md z-50 animate-slide-up">
      <div className="glass-strong rounded-2xl p-5 shadow-glass border border-white/10 relative overflow-hidden">
        {/* Glow decoration */}
        <div className="absolute top-0 right-0 w-24 h-24 bg-accent/10 rounded-full filter blur-xl pointer-events-none" />
        
        <div className="flex gap-4">
          <div className="w-10 h-10 rounded-xl bg-accent/15 flex items-center justify-center text-accent flex-shrink-0">
            <Cookie size={22} weight="fill" />
          </div>
          
          <div className="space-y-3">
            <div className="flex items-start justify-between">
              <h4 className="font-heading text-sm font-semibold text-white">Nós respeitamos sua privacidade</h4>
              <button 
                onClick={handleDecline} 
                className="text-surface-400 hover:text-white transition-colors"
                aria-label="Fechar"
              >
                <X size={16} />
              </button>
            </div>
            <p className="text-xs text-surface-300 leading-relaxed">
              Utilizamos cookies para melhorar sua experiência de navegação, oferecer anúncios personalizados e analisar nosso tráfego. Ao clicar em &quot;Aceitar todos&quot;, você concorda com o uso de cookies. Leia nossa{" "}
              <a href="/cookies" className="text-accent underline hover:text-accent-light transition-colors">
                Política de Cookies
              </a>.
            </p>
            <div className="flex items-center gap-2 pt-1">
              <button 
                onClick={handleDecline}
                className="text-xs text-surface-300 hover:text-white px-3 py-1.5 rounded-lg hover:bg-white/5 transition-all font-medium"
              >
                Recusar
              </button>
              <Button onClick={handleAccept} size="sm" variant="primary" className="w-full text-xs">
                Aceitar todos
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
