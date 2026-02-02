import { Link } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { ExternalLink, TrendingUp, MessageSquare, CheckCircle2 } from "lucide-react";
import { Tool, Category } from "@/lib/supabase";
import { cn } from "@/lib/utils";

type ToolCardProps = {
  tool: Tool & { categories?: Category[] };
  rank?: number;
  showRank?: boolean;
};

function getScoreColor(score: number): string {
  if (score >= 85) return "text-score-excellent";
  if (score >= 70) return "text-score-good";
  if (score >= 50) return "text-score-average";
  return "text-score-poor";
}

function getPricingBadgeVariant(pricing: string): "default" | "secondary" | "outline" {
  switch (pricing) {
    case "free":
    case "open_source":
      return "default";
    case "freemium":
      return "secondary";
    default:
      return "outline";
  }
}

function getCategoryClass(slug: string): string {
  switch (slug) {
    case "code":
      return "category-code";
    case "writing":
      return "category-writing";
    case "brainstorming":
      return "category-brainstorm";
    default:
      return "";
  }
}

export function ToolCard({ tool, rank, showRank = false }: ToolCardProps) {
  const primaryCategory = tool.categories?.[0];

  return (
    <Link to={`/tools/${tool.slug}`} className="block">
      <Card className="group relative overflow-hidden border bg-card transition-all duration-300 hover:shadow-card-hover hover:-translate-y-0.5 cursor-pointer">
        <CardContent className="p-5">
          <div className="flex gap-4">
            {/* Rank indicator */}
            {showRank && rank && (
              <div className="flex-shrink-0 flex items-center justify-center w-10 h-10 rounded-lg bg-secondary font-semibold text-lg text-secondary-foreground">
                {rank}
              </div>
            )}

            {/* Logo */}
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

            {/* Content */}
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <span className="inline-flex items-center gap-1.5 font-semibold text-foreground group-hover:text-primary transition-colors">
                    {tool.name}
                    {tool.status === "verified" && (
                      <CheckCircle2 className="h-4 w-4 text-accent" />
                    )}
                  </span>
                  <p className="mt-0.5 text-sm text-muted-foreground line-clamp-2">
                    {tool.tagline || tool.description}
                  </p>
                </div>

                {/* Score - calculated as average of AI and Community */}
                <div className="flex-shrink-0 text-right">
                  <div className={cn("text-xl font-bold tabular-nums", getScoreColor(Math.round((Number(tool.ai_score) + Number(tool.community_score)) / 2)))}>
                    {Math.round((Number(tool.ai_score) + Number(tool.community_score)) / 2)}
                  </div>
                  <div className="text-xs text-muted-foreground">Overall</div>
                </div>
              </div>

              {/* Metadata row */}
              <div className="mt-3 flex flex-wrap items-center gap-2">
                {primaryCategory && (
                  <Badge variant="secondary" className={cn("text-xs", getCategoryClass(primaryCategory.slug))}>
                    {primaryCategory.name}
                  </Badge>
                )}

                <Badge variant={getPricingBadgeVariant(tool.pricing_model)} className="text-xs capitalize">
                  {tool.pricing_model.replace("_", " ")}
                </Badge>

                <div className="flex items-center gap-3 ml-auto text-xs text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <TrendingUp className="h-3 w-3" />
                    AI: {Number(tool.ai_score).toFixed(0)}
                  </span>
                  <span className="flex items-center gap-1">
                    <MessageSquare className="h-3 w-3" />
                    Community: {Number(tool.community_score).toFixed(0)}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* External link button on hover */}
          {tool.website_url && (
            <a
              href={tool.website_url}
              target="_blank"
              rel="noopener noreferrer"
              className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity z-10"
              onClick={(e) => e.stopPropagation()}
            >
              <ExternalLink className="h-4 w-4 text-muted-foreground hover:text-foreground" />
            </a>
          )}
        </CardContent>
      </Card>
    </Link>
  );
}

