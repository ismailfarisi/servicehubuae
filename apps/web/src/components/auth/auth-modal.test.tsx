import { useAuthModalStore } from "@/stores/auth-modal";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { act, render, screen } from "@testing-library/react";
import { NextIntlClientProvider } from "next-intl";
import { beforeEach, describe, expect, test, vi } from "vitest";
import messages from "../../messages/en.json";
import { AuthModal } from "./auth-modal";

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn() }),
}));

vi.mock("@/lib/queries/auth", () => ({
  useStartPhoneAuth: () => ({ mutateAsync: vi.fn(), isPending: false }),
  useVerifyPhoneAuth: () => ({ mutateAsync: vi.fn(), isPending: false }),
  useRegisterPhoneAuth: () => ({ mutateAsync: vi.fn(), isPending: false }),
}));

function renderModal() {
  const client = new QueryClient();
  return render(
    <NextIntlClientProvider locale="en" messages={messages}>
      <QueryClientProvider client={client}>
        <AuthModal />
      </QueryClientProvider>
    </NextIntlClientProvider>,
  );
}

describe("AuthModal", () => {
  beforeEach(() => {
    useAuthModalStore.setState({
      isOpen: false,
      mode: "login",
      returnTo: null,
    });
  });

  test("shows the phone sign-in form when the modal opens", async () => {
    renderModal();

    expect(screen.queryByRole("button", { name: /send code/i })).not.toBeInTheDocument();

    act(() => {
      useAuthModalStore.setState({
        isOpen: true,
        mode: "login",
        returnTo: "/account/bookings",
      });
    });

    expect(await screen.findByRole("button", { name: /send code/i })).toBeInTheDocument();
  });
});
