export const formatVND = (value: number) =>
	value.toLocaleString("vi-VN", {
		style: "currency",
		currency: "VND",
		maximumFractionDigits: 0,
	});

export function roundUpToThousand(amount: number): number {
	return Math.ceil(amount / 1000) * 1000;
}
