export const translations = {
	common: {
		search: "Search",
		loading: "...",
		errorLoading: "Failed to load expenses. Please try again.",
		noExpensesFound: "No expenses found for this criteria.",
		balance: "Balance",
		previous: "Previous",
		next: "Next",
		logout: "Logout",
		management: "Management"
	},
	dashboards: {
		personal: {
			title: "Personal Dashboard"
		},
		shared: {
			title: "Shared Dashboard",
			incomes: "Incomes",
			outcomes: "Outcomes"
		},
		consolidated: {
			title: "Consolidated Balance",
			error: "Error loading consolidated balance. Please try again.",
			requester: "Requester",
			partner: "Partner",
			selectType: "Select type",
			monthRequired: "Month is required",
			typeRequired: "Balance type is required",
			totalPrefix: "Total - "
		}
	},
	filters: {
		filterBy: "Filter by",
		filterValue: "Filter value",
		categories: "Category",
		method: "Method",
		bank: "Bank",
		store: "Store",
		paymentType: "Payment Type"
	},
	table: {
		expense: "Expense",
		category: "Category",
		amount: "Amount",
		method: "Method",
		due: "Due",
		dueDate: "Due Date",
		purchase: "Purchase",
		bank: "Bank",
		store: "Store"
	},
	management: {
		banks: "Banks",
		categories: "Categories",
		paymentTypes: "Payment Types",
		stores: "Stores",
		bankPlaceholder: "Bank name",
		createSuccess: "Bank created successfully!",
		updateSuccess: "Bank updated successfully!",
		deleteSuccess: "Bank deleted successfully!",
		updateError: "Failed to update bank.",
		deleteError: "Failed to delete bank.",
		bankColumn: "Bank",
		createdColumn: "Created At",
		updatedColumn: "Updated At",
		edit: "Edit",
		delete: "Delete",
		confirmDeleteTitle: "Delete Bank",
		confirmDeleteDescription: "Are you sure you want to delete this bank?",
		editBankTitle: "Edit Bank"
	},
	createExpense: {
		title: "Create Expense",
		description: "Expense description",
		category: "Select category",
		paymentType: "Select payment type",
		bank: "Select bank",
		store: "Select store",
		date: "Date",
		amount: "99.99",
		save: "Save",
		success: "Expense created successfully!",
		error: "Failed to create expense.",
		bankRequired: "Bank is required for this payment type",
		personalLabel: "Personal",
		splitLabel: "Split",
		personalMobileLabel: "P",
		splitMobileLabel: "S"
	}
} as const

export type Translations = typeof translations
