"use client";

import { useForm } from "@tanstack/react-form";
import Link from "next/link";
import { redirect } from "next/navigation";
import type * as React from "react";
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
	FieldError,
	FieldGroup,
	FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { loginSchema } from "@/shared/schemas/auth";
import { useAuth } from "../hooks/use-auth";

export function LoginForm({
	className,
	...props
}: React.ComponentProps<"div">) {
	const { me, isMeLoading, login, isLoggingIn } = useAuth();

	const form = useForm({
		defaultValues: {
			email: "",
			password: "",
		},
		validators: {
			onSubmit: loginSchema,
		},
		onSubmit: async ({ value }) => {
			login(value);
		},
	});

	if (!isMeLoading && me) {
		return redirect("/app/dashboard");
	}

	return (
		<div className={cn("flex flex-col gap-6", className)} {...props}>
			<Card>
				<CardHeader>
					<CardTitle>Đăng nhập</CardTitle>
					<CardDescription>
						Nhập email và mật khẩu của bạn để đăng nhập
					</CardDescription>
				</CardHeader>
				<CardContent>
					<form
						onSubmit={(e) => {
							e.preventDefault();
							e.stopPropagation();
							form.handleSubmit();
						}}
					>
						<FieldGroup>
							<form.Field
								name="email"
								children={(field) => {
									const isInvalid =
										field.state.meta.isTouched &&
										field.state.meta.errors.length > 0;
									return (
										<Field data-invalid={isInvalid}>
											<FieldLabel htmlFor={field.name}>Email</FieldLabel>
											<Input
												id={field.name}
												name={field.name}
												value={field.state.value}
												onBlur={field.handleBlur}
												onChange={(e) => field.handleChange(e.target.value)}
												type="email"
												placeholder="m@example.com"
												aria-invalid={isInvalid}
												disabled={isLoggingIn}
											/>
											{isInvalid && (
												<FieldError errors={field.state.meta.errors} />
											)}
										</Field>
									);
								}}
							/>
							<form.Field
								name="password"
								children={(field) => {
									const isInvalid =
										field.state.meta.isTouched &&
										field.state.meta.errors.length > 0;
									return (
										<Field data-invalid={isInvalid}>
											<div className="flex items-center">
												<FieldLabel htmlFor={field.name}>Mật khẩu</FieldLabel>
												<Link
													href="/forgot-password"
													className="ml-auto inline-block text-sm underline-offset-4 hover:underline"
												>
													Quên mật khẩu?
												</Link>
											</div>
											<Input
												id={field.name}
												name={field.name}
												value={field.state.value}
												onBlur={field.handleBlur}
												onChange={(e) => field.handleChange(e.target.value)}
												type="password"
												aria-invalid={isInvalid}
												disabled={isLoggingIn}
											/>
											{isInvalid && (
												<FieldError errors={field.state.meta.errors} />
											)}
										</Field>
									);
								}}
							/>
							<Button type="submit" className="w-full" disabled={isLoggingIn}>
								{isLoggingIn ? "Đang đăng nhập..." : "Đăng nhập"}
							</Button>
						</FieldGroup>
					</form>
				</CardContent>
			</Card>
		</div>
	);
}
