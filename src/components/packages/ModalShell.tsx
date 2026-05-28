"use client";

import { useEffect, useId, useRef } from "react";

type ModalShellProps = {
  title: string;
  onClose: () => void;
  children: React.ReactNode;
};

export function ModalShell({ title, onClose, children }: ModalShellProps) {
  const titleId = useId();
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, []);

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [onClose]);

  useEffect(() => {
    panelRef.current?.focus();
  }, []);

  return (
    <div className="fixed inset-0 z-[100] flex items-end justify-center p-0 sm:items-center sm:p-4">
      <button
        type="button"
        aria-label="Close dialog"
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={onClose}
      />
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        tabIndex={-1}
        className="panel-card relative z-[1] flex max-h-[92vh] w-full max-w-3xl flex-col overflow-hidden shadow-2xl sm:max-h-[90vh] sm:rounded-2xl"
      >
        <header className="flex shrink-0 items-start justify-between gap-3 border-b border-white/10 px-5 py-4 md:px-6">
          <h2 id={titleId} className="text-lg font-bold md:text-xl">
            {title}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="ghost-button shrink-0 px-3 py-1 text-xs"
            aria-label="Close"
          >
            Close
          </button>
        </header>
        <div className="overflow-y-auto px-5 py-4 md:px-6">{children}</div>
      </div>
    </div>
  );
}
