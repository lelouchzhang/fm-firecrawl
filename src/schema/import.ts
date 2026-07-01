import { z } from "zod";

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
