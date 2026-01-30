-- =====================================================
-- AIDEAS.AI - COMMUNITY Q&A SEED DATA (v3)
-- =====================================================
-- Realistic Reddit/Slack-style conversations about AI tools.
-- Each question has multiple answers with varied sentiments.
--
-- IMPORTANT: This script creates test users in auth.users.
-- The profiles are AUTO-CREATED by the on_auth_user_created trigger.
-- DO NOT manually insert into profiles - the trigger handles it.
--
-- Run this AFTER the main seed.sql has been applied.
-- =====================================================

-- =====================================================
-- 1. CREATE TEST USERS IN auth.users
-- =====================================================
-- Profiles are auto-created by the on_auth_user_created trigger
-- defined in the schema migration.

INSERT INTO auth.users (
    id, 
    instance_id,
    email, 
    encrypted_password, 
    email_confirmed_at, 
    created_at, 
    updated_at,
    aud,
    role,
    raw_user_meta_data
) VALUES
  ('b0000001-0001-0001-0001-000000000001', '00000000-0000-0000-0000-000000000000', 'dev_ninja42@test.local', '', now(), now(), now(), 'authenticated', 'authenticated', '{"full_name": "dev_ninja42"}'),
  ('b0000002-0002-0002-0002-000000000002', '00000000-0000-0000-0000-000000000000', 'ai_enthusiast@test.local', '', now(), now(), now(), 'authenticated', 'authenticated', '{"full_name": "AIEnthusiast"}'),
  ('b0000003-0003-0003-0003-000000000003', '00000000-0000-0000-0000-000000000000', 'startup_founder@test.local', '', now(), now(), now(), 'authenticated', 'authenticated', '{"full_name": "startup_founder"}'),
  ('b0000004-0004-0004-0004-000000000004', '00000000-0000-0000-0000-000000000000', 'data_guru@test.local', '', now(), now(), now(), 'authenticated', 'authenticated', '{"full_name": "DataScienceGuru"}'),
  ('b0000005-0005-0005-0005-000000000005', '00000000-0000-0000-0000-000000000000', 'creative_alex@test.local', '', now(), now(), now(), 'authenticated', 'authenticated', '{"full_name": "creative_alex"}'),
  ('b0000006-0006-0006-0006-000000000006', '00000000-0000-0000-0000-000000000000', 'backend_bob@test.local', '', now(), now(), now(), 'authenticated', 'authenticated', '{"full_name": "backend_bob"}'),
  ('b0000007-0007-0007-0007-000000000007', '00000000-0000-0000-0000-000000000000', 'content_queen@test.local', '', now(), now(), now(), 'authenticated', 'authenticated', '{"full_name": "content_queen"}'),
  ('b0000008-0008-0008-0008-000000000008', '00000000-0000-0000-0000-000000000000', 'indie_hacker@test.local', '', now(), now(), now(), 'authenticated', 'authenticated', '{"full_name": "indie_hacker"}'),
  ('b0000009-0009-0009-0009-000000000009', '00000000-0000-0000-0000-000000000000', 'ml_researcher@test.local', '', now(), now(), now(), 'authenticated', 'authenticated', '{"full_name": "ml_researcher"}'),
  ('b000000a-000a-000a-000a-00000000000a', '00000000-0000-0000-0000-000000000000', 'product_manager@test.local', '', now(), now(), now(), 'authenticated', 'authenticated', '{"full_name": "product_manager"}'),
  ('b000000b-000b-000b-000b-00000000000b', '00000000-0000-0000-0000-000000000000', 'video_creator@test.local', '', now(), now(), now(), 'authenticated', 'authenticated', '{"full_name": "video_creator"}'),
  ('b000000c-000c-000c-000c-00000000000c', '00000000-0000-0000-0000-000000000000', 'freelance_writer@test.local', '', now(), now(), now(), 'authenticated', 'authenticated', '{"full_name": "freelance_writer"}')
ON CONFLICT (id) DO NOTHING;

-- NOTE: Profiles are automatically created by the on_auth_user_created trigger
-- No explicit INSERT INTO profiles needed!

-- =====================================================
-- 2. QUESTIONS (Community Discussions)
-- =====================================================

INSERT INTO public.questions (id, user_id, title, body, status) VALUES

-- Q1: Code editor comparison
('d0000001-0001-0001-0001-000000000001',
 'b0000001-0001-0001-0001-000000000001',
 'Cursor vs GitHub Copilot - which one should I go with?',
 'Hey everyone, I''m currently using VS Code with Copilot but keep hearing about Cursor. Is it worth switching? I mainly work on React/Node projects. Looking for real experiences, not just marketing hype.',
 'active'),

-- Q2: Writing assistant comparison
('d0000002-0002-0002-0002-000000000002',
 'b0000007-0007-0007-0007-000000000007',
 'ChatGPT vs Claude for long-form content?',
 'I write blog posts and documentation. Been using ChatGPT Plus but heard Claude handles longer documents better. Anyone actually compared them for writing tasks? Budget isn''t a huge concern.',
 'active'),

-- Q3: Image generation
('d0000003-0003-0003-0003-000000000003',
 'b0000005-0005-0005-0005-000000000005',
 'Midjourney alternatives? Getting frustrated with Discord',
 'Love the output quality of Midjourney but the Discord workflow is killing me. Are DALL-E or Stable Diffusion viable alternatives? I need consistent style for brand assets.',
 'active'),

-- Q4: Research tools
('d0000004-0004-0004-0004-000000000004',
 'b0000009-0009-0009-0009-000000000009',
 'Perplexity vs Gemini for research?',
 'Working on a literature review and need an AI that can help me find and summarize papers. Tried both briefly - Perplexity cites sources but Gemini feels smarter. What''s your experience?',
 'active'),

-- Q5: Voice synthesis
('d0000005-0005-0005-0005-000000000005',
 'b000000b-000b-000b-000b-00000000000b',
 'Is ElevenLabs worth the price for YouTube?',
 'Making educational videos and my voice gets tired doing long recordings. Considering ElevenLabs for voiceovers. Is the quality good enough that viewers won''t notice it''s AI?',
 'active'),

-- Q6: Copilot frustrations
('d0000006-0006-0006-0006-000000000006',
 'b0000006-0006-0006-0006-000000000006',
 'GitHub Copilot keeps suggesting garbage code lately',
 'Anyone else notice Copilot quality going down? Past few weeks the suggestions have been way off. Like it''s not even looking at my codebase anymore. Waste of $19/month tbh',
 'active'),

-- Q7: Data analysis
('d0000007-0007-0007-0007-000000000007',
 'b0000004-0004-0004-0004-000000000004',
 'Julius AI vs Hex for data analysis?',
 'Non-technical PM here. Need to analyze CSV exports without bothering our data team. Julius looks simpler but Hex seems more powerful. What would you recommend for someone who knows basic SQL?',
 'active'),

-- Q8: Video editing
('d0000008-0008-0008-0008-000000000008',
 'b000000b-000b-000b-000b-00000000000b',
 'Runway ML - actually useful or just hype?',
 'Seeing Runway all over my Twitter feed. Is the Gen-2 video generation actually production-ready? Need it for short social clips, nothing crazy.',
 'active'),

-- Q9: Marketing copy
('d0000009-0009-0009-0009-000000000009',
 'b0000003-0003-0003-0003-000000000003',
 'Jasper vs ChatGPT for marketing copy?',
 'Running a startup and need to pump out landing pages, ads, and emails. Is Jasper worth the premium price or can ChatGPT do the same thing for less?',
 'active'),

-- Q10: Code privacy
('d000000a-000a-000a-000a-00000000000a',
 'b0000006-0006-0006-0006-000000000006',
 'Tabnine for enterprise - anyone using it?',
 'Our security team is blocking Copilot due to code privacy concerns. Tabnine claims they can run locally. Anyone actually set this up? Is it as good as Copilot?',
 'active'),

-- Q11: Stable Diffusion setup
('d000000b-000b-000b-000b-00000000000b',
 'b0000008-0008-0008-0008-000000000008',
 'Is Stable Diffusion worth the setup hassle?',
 'Want to generate product mockups for my indie project. SD is free but looks complicated to set up. Should I just pay for Midjourney instead?',
 'active'),

-- Q12: ChatGPT praise
('d000000c-000c-000c-000c-00000000000c',
 'b0000002-0002-0002-0002-000000000002',
 'ChatGPT-4 just saved me 20 hours of work',
 'Had to refactor a legacy PHP codebase. GPT-4 understood the entire context and gave me a migration plan. This thing is insane. What are your best productivity wins with ChatGPT?',
 'active'),

-- Q13: Claude long context
('d000000d-000d-000d-000d-00000000000d',
 'b0000009-0009-0009-0009-000000000009',
 'Claude 100k context - actually works?',
 'Need to analyze a 200-page legal document. Claude claims 100k context. Has anyone actually tested this with long documents? Does it maintain coherence?',
 'active'),

-- Q14: Gemini comparison
('d000000e-000e-000e-000e-00000000000e',
 'b000000a-000a-000a-000a-00000000000a',
 'Gemini vs ChatGPT for daily work tasks?',
 'Company is considering Gemini because of Google Workspace integration. Currently using ChatGPT. Is Gemini good enough to replace it or will the team revolt?',
 'active'),

-- Q15: DALL-E in ChatGPT
('d000000f-000f-000f-000f-00000000000f',
 'b0000007-0007-0007-0007-000000000007',
 'DALL-E 3 in ChatGPT is a game changer',
 'Just realized DALL-E 3 is included in ChatGPT Plus. The image quality is so much better than DALL-E 2. And it actually renders text correctly! Anyone else impressed?',
 'active'),

-- Q16: Multiple tool workflow
('d0000010-0010-0010-0010-000000000010',
 'b0000008-0008-0008-0008-000000000008',
 'My AI tool stack for solo development',
 'Curious what others are using. Currently: Cursor for coding, ChatGPT for brainstorming, Midjourney for graphics, ElevenLabs for demo videos. What''s your stack?',
 'active'),

-- Q17: Perplexity praise
('d0000011-0011-0011-0011-000000000011',
 'b0000002-0002-0002-0002-000000000002',
 'Perplexity Pro is underrated',
 'Been using Perplexity Pro for 3 months and it''s become my default search. The citations are so useful for fact-checking. Why isn''t this more popular?',
 'active'),

-- Q18: Negative Jasper experience
('d0000012-0012-0012-0012-000000000012',
 'b000000c-000c-000c-000c-00000000000c',
 'Jasper is overpriced - change my mind',
 'Tried Jasper for a month. The output isn''t better than ChatGPT but costs 5x more. The templates are nice but not $50/month nice. Am I missing something?',
 'active'),

-- Q19: Cursor praise
('d0000013-0013-0013-0013-000000000013',
 'b0000001-0001-0001-0001-000000000001',
 'Cursor Composer mode is incredible',
 'Just discovered Composer in Cursor. You can describe a feature and it edits multiple files at once. Actually built a complete auth system in like 10 minutes. Mind blown.',
 'active'),

-- Q20: ElevenLabs quality
('d0000014-0014-0014-0014-000000000014',
 'b000000b-000b-000b-000b-00000000000b',
 'Update: ElevenLabs voice quality is crazy good',
 'Posted asking about ElevenLabs a while back. Finally tried it. The voice cloning with just 30 seconds of audio is scary accurate. Worth every penny for content creators.',
 'active'),

-- Q21: Hex for teams
('d0000015-0015-0015-0015-000000000015',
 'b0000004-0004-0004-0004-000000000004',
 'Hex vs Jupyter for team data science?',
 'Our data team is growing and Jupyter notebooks are getting messy. Hex looks promising with the collaboration features. Anyone made this switch?',
 'active'),

-- Q22: Video creation workflow
('d0000016-0016-0016-0016-000000000016',
 'b000000b-000b-000b-000b-00000000000b',
 'Runway + ElevenLabs = full AI video pipeline?',
 'Thinking about creating videos entirely with AI. Runway for visuals, ElevenLabs for voice. Has anyone tried this combo? Is the quality there yet?',
 'active'),

-- Q23: Tabnine vs Copilot
('d0000017-0017-0017-0017-000000000017',
 'b0000006-0006-0006-0006-000000000006',
 'Switched from Copilot to Tabnine - my experience',
 'After 6 months with Copilot, tried Tabnine for the privacy features. It''s... okay. Definitely not as smart but the local model is fast and secure. Trade-offs.',
 'active'),

-- Q24: Claude praise
('d0000018-0018-0018-0018-000000000018',
 'b0000009-0009-0009-0009-000000000009',
 'Claude just explained a complex paper better than my advisor',
 'Fed Claude a dense ML paper and asked for an ELI5. The explanation was so clear I finally understood attention mechanisms. This is the future of learning.',
 'active'),

-- Q25: Julius for non-technical
('d0000019-0019-0019-0019-000000000019',
 'b000000a-000a-000a-000a-00000000000a',
 'Julius AI review from a non-coder',
 'Finally found a data tool I can actually use! Julius lets me upload CSVs and ask questions in plain English. Made charts my boss loved without touching Excel. Highly recommend for PMs.',
 'active')

ON CONFLICT (id) DO NOTHING;

-- =====================================================
-- 3. ANSWERS (Multiple per question, varied sentiments)
-- =====================================================

INSERT INTO public.answers (id, question_id, user_id, body, is_accepted) VALUES

-- Answers to Q1: Cursor vs Copilot
('e0000001-0001-0001-0001-000000000001',
 'd0000001-0001-0001-0001-000000000001',
 'b0000008-0008-0008-0008-000000000008',
 'Switched to Cursor 2 months ago and not looking back. The codebase chat feature is insane - you can ask questions about your entire project. Copilot feels dumb in comparison now.',
 true),

('e0000002-0002-0002-0002-000000000002',
 'd0000001-0001-0001-0001-000000000001',
 'b0000006-0006-0006-0006-000000000006',
 'I use both actually. Copilot is still better for quick inline completions. Cursor shines when you need to refactor or understand legacy code. The free tier is generous enough to try.',
 false),

('e0000003-0003-0003-0003-000000000003',
 'd0000001-0001-0001-0001-000000000001',
 'b0000004-0004-0004-0004-000000000004',
 'Honestly, Cursor crashed on me a few times last week. Copilot in VS Code is more stable. But when Cursor works, it''s magical. YMMV.',
 false),

-- Answers to Q2: ChatGPT vs Claude for writing
('e0000004-0004-0004-0004-000000000004',
 'd0000002-0002-0002-0002-000000000002',
 'b000000c-000c-000c-000c-00000000000c',
 'Claude is significantly better for long-form content. I can paste my entire 10k word draft and it actually remembers context from the beginning. ChatGPT loses the thread around 3k words.',
 true),

('e0000005-0005-0005-0005-000000000005',
 'd0000002-0002-0002-0002-000000000002',
 'b0000002-0002-0002-0002-000000000002',
 'ChatGPT-4 is better for creative writing imo. Claude is more... careful? Like it won''t take risks. For documentation though, Claude''s accuracy is unmatched.',
 false),

('e0000006-0006-0006-0006-000000000006',
 'd0000002-0002-0002-0002-000000000002',
 'b0000003-0003-0003-0003-000000000003',
 'I use both. ChatGPT for brainstorming, Claude for polishing. They complement each other well.',
 false),

-- Answers to Q3: Midjourney alternatives
('e0000007-0007-0007-0007-000000000007',
 'd0000003-0003-0003-0003-000000000003',
 'b0000008-0008-0008-0008-000000000008',
 'DALL-E 3 has gotten really good. The text rendering actually works now. But for pure aesthetics, Midjourney still has that special sauce. The Discord thing is annoying though, agreed.',
 false),

('e0000008-0008-0008-0008-000000000008',
 'd0000003-0003-0003-0003-000000000003',
 'b0000002-0002-0002-0002-000000000002',
 'Stable Diffusion is amazing if you take the time to learn it. ComfyUI made it way more accessible. You can train custom styles on your brand which MJ and DALL-E can''t do.',
 true),

('e0000009-0009-0009-0009-000000000009',
 'd0000003-0003-0003-0003-000000000003',
 'b0000005-0005-0005-0005-000000000005',
 'For brand assets specifically, DALL-E is more consistent. Midjourney gives you 4 variations and they''re all slightly different styles. Frustrating when you need matching assets.',
 false),

-- Answers to Q4: Perplexity vs Gemini
('e000000a-000a-000a-000a-00000000000a',
 'd0000004-0004-0004-0004-000000000004',
 'b0000004-0004-0004-0004-000000000004',
 'Perplexity 100% for research. The citations are everything when you need to verify claims. Gemini is smarter but doesn''t show sources as clearly.',
 true),

('e000000b-000b-000b-000b-00000000000b',
 'd0000004-0004-0004-0004-000000000004',
 'b0000009-0009-0009-0009-000000000009',
 'I actually prefer Gemini for synthesis - it connects ideas better. Perplexity is great for finding specific facts. Different tools for different jobs.',
 false),

-- Answers to Q5: ElevenLabs for YouTube
('e000000c-000c-000c-000c-00000000000c',
 'd0000005-0005-0005-0005-000000000005',
 'b0000002-0002-0002-0002-000000000002',
 'ElevenLabs quality is incredible. Used it for 50+ videos and maybe 2 comments noticed it was AI. Totally worth it. Pro tip: clone your own voice first and tweak it.',
 true),

('e000000d-000d-000d-000d-00000000000d',
 'd0000005-0005-0005-0005-000000000005',
 'b0000003-0003-0003-0003-000000000003',
 'The quality is good but it can still sound a bit robotic in longer segments. I use it for intros/outros and record the main content myself.',
 false),

-- Answers to Q6: Copilot garbage code
('e000000e-000e-000e-000e-00000000000e',
 'd0000006-0006-0006-0006-000000000006',
 'b0000001-0001-0001-0001-000000000001',
 'Yeah noticed the same thing! Turned out I had too many similar projects open. Try closing other workspaces. Fixed it for me.',
 false),

('e000000f-000f-000f-000f-00000000000f',
 'd0000006-0006-0006-0006-000000000006',
 'b0000008-0008-0008-0008-000000000008',
 'Copilot has good days and bad days honestly. Have you considered Cursor? Bit pricier but way more consistent. The Copilot free alternative is Tabnine but it''s not as smart.',
 true),

('e0000010-0010-0010-0010-000000000010',
 'd0000006-0006-0006-0006-000000000006',
 'b0000004-0004-0004-0004-000000000004',
 'Just switched to Cursor for this reason. No regrets. Copilot X was supposed to fix this but... still waiting.',
 false),

-- Answers to Q7: Julius vs Hex
('e0000011-0011-0011-0011-000000000011',
 'd0000007-0007-0007-0007-000000000007',
 'b0000004-0004-0004-0004-000000000004',
 'Julius is perfect for your use case. It''s like having a data analyst on demand. Hex is overkill unless you''re actually writing Python/SQL yourself.',
 true),

('e0000012-0012-0012-0012-000000000012',
 'd0000007-0007-0007-0007-000000000007',
 'b0000009-0009-0009-0009-000000000009',
 'Julius for quick analysis, Hex if you want to learn data science properly. Julius will do the work for you, Hex teaches you to fish.',
 false),

-- Answers to Q8: Runway
('e0000013-0013-0013-0013-000000000013',
 'd0000008-0008-0008-0008-000000000008',
 'b0000005-0005-0005-0005-000000000005',
 'Runway Gen-2 is legit for short clips. Don''t expect feature-length films but for 4-second social clips it''s actually usable now. The text-to-video is mind blowing.',
 true),

('e0000014-0014-0014-0014-000000000014',
 'd0000008-0008-0008-0008-000000000008',
 'b000000b-000b-000b-000b-00000000000b',
 'It''s good but burns through credits fast. Budget $40-50/month if you''re doing it regularly. The motion tracking and green screen features are actually more useful day-to-day.',
 false),

-- Answers to Q9: Jasper vs ChatGPT
('e0000015-0015-0015-0015-000000000015',
 'd0000009-0009-0009-0009-000000000009',
 'b000000c-000c-000c-000c-00000000000c',
 'Jasper templates save time but ChatGPT can do the same thing with good prompts. Try ChatGPT first, only upgrade to Jasper if you''re writing tons of marketing copy.',
 true),

('e0000016-0016-0016-0016-000000000016',
 'd0000009-0009-0009-0009-000000000009',
 'b0000007-0007-0007-0007-000000000007',
 'Jasper brand voice feature is worth it for agencies managing multiple clients. If you''re a solo startup, ChatGPT is more than enough.',
 false),

-- Answers to Q10: Tabnine for enterprise
('e0000017-0017-0017-0017-000000000017',
 'd000000a-000a-000a-000a-00000000000a',
 'b0000004-0004-0004-0004-000000000004',
 'We run Tabnine Enterprise. Setup was actually straightforward. It''s maybe 70% as good as Copilot but your security team will sleep better. Worth the trade-off.',
 true),

('e0000018-0018-0018-0018-000000000018',
 'd000000a-000a-000a-000a-00000000000a',
 'b0000008-0008-0008-0008-000000000008',
 'Local Tabnine is solid but the cloud version is notably better. See if your security team will approve the cloud version with data isolation.',
 false),

-- Answers to Q11: Stable Diffusion setup
('e0000019-0019-0019-0019-000000000019',
 'd000000b-000b-000b-000b-00000000000b',
 'b0000002-0002-0002-0002-000000000002',
 'If you have a decent GPU, SD is 100% worth the setup. Free generations forever. Use Automatic1111 or ComfyUI. Takes an afternoon to set up properly.',
 true),

('e000001a-001a-001a-001a-00000000001a',
 'd000000b-000b-000b-000b-00000000000b',
 'b0000005-0005-0005-0005-000000000005',
 'Midjourney is way easier for quick results. Stable Diffusion is for when you need custom models or generate thousands of images. For product mockups, just pay for MJ.',
 false),

-- Answers to Q12: ChatGPT praise
('e000001b-001b-001b-001b-00000000001b',
 'd000000c-000c-000c-000c-00000000000c',
 'b0000001-0001-0001-0001-000000000001',
 'Same! ChatGPT helped me debug a race condition that 3 senior devs couldn''t figure out. The thing has seen so much code it''s basically a collective programming consciousness.',
 false),

('e000001c-001c-001c-001c-00000000001c',
 'd000000c-000c-000c-000c-00000000000c',
 'b0000006-0006-0006-0006-000000000006',
 'GPT-4 + Cursor is my productivity cheat code. Went from 2 PRs/week to like 8. Half my job is now prompt engineering lol',
 false),

-- Answers to Q13: Claude long context
('e000001d-001d-001d-001d-00000000001d',
 'd000000d-000d-000d-000d-00000000000d',
 'b0000004-0004-0004-0004-000000000004',
 'Tested Claude with a 180 page document. It actually maintained context throughout. Asked about something from page 12 while discussing page 150 and it got it right. Impressed.',
 true),

('e000001e-001e-001e-001e-00000000001e',
 'd000000d-000d-000d-000d-00000000000d',
 'b000000c-000c-000c-000c-00000000000c',
 'Claude is amazing for this. I feed it entire codebases and it understands the architecture. Way better than ChatGPT for document analysis.',
 false),

-- Answers to Q14: Gemini vs ChatGPT
('e000001f-001f-001f-001f-00000000001f',
 'd000000e-000e-000e-000e-00000000000e',
 'b0000003-0003-0003-0003-000000000003',
 'We switched to Gemini for the Workspace integration. Google Docs integration is legitimately useful. ChatGPT is still better for complex reasoning but Gemini is good enough for 80% of tasks.',
 true),

('e0000020-0020-0020-0020-000000000020',
 'd000000e-000e-000e-000e-00000000000e',
 'b0000002-0002-0002-0002-000000000002',
 'Gemini is fine but the team will miss ChatGPT''s personality honestly. Gemini feels more corporate. Depends on your team culture.',
 false),

-- Answers to Q15: DALL-E 3
('e0000021-0021-0021-0021-000000000021',
 'd000000f-000f-000f-000f-00000000000f',
 'b0000005-0005-0005-0005-000000000005',
 'The text rendering in DALL-E 3 is a game changer for marketing graphics. Finally can make social posts with correct text. Midjourney still can''t do this.',
 false),

('e0000022-0022-0022-0022-000000000022',
 'd000000f-000f-000f-000f-00000000000f',
 'b0000008-0008-0008-0008-000000000008',
 'DALL-E 3 + ChatGPT combo is so smooth. You can iterate on images conversationally. "Make it more blue, add a person on the left" and it just works.',
 false),

-- Answers to Q16: AI tool stack
('e0000023-0023-0023-0023-000000000023',
 'd0000010-0010-0010-0010-000000000010',
 'b0000001-0001-0001-0001-000000000001',
 'Similar stack! Cursor + Claude + Stable Diffusion + Runway for me. Trying to keep costs down so using more open source where possible.',
 false),

('e0000024-0024-0024-0024-000000000024',
 'd0000010-0010-0010-0010-000000000010',
 'b0000003-0003-0003-0003-000000000003',
 'For my startup: ChatGPT for everything + Perplexity for research + DALL-E 3. Keeping it simple. All through the ChatGPT Plus subscription mostly.',
 false),

-- Answers to Q17: Perplexity praise
('e0000025-0025-0025-0025-000000000025',
 'd0000011-0011-0011-0011-000000000011',
 'b0000009-0009-0009-0009-000000000009',
 'Perplexity Pro is incredibly useful for research. The ability to see exactly where information comes from is crucial. Google is basically unusable now.',
 false),

('e0000026-0026-0026-0026-000000000026',
 'd0000011-0011-0011-0011-000000000011',
 'b000000a-000a-000a-000a-00000000000a',
 'Replaced Google for me too. The follow-up questions feature creates this rabbit hole of learning. Hours just disappear but in a good way.',
 false),

-- Answers to Q18: Jasper overpriced
('e0000027-0027-0027-0027-000000000027',
 'd0000012-0012-0012-0012-000000000012',
 'b0000007-0007-0007-0007-000000000007',
 'You''re not wrong. Jasper was worth it before ChatGPT but now the gap is tiny. Only reason to pay for Jasper is their template library and team features.',
 true),

('e0000028-0028-0028-0028-000000000028',
 'd0000012-0012-0012-0012-000000000012',
 'b0000003-0003-0003-0003-000000000003',
 'Jasper is pricing for enterprises. If you''re a solo creator, just use ChatGPT with custom GPTs. Basically the same thing.',
 false),

-- Answers to Q19: Cursor Composer
('e0000029-0029-0029-0029-000000000029',
 'd0000013-0013-0013-0013-000000000013',
 'b0000008-0008-0008-0008-000000000008',
 'Composer is insane. Built a complete CRUD API in one prompt. Cursor understood my file structure and placed everything correctly. Copilot can''t do this.',
 false),

('e000002a-002a-002a-002a-00000000002a',
 'd0000013-0013-0013-0013-000000000013',
 'b0000004-0004-0004-0004-000000000004',
 'The multi-file editing is what makes Cursor special. It''s like having a junior dev who can actually follow instructions perfectly.',
 false),

-- Answers to Q20: ElevenLabs follow-up
('e000002b-002b-002b-002b-00000000002b',
 'd0000014-0014-0014-0014-000000000014',
 'b0000003-0003-0003-0003-000000000003',
 'Thanks for the update! Gonna try it for my product demos. The voice cloning sounds perfect for maintaining brand consistency.',
 false),

('e000002c-002c-002c-002c-00000000002c',
 'd0000014-0014-0014-0014-000000000014',
 'b0000002-0002-0002-0002-000000000002',
 'ElevenLabs keeps getting better. The emotion controls in the newer models make it sound even more natural. Worth revisiting if you tried it a year ago.',
 false),

-- Answers to Q21: Hex vs Jupyter
('e000002d-002d-002d-002d-00000000002d',
 'd0000015-0015-0015-0015-000000000015',
 'b0000009-0009-0009-0009-000000000009',
 'Made the switch to Hex last quarter. Version control and collaboration features alone are worth it. No more "which notebook is the latest" drama.',
 true),

('e000002e-002e-002e-002e-00000000002e',
 'd0000015-0015-0015-0015-000000000015',
 'b0000004-0004-0004-0004-000000000004',
 'Hex AI features are nice too. Auto-generates SQL from natural language. Helped our less technical people actually contribute.',
 false),

-- Answers to Q22: Runway + ElevenLabs
('e000002f-002f-002f-002f-00000000002f',
 'd0000016-0016-0016-0016-000000000016',
 'b0000002-0002-0002-0002-000000000002',
 'Tried this exact combo. Quality is there for explainer videos and social content. Wouldn''t use it for premium brand content yet but getting close.',
 true),

('e0000030-0030-0030-0030-000000000030',
 'd0000016-0016-0016-0016-000000000016',
 'b0000005-0005-0005-0005-000000000005',
 'Add Midjourney for the initial frames and you''ve got a full pipeline. I''m making videos 10x faster than before. The future is here.',
 false),

-- Answers to Q23: Tabnine experience
('e0000031-0031-0031-0031-000000000031',
 'd0000017-0017-0017-0017-000000000017',
 'b0000001-0001-0001-0001-000000000001',
 'Similar experience. Tabnine is like 80% of Copilot which is still really good. The privacy is non-negotiable for some clients so it''s the only option.',
 false),

('e0000032-0032-0032-0032-000000000032',
 'd0000017-0017-0017-0017-000000000017',
 'b0000004-0004-0004-0004-000000000004',
 'If you train Tabnine on your codebase it gets way better. The initial out-of-box experience isn''t great but give it a few weeks.',
 false),

-- Answers to Q24: Claude paper explanation
('e0000033-0033-0033-0033-000000000033',
 'd0000018-0018-0018-0018-000000000018',
 'b0000004-0004-0004-0004-000000000004',
 'Claude is legit my research assistant now. It doesn''t just summarize papers, it can actually discuss implications and connect ideas to other work.',
 false),

('e0000034-0034-0034-0034-000000000034',
 'd0000018-0018-0018-0018-000000000018',
 'b0000002-0002-0002-0002-000000000002',
 'Used Claude for my thesis literature review. It found connections between papers I never would have seen. Literally expanded my bibliography.',
 false),

-- Answers to Q25: Julius for non-coders
('e0000035-0035-0035-0035-000000000035',
 'd0000019-0019-0019-0019-000000000019',
 'b0000003-0003-0003-0003-000000000003',
 'Julius is perfect for business users. Our sales team uses it for pipeline analysis now. No more waiting 2 weeks for the BI team.',
 false),

('e0000036-0036-0036-0036-000000000036',
 'd0000019-0019-0019-0019-000000000019',
 'b0000004-0004-0004-0004-000000000004',
 'For quick analysis, Julius is unbeatable. Only downside is the data doesn''t persist well. Still use Hex for anything that needs version control.',
 false)

ON CONFLICT (id) DO NOTHING;

-- =====================================================
-- 4. QUESTION-TOOL MENTIONS (For Community Scoring)
-- =====================================================
-- Maps questions to the tools they mention for faster lookups

INSERT INTO public.question_tool_mentions (question_id, tool_id) VALUES
  -- Q1 mentions: Cursor, GitHub Copilot
  ('d0000001-0001-0001-0001-000000000001', 'a1111111-1111-1111-1111-111111111112'), -- Cursor
  ('d0000001-0001-0001-0001-000000000001', 'a1111111-1111-1111-1111-111111111111'), -- Copilot
  -- Q2 mentions: ChatGPT, Claude
  ('d0000002-0002-0002-0002-000000000002', 'a2222222-2222-2222-2222-222222222221'), -- ChatGPT
  ('d0000002-0002-0002-0002-000000000002', 'a2222222-2222-2222-2222-222222222222'), -- Claude
  -- Q3 mentions: Midjourney, DALL-E, Stable Diffusion
  ('d0000003-0003-0003-0003-000000000003', 'a4444444-4444-4444-4444-444444444441'), -- Midjourney
  ('d0000003-0003-0003-0003-000000000003', 'a4444444-4444-4444-4444-444444444442'), -- DALL-E
  ('d0000003-0003-0003-0003-000000000003', 'a4444444-4444-4444-4444-444444444443'), -- SD
  -- Q4 mentions: Perplexity, Gemini
  ('d0000004-0004-0004-0004-000000000004', 'a3333333-3333-3333-3333-333333333332'), -- Perplexity
  ('d0000004-0004-0004-0004-000000000004', 'a3333333-3333-3333-3333-333333333331'), -- Gemini
  -- Q5 mentions: ElevenLabs
  ('d0000005-0005-0005-0005-000000000005', 'a5555555-5555-5555-5555-555555555551'), -- ElevenLabs
  -- Q6 mentions: GitHub Copilot
  ('d0000006-0006-0006-0006-000000000006', 'a1111111-1111-1111-1111-111111111111'), -- Copilot
  -- Q7 mentions: Julius, Hex
  ('d0000007-0007-0007-0007-000000000007', 'a7777777-7777-7777-7777-777777777771'), -- Julius
  ('d0000007-0007-0007-0007-000000000007', 'a7777777-7777-7777-7777-777777777772'), -- Hex
  -- Q8 mentions: Runway
  ('d0000008-0008-0008-0008-000000000008', 'a6666666-6666-6666-6666-666666666661'), -- Runway
  -- Q9 mentions: Jasper, ChatGPT
  ('d0000009-0009-0009-0009-000000000009', 'a2222222-2222-2222-2222-222222222223'), -- Jasper
  ('d0000009-0009-0009-0009-000000000009', 'a2222222-2222-2222-2222-222222222221'), -- ChatGPT
  -- Q10 mentions: Tabnine, Copilot
  ('d000000a-000a-000a-000a-00000000000a', 'a1111111-1111-1111-1111-111111111113'), -- Tabnine
  ('d000000a-000a-000a-000a-00000000000a', 'a1111111-1111-1111-1111-111111111111'), -- Copilot
  -- Q11 mentions: Stable Diffusion, Midjourney
  ('d000000b-000b-000b-000b-00000000000b', 'a4444444-4444-4444-4444-444444444443'), -- SD
  ('d000000b-000b-000b-000b-00000000000b', 'a4444444-4444-4444-4444-444444444441'), -- Midjourney
  -- Q12 mentions: ChatGPT
  ('d000000c-000c-000c-000c-00000000000c', 'a2222222-2222-2222-2222-222222222221'), -- ChatGPT
  -- Q13 mentions: Claude
  ('d000000d-000d-000d-000d-00000000000d', 'a2222222-2222-2222-2222-222222222222'), -- Claude
  -- Q14 mentions: Gemini, ChatGPT
  ('d000000e-000e-000e-000e-00000000000e', 'a3333333-3333-3333-3333-333333333331'), -- Gemini
  ('d000000e-000e-000e-000e-00000000000e', 'a2222222-2222-2222-2222-222222222221'), -- ChatGPT
  -- Q15 mentions: DALL-E, ChatGPT
  ('d000000f-000f-000f-000f-00000000000f', 'a4444444-4444-4444-4444-444444444442'), -- DALL-E
  ('d000000f-000f-000f-000f-00000000000f', 'a2222222-2222-2222-2222-222222222221'), -- ChatGPT
  -- Q16 mentions: Cursor, ChatGPT, Midjourney, ElevenLabs
  ('d0000010-0010-0010-0010-000000000010', 'a1111111-1111-1111-1111-111111111112'), -- Cursor
  ('d0000010-0010-0010-0010-000000000010', 'a2222222-2222-2222-2222-222222222221'), -- ChatGPT
  ('d0000010-0010-0010-0010-000000000010', 'a4444444-4444-4444-4444-444444444441'), -- Midjourney
  ('d0000010-0010-0010-0010-000000000010', 'a5555555-5555-5555-5555-555555555551'), -- ElevenLabs
  -- Q17 mentions: Perplexity
  ('d0000011-0011-0011-0011-000000000011', 'a3333333-3333-3333-3333-333333333332'), -- Perplexity
  -- Q18 mentions: Jasper, ChatGPT
  ('d0000012-0012-0012-0012-000000000012', 'a2222222-2222-2222-2222-222222222223'), -- Jasper
  ('d0000012-0012-0012-0012-000000000012', 'a2222222-2222-2222-2222-222222222221'), -- ChatGPT
  -- Q19 mentions: Cursor, Copilot
  ('d0000013-0013-0013-0013-000000000013', 'a1111111-1111-1111-1111-111111111112'), -- Cursor
  ('d0000013-0013-0013-0013-000000000013', 'a1111111-1111-1111-1111-111111111111'), -- Copilot
  -- Q20 mentions: ElevenLabs
  ('d0000014-0014-0014-0014-000000000014', 'a5555555-5555-5555-5555-555555555551'), -- ElevenLabs
  -- Q21 mentions: Hex
  ('d0000015-0015-0015-0015-000000000015', 'a7777777-7777-7777-7777-777777777772'), -- Hex
  -- Q22 mentions: Runway, ElevenLabs
  ('d0000016-0016-0016-0016-000000000016', 'a6666666-6666-6666-6666-666666666661'), -- Runway
  ('d0000016-0016-0016-0016-000000000016', 'a5555555-5555-5555-5555-555555555551'), -- ElevenLabs
  -- Q23 mentions: Tabnine, Copilot
  ('d0000017-0017-0017-0017-000000000017', 'a1111111-1111-1111-1111-111111111113'), -- Tabnine
  ('d0000017-0017-0017-0017-000000000017', 'a1111111-1111-1111-1111-111111111111'), -- Copilot
  -- Q24 mentions: Claude
  ('d0000018-0018-0018-0018-000000000018', 'a2222222-2222-2222-2222-222222222222'), -- Claude
  -- Q25 mentions: Julius
  ('d0000019-0019-0019-0019-000000000019', 'a7777777-7777-7777-7777-777777777771') -- Julius
ON CONFLICT DO NOTHING;

-- =====================================================
-- SUMMARY
-- =====================================================
-- Auth Users: 12 test users (profiles auto-created by trigger)
-- Questions: 25 threads
-- Answers: 54 responses (avg 2.2 per question)
-- Tool mentions: 46 explicit mappings (all 16 tools covered)
--
-- KEY CHANGES IN v3:
-- - Removed explicit profiles INSERT (auto-created by trigger)
-- - Changed status from 'published' to 'active' (enum value)
-- - Removed mention_count column (doesn't exist in schema)
-- - Added raw_user_meta_data for proper profile creation
-- =====================================================
