import { TanStackDevtools } from "@tanstack/react-devtools";
import {
	createRootRoute,
	HeadContent,
	Link,
	Scripts,
} from "@tanstack/react-router";
import { TanStackRouterDevtoolsPanel } from "@tanstack/react-router-devtools";
import { buttonVariants } from "#/components/ui/button";
import { Toaster } from "#/components/ui/sonner";
import { TooltipProvider } from "#/components/ui/tooltip";
import { ThemeProvider } from "#/components/web/theme-provider";
import appCss from "../styles.css?url";

export const Route = createRootRoute({
	head: () => ({
		meta: [
			{
				charSet: "utf-8",
			},
			{
				name: "viewport",
				content: "width=device-width, initial-scale=1",
			},
			{
				title: "TanStack Start Starter",
			},
		],
		links: [
			{
				rel: "stylesheet",
				href: appCss,
			},
		],
	}),
	shellComponent: RootDocument,
	notFoundComponent: () => {
		return (
			<div className="flex flex-col items-center justify-center min-h-screen">
				<h1 className="text-4xl font-bold">404</h1>
				<p className="text-muted-foreground">Page not found</p>
				<Link to="/" className={buttonVariants({ variant: "link" })}>
					Go home
				</Link>
			</div>
		);
	},
});

function RootDocument({ children }: { children: React.ReactNode }) {
	return (
		<html lang="en" suppressHydrationWarning>
			<head>
				<HeadContent />
			</head>
			<body>
				<ThemeProvider defaultTheme="system" storageKey="theme">
					<TooltipProvider>{children}</TooltipProvider>
					<Toaster position="top-center" />
				</ThemeProvider>
				<TanStackDevtools
					config={{
						position: "bottom-right",
					}}
					plugins={[
						{
							name: "Tanstack Router",
							render: <TanStackRouterDevtoolsPanel />,
						},
					]}
				/>
				<Scripts />
			</body>
		</html>
	);
}
