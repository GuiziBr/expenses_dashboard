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

type ReportType = "requester" | "partner"

const TOTAL_TONE: Record<ReportType, { text: string; soft: string }> = {
	requester: { text: "text-success", soft: "bg-success-soft" },
	partner: { text: "text-danger", soft: "bg-danger-soft" }
}

const PaymentsList = ({
	payments,
	type
}: {
	payments: ReportPayment[]
	type: ReportType
}) => (
	<>
		{payments.map((payment) => (
			<Fragment key={payment.id}>
				<tr className="border-t border-border bg-background/60">
					<th
						scope="colgroup"
						colSpan={2}
						className="px-4 py-3 text-left text-sm font-semibold text-foreground"
					>
						{payment.description}
					</th>
				</tr>
				{payment.banks.map((bank) => (
					<tr key={bank.id} className="border-t border-border">
						<td className="px-4 py-3 text-sm text-muted-foreground">
							{bank.name}
						</td>
						<td className="px-4 py-3 text-right text-sm text-foreground">
							{formatCurrency(bank.total)}
						</td>
					</tr>
				))}
				<tr
					className={cn(
						"border-t border-border font-semibold",
						TOTAL_TONE[type].soft,
						TOTAL_TONE[type].text
					)}
				>
					<td colSpan={2} className="px-4 py-3 text-right text-sm">
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
	type
}: {
	categories: ReportCategory[]
	type: ReportType
}) => (
	<>
		{categories.map((category) => (
			<tr key={category.id} className="border-t border-border">
				<td className="px-4 py-3 text-sm text-foreground">
					{category.description}
				</td>
				<td
					className={cn(
						"px-4 py-3 text-right text-sm font-semibold",
						TOTAL_TONE[type].text
					)}
				>
					{translations.dashboards.consolidated.totalPrefix}
					{formatCurrency(category.total)}
				</td>
			</tr>
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
	type: ReportType
}) => {
	const hasData =
		shareType === "payments"
			? (report.payments?.length ?? 0) > 0
			: (report.categories?.length ?? 0) > 0

	if (!hasData) return null

	return (
		<div className="min-w-0 flex-1 overflow-hidden rounded-xl border border-border bg-card">
			<table className="w-full">
				<caption className="px-4 py-3 text-center text-base font-semibold text-foreground">
					{report.name}
				</caption>
				<tbody>
					{shareType === "payments" ? (
						<PaymentsList payments={report.payments || []} type={type} />
					) : (
						<CategoriesList categories={report.categories || []} type={type} />
					)}
				</tbody>
			</table>
		</div>
	)
}

export function ReportTables({ data, shareType }: ReportTablesProps) {
	if (!data) return null

	return (
		<section className="flex flex-col justify-center gap-5 md:flex-row md:items-start">
			{data.requester && (
				<Table report={data.requester} shareType={shareType} type="requester" />
			)}
			{data.partner && (
				<Table report={data.partner} shareType={shareType} type="partner" />
			)}
		</section>
	)
}
