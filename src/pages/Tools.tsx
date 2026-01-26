import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useSearchParams } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { Header } from "@/components/layout/Header";
import { ToolCard } from "@/components/tools/ToolCard";
import { CategoryFilter } from "@/components/tools/CategoryFilter";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Search, SlidersHorizontal } from "lucide-react";

type SortOption = "composite_score" | "ai_score" | "community_score" | "name" | "created_at";

export default function ToolsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const categoryParam = searchParams.get("category");
  
  const [selectedCategory, setSelectedCategory] = useState<string | null>(categoryParam);
  const [sortBy, setSortBy] = useState<SortOption>("composite_score");
  const [searchQuery, setSearchQuery] = useState("");

  const { data: tools, isLoading } = useQuery({
    queryKey: ["tools", selectedCategory, sortBy],
    queryFn: async () => {
      let query = supabase
        .from("tools")
        .select(`
          *,
          tool_categories!inner (
            category:categories (*)
          )
        `)
        .eq("status", "verified")
        .order(sortBy, { ascending: sortBy === "name" });

      if (selectedCategory) {
        query = query.eq("tool_categories.category.slug", selectedCategory);
      }

      const { data, error } = await query;
      if (error) throw error;

      // Transform to include categories array
      return data?.map((tool: any) => ({
        ...tool,
        categories: tool.tool_categories?.map((tc: any) => tc.category).filter(Boolean) || [],
      }));
    },
  });

  const filteredTools = tools?.filter((tool) =>
    searchQuery
      ? tool.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        tool.description?.toLowerCase().includes(searchQuery.toLowerCase())
      : true
  );

  const handleCategoryChange = (category: string | null) => {
    setSelectedCategory(category);
    if (category) {
      setSearchParams({ category });
    } else {
      setSearchParams({});
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="container py-8">
        {/* Page header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight">AI Tools Directory</h1>
          <p className="mt-2 text-muted-foreground">
            Discover and compare the best AI tools, ranked by AI analysis and community feedback
          </p>
        </div>

        {/* Filters */}
        <div className="mb-6 flex flex-col sm:flex-row gap-4">
          <CategoryFilter
            selectedCategory={selectedCategory}
            onCategoryChange={handleCategoryChange}
          />
          
          <div className="flex-1" />
          
          <div className="flex gap-3">
            <div className="relative flex-1 sm:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search tools..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
            
            <Select value={sortBy} onValueChange={(v) => setSortBy(v as SortOption)}>
              <SelectTrigger className="w-40">
                <SlidersHorizontal className="mr-2 h-4 w-4" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="composite_score">Top Ranked</SelectItem>
                <SelectItem value="ai_score">AI Score</SelectItem>
                <SelectItem value="community_score">Community Score</SelectItem>
                <SelectItem value="name">Name</SelectItem>
                <SelectItem value="created_at">Newest</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Tools grid */}
        {isLoading ? (
          <div className="space-y-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <Skeleton key={i} className="h-32 w-full rounded-lg" />
            ))}
          </div>
        ) : filteredTools && filteredTools.length > 0 ? (
          <div className="space-y-4">
            {filteredTools.map((tool, index) => (
              <ToolCard
                key={tool.id}
                tool={tool}
                rank={sortBy === "composite_score" ? index + 1 : undefined}
                showRank={sortBy === "composite_score"}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-muted-foreground">No tools found</p>
          </div>
        )}
      </main>
    </div>
  );
}
