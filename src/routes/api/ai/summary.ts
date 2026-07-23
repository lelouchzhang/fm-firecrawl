import { createFileRoute } from "@tanstack/react-router";
import { streamText } from "ai";
import z from "zod";
import { openrouter } from "#/lib/open-router";
import { prisma } from "@/db";

const MAX_PROMPT_LENGTH = 20000;

const summaryRequestSchema = z.object({
	itemId: z.string().min(1),
	prompt: z.string().max(MAX_PROMPT_LENGTH).optional(),
});

export const Route = createFileRoute("/api/ai/summary")({
	server: {
		handlers: {
			POST: async ({ request, context }) => {
				const parsed = summaryRequestSchema.safeParse(await request.json());

				if (!parsed.success) {
					return new Response("Invalid request body", { status: 400 });
				}

				const { itemId } = parsed.data;

				const item = await prisma.savedItem.findUnique({
					where: {
						id: itemId,
						userId: context?.session.user.id,
					},
				});

				if (!item) {
					return new Response("Item not found", { status: 404 });
				}
				if (!item.content) {
					return new Response("Item has no content to summarize", {
						status: 422,
					});
				}

				// stream summary
				const result = streamText({
					model: openrouter.chat("nvidia/nemotron-3-ultra-550b-a55b:free"),
					system: `You are a helpful assistant that creates concise, informative summaries of web content.
Your summaries should:
- Be 2-3 paragraphs long
- Capture the main points and key takeaways
- Be written in a clear, professional tone`,
					prompt: `Please summarize the following content:\n\n${prompt}`,
				});

				//Return the stream in the format useCompletion expects
				return result.toTextStreamResponse();
			},
		},
	},
});
