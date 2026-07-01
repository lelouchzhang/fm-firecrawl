import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
// If your Prisma file is located elsewhere, you can change the path
// import { PrismaClient } from "@/generated/prisma/client";
import { tanstackStartCookies } from "better-auth/tanstack-start";
import { prisma } from "#/db";

export const auth = betterAuth({
	database: prismaAdapter(prisma, {
		provider: "postgresql", // or "mysql", "postgresql", ...etc
	}),
	emailAndPassword: {
		enabled: true,
		requireEmailVerification: false,
	},
	session: {
		cookieCache: {
			enabled: true,
			maxAge: 60, // 1 minutes
			strategy: "compact", // minimal cookie size
		},
	},
	plugins: [tanstackStartCookies()],
});
