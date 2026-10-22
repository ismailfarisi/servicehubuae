"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  ChartLineUp,
  CheckCircle,
  Package,
  Sparkle,
  Storefront,
} from "@phosphor-icons/react";
import {
  Button,
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  Input,
} from "@servicehubuae/ui";
import { ApplicationStatus } from "@/components/auth/application-status";
import { VendorApplicationForm } from "@/components/auth/vendor-application-form";
import { api } from "@/lib/api";
import { getMembershipsFromToken, hasAccessTokenCookie } from "@/lib/auth";
import { useLogin, useLogout, useMe } from "@/lib/queries/auth";
import { useVendorApplication } from "@/lib/queries/vendor-application";
import { useAuthStore } from "@/stores/auth";

const loginSchema = z.object({
  email: z.string().email("Please enter a valid email"),
  password: z.string().min(1, "Password is required"),
});

type LoginFormValues = z.infer<typeof loginSchema>;

const growthTiles = [
  {
    title: "Service listings",
    description:
      "List your services with prices, durations, photos and the areas you cover.",
    icon: Package,
  },
  {
    title: "Bookings in one place",
    description:
      "Manage your calendar, staff, availability and bookings without switching tools.",
    icon: ChartLineUp,
  },
  {
    title: "Grow your reach",
    description:
      "Connect storefront updates, reels and integrations as your business grows.",
    icon: Sparkle,
  },
];

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  );
}

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const returnTo = searchParams.get("returnTo") || "/";
  const { mutate: login, isPending, error } = useLogin();
  const { mutate: logout, isPending: signingOut } = useLogout();
  const user = useAuthStore((s) => s.user);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const [reapplying, setReapplying] = useState(false);

  // Restore an existing session (e.g. an applicant coming back to check on
  // their application). Read after mount: cookies don't exist during SSR.
  const [hasSession, setHasSession] = useState(false);
  useEffect(() => setHasSession(hasAccessTokenCookie()), []);
  const { isPending: meLoading } = useMe(hasSession);
  // Hold the signed-out UI back until we know whether the cookie is still valid.
  const checkingSession = hasSession && !isAuthenticated && meLoading;

  // Only vendor members (and admins) get into the dashboard. Everyone else who
  // is signed in is an applicant: redirecting them would bounce straight back
  // here from the dashboard layout.
  const canEnterDashboard =
    isAuthenticated &&
    (getMembershipsFromToken().length > 0 ||
      user?.role === "admin" ||
      user?.role === "super_admin");
  const isApplicant = isAuthenticated && !canEnterDashboard;
  const { data: application, isLoading: applicationLoading } =
    useVendorApplication(isApplicant);
  const inReview =
    application?.status === "pending" || application?.status === "under_review";
  const showApplicantForm =
    isApplicant &&
    !applicationLoading &&
    (application === null || (application?.status === "rejected" && reapplying));

  useEffect(() => {
    if (canEnterDashboard) {
      router.replace(returnTo);
    }
  }, [canEnterDashboard, returnTo, router]);

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  function onSubmit(values: LoginFormValues) {
    // The redirect effect above takes vendor members to the dashboard.
    login(values);
  }

  async function openDashboard() {
    // Approval bumps the token version; refresh so the new token carries the membership.
    await api.post("/auth/refresh", {}).catch(() => undefined);
    router.replace(returnTo);
  }

  return (
    <main className="relative min-h-screen overflow-hidden bg-cacao text-linen">
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-caramel/80 to-transparent" />
      <div className="absolute inset-0 bg-[linear-gradient(120deg,rgba(37,99,235,0.32)_0%,rgba(15,23,42,0)_38%,rgba(3,7,18,0.4)_100%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,rgba(96,165,250,0.14),transparent_42%)]" />
      <div className="relative mx-auto grid min-h-screen w-full max-w-7xl items-center gap-8 px-4 py-6 sm:px-6 lg:grid-cols-[minmax(0,1fr)_430px] lg:px-8">
        <section className="flex min-h-[calc(100vh-3rem)] flex-col justify-between gap-8 py-4 lg:py-8">
          <div className="space-y-8">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-amber/50 bg-espresso/70 text-sm font-semibold tracking-[0.22em] text-amber">
                  MP
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.22em] text-caramel">
                    ServiceHubUAE partners
                  </p>
                  <p className="text-sm text-pearl/75">Vendor dashboard access</p>
                </div>
              </div>
              <div className="flex items-center gap-2 border border-pearl/15 bg-linen/5 px-3 py-2 text-xs text-pearl/80">
                <Storefront className="h-4 w-4 text-amber" weight="thin" />
                Services marketplace
              </div>
            </div>

            <div className="max-w-4xl space-y-5">
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-amber">
                Become a vendor
              </p>
              <h1 className="max-w-3xl text-4xl font-semibold leading-[0.98] text-linen sm:text-5xl lg:text-7xl">
                Grow your service business with a dashboard built for bookings.
              </h1>
              <p className="max-w-2xl text-base leading-7 text-pearl/82 sm:text-lg">
                Apply with your business details and trade licence. The
                ServiceHubUAE team reviews every application before your services go
                live.
              </p>
            </div>

            <div className="grid max-w-4xl gap-3 md:grid-cols-3">
              {growthTiles.map((tile) => {
                const Icon = tile.icon;
                return (
                  <div
                    key={tile.title}
                    className="border border-pearl/15 bg-linen/[0.04] p-4 backdrop-blur-sm"
                  >
                    <Icon className="mb-4 h-6 w-6 text-amber" weight="thin" />
                    <h2 className="text-sm font-semibold text-linen">
                      {tile.title}
                    </h2>
                    <p className="mt-2 text-sm leading-6 text-pearl/70">
                      {tile.description}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="max-w-4xl border-t border-pearl/15 pt-5">
            <div className="mb-5 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-amber">
                  New vendor
                </p>
                <h2 className="mt-1 text-2xl font-semibold text-linen">
                  Apply to sell on ServiceHubUAE
                </h2>
              </div>
              <p className="max-w-xs text-sm leading-6 text-pearl/70">
                Creates your vendor account. You can sign in to check your
                application while we review it.
              </p>
            </div>

            {checkingSession ? null : isApplicant && inReview ? (
              <div className="border border-amber/40 bg-linen/[0.06] p-4">
                <div className="flex items-start gap-3">
                  <CheckCircle className="mt-0.5 h-6 w-6 text-amber" weight="thin" />
                  <div>
                    <h3 className="font-semibold text-linen">Application received</h3>
                    <p className="mt-1 text-sm leading-6 text-pearl/75">
                      Thanks for applying with {application?.name}. We will email{" "}
                      {user?.email} once our team has reviewed your trade licence
                      and details.
                    </p>
                  </div>
                </div>
              </div>
            ) : !isApplicant ? (
              <VendorApplicationForm />
            ) : showApplicantForm && user ? (
              <VendorApplicationForm
                signedInEmail={user.email}
                previous={application?.status === "rejected" ? application : null}
              />
            ) : null}
          </div>
        </section>

        <aside className="relative z-10 flex items-center py-6 lg:min-h-screen lg:justify-center">
          <div className="mx-auto w-full max-w-md rounded-2xl border border-pearl/70 bg-linen/95 p-5 text-cacao shadow-[0_28px_90px_rgba(3,7,18,0.4)] backdrop-blur-sm sm:p-7">
          <div className="mb-7">
            <div className="mb-5 flex items-center justify-between gap-4 border-b border-pearl/70 pb-5">
              <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-amber text-sm font-semibold tracking-[0.22em] text-linen shadow-[0_14px_40px_rgba(37,99,235,0.35)]">
                MP
              </div>
              <div className="text-right">
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-amber">
                  {isApplicant ? "Vendor applicant" : "Returning vendor"}
                </p>
                <p className="mt-1 text-xs text-taupe">Private workspace</p>
              </div>
            </div>
            <h2 className="text-3xl font-semibold text-cacao">
              Vendor Dashboard
            </h2>
            {!isApplicant && (
              <p className="mt-3 text-sm leading-6 text-taupe">
                Sign in to manage your ServiceHubUAE store. Redirected vendors return
                to the requested dashboard page after authentication.
              </p>
            )}
          </div>

          {checkingSession ? (
            <div className="h-40 animate-pulse rounded-xl bg-pearl/40" />
          ) : isApplicant && user ? (
            <ApplicationStatus
              email={user.email}
              application={application}
              isLoading={applicationLoading}
              onReapply={() => setReapplying(true)}
              onOpenDashboard={openDashboard}
              onSignOut={() => logout()}
              signingOut={signingOut}
            />
          ) : (
          <>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input
                        type="email"
                        placeholder="you@example.com"
                        autoComplete="email"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Password</FormLabel>
                    <FormControl>
                      <Input
                        type="password"
                        placeholder="Enter your password"
                        autoComplete="current-password"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {error && (
                <p className="border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
                  {(error as any)?.response?.data?.message ??
                    "Invalid email or password. Please try again."}
                </p>
              )}

              <Button type="submit" className="h-11 w-full" disabled={isPending}>
                {isPending ? "Signing in..." : "Sign in"}
              </Button>
            </form>
          </Form>

          <div className="mt-6 grid gap-3 border-t border-pearl/70 pt-5 text-xs leading-5 text-taupe">
            <div className="flex items-start gap-2">
              <CheckCircle className="mt-0.5 h-4 w-4 shrink-0 text-amber" weight="thin" />
              <span>Redirected vendors return to the requested page after sign-in.</span>
            </div>
            <div className="flex items-start gap-2">
              <CheckCircle className="mt-0.5 h-4 w-4 shrink-0 text-amber" weight="thin" />
              <span>
                Need access? Ask your store owner to send a team invite from the
                dashboard.
              </span>
            </div>
          </div>
          </>
          )}
        </div>
        </aside>
      </div>
    </main>
  );
}
