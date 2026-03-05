"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import * as React from "react"
import { useForm } from "react-hook-form"
import { HiOutlineCurrencyDollar, HiOutlineSelector } from "react-icons/hi"
import { IoMdCheckboxOutline } from "react-icons/io"
import { MdDateRange, MdTitle } from "react-icons/md"
import { toast } from "sonner"
import { translations } from "@/constants/translations"
import { useCreateExpense } from "@/hooks/use-expenses"
import { useFilterValues } from "@/hooks/use-filter-values"
import {
	type NewExpenseFormValues,
	newExpenseSchema
} from "@/lib/schemas/new-expense-schema"
import { Button } from "./ui/button"
import { CheckboxGroup } from "./ui/checkbox-group"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./ui/dialog"
import { Input } from "./ui/input"
import { Select } from "./ui/select"

interface NewExpenseModalProps {
	isOpen: boolean
	onClose: () => void
}

export function NewExpenseModal({ isOpen, onClose }: NewExpenseModalProps) {
	const { mutate: createExpense, isPending } = useCreateExpense()

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

	const form = useForm<NewExpenseFormValues>({
		resolver: zodResolver(schema),
		mode: "onSubmit",
		defaultValues: {
			description: "",
			category: "",
			paymentType: "",
			bank: "",
			store: "",
			date: "",
			amount: "",
			options: []
		}
	})

	const {
		register,
		handleSubmit,
		formState: { errors },
		watch,
		setValue
	} = form

	// Clean fields when modal is closed
	React.useEffect(() => {
		if (!isOpen) {
			form.reset()
		}
	}, [isOpen, form.reset])

	const onSubmit = (values: NewExpenseFormValues) => {
		// Convert string amount to number (cents)
		const amountInCents = Math.round(parseFloat(values.amount) * 100)

		const payload = {
			description: values.description,
			category_id: values.category,
			payment_type_id: values.paymentType,
			date: values.date,
			amount: amountInCents,
			personal: values.options.includes("personal"),
			split: values.options.includes("split"),
			bank_id: values.bank || undefined,
			store_id: values.store || undefined
		}

		createExpense(payload, {
			onSuccess: () => {
				toast.success(translations.createExpense.success)
				form.reset()
				onClose()
			},
			onError: () => {
				toast.error(translations.createExpense.error)
			}
		})
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
						{translations.createExpense.title}
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
						<Input
							icon={HiOutlineCurrencyDollar}
							{...register("amount")}
							placeholder={translations.createExpense.amount}
							error={errors.amount?.message}
						/>
					</div>

					<CheckboxGroup
						icon={IoMdCheckboxOutline}
						options={checkboxOptions}
						value={selectedOptions}
						onChange={(val) =>
							setValue("options", val, { shouldValidate: true })
						}
					/>

					<Button
						type="submit"
						className="w-full h-12 bg-orange text-background font-bold text-[18px] hover:brightness-95 transition-all mt-4"
						disabled={isPending}
					>
						{isPending
							? translations.common.loading
							: translations.createExpense.save}
					</Button>
				</form>
			</DialogContent>
		</Dialog>
	)
}
