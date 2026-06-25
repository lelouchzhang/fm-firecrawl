import { Link } from "@tanstack/react-router";
import { buttonVariants } from "../ui/button";
import { ModeToggle } from "./mode-toggle";

export function Navbar() {
	return (
		<nav className="navbar">
			<div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
				<div className="flex items-center gap-2">
					<img src="/9.jpg" alt="TanStack Start Logo" className="size-8" />
					<h1 className="text-lg font-semibold">fm-firecrawl</h1>
				</div>

				<div className="flex items-center gap-3">
					<ModeToggle />

					<Link
						to="/login"
						className={buttonVariants({ variant: "secondary" })}
					>
						Login
					</Link>
					<Link to="/signup" className={buttonVariants()}>
						Get Started
					</Link>
				</div>
			</div>
		</nav>
	);
}
