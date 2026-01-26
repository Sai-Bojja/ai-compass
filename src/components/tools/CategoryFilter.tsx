import { Button } from "@/components/ui/button";
import { Code, PenTool, Lightbulb, LayoutGrid } from "lucide-react";
import { cn } from "@/lib/utils";

type CategoryFilterProps = {
  selectedCategory: string | null;
  onCategoryChange: (category: string | null) => void;
};

const categories = [
  { slug: null, label: "All Tools", icon: LayoutGrid },
  { slug: "code", label: "Code", icon: Code },
  { slug: "writing", label: "Writing", icon: PenTool },
  { slug: "brainstorming", label: "Brainstorming", icon: Lightbulb },
];

export function CategoryFilter({ selectedCategory, onCategoryChange }: CategoryFilterProps) {
  return (
    <div className="flex flex-wrap gap-2">
      {categories.map((category) => {
        const Icon = category.icon;
        const isSelected = selectedCategory === category.slug;

        return (
          <Button
            key={category.slug ?? "all"}
            variant={isSelected ? "default" : "outline"}
            size="sm"
            onClick={() => onCategoryChange(category.slug)}
            className={cn(
              "gap-2 transition-all",
              isSelected && "shadow-md"
            )}
          >
            <Icon className="h-4 w-4" />
            {category.label}
          </Button>
        );
      })}
    </div>
  );
}
