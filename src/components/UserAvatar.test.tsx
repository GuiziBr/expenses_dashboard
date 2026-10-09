// @vitest-environment jsdom
import { fireEvent, render } from "@testing-library/react"
import { describe, expect, it } from "vitest"
import { UserAvatar } from "./UserAvatar"

const image = (container: HTMLElement) => container.querySelector("img")

describe("UserAvatar", () => {
	it("shows the initials when there is no picture", () => {
		const { container } = render(<UserAvatar name="Ricardo Guizi" />)

		expect(container).toHaveTextContent("RG")
		expect(image(container)).not.toBeInTheDocument()
	})

	it("shows the picture when there is one", () => {
		const { container } = render(
			<UserAvatar name="Ricardo Guizi" src="https://example.com/a.png" />
		)

		expect(image(container)).toHaveAttribute("src", "https://example.com/a.png")
		expect(container).not.toHaveTextContent("RG")
	})

	it("falls back to the initials when the picture fails to load", () => {
		const { container } = render(
			<UserAvatar name="Ricardo Guizi" src="https://example.com/broken.png" />
		)

		fireEvent.error(image(container) as HTMLImageElement)

		expect(image(container)).not.toBeInTheDocument()
		expect(container).toHaveTextContent("RG")
	})

	it("tries a new picture after the previous one failed", () => {
		const { container, rerender } = render(
			<UserAvatar name="Ricardo Guizi" src="https://example.com/broken.png" />
		)
		fireEvent.error(image(container) as HTMLImageElement)

		rerender(
			<UserAvatar name="Ricardo Guizi" src="https://example.com/new.png" />
		)

		expect(image(container)).toHaveAttribute(
			"src",
			"https://example.com/new.png"
		)
	})

	it("treats a null picture as missing", () => {
		const { container } = render(<UserAvatar name="Ana" src={null} />)

		expect(container).toHaveTextContent("A")
	})
})
