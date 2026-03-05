"use client"

import { translations } from "@/constants/translations"
import type { FormattedBank } from "@/types/expenses"

interface BankTableProps {
	banks: FormattedBank[]
}

export function BankTable({ banks }: BankTableProps) {
	return (
		<div className="mt-8 w-full min-h-[20rem]">
			<table className="w-full border-separate border-spacing-y-2 table-fixed">
				<thead>
					<tr>
						<th className="text-left py-2 px-1 md:px-2 text-light-gray font-normal text-sm md:text-xl pl-2 w-[40%]">
							{translations.management.bankColumn}
						</th>
						<th className="text-left py-2 px-1 md:px-2 text-light-gray font-normal text-sm md:text-xl w-[30%]">
							{translations.management.createdColumn}
						</th>
						<th className="text-left py-2 px-1 md:px-2 text-light-gray font-normal text-sm md:text-xl w-[30%]">
							{translations.management.updatedColumn}
						</th>
					</tr>
				</thead>
				<tbody className="w-full">
					{banks.map((bank) => (
						<tr key={bank.id} className="group">
							<td
								className="bg-white py-5 px-1 md:px-2 text-blue-wood first:rounded-l-lg pl-2 truncate md:text-base"
								title={bank.name}
							>
								{bank.name}
							</td>
							<td className="bg-white py-5 px-1 md:px-2 text-light-gray md:text-base">
								{bank.formattedCreatedAt}
							</td>
							<td className="bg-white py-5 px-1 md:px-2 text-light-gray last:rounded-r-lg md:text-base">
								{bank.formattedUpdatedAt}
							</td>
						</tr>
					))}
				</tbody>
			</table>
		</div>
	)
}
