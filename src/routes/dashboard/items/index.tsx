import { createFileRoute, useLoaderData } from "@tanstack/react-router";
import { getItemsFn } from "#/data/items";

export const Route = createFileRoute("/dashboard/items/")({
	component: RouteComponent,
	loader: () => getItemsFn(),
});

function RouteComponent() {
  const items = Route.useLoaderData();
	return <div className="grid gap-6 md:grid-cols-2">sb</div>
}
