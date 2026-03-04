import { Fragment } from "react"
import { translations } from "@/constants/translations"
import { formatCurrency } from "@/lib/format-currency"
import { cn } from "@/lib/utils"
import type {
	ConsolidatedReport,
	ReportCategory,
	ReportPayment,
	SharedReport
} from "@/types/expenses"

interface ReportTablesProps {
	data?: SharedReport
	shareType: string
}

const PaymentsList = ({
	payments,
	className
}: {
	payments: ReportPayment[]
	className: string
}) => (
	<>
		{payments.map((payment) => (
			<Fragment key={payment.id}>
				<tr>
					<td
						className="py-3 px-4 text-[var(--blue-wood)] font-normal text-center bg-white rounded-md mb-2"
						colSpan={2}
					>
						{payment.description}
					</td>
				</tr>
				{payment.banks.map((bank) => (
					<tr key={bank.id} className="border-spacing-0">
						<td className="py-4 px-2 text-[var(--light-gray)] bg-white rounded-l-md text-center border-r">
							{bank.name}
						</td>
						<td className="py-4 px-2 text-[var(--light-gray)] bg-white rounded-r-md text-center">
							{formatCurrency(bank.total)}
						</td>
					</tr>
				))}
				<tr>
					<td
						className={cn(
							"py-4 px-2 bg-[var(--cleared-blue)] rounded-md font-medium text-center",
							className
						)}
						colSpan={2}
					>
						{translations.dashboards.consolidated.totalPrefix}
						{formatCurrency(payment.total)}
					</td>
				</tr>
			</Fragment>
		))}
	</>
)

const CategoriesList = ({
	categories,
	className
}: {
	categories: ReportCategory[]
	className: string
}) => (
	<>
		{categories.map((category) => (
			<Fragment key={category.id}>
				<tr>
					<td className="py-4 px-2 text-[var(--blue-wood)] bg-white rounded-l-md text-center border-r">
						{category.description}
					</td>
					<td
						className={cn(
							"py-4 px-2 bg-[var(--cleared-blue)] rounded-r-md font-medium text-center",
							className
						)}
					>
						{translations.dashboards.consolidated.totalPrefix}
						{formatCurrency(category.total)}
					</td>
				</tr>
			</Fragment>
		))}
	</>
)

const Table = ({
	report,
	shareType,
	type
}: {
	report: ConsolidatedReport
	shareType: string
	type: "requester" | "partner"
}) => {
	const className =
		type === "requester"
			? "text-[var(--green)] font-normal"
			: "text-[var(--red)] font-normal"
	const hasData =
		shareType === "payments"
			? (report.payments?.length ?? 0) > 0
			: (report.categories?.length ?? 0) > 0

	if (!hasData) return null

	return (
		<div className="flex-1 min-w-0">
			<table className="w-full border-separate border-spacing-y-2">
				<thead>
					<tr>
						<th
							colSpan={2}
							className="text-[var(--light-gray)] font-normal text-xl pb-2 text-center"
						>
							{report.name}
						</th>
					</tr>
				</thead>
				<tbody>
					{shareType === "payments" ? (
						<PaymentsList
							payments={report.payments || []}
							className={className}
						/>
					) : (
						<CategoriesList
							categories={report.categories || []}
							className={className}
						/>
					)}
				</tbody>
			</table>
		</div>
	)
}

export function ReportTables({ data, shareType }: ReportTablesProps) {
	if (!data) return null

	return (
		<section className="mt-8 flex flex-col md:flex-row gap-8 justify-center">
			{data.requester && (
				<Table report={data.requester} shareType={shareType} type="requester" />
			)}
			{data.partner && (
				<Table report={data.partner} shareType={shareType} type="partner" />
			)}
		</section>
	)
}
