import { notFound } from "@tanstack/react-router";
import { createServerFn } from "@tanstack/react-start";
import { generateText } from "ai";
import { z } from "zod";
import { prisma } from "#/db";
import { firecrawl } from "#/lib/firecrawl";
import { openrouter } from "#/lib/open-router";
import { authFunctionMiddleware } from "#/middlewares/auth";
import { bulkUrlsSchema } from "#/schema/auth";
import { bulkImportSchema, importSchema } from "#/schema/import";
import type { extractSchema } from "./../schema/import";

export const scrapeUrlFn = createServerFn({ method: "POST" })
	.middleware([authFunctionMiddleware])
	.validator(importSchema)
	.handler(async ({ data, context }) => {
		// const user = await getSessionFn(); 使用middleware代替
		const item = await prisma.savedItem.create({
			data: {
				url: data.url,
				userId: context.session.user.id,
				status: "PROCESSING",
			},
		});
		try {
			const result = await firecrawl.scrape(data.url, {
				formats: [
					"markdown",
					{
						type: "json",
						prompt:
							"please extract the following fields from the page: author, publishedAt",
						// schema: extractSchema, // firecrawl 还没有适配zod v4 ？
					},
				],
				onlyMainContent: true, // @default true
			});

			const jsonData = (result.json ?? {}) as Partial<
				z.infer<typeof extractSchema>
			>;

			let publishedAt = null;
			if (jsonData.publishedAt) {
				const parsed = new Date(jsonData.publishedAt); // new Date(）返回时间戳或"invalid date"
				if (!Number.isNaN(parsed.getTime())) {
					publishedAt = parsed;
				}
			}

			const updatedItem = await prisma.savedItem.update({
				where: { id: item.id },
				data: {
					title: result.metadata?.title || null,
					content: result.markdown || null,
					ogImage: result.metadata?.ogImage || null,
					author: jsonData.author || null,
					publishedAt: publishedAt,
					status: "COMPLETED",
				},
			});
			return updatedItem;
		} catch (error) {
			const failedItem = await prisma.savedItem.update({
				where: { id: item.id },
				data: {
					status: "FAILED",
				},
			});
			return failedItem;
		}
	});

export const mapUrlFn = createServerFn({ method: "POST" })
	.middleware([authFunctionMiddleware])
	.validator(bulkImportSchema)
	.handler(async ({ data }) => {
		// todo: 允许用户设置偏好 - 未来功能
		const result = await firecrawl.map(data.url, {
			limit: 25,
			search: data.search,
			location: {
				country: "US",
				languages: ["en"],
			},
		});
		return result.links;
	});

export const bulkScrapeUrlsFn = createServerFn({ method: "POST" })
	.middleware([authFunctionMiddleware])
	.validator(bulkUrlsSchema)
	.handler(async ({ data, context }) => {
		await Promise.allSettled(
			data.urls.map(async (url) => {
				const item = await prisma.savedItem.create({
					data: {
						url,
						userId: context.session.user.id,
						status: "PENDING",
					},
				});
				try {
					const result = await firecrawl.scrape(url, {
						formats: [
							"markdown",
							{
								type: "json",
								prompt:
									"please extract the following fields from the page: author, publishedAt",
								// schema: extractSchema, // firecrawl 还没有适配zod v4 ？
							},
						],
						onlyMainContent: true, // @default true
					});

					const jsonData = (result.json ?? {}) as Partial<
						z.infer<typeof extractSchema>
					>;

					let publishedAt = null;
					if (jsonData.publishedAt) {
						const parsed = new Date(jsonData.publishedAt); // new Date(）返回时间戳或"invalid date"
						if (!Number.isNaN(parsed.getTime())) {
							publishedAt = parsed;
						}
					}

					await prisma.savedItem.update({
						where: { id: item.id },
						data: {
							title: result.metadata?.title || null,
							content: result.markdown || null,
							ogImage: result.metadata?.ogImage || null,
							author: jsonData.author || null,
							publishedAt: publishedAt,
							status: "COMPLETED",
						},
					});
				} catch (error) {
					await prisma.savedItem.update({
						where: { id: item.id },
						data: {
							status: "FAILED",
						},
					});
				}
			}),
		);
	});

export const getItemsFn = createServerFn({ method: "GET" })
	.middleware([authFunctionMiddleware])
	.handler(async ({ context }) => {
		const items = await prisma.savedItem.findMany({
			where: {
				userId: context.session.user.id,
			},
			orderBy: {
				createdAt: "desc",
			},
		});

		return items;
	});

export const getItemById = createServerFn({ method: "GET" })
	.middleware([authFunctionMiddleware])
	.validator(z.object({ id: z.string() }))
	.handler(async ({ context, data }) => {
		const item = await prisma.savedItem.findUnique({
			where: {
				userId: context.session.user.id,
				id: data.id,
			},
		});

		if (!item) {
			throw notFound();
		}
		return item;
	});

export const saveSummaryAndGenerateTagsFn = createServerFn({
	method: "POST",
})
	.middleware([authFunctionMiddleware])
	.validator(
		z.object({
			id: z.string(),
			summary: z.string(),
		}),
	)
	.handler(async ({ context, data }) => {
		const hasItem = await prisma.savedItem.findUnique({
			where: {
				id: data.id,
				userId: context.session.user.id,
			},
		});
		if (!hasItem) {
			throw notFound();
		}
		const { text } = await generateText({
			model: openrouter.chat("nvidia/nemotron-3-ultra-550b-a55b:free"),
			system: `You are a helpful assistant that extracts relevant tags from content summaries.
Extract 3-5 short, relevant tags that categorize the content.
Return ONLY a comma-separated list of tags, nothing else.
Example: technology, programming, web development, javascript`,
			prompt: `Extract tags from this summary: \n\n${data.summary}`,
		});

		const tags = text
			.split(",")
			.map((tag) => tag.trim().toLowerCase())
			.filter((tag) => tag.length > 0)
			.slice(0, 5);

		const item = await prisma.savedItem.update({
			where: {
				userId: context.session.user.id,
				id: data.id,
			},
			data: {
				summary: data.summary,
				tags: tags,
			},
		});

		return item;
	});
