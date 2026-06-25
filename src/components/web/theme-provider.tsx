import { ScriptOnce } from "@tanstack/react-router";
import { createContext, useContext, useEffect, useState } from "react";

type Theme = "dark" | "light" | "system";

type ThemeProviderProps = {
	children: React.ReactNode;
	defaultTheme?: Theme;
	storageKey?: string;
};

type ThemeProviderState = {
	theme: Theme;
	setTheme: (theme: Theme) => void;
};

// 生成一段立即执行函数（IIFE）的字符串脚本，用于在页面首次渲染（SSR/SSG 阶段）时尽早从 localStorage 读取主题设置，若无效则使用默认值，并根据系统偏好解析出最终 light/dark，立即写入 <html> 的 class 和 style.colorScheme，防止白屏或闪烁。
function getThemeScript(storageKey: string, defaultTheme: Theme) {
	const key = JSON.stringify(storageKey);
	const fallback = JSON.stringify(defaultTheme);

	return `(function(){try{var t=localStorage.getItem(${key});if(t!=='light'&&t!=='dark'&&t!=='system'){t=${fallback}}var d=matchMedia('(prefers-color-scheme: dark)').matches;var r=t==='system'?(d?'dark':'light'):t;var e=document.documentElement;e.classList.add(r);e.style.colorScheme=r}catch(e){}})();`;
}

const ThemeProviderContext = createContext<ThemeProviderState>({
	theme: "system",
	setTheme: () => {},
});

// 在客户端运行时，移除 <html> 根元素上的 light/dark 类名，根据传入主题（system 时检测 prefers-color-scheme: dark）解析出最终 light/dark，重新添加对应类名并设置 style.colorScheme，即时切换页面明暗模式。
function applyTheme(theme: Theme) {
	const root = document.documentElement;
	root.classList.remove("light", "dark");

	const resolved =
		theme === "system"
			? window.matchMedia("(prefers-color-scheme: dark)").matches
				? "dark"
				: "light"
			: theme;

	root.classList.add(resolved);
	root.style.colorScheme = resolved;
}

// 提供主题上下文，管理主题状态。组件挂载后从 localStorage 恢复主题；通过 ScriptOnce 在服务端/首屏注入脚本避免闪烁；监听主题变化调用 applyTheme 更新 DOM；当主题为 system 时监听系统配色变化自动切换；向子组件暴露 theme 和 setTheme。
export function ThemeProvider({
	children,
	defaultTheme = "system",
	storageKey = "theme",
}: ThemeProviderProps) {
	const [theme, setThemeState] = useState<Theme>(defaultTheme);
	const [mounted, setMounted] = useState(false);

	useEffect(() => {
		const stored = localStorage.getItem(storageKey);
		setThemeState(
			stored === "light" || stored === "dark" || stored === "system"
				? stored
				: defaultTheme,
		);
		setMounted(true);
	}, [defaultTheme, storageKey]);

	useEffect(() => {
		if (!mounted) return;
		applyTheme(theme);
	}, [theme, mounted]);

	useEffect(() => {
		if (!mounted || theme !== "system") return;

		const media = window.matchMedia("(prefers-color-scheme: dark)");
		const onChange = () => applyTheme("system");
		media.addEventListener("change", onChange);
		return () => media.removeEventListener("change", onChange);
	}, [theme, mounted]);

	const setTheme = (next: Theme) => {
		localStorage.setItem(storageKey, next);
		setThemeState(next);
	};

	return (
		<ThemeProviderContext value={{ theme, setTheme }}>
			<ScriptOnce>{getThemeScript(storageKey, defaultTheme)}</ScriptOnce>
			{children}
		</ThemeProviderContext>
	);
}

// 消费 ThemeProviderContext，返回当前主题状态及设置函数；若不在 ThemeProvider 内则抛出错误，确保 hook 在正确上下文中使用。
export function useTheme() {
	const context = useContext(ThemeProviderContext);
	if (context === undefined)
		throw new Error("useTheme must be used within a ThemeProvider");
	return context;
}
