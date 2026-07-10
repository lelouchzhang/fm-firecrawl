import { useForm } from "@tanstack/react-form";
import { createFileRoute } from "@tanstack/react-router";
import type { SearchResultWeb } from "firecrawl";
import { Globe, LinkIcon, Loader2 } from "lucide-react";
import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Button } from "#/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "#/components/ui/card";
import { Checkbox } from "#/components/ui/checkbox";
import {
	Field,
	FieldError,
	FieldGroup,
	FieldLabel,
} from "#/components/ui/field";
import { Input } from "#/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "#/components/ui/tabs";
import { bulkScrapeUrlsFn, mapUrlFn, scrapeUrlFn } from "#/data/items";
import { bulkImportSchema, importSchema } from "#/schema/import";

export const Route = createFileRoute("/dashboard/import")({
	component: RouteComponent,
});

function RouteComponent() {
	const [isPending, startTransition] = useTransition();
	const [isBulkImportPending, startBulkImportTransition] = useTransition();
	const [discoveredLinks, setDiscoveredLinks] = useState<
		Array<SearchResultWeb>
	>([]);

	const [selectedUrls, setSelectedUrls] = useState<Set<string>>(new Set()); // 目的是去除用户多选时重复的url

	function handleSelectAll() {
		if (selectedUrls.size === discoveredLinks.length) {
			setSelectedUrls(new Set());
		} else {
			setSelectedUrls(new Set(discoveredLinks.map((link) => link.url)));
		}
	}

	function handleToggleUrl(url: string) {
		const newSelected = new Set(selectedUrls);

		if (newSelected.has(url)) {
			newSelected.delete(url);
		} else {
			newSelected.add(url);
		}

		setSelectedUrls(newSelected);
	}
	// 爬取用户传入的url - scrape
	const form = useForm({
		defaultValues: {
			url: "",
		},
		validators: {
			onSubmit: importSchema,
		},
		onSubmit: ({ value }) => {
			startTransition(async () => {
				await scrapeUrlFn({ data: value });
				toast.success("URL scraped successfully");
			});
		},
	});

	// 爬取用户传入url的所有子页面 - map
	const bulkForm = useForm({
		defaultValues: {
			url: "",
			search: "",
		},
		validators: {
			onSubmit: bulkImportSchema,
		},
		onSubmit: ({ value }) => {
			startTransition(async () => {
				const data = await mapUrlFn({ data: value });

				toast.success("URLs scraped successfully");
				setDiscoveredLinks(data);
			});
		},
	});

	function handleBulkImport() {
		startBulkImportTransition(async () => {
			if (selectedUrls.size === 0) {
				toast.error("Please select at least one URL to import");
				return;
			}
			const selectedUrlsArray = Array.from(selectedUrls);
			await bulkScrapeUrlsFn({
				data: { urls: selectedUrlsArray },
			});
			toast.success(`${selectedUrls.size} URLs scraped successfully`);
		});
	}

	return (
		<div className="flex flex-1 items-center justify-center py-8">
			<div className="w-full max-w-2xl space-y-6 px-4">
				<div className="text-center">
					<h1 className="text-3xl font-bold">Import Content</h1>
					<p className="text-muted-foreground pt-1">
						Save web pages to your libary for later reading
					</p>
				</div>
				<Tabs defaultValue="single">
					<TabsList className="grid w-full grid-cols-2">
						<TabsTrigger value="single" className="gap-2">
							<LinkIcon className="size-4" />
							Single URL
						</TabsTrigger>
						<TabsTrigger value="bulk" className="gap-2">
							<Globe className="size-4" />
							Bulk Import
						</TabsTrigger>
					</TabsList>
					<TabsContent value="single">
						<Card>
							<CardHeader>
								<CardTitle>Import Single URL</CardTitle>
								<CardDescription>
									Scrape and save content from any web app! 👀
								</CardDescription>
							</CardHeader>
							<CardContent>
								<form
									onSubmit={(e) => {
										e.preventDefault();
										form.handleSubmit();
									}}
								>
									<FieldGroup>
										<form.Field name="url">
											{(field) => {
												const isInvalid =
													field.state.meta.isTouched &&
													!field.state.meta.isValid;
												return (
													<Field data-invalid={isInvalid}>
														<FieldLabel htmlFor={field.name}>URL</FieldLabel>
														<Input
															id={field.name}
															name={field.name}
															value={field.state.value}
															onBlur={field.handleBlur}
															onChange={(e) =>
																field.handleChange(e.target.value)
															}
															aria-invalid={isInvalid}
															placeholder="https://tanstack.com/start/latest"
															autoComplete="off"
														/>
														{isInvalid && (
															<FieldError errors={field.state.meta.errors} />
														)}
													</Field>
												);
											}}
										</form.Field>
										<Button type="submit" disabled={isPending}>
											{isPending ? (
												<>
													<Loader2 className="size-4 animate-spin" />
													Processing...
												</>
											) : (
												"Import Url"
											)}
										</Button>
									</FieldGroup>
								</form>
							</CardContent>
						</Card>
					</TabsContent>
					<TabsContent value="bulk">
						<Card>
							<CardHeader>
								<CardTitle>Bulk Import</CardTitle>
								<CardDescription>
									Discover and import multiple URLs from a website at once 🚀
								</CardDescription>
							</CardHeader>
							<CardContent className="space-y-6">
								<form
									onSubmit={(e) => {
										e.preventDefault();
										bulkForm.handleSubmit();
									}}
								>
									<FieldGroup>
										<bulkForm.Field name="url">
											{(field) => {
												const isInvalid =
													field.state.meta.isTouched &&
													!field.state.meta.isValid;
												return (
													<Field data-invalid={isInvalid}>
														<FieldLabel htmlFor={field.name}>URL</FieldLabel>
														<Input
															id={field.name}
															name={field.name}
															value={field.state.value}
															onBlur={field.handleBlur}
															onChange={(e) =>
																field.handleChange(e.target.value)
															}
															aria-invalid={isInvalid}
															placeholder="https://tanstack.com/start/latest"
															autoComplete="off"
														/>
														{isInvalid && (
															<FieldError errors={field.state.meta.errors} />
														)}
													</Field>
												);
											}}
										</bulkForm.Field>
										<bulkForm.Field name="search">
											{(field) => {
												const isInvalid =
													field.state.meta.isTouched &&
													!field.state.meta.isValid;
												return (
													<Field data-invalid={isInvalid}>
														<FieldLabel htmlFor={field.name}>
															Filter (optional)
														</FieldLabel>
														<Input
															id={field.name}
															name={field.name}
															value={field.state.value}
															onBlur={field.handleBlur}
															onChange={(e) =>
																field.handleChange(e.target.value)
															}
															aria-invalid={isInvalid}
															placeholder="e.g. Blog, docs, tutorial"
															autoComplete="off"
														/>
														{isInvalid && (
															<FieldError errors={field.state.meta.errors} />
														)}
													</Field>
												);
											}}
										</bulkForm.Field>
										<Button type="submit" disabled={isPending}>
											{isPending ? (
												<>
													<Loader2 className="size-4 animate-spin" />
													Processing...
												</>
											) : (
												"Import Urls"
											)}
										</Button>
									</FieldGroup>
								</form>
								{/* discoveredLinks */}
								{discoveredLinks.length > 0 && (
									<div className="space-y-4">
										<div className="flex items-center justify-between">
											<p className="text-sm font-medium">
												Found {discoveredLinks.length} URLs
											</p>
											<Button
												variant="outline"
												size="sm"
												onClick={handleSelectAll}
											>
												{selectedUrls.size === discoveredLinks.length
													? "Deselected All"
													: "Select All"}
											</Button>
										</div>
										<div className="max-h-80 space-y-2 overflow-y-auto rounded-md border p-4">
											{discoveredLinks.map((link, index) => {
												const checkboxId = `import-checkbox-${index}`;
												const isSelected = selectedUrls.has(link.url);
												return (
													<label
														key={link.url}
														htmlFor={checkboxId}
														className="hover:bg-muted/50 flex cursor-pointer items-start gap-3 p-2 rounded-md"
													>
														<Checkbox
															id={checkboxId}
															className="mt-0.5"
															checked={isSelected}
															onCheckedChange={() => handleToggleUrl(link.url)}
														/>
														<div className="min-w-0 flex-1">
															<p className="truncate text-sm font-medium">
																{link.title ?? "Title has not been found."}
															</p>
															<p className="text-muted-foreground text-xs truncate">
																{link.description ??
																	"Description has not been found."}
															</p>
															<p className="text-muted-foreground truncate text-xs">
																{link.url}
															</p>
														</div>
													</label>
												);
											})}
										</div>
										<Button
											className="w-full"
											disabled={isBulkImportPending}
											onClick={handleBulkImport}
											type="button"
										>
											{isBulkImportPending ? (
												<>
													<Loader2 className="size-4 animate-spin" />
													Processing...
												</>
											) : (
												`Import ${selectedUrls.size} URLs`
											)}
										</Button>
									</div>
								)}
							</CardContent>
						</Card>
					</TabsContent>
				</Tabs>
			</div>
		</div>
	);
}
