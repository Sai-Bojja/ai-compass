import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { Header } from "@/components/layout/Header";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import {
  MessageSquare,
  ThumbsUp,
  Eye,
  Search,
  Plus,
  CheckCircle2,
  Clock,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { useAuth } from "@/hooks/useAuth";

export default function CommunityPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const { user } = useAuth();

  const { data: questions, isLoading } = useQuery({
    queryKey: ["questions"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("questions")
        .select(`
          *,
          profiles:user_id (username, display_name, avatar_url),
          question_tool_mentions (
            tool:tools (id, name, slug)
          )
        `)
        .eq("status", "active")
        .order("created_at", { ascending: false })
        .limit(20);

      if (error) throw error;
      return data;
    },
  });

  const filteredQuestions = questions?.filter((q) =>
    searchQuery
      ? q.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        q.body.toLowerCase().includes(searchQuery.toLowerCase())
      : true
  );

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="container py-8">
        {/* Page header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Community</h1>
            <p className="mt-2 text-muted-foreground">
              Ask questions, share experiences, and help others discover great AI tools
            </p>
          </div>
          <Button asChild>
            <Link to={user ? "/community/ask" : "/auth"}>
              <Plus className="mr-2 h-4 w-4" />
              Ask Question
            </Link>
          </Button>
        </div>

        {/* Search */}
        <div className="mb-6">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search questions..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
        </div>

        {/* Questions list */}
        {isLoading ? (
          <div className="space-y-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <Skeleton key={i} className="h-28 w-full rounded-lg" />
            ))}
          </div>
        ) : filteredQuestions && filteredQuestions.length > 0 ? (
          <div className="space-y-4">
            {filteredQuestions.map((question: any) => (
              <Card key={question.id} className="transition-colors hover:bg-secondary/30">
                <CardContent className="p-5">
                  <div className="flex gap-4">
                    {/* Stats */}
                    <div className="hidden sm:flex flex-col items-center gap-2 text-center min-w-[60px]">
                      <div className="flex flex-col items-center">
                        <span className="font-semibold">{question.upvotes - question.downvotes}</span>
                        <span className="text-xs text-muted-foreground">votes</span>
                      </div>
                      <div className={`flex flex-col items-center ${question.is_answered ? "text-accent" : ""}`}>
                        <span className="font-semibold">{question.answer_count}</span>
                        <span className="text-xs text-muted-foreground">answers</span>
                      </div>
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <Link
                        to={`/community/questions/${question.id}`}
                        className="font-semibold text-foreground hover:text-primary transition-colors line-clamp-2"
                      >
                        {question.title}
                        {question.is_answered && (
                          <CheckCircle2 className="inline ml-2 h-4 w-4 text-accent" />
                        )}
                      </Link>

                      <p className="mt-1 text-sm text-muted-foreground line-clamp-2">
                        {question.body}
                      </p>

                      {/* Tool mentions */}
                      {question.question_tool_mentions?.length > 0 && (
                        <div className="mt-2 flex flex-wrap gap-1">
                          {question.question_tool_mentions.map((mention: any) => (
                            mention.tool && (
                              <Badge key={mention.tool.id} variant="secondary" className="text-xs">
                                {mention.tool.name}
                              </Badge>
                            )
                          ))}
                        </div>
                      )}

                      {/* Meta */}
                      <div className="mt-3 flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                        <span>
                          by <span className="font-medium">{question.profiles?.display_name || "Anonymous"}</span>
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {formatDistanceToNow(new Date(question.created_at), { addSuffix: true })}
                        </span>
                        <span className="flex items-center gap-1">
                          <Eye className="h-3 w-3" />
                          {question.view_count} views
                        </span>
                        
                        {/* Mobile stats */}
                        <div className="flex items-center gap-3 sm:hidden">
                          <span className="flex items-center gap-1">
                            <ThumbsUp className="h-3 w-3" />
                            {question.upvotes - question.downvotes}
                          </span>
                          <span className="flex items-center gap-1">
                            <MessageSquare className="h-3 w-3" />
                            {question.answer_count}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="font-semibold mb-2">No questions yet</h3>
            <p className="text-muted-foreground mb-6">
              Be the first to start a discussion!
            </p>
            <Button asChild>
              <Link to={user ? "/community/ask" : "/auth"}>Ask a Question</Link>
            </Button>
          </div>
        )}
      </main>
    </div>
  );
}
