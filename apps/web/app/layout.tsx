"use client";
import { Geist, Geist_Mono } from "next/font/google";
import "@workspace/ui/globals.css";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Providers } from "@/components/providers";

const fontSans = Geist({
	subsets: ["latin"],
	variable: "--font-sans",
});

const fontMono = Geist_Mono({
	subsets: ["latin"],
	variable: "--font-mono",
});

const queryClient = new QueryClient();

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<html lang="en" suppressHydrationWarning>
			<body
				className={`${fontSans.variable} ${fontMono.variable} font-sans antialiased `}
			>
				<QueryClientProvider client={queryClient}>
					<Providers>{children}</Providers>
				</QueryClientProvider>
			</body>
		</html>
	);
}
