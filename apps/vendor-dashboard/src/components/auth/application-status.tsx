"use client";

import { CheckCircle, Hourglass, WarningCircle } from "@phosphor-icons/react";
import { Button } from "@servicehubuae/ui";
import type { VendorApplication } from "@/lib/vendor-application";

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-AE", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

/**
 * What a signed-in user without vendor access sees instead of the sign-in card:
 * the state of their application, or a nudge to apply.
 */
export function ApplicationStatus({
  email,
  application,
  isLoading,
  onReapply,
  onOpenDashboard,
  onSignOut,
  signingOut,
}: {
  email: string;
  application: VendorApplication | null | undefined;
  isLoading: boolean;
  onReapply: () => void;
  onOpenDashboard: () => void;
  onSignOut: () => void;
  signingOut: boolean;
}) {
  const status = application?.status;
  const inReview = status === "pending" || status === "under_review";

  return (
    <div className="space-y-5">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-amber">
          Vendor application
        </p>
        <p className="mt-1 text-xs text-taupe">Signed in as {email}</p>
      </div>

      {isLoading ? (
        <div className="h-24 animate-pulse rounded-xl bg-pearl/40" />
      ) : inReview && application ? (
        <StatusBlock
          icon={<Hourglass className="h-6 w-6 text-amber" weight="bold" />}
          title="Application under review"
          body={`We received the application for ${application.name} on ${formatDate(application.created_at)}. Our team is checking your trade licence and details and will email you the outcome.`}
        />
      ) : status === "approved" ? (
        <StatusBlock
          icon={<CheckCircle className="h-6 w-6 text-green-600" weight="bold" />}
          title="Application approved"
          body={`${application?.name} is approved. Open the dashboard to add your services, staff and availability.`}
        >
          <Button className="mt-4 w-full" onClick={onOpenDashboard}>
            Open dashboard
          </Button>
        </StatusBlock>
      ) : status === "rejected" ? (
        <StatusBlock
          icon={<WarningCircle className="h-6 w-6 text-destructive" weight="bold" />}
          title="Application not approved"
          body={
            application?.rejection_reason
              ? `Reason: ${application.rejection_reason}`
              : "Your application was not approved."
          }
        >
          <Button variant="outline" className="mt-4 w-full" onClick={onReapply}>
            Update and apply again
          </Button>
        </StatusBlock>
      ) : status ? (
        <StatusBlock
          icon={<WarningCircle className="h-6 w-6 text-destructive" weight="bold" />}
          title="Vendor account unavailable"
          body="This vendor account is not active. Contact ServiceHubUAE support for help."
        />
      ) : (
        <StatusBlock
          icon={<WarningCircle className="h-6 w-6 text-amber" weight="bold" />}
          title="No vendor account yet"
          body="This account is not linked to a vendor. Fill in the application to start selling your services on ServiceHubUAE, or ask your store owner for a team invite."
        />
      )}

      <Button variant="ghost" className="w-full" onClick={onSignOut} disabled={signingOut}>
        {signingOut ? "Signing out..." : "Sign out"}
      </Button>
    </div>
  );
}

function StatusBlock({
  icon,
  title,
  body,
  children,
}: {
  icon: React.ReactNode;
  title: string;
  body: string;
  children?: React.ReactNode;
}) {
  return (
    <div className="rounded-xl border border-pearl/70 bg-linen p-4">
      <div className="flex items-start gap-3">
        <span className="mt-0.5 shrink-0">{icon}</span>
        <div className="min-w-0">
          <h3 className="font-semibold text-cacao">{title}</h3>
          <p className="mt-1 text-sm leading-6 text-taupe">{body}</p>
        </div>
      </div>
      {children}
    </div>
  );
}
