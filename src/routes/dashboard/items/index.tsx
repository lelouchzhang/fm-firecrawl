import { createFileRoute, Link } from "@tanstack/react-router";
import { Card } from "#/components/ui/card";
import { getItemsFn } from "#/data/items";

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
				</Card>
			))}
		</div>
	);
}
