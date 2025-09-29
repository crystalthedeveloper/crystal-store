// src/ui/login-form.tsx
"use client";
import Link from "next/link"; // ✅ Add this import
import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { login } from "@/lib/auth";
import { cn } from "@/lib/utils";

export function LoginForm({ className, ...props }: React.ComponentPropsWithoutRef<"div">) {
	const [state, action] = useActionState(login, {});

	return (
		<div className={cn("flex flex-col gap-6", className)} {...props}>
			<Card>
				<CardHeader>
					<CardTitle className="text-2xl">Login</CardTitle>
					<CardDescription>Enter your email below to login to your account</CardDescription>
				</CardHeader>
				<CardContent>
					<form action={action} className="grid gap-6">
						<div className="grid gap-2">
							<Label htmlFor="email">Email</Label>
							<Input id="email" name="email" type="email" placeholder="m@example.com" required />
						</div>
						<div className="grid gap-2">
							<Label htmlFor="password">Password</Label>
							<Input id="password" name="password" type="password" required />
						</div>

						{/* 🔴 Show error message if login fails */}
						{state?.error && <p className="text-sm text-red-500">{state.error}</p>}

						<Button type="submit" className="w-full">
							Login
						</Button>
					</form>

					{/* ✅ Add signup button below login */}
					<div className="mt-4 text-center">
						<Link href="https://www.crystalthedeveloper.ca/user-pages/signup" passHref>
							<Button variant="outline" className="w-full">
								Sign Up
							</Button>
						</Link>
					</div>
				</CardContent>
			</Card>

			<div className="text-balance text-center text-xs text-muted-foreground [&_a]:underline [&_a]:underline-offset-4 hover:[&_a]:text-primary">
				By clicking continue, you agree to our{" "}
				<a href="https://www.crystalthedeveloper.ca/legal/terms-of-service">Terms of Service</a> and{" "}
				<a href="https://www.crystalthedeveloper.ca/legal/privacy-cookies">Privacy Policy</a>.
			</div>
		</div>
	);
}
