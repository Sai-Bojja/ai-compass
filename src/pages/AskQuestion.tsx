import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { Header } from "@/components/layout/Header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ChevronLeft, Loader2, X } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";

export default function AskQuestionPage() {
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [selectedTools, setSelectedTools] = useState<{ id: string; name: string }[]>([]);
  const [toolSearch, setToolSearch] = useState("");

  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch tools for tagging
  const { data: tools } = useQuery({
    queryKey: ["tools-search", toolSearch],
    queryFn: async () => {
      if (!toolSearch) return [];
      const { data, error } = await supabase
        .from("tools")
        .select("id, name, slug")
        .eq("status", "verified")
        .ilike("name", `%${toolSearch}%`)
        .limit(5);
      if (error) throw error;
      return data;
    },
    enabled: toolSearch.length > 1,
  });

  const createQuestion = useMutation({
    mutationFn: async () => {
      if (!user) throw new Error("Must be logged in");

      // Create question
      const { data: question, error: questionError } = await supabase
        .from("questions")
        .insert({
          user_id: user.id,
          title,
          body,
        })
        .select()
        .single();

      if (questionError) throw questionError;

      // Add tool mentions
      if (selectedTools.length > 0) {
        const mentions = selectedTools.map((tool) => ({
          question_id: question.id,
          tool_id: tool.id,
        }));

        const { error: mentionError } = await supabase
          .from("question_tool_mentions")
          .insert(mentions);

        if (mentionError) throw mentionError;
      }

      return question;
    },
    onSuccess: (question) => {
      queryClient.invalidateQueries({ queryKey: ["questions"] });
      toast({
        title: "Question posted!",
        description: "Your question has been published.",
      });
      navigate(`/community/questions/${question.id}`);
    },
    onError: (error) => {
      toast({
        variant: "destructive",
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to post question",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !body.trim()) return;
    createQuestion.mutate();
  };

  const addTool = (tool: { id: string; name: string }) => {
    if (!selectedTools.find((t) => t.id === tool.id)) {
      setSelectedTools([...selectedTools, tool]);
    }
    setToolSearch("");
  };

  const removeTool = (toolId: string) => {
    setSelectedTools(selectedTools.filter((t) => t.id !== toolId));
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container py-8">
          <div className="max-w-2xl mx-auto text-center py-16">
            <h1 className="text-2xl font-bold mb-4">Sign in to ask a question</h1>
            <Button asChild>
              <Link to="/auth">Sign In</Link>
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
        <Link
          to="/community"
          className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-6"
        >
          <ChevronLeft className="h-4 w-4" />
          Back to Community
        </Link>

        <div className="max-w-2xl">
          <h1 className="text-2xl font-bold mb-6">Ask a Question</h1>

          <form onSubmit={handleSubmit}>
            <Card>
              <CardContent className="pt-6 space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="title">Title</Label>
                  <Input
                    id="title"
                    placeholder="What's your question about AI tools?"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    required
                  />
                  <p className="text-xs text-muted-foreground">
                    Be specific and imagine you're asking another person
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="body">Details</Label>
                  <Textarea
                    id="body"
                    placeholder="Include all the information someone would need to answer your question..."
                    value={body}
                    onChange={(e) => setBody(e.target.value)}
                    rows={8}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label>Tag AI Tools (optional)</Label>
                  <div className="relative">
                    <Input
                      placeholder="Search for tools to tag..."
                      value={toolSearch}
                      onChange={(e) => setToolSearch(e.target.value)}
                    />
                    {tools && tools.length > 0 && (
                      <div className="absolute top-full left-0 right-0 mt-1 bg-popover border rounded-md shadow-lg z-10">
                        {tools.map((tool) => (
                          <button
                            key={tool.id}
                            type="button"
                            onClick={() => addTool(tool)}
                            className="w-full px-3 py-2 text-left text-sm hover:bg-secondary transition-colors"
                          >
                            {tool.name}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  {selectedTools.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-2">
                      {selectedTools.map((tool) => (
                        <Badge key={tool.id} variant="secondary" className="gap-1">
                          {tool.name}
                          <button
                            type="button"
                            onClick={() => removeTool(tool.id)}
                            className="hover:text-destructive"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>

                <Button
                  type="submit"
                  className="w-full"
                  disabled={createQuestion.isPending || !title.trim() || !body.trim()}
                >
                  {createQuestion.isPending ? (
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  ) : null}
                  Post Question
                </Button>
              </CardContent>
            </Card>
          </form>
        </div>
      </main>
    </div>
  );
}
