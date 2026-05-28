"use client";

import { InquiryButton } from "../ui/InquiryButton";

export function FloatingInquiry() {
  return (
    <div className="fixed bottom-5 right-4 z-50 md:right-6">
      <InquiryButton className="shadow-2xl shadow-black/50" />
    </div>
  );
}
