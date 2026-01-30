import { useState } from "react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
    Collapsible,
    CollapsibleContent,
    CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
    Tooltip,
    TooltipContent,
    TooltipTrigger,
} from "@/components/ui/tooltip";
import {
    ChevronDown,
    ChevronUp,
    Zap,
    FileText,
    DollarSign,
    Target,
    Lightbulb,
    CheckCircle2,
    AlertTriangle,
    HelpCircle,
} from "lucide-react";

// =====================================================
// AI SCORE EXPLAINER COMPONENT
// =====================================================
// Displays per-dimension AI score breakdown with visual bars,
// rationale, strengths/weaknesses. Read-only, presentation-only.
// =====================================================

interface DimensionScore {
    score: number;
    evidence?: {
        present: string[];
        missing_or_limited: string[];
    };
    rationale?: string;
}

interface AIScoreComponents {
    feature_completeness?: DimensionScore;
    documentation_quality?: DimensionScore;
    pricing_clarity?: DimensionScore;
    use_case_coverage?: DimensionScore;
    innovation?: DimensionScore;
    overall_summary?: string;
    // Legacy format support
    strengths?: string[];
    weaknesses?: string[];
    reasoning?: string;
}

interface AIScoreExplainerProps {
    aiScore: number;
    aiScoreComponents?: AIScoreComponents | null;
    className?: string;
}

// Dimension configuration
const DIMENSIONS = [
    {
        key: "feature_completeness" as const,
        label: "Features",
        icon: Zap,
        description: "Comprehensiveness and capability coverage",
    },
    {
        key: "documentation_quality" as const,
        label: "Docs",
        icon: FileText,
        description: "Quality of documentation and learning resources",
    },
    {
        key: "pricing_clarity" as const,
        label: "Pricing",
        icon: DollarSign,
        description: "Transparency and clarity of pricing model",
    },
    {
        key: "use_case_coverage" as const,
        label: "Use Cases",
        icon: Target,
        description: "Breadth of applicable use cases",
    },
    {
        key: "innovation" as const,
        label: "Innovation",
        icon: Lightbulb,
        description: "Technical differentiation and uniqueness",
    },
];

function getScoreColor(score: number): string {
    if (score >= 85) return "bg-emerald-500";
    if (score >= 70) return "bg-green-500";
    if (score >= 50) return "bg-amber-500";
    return "bg-red-500";
}

function getScoreTextColor(score: number): string {
    if (score >= 85) return "text-emerald-600 dark:text-emerald-400";
    if (score >= 70) return "text-green-600 dark:text-green-400";
    if (score >= 50) return "text-amber-600 dark:text-amber-400";
    return "text-red-600 dark:text-red-400";
}

function getScoreLabel(score: number): string {
    if (score >= 85) return "Excellent";
    if (score >= 70) return "Good";
    if (score >= 50) return "Average";
    return "Below Average";
}

// Individual dimension row
function DimensionRow({
    label,
    icon: Icon,
    description,
    score,
    rationale,
}: {
    label: string;
    icon: React.ElementType;
    description: string;
    score: number;
    rationale?: string;
}) {
    const [isExpanded, setIsExpanded] = useState(false);

    return (
        <div className="space-y-1">
            <div className="flex items-center gap-2">
                <Tooltip>
                    <TooltipTrigger asChild>
                        <span className="flex items-center gap-1.5 text-sm text-muted-foreground cursor-help min-w-[80px]">
                            <Icon className="h-3.5 w-3.5" />
                            {label}
                        </span>
                    </TooltipTrigger>
                    <TooltipContent>
                        <p className="max-w-xs text-sm">{description}</p>
                    </TooltipContent>
                </Tooltip>

                {/* Progress bar */}
                <div className="flex-1 h-2 rounded-full bg-secondary overflow-hidden">
                    <div
                        className={cn(
                            "h-full rounded-full transition-all duration-500",
                            getScoreColor(score)
                        )}
                        style={{ width: `${score}%` }}
                    />
                </div>

                {/* Score */}
                <span
                    className={cn(
                        "font-semibold tabular-nums text-sm min-w-[32px] text-right",
                        getScoreTextColor(score)
                    )}
                >
                    {score}
                </span>

                {/* Expand button for rationale */}
                {rationale && (
                    <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 w-6 p-0 text-muted-foreground"
                        onClick={() => setIsExpanded(!isExpanded)}
                    >
                        <HelpCircle className="h-3.5 w-3.5" />
                    </Button>
                )}
            </div>

            {/* Rationale (expandable) */}
            {rationale && isExpanded && (
                <p className="text-xs text-muted-foreground pl-6 pr-8 py-1 bg-muted/50 rounded">
                    {rationale}
                </p>
            )}
        </div>
    );
}

export function AIScoreExplainer({
    aiScore,
    aiScoreComponents,
    className,
}: AIScoreExplainerProps) {
    const [showDetails, setShowDetails] = useState(false);

    // Early return if no components data
    if (!aiScoreComponents) {
        return (
            <div className={cn("space-y-4", className)}>
                {/* Overall score only */}
                <div className="text-center">
                    <div
                        className={cn(
                            "text-4xl font-bold tabular-nums",
                            getScoreTextColor(aiScore)
                        )}
                    >
                        {aiScore.toFixed(1)}
                    </div>
                    <div className="text-sm text-muted-foreground mt-1">
                        {getScoreLabel(aiScore)}
                    </div>
                </div>
                <p className="text-xs text-muted-foreground text-center">
                    Detailed breakdown not available for this tool.
                </p>
            </div>
        );
    }

    // Extract strengths and weaknesses
    const allStrengths: string[] = [];
    const allWeaknesses: string[] = [];

    // Collect from all dimensions
    DIMENSIONS.forEach((dim) => {
        const data = aiScoreComponents[dim.key];
        if (data?.evidence?.present) {
            allStrengths.push(...data.evidence.present);
        }
        if (data?.evidence?.missing_or_limited) {
            allWeaknesses.push(...data.evidence.missing_or_limited);
        }
    });

    // Also include legacy format
    if (aiScoreComponents.strengths) {
        allStrengths.push(...aiScoreComponents.strengths);
    }
    if (aiScoreComponents.weaknesses) {
        allWeaknesses.push(...aiScoreComponents.weaknesses);
    }

    // Dedupe
    const strengths = [...new Set(allStrengths)].slice(0, 5);
    const weaknesses = [...new Set(allWeaknesses)].slice(0, 5);

    return (
        <div className={cn("space-y-4", className)}>
            {/* Overall score */}
            <div className="text-center pb-2 border-b">
                <div
                    className={cn(
                        "text-4xl font-bold tabular-nums",
                        getScoreTextColor(aiScore)
                    )}
                >
                    {aiScore.toFixed(1)}
                </div>
                <div className="text-sm text-muted-foreground mt-1">
                    {getScoreLabel(aiScore)} • AI Evaluation
                </div>
            </div>

            {/* Dimension breakdown */}
            <div className="space-y-3">
                {DIMENSIONS.map((dim) => {
                    const data = aiScoreComponents[dim.key];
                    // Handle both new structured format and legacy format
                    const score =
                        typeof data === "object" && data?.score != null
                            ? data.score
                            : typeof data === "number"
                                ? data
                                : 0;
                    const rationale =
                        typeof data === "object" ? data?.rationale : undefined;

                    if (score === 0 && !rationale) return null;

                    return (
                        <DimensionRow
                            key={dim.key}
                            label={dim.label}
                            icon={dim.icon}
                            description={dim.description}
                            score={score}
                            rationale={rationale}
                        />
                    );
                })}
            </div>

            {/* Strengths & Weaknesses */}
            {(strengths.length > 0 || weaknesses.length > 0) && (
                <Collapsible open={showDetails} onOpenChange={setShowDetails}>
                    <CollapsibleTrigger asChild>
                        <Button
                            variant="ghost"
                            size="sm"
                            className="w-full flex items-center justify-between text-xs text-muted-foreground hover:text-foreground"
                        >
                            <span>View Strengths & Weaknesses</span>
                            {showDetails ? (
                                <ChevronUp className="h-4 w-4" />
                            ) : (
                                <ChevronDown className="h-4 w-4" />
                            )}
                        </Button>
                    </CollapsibleTrigger>

                    <CollapsibleContent className="space-y-3 pt-2">
                        {/* Strengths */}
                        {strengths.length > 0 && (
                            <div className="space-y-2">
                                <div className="flex items-center gap-1.5 text-xs font-medium text-emerald-600 dark:text-emerald-400">
                                    <CheckCircle2 className="h-3.5 w-3.5" />
                                    Strengths
                                </div>
                                <div className="flex flex-wrap gap-1.5">
                                    {strengths.map((s, i) => (
                                        <Badge
                                            key={i}
                                            variant="secondary"
                                            className="text-xs bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300 border-0"
                                        >
                                            {s}
                                        </Badge>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Weaknesses */}
                        {weaknesses.length > 0 && (
                            <div className="space-y-2">
                                <div className="flex items-center gap-1.5 text-xs font-medium text-amber-600 dark:text-amber-400">
                                    <AlertTriangle className="h-3.5 w-3.5" />
                                    Limitations
                                </div>
                                <div className="flex flex-wrap gap-1.5">
                                    {weaknesses.map((w, i) => (
                                        <Badge
                                            key={i}
                                            variant="secondary"
                                            className="text-xs bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-300 border-0"
                                        >
                                            {w}
                                        </Badge>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Overall summary */}
                        {(aiScoreComponents.overall_summary ||
                            aiScoreComponents.reasoning) && (
                                <div className="pt-2 border-t">
                                    <p className="text-xs text-muted-foreground leading-relaxed">
                                        {aiScoreComponents.overall_summary ||
                                            aiScoreComponents.reasoning}
                                    </p>
                                </div>
                            )}
                    </CollapsibleContent>
                </Collapsible>
            )}
        </div>
    );
}
