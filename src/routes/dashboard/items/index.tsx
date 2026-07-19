import { createFileRoute, Link } from "@tanstack/react-router";
import { use, useEffect, useState } from "react";
import { CopyButton } from "#/components/copybutton";
import { Card, CardHeader, CardTitle } from "#/components/ui/card";
import { Input } from "#/components/ui/input";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "#/components/ui/select";
import { getItemsFn } from "#/data/items";
import { ItemStatus } from "#/generated/prisma/enums";
import { type ItemsSearch, itemsSearchSchema } from "#/schema/import";
import { Badge } from "@/components/ui/badge";

export const Route = createFileRoute("/dashboard/items/")({
	component: RouteComponent,
	loader: () => getItemsFn(),
	validateSearch: itemsSearchSchema,
});

const ItemsList = ({
	q,
	status,
	items,
}: {
	q: ItemsSearch["q"];
	status: ItemsSearch["status"];
	items: Awaited<ReturnType<typeof getItemsFn>>;
	// items: ReturnType<typeof getItemsFn>;
}) => {
	// const itemsData = use(items);
	const filteredItems = items.filter((item) => {
		const matchesQuery =
			q === "" ||
			item.title?.toLowerCase()?.includes(q.toLowerCase()) ||
			item.tags.some((tag) => tag.toLowerCase().includes(q.toLowerCase()));
		const matchesStatus = status === "all" || item.status === status;
		return matchesQuery && matchesStatus;
	});
	return (
		<div className="grid gap-6 md:grid-cols-2">
			{filteredItems.map((item) => (
				// group:触发器，触发其子元素的group-xxx:样式
				<Card
					key={item.id}
					className="group overflow-hidden transition-all hover:shadow-lg pt-0"
				>
					<Link to="/dashboard" className="block">
						{item.ogImage && (
							<div className="aspect-video overflow-hidden bg-muted">
								<img
									src={item.ogImage}
									alt={item.title ?? "Artical Thumbnail"}
									className="h-full w-full object-cover transition-transform group-hover:scale-105"
								/>
							</div>
						)}
					</Link>
					<CardHeader className="space-y-3 pt-4">
						<div className="flex items-center justify-between">
							<Badge
								variant={item.status === "COMPLETED" ? "default" : "secondary"}
							>
								{item.status.toLowerCase()}
							</Badge>
							<CopyButton url={item.url} />
						</div>
						<CardTitle className="line-clamp-1 text-xl leading-snug group-hover:text-primary transition-colors">
							{item.title}
						</CardTitle>
						{item.author && (
							<p className="text-xs text-muted-foreground">{item.author}</p>
						)}
					</CardHeader>
				</Card>
			))}
		</div>
	);
};

function RouteComponent() {
	const items = Route.useLoaderData();
	const { q, status } = Route.useSearch();
	const navigate = Route.useNavigate();

	const [search, setSearch] = useState(q);

	useEffect(() => {
		if (search === q) return;
		const timerId = setTimeout(() => {
			navigate({ search: (prev) => ({ ...prev, q: search }) });
		}, 500);
		// 这个函数只在 search/q/navigate 变化时执行
		return () => clearTimeout(timerId);
	}, [search, q, navigate]);

	return (
		<div className="flex flex-1 flex-col gap-6">
			<div>
				<h1 className="text-2xl font-bold">Saved Items</h1>
				<p className="text-muted-foreground">Your saved content here.</p>
			</div>
			<div className="flex gap-4">
				<Input
					placeholder="Search"
					value={search}
					onChange={(e) => setSearch(e.target.value)}
				/>
				<Select
					value={status}
					// 只更新?search= 部分
					onValueChange={(value) =>
						navigate({
							search: (prev) => ({ ...prev, status: value as typeof status }),
						})
					}
				>
					<SelectTrigger className="w-[160px]">
						<SelectValue placeholder="Filter by status"></SelectValue>
					</SelectTrigger>
					<SelectContent>
						<SelectItem value="all">All Statuses</SelectItem>
						{Object.values(ItemStatus).map((status) => (
							<SelectItem key={status} value={status}>
								{status.charAt(0) + status.slice(1).toLowerCase()}
							</SelectItem>
						))}
					</SelectContent>
				</Select>
			</div>
			<ItemsList q={q} status={status} items={items} />
		</div>
	);
}
