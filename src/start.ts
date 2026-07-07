// src/start.ts 全局中间件在这里引入
import { createMiddleware, createStart } from "@tanstack/react-start";
import { authMiddleware } from "./middlewares/auth";

const logMiddleware = createMiddleware({ type: "request" }).server(
	({ request, next }) => {
		const url = new URL(request.url);
		console.log(`[${request.method}] - ${url.pathname}`);
		return next();
	},
);

export const startInstance = createStart(() => {
	return {
		requestMiddleware: [logMiddleware, authMiddleware],
	};
});
