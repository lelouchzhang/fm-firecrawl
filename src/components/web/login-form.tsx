import { Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import {
	Field,
	FieldDescription,
	FieldGroup,
	FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
export function LoginForm() {
	return (
		<Card className="w-full max-w-md">
			<CardHeader>
				<CardTitle>Login to your account</CardTitle>
				<CardDescription>
					Enter your email below to login to your account
				</CardDescription>
			</CardHeader>
			<CardContent>
				<form>
					<FieldGroup>
						<Field>
							<FieldLabel htmlFor="email">Email</FieldLabel>
							<Input
								id="email"
								type="email"
								placeholder="m@example.com"
								required
							/>
						</Field>
						<Field>
							<div className="flex items-center">
								<FieldLabel htmlFor="password">Password</FieldLabel>
							</div>
							<Input id="password" type="password" required />
						</Field>
						<Field>
							<Button type="submit">Login</Button>
							<FieldDescription className="text-center">
								Don&apos;t have an account? <Link to="/signup">Sign up</Link>
							</FieldDescription>
						</Field>
					</FieldGroup>
				</form>
			</CardContent>
		</Card>
	);
}
