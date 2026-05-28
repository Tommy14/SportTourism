"use client";

type InquiryButtonProps = {
  href?: string;
  label?: string;
  className?: string;
};

export function InquiryButton({ href = "#contact", label = "Contact Us", className = "" }: InquiryButtonProps) {
  return (
    <a href={href} className={`pill-button inline-flex items-center justify-center ${className}`}>
      {label}
      <span className="ml-2 text-xs">→</span>
    </a>
  );
}
