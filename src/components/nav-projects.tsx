"use client";

import { Link } from "@tanstack/react-router";
import {
	SidebarGroup,
	SidebarGroupContent,
	SidebarMenu,
	SidebarMenuButton,
	SidebarMenuItem,
} from "@/components/ui/sidebar";
import type { NavItemsProps } from "../../types";

export function NavItems({ items }: NavItemsProps) {
	return (
		<SidebarGroup>
			<SidebarGroupContent>
				<SidebarMenu>
					{items.map((item) => {
						return (
							<SidebarMenuItem key={item.title}>
								<SidebarMenuButton size="sm" asChild>
									<Link
										to={item.to}
										activeOptions={item.activeOptions}
										activeProps={{
											"data-active": true,
										}}
									>
										<item.icon />
										<span>{item.title}</span>
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
