"use client";

import { CaretDown, CaretLeft, CaretRight } from "@phosphor-icons/react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { cn } from "../../lib/utils";

interface SidebarItem {
	label: string;
	href: string;
	icon: React.ReactNode;
	badge?: string | number;
}

interface SidebarGroup {
	label: string;
	icon: React.ReactNode;
	children: SidebarItem[];
}

type SidebarEntry = SidebarItem | SidebarGroup;

function isGroup(entry: SidebarEntry): entry is SidebarGroup {
	return "children" in entry;
}

interface SidebarProps {
	items: SidebarEntry[];
	currentPath: string;
	collapsed: boolean;
	onToggle: () => void;
	appName: string;
	roleBadge?: string;
	/** Mobile (< lg) drawer open state. Ignored at lg+ where the sidebar is in-flow. */
	mobileOpen?: boolean;
	/** Called when the backdrop is clicked to close the mobile drawer. */
	onMobileClose?: () => void;
}

function NavLink({
	item,
	currentPath,
	collapsed,
	indented,
}: {
	item: SidebarItem;
	currentPath: string;
	collapsed: boolean;
	indented?: boolean;
}) {
	const isActive = indented
		? currentPath === item.href
		: item.href === "/"
			? currentPath === "/"
			: currentPath === item.href || currentPath.startsWith(`${item.href}/`);
	return (
		<Link
			href={item.href}
			className={cn(
				"flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors",
				isActive
					? "bg-accent text-amber font-semibold"
					: "text-taupe hover:bg-background hover:text-cacao",
				indented && !collapsed && "pl-10",
			)}
			title={collapsed ? item.label : undefined}
		>
			<span className="flex-shrink-0">{item.icon}</span>
			{!collapsed && (
				<>
					<span className="flex-1 truncate">{item.label}</span>
					{item.badge !== undefined && (
						<span
							className={cn(
								"ml-auto text-xs font-semibold px-2 py-0.5 rounded-full",
								isActive ? "bg-amber text-linen" : "bg-pearl text-taupe",
							)}
						>
							{item.badge}
						</span>
					)}
				</>
			)}
		</Link>
	);
}

function NavGroup({
	group,
	currentPath,
	collapsed,
}: {
	group: SidebarGroup;
	currentPath: string;
	collapsed: boolean;
}) {
	const isChildActive = group.children.some(
		(child) =>
			currentPath === child.href || currentPath.startsWith(`${child.href}/`),
	);
	const [open, setOpen] = useState(isChildActive);

	useEffect(() => {
		if (isChildActive) {
			setOpen(true);
		}
	}, [isChildActive]);

	if (collapsed) {
		// When collapsed, show just the group icon — clicking the first child
		const firstChild = group.children[0];
		return (
			<Link
				href={firstChild?.href ?? "#"}
				className={cn(
					"flex items-center justify-center px-3 py-2 rounded-md text-sm font-medium transition-colors",
					isChildActive
						? "bg-accent text-amber font-semibold"
						: "text-taupe hover:bg-background hover:text-cacao",
				)}
				title={group.label}
			>
				<span className="flex-shrink-0">{group.icon}</span>
			</Link>
		);
	}

	return (
		<div>
			<button
				type="button"
				onClick={() => setOpen((o) => !o)}
				className={cn(
					"w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors",
					isChildActive
						? "text-amber"
						: "text-taupe hover:bg-background hover:text-cacao",
				)}
			>
				<span className="flex-shrink-0">{group.icon}</span>
				<span className="flex-1 truncate text-left">{group.label}</span>
				<CaretDown
					className={cn("w-4 h-4 transition-transform", open && "rotate-180")}
				/>
			</button>
			{open && (
				<div className="mt-1 space-y-1">
					{group.children.map((child) => (
						<NavLink
							key={child.href}
							item={child}
							currentPath={currentPath}
							collapsed={false}
							indented
						/>
					))}
				</div>
			)}
		</div>
	);
}

export function Sidebar({
	items,
	currentPath,
	collapsed,
	onToggle,
	appName,
	roleBadge,
	mobileOpen = false,
	onMobileClose,
}: SidebarProps) {
	return (
		<>
			{/* Mobile backdrop — only rendered when the drawer is open, hidden at lg+ */}
			{mobileOpen && (
				<button
					type="button"
					aria-label="Close menu"
					onClick={onMobileClose}
					className="fixed inset-0 z-40 bg-espresso/40 backdrop-blur-sm lg:hidden"
				/>
			)}
			<aside
				className={cn(
					"flex flex-col h-full bg-linen border-r border-pearl transition-all duration-300",
					// Mobile: fixed slide-in drawer, full width
					"fixed inset-y-0 left-0 z-50 w-64",
					mobileOpen ? "translate-x-0" : "-translate-x-full",
					// Desktop (lg+): in-flow, honours the collapse toggle
					"lg:static lg:z-auto lg:translate-x-0",
					collapsed ? "lg:w-16" : "lg:w-64",
				)}
			>
				{/* App name / logo */}
				<div className="flex items-center gap-2 px-6 py-5 border-b border-pearl overflow-hidden">
					<span className="flex-shrink-0 w-8 h-8 rounded-lg bg-gradient-to-br from-amber to-caramel flex items-center justify-center text-linen font-bold text-sm shadow-sm">
						{appName.charAt(0).toUpperCase()}
					</span>
					{!collapsed && (
						<div className="flex flex-col min-w-0">
							<span className="font-semibold text-sm text-cacao truncate">
								{appName}
							</span>
							{roleBadge && (
								<span className="text-xs text-taupe truncate">{roleBadge}</span>
							)}
						</div>
					)}
				</div>

				{/* Nav items */}
				<nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
					{items.map((entry) =>
						isGroup(entry) ? (
							<NavGroup
								key={entry.label}
								group={entry}
								currentPath={currentPath}
								collapsed={collapsed}
							/>
						) : (
							<NavLink
								key={entry.href}
								item={entry}
								currentPath={currentPath}
								collapsed={collapsed}
							/>
						),
					)}
				</nav>

				{/* Toggle button */}
				<div className="border-t border-pearl p-2 hidden lg:block">
					<button
						type="button"
						onClick={onToggle}
						className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-md text-sm text-taupe hover:bg-background hover:text-cacao transition-colors"
						aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
					>
						{collapsed ? (
							<CaretRight className="w-5 h-5" />
						) : (
							<>
								<CaretLeft className="w-5 h-5" />
								<span>Collapse</span>
							</>
						)}
					</button>
				</div>
			</aside>
		</>
	);
}
