"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowRight, FileArrowUp } from "@phosphor-icons/react";
import {
  Button,
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  Input,
  Label,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Textarea,
} from "@mypickuae/ui";
import { api } from "@/lib/api";
import {
  applicationErrorMessage,
  useSubmitVendorApplication,
} from "@/lib/queries/vendor-application";
import {
  applicationDefaults,
  EMIRATES,
  LICENCE_CONTENT_TYPES,
  type VendorApplication,
  type VendorApplicationFormValues,
  validateLicenceFile,
  vendorApplicationSchema,
  vendorReapplicationSchema,
} from "@/lib/vendor-application";

const inputClass = "border-pearl/25 bg-linen/95 text-cacao";

interface CategoryOption {
  slug: string;
  name: string;
}

/**
 * Vendor self-registration. Signed-out visitors also create their account here;
 * signed-in users without a vendor (e.g. re-applying after a rejection) only
 * fill in the business details, so pass `signedInEmail` for them.
 */
export function VendorApplicationForm({
  signedInEmail,
  previous,
}: {
  signedInEmail?: string;
  /** A rejected application to start the re-application from. */
  previous?: VendorApplication | null;
}) {
  const signedIn = Boolean(signedInEmail);
  const [categories, setCategories] = useState<CategoryOption[]>([]);
  const [licence, setLicence] = useState<File | null>(null);
  const [licenceError, setLicenceError] = useState<string | null>(null);
  const submit = useSubmitVendorApplication();

  useEffect(() => {
    let cancelled = false;
    api
      .get("/categories/tree", { params: { depth: 1 } })
      .then((res) => {
        if (!cancelled) setCategories(res.data.data ?? []);
      })
      .catch(() => {
        if (!cancelled) setCategories([]);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const form = useForm<VendorApplicationFormValues>({
    // Signed-in applicants have no account fields to validate.
    resolver: zodResolver(
      signedIn ? (vendorReapplicationSchema as typeof vendorApplicationSchema) : vendorApplicationSchema,
    ),
    defaultValues: applicationDefaults(previous),
  });

  function onSubmit(values: VendorApplicationFormValues) {
    const fileError = validateLicenceFile(licence);
    setLicenceError(fileError);
    if (fileError || !licence) return;
    submit.mutate({
      values: signedIn ? businessOnly(values) : values,
      licence,
      contactEmail: signedInEmail,
    });
  }

  function onInvalid() {
    setLicenceError(validateLicenceFile(licence));
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit, onInvalid)}
        className="grid gap-4 text-linen"
        noValidate
      >
        {!signedIn && (
          <>
            <div className="grid gap-4 sm:grid-cols-2">
              <TextField form={form} name="firstName" label="First name" autoComplete="given-name" />
              <TextField form={form} name="lastName" label="Last name" autoComplete="family-name" />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <TextField
                form={form}
                name="email"
                label="Work email"
                type="email"
                placeholder="owner@yourbusiness.ae"
                autoComplete="email"
              />
              <TextField
                form={form}
                name="password"
                label="Password"
                type="password"
                placeholder="At least 8 characters"
                autoComplete="new-password"
              />
            </div>
          </>
        )}

        <div className="grid gap-4 sm:grid-cols-2">
          <TextField
            form={form}
            name="businessName"
            label="Business name"
            placeholder="Sparkle Home Services"
            autoComplete="organization"
          />
          <FormField
            control={form.control}
            name="category"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Main service category</FormLabel>
                <Select value={field.value} onValueChange={field.onChange}>
                  <FormControl>
                    <SelectTrigger className={inputClass}>
                      <SelectValue placeholder="Choose a category" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {categories.map((c) => (
                      <SelectItem key={c.slug} value={c.slug}>
                        {c.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <FormField
            control={form.control}
            name="emirate"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Emirate</FormLabel>
                <Select value={field.value} onValueChange={field.onChange}>
                  <FormControl>
                    <SelectTrigger className={inputClass}>
                      <SelectValue placeholder="Choose an emirate" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {EMIRATES.map((e) => (
                      <SelectItem key={e} value={e}>
                        {e}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          <TextField
            form={form}
            name="businessPhone"
            label="Business phone"
            type="tel"
            placeholder="+971 50 123 4567"
            autoComplete="tel"
          />
        </div>

        <TextField
          form={form}
          name="address"
          label="Business address"
          placeholder="Office 12, Al Quoz Industrial 3"
          autoComplete="street-address"
        />

        <div className="grid gap-4 sm:grid-cols-2">
          <TextField
            form={form}
            name="tradeLicenseNumber"
            label="Trade licence number"
            placeholder="CN-1234567"
            autoComplete="off"
          />
          <div className="space-y-2">
            <Label htmlFor="trade-licence-file" className={licenceError ? "text-destructive" : undefined}>
              Trade licence copy
            </Label>
            <label
              htmlFor="trade-licence-file"
              className="flex h-10 cursor-pointer items-center gap-2 rounded-md border border-pearl/25 bg-linen/95 px-3 text-sm text-cacao"
            >
              <FileArrowUp className="h-4 w-4 shrink-0 text-amber" weight="bold" />
              <span className="truncate">{licence ? licence.name : "PDF, JPG or PNG, up to 10 MB"}</span>
            </label>
            <input
              id="trade-licence-file"
              type="file"
              accept={LICENCE_CONTENT_TYPES.join(",")}
              className="sr-only"
              onChange={(e) => {
                const file = e.target.files?.[0] ?? null;
                setLicence(file);
                setLicenceError(file ? validateLicenceFile(file) : null);
              }}
            />
            {licenceError && <p className="text-sm font-medium text-destructive">{licenceError}</p>}
          </div>
        </div>

        <TextField
          form={form}
          name="website"
          label="Website or Instagram (optional)"
          placeholder="https://yourbusiness.ae or @yourbusiness"
          autoComplete="url"
        />

        <FormField
          control={form.control}
          name="message"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Tell us about your services (optional)</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="The services you offer, the areas you cover and your team size."
                  className={`min-h-24 resize-none ${inputClass}`}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {submit.error && (
          <p className="rounded-md border border-destructive/40 bg-destructive/15 px-3 py-2 text-sm text-linen">
            {applicationErrorMessage(submit.error)}
          </p>
        )}

        <Button type="submit" className="h-11 w-full" disabled={submit.isPending}>
          {submit.isPending ? "Submitting application..." : "Submit application"}
          {!submit.isPending && <ArrowRight className="h-4 w-4" weight="bold" />}
        </Button>
        {!signedIn && (
          <p className="text-xs leading-5 text-pearl/70">
            Already a MyPickUAE customer? Use the same email and password. Bank details for
            payouts are added in Settings after approval.
          </p>
        )}
      </form>
    </Form>
  );
}

function businessOnly(values: VendorApplicationFormValues) {
  const { firstName, lastName, email, password, ...business } = values;
  return business;
}

function TextField({
  form,
  name,
  label,
  type = "text",
  placeholder,
  autoComplete,
}: {
  form: ReturnType<typeof useForm<VendorApplicationFormValues>>;
  name: Exclude<keyof VendorApplicationFormValues, "emirate" | "category">;
  label: string;
  type?: string;
  placeholder?: string;
  autoComplete?: string;
}) {
  return (
    <FormField
      control={form.control}
      name={name}
      render={({ field }) => (
        <FormItem>
          <FormLabel>{label}</FormLabel>
          <FormControl>
            <Input
              type={type}
              placeholder={placeholder}
              autoComplete={autoComplete}
              className={inputClass}
              {...field}
            />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}
