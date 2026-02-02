import { LayoutProvider } from "@/context/layout-provider";

export default function Layout({ children }: { children: React.ReactNode }) {
	return <LayoutProvider>{children}</LayoutProvider>;
}
