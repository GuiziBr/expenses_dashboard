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
		bankCreateError: "Failed to create bank.",
		bankUpdateError: "Failed to update bank.",
		bankDeleteError: "Failed to delete bank.",
		bankColumn: "Bank",
		categoryColumn: "Category",
		categoryPlaceholder: "Category description",
		categoryCreateSuccess: "Category created successfully!",
		categoryUpdateSuccess: "Category updated successfully!",
		categoryDeleteSuccess: "Category deleted successfully!",
		categoryCreateError: "Failed to create category.",
		categoryUpdateError: "Failed to update category.",
		categoryDeleteError: "Failed to delete category.",
		createdColumn: "Created At",
		updatedColumn: "Updated At",
		edit: "Edit",
		delete: "Delete",
		confirmDeleteTitle: "Delete Bank",
		confirmDeleteDescription: "Are you sure you want to delete this bank?",
		confirmDeleteCategoryTitle: "Delete Category",
		confirmDeleteCategoryDescription:
			"Are you sure you want to delete this category?",
		editBankTitle: "Edit Bank",
		editCategoryTitle: "Edit Category",
		paymentTypePlaceholder: "Payment type description",
		hasStatementLabel: "Has statement",
		paymentTypeColumn: "Payment Type",
		hasStatementColumn: "Has Statement",
		paymentTypeCreateSuccess: "Payment type created successfully!",
		paymentTypeUpdateSuccess: "Payment type updated successfully!",
		paymentTypeDeleteSuccess: "Payment type deleted successfully!",
		paymentTypeCreateError: "Failed to create payment type.",
		paymentTypeUpdateError: "Failed to update payment type.",
		paymentTypeDeleteError: "Failed to delete payment type.",
		confirmDeletePaymentTypeTitle: "Delete Payment Type",
		confirmDeletePaymentTypeDescription:
			"Are you sure you want to delete this payment type?",
		editPaymentTypeTitle: "Edit Payment Type",
		storePlaceholder: "Store name",
		storeColumn: "Store",
		storeCreateSuccess: "Store created successfully!",
		storeUpdateSuccess: "Store updated successfully!",
		storeDeleteSuccess: "Store deleted successfully!",
		storeCreateError: "Failed to create store.",
		storeUpdateError: "Failed to update store.",
		storeDeleteError: "Failed to delete store.",
		confirmDeleteStoreTitle: "Delete Store",
		confirmDeleteStoreDescription:
			"Are you sure you want to delete this store?",
		editStoreTitle: "Edit Store"
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
		invalidAmount: "Amount must be a valid positive number",
		personalLabel: "Personal",
		splitLabel: "Split",
		personalMobileLabel: "P",
		splitMobileLabel: "S"
	}
} as const

export type Translations = typeof translations
