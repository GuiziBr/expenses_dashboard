"use client"

import { CategoryForm } from "@/components/CategoryForm"
import { CategoryTable } from "@/components/CategoryTable"
import { Pagination } from "@/components/Pagination"
import { Loader } from "@/components/ui/loader"
import { translations } from "@/constants/translations"
import { useCategories } from "@/hooks/use-categories"
import { usePagedList } from "@/hooks/use-paged-list"

const DEFAULT_LIMIT = 8

export default function CategoriesManagementPage() {
	const { data, isLoading, error, pages, totalPages, currentPage, setPage } =
		usePagedList(useCategories, DEFAULT_LIMIT)

	return (
		<main className="mx-auto flex max-w-[1120px] flex-col gap-6 px-5 lg:h-full">
			<section className="rounded-xl border border-border bg-card p-6">
				<h2 className="mb-4 text-lg font-semibold text-foreground">
					{translations.management.categories}
				</h2>
				<CategoryForm />
			</section>

			{isLoading && !data && (
				<div className="flex items-center justify-center min-h-[300px]">
					<Loader size={48} />
				</div>
			)}

			{error && (
				<p className="py-12 text-center text-danger">
					{translations.common.errorLoading}
				</p>
			)}

			{data && (
				<div className="flex flex-col gap-4 animate-in fade-in duration-500 lg:min-h-[12rem]">
					{data.categories.length > 0 ? (
						<>
							<CategoryTable categories={data.categories} />
							{totalPages > 1 && (
								<Pagination
									currentPage={currentPage}
									setCurrentPage={setPage}
									pages={pages}
								/>
							)}
						</>
					) : (
						!isLoading && (
							<p className="rounded-xl border border-dashed border-border bg-card px-4 py-12 text-center text-muted-foreground">
								No categories found.
							</p>
						)
					)}
				</div>
			)}
		</main>
	)
}
