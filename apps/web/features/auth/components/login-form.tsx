"use client";

import { useForm } from "@tanstack/react-form";
import { useMutation } from "@tanstack/react-query";
import { Button } from "@workspace/ui/components/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@workspace/ui/components/card";
import {
	Field,
	FieldError,
	FieldGroup,
	FieldLabel,
} from "@workspace/ui/components/field";
import { Input } from "@workspace/ui/components/input";
import { cn } from "@workspace/ui/lib/utils";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type * as React from "react";
import { api } from "@/lib/eden";
import { type LoginInput, loginSchema } from "@/shared/schemas/auth";
import { useAuthStore } from "../auth-store";

export function LoginForm({
	className,
	...props
}: React.ComponentProps<"div">) {
	const router = useRouter();
	const { setToken } = useAuthStore();
	const { mutate, isPending } = useMutation({
		mutationFn: async (data: LoginInput) => {
			return await api.auth.login.post({
				email: data.email,
				password: data.password,
			});
		},
		onSuccess: ({ data }) => {
			if (data?.token) {
				setToken(data.token);
				router.push("/app/dashboard");
			}
		},
		onError: (error) => {},
	});

	const form = useForm({
		defaultValues: {
			email: "",
			password: "",
		},
		validators: {
			onSubmit: loginSchema,
		},
		onSubmit: async ({ value }) => {
			mutate(value);
		},
	});

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
												disabled={isPending}
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
												disabled={isPending}
											/>
											{isInvalid && (
												<FieldError errors={field.state.meta.errors} />
											)}
										</Field>
									);
								}}
							/>
							<Button type="submit" className="w-full" disabled={isPending}>
								{isPending ? "Đang đăng nhập..." : "Đăng nhập"}
							</Button>
						</FieldGroup>
					</form>
				</CardContent>
			</Card>
		</div>
	);
}
