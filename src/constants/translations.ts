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
		users: "Users",
		categories: "Categories",
		settings: "Settings"
	}
} as const

export type Translations = typeof translations
