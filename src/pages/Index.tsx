import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { Header } from "@/components/layout/Header";
import { ToolCard } from "@/components/tools/ToolCard";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  ArrowRight,
  Sparkles,
  Code,
  PenTool,
  Lightbulb,
  TrendingUp,
  Users,
  MessageCircle,
  Zap,
} from "lucide-react";

const categories = [
  {
    slug: "code",
    name: "Code",
    icon: Code,
    description: "AI assistants for development",
    color: "category-code",
  },
  {
    slug: "writing",
    name: "Writing",
    icon: PenTool,
    description: "Content creation & editing",
    color: "category-writing",
  },
  {
    slug: "brainstorming",
    name: "Brainstorming",
    icon: Lightbulb,
    description: "Ideation & problem-solving",
    color: "category-brainstorm",
  },
];

const features = [
  {
    icon: TrendingUp,
    title: "AI-Powered Rankings",
    description:
      "Tools are evaluated by AI agents analyzing features, documentation, and capabilities",
  },
  {
    icon: Users,
    title: "Community Signals",
    description:
      "Rankings adapt based on real user feedback, discussions, and recommendations",
  },
  {
    icon: MessageCircle,
    title: "Ask the AI",
    description:
      "Chat with our AI assistant to get personalized tool recommendations",
  },
  {
    icon: Zap,
    title: "Always Current",
    description:
      "Our agents continuously discover and re-evaluate tools as they evolve",
  },
];

export default function Index() {
  const { data: topTools, isLoading } = useQuery({
    queryKey: ["top-tools"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("tools")
        .select(`
          *,
          tool_categories (
            category:categories (*)
          )
        `)
        .eq("status", "verified")
        .order("composite_score", { ascending: false })
        .limit(5);

      if (error) throw error;

      return data?.map((tool: any) => ({
        ...tool,
        categories: tool.tool_categories?.map((tc: any) => tc.category).filter(Boolean) || [],
      }));
    },
  });

  return (
    <div className="min-h-screen bg-background">
      <Header />

      {/* Hero Section */}
      <section className="relative overflow-hidden border-b bg-gradient-to-b from-secondary/50 to-background">
        <div className="container py-16 md:py-24">
          <div className="max-w-3xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6">
              <Sparkles className="h-4 w-4" />
              AI-Powered Tool Intelligence
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight mb-6">
              Discover the{" "}
              <span className="text-gradient">Best AI Tools</span>
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              Our AI agents discover, evaluate, and rank AI tools. The community validates.
              Find the perfect tool for coding, writing, or brainstorming—backed by data, not hype.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" asChild>
                <Link to="/tools">
                  Explore Tools
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link to="/chat">
                  <MessageCircle className="mr-2 h-4 w-4" />
                  Ask the AI
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="container py-16">
        <div className="text-center mb-10">
          <h2 className="text-2xl md:text-3xl font-bold mb-3">Browse by Category</h2>
          <p className="text-muted-foreground">
            Find the best AI tools for your specific needs
          </p>
        </div>
        <div className="grid md:grid-cols-3 gap-6">
          {categories.map((cat) => {
            const Icon = cat.icon;
            return (
              <Link key={cat.slug} to={`/tools?category=${cat.slug}`}>
                <Card className="h-full transition-all duration-300 hover:shadow-card-hover hover:-translate-y-1">
                  <CardContent className="p-6">
                    <div
                      className={`inline-flex items-center justify-center w-12 h-12 rounded-lg ${cat.color} mb-4`}
                    >
                      <Icon className="h-6 w-6" />
                    </div>
                    <h3 className="text-lg font-semibold mb-2">{cat.name}</h3>
                    <p className="text-muted-foreground text-sm">{cat.description}</p>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>
      </section>

      {/* Top Ranked Tools */}
      <section className="container py-16 border-t">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl md:text-3xl font-bold mb-2">Top Ranked Tools</h2>
            <p className="text-muted-foreground">
              The highest-rated AI tools across all categories
            </p>
          </div>
          <Button variant="outline" asChild className="hidden sm:flex">
            <Link to="/tools">
              View All
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>

        {isLoading ? (
          <div className="space-y-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <Skeleton key={i} className="h-32 w-full rounded-lg" />
            ))}
          </div>
        ) : topTools && topTools.length > 0 ? (
          <div className="space-y-4">
            {topTools.map((tool: any, index: number) => (
              <ToolCard key={tool.id} tool={tool} rank={index + 1} showRank />
            ))}
          </div>
        ) : (
          <p className="text-center text-muted-foreground py-8">
            No tools found. Check back soon!
          </p>
        )}

        <div className="mt-8 text-center sm:hidden">
          <Button asChild>
            <Link to="/tools">
              View All Tools
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
      </section>

      {/* How it works */}
      <section className="bg-secondary/30 border-t">
        <div className="container py-16">
          <div className="text-center mb-12">
            <h2 className="text-2xl md:text-3xl font-bold mb-3">How It Works</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Our hybrid ranking system combines AI analysis with community wisdom
            </p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <div key={index} className="text-center">
                  <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-primary/10 text-primary mb-4">
                    <Icon className="h-6 w-6" />
                  </div>
                  <h3 className="font-semibold mb-2">{feature.title}</h3>
                  <p className="text-sm text-muted-foreground">{feature.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="container py-16">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-2xl md:text-3xl font-bold mb-4">
            Ready to find your perfect AI tool?
          </h2>
          <p className="text-muted-foreground mb-8">
            Ask our AI assistant for personalized recommendations based on your needs.
          </p>
          <Button size="lg" asChild>
            <Link to="/chat">
              <Sparkles className="mr-2 h-4 w-4" />
              Start Chatting
            </Link>
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t bg-secondary/20">
        <div className="container py-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                <Sparkles className="h-4 w-4" />
              </div>
              <span className="font-semibold">Aideas<span className="text-primary">.ai</span></span>
            </div>
            <p className="text-sm text-muted-foreground">
              Discover, compare, and choose the best AI tools—powered by AI, validated by humans.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
