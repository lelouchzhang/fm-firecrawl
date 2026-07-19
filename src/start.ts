// src/start.ts 全局中间件在这里引入
import {
	createCsrfMiddleware,
	createMiddleware,
	createStart,
} from "@tanstack/react-start";
import { authMiddleware } from "./middlewares/auth";

// const logMiddleware = createMiddleware({ type: "request" }).server(
// 	({ request, next }) => {
// 		const url = new URL(request.url);
// 		console.log(`[${request.method}] - ${url.pathname}`);
// 		return next();
// 	},
// );

const csrfMiddleware = createCsrfMiddleware({
	filter: (ctx) => ctx.handlerType === "serverFn",
});

export const startInstance = createStart(() => {
	return {
		requestMiddleware: [csrfMiddleware, authMiddleware],
	};
});
