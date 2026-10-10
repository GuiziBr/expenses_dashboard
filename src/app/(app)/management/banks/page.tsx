"use client"

import { BankForm } from "@/components/BankForm"
import { BankTable } from "@/components/BankTable"
import { Pagination } from "@/components/Pagination"
import { Loader } from "@/components/ui/loader"
import { translations } from "@/constants/translations"
import { useBanks } from "@/hooks/use-banks"
import { usePagedList } from "@/hooks/use-paged-list"

const DEFAULT_LIMIT = 8

export default function BanksManagementPage() {
	const { data, isLoading, error, pages, totalPages, currentPage, setPage } =
		usePagedList(useBanks, DEFAULT_LIMIT)

	return (
		<main className="mx-auto flex max-w-[1120px] flex-col gap-6 px-5 lg:h-full">
			<section className="rounded-xl border border-border bg-card p-6">
				<h2 className="mb-4 text-lg font-semibold text-foreground">
					{translations.management.banks}
				</h2>
				<BankForm />
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
					{data.banks.length > 0 ? (
						<>
							<BankTable banks={data.banks} />
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
								No banks found.
							</p>
						)
					)}
				</div>
			)}
		</main>
	)
}
