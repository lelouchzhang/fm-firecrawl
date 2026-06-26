"use client";

import { Link } from "@tanstack/react-router";
import {
	ArrowRightIcon,
	FolderIcon,
	MoreHorizontalIcon,
	Trash2Icon,
} from "lucide-react";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
	SidebarGroup,
	SidebarGroupContent,
	SidebarGroupLabel,
	SidebarMenu,
	SidebarMenuAction,
	SidebarMenuButton,
	SidebarMenuItem,
	useSidebar,
} from "@/components/ui/sidebar";

export function NavProjects({
	projects,
}: {
	projects: {
		name: string;
		url: string;
		icon: React.ReactNode;
	}[];
}) {
	const { isMobile } = useSidebar();

	return (
		<SidebarGroup>
			<SidebarGroupContent>
				<SidebarMenu>
					{projects.map((item) => {
						return (
							<SidebarMenuItem key={item.name}>
								<SidebarMenuButton size="sm" asChild>
									<Link to={item.url}>
										{item.icon}
										<span>{item.name}</span>
									</Link>
								</SidebarMenuButton>
							</SidebarMenuItem>
						);
					})}
				</SidebarMenu>
			</SidebarGroupContent>
		</SidebarGroup>
	);
}
