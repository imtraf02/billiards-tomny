import type { ProductWithCategory } from "@/features/products/types";
import type { InventoryWithProduct, ProductStats } from "../types";

export function calculateProductStats(
	inventoryData?: InventoryWithProduct[] | null,
	productsData?: ProductWithCategory[] | null,
): ProductStats[] {
	if (!inventoryData || !productsData) return [];

	const statsMap = new Map<string, ProductStats>();

	// Initialize all products
	productsData.forEach((product) => {
		statsMap.set(product.id, {
			productId: product.id,
			productName: product.name,
			categoryName: product.category.name,
			unit: product.unit,
			currentInventory: product.stock,
			importQty: 0,
			importValue: 0,
			exportQty: 0,
			exportValue: 0,
			saleQty: 0,
			saleValue: 0,
			profit: 0,
			profitMargin: 0,
		});
	});

	// Calculate stats from transactions
	inventoryData.forEach((transaction) => {
		const stats = statsMap.get(transaction.product.id);
		if (!stats) return;

		const qty = Math.abs(transaction.quantity);
		const amount = transaction.cost * qty;

		// Các loại giao dịch TĂNG tồn kho
		if (
			transaction.type === "IMPORT" ||
			(transaction.type === "ADJUSTMENT" && transaction.quantity > 0)
		) {
			stats.importQty += qty;
			stats.importValue += amount;
		}
		// Các loại giao dịch GIẢM tồn kho
		else if (
			transaction.type === "SALE" ||
			transaction.type === "INTERNAL" ||
			transaction.type === "SPOILAGE" ||
			(transaction.type === "ADJUSTMENT" && transaction.quantity < 0)
		) {
			stats.exportQty += qty;
			stats.exportValue += amount;

			// Chỉ tính doanh thu cho SALE
			if (transaction.type === "SALE") {
				stats.saleQty += qty;
				stats.saleValue += amount;
			}
		}
	});

	// Calculate profit and margin
	statsMap.forEach((stats) => {
		const avgImportCost =
			stats.importQty > 0 ? stats.importValue / stats.importQty : 0;
		const costOfSoldGoods = stats.saleQty * avgImportCost;
		stats.profit = stats.saleValue - costOfSoldGoods;
		stats.profitMargin =
			stats.saleValue > 0 ? (stats.profit / stats.saleValue) * 100 : 0;
	});

	return Array.from(statsMap.values());
}

export function sortProductStats(
	stats: ProductStats[],
	sortBy: string,
): ProductStats[] {
	const sorted = [...stats];

	switch (sortBy) {
		case "name_asc":
			return sorted.sort((a, b) => a.productName.localeCompare(b.productName));
		case "name_desc":
			return sorted.sort((a, b) => b.productName.localeCompare(a.productName));
		case "profit_asc":
			return sorted.sort((a, b) => a.profit - b.profit);
		case "profit_desc":
			return sorted.sort((a, b) => b.profit - a.profit);
		case "sale_value_asc":
			return sorted.sort((a, b) => a.saleValue - b.saleValue);
		case "sale_value_desc":
			return sorted.sort((a, b) => b.saleValue - a.saleValue);
		case "import_value_asc":
			return sorted.sort((a, b) => a.importValue - b.importValue);
		case "import_value_desc":
			return sorted.sort((a, b) => b.importValue - a.importValue);
		default:
			return sorted;
	}
}

export function calculateTotalStats(stats: ProductStats[]) {
	return stats.reduce(
		(acc, stat) => ({
			totalImportValue: acc.totalImportValue + stat.importValue,
			totalExportValue: acc.totalExportValue + stat.exportValue,
			totalSaleValue: acc.totalSaleValue + stat.saleValue,
			totalProfit: acc.totalProfit + stat.profit,
		}),
		{
			totalImportValue: 0,
			totalExportValue: 0,
			totalSaleValue: 0,
			totalProfit: 0,
		},
	);
}
