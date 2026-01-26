import { useParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { Header } from "@/components/layout/Header";
import { ScoreBreakdown } from "@/components/tools/ScoreBreakdown";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import {
  ExternalLink,
  ChevronLeft,
  CheckCircle2,
  Globe,
  DollarSign,
  Users,
  Zap,
} from "lucide-react";

export default function ToolDetailPage() {
  const { slug } = useParams<{ slug: string }>();

  const { data: tool, isLoading } = useQuery({
    queryKey: ["tool", slug],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("tools")
        .select(`
          *,
          tool_categories (
            category:categories (*)
          )
        `)
        .eq("slug", slug)
        .maybeSingle();

      if (error) throw error;
      if (!data) return null;

      let featuresArray: string[] = [];
      if (Array.isArray(data.features)) {
        featuresArray = data.features as string[];
      } else if (typeof data.features === "string") {
        try {
          featuresArray = JSON.parse(data.features);
        } catch {
          featuresArray = [];
        }
      }

      return {
        ...data,
        categories: (data.tool_categories as any)?.map((tc: any) => tc.category).filter(Boolean) || [],
        features: featuresArray,
      };
    },
    enabled: !!slug,
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container py-8">
          <Skeleton className="h-8 w-32 mb-6" />
          <div className="grid gap-8 lg:grid-cols-3">
            <div className="lg:col-span-2 space-y-6">
              <Skeleton className="h-48 w-full" />
              <Skeleton className="h-32 w-full" />
            </div>
            <div className="space-y-6">
              <Skeleton className="h-64 w-full" />
            </div>
          </div>
        </main>
      </div>
    );
  }

  if (!tool) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container py-8">
          <div className="text-center py-16">
            <h1 className="text-2xl font-bold mb-2">Tool Not Found</h1>
            <p className="text-muted-foreground mb-6">The tool you're looking for doesn't exist.</p>
            <Button asChild>
              <Link to="/tools">Browse All Tools</Link>
            </Button>
          </div>
        </main>
      </div>
    );
  }

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

        <div className="grid gap-8 lg:grid-cols-3">
          {/* Main content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Header */}
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 w-16 h-16 rounded-xl bg-secondary flex items-center justify-center overflow-hidden">
                {tool.logo_url ? (
                  <img
                    src={tool.logo_url}
                    alt={`${tool.name} logo`}
                    className="w-12 h-12 object-contain"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = "/placeholder.svg";
                    }}
                  />
                ) : (
                  <span className="text-2xl font-bold text-muted-foreground">
                    {tool.name.charAt(0)}
                  </span>
                )}
              </div>

              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <h1 className="text-2xl font-bold">{tool.name}</h1>
                  {tool.status === "verified" && (
                    <CheckCircle2 className="h-5 w-5 text-accent" />
                  )}
                </div>
                <p className="mt-1 text-lg text-muted-foreground">{tool.tagline}</p>
              </div>

              {tool.website_url && (
                <Button asChild>
                  <a href={tool.website_url} target="_blank" rel="noopener noreferrer">
                    Visit Website
                    <ExternalLink className="ml-2 h-4 w-4" />
                  </a>
                </Button>
              )}
            </div>

            {/* Categories & pricing */}
            <div className="flex flex-wrap gap-2">
              {tool.categories?.map((cat: any) => (
                <Badge key={cat.id} variant="secondary">
                  {cat.name}
                </Badge>
              ))}
              <Badge variant="outline" className="capitalize">
                <DollarSign className="mr-1 h-3 w-3" />
                {tool.pricing_model?.replace("_", " ")}
              </Badge>
            </div>

            <Separator />

            {/* Description */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">About</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground leading-relaxed">
                  {tool.description || "No description available."}
                </p>
              </CardContent>
            </Card>

            {/* Features */}
            {tool.features && tool.features.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Zap className="h-5 w-5 text-primary" />
                    Features
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="grid sm:grid-cols-2 gap-2">
                    {tool.features.map((feature: string, index: number) => (
                      <li key={index} className="flex items-center gap-2 text-sm">
                        <CheckCircle2 className="h-4 w-4 text-accent flex-shrink-0" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            )}

            {/* Target users */}
            {tool.target_users && tool.target_users.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Users className="h-5 w-5 text-primary" />
                    Best For
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {tool.target_users.map((user: string, index: number) => (
                      <Badge key={index} variant="outline" className="capitalize">
                        {user}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Score breakdown */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Score Breakdown</CardTitle>
              </CardHeader>
              <CardContent>
                <ScoreBreakdown
                  aiScore={Number(tool.ai_score)}
                  communityScore={Number(tool.community_score)}
                  compositeScore={Number(tool.composite_score)}
                  confidenceScore={Number(tool.confidence_score)}
                />
              </CardContent>
            </Card>

            {/* Quick info */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Quick Info</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Status</span>
                  <Badge variant="secondary" className="capitalize">
                    {tool.status}
                  </Badge>
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Questions</span>
                  <span className="font-medium">{tool.question_count}</span>
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Mentions</span>
                  <span className="font-medium">{tool.mention_count}</span>
                </div>
              </CardContent>
            </Card>

            {/* Sources */}
            {tool.source_urls && tool.source_urls.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Globe className="h-5 w-5" />
                    Sources
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {tool.source_urls.map((url: string, index: number) => (
                      <li key={index}>
                        <a
                          href={url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm text-primary hover:underline flex items-center gap-1 truncate"
                        >
                          <ExternalLink className="h-3 w-3 flex-shrink-0" />
                          {new URL(url).hostname}
                        </a>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
