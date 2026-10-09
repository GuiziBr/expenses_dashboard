// @vitest-environment jsdom
import { fireEvent, render, screen } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"
import { Pagination } from "./Pagination"

const pagesOf = (count: number) =>
	Array.from({ length: count }, (_, i) => i + 1)

describe("Pagination", () => {
	it("renders nothing for a single page", () => {
		const { container } = render(
			<Pagination currentPage={1} setCurrentPage={vi.fn()} pages={pagesOf(1)} />
		)

		expect(container).toBeEmptyDOMElement()
	})

	it("marks the current page and changes page on click", () => {
		const setCurrentPage = vi.fn()
		render(
			<Pagination
				currentPage={2}
				setCurrentPage={setCurrentPage}
				pages={pagesOf(3)}
			/>
		)

		expect(screen.getByRole("button", { name: "2" })).toHaveAttribute(
			"aria-current",
			"page"
		)
		fireEvent.click(screen.getByRole("button", { name: "3" }))
		expect(setCurrentPage).toHaveBeenCalledWith(3)
	})

	it("disables previous on the first page and next on the last", () => {
		const { rerender } = render(
			<Pagination currentPage={1} setCurrentPage={vi.fn()} pages={pagesOf(3)} />
		)
		expect(screen.getByRole("button", { name: "Previous" })).toBeDisabled()
		expect(screen.getByRole("button", { name: "Next" })).toBeEnabled()

		rerender(
			<Pagination currentPage={3} setCurrentPage={vi.fn()} pages={pagesOf(3)} />
		)
		expect(screen.getByRole("button", { name: "Next" })).toBeDisabled()
	})

	it("collapses long ranges with ellipses", () => {
		render(
			<Pagination
				currentPage={5}
				setCurrentPage={vi.fn()}
				pages={pagesOf(20)}
			/>
		)

		expect(screen.getAllByText("…")).toHaveLength(2)
		expect(screen.getByRole("button", { name: "20" })).toBeInTheDocument()
	})

	it("is pinned to the viewport bottom on desktop only", () => {
		render(
			<Pagination currentPage={1} setCurrentPage={vi.fn()} pages={pagesOf(3)} />
		)
		const nav = screen.getByRole("navigation", { name: "Pagination" })

		expect(nav).toHaveClass("lg:fixed", "lg:bottom-4")
		expect(nav).not.toHaveClass("fixed")
	})
})
