"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { Lock, Mail } from "lucide-react"
import Image from "next/image"
import { FormProvider, useForm } from "react-hook-form"
import { toast } from "sonner"
import * as z from "zod"
import { LoginInput } from "@/components/LoginInput"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/contexts/auth-context"
import logo from "../../public/assets/images/logo.svg"
import background from "../../public/assets/images/sign-in-background.jpg"

// Validation Schema
const signInSchema = z.object({
	email: z.email("E-mail is required").min(1, "E-mail is required"),
	password: z.string().min(1, "Password is required")
})

type SignInFormData = z.infer<typeof signInSchema>

export default function Home() {
	const { signIn, isLoading } = useAuth()
	const methods = useForm<SignInFormData>({
		resolver: zodResolver(signInSchema)
	})

	if (isLoading) {
		return null // Or a more elaborate loading spinner if desired
	}

	const {
		handleSubmit,
		formState: { isSubmitting }
	} = methods

	const handleSignIn = async (data: SignInFormData) => {
		try {
			await signIn(data)
			toast.success("Successfully logged in!")
		} catch {
			toast.error("Invalid email or password. Please try again.")
		}
	}

	return (
		<main className="min-h-screen flex items-stretch">
			{/* Content Section */}
			<section className="flex flex-col justify-center items-center w-full max-w-[700px] bg-background p-8">
				<div className="flex flex-col items-center animate-in fade-in slide-in-from-left-8 duration-500 w-full max-w-[340px]">
					<header className="mb-12">
						<Image
							src={logo}
							alt="Expenses Logo"
							width={180}
							height={40}
							priority
						/>
					</header>

					<FormProvider {...methods}>
						<form
							onSubmit={handleSubmit(handleSignIn)}
							className="flex flex-col gap-2 w-full text-center"
						>
							<h1 className="mb-6 text-[2em] font-semibold">Expenses Portal</h1>

							<LoginInput
								name="email"
								icon={Mail}
								placeholder="E-mail"
								autoComplete="email"
							/>

							<LoginInput
								name="password"
								icon={Lock}
								type="password"
								placeholder="Password"
								autoComplete="current-password"
							/>

							<Button
								type="submit"
								className="w-full h-14 mt-4 bg-light-orange hover:bg-light-orange hover:brightness-75 transition-[filter] duration-200 text-background font-medium rounded-[0.3rem] border-0"
								disabled={isSubmitting}
							>
								{isSubmitting ? "Signing in..." : "Sign In"}
							</Button>
						</form>
					</FormProvider>
				</div>
			</section>

			{/* Background Image Section */}
			<div
				className="hidden lg:flex flex-1 relative bg-background"
				aria-hidden="true"
			>
				{/* Background Image */}
				<div className="absolute inset-0">
					<Image
						src={background}
						alt=""
						fill
						sizes="(min-width: 1024px) 50vw, 0vw"
						className="object-cover"
						priority
					/>
					{/* Overlay */}
					<div className="absolute inset-0 backdrop-blur-[2px]" />
				</div>
			</div>
		</main>
	)
}
