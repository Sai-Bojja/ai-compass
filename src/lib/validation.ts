// =====================================================
// ZOD VALIDATION SCHEMAS
// =====================================================
// Runtime type validation for API responses and data
// =====================================================

import { z } from "zod";

// ------------------- Enums -------------------

export const PricingModelSchema = z.enum([
    "free",
    "freemium",
    "paid",
    "enterprise",
    "open_source",
    "subscription",
]);

export const ToolStatusSchema = z.enum([
    "pending",
    "verified",
    "deprecated",
    "removed",
]);

export const ContentStatusSchema = z.enum([
    "active",
    "hidden",
    "deleted",
]);

// ------------------- AI Score Components -------------------

export const DimensionScoreSchema = z.object({
    score: z.number().min(0).max(100),
    evidence: z.object({
        present: z.array(z.string()).optional(),
        missing_or_limited: z.array(z.string()).optional(),
    }).optional(),
    rationale: z.string().optional(),
});

export const AIScoreComponentsSchema = z.object({
    feature_completeness: DimensionScoreSchema.optional(),
    documentation_quality: DimensionScoreSchema.optional(),
    pricing_clarity: DimensionScoreSchema.optional(),
    use_case_coverage: DimensionScoreSchema.optional(),
    innovation: DimensionScoreSchema.optional(),
    overall_summary: z.string().optional(),
    // Legacy format support
    strengths: z.array(z.string()).optional(),
    weaknesses: z.array(z.string()).optional(),
    reasoning: z.string().optional(),
}).nullable();

// ------------------- Core Entities -------------------

export const CategorySchema = z.object({
    id: z.string().uuid(),
    name: z.string().min(1),
    slug: z.string().min(1),
    description: z.string().nullable(),
    icon: z.string().nullable(),
    display_order: z.number().int(),
});

export const ToolSchema = z.object({
    id: z.string().uuid(),
    name: z.string().min(1),
    slug: z.string().min(1),
    tagline: z.string().nullable(),
    description: z.string().nullable(),
    logo_url: z.string().url().nullable().or(z.literal("")),
    website_url: z.string().url().nullable().or(z.literal("")),
    pricing_model: PricingModelSchema,
    features: z.unknown(), // JSON blob
    target_users: z.array(z.string()).nullable(),
    status: ToolStatusSchema,
    ai_score: z.number().min(0).max(100),
    community_score: z.number().min(0).max(100),
    composite_score: z.number().min(0).max(100),
    confidence_score: z.number().min(0).max(100).optional(),
    mention_count: z.number().int().nonnegative().optional(),
    question_count: z.number().int().nonnegative().optional(),
    ai_score_components: AIScoreComponentsSchema.optional(),
    created_at: z.string().datetime().optional(),
    updated_at: z.string().datetime().optional(),
});

export const ToolWithCategorySchema = ToolSchema.extend({
    categories: z.array(CategorySchema).optional(),
});

// ------------------- Community Content -------------------

export const QuestionSchema = z.object({
    id: z.string().uuid(),
    user_id: z.string().uuid(),
    title: z.string().min(1).max(300),
    body: z.string().min(1),
    status: ContentStatusSchema,
    view_count: z.number().int().nonnegative(),
    answer_count: z.number().int().nonnegative(),
    upvotes: z.number().int().nonnegative(),
    downvotes: z.number().int().nonnegative(),
    is_answered: z.boolean(),
    created_at: z.string().datetime(),
    updated_at: z.string().datetime(),
});

export const AnswerSchema = z.object({
    id: z.string().uuid(),
    question_id: z.string().uuid(),
    user_id: z.string().uuid(),
    body: z.string().min(1),
    status: ContentStatusSchema,
    upvotes: z.number().int().nonnegative(),
    downvotes: z.number().int().nonnegative(),
    is_accepted: z.boolean(),
    created_at: z.string().datetime(),
    updated_at: z.string().datetime(),
});

export const ProfileSchema = z.object({
    id: z.string().uuid(),
    user_id: z.string().uuid(),
    username: z.string().nullable(),
    display_name: z.string().nullable(),
    avatar_url: z.string().url().nullable().or(z.literal("")),
    bio: z.string().nullable(),
    reputation_score: z.number().int().nonnegative(),
    trust_level: z.number().int().min(0).max(10),
    total_upvotes_received: z.number().int().nonnegative(),
    total_answers: z.number().int().nonnegative(),
    total_questions: z.number().int().nonnegative(),
    is_verified: z.boolean(),
    created_at: z.string().datetime(),
});

// ------------------- Type Exports -------------------

export type PricingModel = z.infer<typeof PricingModelSchema>;
export type ToolStatus = z.infer<typeof ToolStatusSchema>;
export type ContentStatus = z.infer<typeof ContentStatusSchema>;
export type DimensionScore = z.infer<typeof DimensionScoreSchema>;
export type AIScoreComponents = z.infer<typeof AIScoreComponentsSchema>;
export type Category = z.infer<typeof CategorySchema>;
export type Tool = z.infer<typeof ToolSchema>;
export type ToolWithCategory = z.infer<typeof ToolWithCategorySchema>;
export type Question = z.infer<typeof QuestionSchema>;
export type Answer = z.infer<typeof AnswerSchema>;
export type Profile = z.infer<typeof ProfileSchema>;

// ------------------- Validation Helpers -------------------

/**
 * Safely parse data with a Zod schema, returning null on failure
 */
export function safeParse<T>(
    schema: z.ZodSchema<T>,
    data: unknown,
    context?: string
): T | null {
    const result = schema.safeParse(data);
    if (!result.success) {
        console.warn(
            `[Validation] ${context || "Parse"} failed:`,
            result.error.issues
        );
        return null;
    }
    return result.data;
}

/**
 * Parse an array of items, filtering out invalid ones
 */
export function safeParseArray<T>(
    schema: z.ZodSchema<T>,
    data: unknown[],
    context?: string
): T[] {
    return data
        .map((item, index) => safeParse(schema, item, `${context}[${index}]`))
        .filter((item): item is T => item !== null);
}
