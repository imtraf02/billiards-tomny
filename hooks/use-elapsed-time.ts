import { useEffect, useState } from "react";

function formatElapsed(ms: number) {
	const hours = Math.floor(ms / 3600000);
	const minutes = Math.floor((ms % 3600000) / 60000);
	const seconds = Math.floor((ms % 60000) / 1000);

	return `${hours.toString().padStart(2, "0")}:${minutes
		.toString()
		.padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
}

export function useElapsedTime(startTime: Date) {
	const [formatted, setFormatted] = useState("00:00:00");
	const [seconds, setSeconds] = useState(0);

	useEffect(() => {
		const startMs = startTime.getTime();

		const tick = () => {
			const diff = Date.now() - startMs;
			const nextFormatted = formatElapsed(diff);
			const nextSeconds = Math.floor(diff / 1000);

			setFormatted((p) => (p === nextFormatted ? p : nextFormatted));
			setSeconds((p) => (p === nextSeconds ? p : nextSeconds));
		};

		tick();
		const interval = setInterval(tick, 1000);
		return () => clearInterval(interval);
	}, [startTime]);

	return {
		formatted,
		seconds,
	};
}
