import { cn } from "@/lib/utils";
import { TrendingUp, Users, CheckCircle, HelpCircle } from "lucide-react";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

type ScoreBreakdownProps = {
  aiScore: number;
  communityScore: number;
  compositeScore: number;
  confidenceScore: number;
  className?: string;
  showLabels?: boolean;
};

function getScoreColor(score: number): string {
  if (score >= 85) return "bg-score-excellent";
  if (score >= 70) return "bg-score-good";
  if (score >= 50) return "bg-score-average";
  return "bg-score-poor";
}

function getTextScoreColor(score: number): string {
  if (score >= 85) return "text-score-excellent";
  if (score >= 70) return "text-score-good";
  if (score >= 50) return "text-score-average";
  return "text-score-poor";
}

export function ScoreBreakdown({
  aiScore,
  communityScore,
  compositeScore,
  confidenceScore,
  className,
  showLabels = true,
}: ScoreBreakdownProps) {
  // Calculate overall as simple average of AI and Community
  const overallScore = Math.round((aiScore + communityScore) / 2);

  const scores = [
    {
      label: "AI Score",
      value: aiScore,
      icon: TrendingUp,
      description: "Score based on AI analysis of features, documentation, and capabilities",
    },
    {
      label: "Community",
      value: communityScore,
      icon: Users,
      description: "Score derived from community discussions, votes, and sentiment",
    },
    {
      label: "Overall",
      value: overallScore,
      icon: CheckCircle,
      description: "Average of AI and community scores",
    },
    {
      label: "Confidence",
      value: confidenceScore,
      icon: HelpCircle,
      description: "How confident we are in the scores based on available data",
    },
  ];

  return (
    <div className={cn("grid grid-cols-2 gap-4", className)}>
      {scores.map((score) => (
        <div key={score.label} className="space-y-2">
          <div className="flex items-center justify-between">
            <Tooltip>
              <TooltipTrigger asChild>
                <span className="flex items-center gap-1.5 text-sm text-muted-foreground cursor-help">
                  <score.icon className="h-3.5 w-3.5" />
                  {showLabels && score.label}
                </span>
              </TooltipTrigger>
              <TooltipContent>
                <p className="max-w-xs text-sm">{score.description}</p>
              </TooltipContent>
            </Tooltip>
            <span className={cn("font-semibold tabular-nums", getTextScoreColor(score.value))}>
              {score.value.toFixed(0)}
            </span>
          </div>
          <div className="h-2 rounded-full bg-secondary overflow-hidden">
            <div
              className={cn("h-full rounded-full transition-all duration-500", getScoreColor(score.value))}
              style={{ width: `${score.value}%` }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}
