"use client";

import { ArrowLeft } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { useRouter } from "next/navigation";

interface Props {
  active: "for_you" | "latest" | "following";
  onChange: (tab: "for_you" | "latest" | "following") => void;
}

export function FeedTabSwitcher({ active, onChange }: Props) {
  const router = useRouter();
  const locale = useLocale();
  // Named tCommon, not t — `t` is the tab in the map below.
  const tCommon = useTranslations("common");
  const tabs = [
    { id: "for_you" as const, label: tCommon("forYou") },
    { id: "latest" as const, label: tCommon("latest") },
    { id: "following" as const, label: tCommon("following") },
  ];

  // The site header is hidden on /reels — this is the only way back out.
  function exitFeed() {
    if (window.history.length > 1) {
      router.back();
    } else {
      router.push(`/${locale}`);
    }
  }

  return (
    <div className="fixed top-0 inset-x-0 z-30 bg-nl-espresso/40 backdrop-blur flex justify-center items-center gap-2 py-2.5 text-sm text-white">
      <button
        type="button"
        onClick={exitFeed}
        aria-label={tCommon("back")}
        className="absolute start-1 top-1/2 -translate-y-1/2 rounded-full p-3 transition-colors hover:bg-white/10 rtl:rotate-180"
      >
        <ArrowLeft className="h-5 w-5" />
      </button>
      {tabs.map((t) => (
        <button
          key={t.id}
          type="button"
          onClick={() => onChange(t.id)}
          className={`rounded-full px-3.5 py-1.5 transition-colors ${
            active === t.id ? "bg-white/20 font-semibold" : "font-medium opacity-75 hover:opacity-100"
          }`}
        >
          {t.label}
        </button>
      ))}
    </div>
  );
}
