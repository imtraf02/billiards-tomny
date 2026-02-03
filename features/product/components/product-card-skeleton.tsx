"use client";

import {
	Card,
	CardContent,
	CardFooter,
	CardHeader,
} from "@/components/ui/card";

export function ProductCardSkeleton() {
	return (
		<Card className="overflow-hidden animate-pulse h-full">
			<CardHeader className="space-y-2">
				<div className="h-4 bg-gray-200 rounded w-3/4"></div>
				<div className="h-3 bg-gray-200 rounded w-1/2"></div>
			</CardHeader>
			<CardContent className="space-y-3">
				<div className="h-3 bg-gray-200 rounded"></div>
				<div className="h-3 bg-gray-200 rounded"></div>
				<div className="h-3 bg-gray-200 rounded"></div>
				<div className="h-3 bg-gray-200 rounded"></div>
			</CardContent>
			<CardFooter>
				<div className="h-9 bg-gray-200 rounded w-full"></div>
			</CardFooter>
		</Card>
	);
}
