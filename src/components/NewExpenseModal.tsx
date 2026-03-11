"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { Info, Loader2 } from "lucide-react"
import * as React from "react"
import { useForm } from "react-hook-form"
import { HiOutlineCurrencyDollar, HiOutlineSelector } from "react-icons/hi"
import { IoMdCheckboxOutline } from "react-icons/io"
import { MdDateRange, MdTitle } from "react-icons/md"
import { toast } from "sonner"
import { translations } from "@/constants/translations"
import { useCreateExpense, useUpdateExpense } from "@/hooks/use-expenses"
import { useFilterValues } from "@/hooks/use-filter-values"
import { formatAmount } from "@/lib/format-expense"
import {
	type NewExpenseFormValues,
	newExpenseSchema
} from "@/lib/schemas/new-expense-schema"
import type { FormattedExpense } from "@/types/expenses"
import { Button } from "./ui/button"
import { CheckboxGroup } from "./ui/checkbox-group"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./ui/dialog"
import { Input } from "./ui/input"
import { Select } from "./ui/select"

interface NewExpenseModalProps {
	isOpen: boolean
	onClose: () => void
	expense?: FormattedExpense
}

export function NewExpenseModal({
	isOpen,
	onClose,
	expense
}: NewExpenseModalProps) {
	const isEditing = !!expense

	const { mutate: createExpense, isPending: isCreating } = useCreateExpense()
	const { mutate: updateExpense, isPending: isUpdating } = useUpdateExpense()
	const isPending = isEditing ? isUpdating : isCreating

	const { data: categories = [] } = useFilterValues("categories")
	const { data: paymentTypes = [] } = useFilterValues("paymentType")
	const { data: banks = [] } = useFilterValues("banks")
	const { data: stores = [] } = useFilterValues("stores")

	const schema = React.useMemo(() => {
		return newExpenseSchema.refine(
			(data) => {
				const selectedPT = paymentTypes.find((pt) => pt.id === data.paymentType)
				if (selectedPT?.has_statement && !data.bank) return false
				return true
			},
			{
				message: translations.createExpense.bankRequired,
				path: ["bank"]
			}
		)
	}, [paymentTypes])

	const buildDefaultValues = React.useCallback(
		(exp?: FormattedExpense): NewExpenseFormValues => {
			if (!exp) {
				return {
					description: "",
					category: "",
					paymentType: "",
					bank: "",
					store: "",
					date: "",
					amount: "",
					options: []
				}
			}
			return {
				description: exp.description,
				category: exp.categoryId,
				paymentType: exp.paymentTypeId,
				bank: exp.bankId ?? "",
				store: exp.storeId ?? "",
				date: exp.date.substring(0, 10),
				amount: ((exp.split ? exp.amount * 2 : exp.amount) / 100).toFixed(2),
				options: [
					...(exp.personal ? ["personal"] : []),
					...(exp.split ? ["split"] : [])
				]
			}
		},
		[]
	)

	const form = useForm<NewExpenseFormValues>({
		resolver: zodResolver(schema),
		mode: "onSubmit",
		defaultValues: buildDefaultValues(expense)
	})

	const {
		register,
		handleSubmit,
		formState: { errors },
		watch,
		setValue,
		reset
	} = form

	// Reset form when expense changes (switching between expenses) or modal closes
	React.useEffect(() => {
		if (!isOpen) {
			reset(buildDefaultValues(undefined))
		} else {
			reset(buildDefaultValues(expense))
		}
	}, [isOpen, expense, reset, buildDefaultValues])

	const onSubmit = (values: NewExpenseFormValues) => {
		const payload = {
			description: values.description,
			category_id: values.category,
			payment_type_id: values.paymentType,
			date: values.date,
			amount: parseFloat(values.amount.replace(/,/g, "")),
			personal: values.options.includes("personal"),
			split: values.options.includes("split"),
			bank_id: values.bank || undefined,
			store_id: values.store || undefined
		}

		if (isEditing) {
			updateExpense(
				{ id: expense.id, payload },
				{
					onSuccess: () => {
						toast.success(translations.editExpense.success)
						onClose()
					},
					onError: (error) => {
						toast.error(error.message || translations.editExpense.error)
					}
				}
			)
		} else {
			createExpense(payload, {
				onSuccess: () => {
					toast.success(translations.createExpense.success)
					reset(buildDefaultValues(undefined))
					onClose()
				},
				onError: (error) => {
					toast.error(error.message)
				}
			})
		}
	}

	const checkboxOptions = [
		{
			id: "personal",
			value: "personal",
			label: translations.createExpense.personalLabel
		},
		{
			id: "split",
			value: "split",
			label: translations.createExpense.splitLabel
		}
	]

	const selectedOptions = watch("options")

	return (
		<Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
			<DialogContent className="sm:max-w-[450px] md:max-w-[600px] lg:max-w-[700px]">
				<DialogHeader>
					<DialogTitle className="text-[28px] font-bold text-input-text text-center">
						{isEditing
							? translations.editExpense.title
							: translations.createExpense.title}
					</DialogTitle>
				</DialogHeader>

				<form onSubmit={handleSubmit(onSubmit)} className="space-y-4 mt-4">
					{/* Description */}
					<Input
						icon={MdTitle}
						{...register("description")}
						placeholder={translations.createExpense.description}
						maxLength={35}
						error={errors.description?.message}
					/>

					<div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
						{/* Category */}
						<Select
							icon={HiOutlineSelector}
							options={categories}
							placeholder={translations.createExpense.category}
							{...register("category")}
							error={errors.category?.message}
						/>

						{/* Payment Type */}
						<Select
							icon={HiOutlineSelector}
							options={paymentTypes}
							placeholder={translations.createExpense.paymentType}
							{...register("paymentType")}
							error={errors.paymentType?.message}
						/>
					</div>

					<div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
						{/* Bank */}
						<Select
							icon={HiOutlineSelector}
							options={banks}
							placeholder={translations.createExpense.bank}
							{...register("bank")}
							error={errors.bank?.message}
						/>

						{/* Store */}
						<Select
							icon={HiOutlineSelector}
							options={stores}
							placeholder={translations.createExpense.store}
							{...register("store")}
						/>
					</div>

					<div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
						{/* Date */}
						<Input
							type="date"
							icon={MdDateRange}
							{...register("date")}
							error={errors.date?.message}
						/>

						{/* Amount */}
						<div className="flex flex-col gap-2">
							<Input
								isCurrency
								icon={HiOutlineCurrencyDollar}
								{...register("amount")}
								placeholder={translations.createExpense.amount}
								error={errors.amount?.message}
							/>
							{isEditing && expense?.split && (
								<p className="flex items-center gap-1 text-xs text-muted-foreground lg:self-center">
									<Info className="h-3 w-3 shrink-0" />
									{translations.editExpense.splitAmountHint}{" "}
									{formatAmount(expense.amount)}
								</p>
							)}
						</div>
					</div>

					<CheckboxGroup
						icon={IoMdCheckboxOutline}
						options={checkboxOptions}
						value={selectedOptions}
						onChange={(val) =>
							setValue("options", val, { shouldValidate: true })
						}
					/>

					<div className="flex gap-3 mt-4">
						{isEditing && (
							<Button
								type="button"
								onClick={onClose}
								className="flex-1 h-12 bg-transparent border border-white/20 text-white font-bold text-[18px] hover:bg-white/5 transition-all"
								disabled={isPending}
							>
								{translations.common.cancel}
							</Button>
						)}
						<Button
							type="submit"
							className="flex-1 h-12 bg-orange text-background font-bold text-[18px] hover:brightness-95 transition-all"
							disabled={isPending}
						>
							{isPending ? (
								<Loader2 className="h-5 w-5 animate-spin" />
							) : (
								translations.createExpense.save
							)}
						</Button>
					</div>
				</form>
			</DialogContent>
		</Dialog>
	)
}
