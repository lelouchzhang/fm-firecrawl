import { createClientOnlyFn } from "@tanstack/react-start";

export const copyToClipboard = createClientOnlyFn(async (url: string) => {
	try {
		await navigator.clipboard.writeText(url);
		return true;
	} catch (error) {}
});
