"use client";

import { Link, linkOptions } from "@tanstack/react-router";
import {
	AudioLinesIcon,
	BookmarkIcon,
	BookOpenIcon,
	BotIcon,
	Compass,
	FrameIcon,
	GalleryVerticalEndIcon,
	Import,
	MapIcon,
	PieChartIcon,
	Settings2Icon,
	TerminalIcon,
	TerminalSquareIcon,
} from "lucide-react";
import { NavItems } from "@/components/nav-projects";
import { NavUser } from "@/components/nav-user";

import {
	Sidebar,
	SidebarContent,
	SidebarFooter,
	SidebarHeader,
	SidebarMenu,
	SidebarMenuButton,
	SidebarMenuItem,
	SidebarRail,
} from "@/components/ui/sidebar";
import type { NavItemsProps, NavUserProps } from "../../types";

// This is sample data.
const data = {
	user: {
		name: "shadcn",
		email: "m@example.com",
		avatar: "/avatars/shadcn.jpg",
	},
	teams: [
		{
			name: "Acme Inc",
			logo: <GalleryVerticalEndIcon />,
			plan: "Enterprise",
		},
		{
			name: "Acme Corp.",
			logo: <AudioLinesIcon />,
			plan: "Startup",
		},
		{
			name: "Evil Corp.",
			logo: <TerminalIcon />,
			plan: "Free",
		},
	],
	navMain: [
		{
			title: "Playground",
			url: "#",
			icon: <TerminalSquareIcon />,
			isActive: true,
			items: [
				{
					title: "History",
					url: "#",
				},
				{
					title: "Starred",
					url: "#",
				},
				{
					title: "Settings",
					url: "#",
				},
			],
		},
		{
			title: "Models",
			url: "#",
			icon: <BotIcon />,
			items: [
				{
					title: "Genesis",
					url: "#",
				},
				{
					title: "Explorer",
					url: "#",
				},
				{
					title: "Quantum",
					url: "#",
				},
			],
		},
		{
			title: "Documentation",
			url: "#",
			icon: <BookOpenIcon />,
			items: [
				{
					title: "Introduction",
					url: "#",
				},
				{
					title: "Get Started",
					url: "#",
				},
				{
					title: "Tutorials",
					url: "#",
				},
				{
					title: "Changelog",
					url: "#",
				},
			],
		},
		{
			title: "Settings",
			url: "#",
			icon: <Settings2Icon />,
			items: [
				{
					title: "General",
					url: "#",
				},
				{
					title: "Team",
					url: "#",
				},
				{
					title: "Billing",
					url: "#",
				},
				{
					title: "Limits",
					url: "#",
				},
			],
		},
	],
	projects: [
		{
			name: "Design Engineering",
			url: "#",
			icon: <FrameIcon />,
		},
		{
			name: "Sales & Marketing",
			url: "#",
			icon: <PieChartIcon />,
		},
		{
			name: "Travel",
			url: "#",
			icon: <MapIcon />,
		},
	],
};

const navItems: NavItemsProps["items"] = linkOptions([
	{
		title: "Items",
		icon: BookmarkIcon,
		to: "/dashboard/items",
		activeOptions: { exact: false },
	},
	{
		title: "Import",
		icon: Import,
		to: "/dashboard/import",
		activeOptions: { exact: false },
	},
	{
		title: "Discover",
		icon: Compass,
		to: "/dashboard/discover",
		activeOptions: { exact: false },
	},
]);

export function AppSidebar({ user }: NavUserProps) {
	return (
		<Sidebar collapsible="icon">
			<SidebarHeader>
				<SidebarMenu>
					<SidebarMenuItem>
						<SidebarMenuButton size="lg" asChild>
							<Link to="/dashboard" className="flex items-center gap-3">
								<div className="bg-sidebar-primary text-sidebar-primary-foreground flex aspect-square size-8 items-center justify-center rounded-lg">
									<BookmarkIcon size={8} />
								</div>
								<div className="grid flex-1 text-left text-sm leading-tight">
									<span className="font-medium">Recall</span>
									<span className="text-xs">Your AI Knowledge Base</span>
								</div>
							</Link>
						</SidebarMenuButton>
					</SidebarMenuItem>
				</SidebarMenu>
			</SidebarHeader>
			<SidebarContent>
				<NavItems items={navItems} />
			</SidebarContent>
			<SidebarFooter>
				<NavUser user={user} />
			</SidebarFooter>
			<SidebarRail />
		</Sidebar>
	);
}
