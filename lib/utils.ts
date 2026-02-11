import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs));
}

export const enumToZodEnum = <T extends Record<string, string>>(enumObj: T) => {
	const values = Object.values(enumObj) as [string, ...string[]];
	return values;
};
