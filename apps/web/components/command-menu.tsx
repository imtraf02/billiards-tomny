"use client";
import {
	CommandDialog,
	CommandEmpty,
	CommandGroup,
	CommandInput,
	CommandItem,
	CommandList,
	CommandSeparator,
} from "@workspace/ui/components/command";
import { ScrollArea } from "@workspace/ui/components/scroll-area";
import { ArrowRight, ChevronRight, Laptop, Moon, Sun } from "lucide-react";
import { useRouter } from "next/navigation";
import { useTheme } from "next-themes";
import React from "react";
import { useSearch } from "@/context/search-provider";
import { sidebarData } from "./layout/data/sidebar-data";

export function CommandMenu() {
	const router = useRouter();
	const { setTheme } = useTheme();
	const { open, setOpen } = useSearch();

	const runCommand = React.useCallback(
		(command: () => unknown) => {
			setOpen(false);
			command();
		},
		[setOpen],
	);

	return (
		<CommandDialog modal open={open} onOpenChange={setOpen}>
			<CommandInput placeholder="Type a command or search..." />
			<CommandList>
				<ScrollArea type="hover" className="h-72 pe-1">
					<CommandEmpty>No results found.</CommandEmpty>
					{sidebarData.navGroups.map((group) => (
						<CommandGroup key={group.title} heading={group.title}>
							{group.items.map((navItem, i) => {
								if (navItem.url)
									return (
										<CommandItem
											key={`${navItem.url}-${i}`}
											value={navItem.title}
											onSelect={() => {
												runCommand(() => router.push(navItem.url));
											}}
										>
											<div className="flex size-4 items-center justify-center">
												<ArrowRight className="size-2 text-muted-foreground/80" />
											</div>
											{navItem.title}
										</CommandItem>
									);

								return navItem.items?.map((subItem, i) => (
									<CommandItem
										key={`${navItem.title}-${subItem.url}-${i}`}
										value={`${navItem.title}-${subItem.url}`}
										onSelect={() => {
											runCommand(() => router.push(subItem.url));
										}}
									>
										<div className="flex size-4 items-center justify-center">
											<ArrowRight className="size-2 text-muted-foreground/80" />
										</div>
										{navItem.title} <ChevronRight /> {subItem.title}
									</CommandItem>
								));
							})}
						</CommandGroup>
					))}
					<CommandSeparator />
					<CommandGroup heading="Chủ đề">
						<CommandItem onSelect={() => runCommand(() => setTheme("light"))}>
							<Sun /> <span>Sáng</span>
						</CommandItem>
						<CommandItem onSelect={() => runCommand(() => setTheme("dark"))}>
							<Moon className="scale-90" />
							<span>Tối</span>
						</CommandItem>
						<CommandItem onSelect={() => runCommand(() => setTheme("system"))}>
							<Laptop />
							<span>Hệ thống</span>
						</CommandItem>
					</CommandGroup>
				</ScrollArea>
			</CommandList>
		</CommandDialog>
	);
}
