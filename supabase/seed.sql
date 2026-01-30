-- =====================================================
-- AIDEAS.AI - SEED DATA
-- =====================================================
-- This script seeds the database with realistic synthetic data
-- for development and demonstration purposes.
-- 
-- Run this after migrations are applied:
-- psql -h <host> -U postgres -d postgres -f supabase/seed.sql
-- =====================================================

-- Clean existing data (for re-seeding)
TRUNCATE TABLE 
  public.rankings,
  public.community_scores,
  public.ai_scores,
  public.votes,
  public.answers,
  public.question_tool_mentions,
  public.questions,
  public.user_roles,
  public.profiles,
  public.tool_categories,
  public.tools,
  public.categories,
  public.sources
CASCADE;

-- =====================================================
-- 1. CATEGORIES
-- =====================================================
INSERT INTO public.categories (id, name, slug, description, icon, display_order) VALUES
  ('c1111111-1111-1111-1111-111111111111', 'Code', 'code', 'AI assistants for software development, debugging, and coding', '💻', 1),
  ('c2222222-2222-2222-2222-222222222222', 'Writing', 'writing', 'Content creation, copywriting, and text editing tools', '✍️', 2),
  ('c3333333-3333-3333-3333-333333333333', 'Brainstorming', 'brainstorming', 'Ideation, creative thinking, and problem-solving assistants', '💡', 3),
  ('c4444444-4444-4444-4444-444444444444', 'Image Generation', 'image-generation', 'AI-powered image creation and manipulation', '🎨', 4),
  ('c5555555-5555-5555-5555-555555555555', 'Audio', 'audio', 'Voice synthesis, music generation, and audio processing', '🎵', 5),
  ('c6666666-6666-6666-6666-666666666666', 'Video', 'video', 'Video editing, generation, and enhancement tools', '🎬', 6),
  ('c7777777-7777-7777-7777-777777777777', 'Data Analysis', 'data-analysis', 'Data processing, visualization, and insights', '📊', 7);

-- =====================================================
-- 2. TOOLS
-- =====================================================

-- Code Tools
INSERT INTO public.tools (id, name, slug, tagline, description, logo_url, website_url, pricing_model, features, target_users, status, ai_score, community_score, composite_score, confidence_score) VALUES
  ('a1111111-1111-1111-1111-111111111111', 
   'GitHub Copilot', 
   'github-copilot',
   'Your AI pair programmer',
   'GitHub Copilot uses OpenAI Codex to suggest code and entire functions in real-time, right from your editor. It supports dozens of languages and integrates seamlessly with VS Code, Visual Studio, Neovim, and JetBrains IDEs.',
   'https://github.githubassets.com/images/modules/site/copilot/copilot.png',
   'https://github.com/features/copilot',
   'subscription',
   '["Code completion", "Multi-language support", "Context-aware suggestions", "Function generation", "IDE integration"]',
   ARRAY['developers', 'students', 'data scientists'],
   'verified',
   88.5, 85.0, 87.1, 92.0),

  ('a1111111-1111-1111-1111-111111111112',
   'Cursor',
   'cursor',
   'The AI-first code editor',
   'Cursor is a fork of VS Code with built-in AI capabilities. It features natural language code editing, codebase-wide search with AI, and intelligent code generation. Built for developers who want AI deeply integrated into their workflow.',
   'https://cursor.sh/brand/icon.svg',
   'https://cursor.sh',
   'freemium',
   '["AI-powered editing", "Codebase chat", "Natural language commands", "Multi-file edits", "Integrated terminal"]',
   ARRAY['developers', 'teams'],
   'verified',
   92.0, 88.5, 90.5, 90.0),

  ('a1111111-1111-1111-1111-111111111113',
   'Tabnine',
   'tabnine',
   'AI code completion for all languages',
   'Tabnine uses deep learning models trained on millions of open-source repositories to provide intelligent code completions. Supports team training on private codebase and runs locally for enhanced privacy.',
   NULL,
   'https://www.tabnine.com',
   'freemium',
   '["Code completion", "Team learning", "Local processing", "Privacy-first", "IDE plugins"]',
   ARRAY['developers', 'enterprises'],
   'verified',
   84.0, 79.5, 82.2, 88.0),

-- Writing Tools
  ('a2222222-2222-2222-2222-222222222221',
   'ChatGPT',
   'chatgpt',
   'Conversational AI for any task',
   'ChatGPT by OpenAI is a versatile language model that excels at writing, analysis, coding, and conversation. Available via web interface and API, with GPT-4 offering advanced reasoning capabilities.',
   'https://cdn.oaistatic.com/_next/static/media/apple-touch-icon.59f2e898.png',
   'https://chat.openai.com',
   'freemium',
   '["Content generation", "Code writing", "Analysis", "Conversation", "Plugin ecosystem"]',
   ARRAY['writers', 'developers', 'students', 'researchers'],
   'verified',
   95.0, 92.0, 93.8, 95.0),

  ('a2222222-2222-2222-2222-222222222222',
   'Claude',
   'claude',
   'Helpful, harmless, and honest AI assistant',
   'Claude by Anthropic is designed with safety and helpfulness in mind. Excels at long-form content, analysis, and nuanced conversation. Features a large context window for processing extensive documents.',
   NULL,
   'https://claude.ai',
   'freemium',
   '["Long context", "Document analysis", "Safe responses", "Nuanced reasoning", "API access"]',
   ARRAY['writers', 'researchers', 'analysts'],
   'verified',
   91.0, 87.5, 89.6, 92.0),

  ('a2222222-2222-2222-2222-222222222223',
   'Jasper',
   'jasper',
   'AI content platform for marketing',
   'Jasper specializes in marketing copy, ad content, and brand voice consistency. Offers templates for various content types and integrates with marketing workflows.',
   NULL,
   'https://www.jasper.ai',
   'paid',
   '["Marketing templates", "Brand voice", "SEO optimization", "Team collaboration", "Content calendar"]',
   ARRAY['marketers', 'content creators', 'agencies'],
   'verified',
   82.5, 80.0, 81.5, 85.0),

-- Brainstorming Tools
  ('a3333333-3333-3333-3333-333333333331',
   'Gemini',
   'gemini',
   'Google AI for multimodal reasoning',
   'Gemini is Google''s most capable AI model, designed to work seamlessly across text, images, code, and more. Integrated with Google Workspace for enhanced productivity.',
   NULL,
   'https://gemini.google.com',
   'freemium',
   '["Multimodal input", "Google integration", "Real-time info", "Code execution", "Extensions"]',
   ARRAY['students', 'researchers', 'professionals'],
   'verified',
   89.0, 84.0, 87.0, 88.0),

  ('a3333333-3333-3333-3333-333333333332',
   'Perplexity',
   'perplexity',
   'AI-powered answer engine',
   'Perplexity combines AI with real-time web search to provide accurate, cited answers to questions. Ideal for research and fact-finding with transparent sources.',
   NULL,
   'https://www.perplexity.ai',
   'freemium',
   '["Web search", "Citations", "Follow-up questions", "Source transparency", "Research mode"]',
   ARRAY['researchers', 'students', 'analysts'],
   'verified',
   86.0, 83.5, 85.0, 87.0),

-- Image Generation Tools
  ('a4444444-4444-4444-4444-444444444441',
   'Midjourney',
   'midjourney',
   'AI art generation via Discord',
   'Midjourney creates stunning, artistic images from text descriptions. Known for its distinctive aesthetic and strong community. Accessed through Discord bot interface.',
   NULL,
   'https://www.midjourney.com',
   'subscription',
   '["Text-to-image", "Artistic style", "High resolution", "Style consistency", "Community gallery"]',
   ARRAY['artists', 'designers', 'creators'],
   'verified',
   90.0, 91.5, 90.6, 93.0),

  ('a4444444-4444-4444-4444-444444444442',
   'DALL-E',
   'dall-e',
   'OpenAI image generation',
   'DALL-E 3 creates highly detailed images with excellent text rendering and adherence to prompts. Integrated into ChatGPT Plus and available via API.',
   NULL,
   'https://openai.com/dall-e-3',
   'paid',
   '["Text-to-image", "Prompt accuracy", "Text rendering", "High quality", "ChatGPT integration"]',
   ARRAY['designers', 'marketers', 'creators'],
   'verified',
   88.5, 86.0, 87.5, 90.0),

  ('a4444444-4444-4444-4444-444444444443',
   'Stable Diffusion',
   'stable-diffusion',
   'Open-source image generation',
   'Stable Diffusion is an open-source text-to-image model that runs locally or in the cloud. Highly customizable with community-created models and LoRAs.',
   NULL,
   'https://stability.ai/stable-diffusion',
   'open_source',
   '["Open source", "Local processing", "Customizable", "LoRA support", "Community models"]',
   ARRAY['developers', 'researchers', 'creators'],
   'verified',
   85.0, 88.0, 86.2, 89.0),

-- Audio Tools
  ('a5555555-5555-5555-5555-555555555551',
   'ElevenLabs',
   'elevenlabs',
   'AI voice generation and cloning',
   'ElevenLabs creates incredibly realistic AI voices with emotion and intonation. Supports voice cloning and multilingual speech synthesis.',
   NULL,
   'https://elevenlabs.io',
   'freemium',
   '["Voice synthesis", "Voice cloning", "Emotion control", "Multilingual", "API access"]',
   ARRAY['content creators', 'podcasters', 'developers'],
   'verified',
   87.0, 85.5, 86.4, 88.0),

-- Video Tools
  ('a6666666-6666-6666-6666-666666666661',
   'Runway',
   'runway',
   'AI video editing and generation',
   'Runway offers AI-powered video editing tools including text-to-video, image-to-video, motion tracking, and background removal. Built for creators and filmmakers.',
   NULL,
   'https://runwayml.com',
   'freemium',
   '["Text-to-video", "Motion tracking", "Green screen", "Style transfer", "Collaboration"]',
   ARRAY['video editors', 'creators', 'filmmakers'],
   'verified',
   84.5, 82.0, 83.5, 85.0),

-- Data Analysis Tools
  ('a7777777-7777-7777-7777-777777777771',
   'Julius AI',
   'julius-ai',
   'AI data analyst',
   'Julius AI helps analyze data, create visualizations, and generate insights from spreadsheets and databases. Natural language interface for data science tasks.',
   NULL,
   'https://julius.ai',
   'freemium',
   '["Data analysis", "Visualization", "Natural language", "CSV support", "Statistical analysis"]',
   ARRAY['analysts', 'researchers', 'business users'],
   'verified',
   81.0, 78.5, 80.0, 82.0),

  ('a7777777-7777-7777-7777-777777777772',
   'Hex',
   'hex',
   'Collaborative data workspace',
   'Hex combines SQL, Python, and AI in a collaborative notebook environment. Features AI-powered code generation and data exploration.',
   NULL,
   'https://hex.tech',
   'freemium',
   '["Notebooks", "SQL + Python", "AI code gen", "Collaboration", "Visualization"]',
   ARRAY['data scientists', 'analysts', 'teams'],
   'verified',
   83.5, 80.0, 82.1, 84.0);

-- =====================================================
-- 3. TOOL CATEGORIES (Many-to-many mapping)
-- =====================================================
INSERT INTO public.tool_categories (tool_id, category_id, is_primary) VALUES
  -- GitHub Copilot
  ('a1111111-1111-1111-1111-111111111111', 'c1111111-1111-1111-1111-111111111111', true),
  -- Cursor
  ('a1111111-1111-1111-1111-111111111112', 'c1111111-1111-1111-1111-111111111111', true),
  -- Tabnine
  ('a1111111-1111-1111-1111-111111111113', 'c1111111-1111-1111-1111-111111111111', true),
  -- ChatGPT (multi-category)
  ('a2222222-2222-2222-2222-222222222221', 'c2222222-2222-2222-2222-222222222222', true),
  ('a2222222-2222-2222-2222-222222222221', 'c1111111-1111-1111-1111-111111111111', false),
  ('a2222222-2222-2222-2222-222222222221', 'c3333333-3333-3333-3333-333333333333', false),
  -- Claude
  ('a2222222-2222-2222-2222-222222222222', 'c2222222-2222-2222-2222-222222222222', true),
  ('a2222222-2222-2222-2222-222222222222', 'c3333333-3333-3333-3333-333333333333', false),
  -- Jasper
  ('a2222222-2222-2222-2222-222222222223', 'c2222222-2222-2222-2222-222222222222', true),
  -- Gemini
  ('a3333333-3333-3333-3333-333333333331', 'c3333333-3333-3333-3333-333333333333', true),
  ('a3333333-3333-3333-3333-333333333331', 'c2222222-2222-2222-2222-222222222222', false),
  -- Perplexity
  ('a3333333-3333-3333-3333-333333333332', 'c3333333-3333-3333-3333-333333333333', true),
  -- Midjourney
  ('a4444444-4444-4444-4444-444444444441', 'c4444444-4444-4444-4444-444444444444', true),
  -- DALL-E
  ('a4444444-4444-4444-4444-444444444442', 'c4444444-4444-4444-4444-444444444444', true),
  -- Stable Diffusion
  ('a4444444-4444-4444-4444-444444444443', 'c4444444-4444-4444-4444-444444444444', true),
  -- ElevenLabs
  ('a5555555-5555-5555-5555-555555555551', 'c5555555-5555-5555-5555-555555555555', true),
  -- Runway
  ('a6666666-6666-6666-6666-666666666661', 'c6666666-6666-6666-6666-666666666666', true),
  -- Julius AI
  ('a7777777-7777-7777-7777-777777777771', 'c7777777-7777-7777-7777-777777777777', true),
  -- Hex
  ('a7777777-7777-7777-7777-777777777772', 'c7777777-7777-7777-7777-777777777777', true);

-- =====================================================
-- 4. AI SCORES (Breakdown for each tool)
-- =====================================================
INSERT INTO public.ai_scores (tool_id, feature_completeness, pricing_clarity, documentation_quality, use_case_coverage, popularity_proxy, overall_score, agent_version, score_explanation) VALUES
  ('a1111111-1111-1111-1111-111111111111', 90.0, 85.0, 92.0, 88.0, 87.0, 88.5, 'v1.0', '{"reasoning": "Excellent IDE integration and code understanding"}'),
  ('a1111111-1111-1111-1111-111111111112', 95.0, 90.0, 88.0, 92.0, 90.0, 92.0, 'v1.0', '{"reasoning": "Best-in-class AI-native experience"}'),
  ('a1111111-1111-1111-1111-111111111113', 85.0, 82.0, 80.0, 86.0, 83.0, 84.0, 'v1.0', '{"reasoning": "Strong privacy features, good completions"}'),
  ('a2222222-2222-2222-2222-222222222221', 98.0, 95.0, 95.0, 96.0, 92.0, 95.0, 'v1.0', '{"reasoning": "Industry-leading versatility and capabilities"}'),
  ('a2222222-2222-2222-2222-222222222222', 92.0, 88.0, 90.0, 93.0, 90.0, 91.0, 'v1.0', '{"reasoning": "Exceptional reasoning and safety"}'),
  ('a2222222-2222-2222-2222-222222222223', 80.0, 85.0, 78.0, 88.0, 80.0, 82.5, 'v1.0', '{"reasoning": "Marketing-focused with good templates"}'),
  ('a3333333-3333-3333-3333-333333333331', 90.0, 87.0, 88.0, 92.0, 87.0, 89.0, 'v1.0', '{"reasoning": "Strong multimodal capabilities"}'),
  ('a3333333-3333-3333-3333-333333333332', 88.0, 85.0, 82.0, 87.0, 84.0, 86.0, 'v1.0', '{"reasoning": "Excellent for research with citations"}'),
  ('a4444444-4444-4444-4444-444444444441', 92.0, 88.0, 85.0, 93.0, 90.0, 90.0, 'v1.0', '{"reasoning": "Stunning artistic output"}'),
  ('a4444444-4444-4444-4444-444444444442', 90.0, 88.0, 90.0, 87.0, 87.0, 88.5, 'v1.0', '{"reasoning": "Excellent prompt adherence"}'),
  ('a4444444-4444-4444-4444-444444444443', 88.0, 80.0, 85.0, 86.0, 84.0, 85.0, 'v1.0', '{"reasoning": "Open source flexibility"}'),
  ('a5555555-5555-5555-5555-555555555551', 90.0, 85.0, 88.0, 85.0, 86.0, 87.0, 'v1.0', '{"reasoning": "Highly realistic voice synthesis"}'),
  ('a6666666-6666-6666-6666-666666666661', 86.0, 82.0, 80.0, 88.0, 83.0, 84.5, 'v1.0', '{"reasoning": "Innovative video AI features"}'),
  ('a7777777-7777-7777-7777-777777777771', 78.0, 80.0, 75.0, 85.0, 82.0, 81.0, 'v1.0', '{"reasoning": "Good for basic data analysis"}'),
  ('a7777777-7777-7777-7777-777777777772', 85.0, 82.0, 88.0, 80.0, 82.0, 83.5, 'v1.0', '{"reasoning": "Strong collaborative features"}');

-- =====================================================
-- 5. COMMUNITY SCORES
-- =====================================================
INSERT INTO public.community_scores (tool_id, positive_mentions, negative_mentions, neutral_mentions, sentiment_score, overall_score) VALUES
  ('a1111111-1111-1111-1111-111111111111', 42, 5, 8, 82.0, 85.0),
  ('a1111111-1111-1111-1111-111111111112', 38, 2, 5, 90.0, 88.5),
  ('a1111111-1111-1111-1111-111111111113', 28, 7, 10, 75.0, 79.5),
  ('a2222222-2222-2222-2222-222222222221', 95, 8, 12, 88.0, 92.0),
  ('a2222222-2222-2222-2222-222222222222', 52, 4, 9, 86.0, 87.5),
  ('a2222222-2222-2222-2222-222222222223', 25, 6, 8, 78.0, 80.0),
  ('a3333333-3333-3333-3333-333333333331', 48, 7, 10, 82.0, 84.0),
  ('a3333333-3333-3333-3333-333333333332', 35, 5, 8, 84.0, 83.5),
  ('a4444444-4444-4444-4444-444444444441', 68, 3, 7, 92.0, 91.5),
  ('a4444444-4444-4444-4444-444444444442', 45, 6, 9, 85.0, 86.0),
  ('a4444444-4444-4444-4444-444444444443', 52, 4, 10, 88.0, 88.0),
  ('a5555555-5555-5555-5555-555555555551', 38, 5, 8, 86.0, 85.5),
  ('a6666666-6666-6666-6666-666666666661', 32, 7, 10, 80.0, 82.0),
  ('a7777777-7777-7777-7777-777777777771', 22, 6, 12, 76.0, 78.5),
  ('a7777777-7777-7777-7777-777777777772', 28, 5, 10, 80.0, 80.0);

-- =====================================================
-- 6. SAMPLE QUESTIONS (Requires auth.users first)
-- =====================================================
-- Note: In production, users will be created via Supabase Auth
-- For seed data, we'll create placeholder questions without user references
-- These will need to be linked to real users after authentication is set up

-- Create sample data once you have authenticated users
-- Example structure (commented out until users exist):
/*
INSERT INTO public.questions (user_id, title, body, upvotes, downvotes, view_count, answer_count, is_answered) VALUES
  ('<user-uuid>', 'Best AI coding assistant in 2024?', 'Looking for recommendations...', 12, 1, 234, 3, true);
*/

-- =====================================================
-- SEED COMPLETE
-- =====================================================
-- Next steps:
-- 1. Create users via Supabase Auth UI or API
-- 2. Run this script to populate tools and categories
-- 3. Manually add questions/answers as needed via the application
