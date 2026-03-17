"use client";

import Script from "next/script";
import { useEffect, useId, useRef } from "react";

import { TURNSTILE_TEST_SITE_KEY } from "@/lib/hireflow/config";

declare global {
  interface Window {
    turnstile?: {
      render: (element: HTMLElement, options: Record<string, unknown>) => string;
      remove: (widgetId: string) => void;
      reset: (widgetId?: string) => void;
    };
  }
}

type TurnstileWidgetProps = {
  action: string;
  onTokenChange: (token: string | null) => void;
  resetKey?: string | number;
};

const SCRIPT_ID = "cloudflare-turnstile";

export function TurnstileWidget({ action, onTokenChange, resetKey }: TurnstileWidgetProps) {
  const containerId = useId().replace(/:/g, "-");
  const widgetIdRef = useRef<string | null>(null);
  const renderedRef = useRef(false);
  const onTokenChangeRef = useRef(onTokenChange);

  useEffect(() => {
    onTokenChangeRef.current = onTokenChange;
  }, [onTokenChange]);

  useEffect(() => {
    const siteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY || TURNSTILE_TEST_SITE_KEY;

    function renderWidget() {
      if (renderedRef.current || !window.turnstile) {
        return;
      }

      const target = document.getElementById(containerId);
      if (!target) {
        return;
      }

      widgetIdRef.current = window.turnstile.render(target, {
        sitekey: siteKey,
        action,
        callback: (token: string) => onTokenChangeRef.current(token),
        "expired-callback": () => onTokenChangeRef.current(null),
        "timeout-callback": () => onTokenChangeRef.current(null),
        "error-callback": () => onTokenChangeRef.current(null),
      });
      renderedRef.current = true;
    }

    renderWidget();

    const interval = window.setInterval(renderWidget, 200);

    return () => {
      window.clearInterval(interval);
      if (widgetIdRef.current && window.turnstile) {
        window.turnstile.remove(widgetIdRef.current);
      }
      widgetIdRef.current = null;
      renderedRef.current = false;
    };
  }, [action, containerId]);

  useEffect(() => {
    onTokenChangeRef.current(null);
    if (widgetIdRef.current && window.turnstile) {
      window.turnstile.remove(widgetIdRef.current);
      widgetIdRef.current = null;
      renderedRef.current = false;
    }
  }, [resetKey]);

  return (
    <>
      <Script id={SCRIPT_ID} src="https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit" strategy="afterInteractive" />
      <div className="min-h-[68px] rounded-2xl border border-[#E1E4EC] bg-[#FBFCFF] px-4 py-3">
        <div id={containerId} />
      </div>
    </>
  );
}
