import React, { useState, useEffect } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { Header } from "@/components/layout/Header";
import { AIScoreExplainer } from "@/components/tools/AIScoreExplainer";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { ChevronLeft, ArrowRightLeft, ExternalLink, CheckCircle2, Plus, X, Filter, Info } from "lucide-react";
import { cn } from "@/lib/utils";
import {
    Tooltip,
    TooltipContent,
    TooltipTrigger,
} from "@/components/ui/tooltip";

interface ToolData {
    id: string;
    slug: string;
    name: string;
    tagline: string;
    logo_url: string | null;
    website_url: string | null;
    pricing_model: string;
    status: string;
    ai_score: number;
    community_score: number;
    composite_score: number;
    ai_score_components: any;
}

interface CategoryData {
    id: string;
    slug: string;
    name: string;
}

function getScoreColor(score: number): string {
    if (score >= 85) return "text-emerald-600 dark:text-emerald-400";
    if (score >= 70) return "text-green-600 dark:text-green-400";
    if (score >= 50) return "text-amber-600 dark:text-amber-400";
    return "text-red-600 dark:text-red-400";
}

// Calculate overall score as average of AI and Community
function getOverallScore(tool: ToolData): number {
    return Math.round((Number(tool.ai_score) + Number(tool.community_score)) / 2);
}

function ToolComparisonCard({ tool }: { tool: ToolData }) {
    return (
        <Card className="flex-1 min-w-0">
            <CardHeader className="pb-4">
                <div className="flex items-center gap-3">
                    <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-secondary flex items-center justify-center overflow-hidden">
                        {tool.logo_url ? (
                            <img
                                src={tool.logo_url}
                                alt={`${tool.name} logo`}
                                className="w-8 h-8 object-contain"
                                onError={(e) => {
                                    (e.target as HTMLImageElement).src = "/placeholder.svg";
                                }}
                            />
                        ) : (
                            <span className="text-lg font-bold text-muted-foreground">
                                {tool.name.charAt(0)}
                            </span>
                        )}
                    </div>

                    <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                            <CardTitle className="text-lg truncate">{tool.name}</CardTitle>
                            {tool.status === "verified" && (
                                <CheckCircle2 className="h-4 w-4 text-accent flex-shrink-0" />
                            )}
                        </div>
                        <p className="text-sm text-muted-foreground truncate">{tool.tagline}</p>
                    </div>

                    {tool.website_url && (
                        <a
                            href={tool.website_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-muted-foreground hover:text-foreground"
                        >
                            <ExternalLink className="h-4 w-4" />
                        </a>
                    )}
                </div>

                <div className="flex items-center gap-2 mt-3">
                    <Badge variant="outline" className="text-xs capitalize">
                        {tool.pricing_model.replace("_", " ")}
                    </Badge>
                    <div className="ml-auto text-right">
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <span className="flex items-center gap-1 cursor-help justify-end">
                                    <span className={cn("text-2xl font-bold tabular-nums", getScoreColor(getOverallScore(tool)))}>
                                        {getOverallScore(tool)}
                                    </span>
                                    <Info className="h-3 w-3 text-muted-foreground" />
                                </span>
                            </TooltipTrigger>
                            <TooltipContent>
                                <p className="text-xs max-w-[200px]">Overall score blends AI evaluation with community feedback.</p>
                            </TooltipContent>
                        </Tooltip>
                        <span className="text-xs text-muted-foreground block">Overall Score</span>
                    </div>
                </div>
            </CardHeader>

            <CardContent>
                <AIScoreExplainer
                    aiScore={Number(tool.ai_score)}
                    aiScoreComponents={tool.ai_score_components}
                />
            </CardContent>
        </Card>
    );
}

export default function ToolComparePage() {
    const [searchParams, setSearchParams] = useSearchParams();
    const [toolA, setToolA] = useState(searchParams.get("a") || "");
    const [toolB, setToolB] = useState(searchParams.get("b") || "");
    const [toolC, setToolC] = useState(searchParams.get("c") || "");
    const [showThird, setShowThird] = useState(!!searchParams.get("c"));
    const [selectedCategory, setSelectedCategory] = useState(searchParams.get("category") || "all");

    // Fetch categories
    const { data: categories } = useQuery({
        queryKey: ["categories-for-compare"],
        queryFn: async () => {
            const { data, error } = await supabase
                .from("categories")
                .select("id, slug, name")
                .order("name");
            if (error) throw error;
            return (data || []) as CategoryData[];
        },
    });

    // Fetch all tools
    const { data: allTools, isLoading } = useQuery({
        queryKey: ["tools-for-compare"],
        queryFn: async () => {
            const { data, error } = await supabase
                .from("tools")
                .select("id, slug, name, tagline, logo_url, website_url, pricing_model, status, ai_score, community_score, composite_score, ai_score_components")
                .eq("status", "verified")
                .order("composite_score", { ascending: false });

            if (error) throw error;
            return (data || []) as unknown as ToolData[];
        },
    });

    // Update URL when selection changes
    useEffect(() => {
        const params = new URLSearchParams();
        if (toolA) params.set("a", toolA);
        if (toolB) params.set("b", toolB);
        if (toolC) params.set("c", toolC);
        if (selectedCategory !== "all") params.set("category", selectedCategory);
        setSearchParams(params, { replace: true });
    }, [toolA, toolB, toolC, selectedCategory, setSearchParams]);

    // Get selected tools
    const selectedToolA = allTools?.find((t) => t.slug === toolA);
    const selectedToolB = allTools?.find((t) => t.slug === toolB);
    const selectedToolC = allTools?.find((t) => t.slug === toolC);

    const selectedTools = [selectedToolA, selectedToolB, selectedToolC].filter(Boolean) as ToolData[];

    // Available tools for dropdowns
    const getAvailableTools = (exclude: string[]) => {
        return (allTools || []).filter((t) => !exclude.includes(t.slug));
    };

    // Calculate comparison result
    const getComparisonResult = () => {
        if (selectedTools.length < 2) return null;

        const sorted = [...selectedTools].sort(
            (a, b) => getOverallScore(b) - getOverallScore(a)
        );
        const highest = sorted[0];
        const secondHighest = sorted[1];
        const diff = getOverallScore(highest) - getOverallScore(secondHighest);

        if (diff === 0) return { tie: true, winner: null, diff: 0 };
        return { tie: false, winner: highest, diff };
    };

    const comparison = getComparisonResult();

    return (
        <div className="min-h-screen bg-background">
            <Header />

            <main className="container py-8">
                {/* Back link */}
                <Link
                    to="/tools"
                    className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-6"
                >
                    <ChevronLeft className="h-4 w-4" />
                    Back to Tools
                </Link>

                {/* Page header */}
                <div className="mb-8">
                    <h1 className="text-2xl font-bold">Compare Tools</h1>
                    <p className="text-muted-foreground mt-1">
                        Side-by-side comparison of AI tool scores and capabilities
                    </p>
                </div>

                {/* Category filter */}
                <div className="mb-6">
                    <div className="flex items-center gap-2 mb-2">
                        <Filter className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm font-medium text-muted-foreground">Filter by category (optional)</span>
                    </div>
                    <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                        <SelectTrigger className="w-64">
                            <SelectValue placeholder="All categories" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All categories</SelectItem>
                            {categories?.map((cat) => (
                                <SelectItem key={cat.slug} value={cat.slug}>
                                    {cat.name}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    <p className="text-xs text-muted-foreground mt-2 italic">
                        Categories help you find similar tools. Scores shown are overall, not category-specific.
                    </p>
                </div>

                {/* Tool selectors */}
                {isLoading ? (
                    <div className="grid md:grid-cols-3 gap-4 mb-8">
                        <Skeleton className="h-16" />
                        <Skeleton className="h-16" />
                    </div>
                ) : (
                    <div className="flex flex-wrap gap-4 mb-8 items-end">
                        {/* Tool A */}
                        <div className="flex-1 min-w-[200px] max-w-[280px]">
                            <label className="text-sm font-medium text-muted-foreground mb-2 block">Tool A</label>
                            <Select value={toolA} onValueChange={setToolA}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select a tool..." />
                                </SelectTrigger>
                                <SelectContent>
                                    {getAvailableTools([toolB, toolC]).map((tool) => (
                                        <SelectItem key={tool.slug} value={tool.slug}>
                                            {tool.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Swap button */}
                        <Button
                            variant="outline"
                            size="icon"
                            className="rounded-full h-10 w-10 flex-shrink-0"
                            onClick={() => {
                                const temp = toolA;
                                setToolA(toolB);
                                setToolB(temp);
                            }}
                            disabled={!toolA || !toolB}
                        >
                            <ArrowRightLeft className="h-4 w-4" />
                        </Button>

                        {/* Tool B */}
                        <div className="flex-1 min-w-[200px] max-w-[280px]">
                            <label className="text-sm font-medium text-muted-foreground mb-2 block">Tool B</label>
                            <Select value={toolB} onValueChange={setToolB}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select a tool..." />
                                </SelectTrigger>
                                <SelectContent>
                                    {getAvailableTools([toolA, toolC]).map((tool) => (
                                        <SelectItem key={tool.slug} value={tool.slug}>
                                            {tool.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Tool C (optional) */}
                        {showThird ? (
                            <div className="flex-1 min-w-[200px] max-w-[280px]">
                                <div className="flex items-center justify-between mb-2">
                                    <label className="text-sm font-medium text-muted-foreground">Tool C</label>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        className="h-5 w-5 p-0 text-muted-foreground hover:text-destructive"
                                        onClick={() => {
                                            setShowThird(false);
                                            setToolC("");
                                        }}
                                    >
                                        <X className="h-3 w-3" />
                                    </Button>
                                </div>
                                <Select value={toolC} onValueChange={setToolC}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select a tool..." />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {getAvailableTools([toolA, toolB]).map((tool) => (
                                            <SelectItem key={tool.slug} value={tool.slug}>
                                                {tool.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        ) : (
                            <Button
                                variant="outline"
                                className="h-10 gap-2"
                                onClick={() => setShowThird(true)}
                            >
                                <Plus className="h-4 w-4" />
                                Add Tool
                            </Button>
                        )}
                    </div>
                )}

                {/* Comparison cards */}
                {selectedTools.length >= 2 ? (
                    <div className={cn(
                        "grid gap-6",
                        selectedTools.length === 2 ? "md:grid-cols-2" : "md:grid-cols-3"
                    )}>
                        {selectedTools.map((tool) => (
                            <ToolComparisonCard key={tool.slug} tool={tool} />
                        ))}
                    </div>
                ) : (
                    <Card className="p-12 text-center">
                        <p className="text-muted-foreground">
                            Select at least two tools above to compare them side-by-side.
                        </p>
                    </Card>
                )}

                {/* Quick comparison summary */}
                {selectedTools.length >= 2 && comparison && (
                    <Card className="mt-6">
                        <CardHeader>
                            <CardTitle className="text-lg">Quick Comparison</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="flex items-center justify-center gap-8 flex-wrap">
                                {selectedTools.map((tool, index) => (
                                    <React.Fragment key={tool.slug}>
                                        {index > 0 && (
                                            <span className="text-muted-foreground font-medium">vs</span>
                                        )}
                                        <div className="text-center">
                                            <div className={cn("text-2xl font-bold tabular-nums", getScoreColor(getOverallScore(tool)))}>
                                                {getOverallScore(tool)}
                                            </div>
                                            <div className="text-xs text-muted-foreground">{tool.name}</div>
                                        </div>
                                    </React.Fragment>
                                ))}
                            </div>

                            <div className="mt-4 pt-4 border-t text-center">
                                <p className="text-sm text-muted-foreground">
                                    {comparison.tie ? (
                                        <>All compared tools have the <strong>same overall score</strong></>
                                    ) : comparison.winner && (
                                        <>
                                            <strong className="text-foreground">{comparison.winner.name}</strong> scores{" "}
                                            <strong className="text-emerald-600">
                                                {comparison.diff} {comparison.diff === 1 ? "point" : "points"} higher
                                            </strong>{" "}
                                            overall
                                        </>
                                    )}
                                </p>
                            </div>
                        </CardContent>
                    </Card>
                )}
            </main>
        </div>
    );
}
