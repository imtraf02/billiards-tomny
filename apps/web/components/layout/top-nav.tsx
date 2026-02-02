"use client";

import { Button } from "@workspace/ui/components/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@workspace/ui/components/dropdown-menu";
import { cn } from "@workspace/ui/lib/utils";
import { Menu } from "lucide-react";
import Link from "next/link";

type TopNavProps = React.HTMLAttributes<HTMLElement> & {
	links: {
		title: string;
		href: string;
		isActive: boolean;
	}[];
};

export function TopNav({ className, links, ...props }: TopNavProps) {
	return (
		<>
			<div className="lg:hidden">
				<DropdownMenu modal={false}>
					<DropdownMenuTrigger asChild>
						<Button size="icon" variant="outline" className="md:size-7">
							<Menu />
						</Button>
					</DropdownMenuTrigger>
					<DropdownMenuContent side="bottom" align="start">
						{links.map(({ title, href, isActive }) => (
							<DropdownMenuItem key={`${title}-${href}`} asChild>
								<Link
									href={href}
									className={!isActive ? "text-muted-foreground" : ""}
								>
									{title}
								</Link>
							</DropdownMenuItem>
						))}
					</DropdownMenuContent>
				</DropdownMenu>
			</div>

			<nav
				className={cn(
					"hidden items-center space-x-4 lg:flex lg:space-x-4 xl:space-x-6",
					className,
				)}
				{...props}
			>
				{links.map(({ title, href, isActive }) => (
					<Link
						key={`${title}-${href}`}
						href={href}
						className={`text-sm font-medium transition-colors hover:text-primary ${isActive ? "" : "text-muted-foreground"}`}
					>
						{title}
					</Link>
				))}
			</nav>
		</>
	);
}
