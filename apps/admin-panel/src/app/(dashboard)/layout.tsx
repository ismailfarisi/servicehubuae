"use client";

import { useChangePassword, useLogout, useMe } from "@/lib/queries/auth";
import { useAuthStore } from "@/stores/auth";
import {
	ChangePasswordDialog,
	DashboardHeader,
	Sidebar,
	toast,
} from "@mypickuae/ui";
import { useQueryClient } from "@tanstack/react-query";
import {
	BarChart3,
	CalendarCheck,
	ClipboardList,
	FileText,
	FolderTree,
	Image,
	LayoutDashboard,
	MapPin,
	Menu,
	MessageSquare,
	Settings,
	ShieldCheck,
	ShoppingCart,
	Slack,
	Store,
	Tag,
	UserCheck,
	Users,
	Video,
} from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

const navItems = [
	{ label: "Dashboard", href: "/", icon: <LayoutDashboard size={20} /> },
	{
		label: "Bookings & Catalogue",
		icon: <ShoppingCart size={20} />,
		children: [
			{
				label: "All Bookings",
				href: "/bookings",
				icon: <CalendarCheck size={20} />,
			},
			{
				label: "Service Approvals",
				href: "/bookings/service-approvals",
				icon: <ClipboardList size={20} />,
			},
			{
				label: "Categories",
				href: "/categories",
				icon: <FolderTree size={20} />,
			},
		],
	},
	{
		label: "Vendors & Users",
		icon: <Users size={20} />,
		children: [
			{ label: "Vendors", href: "/vendors", icon: <Store size={20} /> },
			{ label: "Users", href: "/users", icon: <Users size={20} /> },
		],
	},
	{
		label: "Creators & Reels",
		icon: <Video size={20} />,
		children: [
			{ label: "Moderation Queue", href: "/reels", icon: <Video size={20} /> },
			{
				label: "Creator Applications",
				href: "/creators/applications",
				icon: <UserCheck size={20} />,
			},
			{ label: "Collaborations", href: "/collabs", icon: <Video size={20} /> },
			{
				label: "Tagging Permissions",
				href: "/reels/tagging-permissions",
				icon: <ShieldCheck size={20} />,
			},
			{
				label: "Analytics",
				href: "/reels/analytics",
				icon: <BarChart3 size={20} />,
			},
		],
	},
	{
		label: "Content",
		icon: <FileText size={20} />,
		children: [
			{ label: "Pages", href: "/cms/pages", icon: <FileText size={20} /> },
			{ label: "Banners", href: "/cms/banners", icon: <Image size={20} /> },
			{
				label: "Layouts",
				href: "/cms/layouts",
				icon: <LayoutDashboard size={20} />,
			},
			{ label: "Bids", href: "/cms/bids", icon: <Tag size={20} /> },
			{
				label: "Header Navigation",
				href: "/cms/header-navigation",
				icon: <Menu size={20} />,
			},
			{
				label: "CMS Settings",
				href: "/cms/settings",
				icon: <Settings size={20} />,
			},
		],
	},
	{
		label: "System & Security",
		icon: <ShieldCheck size={20} />,
		children: [
			{
				label: "Support Tickets",
				href: "/support",
				icon: <MessageSquare size={20} />,
			},
			{
				label: "Audit Log",
				href: "/audit-log",
				icon: <ClipboardList size={20} />,
			},
			...(process.env.NEXT_PUBLIC_TEAM_MANAGEMENT_ENABLED === "true"
				? [
						{
							label: "Role Permissions",
							href: "/role-permissions",
							icon: <ShieldCheck size={20} />,
						},
					]
				: []),
		],
	},
	{
		label: "Settings",
		icon: <Settings size={20} />,
		children: [
			{
				label: "Areas",
				href: "/settings/areas",
				icon: <MapPin size={20} />,
			},
			{
				label: "Slack",
				href: "/settings/slack",
				icon: <Slack size={20} />,
			},
		],
	},
];

const UUID_RE =
	/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const SEGMENT_LABEL_OVERRIDES: Record<string, string> = {
	cms: "CMS",
	seo: "SEO",
	kyc: "KYC",
	bnpl: "BNPL",
	"audit-log": "Audit Log",
	"role-permissions": "Role Permissions",
	"tagging-permissions": "Tagging Permissions",
	"header-navigation": "Header Navigation",
	"service-approvals": "Service Approvals",
};

function labelForSegment(seg: string, prev?: string) {
	if (SEGMENT_LABEL_OVERRIDES[seg]) return SEGMENT_LABEL_OVERRIDES[seg];
	if (UUID_RE.test(seg)) {
		// Friendlier label than a raw UUID. Prev segment hints at the entity.
		if (prev === "layouts") return "Layout";
		if (prev === "pages") return "Page";
		if (prev === "vendors") return "Vendor";
		if (prev === "bookings") return "Booking";
		if (prev === "service-approvals") return "Service";
		return "Detail";
	}
	return seg
		.split("-")
		.map((w) => (w ? w.charAt(0).toUpperCase() + w.slice(1) : w))
		.join(" ");
}

function getBreadcrumbs(pathname: string) {
	const segments = pathname.split("/").filter(Boolean);
	if (segments.length === 0) return [{ label: "Dashboard" }];
	return [
		{ label: "Dashboard", href: "/" },
		...segments.map((seg, i) => ({
			label: labelForSegment(seg, segments[i - 1]),
			href:
				i < segments.length - 1
					? `/${segments.slice(0, i + 1).join("/")}`
					: undefined,
		})),
	];
}

export default function DashboardLayout({
	children,
}: { children: React.ReactNode }) {
	const router = useRouter();
	const pathname = usePathname();
	const [collapsed, setCollapsed] = useState(false);
	const [mobileOpen, setMobileOpen] = useState(false);

	const { isLoading: isQueryLoading, isError } = useMe();
	const { mutate: logout } = useLogout();
	const queryClient = useQueryClient();
	const changePassword = useChangePassword();
	const [pwOpen, setPwOpen] = useState(false);
	const [pwError, setPwError] = useState<{ code?: string; message?: string }>(
		{},
	);
	const user = useAuthStore((s) => s.user);
	const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
	const isStoreLoading = useAuthStore((s) => s.isLoading);

	const isLoading = isQueryLoading || isStoreLoading;

	useEffect(() => {
		if (!isLoading && (!isAuthenticated || isError)) {
			router.replace("/login");
		}
	}, [isLoading, isAuthenticated, isError, router]);

	useEffect(() => {
		if (
			!isLoading &&
			isAuthenticated &&
			user &&
			user.role !== "admin" &&
			user.role !== "super_admin"
		) {
			router.replace("/login");
		}
	}, [isLoading, isAuthenticated, user, router]);

	useEffect(() => {
		if (user?.must_change_password) setPwOpen(true);
	}, [user?.must_change_password]);

	// biome-ignore lint/correctness/useExhaustiveDependencies: close mobile drawer on route change
	useEffect(() => {
		setMobileOpen(false);
	}, [pathname]);

	const handleChangePassword = async (vals: {
		current_password: string;
		new_password: string;
	}) => {
		setPwError({});
		try {
			await changePassword.mutateAsync(vals);
			toast({
				title: "Password changed",
				description: "Please sign in again.",
			});
			useAuthStore.getState().logout();
			queryClient.clear();
			router.replace("/login");
		} catch (err: unknown) {
			const e = err as {
				response?: { data?: { code?: string; message?: string } };
			};
			const code = e?.response?.data?.code;
			const message = e?.response?.data?.message;
			setPwError({
				code: code ?? "UNKNOWN",
				message: message ?? "Could not change password. Please try again.",
			});
		}
	};

	if (isLoading) {
		return (
			<div className="min-h-screen flex items-center justify-center">
				<div className="w-8 h-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
			</div>
		);
	}

	if (!isAuthenticated || !user) {
		return null;
	}

	const breadcrumbs = getBreadcrumbs(pathname);
	const userName = `${user.first_name} ${user.last_name}`.trim() || user.email;
	const roleBadge = user.role === "super_admin" ? "Super Admin" : "Admin";

	return (
		<div className="flex h-screen overflow-hidden">
			<Sidebar
				items={navItems}
				currentPath={pathname}
				collapsed={collapsed}
				onToggle={() => setCollapsed((c) => !c)}
				appName="MyPickUAE"
				roleBadge={roleBadge}
				mobileOpen={mobileOpen}
				onMobileClose={() => setMobileOpen(false)}
			/>
			<div className="flex flex-col flex-1 overflow-hidden">
				<DashboardHeader
					breadcrumbs={breadcrumbs}
					user={{ name: userName, avatar: user.avatar_url, role: roleBadge }}
					onLogout={() =>
						logout(undefined, { onSuccess: () => router.replace("/login") })
					}
					onChangePassword={() => setPwOpen(true)}
					onMenuClick={() => setMobileOpen(true)}
				/>
				<main className="flex-1 overflow-y-auto p-4 lg:p-6">{children}</main>
				<ChangePasswordDialog
					open={pwOpen}
					onOpenChange={(v) => {
						if (user?.must_change_password) return;
						setPwOpen(v);
						if (!v) setPwError({});
					}}
					onSubmit={handleChangePassword}
					isPending={changePassword.isPending}
					errorCode={pwError.code}
					errorMessage={pwError.message}
					forced={!!user?.must_change_password}
				/>
			</div>
		</div>
	);
}
