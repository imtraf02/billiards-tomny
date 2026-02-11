"use client";

import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTables } from "./tables-provider";

export function TablesPrimaryButtons() {
	const { setOpen } = useTables();
	return (
		<div className="flex gap-2">
			<Button className="space-x-1" onClick={() => setOpen("create")}>
				<span>Thêm mới</span> <Plus />
			</Button>
		</div>
	);
}
