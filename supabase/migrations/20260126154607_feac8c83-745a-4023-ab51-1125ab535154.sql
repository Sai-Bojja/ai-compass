-- =====================================================
-- AI TOOL INTELLIGENCE PLATFORM - CORE SCHEMA
-- =====================================================

-- Enum types for structured data
CREATE TYPE public.pricing_model AS ENUM ('free', 'freemium', 'paid', 'enterprise', 'open_source', 'subscription');
CREATE TYPE public.tool_status AS ENUM ('pending', 'verified', 'deprecated', 'removed');
CREATE TYPE public.content_status AS ENUM ('active', 'hidden', 'deleted');
CREATE TYPE public.vote_type AS ENUM ('up', 'down');
CREATE TYPE public.app_role AS ENUM ('admin', 'moderator', 'user');

-- =====================================================
-- 1. CATEGORIES TABLE
-- =====================================================
CREATE TABLE public.categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL UNIQUE,
    slug TEXT NOT NULL UNIQUE,
    description TEXT,
    icon TEXT,
    display_order INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- =====================================================
-- 2. TOOLS TABLE (Core entity)
-- =====================================================
CREATE TABLE public.tools (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    tagline TEXT,
    description TEXT,
    logo_url TEXT,
    website_url TEXT,
    pricing_model pricing_model DEFAULT 'freemium',
    pricing_details JSONB DEFAULT '{}',
    features JSONB DEFAULT '[]',
    target_users TEXT[],
    status tool_status DEFAULT 'pending',
    source_urls TEXT[] DEFAULT '{}',
    
    -- Composite scores (cached for performance)
    ai_score NUMERIC(4,2) DEFAULT 0 CHECK (ai_score >= 0 AND ai_score <= 100),
    community_score NUMERIC(4,2) DEFAULT 0 CHECK (community_score >= 0 AND community_score <= 100),
    composite_score NUMERIC(4,2) DEFAULT 0 CHECK (composite_score >= 0 AND composite_score <= 100),
    confidence_score NUMERIC(4,2) DEFAULT 0 CHECK (confidence_score >= 0 AND confidence_score <= 100),
    
    -- Metadata
    mention_count INTEGER DEFAULT 0,
    question_count INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_tools_composite_score ON public.tools(composite_score DESC);
CREATE INDEX idx_tools_status ON public.tools(status);
CREATE INDEX idx_tools_slug ON public.tools(slug);

-- =====================================================
-- 3. TOOL CATEGORIES (Many-to-many relationship)
-- =====================================================
CREATE TABLE public.tool_categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tool_id UUID NOT NULL REFERENCES public.tools(id) ON DELETE CASCADE,
    category_id UUID NOT NULL REFERENCES public.categories(id) ON DELETE CASCADE,
    is_primary BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE(tool_id, category_id)
);

CREATE INDEX idx_tool_categories_tool ON public.tool_categories(tool_id);
CREATE INDEX idx_tool_categories_category ON public.tool_categories(category_id);

-- =====================================================
-- 4. AI SCORES (Detailed breakdown from AI agents)
-- =====================================================
CREATE TABLE public.ai_scores (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tool_id UUID NOT NULL REFERENCES public.tools(id) ON DELETE CASCADE,
    
    -- Score breakdown
    feature_completeness NUMERIC(4,2) DEFAULT 0,
    pricing_clarity NUMERIC(4,2) DEFAULT 0,
    documentation_quality NUMERIC(4,2) DEFAULT 0,
    use_case_coverage NUMERIC(4,2) DEFAULT 0,
    popularity_proxy NUMERIC(4,2) DEFAULT 0,
    overall_score NUMERIC(4,2) DEFAULT 0,
    
    -- Metadata
    score_explanation JSONB DEFAULT '{}',
    agent_version TEXT,
    evaluated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_ai_scores_tool ON public.ai_scores(tool_id);
CREATE INDEX idx_ai_scores_evaluated ON public.ai_scores(evaluated_at DESC);

-- =====================================================
-- 5. USER PROFILES
-- =====================================================
CREATE TABLE public.profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
    username TEXT UNIQUE,
    display_name TEXT,
    avatar_url TEXT,
    bio TEXT,
    
    -- Reputation system
    reputation_score INTEGER DEFAULT 0,
    trust_level INTEGER DEFAULT 1 CHECK (trust_level >= 1 AND trust_level <= 5),
    total_upvotes_received INTEGER DEFAULT 0,
    total_answers INTEGER DEFAULT 0,
    total_questions INTEGER DEFAULT 0,
    helpful_answer_count INTEGER DEFAULT 0,
    
    -- Flags
    is_verified BOOLEAN DEFAULT false,
    is_suspended BOOLEAN DEFAULT false,
    
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_profiles_username ON public.profiles(username);
CREATE INDEX idx_profiles_reputation ON public.profiles(reputation_score DESC);

-- =====================================================
-- 6. USER ROLES TABLE
-- =====================================================
CREATE TABLE public.user_roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    role app_role NOT NULL,
    granted_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE(user_id, role)
);

CREATE INDEX idx_user_roles_user ON public.user_roles(user_id);

-- =====================================================
-- 7. QUESTIONS TABLE
-- =====================================================
CREATE TABLE public.questions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    body TEXT NOT NULL,
    status content_status DEFAULT 'active',
    
    -- Engagement metrics
    view_count INTEGER DEFAULT 0,
    answer_count INTEGER DEFAULT 0,
    upvotes INTEGER DEFAULT 0,
    downvotes INTEGER DEFAULT 0,
    
    -- Flags
    is_answered BOOLEAN DEFAULT false,
    accepted_answer_id UUID,
    
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_questions_user ON public.questions(user_id);
CREATE INDEX idx_questions_status ON public.questions(status);
CREATE INDEX idx_questions_created ON public.questions(created_at DESC);

-- =====================================================
-- 8. QUESTION TOOL MENTIONS (Many-to-many)
-- =====================================================
CREATE TABLE public.question_tool_mentions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    question_id UUID NOT NULL REFERENCES public.questions(id) ON DELETE CASCADE,
    tool_id UUID NOT NULL REFERENCES public.tools(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE(question_id, tool_id)
);

CREATE INDEX idx_question_tool_mentions_question ON public.question_tool_mentions(question_id);
CREATE INDEX idx_question_tool_mentions_tool ON public.question_tool_mentions(tool_id);

-- =====================================================
-- 9. ANSWERS TABLE
-- =====================================================
CREATE TABLE public.answers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    question_id UUID NOT NULL REFERENCES public.questions(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    body TEXT NOT NULL,
    status content_status DEFAULT 'active',
    
    -- Engagement
    upvotes INTEGER DEFAULT 0,
    downvotes INTEGER DEFAULT 0,
    is_accepted BOOLEAN DEFAULT false,
    
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_answers_question ON public.answers(question_id);
CREATE INDEX idx_answers_user ON public.answers(user_id);

-- =====================================================
-- 10. VOTES TABLE
-- =====================================================
CREATE TABLE public.votes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    vote_type vote_type NOT NULL,
    
    -- Polymorphic reference (either question or answer)
    question_id UUID REFERENCES public.questions(id) ON DELETE CASCADE,
    answer_id UUID REFERENCES public.answers(id) ON DELETE CASCADE,
    
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    
    -- Ensure vote is for exactly one entity
    CONSTRAINT vote_target_check CHECK (
        (question_id IS NOT NULL AND answer_id IS NULL) OR
        (question_id IS NULL AND answer_id IS NOT NULL)
    ),
    -- One vote per user per entity
    UNIQUE(user_id, question_id),
    UNIQUE(user_id, answer_id)
);

CREATE INDEX idx_votes_user ON public.votes(user_id);
CREATE INDEX idx_votes_question ON public.votes(question_id) WHERE question_id IS NOT NULL;
CREATE INDEX idx_votes_answer ON public.votes(answer_id) WHERE answer_id IS NOT NULL;

-- =====================================================
-- 11. COMMUNITY SCORES (Aggregated from community signals)
-- =====================================================
CREATE TABLE public.community_scores (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tool_id UUID NOT NULL REFERENCES public.tools(id) ON DELETE CASCADE,
    
    -- Sentiment analysis
    positive_mentions INTEGER DEFAULT 0,
    negative_mentions INTEGER DEFAULT 0,
    neutral_mentions INTEGER DEFAULT 0,
    sentiment_score NUMERIC(4,2) DEFAULT 50,
    
    -- Trust-weighted metrics
    weighted_recommendation_score NUMERIC(4,2) DEFAULT 0,
    reliability_warnings INTEGER DEFAULT 0,
    spam_flags INTEGER DEFAULT 0,
    
    -- Calculated overall
    overall_score NUMERIC(4,2) DEFAULT 0,
    
    calculated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_community_scores_tool ON public.community_scores(tool_id);

-- =====================================================
-- 12. RANKINGS TABLE (Time-versioned snapshots)
-- =====================================================
CREATE TABLE public.rankings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tool_id UUID NOT NULL REFERENCES public.tools(id) ON DELETE CASCADE,
    category_id UUID REFERENCES public.categories(id) ON DELETE SET NULL,
    
    rank_position INTEGER NOT NULL,
    
    -- Score breakdown at this point in time
    ai_score NUMERIC(4,2) NOT NULL,
    community_score NUMERIC(4,2) NOT NULL,
    composite_score NUMERIC(4,2) NOT NULL,
    
    -- Weights used for this calculation
    ai_weight NUMERIC(3,2) DEFAULT 0.60,
    community_weight NUMERIC(3,2) DEFAULT 0.40,
    
    -- Metadata
    score_breakdown JSONB DEFAULT '{}',
    ranked_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_rankings_tool ON public.rankings(tool_id);
CREATE INDEX idx_rankings_category ON public.rankings(category_id);
CREATE INDEX idx_rankings_ranked_at ON public.rankings(ranked_at DESC);

-- =====================================================
-- 13. AGENT RUNS TABLE (Observability)
-- =====================================================
CREATE TABLE public.agent_runs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    agent_type TEXT NOT NULL,
    category_id UUID REFERENCES public.categories(id) ON DELETE SET NULL,
    
    status TEXT NOT NULL DEFAULT 'running',
    tools_discovered INTEGER DEFAULT 0,
    tools_updated INTEGER DEFAULT 0,
    errors JSONB DEFAULT '[]',
    
    started_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    completed_at TIMESTAMPTZ,
    duration_ms INTEGER
);

CREATE INDEX idx_agent_runs_type ON public.agent_runs(agent_type);
CREATE INDEX idx_agent_runs_started ON public.agent_runs(started_at DESC);

-- =====================================================
-- 14. SOURCES TABLE
-- =====================================================
CREATE TABLE public.sources (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    url TEXT NOT NULL UNIQUE,
    source_type TEXT NOT NULL,
    reliability_score NUMERIC(3,2) DEFAULT 0.5,
    last_crawled_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- =====================================================
-- ENABLE RLS ON ALL TABLES
-- =====================================================
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tools ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tool_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_scores ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.question_tool_mentions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.answers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.votes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.community_scores ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rankings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.agent_runs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sources ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- HAS_ROLE FUNCTION (Security Definer)
-- =====================================================
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
    SELECT EXISTS (
        SELECT 1
        FROM public.user_roles
        WHERE user_id = _user_id
          AND role = _role
    )
$$;

-- =====================================================
-- RLS POLICIES
-- =====================================================

-- Categories: Public read, admin write
CREATE POLICY "Categories are publicly readable" ON public.categories FOR SELECT USING (true);
CREATE POLICY "Admins can manage categories" ON public.categories FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- Tools: Public read, admin write
CREATE POLICY "Tools are publicly readable" ON public.tools FOR SELECT USING (status = 'verified' OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can manage tools" ON public.tools FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- Tool Categories: Public read
CREATE POLICY "Tool categories are publicly readable" ON public.tool_categories FOR SELECT USING (true);
CREATE POLICY "Admins can manage tool categories" ON public.tool_categories FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- AI Scores: Public read
CREATE POLICY "AI scores are publicly readable" ON public.ai_scores FOR SELECT USING (true);
CREATE POLICY "Admins can manage AI scores" ON public.ai_scores FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- Profiles: Public read, own write
CREATE POLICY "Profiles are publicly readable" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own profile" ON public.profiles FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

-- User Roles: Admin only
CREATE POLICY "Admins can view roles" ON public.user_roles FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin') OR user_id = auth.uid());
CREATE POLICY "Admins can manage roles" ON public.user_roles FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- Questions: Public read, authenticated write
CREATE POLICY "Questions are publicly readable" ON public.questions FOR SELECT USING (status = 'active');
CREATE POLICY "Authenticated users can create questions" ON public.questions FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own questions" ON public.questions FOR UPDATE TO authenticated USING (auth.uid() = user_id);

-- Question Tool Mentions: Public read
CREATE POLICY "Question tool mentions are publicly readable" ON public.question_tool_mentions FOR SELECT USING (true);
CREATE POLICY "Authenticated users can create mentions" ON public.question_tool_mentions FOR INSERT TO authenticated WITH CHECK (true);

-- Answers: Public read, authenticated write
CREATE POLICY "Answers are publicly readable" ON public.answers FOR SELECT USING (status = 'active');
CREATE POLICY "Authenticated users can create answers" ON public.answers FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own answers" ON public.answers FOR UPDATE TO authenticated USING (auth.uid() = user_id);

-- Votes: Public read counts (via parent), own write
CREATE POLICY "Users can view own votes" ON public.votes FOR SELECT TO authenticated USING (user_id = auth.uid());
CREATE POLICY "Authenticated users can vote" ON public.votes FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can change own votes" ON public.votes FOR DELETE TO authenticated USING (user_id = auth.uid());

-- Community Scores: Public read
CREATE POLICY "Community scores are publicly readable" ON public.community_scores FOR SELECT USING (true);
CREATE POLICY "Admins can manage community scores" ON public.community_scores FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- Rankings: Public read
CREATE POLICY "Rankings are publicly readable" ON public.rankings FOR SELECT USING (true);
CREATE POLICY "Admins can manage rankings" ON public.rankings FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- Agent Runs: Admin only
CREATE POLICY "Admins can view agent runs" ON public.agent_runs FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can manage agent runs" ON public.agent_runs FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- Sources: Admin only
CREATE POLICY "Admins can view sources" ON public.sources FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can manage sources" ON public.sources FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- =====================================================
-- TRIGGERS FOR UPDATED_AT
-- =====================================================
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER update_categories_updated_at BEFORE UPDATE ON public.categories FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_tools_updated_at BEFORE UPDATE ON public.tools FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_questions_updated_at BEFORE UPDATE ON public.questions FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_answers_updated_at BEFORE UPDATE ON public.answers FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- =====================================================
-- PROFILE AUTO-CREATION TRIGGER
-- =====================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (user_id, username, display_name, avatar_url)
    VALUES (
        NEW.id,
        LOWER(REPLACE(COALESCE(NEW.raw_user_meta_data->>'full_name', SPLIT_PART(NEW.email, '@', 1)), ' ', '_')),
        COALESCE(NEW.raw_user_meta_data->>'full_name', SPLIT_PART(NEW.email, '@', 1)),
        NEW.raw_user_meta_data->>'avatar_url'
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();