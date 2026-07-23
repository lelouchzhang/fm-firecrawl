import { useCompletion } from "@ai-sdk/react";
import { createFileRoute, Link, useRouter } from "@tanstack/react-router";
import {
	ArrowLeft,
	Calendar,
	ChevronDown,
	Clock,
	ExternalLink,
	Loader2,
	Sparkles,
	User,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { MessageResponse } from "#/components/ai-elements/message";
import { Badge } from "#/components/ui/badge";
import { Button, buttonVariants } from "#/components/ui/button";
import { Card, CardContent } from "#/components/ui/card";
import {
	Collapsible,
	CollapsibleContent,
	CollapsibleTrigger,
} from "#/components/ui/collapsible";
import { getItemById, saveSummaryAndGenerateTagsFn } from "#/data/items";
import { cn } from "#/lib/utils";

export const Route = createFileRoute("/dashboard/items/$itemId")({
	component: RouteComponent,
	loader: ({ params }) => getItemById({ data: { id: params.itemId } }),
	head: ({ loaderData }) => {
		const title = loaderData?.title ?? "Item Details";
		const description =
			loaderData?.summary ??
			"View saved article details and AI-generated summary";
		const image = loaderData?.ogImage;

		return {
			meta: [
				{ title },
				{ name: "description", content: description },
				{ property: "og:title", content: title },
				{ property: "og:description", content: description },
				{ property: "og:type", content: "article" },
				...(image ? [{ property: "og:image", content: image }] : []),
				{
					name: "twitter:card",
					content: image ? "summary_large_image" : "summary",
				},
				{ name: "twitter:title", content: title },
				{ name: "twitter:description", content: description },
				...(image ? [{ name: "twitter:image", content: image }] : []),
				...(loaderData?.author
					? [{ name: "author", content: loaderData.author }]
					: []),
			],
		};
	},
});

function RouteComponent() {
	const item = Route.useLoaderData();
	const router = useRouter();
	const [open, setOpen] = useState(false);

	// ai summary
	const { complete, completion, isLoading } = useCompletion({
		api: "/api/ai/summary",
		initialCompletion: item.summary ? item.summary : undefined,
		streamProtocol: "text",
		body: {
			itemId: item.id,
		},
		onFinish: async (_prompt, completion) => {
			await saveSummaryAndGenerateTagsFn({
				data: {
					id: item.id,
					summary: completion,
				},
			});
			toast.success("Summary generated and saved!");
			router.invalidate();
		},
		onError: (error) => {
			toast.error(error.message);
		},
	});

	function handleGenerateSummary() {
		if (!item.content) {
			toast.error("No content available to summarize");
			return;
		}

		complete(item.content);
	}

	return (
		<div className="mx-auto max-w-3xl space-y-6 w-full">
			<div className="flex justify-start">
				<Link
					to="/dashboard/items"
					className={buttonVariants({
						variant: "outline",
					})}
				>
					<ArrowLeft />
					Go Back
				</Link>
			</div>
			<div className="relative aspect-video w-full overflow-hidden rounded-lg bg-muted">
				<img
					className="h-full w-full object-cover transition-transform duration-300 hover:scale-105"
					src={
						item.ogImage ??
						"https://images.unsplash.com/photo-1635776062043-223faf322554?q=80&w=1632&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
					}
					alt={item.title ?? "Item Image"}
				/>
			</div>
			<div className="space-y-3">
				<h1 className="text-3xl font-bold tracking-tight">
					{item.title ?? "Untitled"}
				</h1>

				{/* Metaitem Row */}
				<div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
					{item.author && (
						<span className="inline-flex items-center gap-1">
							<User className="size-3.5" />
							{item.author}
						</span>
					)}

					{item.publishedAt && (
						<span className="inline-flex items-center gap-1">
							<Calendar className="size-3.5" />
							{new Date(item.publishedAt).toLocaleDateString("en-US")}
						</span>
					)}

					<span className="inline-flex items-center gap-1">
						<Clock className="size-3.5" />
						Saved {new Date(item.createdAt).toLocaleDateString("en-US")}
					</span>
				</div>
				{/* 外部网站导航常用a标签 */}
				<a
					href={item.url}
					className="text-primary hover:underline inline-flex items-center gap-1 text-sm"
					target="_blank"
				>
					View Original
					<ExternalLink className="size-3.5" />
				</a>

				{/* Tags */}
				{item.tags.length > 0 && (
					<div className="flex flex-wrap gap-2">
						{item.tags.map((tag) => (
							<Badge key={tag}>{tag}</Badge>
						))}
					</div>
				)}
				{/* Summary Section */}
				<Card className="border-primary/20 bg-primary/5">
					<CardContent>
						<div className="flex items-start justify-between gap-4">
							<div className="flex-1">
								<h2 className="text-sm font-bold tracking-wide text-primary mb-3">
									Summary
								</h2>
								{completion || item.summary ? (
									<MessageResponse>{completion}</MessageResponse>
								) : (
									<p className="text-muted-foreground italic">
										{item.content
											? "No summary yet. Generate one with AI."
											: "No content available to summarize."}
									</p>
								)}
							</div>
							{item.content && !item.summary && (
								<Button
									disabled={isLoading}
									size="sm"
									onClick={handleGenerateSummary}
								>
									{isLoading ? (
										<>
											<Loader2 className="mr-2 h-4 w-4 animate-spin" />
											Generating...
										</>
									) : (
										<>
											<Sparkles className="mr-2 h-4 w-4" />
											Generate
										</>
									)}
								</Button>
							)}
						</div>
					</CardContent>
				</Card>
				{/* content */}
				{item.content && (
					<Collapsible open={open} onOpenChange={setOpen}>
						<CollapsibleTrigger asChild>
							<Button variant="outline" className="w-full justify-between">
								<span className="font-medium">Full Content</span>
								<ChevronDown
									className={cn(
										open ? "rotate-180" : "",
										"size-4 transition-transform duration-200",
									)}
								/>
							</Button>
						</CollapsibleTrigger>
						<CollapsibleContent>
							<Card className="mt-2">
								<MessageResponse>{item.content}</MessageResponse>
							</Card>
						</CollapsibleContent>
					</Collapsible>
				)}
			</div>
		</div>
	);
}
