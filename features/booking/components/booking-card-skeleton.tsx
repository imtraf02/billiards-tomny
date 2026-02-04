"use client";

import {
	Card,
	CardContent,
	CardFooter,
	CardHeader,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export function BookingCardSkeleton() {
	return (
		<Card className="overflow-hidden animate-pulse">
			<CardHeader className="space-y-2">
				<Skeleton className="h-4 rounded w-3/4"></Skeleton>
				<Skeleton className="h-3 rounded w-1/2"></Skeleton>
			</CardHeader>
			<CardContent className="space-y-3">
				<Skeleton className="h-3 rounded"></Skeleton>
				<Skeleton className="h-3 rounded"></Skeleton>
				<Skeleton className="h-3 rounded"></Skeleton>
				<Skeleton className="h-3 rounded"></Skeleton>
				<Skeleton className="h-3 rounded"></Skeleton>
			</CardContent>
			<CardFooter>
				<Skeleton className="h-9 rounded w-full"></Skeleton>
			</CardFooter>
		</Card>
	);
}
