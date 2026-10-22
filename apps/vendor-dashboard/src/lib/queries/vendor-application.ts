import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "../api";
import { s3UploadClient } from "../s3-upload-client";
import {
  buildApplyPayload,
  type VendorApplication,
  type VendorApplicationFormValues,
  type VendorBusinessFormValues,
} from "../vendor-application";
import { useAuthStore } from "@/stores/auth";

export const vendorApplicationKey = ["vendor-application"] as const;

/** The signed-in user's latest vendor application (null if they never applied). */
export function useVendorApplication(enabled: boolean) {
  return useQuery({
    queryKey: vendorApplicationKey,
    queryFn: async (): Promise<VendorApplication | null> => {
      const { data } = await api.get("/vendors/application");
      return data.data ?? null;
    },
    enabled,
    retry: false,
  });
}

function errorCode(err: unknown): string | undefined {
  const data = (err as { response?: { data?: { code?: string; error?: string } } })?.response
    ?.data;
  return data?.code ?? data?.error;
}

/**
 * Creates the applicant's account, or signs into an existing one with the same
 * email and password, so a customer can apply with the account they already have.
 */
async function signUpOrSignIn(values: VendorApplicationFormValues) {
  try {
    const { data } = await api.post("/auth/register", {
      email: values.email,
      password: values.password,
      first_name: values.firstName,
      last_name: values.lastName,
      phone: values.businessPhone.replace(/[ ()-]/g, ""),
    });
    return data.data.user;
  } catch (err) {
    if (errorCode(err) !== "EMAIL_EXISTS") throw err;
  }
  try {
    const { data } = await api.post("/auth/login", {
      email: values.email,
      password: values.password,
    });
    if (!data.data?.user) throw new Error("two_factor_required");
    return data.data.user;
  } catch {
    throw new ApplicationError(
      "This email already has a ServiceHubUAE account. Enter that account's password to apply with it, or sign in first.",
    );
  }
}

export class ApplicationError extends Error {}

/** Human-readable message for any failure in the application flow. */
export function applicationErrorMessage(err: unknown): string {
  if (err instanceof ApplicationError) return err.message;
  switch (errorCode(err)) {
    case "VENDOR_EXISTS":
      return "You already have an application in progress. We will email you once it is reviewed.";
    case "INVALID_DOCUMENT_KEY":
    case "INVALID_DOCUMENT_TYPE":
      return "We could not attach your trade licence. Please upload it again.";
  }
  const message = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
  return message ?? "Something went wrong. Please try again.";
}

/**
 * Account (when signed out) → licence upload → POST /vendors/apply.
 * `values` carries account fields only for signed-out visitors.
 */
export function useSubmitVendorApplication() {
  const queryClient = useQueryClient();
  const setUser = useAuthStore((s) => s.setUser);

  return useMutation({
    mutationFn: async ({
      values,
      licence,
      contactEmail,
    }: {
      values: VendorBusinessFormValues | VendorApplicationFormValues;
      licence: File;
      contactEmail?: string;
    }) => {
      let email = contactEmail;
      if ("password" in values) {
        const user = await signUpOrSignIn(values);
        setUser(user);
        email = user.email;
      }
      if (!email) throw new ApplicationError("Sign in again to continue your application.");

      const { uploadUrl, key } = await s3UploadClient.presign({
        assetType: "kyc_application_document",
        filename: licence.name,
        contentType: licence.type,
      });
      await s3UploadClient.putToS3(uploadUrl, licence);

      const { data } = await api.post("/vendors/apply", buildApplyPayload(values, email, key));
      return data.data as VendorApplication;
    },
    onSuccess: (application) => {
      queryClient.setQueryData(vendorApplicationKey, application);
    },
  });
}
