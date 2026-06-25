import { createFileRoute } from "@tanstack/react-router";
import { Navbar } from "#/components/web/navbar";

export const Route = createFileRoute("/")({ component: Home });

function Home() {
	return (
		<div className="p-8">
			<Navbar />
		</div>
	);
}
