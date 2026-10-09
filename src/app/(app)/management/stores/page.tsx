"use client"

import { useState } from "react"
import { Pagination } from "@/components/Pagination"
import { StoreForm } from "@/components/StoreForm"
import { StoreTable } from "@/components/StoreTable"
import { Loader } from "@/components/ui/loader"
import { translations } from "@/constants/translations"
import { useStores } from "@/hooks/use-stores"

const DEFAULT_LIMIT = 8

export default function StoresManagementPage() {
	const [params, setParams] = useState({
		offset: 0,
		limit: DEFAULT_LIMIT
	})

	const { data, isLoading, error } = useStores(params)

	const handlePageChange = (page: number) => {
		setParams((prev) => ({
			...prev,
			offset: (page - 1) * prev.limit
		}))
	}

	const totalPages = data ? Math.ceil(data.totalCount / params.limit) : 0
	const pages = Array.from({ length: totalPages }, (_, i) => i + 1)
	const currentPage = Math.floor(params.offset / params.limit) + 1

	return (
		<main className="mx-auto flex max-w-[1120px] flex-col gap-6 px-5">
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
				<div className="animate-in fade-in duration-500">
					{data.stores.length > 0 ? (
						<>
							<StoreTable stores={data.stores} />
							{totalPages > 1 && (
								<div className="mt-4">
									<Pagination
										currentPage={currentPage}
										setCurrentPage={handlePageChange}
										pages={pages}
									/>
								</div>
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
