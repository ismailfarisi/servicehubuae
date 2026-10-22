"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { useAuthStore } from "@/stores/auth";
import { useUpdateProfile, useChangePassword } from "@/lib/queries/account";
import { Eyebrow } from "@/components/ui/maison-primitives";

const INPUT_CLASS =
  "w-full rounded-lg border border-nl-cacao/15 bg-nl-linen px-3.5 py-2.5 text-sm text-nl-cacao placeholder:text-nl-russet/70 outline-none transition-colors focus:border-nl-amber focus:ring-2 focus:ring-nl-amber/20";

const PRIMARY_BUTTON =
  "inline-flex items-center justify-center gap-2 rounded-lg bg-nl-amber px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-nl-amber/90 transition-colors disabled:opacity-50";

export default function SettingsPage() {
  const t = useTranslations("account");
  const tCommon = useTranslations("common");
  const { user } = useAuthStore();
  const updateProfile = useUpdateProfile();
  const changePassword = useChangePassword();

  const [profile, setProfile] = useState({
    first_name: user?.first_name || "",
    last_name: user?.last_name || "",
    email: user?.email || "",
  });

  const [passwords, setPasswords] = useState({
    current_password: "",
    new_password: "",
    confirm_password: "",
  });

  const [profileMsg, setProfileMsg] = useState("");
  const [passwordMsg, setPasswordMsg] = useState<{
    text: string;
    ok: boolean;
  } | null>(null);

  return (
    <div className="space-y-6">
      <div>
        <Eyebrow>Settings</Eyebrow>
        <h1 className="mt-1 font-display text-2xl font-bold tracking-tight leading-tight text-nl-cacao">
          {t("settings")}
        </h1>
      </div>

      {/* Profile */}
      <section className="rounded-2xl border border-nl-cacao/10 bg-nl-linen p-5 md:p-6 shadow-sm">
        <h2 className="mb-4 font-display text-lg font-semibold text-nl-cacao">{t("profile")}</h2>
        <form
          onSubmit={async (e) => {
            e.preventDefault();
            await updateProfile.mutateAsync(profile);
            setProfileMsg(t("profileSaved"));
          }}
          className="space-y-3 md:max-w-md"
        >
          <input
            type="text"
            value={profile.first_name}
            onChange={(e) =>
              setProfile({ ...profile, first_name: e.target.value })
            }
            className={INPUT_CLASS}
            placeholder={t("firstName")}
          />
          <input
            type="text"
            value={profile.last_name}
            onChange={(e) =>
              setProfile({ ...profile, last_name: e.target.value })
            }
            className={INPUT_CLASS}
            placeholder={t("lastName")}
          />
          <input
            type="email"
            value={profile.email}
            onChange={(e) => setProfile({ ...profile, email: e.target.value })}
            className={INPUT_CLASS}
            placeholder={t("emailAddress")}
          />
          {profileMsg && (
            <p className="text-sm text-emerald-700">
              {profileMsg}
            </p>
          )}
          <button
            type="submit"
            disabled={updateProfile.isPending}
            className={`${PRIMARY_BUTTON} w-full sm:w-auto`}
          >
            {tCommon("save")}
          </button>
        </form>
      </section>

      {/* Password */}
      <section className="rounded-2xl border border-nl-cacao/10 bg-nl-linen p-5 md:p-6 shadow-sm">
        <h2 className="mb-4 font-display text-lg font-semibold text-nl-cacao">{t("password")}</h2>
        <form
          onSubmit={async (e) => {
            e.preventDefault();
            if (passwords.new_password !== passwords.confirm_password) {
              setPasswordMsg({ text: t("passwordMismatch"), ok: false });
              return;
            }
            try {
              await changePassword.mutateAsync({
                current_password: passwords.current_password,
                new_password: passwords.new_password,
              });
              setPasswordMsg({ text: t("passwordChanged"), ok: true });
              setPasswords({
                current_password: "",
                new_password: "",
                confirm_password: "",
              });
            } catch {
              setPasswordMsg({ text: t("passwordChangeFailed"), ok: false });
            }
          }}
          className="space-y-3 md:max-w-md"
        >
          <input
            type="password"
            value={passwords.current_password}
            onChange={(e) =>
              setPasswords({ ...passwords, current_password: e.target.value })
            }
            placeholder={t("currentPassword")}
            className={INPUT_CLASS}
          />
          <input
            type="password"
            value={passwords.new_password}
            onChange={(e) =>
              setPasswords({ ...passwords, new_password: e.target.value })
            }
            placeholder={t("newPassword")}
            className={INPUT_CLASS}
          />
          <input
            type="password"
            value={passwords.confirm_password}
            onChange={(e) =>
              setPasswords({ ...passwords, confirm_password: e.target.value })
            }
            placeholder={t("confirmNewPassword")}
            className={INPUT_CLASS}
          />
          {passwordMsg && (
            <p
              className={`text-sm ${passwordMsg.ok ? "text-emerald-700" : "text-red-600"}`}
            >
              {passwordMsg.text}
            </p>
          )}
          <button
            type="submit"
            disabled={changePassword.isPending}
            className={`${PRIMARY_BUTTON} w-full sm:w-auto`}
          >
            {tCommon("save")}
          </button>
        </form>
      </section>
    </div>
  );
}
