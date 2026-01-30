import { describe, it, expect } from "vitest";
import {
    ToolSchema,
    CategorySchema,
    AIScoreComponentsSchema,
    DimensionScoreSchema,
    PricingModelSchema,
    ToolStatusSchema,
    safeParse,
    safeParseArray,
} from "@/lib/validation";

// =====================================================
// VALIDATION SCHEMA TESTS
// =====================================================

describe("PricingModelSchema", () => {
    it("accepts valid pricing models", () => {
        expect(PricingModelSchema.safeParse("free").success).toBe(true);
        expect(PricingModelSchema.safeParse("freemium").success).toBe(true);
        expect(PricingModelSchema.safeParse("paid").success).toBe(true);
        expect(PricingModelSchema.safeParse("enterprise").success).toBe(true);
        expect(PricingModelSchema.safeParse("open_source").success).toBe(true);
        expect(PricingModelSchema.safeParse("subscription").success).toBe(true);
    });

    it("rejects invalid pricing models", () => {
        expect(PricingModelSchema.safeParse("invalid").success).toBe(false);
        expect(PricingModelSchema.safeParse("").success).toBe(false);
        expect(PricingModelSchema.safeParse(123).success).toBe(false);
    });
});

describe("ToolStatusSchema", () => {
    it("accepts valid statuses", () => {
        expect(ToolStatusSchema.safeParse("pending").success).toBe(true);
        expect(ToolStatusSchema.safeParse("verified").success).toBe(true);
        expect(ToolStatusSchema.safeParse("deprecated").success).toBe(true);
        expect(ToolStatusSchema.safeParse("removed").success).toBe(true);
    });

    it("rejects invalid statuses", () => {
        expect(ToolStatusSchema.safeParse("active").success).toBe(false);
    });
});

describe("DimensionScoreSchema", () => {
    it("accepts valid dimension scores", () => {
        const result = DimensionScoreSchema.safeParse({
            score: 85,
            rationale: "Good feature set",
            evidence: {
                present: ["API", "CLI"],
                missing_or_limited: ["Mobile app"],
            },
        });
        expect(result.success).toBe(true);
    });

    it("accepts minimal dimension score", () => {
        const result = DimensionScoreSchema.safeParse({ score: 50 });
        expect(result.success).toBe(true);
    });

    it("rejects score out of range", () => {
        expect(DimensionScoreSchema.safeParse({ score: -1 }).success).toBe(false);
        expect(DimensionScoreSchema.safeParse({ score: 101 }).success).toBe(false);
    });
});

describe("CategorySchema", () => {
    it("accepts valid category", () => {
        const result = CategorySchema.safeParse({
            id: "123e4567-e89b-12d3-a456-426614174000",
            name: "Code Assistants",
            slug: "code-assistants",
            description: "Tools for coding",
            icon: "code",
            display_order: 1,
        });
        expect(result.success).toBe(true);
    });

    it("rejects invalid UUID", () => {
        const result = CategorySchema.safeParse({
            id: "not-a-uuid",
            name: "Test",
            slug: "test",
            description: null,
            icon: null,
            display_order: 1,
        });
        expect(result.success).toBe(false);
    });
});

describe("ToolSchema", () => {
    const validTool = {
        id: "123e4567-e89b-12d3-a456-426614174000",
        name: "ChatGPT",
        slug: "chatgpt",
        tagline: "AI assistant",
        description: "A powerful AI assistant",
        logo_url: "https://example.com/logo.png",
        website_url: "https://chat.openai.com",
        pricing_model: "freemium",
        features: { languages: ["en"] },
        target_users: ["developers"],
        status: "verified",
        ai_score: 92,
        community_score: 88,
        composite_score: 90,
    };

    it("accepts valid tool", () => {
        const result = ToolSchema.safeParse(validTool);
        expect(result.success).toBe(true);
    });

    it("accepts tool with null optional fields", () => {
        const result = ToolSchema.safeParse({
            ...validTool,
            tagline: null,
            description: null,
            logo_url: null,
            website_url: null,
            target_users: null,
        });
        expect(result.success).toBe(true);
    });

    it("rejects tool with invalid scores", () => {
        expect(ToolSchema.safeParse({ ...validTool, ai_score: -5 }).success).toBe(false);
        expect(ToolSchema.safeParse({ ...validTool, composite_score: 150 }).success).toBe(false);
    });

    it("rejects tool missing required fields", () => {
        const { name, ...toolWithoutName } = validTool;
        expect(ToolSchema.safeParse(toolWithoutName).success).toBe(false);
    });
});

describe("AIScoreComponentsSchema", () => {
    it("accepts valid AI score components", () => {
        const result = AIScoreComponentsSchema.safeParse({
            feature_completeness: { score: 90 },
            documentation_quality: { score: 85 },
            pricing_clarity: { score: 88 },
            use_case_coverage: { score: 82 },
            innovation: { score: 95 },
            overall_summary: "Excellent tool",
        });
        expect(result.success).toBe(true);
    });

    it("accepts legacy format", () => {
        const result = AIScoreComponentsSchema.safeParse({
            strengths: ["Good API", "Fast"],
            weaknesses: ["Expensive"],
            reasoning: "Overall good tool",
        });
        expect(result.success).toBe(true);
    });

    it("accepts null", () => {
        expect(AIScoreComponentsSchema.safeParse(null).success).toBe(true);
    });
});

describe("safeParse helper", () => {
    it("returns data on success", () => {
        const result = safeParse(PricingModelSchema, "free");
        expect(result).toBe("free");
    });

    it("returns null on failure", () => {
        const result = safeParse(PricingModelSchema, "invalid");
        expect(result).toBeNull();
    });
});

describe("safeParseArray helper", () => {
    it("filters out invalid items", () => {
        const data = ["free", "invalid", "paid", 123, "freemium"];
        const result = safeParseArray(PricingModelSchema, data);
        expect(result).toEqual(["free", "paid", "freemium"]);
    });

    it("returns empty array for all invalid items", () => {
        const data = ["invalid1", "invalid2"];
        const result = safeParseArray(PricingModelSchema, data);
        expect(result).toEqual([]);
    });
});
