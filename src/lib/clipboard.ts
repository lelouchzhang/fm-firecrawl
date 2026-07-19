import { createClientOnlyFn } from "@tanstack/react-start";
import { useCallback, useEffect, useRef, useState } from "react";

type CopyState = { status: "idle" } | { status: "copied" };

const COPY_RESET_MS = 2000;

// 导出核心功能，createClientOnlyFn表示此功能只应在client端使用
export const copyToClipboard = createClientOnlyFn(async (url: string) => {
	try {
		await navigator.clipboard.writeText(url);
		return true;
	} catch (error) {
		return false;
	}
});

// 自定义hook，目的是管理按钮状态
export function useCopyToClipboard() {
	const [state, setState] = useState<CopyState>({ status: "idle" });
	const timer = useRef<ReturnType<typeof setTimeout>>(null);

	const copy = useCallback(async (url: string) => {
		const ok = await copyToClipboard(url);
		if (ok) {
			setState({ status: "copied" });

			if (timer.current !== null) {
				clearTimeout(timer.current);
			}

			timer.current = setTimeout(() => {
				setState({ status: "idle" });
			}, COPY_RESET_MS);
		}
	}, []);

	useEffect(
		() => () => {
			if (timer.current !== null) {
				clearTimeout(timer.current);
			}
		},
		[],
	);

	return [state, copy] as const;
}
