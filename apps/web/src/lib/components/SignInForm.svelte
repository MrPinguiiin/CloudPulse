<script lang="ts">
	import { createForm } from "@tanstack/svelte-form";
	import { z } from "zod";
	import { authClient } from "$lib/auth-client";
	import { goto } from "$app/navigation";
	import Button from "$lib/components/ui/button.svelte";
	import Input from "$lib/components/ui/input.svelte";
	import Label from "$lib/components/ui/label.svelte";
	import Card from "$lib/components/ui/card.svelte";
	import CardHeader from "$lib/components/ui/card-header.svelte";
	import CardTitle from "$lib/components/ui/card-title.svelte";
	import CardDescription from "$lib/components/ui/card-description.svelte";
	import CardContent from "$lib/components/ui/card-content.svelte";
	import CardFooter from "$lib/components/ui/card-footer.svelte";
	import { Activity } from "lucide-svelte";

	let { switchToSignUp } = $props<{ switchToSignUp: () => void }>();

	const validationSchema = z.object({
		email: z.email("Invalid email address"),
		password: z.string().min(1, "Password is required"),
	});

	let errorMessage = $state("");

	const form = createForm(() => ({
		defaultValues: { email: "", password: "" },
		onSubmit: async ({ value }) => {
			errorMessage = "";
			await authClient.signIn.email(
				{ email: value.email, password: value.password },
				{
					onSuccess: () => goto("/dashboard"),
					onError: (ctx) => {
						errorMessage = ctx.error.message || "Sign in failed. Please try again.";
					},
				},
			);
		},
		validators: {
			onSubmit: validationSchema,
		},
	}));

	type SubmitState = Pick<typeof form.state, "canSubmit" | "isSubmitting">;
</script>

<div class="flex min-h-screen items-center justify-center px-4 py-12">
	<div class="w-full max-w-sm">
		<div class="mb-6 flex flex-col items-center gap-2">
			<a href="/" class="flex items-center gap-2">
				<div class="flex size-8 items-center justify-center rounded-lg bg-primary">
					<Activity class="size-4 text-primary-foreground" />
				</div>
				<span class="font-semibold">CloudPulse</span>
			</a>
		</div>

		<Card>
			<CardHeader class="text-center">
				<CardTitle>Welcome Back</CardTitle>
				<CardDescription>
					Sign in to your monitoring dashboard
				</CardDescription>
			</CardHeader>
			<CardContent>
				<form
					class="space-y-4"
					onsubmit={(e) => {
						e.preventDefault();
						e.stopPropagation();
						form.handleSubmit();
					}}
				>
					<form.Field name="email">
						{#snippet children(field)}
							<div class="space-y-2">
								<Label for={field.name}>Email</Label>
								<Input
									id={field.name}
									name={field.name}
									type="email"
									placeholder="name@example.com"
									value={field.state.value}
									oninput={(e: Event) => field.handleChange((e.target as HTMLInputElement).value)}
									onblur={field.handleBlur}
								/>
								{#if field.state.meta.isTouched && field.state.meta.errors.length > 0}
									<p class="text-xs text-destructive">
										{field.state.meta.errors[0]}
									</p>
								{/if}
							</div>
						{/snippet}
					</form.Field>

					<form.Field name="password">
						{#snippet children(field)}
							<div class="space-y-2">
								<Label for={field.name}>Password</Label>
								<Input
									id={field.name}
									name={field.name}
									type="password"
									placeholder="Enter your password"
									value={field.state.value}
									oninput={(e: Event) => field.handleChange((e.target as HTMLInputElement).value)}
									onblur={field.handleBlur}
								/>
								{#if field.state.meta.isTouched && field.state.meta.errors.length > 0}
									<p class="text-xs text-destructive">
										{field.state.meta.errors[0]}
									</p>
								{/if}
							</div>
						{/snippet}
					</form.Field>

					{#if errorMessage}
						<p class="text-xs text-destructive text-center">{errorMessage}</p>
					{/if}

					<form.Subscribe selector={(state) => ({ canSubmit: state.canSubmit, isSubmitting: state.isSubmitting })}>
						{#snippet children(state: SubmitState)}
							<Button type="submit" class="w-full" disabled={!state.canSubmit || state.isSubmitting}>
								{state.isSubmitting ? "Signing in..." : "Sign In"}
							</Button>
						{/snippet}
					</form.Subscribe>
				</form>
			</CardContent>
			<CardFooter class="justify-center">
				<p class="text-sm text-muted-foreground">
					Don't have an account?{" "}
					<button type="button" class="text-primary underline-offset-4 hover:underline" onclick={switchToSignUp}>
						Sign up
					</button>
				</p>
			</CardFooter>
		</Card>
	</div>
</div>
