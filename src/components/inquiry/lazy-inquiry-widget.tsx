"use client";

import dynamic from "next/dynamic";

const InquiryWidget = dynamic(
  () =>
    import("@/components/inquiry/inquiry-widget").then((mod) => ({
      default: mod.InquiryWidget,
    })),
  { ssr: false, loading: () => null },
);

export function LazyInquiryWidget() {
  return <InquiryWidget />;
}
