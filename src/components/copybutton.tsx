import { Check, Copy } from "lucide-react";
import { useCopyToClipboard } from "#/lib/clipboard";
import { Button } from "./ui/button";

export function CopyButton({ url }: { url: string }) {
	const [copyState, copy] = useCopyToClipboard();
	return (
		<Button
			variant="outline"
			size="icon"
			className="size-8"
			onClick={async (e) => {
				e.preventDefault();
				await copy(url);
			}}
		>
			{copyState.status === "copied" ? (
				<Check className="size-4 text-green-600" />
			) : (
				<Copy className="size-4" />
			)}
		</Button>
	);
}
