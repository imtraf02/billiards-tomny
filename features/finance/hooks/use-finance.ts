"use client";

import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/eden";

interface FinancialSummaryParams {
	timeRange?: string;
	startDate?: Date;
	endDate?: Date;
}

interface TransactionParams {
	page?: number;
	limit?: number;
	type?: string;
	search?: string;
	startDate?: Date;
	endDate?: Date;
}

// Helper function để format currency
const formatCurrency = (amount: number) => {
	return new Intl.NumberFormat("vi-VN", {
		style: "currency",
		currency: "VND",
	}).format(amount);
};

// Generate mock financial data
const generateMockFinancialData = (timeRange?: string) => {
	const baseRevenue =
		timeRange === "YEAR"
			? 150000000
			: timeRange === "MONTH"
				? 12500000
				: timeRange === "WEEK"
					? 3000000
					: 1250000;

	return {
		totalRevenue: baseRevenue,
		totalExpense: baseRevenue * 0.68,
		profit: baseRevenue * 0.32,
		profitMargin: 32,
		totalDebt: baseRevenue * 0.25,
		debtCount: 8,
		revenueChart: generateRevenueData(timeRange),
		expenseChart: [
			{ name: "Nguyên vật liệu", value: baseRevenue * 0.35, color: "#0088FE" },
			{ name: "Nhân sự", value: baseRevenue * 0.25, color: "#00C49F" },
			{ name: "Mặt bằng", value: baseRevenue * 0.15, color: "#FFBB28" },
			{ name: "Tiện ích", value: baseRevenue * 0.1, color: "#FF8042" },
			{ name: "Khác", value: baseRevenue * 0.15, color: "#8884D8" },
		],
		topProducts: [
			{
				product: "Cà phê sữa",
				revenue: 4500000,
				cost: 1800000,
				profit: 2700000,
			},
			{ product: "Trà sữa", revenue: 3800000, cost: 1520000, profit: 2280000 },
			{ product: "Bàn Pool", revenue: 3200000, cost: 800000, profit: 2400000 },
			{ product: "Nước suối", revenue: 1200000, cost: 480000, profit: 720000 },
			{ product: "Snack", revenue: 900000, cost: 360000, profit: 540000 },
		],
		profitByProduct: [
			{
				product: "Cà phê sữa",
				revenue: 4500000,
				cost: 1800000,
				profit: 2700000,
			},
			{ product: "Trà sữa", revenue: 3800000, cost: 1520000, profit: 2280000 },
			{ product: "Bàn Pool", revenue: 3200000, cost: 800000, profit: 2400000 },
			{ product: "Bàn Carom", revenue: 2800000, cost: 700000, profit: 2100000 },
			{ product: "Nước suối", revenue: 1200000, cost: 480000, profit: 720000 },
		],
		profitByCategory: [
			{ category: "Đồ uống", profit: 5700000 },
			{ category: "Thuê bàn", profit: 4500000 },
			{ category: "Đồ ăn", profit: 1200000 },
			{ category: "Phụ kiện", profit: 800000 },
		],
		fixedExpenses: [
			{
				id: 1,
				name: "Tiền thuê mặt bằng",
				description: "Hàng tháng",
				amount: 5000000,
			},
			{
				id: 2,
				name: "Lương nhân viên",
				description: "Hàng tháng",
				amount: 15000000,
			},
			{ id: 3, name: "Điện nước", description: "Hàng tháng", amount: 2000000 },
			{ id: 4, name: "Internet", description: "Hàng tháng", amount: 500000 },
		],
	};
};

const generateRevenueData = (timeRange?: string) => {
	const labels =
		timeRange === "WEEK"
			? ["T2", "T3", "T4", "T5", "T6", "T7", "CN"]
			: timeRange === "MONTH"
				? ["Tuần 1", "Tuần 2", "Tuần 3", "Tuần 4"]
				: ["Tháng 1", "Tháng 2", "Tháng 3", "Tháng 4", "Tháng 5", "Tháng 6"];

	return labels.map((label, i) => ({
		date: label,
		revenue: 1000000 + Math.random() * 500000 + i * 200000,
		orders: 15 + Math.floor(Math.random() * 10) + i * 2,
	}));
};

// Generate mock transactions
const generateMockTransactions = (count: number = 10) => {
	const types = ["REVENUE", "EXPENSE", "REFUND"];
	const descriptions = [
		"Thanh toán bàn Pool 1",
		"Mua nguyên vật liệu",
		"Hoàn tiền khách hàng",
		"Bán nước uống",
		"Chi phí điện nước",
		"Doanh thu bàn Carom",
		"Mua phụ kiện bi-a",
		"Thanh toán lương nhân viên",
		"Bán đồ ăn vặt",
		"Thu tiền dịch vụ",
	];
	const paymentMethods = ["CASH", "BANK_TRANSFER", "MOMO", "ZALO_PAY"];

	return Array.from({ length: count }, (_, i) => ({
		id: `trans-${i + 1}`,
		createdAt: new Date(
			Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000,
		).toISOString(),
		description: descriptions[i % descriptions.length],
		type: types[i % types.length],
		paymentMethod: paymentMethods[i % paymentMethods.length],
		amount: 50000 + Math.random() * 5000000,
	}));
};

// Generate mock debts
const generateMockDebts = (count: number = 10) => {
	const contacts = [
		"Nguyễn Văn A",
		"Công ty ABC",
		"Lê Thị B",
		"Nhà cung cấp XYZ",
		"Khách hàng VIP",
	];
	const types = ["RECEIVABLE", "PAYABLE"];
	const statuses = ["PENDING", "OVERDUE", "PAID", "PARTIAL"];

	return Array.from({ length: count }, (_, i) => ({
		id: `debt-${i + 1}`,
		contactName: contacts[i % contacts.length],
		description: `Công nợ ${types[i % 2] === "RECEIVABLE" ? "phải thu" : "phải trả"}`,
		type: types[i % 2],
		amount: 1000000 + Math.random() * 10000000,
		dueDate: new Date(Date.now() + (i - 5) * 24 * 60 * 60 * 1000).toISOString(),
		status: statuses[i % statuses.length],
	}));
};

// Generate mock budgets
const generateMockBudgets = () => {
	return {
		summary: {
			totalBudget: 50000000,
			totalSpent: 32000000,
			remaining: 18000000,
		},
		categories: [
			{
				id: "1",
				category: "Nguyên vật liệu",
				description: "Mua cà phê, trà, nước ngọt, snack",
				amount: 15000000,
				spent: 12000000,
				period: "Tháng 2/2024",
			},
			{
				id: "2",
				category: "Nhân sự",
				description: "Lương nhân viên, phụ cấp",
				amount: 20000000,
				spent: 15000000,
				period: "Tháng 2/2024",
			},
			{
				id: "3",
				category: "Mặt bằng & Tiện ích",
				description: "Tiền thuê, điện, nước, internet",
				amount: 10000000,
				spent: 3500000,
				period: "Tháng 2/2024",
			},
			{
				id: "4",
				category: "Marketing",
				description: "Quảng cáo, khuyến mãi",
				amount: 5000000,
				spent: 1500000,
				period: "Quý 1/2024",
			},
		],
		recentTransactions: [
			{
				id: "1",
				description: "Mua 50kg cà phê",
				category: "Nguyên vật liệu",
				categoryColor: "text-blue-600",
				date: new Date().toISOString(),
				amount: 4500000,
				budgetCategory: "Nguyên vật liệu",
			},
			{
				id: "2",
				description: "Lương tháng 2",
				category: "Nhân sự",
				categoryColor: "text-green-600",
				date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
				amount: 12000000,
				budgetCategory: "Nhân sự",
			},
			{
				id: "3",
				description: "Tiền điện tháng 2",
				category: "Tiện ích",
				categoryColor: "text-amber-600",
				date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
				amount: 1800000,
				budgetCategory: "Mặt bằng & Tiện ích",
			},
		],
	};
};

export function useGetFinancialSummary(params?: FinancialSummaryParams) {
	return useQuery({
		queryKey: ["financial-summary", params],
		queryFn: async () => {
			try {
				// Thử gọi API thật
				const res = await api.finance?.summary?.get?.({
					query: {
						timeRange: params?.timeRange,
						startDate: params?.startDate?.toISOString(),
						endDate: params?.endDate?.toISOString(),
					},
				});

				if (res?.status === 200) {
					return res.data;
				}
			} catch (error) {
				console.log("API tài chính chưa sẵn sàng, sử dụng mock data");
			}

			// Nếu API không tồn tại hoặc lỗi, trả về mock data
			return generateMockFinancialData(params?.timeRange);
		},
	});
}

export function useGetDailyTransactions(params?: TransactionParams) {
	return useQuery({
		queryKey: ["daily-transactions", params],
		queryFn: async () => {
			try {
				// Thử gọi API thật
				const res = await api.finance?.transactions?.get?.({
					query: {
						page: params?.page || 1,
						limit: params?.limit || 10,
						type: params?.type,
						search: params?.search,
						startDate: params?.startDate?.toISOString(),
						endDate: params?.endDate?.toISOString(),
					},
				});

				if (res?.status === 200) {
					return res.data;
				}
			} catch (error) {
				console.log("API transactions chưa sẵn sàng, sử dụng mock data");
			}

			// Mock data
			const mockData = generateMockTransactions(params?.limit || 10);
			return {
				data: mockData,
				meta: {
					total: 50,
					page: params?.page || 1,
					limit: params?.limit || 10,
					totalPages: 5,
				},
			};
		},
	});
}

export function useGetDebts(params?: TransactionParams) {
	return useQuery({
		queryKey: ["debts", params],
		queryFn: async () => {
			try {
				// Thử gọi API thật
				const res = await api.finance?.debts?.get?.({
					query: {
						page: params?.page || 1,
						limit: params?.limit || 10,
						type: params?.type,
						search: params?.search,
					},
				});

				if (res?.status === 200) {
					return res.data;
				}
			} catch (error) {
				console.log("API debts chưa sẵn sàng, sử dụng mock data");
			}

			// Mock data
			const mockData = generateMockDebts(params?.limit || 10);
			const summary = mockData.reduce(
				(acc, debt) => {
					if (debt.type === "RECEIVABLE") {
						acc.receivable += debt.amount;
					} else {
						acc.payable += debt.amount;
					}
					if (debt.status === "OVERDUE") {
						acc.overdue += debt.amount;
					}
					return acc;
				},
				{ receivable: 0, payable: 0, overdue: 0 },
			);

			return {
				data: mockData,
				summary,
				meta: {
					total: 20,
					page: params?.page || 1,
					limit: params?.limit || 10,
					totalPages: 2,
				},
			};
		},
	});
}

export function useGetBudgets() {
	return useQuery({
		queryKey: ["budgets"],
		queryFn: async () => {
			try {
				// Thử gọi API thật
				const res = await api.finance?.budgets?.get?.();

				if (res?.status === 200) {
					return res.data;
				}
			} catch (error) {
				console.log("API budgets chưa sẵn sàng, sử dụng mock data");
			}

			// Mock data
			return generateMockBudgets();
		},
	});
}
