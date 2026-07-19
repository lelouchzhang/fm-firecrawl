// zod 这里不能用默认导入，改成具名导入 src/schema/import.ts:1 和 src/schema/auth.ts:1 都是同样写法；在当前 tsconfig.json 下会报类型错误。
import { z } from "zod";

export const loginSchema = z.object({
	email: z.email(),
	password: z.string().min(8),
});

export const signupSchema = z.object({
	fullName: z.string().min(5),
	email: z.email(),
	password: z.string().min(8),
});

export const bulkUrlsSchema = z.object({
	urls: z.array(z.url()),
});
