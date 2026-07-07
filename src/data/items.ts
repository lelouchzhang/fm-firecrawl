import { createServerFn } from "@tanstack/react-start";
import type { z } from "zod";
import { prisma } from "#/db";
import { firecrawl } from "#/lib/firecrawl";
import { authFunctionMiddleware } from "#/middlewares/auth";
import { importSchema } from "#/schema/import";
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

			const jsonData = result.json as z.infer<typeof extractSchema>;

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

export const bulkScrapeUrlsFn = createServerFn()