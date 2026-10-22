import { useTranslations } from "next-intl";
import Link from "next/link";

export default function NotFound() {
  const t = useTranslations("common");

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4 px-4 text-center">
      <h1 className="font-display text-7xl font-bold tracking-tight text-nl-amber">404</h1>
      <p className="text-xl text-nl-russet">{t("error")}</p>
      <Link
        href="/"
        className="mt-2 inline-flex min-h-[44px] items-center justify-center gap-2 rounded-lg bg-nl-amber px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-nl-amber/90 transition-colors"
      >
        {t("home")}
      </Link>
    </div>
  );
}
