import { createFileRoute, Link } from "@tanstack/react-router";
import { Inbox } from "lucide-react";
import { Suspense, use, useEffect, useState } from "react";
import { CopyButton } from "#/components/copybutton";
import { buttonVariants } from "#/components/ui/button";
import { Card, CardHeader, CardTitle } from "#/components/ui/card";
import {
	Empty,
	EmptyContent,
	EmptyDescription,
	EmptyHeader,
	EmptyMedia,
	EmptyTitle,
} from "#/components/ui/empty";
import { Input } from "#/components/ui/input";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "#/components/ui/select";
import { Skeleton } from "#/components/ui/skeleton";
import { getItemsFn } from "#/data/items";
import { ItemStatus } from "#/generated/prisma/enums";
import { type ItemsSearch, itemsSearchSchema } from "#/schema/import";
import { Badge } from "@/components/ui/badge";

export const Route = createFileRoute("/dashboard/items/")({
	component: RouteComponent,
	loader: () => ({ promise: getItemsFn() }), // 1
	validateSearch: itemsSearchSchema,
	head: () => ({
		meta: [
			{ title: "Saved Items" },
			{
				name: "description",
				content:
					"Browse and manage your saved articles, bookmarks, and content.",
			},
			{ property: "og:title", content: "Saved Items" },
			{
				property: "og:description",
				content:
					"Browse and manage your saved articles, bookmarks, and content.",
			},
			{ property: "og:type", content: "website" },
			{ name: "twitter:card", content: "summary" },
			{ name: "twitter:title", content: "Saved Items" },
			{
				name: "twitter:description",
				content:
					"Browse and manage your saved articles, bookmarks, and content.",
			},
		],
	}),
});

const ItemsList = ({
	q,
	status,
	itemsPromise,
}: {
	q: ItemsSearch["q"];
	status: ItemsSearch["status"];
	// items: Awaited<ReturnType<typeof getItemsFn>>;
	itemsPromise: ReturnType<typeof getItemsFn>; // 3
}) => {
	const items = use(itemsPromise); // 4
	const filteredItems = items.filter((item) => {
		const matchesQuery =
			q === "" ||
			item.title?.toLowerCase()?.includes(q.toLowerCase()) ||
			item.tags.some((tag) => tag.toLowerCase().includes(q.toLowerCase()));
		const matchesStatus = status === "all" || item.status === status;
		return matchesQuery && matchesStatus;
	});

	if (filteredItems.length === 0) {
		return (
			<Empty className="border rounded-lg h-full">
				<EmptyHeader>
					<EmptyMedia variant="icon">
						<Inbox className="size-12" />
					</EmptyMedia>
					<EmptyTitle>
						{items.length === 0 ? "No Items saved yet" : "No items found"}
					</EmptyTitle>
					<EmptyDescription>
						{items.length === 0
							? "Import a URL to get started with saving your content."
							: "No items match your current search filters."}
					</EmptyDescription>
				</EmptyHeader>
				{items.length === 0 && (
					<EmptyContent>
						<Link className={buttonVariants()} to="/dashboard/import">
							Import URL
						</Link>
					</EmptyContent>
				)}
			</Empty>
		);
	}

	return (
		<div className="grid gap-6 md:grid-cols-2">
			{filteredItems.map((item) => (
				// group:触发器，触发其子元素的group-xxx:样式
				<Card
					key={item.id}
					className="group overflow-hidden transition-all hover:shadow-lg pt-0"
				>
					<Link
						to="/dashboard/items/$itemId"
						params={{ itemId: item.id }}
						className="block"
					>
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

function ItemsGridSkeleton() {
	return (
		<div className="grid gap-6 md:grid-cols-2">
			{[1, 2, 3, 4].map((i) => (
				<Card key={i} className="overflow-hidden pt-0">
					<Skeleton className="aspect-video w-full" />
					<CardHeader className="space-y-3">
						<div className="flex items-center justify-between">
							<Skeleton className="h-5 w-20 rounded-full" />
							<Skeleton className="size-8 rounded-md" />
						</div>

						{/* Title */}
						<Skeleton className="h-6 w-full" />

						{/* Author  */}
						<Skeleton className="h-4 w-40" />
					</CardHeader>
				</Card>
			))}
		</div>
	);
}

function RouteComponent() {
	const { promise } = Route.useLoaderData(); // 2
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
			{/* 5 Suspense 展示fallback 直到其children加载完毕 */}
			<Suspense fallback={<ItemsGridSkeleton />}>
				<ItemsList q={q} status={status} itemsPromise={promise} />
			</Suspense>
		</div>
	);
}
