import { redirect } from "@tanstack/react-router";
import { createMiddleware } from "@tanstack/react-start";
import { auth } from "#/lib/auth";

// 手动在server函数下链式调用
export const authFunctionMiddleware = createMiddleware({
	type: "function",
}).server(async ({ next }) => {
	const { getRequestHeaders } = await import("@tanstack/react-start/server");
	const headers = getRequestHeaders();
	const session = await auth.api.getSession({ headers });

	if (!session) {
		throw redirect({ to: "/login" });
	}

	return next({ context: { session } }); // context.session.user.id 取用
});

// 全局守卫
export const authMiddleware = createMiddleware({ type: "request" }).server(
	async ({ next, request }) => {
		const url = new URL(request.url);

		if (
			!url.pathname.startsWith("/dashboard") &&
			!url.pathname.startsWith("/api/ai")
		) {
			return next();
		}

		const { getRequestHeaders } = await import("@tanstack/react-start/server");
		const headers = getRequestHeaders();
		const session = await auth.api.getSession({ headers });

		if (!session) {
			throw redirect({ to: "/login" });
		}

		return next({ context: { session } });
	},
);
