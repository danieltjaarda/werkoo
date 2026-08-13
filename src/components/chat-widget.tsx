"use client";

import { useState } from "react";
import { ChatIcon, CloseIcon } from "@/components/icons";

export function ChatWidget() {
  const [open, setOpen] = useState(false);

  return (
    <div className="fixed bottom-5 right-5 z-40 flex flex-col items-end gap-3 sm:bottom-7 sm:right-7">
      {open ? (
        <div className="kaart w-[290px] p-5 shadow-paneel">
          <p className="font-display text-h5 text-ink">Even sparren?</p>
          <p className="mt-2 text-basis text-ink-soft">
            We zijn er op werkdagen van 09:00 tot 17:30 en antwoorden meestal binnen een paar minuten.
          </p>
          <a
            href="mailto:hallo@werkoo.nl"
            className="mt-4 flex h-11 items-center justify-center rounded-2xl bg-ink font-display text-basis font-medium text-white transition hover:bg-brand-deep"
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
        // Merkblauw en niet ink: de knop zweeft ook over de donkere secties heen.
        className="flex h-14 w-14 items-center justify-center rounded-full bg-brand-deep text-white shadow-zwevend transition hover:bg-brand-dark"
      >
        {open ? <CloseIcon className="h-6 w-6" /> : <ChatIcon className="h-6 w-6" />}
      </button>
    </div>
  );
}
