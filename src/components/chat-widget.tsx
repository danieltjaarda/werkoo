"use client";

import { useState } from "react";
import { ChatIcon, CloseIcon } from "@/components/icons";

export function ChatWidget() {
  const [open, setOpen] = useState(false);

  return (
    <div className="fixed bottom-5 right-5 z-40 flex flex-col items-end gap-3 sm:bottom-7 sm:right-7">
      {open ? (
        <div className="w-[290px] rounded-3xl border border-lijn bg-white p-5 shadow-[0_24px_60px_-20px_rgba(18,20,26,0.35)]">
          <p className="font-display text-[16px] font-bold text-ink">Even sparren?</p>
          <p className="mt-2 text-[14px] leading-relaxed text-ink-soft">
            We zijn er op werkdagen van 09:00 tot 17:30 en antwoorden meestal binnen een paar minuten.
          </p>
          <a
            href="mailto:hallo@werkoo.nl"
            className="mt-4 flex h-11 items-center justify-center rounded-2xl bg-ink font-display text-[14px] font-medium text-white transition hover:bg-black"
          >
            Stuur ons een bericht
          </a>
        </div>
      ) : null}

      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-expanded={open}
        aria-label={open ? "Chat sluiten" : "Chat openen"}
        className="flex h-14 w-14 items-center justify-center rounded-full bg-ink text-white shadow-[0_14px_30px_-10px_rgba(18,20,26,0.6)] transition hover:bg-brand-deep"
      >
        {open ? <CloseIcon className="h-6 w-6" /> : <ChatIcon className="h-6 w-6" />}
      </button>
    </div>
  );
}
