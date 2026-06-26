import { Link, useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";
import { authClient } from "#/lib/auth-client";
import { Button, buttonVariants } from "../ui/button";
import { ModeToggle } from "./mode-toggle";

export function Navbar() {
	const { data: session, isPending } = authClient.useSession();
	const navigate = useNavigate();
	const handleSignOut = async () => {
		await authClient.signOut({
			fetchOptions: {
				onSuccess: () => {
					toast.success("Signed out successfully");
					navigate({
						to: "/login",
					});
				},
				onError: ({ error }) => {
					toast.error(error.message);
				},
			},
		});
	};
	return (
		<nav className="navbar">
			<div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
				<div className="flex items-center gap-2">
					<img src="/9.jpg" alt="TanStack Start Logo" className="size-8" />
					<h1 className="text-lg font-semibold">fm-firecrawl</h1>
				</div>

				<div className="flex items-center gap-3">
					<ModeToggle />

					{isPending ? null : session ? (
						<>
							<Button onClick={handleSignOut} variant="secondary">
								Logout
							</Button>
							<Link to="/dashboard" className={buttonVariants()}>
								Dashboard
							</Link>
						</>
					) : (
						<>
							<Link
								to="/login"
								className={buttonVariants({ variant: "secondary" })}
							>
								Login
							</Link>
							<Link to="/signup" className={buttonVariants()}>
								Get Started
							</Link>
						</>
					)}
				</div>
			</div>
		</nav>
	);
}
