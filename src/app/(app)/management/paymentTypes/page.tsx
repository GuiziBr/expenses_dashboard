"use client"

import { Pagination } from "@/components/Pagination"
import { PaymentTypeForm } from "@/components/PaymentTypeForm"
import { PaymentTypeTable } from "@/components/PaymentTypeTable"
import { Loader } from "@/components/ui/loader"
import { translations } from "@/constants/translations"
import { usePagedList } from "@/hooks/use-paged-list"
import { usePaymentTypes } from "@/hooks/use-payment-types"

const DEFAULT_LIMIT = 8

export default function PaymentTypesManagementPage() {
	const { data, isLoading, error, pages, totalPages, currentPage, setPage } =
		usePagedList(usePaymentTypes, DEFAULT_LIMIT)

	return (
		<main className="mx-auto flex max-w-[1120px] flex-col gap-6 px-5 lg:h-full">
			<section className="rounded-xl border border-border bg-card p-6">
				<h2 className="mb-4 text-lg font-semibold text-foreground">
					{translations.management.paymentTypes}
				</h2>
				<PaymentTypeForm />
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
					{data.paymentTypes.length > 0 ? (
						<>
							<PaymentTypeTable paymentTypes={data.paymentTypes} />
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
								No payment types found.
							</p>
						)
					)}
				</div>
			)}
		</main>
	)
}
