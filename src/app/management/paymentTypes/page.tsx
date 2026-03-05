"use client"

import { useState } from "react"
import { Header } from "@/components/Header"
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
		<div className="min-h-screen bg-background">
			<div className="bg-[var(--light-blue)] pb-32">
				<Header />
			</div>

			<main className="max-w-[1120px] mx-auto px-5 -mt-24">
				<section className="bg-white/5 rounded-lg border border-white/10 p-6 mb-8 backdrop-blur-sm shadow-xl">
					<h2 className="text-2xl font-bold text-white mb-6">
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
					<p className="text-center text-red py-12">
						{translations.common.errorLoading}
					</p>
				)}

				{data && (
					<div className="animate-in fade-in duration-500">
						{data.paymentTypes.length > 0 ? (
							<>
								<PaymentTypeTable paymentTypes={data.paymentTypes} />
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
								<p className="text-center text-muted-foreground mt-12 py-12 px-4 bg-white/5 rounded-lg border border-dashed border-white/10">
									No payment types found.
								</p>
							)
						)}
					</div>
				)}
			</main>
		</div>
	)
}
