import { useParams, Link } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { Header } from "@/components/layout/Header";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  ChevronLeft,
  ThumbsUp,
  ThumbsDown,
  CheckCircle2,
  Clock,
  MessageSquare,
  Loader2,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";

export default function QuestionDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [answerBody, setAnswerBody] = useState("");
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: question, isLoading } = useQuery({
    queryKey: ["question", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("questions")
        .select(`
          *,
          question_tool_mentions (
            tool:tools (id, name, slug)
          )
        `)
        .eq("id", id)
        .maybeSingle();

      if (error) throw error;
      if (!data) return null;

      // Fetch profile separately
      const { data: profile } = await supabase
        .from("profiles")
        .select("username, display_name, avatar_url, reputation_score")
        .eq("user_id", data.user_id)
        .maybeSingle();

      return { ...data, profiles: profile };
    },
    enabled: !!id,
  });

  const { data: answers } = useQuery({
    queryKey: ["answers", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("answers")
        .select("*")
        .eq("question_id", id)
        .eq("status", "active")
        .order("is_accepted", { ascending: false })
        .order("upvotes", { ascending: false });

      if (error) throw error;

      // Fetch profiles for each answer
      const answersWithProfiles = await Promise.all(
        (data || []).map(async (answer) => {
          const { data: profile } = await supabase
            .from("profiles")
            .select("username, display_name, avatar_url, reputation_score")
            .eq("user_id", answer.user_id)
            .maybeSingle();
          return { ...answer, profiles: profile };
        })
      );

      return answersWithProfiles;
    },
    enabled: !!id,
  });

  const submitAnswer = useMutation({
    mutationFn: async () => {
      if (!user || !id) throw new Error("Must be logged in");

      const { error } = await supabase.from("answers").insert({
        question_id: id,
        user_id: user.id,
        body: answerBody,
      });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["answers", id] });
      queryClient.invalidateQueries({ queryKey: ["question", id] });
      setAnswerBody("");
      toast({
        title: "Answer posted!",
        description: "Your answer has been published.",
      });
    },
    onError: (error) => {
      toast({
        variant: "destructive",
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to post answer",
      });
    },
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container py-8">
          <Skeleton className="h-8 w-32 mb-6" />
          <Skeleton className="h-48 w-full mb-6" />
          <Skeleton className="h-32 w-full" />
        </main>
      </div>
    );
  }

  if (!question) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container py-8">
          <div className="text-center py-16">
            <h1 className="text-2xl font-bold mb-2">Question Not Found</h1>
            <p className="text-muted-foreground mb-6">This question doesn't exist or was removed.</p>
            <Button asChild>
              <Link to="/community">Back to Community</Link>
            </Button>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="container py-8 max-w-4xl">
        <Link
          to="/community"
          className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-6"
        >
          <ChevronLeft className="h-4 w-4" />
          Back to Community
        </Link>

        {/* Question */}
        <Card className="mb-8">
          <CardContent className="p-6">
            <h1 className="text-2xl font-bold mb-4">
              {question.title}
              {question.is_answered && (
                <CheckCircle2 className="inline ml-2 h-5 w-5 text-accent" />
              )}
            </h1>

            <p className="text-foreground whitespace-pre-wrap leading-relaxed mb-4">
              {question.body}
            </p>

            {/* Tool mentions */}
            {question.question_tool_mentions?.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-4">
                {question.question_tool_mentions.map((mention: any) => (
                  mention.tool && (
                    <Link key={mention.tool.id} to={`/tools/${mention.tool.slug}`}>
                      <Badge variant="secondary" className="hover:bg-secondary/80">
                        {mention.tool.name}
                      </Badge>
                    </Link>
                  )
                ))}
              </div>
            )}

            <Separator className="my-4" />

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Button variant="ghost" size="sm">
                  <ThumbsUp className="h-4 w-4 mr-1" />
                  {question.upvotes}
                </Button>
                <Button variant="ghost" size="sm">
                  <ThumbsDown className="h-4 w-4 mr-1" />
                  {question.downvotes}
                </Button>
              </div>

              <div className="flex items-center gap-3 text-sm text-muted-foreground">
                <Avatar className="h-6 w-6">
                  <AvatarImage src={question.profiles?.avatar_url} />
                  <AvatarFallback>
                    {question.profiles?.display_name?.charAt(0) || "?"}
                  </AvatarFallback>
                </Avatar>
                <span>{question.profiles?.display_name || "Anonymous"}</span>
                <span className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  {formatDistanceToNow(new Date(question.created_at), { addSuffix: true })}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Answers */}
        <div className="mb-8">
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            {answers?.length || 0} Answers
          </h2>

          {answers && answers.length > 0 ? (
            <div className="space-y-4">
              {answers.map((answer: any) => (
                <Card key={answer.id} className={answer.is_accepted ? "border-accent" : ""}>
                  <CardContent className="p-5">
                    {answer.is_accepted && (
                      <Badge className="mb-3 bg-accent text-accent-foreground">
                        <CheckCircle2 className="h-3 w-3 mr-1" />
                        Accepted Answer
                      </Badge>
                    )}

                    <p className="text-foreground whitespace-pre-wrap leading-relaxed mb-4">
                      {answer.body}
                    </p>

                    <Separator className="my-4" />

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <Button variant="ghost" size="sm">
                          <ThumbsUp className="h-4 w-4 mr-1" />
                          {answer.upvotes}
                        </Button>
                        <Button variant="ghost" size="sm">
                          <ThumbsDown className="h-4 w-4 mr-1" />
                          {answer.downvotes}
                        </Button>
                      </div>

                      <div className="flex items-center gap-3 text-sm text-muted-foreground">
                        <Avatar className="h-6 w-6">
                          <AvatarImage src={answer.profiles?.avatar_url} />
                          <AvatarFallback>
                            {answer.profiles?.display_name?.charAt(0) || "?"}
                          </AvatarFallback>
                        </Avatar>
                        <span>{answer.profiles?.display_name || "Anonymous"}</span>
                        <span>
                          {formatDistanceToNow(new Date(answer.created_at), { addSuffix: true })}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <p className="text-muted-foreground text-center py-8">
              No answers yet. Be the first to help!
            </p>
          )}
        </div>

        {/* Add answer form */}
        {user ? (
          <Card>
            <CardContent className="p-6">
              <h3 className="font-semibold mb-4">Your Answer</h3>
              <Textarea
                placeholder="Share your knowledge and experience..."
                value={answerBody}
                onChange={(e) => setAnswerBody(e.target.value)}
                rows={6}
                className="mb-4"
              />
              <Button
                onClick={() => submitAnswer.mutate()}
                disabled={submitAnswer.isPending || !answerBody.trim()}
              >
                {submitAnswer.isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : null}
                Post Answer
              </Button>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardContent className="p-6 text-center">
              <p className="text-muted-foreground mb-4">Sign in to post an answer</p>
              <Button asChild>
                <Link to="/auth">Sign In</Link>
              </Button>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  );
}
