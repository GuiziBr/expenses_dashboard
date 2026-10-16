// @vitest-environment jsdom
import { render, screen, waitFor } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { Mail } from "lucide-react"
import { createRef } from "react"
import { FormProvider, useForm } from "react-hook-form"
import { describe, expect, it, vi } from "vitest"
import { LoginInput } from "./LoginInput"

function Harness({
	onSubmit = vi.fn(),
	children
}: {
	onSubmit?: (values: { email: string }) => void
	children: React.ReactNode
}) {
	const methods = useForm<{ email: string }>({ defaultValues: { email: "" } })
	return (
		<FormProvider {...methods}>
			<form onSubmit={methods.handleSubmit(onSubmit)}>
				{children}
				<button type="submit">Send</button>
			</form>
		</FormProvider>
	)
}

function ErrorHarness() {
	const methods = useForm<{ email: string }>({ defaultValues: { email: "" } })
	return (
		<FormProvider {...methods}>
			<form onSubmit={methods.handleSubmit(() => {})} noValidate>
				<LoginInput name="email" placeholder="Email" />
				<button
					type="button"
					onClick={() =>
						methods.setError("email", { message: "Email is invalid" })
					}
				>
					Fail
				</button>
			</form>
		</FormProvider>
	)
}

describe("LoginInput", () => {
	it("labels the input with its placeholder", () => {
		render(
			<Harness>
				<LoginInput name="email" placeholder="Email" />
			</Harness>
		)

		expect(screen.getByRole("textbox", { name: "Email" })).toHaveAttribute(
			"aria-invalid",
			"false"
		)
	})

	it("falls back to the field name as label", () => {
		render(
			<Harness>
				<LoginInput name="email" />
			</Harness>
		)

		expect(screen.getByRole("textbox", { name: "email" })).toBeInTheDocument()
	})

	it("registers the value with the form", async () => {
		const onSubmit = vi.fn()
		render(
			<Harness onSubmit={onSubmit}>
				<LoginInput name="email" placeholder="Email" />
			</Harness>
		)
		const user = userEvent.setup()

		await user.type(screen.getByRole("textbox", { name: "Email" }), "a@b.co")
		await user.click(screen.getByRole("button", { name: "Send" }))

		await waitFor(() => expect(onSubmit).toHaveBeenCalled())
		expect(onSubmit.mock.calls[0][0]).toEqual({ email: "a@b.co" })
	})

	it("renders the icon when provided", () => {
		const { container } = render(
			<Harness>
				<LoginInput name="email" icon={Mail} placeholder="Email" />
			</Harness>
		)

		expect(container.querySelector("svg")).toBeInTheDocument()
	})

	it("forwards focus and blur to the consumer handlers", async () => {
		const onFocus = vi.fn()
		const onBlur = vi.fn()
		render(
			<Harness>
				<LoginInput
					name="email"
					placeholder="Email"
					onFocus={onFocus}
					onBlur={onBlur}
				/>
			</Harness>
		)
		const user = userEvent.setup()

		await user.click(screen.getByRole("textbox", { name: "Email" }))
		await user.tab()

		expect(onFocus).toHaveBeenCalledTimes(1)
		expect(onBlur).toHaveBeenCalledTimes(1)
	})

	it("exposes the input through a forwarded ref", () => {
		const ref = createRef<HTMLInputElement>()
		render(
			<Harness>
				<LoginInput name="email" placeholder="Email" ref={ref} />
			</Harness>
		)

		expect(ref.current).toBe(screen.getByRole("textbox", { name: "Email" }))
	})

	it("supports a callback ref", () => {
		const ref = vi.fn()
		render(
			<Harness>
				<LoginInput name="email" placeholder="Email" ref={ref} />
			</Harness>
		)

		expect(ref).toHaveBeenCalledWith(
			screen.getByRole("textbox", { name: "Email" })
		)
	})

	it("shows the field error and links it to the input", async () => {
		render(<ErrorHarness />)

		await userEvent.click(screen.getByRole("button", { name: "Fail" }))

		const input = await screen.findByRole("textbox", { name: "Email" })
		expect(input).toHaveAttribute("aria-invalid", "true")
		expect(input).toHaveAttribute("aria-describedby", "email-error")
		expect(screen.getByRole("alert")).toHaveTextContent("Email is invalid")
	})
})
