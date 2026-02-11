import {
	Beer,
	GlassWater,
	type LucideIcon,
	Popcorn,
	Utensils,
} from "lucide-react";

export const CATEGORY_ICON_MAP = {
	"Bia & Rượu": Beer,
	"Nước giải khát": GlassWater,
	"Đồ ăn nhanh": Utensils,
	"Đồ ăn vặt": Popcorn,
} satisfies Record<string, LucideIcon>;
