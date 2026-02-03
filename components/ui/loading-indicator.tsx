"use client";

interface LoadingIndicatorProps {
	isVisible: boolean;
	message?: string;
}

export function LoadingIndicator({ isVisible, message = "Đang cập nhật..." }: LoadingIndicatorProps) {
	if (!isVisible) return null;
	
	return (
		<div className="fixed bottom-4 right-4 z-50 flex items-center gap-2 rounded-lg bg-background/95 px-3 py-2 text-xs shadow-lg backdrop-blur-sm animate-in slide-in-from-bottom-2">
			<div className="h-2 w-2 animate-pulse rounded-full bg-primary"></div>
			<span>{message}</span>
		</div>
	);
}
