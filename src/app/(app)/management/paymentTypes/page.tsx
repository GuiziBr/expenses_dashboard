"use client"

import { useState } from "react"
import { Pagination } from "@/components/Pagination"
import { PaymentTypeForm } from "@/components/PaymentTypeForm"
import { PaymentTypeTable } from "@/components/PaymentTypeTable"
import { Loader } from "@/components/ui/loader"
import { translations } from "@/constants/translations"
import { usePaymentTypes } from "@/hooks/use-payment-types"

const DEFAULT_LIMIT = 8

export default function PaymentTypesManagementPage() {
	const [params, setParams] = useState({
		offset: 0,
		limit: DEFAULT_LIMIT
	})

	const { data, isLoading, error } = usePaymentTypes(params)

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
				<div className="flex flex-col gap-4 animate-in fade-in duration-500">
					{data.paymentTypes.length > 0 ? (
						<>
							<PaymentTypeTable paymentTypes={data.paymentTypes} />
							{totalPages > 1 && (
								<Pagination
									currentPage={currentPage}
									setCurrentPage={handlePageChange}
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
