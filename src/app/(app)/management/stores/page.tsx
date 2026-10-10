"use client"

import { Pagination } from "@/components/Pagination"
import { StoreForm } from "@/components/StoreForm"
import { StoreTable } from "@/components/StoreTable"
import { Loader } from "@/components/ui/loader"
import { translations } from "@/constants/translations"
import { usePagedList } from "@/hooks/use-paged-list"
import { useStores } from "@/hooks/use-stores"

const DEFAULT_LIMIT = 8

export default function StoresManagementPage() {
	const { data, isLoading, error, pages, totalPages, currentPage, setPage } =
		usePagedList(useStores, DEFAULT_LIMIT)

	return (
		<main className="mx-auto flex max-w-[1120px] flex-col gap-3 px-5 lg:h-full">
			<section className="rounded-xl border border-border bg-card p-6">
				<h2 className="mb-4 text-lg font-semibold text-foreground">
					{translations.management.stores}
				</h2>
				<StoreForm />
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
					{data.stores.length > 0 ? (
						<>
							<StoreTable stores={data.stores} />
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
								No stores found.
							</p>
						)
					)}
				</div>
			)}
		</main>
	)
}
