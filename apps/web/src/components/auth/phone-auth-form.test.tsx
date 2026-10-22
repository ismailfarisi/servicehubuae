import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { NextIntlClientProvider } from "next-intl";
import { beforeEach, describe, expect, test, vi } from "vitest";
import messages from "../../messages/en.json";
import { PhoneAuthForm } from "./phone-auth-form";

const startPhoneAuthMock = vi.fn();
const verifyPhoneAuthMock = vi.fn();
const registerPhoneAuthMock = vi.fn();
vi.mock("@/lib/queries/auth", () => ({
  useStartPhoneAuth: () => ({
    mutateAsync: startPhoneAuthMock,
    isPending: false,
  }),
  useVerifyPhoneAuth: () => ({
    mutateAsync: verifyPhoneAuthMock,
    isPending: false,
  }),
  useRegisterPhoneAuth: () => ({
    mutateAsync: registerPhoneAuthMock,
    isPending: false,
  }),
}));

function renderForm() {
  const client = new QueryClient();
  return render(
    <NextIntlClientProvider locale="en" messages={messages}>
      <QueryClientProvider client={client}>
        <PhoneAuthForm onAuthenticated={() => {}} />
      </QueryClientProvider>
    </NextIntlClientProvider>,
  );
}

describe("PhoneAuthForm", () => {
  beforeEach(() => {
    startPhoneAuthMock.mockReset();
    verifyPhoneAuthMock.mockReset();
    registerPhoneAuthMock.mockReset();
    startPhoneAuthMock.mockResolvedValue({ phone: "+971501234567" });
  });

  test("renders phone-first auth form", () => {
    renderForm();

    expect(screen.getByLabelText(/phone number/i)).toBeInTheDocument();
    expect(screen.getByText("+971")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /send code/i })).toBeInTheDocument();
  });

  test("submits UAE phone number with fixed country code ", async () => {
    renderForm();

    fireEvent.change(screen.getByLabelText(/phone number/i), {
      target: { value: "0501234567" },
    });
    fireEvent.click(screen.getByRole("button", { name: /send code/i }));

    await waitFor(() => expect(startPhoneAuthMock).toHaveBeenCalledWith("+971501234567"));
    expect(await screen.findByLabelText(/verification code/i)).toBeInTheDocument();
  });

  test("shows the error when sending the code fails", async () => {
    startPhoneAuthMock.mockRejectedValue({
      response: { data: { message: "Invalid phone number" } },
    });
    renderForm();

    fireEvent.change(screen.getByLabelText(/phone number/i), {
      target: { value: "0501234567" },
    });
    fireEvent.click(screen.getByRole("button", { name: /send code/i }));

    expect(await screen.findByText("Invalid phone number")).toBeInTheDocument();
    expect(screen.queryByLabelText(/verification code/i)).not.toBeInTheDocument();
  });

  test("collects email in the registration step and submits it", async () => {
    verifyPhoneAuthMock.mockResolvedValue({
      requires_registration: true,
      registration_token: "reg-token-1",
      phone: "+971501234567",
    });
    registerPhoneAuthMock.mockResolvedValue({});
    renderForm();

    // Step 1: phone
    fireEvent.change(screen.getByLabelText(/phone number/i), {
      target: { value: "0501234567" },
    });
    fireEvent.click(screen.getByRole("button", { name: /send code/i }));

    // Step 2: verification code
    const codeInput = await screen.findByLabelText(/verification code/i);
    fireEvent.change(codeInput, { target: { value: "123456" } });
    fireEvent.click(screen.getByRole("button", { name: /verify code/i }));

    // Step 3: registration — name + email
    const emailInput = await screen.findByLabelText(/email/i);
    fireEvent.change(screen.getByLabelText(/first name/i), {
      target: { value: "Aisha" },
    });
    fireEvent.change(screen.getByLabelText(/last name/i), {
      target: { value: "Khan" },
    });
    fireEvent.change(emailInput, { target: { value: "aisha@example.com" } });
    fireEvent.click(screen.getByRole("button", { name: /create account/i }));

    await waitFor(() =>
      expect(registerPhoneAuthMock).toHaveBeenCalledWith({
        phone: "+971501234567",
        registration_token: "reg-token-1",
        first_name: "Aisha",
        last_name: "Khan",
        email: "aisha@example.com",
      }),
    );
  });

  test("shows the number the code went to, with an edit affordance back to the phone step", async () => {
    renderForm();

    fireEvent.change(screen.getByLabelText(/phone number/i), {
      target: { value: "0501234567" },
    });
    fireEvent.click(screen.getByRole("button", { name: /send code/i }));

    await screen.findByLabelText(/verification code/i);
    expect(screen.getByText("Code sent to")).toBeInTheDocument();
    expect(screen.getByText("+971501234567")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: /change phone number/i }));

    // Back on the phone step, with the number still in the field (PhoneInput
    // drops the trunk 0, the +971 prefix being its own segment).
    expect(screen.getByLabelText(/phone number/i)).toHaveValue("501234567");
    expect(screen.queryByLabelText(/verification code/i)).not.toBeInTheDocument();
  });

  test("drops the code the previous number was issued for when the number is edited", async () => {
    verifyPhoneAuthMock.mockResolvedValue({ requires_registration: false });
    renderForm();

    fireEvent.change(screen.getByLabelText(/phone number/i), {
      target: { value: "0501234567" },
    });
    fireEvent.click(screen.getByRole("button", { name: /send code/i }));

    const codeInput = await screen.findByLabelText(/verification code/i);
    fireEvent.change(codeInput, { target: { value: "123456" } });
    fireEvent.click(screen.getByRole("button", { name: /change phone number/i }));

    startPhoneAuthMock.mockResolvedValue({ phone: "+971509999999" });
    fireEvent.change(screen.getByLabelText(/phone number/i), {
      target: { value: "0509999999" },
    });
    fireEvent.click(screen.getByRole("button", { name: /send code/i }));

    await waitFor(() => expect(screen.getByText("+971509999999")).toBeInTheDocument());
    expect(screen.getByLabelText(/verification code/i)).toHaveValue("");
  });

  test("shows the error when the code is rejected", async () => {
    verifyPhoneAuthMock.mockRejectedValue({
      response: { data: { message: "Invalid code" } },
    });
    renderForm();

    // Step 1: phone
    fireEvent.change(screen.getByLabelText(/phone number/i), {
      target: { value: "0501234567" },
    });
    fireEvent.click(screen.getByRole("button", { name: /send code/i }));

    // Step 2: verification code
    const codeInput = await screen.findByLabelText(/verification code/i);
    fireEvent.change(codeInput, { target: { value: "000000" } });
    fireEvent.click(screen.getByRole("button", { name: /verify code/i }));

    expect(await screen.findByText("Invalid code")).toBeInTheDocument();
  });
});
