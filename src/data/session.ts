import { redirect } from "@tanstack/react-router";
import { createServerFn } from "@tanstack/react-start";
import { getRequestHeaders } from "@tanstack/react-start/server";
import { auth } from "#/lib/auth";

// 只在服务端运行的函数，同时能够在客户端和服务端调用。（RPC）
export const getSessionFn = createServerFn({ method: "GET" }).handler(
	async () => {
		const headers = getRequestHeaders();
		const session = await auth.api.getSession({ headers });

		if (!session) {
			throw redirect({ to: "/login" }); // useNavigator only used in client
		}

		return session;
	},
);
