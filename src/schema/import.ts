import { z } from "zod";
import { ItemStatus } from "#/generated/prisma/enums";

export const importSchema = z.object({
	url: z.url(),
});

export const bulkImportSchema = z.object({
	search: z.string(),
	url: z.url(),
});

export const extractSchema = z.object({
	author: z.string().nullable(),
	publishedAt: z.string().nullable(),
});

export const itemsSearchSchema = z.object({
	q: z.string().default(""),
	status: z.union([z.literal("all"), z.enum(ItemStatus)]).default("all"),
});

export type ItemsSearch = z.infer<typeof itemsSearchSchema>;
