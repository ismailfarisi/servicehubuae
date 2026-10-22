import { fireEvent, render, screen } from "@testing-library/react";
import { NextIntlClientProvider } from "next-intl";
import { describe, expect, it, vi } from "vitest";
import type { NavTab } from "@/lib/api/navigation";
import messages from "../../../messages/en.json";
import { MobileNavDrawer } from "../mobile-nav-drawer";

function renderDrawer(props: { open: boolean; onClose: () => void; tabs: NavTab[] }) {
  return render(
    <NextIntlClientProvider locale="en" messages={messages}>
      <MobileNavDrawer {...props} />
    </NextIntlClientProvider>,
  );
}

const tabs: NavTab[] = [
  {
    id: "t1",
    kind: "category",
    label: "Cleaning",
    href: "/en/services?category=cleaning",
    subcategories: [{ label: "Deep cleaning", href: "/en/services?category=deep-cleaning" }],
    brand_list: { title: "Brands", see_all_href: "/brands", brands: [] },
    promo_tiles: [],
  },
];

describe("MobileNavDrawer", () => {
  it("returns null when closed", () => {
    const { container } = renderDrawer({ open: false, onClose: () => {}, tabs });
    expect(container).toBeEmptyDOMElement();
  });

  it("renders tab labels when open and expands children on click", () => {
    renderDrawer({ open: true, onClose: () => {}, tabs });
    expect(screen.getByText("Cleaning")).toBeInTheDocument();
    expect(screen.queryByText("Deep cleaning")).not.toBeInTheDocument();
    fireEvent.click(screen.getByText("Cleaning"));
    expect(screen.getByText("Deep cleaning")).toBeInTheDocument();
  });

  it("shows core quick links even when tabs are empty", () => {
    renderDrawer({ open: true, onClose: () => {}, tabs: [] });
    expect(screen.getByText("Reels")).toBeInTheDocument();
    expect(screen.getByText("Services")).toBeInTheDocument();
    expect(screen.getByText("My Bookings")).toBeInTheDocument();
    expect(screen.getByText("Become a vendor").closest("a")?.getAttribute("href")).toBe(
      "http://localhost:4001/login",
    );
    expect(screen.queryByText("Brands")).toBeNull();
    expect(screen.getByText("Log In")).toBeInTheDocument();
  });

  it("calls onClose on Escape", () => {
    const onClose = vi.fn();
    renderDrawer({ open: true, onClose, tabs });
    fireEvent.keyDown(document, { key: "Escape" });
    expect(onClose).toHaveBeenCalled();
  });
});
