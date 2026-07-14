import { createFileRoute, Link } from "@tanstack/react-router";
import { CopyButton } from "#/components/copybutton";
import { Card, CardHeader, CardTitle } from "#/components/ui/card";
import { getItemsFn } from "#/data/items";
import { Badge } from "@/components/ui/badge";

export const Route = createFileRoute("/dashboard/items/")({
	component: RouteComponent,
	loader: () => getItemsFn(),
});

function RouteComponent() {
	const items = Route.useLoaderData();
	return (
		<div className="grid gap-6 md:grid-cols-2">
			{items.map((item) => (
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
}
