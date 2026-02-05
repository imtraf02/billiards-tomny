"use client";

import { memo, useEffect, useState } from "react";

interface TimerProps {
	startTime: Date;
}

export const Timer = memo(({ startTime }: TimerProps) => {
	const [duration, setDuration] = useState<string>("00:00:00");

	useEffect(() => {
		const updateDuration = () => {
			const now = new Date();
			const diff = now.getTime() - startTime.getTime();
			const hours = Math.floor(diff / 3600000);
			const minutes = Math.floor((diff % 3600000) / 60000);
			const seconds = Math.floor((diff % 60000) / 1000);
			setDuration(
				`${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`,
			);
		};

		updateDuration();
		const interval = setInterval(updateDuration, 1000);
		return () => clearInterval(interval);
	}, [startTime]);

	return (
		<div className="text-2xl font-mono font-bold text-primary">{duration}</div>
	);
});
