"use client";

import { Button } from "@mypickuae/ui";
import { useTranslations } from "next-intl";
import { useConsent } from "@/lib/consent/consent-state";

export function ConsentBanner() {
  const { decision, setDecision } = useConsent();
  const t = useTranslations("consent");

  if (decision !== null) return null;

  return (
    <div
      className="fixed inset-x-0 bottom-0 z-50 border-t border-nl-cacao/10 bg-nl-linen/95 p-4 shadow-[0_-8px_30px_hsl(var(--nl-cacao)/0.08)] backdrop-blur-sm"
      role="dialog"
      aria-labelledby="consent-banner-title"
    >
      <div className="mx-auto flex max-w-6xl flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex-1 space-y-1">
          <h2
            id="consent-banner-title"
            className="font-display font-semibold text-sm text-nl-cacao"
          >
            {t("title")}
          </h2>
          <p className="text-nl-russet text-sm">{t("description")}</p>
        </div>
        <div className="flex gap-2 sm:shrink-0">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setDecision("rejected")}
          >
            {t("reject")}
          </Button>
          <Button
            variant="default"
            size="sm"
            onClick={() => setDecision("accepted")}
          >
            {t("accept")}
          </Button>
        </div>
      </div>
    </div>
  );
}
