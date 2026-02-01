import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { Header } from "@/components/layout/Header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import {
    CheckCircle2,
    XCircle,
    Clock,
    TrendingUp,
    TrendingDown,
    AlertTriangle,
    Shield,
    RefreshCw
} from "lucide-react";

type PendingReview = {
    id: string;
    tool_id: string;
    tool_name: string;
    tool_slug: string;
    score_type: 'ai' | 'community' | 'composite';
    old_score: number;
    new_score: number;
    delta: number;
    abs_delta: number;
    reason: string;
    status: string;
    created_at: string;
    expires_at: string;
    urgency: 'ACTIVE' | 'SOON' | 'URGENT' | 'EXPIRED';
    hours_remaining: number;
};

type ScoringDashboard = {
    total_tools: number;
    tools_with_ai_scores: number;
    tools_with_community_scores: number;
    pending_reviews: number;
    approved_changes: number;
    denied_changes: number;
    last_ranking_run: string | null;
    last_community_run: string | null;
};

export default function AdminPage() {
    const { toast } = useToast();
    const queryClient = useQueryClient();
    const [adminNotes, setAdminNotes] = useState<Record<string, string>>({});

    // Fetch dashboard stats (view not in generated types)
    const { data: dashboard, isLoading: dashboardLoading } = useQuery({
        queryKey: ["scoring-dashboard"],
        queryFn: async () => {
            const { data, error } = await (supabase as any)
                .from("scoring_dashboard")
                .select("*")
                .single();
            if (error) throw error;
            return data as ScoringDashboard;
        },
    });

    // Fetch pending reviews (view not in generated types)
    const { data: pendingReviews, isLoading: reviewsLoading, refetch } = useQuery({
        queryKey: ["pending-reviews"],
        queryFn: async () => {
            const { data, error } = await (supabase as any)
                .from("pending_reviews")
                .select("*")
                .order("created_at", { ascending: false });
            if (error) throw error;
            return data as PendingReview[];
        },
    });

    // Approve mutation (function not in generated types)
    const approveMutation = useMutation({
        mutationFn: async ({ id, notes }: { id: string; notes?: string }) => {
            const { data, error } = await (supabase as any).rpc("approve_score_change", {
                p_pending_id: id,
                p_admin_notes: notes || null,
            });
            if (error) throw error;
            return data;
        },
        onSuccess: (data: any) => {
            queryClient.invalidateQueries({ queryKey: ["pending-reviews"] });
            queryClient.invalidateQueries({ queryKey: ["scoring-dashboard"] });
            toast({
                title: "Score Change Approved",
                description: `Updated ${data?.[0]?.tool_name || "tool"} score`,
            });
        },
        onError: (error: Error) => {
            toast({
                title: "Error",
                description: error.message,
                variant: "destructive",
            });
        },
    });

    // Deny mutation (function not in generated types)
    const denyMutation = useMutation({
        mutationFn: async ({ id, notes }: { id: string; notes?: string }) => {
            const { data, error } = await (supabase as any).rpc("deny_score_change", {
                p_pending_id: id,
                p_admin_notes: notes || null,
            });
            if (error) throw error;
            return data;
        },
        onSuccess: (data: any) => {
            queryClient.invalidateQueries({ queryKey: ["pending-reviews"] });
            queryClient.invalidateQueries({ queryKey: ["scoring-dashboard"] });
            toast({
                title: "Score Change Denied",
                description: `${data?.[0]?.tool_name || "Tool"} will keep its previous score`,
            });
        },
        onError: (error: Error) => {
            toast({
                title: "Error",
                description: error.message,
                variant: "destructive",
            });
        },
    });

    const getUrgencyColor = (urgency: string) => {
        switch (urgency) {
            case "URGENT":
                return "bg-red-500";
            case "SOON":
                return "bg-yellow-500";
            case "ACTIVE":
                return "bg-green-500";
            default:
                return "bg-gray-500";
        }
    };

    const getScoreTypeLabel = (type: string) => {
        switch (type) {
            case "ai":
                return "AI Score";
            case "community":
                return "Community Score";
            default:
                return "Composite Score";
        }
    };

    const formatTimeAgo = (dateString: string) => {
        const date = new Date(dateString);
        const now = new Date();
        const diffMs = now.getTime() - date.getTime();
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMins / 60);
        const diffDays = Math.floor(diffHours / 24);

        if (diffDays > 0) return `${diffDays}d ago`;
        if (diffHours > 0) return `${diffHours}h ago`;
        return `${diffMins}m ago`;
    };

    return (
        <div className="min-h-screen bg-background">
            <Header />

            <main className="container py-8">
                {/* Page header */}
                <div className="mb-8 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <Shield className="h-8 w-8 text-primary" />
                        <div>
                            <h1 className="text-3xl font-bold tracking-tight">Admin Dashboard</h1>
                            <p className="text-muted-foreground">
                                Review and approve score changes that exceed the ±12 point threshold
                            </p>
                        </div>
                    </div>
                    <Button variant="outline" onClick={() => refetch()}>
                        <RefreshCw className="mr-2 h-4 w-4" />
                        Refresh
                    </Button>
                </div>

                {/* Stats cards */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                    {dashboardLoading ? (
                        <>
                            {[1, 2, 3, 4].map((i) => (
                                <Skeleton key={i} className="h-24 rounded-lg" />
                            ))}
                        </>
                    ) : dashboard ? (
                        <>
                            <Card>
                                <CardHeader className="pb-2">
                                    <CardDescription>Pending Reviews</CardDescription>
                                    <CardTitle className="text-3xl text-orange-500">
                                        {dashboard.pending_reviews}
                                    </CardTitle>
                                </CardHeader>
                            </Card>
                            <Card>
                                <CardHeader className="pb-2">
                                    <CardDescription>Approved</CardDescription>
                                    <CardTitle className="text-3xl text-green-500">
                                        {dashboard.approved_changes}
                                    </CardTitle>
                                </CardHeader>
                            </Card>
                            <Card>
                                <CardHeader className="pb-2">
                                    <CardDescription>Denied</CardDescription>
                                    <CardTitle className="text-3xl text-red-500">
                                        {dashboard.denied_changes}
                                    </CardTitle>
                                </CardHeader>
                            </Card>
                            <Card>
                                <CardHeader className="pb-2">
                                    <CardDescription>Tools with AI Scores</CardDescription>
                                    <CardTitle className="text-3xl">
                                        {dashboard.tools_with_ai_scores}/{dashboard.total_tools}
                                    </CardTitle>
                                </CardHeader>
                            </Card>
                        </>
                    ) : null}
                </div>

                {/* Last run info */}
                {dashboard && (
                    <div className="flex gap-4 mb-8 text-sm text-muted-foreground">
                        <div className="flex items-center gap-2">
                            <Clock className="h-4 w-4" />
                            Last Ranking Run:{" "}
                            {dashboard.last_ranking_run
                                ? formatTimeAgo(dashboard.last_ranking_run)
                                : "Never"}
                        </div>
                        <div className="flex items-center gap-2">
                            <Clock className="h-4 w-4" />
                            Last Community Run:{" "}
                            {dashboard.last_community_run
                                ? formatTimeAgo(dashboard.last_community_run)
                                : "Never"}
                        </div>
                    </div>
                )}

                {/* Pending reviews */}
                <h2 className="text-xl font-semibold mb-4">Pending Score Changes</h2>

                {reviewsLoading ? (
                    <div className="space-y-4">
                        {[1, 2, 3].map((i) => (
                            <Skeleton key={i} className="h-40 rounded-lg" />
                        ))}
                    </div>
                ) : pendingReviews && pendingReviews.length > 0 ? (
                    <div className="space-y-4">
                        {pendingReviews.map((review) => (
                            <Card key={review.id} className="overflow-hidden">
                                <div className={`h-1 ${getUrgencyColor(review.urgency)}`} />
                                <CardHeader className="pb-2">
                                    <div className="flex items-start justify-between">
                                        <div>
                                            <CardTitle className="text-lg flex items-center gap-2">
                                                {review.tool_name}
                                                <Badge variant="outline">{getScoreTypeLabel(review.score_type)}</Badge>
                                                <Badge
                                                    variant={review.urgency === "URGENT" ? "destructive" : "secondary"}
                                                >
                                                    {review.urgency}
                                                </Badge>
                                            </CardTitle>
                                            <CardDescription className="mt-1">
                                                {review.reason}
                                            </CardDescription>
                                        </div>
                                        <div className="text-right text-sm text-muted-foreground">
                                            <div>{formatTimeAgo(review.created_at)}</div>
                                            <div className="flex items-center gap-1 mt-1">
                                                <Clock className="h-3 w-3" />
                                                {Math.round(review.hours_remaining)}h left
                                            </div>
                                        </div>
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    {/* Score comparison */}
                                    <div className="flex items-center gap-8 mb-4">
                                        <div className="text-center">
                                            <div className="text-sm text-muted-foreground">Current</div>
                                            <div className="text-2xl font-bold">{review.old_score}</div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            {review.delta > 0 ? (
                                                <TrendingUp className="h-6 w-6 text-green-500" />
                                            ) : (
                                                <TrendingDown className="h-6 w-6 text-red-500" />
                                            )}
                                            <span className={`text-lg font-semibold ${review.delta > 0 ? "text-green-500" : "text-red-500"
                                                }`}>
                                                {review.delta > 0 ? "+" : ""}{review.delta.toFixed(1)}
                                            </span>
                                        </div>
                                        <div className="text-center">
                                            <div className="text-sm text-muted-foreground">Proposed</div>
                                            <div className="text-2xl font-bold">{review.new_score}</div>
                                        </div>
                                    </div>

                                    {/* Admin notes */}
                                    <Textarea
                                        placeholder="Add notes (optional)..."
                                        value={adminNotes[review.id] || ""}
                                        onChange={(e) =>
                                            setAdminNotes((prev) => ({
                                                ...prev,
                                                [review.id]: e.target.value,
                                            }))
                                        }
                                        className="mb-4 h-16"
                                    />

                                    {/* Actions */}
                                    <div className="flex gap-3">
                                        <Button
                                            onClick={() =>
                                                approveMutation.mutate({
                                                    id: review.id,
                                                    notes: adminNotes[review.id],
                                                })
                                            }
                                            disabled={approveMutation.isPending}
                                            className="flex-1"
                                        >
                                            <CheckCircle2 className="mr-2 h-4 w-4" />
                                            Approve
                                        </Button>
                                        <Button
                                            variant="destructive"
                                            onClick={() =>
                                                denyMutation.mutate({
                                                    id: review.id,
                                                    notes: adminNotes[review.id],
                                                })
                                            }
                                            disabled={denyMutation.isPending}
                                            className="flex-1"
                                        >
                                            <XCircle className="mr-2 h-4 w-4" />
                                            Deny
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                ) : (
                    <Card>
                        <CardContent className="py-12 text-center">
                            <CheckCircle2 className="mx-auto h-12 w-12 text-green-500 mb-4" />
                            <h3 className="text-lg font-medium">All Caught Up!</h3>
                            <p className="text-muted-foreground">
                                No pending score changes require review. Score changes within ±12 points are auto-approved.
                            </p>
                        </CardContent>
                    </Card>
                )}

                {/* Threshold reminder */}
                <Card className="mt-8 bg-muted/50">
                    <CardContent className="py-4">
                        <div className="flex items-start gap-3">
                            <AlertTriangle className="h-5 w-5 text-yellow-500 mt-0.5" />
                            <div className="text-sm">
                                <p className="font-medium">Score Change Thresholds</p>
                                <p className="text-muted-foreground">
                                    AI scores: ±12 points auto-approved • Community scores: ±15 points auto-approved •
                                    Larger changes require manual review • Unreviewed changes expire after 48 hours
                                </p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </main>
        </div>
    );
}
