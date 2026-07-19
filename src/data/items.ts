import { createServerFn } from "@tanstack/react-start";
import type { z } from "zod";
import { prisma } from "#/db";
import { firecrawl } from "#/lib/firecrawl";
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
