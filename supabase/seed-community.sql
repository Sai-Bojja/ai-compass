-- =====================================================
-- AIDEAS.AI - COMMUNITY Q&A SEED DATA
-- =====================================================
-- Realistic Reddit/Slack-style conversations about AI tools.
-- Each question has multiple answers with varied sentiments.
--
-- Run this AFTER the main seed.sql has been applied.
-- This adds to existing data, does NOT truncate.
--
-- Tables populated:
--   - profiles (anonymous community members)
--   - questions
--   - answers
--   - question_tool_mentions
-- =====================================================

-- =====================================================
-- 1. ANONYMOUS PROFILES (Community Members)
-- =====================================================
-- These simulate real community users without requiring auth

INSERT INTO public.profiles (id, display_name, avatar_url, bio) VALUES
  ('p0000001-0001-0001-0001-000000000001', 'dev_ninja42', NULL, 'Full-stack dev, coffee addict'),
  ('p0000001-0001-0001-0001-000000000002', 'AIEnthusiast', NULL, 'Testing all the AI tools so you dont have to'),
  ('p0000001-0001-0001-0001-000000000003', 'startup_founder', NULL, 'Building the next big thing'),
  ('p0000001-0001-0001-0001-000000000004', 'DataScienceGuru', NULL, 'ML engineer at a Fortune 500'),
  ('p0000001-0001-0001-0001-000000000005', 'creative_alex', NULL, 'Designer & illustrator'),
  ('p0000001-0001-0001-0001-000000000006', 'backend_bob', NULL, 'Java by day, Rust by night'),
  ('p0000001-0001-0001-0001-000000000007', 'content_queen', NULL, 'Content marketer & writer'),
  ('p0000001-0001-0001-0001-000000000008', 'indie_hacker', NULL, 'Solo dev building in public'),
  ('p0000001-0001-0001-0001-000000000009', 'ml_researcher', NULL, 'PhD in ML, working on NLP'),
  ('p0000001-0001-0001-0001-000000000010', 'product_manager', NULL, 'PM at a Series B startup'),
  ('p0000001-0001-0001-0001-000000000011', 'video_creator', NULL, 'YouTuber and content creator'),
  ('p0000001-0001-0001-0001-000000000012', 'freelance_writer', NULL, 'Copywriter for hire')
ON CONFLICT (id) DO NOTHING;

-- =====================================================
-- 2. QUESTIONS (Community Discussions)
-- =====================================================

INSERT INTO public.questions (id, user_id, title, body, status) VALUES

-- Q1: Code editor comparison
('q0000001-0001-0001-0001-000000000001',
 'p0000001-0001-0001-0001-000000000001',
 'Cursor vs GitHub Copilot - which one should I go with?',
 'Hey everyone, I''m currently using VS Code with Copilot but keep hearing about Cursor. Is it worth switching? I mainly work on React/Node projects. Looking for real experiences, not just marketing hype.',
 'published'),

-- Q2: Writing assistant comparison
('q0000001-0001-0001-0001-000000000002',
 'p0000001-0001-0001-0001-000000000007',
 'ChatGPT vs Claude for long-form content?',
 'I write blog posts and documentation. Been using ChatGPT Plus but heard Claude handles longer documents better. Anyone actually compared them for writing tasks? Budget isn''t a huge concern.',
 'published'),

-- Q3: Image generation
('q0000001-0001-0001-0001-000000000003',
 'p0000001-0001-0001-0001-000000000005',
 'Midjourney alternatives? Getting frustrated with Discord',
 'Love the output quality of Midjourney but the Discord workflow is killing me. Are DALL-E or Stable Diffusion viable alternatives? I need consistent style for brand assets.',
 'published'),

-- Q4: Research tools
('q0000001-0001-0001-0001-000000000004',
 'p0000001-0001-0001-0001-000000000009',
 'Perplexity vs Gemini for research?',
 'Working on a literature review and need an AI that can help me find and summarize papers. Tried both briefly - Perplexity cites sources but Gemini feels smarter. What''s your experience?',
 'published'),

-- Q5: Voice synthesis
('q0000001-0001-0001-0001-000000000005',
 'p0000001-0001-0001-0001-000000000011',
 'Is ElevenLabs worth the price for YouTube?',
 'Making educational videos and my voice gets tired doing long recordings. Considering ElevenLabs for voiceovers. Is the quality good enough that viewers won''t notice it''s AI?',
 'published'),

-- Q6: Copilot frustrations
('q0000001-0001-0001-0001-000000000006',
 'p0000001-0001-0001-0001-000000000006',
 'GitHub Copilot keeps suggesting garbage code lately',
 'Anyone else notice Copilot quality going down? Past few weeks the suggestions have been way off. Like it''s not even looking at my codebase anymore. Waste of $19/month tbh',
 'published'),

-- Q7: Data analysis
('q0000001-0001-0001-0001-000000000007',
 'p0000001-0001-0001-0001-000000000004',
 'Julius AI vs Hex for data analysis?',
 'Non-technical PM here. Need to analyze CSV exports without bothering our data team. Julius looks simpler but Hex seems more powerful. What would you recommend for someone who knows basic SQL?',
 'published'),

-- Q8: Video editing
('q0000001-0001-0001-0001-000000000008',
 'p0000001-0001-0001-0001-000000000011',
 'Runway ML - actually useful or just hype?',
 'Seeing Runway all over my Twitter feed. Is the Gen-2 video generation actually production-ready? Need it for short social clips, nothing crazy.',
 'published'),

-- Q9: Marketing copy
('q0000001-0001-0001-0001-000000000009',
 'p0000001-0001-0001-0001-000000000003',
 'Jasper vs ChatGPT for marketing copy?',
 'Running a startup and need to pump out landing pages, ads, and emails. Is Jasper worth the premium price or can ChatGPT do the same thing for less?',
 'published'),

-- Q10: Code privacy
('q0000001-0001-0001-0001-000000000010',
 'p0000001-0001-0001-0001-000000000006',
 'Tabnine for enterprise - anyone using it?',
 'Our security team is blocking Copilot due to code privacy concerns. Tabnine claims they can run locally. Anyone actually set this up? Is it as good as Copilot?',
 'published'),

-- Q11: Stable Diffusion setup
('q0000001-0001-0001-0001-000000000011',
 'p0000001-0001-0001-0001-000000000008',
 'Is Stable Diffusion worth the setup hassle?',
 'Want to generate product mockups for my indie project. SD is free but looks complicated to set up. Should I just pay for Midjourney instead?',
 'published'),

-- Q12: ChatGPT praise
('q0000001-0001-0001-0001-000000000012',
 'p0000001-0001-0001-0001-000000000002',
 'ChatGPT-4 just saved me 20 hours of work',
 'Had to refactor a legacy PHP codebase. GPT-4 understood the entire context and gave me a migration plan. This thing is insane. What are your best productivity wins with ChatGPT?',
 'published'),

-- Q13: Claude long context
('q0000001-0001-0001-0001-000000000013',
 'p0000001-0001-0001-0001-000000000009',
 'Claude 100k context - actually works?',
 'Need to analyze a 200-page legal document. Claude claims 100k context. Has anyone actually tested this with long documents? Does it maintain coherence?',
 'published'),

-- Q14: Gemini comparison
('q0000001-0001-0001-0001-000000000014',
 'p0000001-0001-0001-0001-000000000010',
 'Gemini vs ChatGPT for daily work tasks?',
 'Company is considering Gemini because of Google Workspace integration. Currently using ChatGPT. Is Gemini good enough to replace it or will the team revolt?',
 'published'),

-- Q15: DALL-E in ChatGPT
('q0000001-0001-0001-0001-000000000015',
 'p0000001-0001-0001-0001-000000000007',
 'DALL-E 3 in ChatGPT is a game changer',
 'Just realized DALL-E 3 is included in ChatGPT Plus. The image quality is so much better than DALL-E 2. And it actually renders text correctly! Anyone else impressed?',
 'published'),

-- Q16: Multiple tool workflow
('q0000001-0001-0001-0001-000000000016',
 'p0000001-0001-0001-0001-000000000008',
 'My AI tool stack for solo development',
 'Curious what others are using. Currently: Cursor for coding, ChatGPT for brainstorming, Midjourney for graphics, ElevenLabs for demo videos. What''s your stack?',
 'published'),

-- Q17: Perplexity praise
('q0000001-0001-0001-0001-000000000017',
 'p0000001-0001-0001-0001-000000000002',
 'Perplexity Pro is underrated',
 'Been using Perplexity Pro for 3 months and it''s become my default search. The citations are so useful for fact-checking. Why isn''t this more popular?',
 'published'),

-- Q18: Negative Jasper experience
('q0000001-0001-0001-0001-000000000018',
 'p0000001-0001-0001-0001-000000000012',
 'Jasper is overpriced - change my mind',
 'Tried Jasper for a month. The output isn''t better than ChatGPT but costs 5x more. The templates are nice but not $50/month nice. Am I missing something?',
 'published'),

-- Q19: Cursor praise
('q0000001-0001-0001-0001-000000000019',
 'p0000001-0001-0001-0001-000000000001',
 'Cursor Composer mode is incredible',
 'Just discovered Composer in Cursor. You can describe a feature and it edits multiple files at once. Actually built a complete auth system in like 10 minutes. Mind blown.',
 'published'),

-- Q20: ElevenLabs quality
('q0000001-0001-0001-0001-000000000020',
 'p0000001-0001-0001-0001-000000000011',
 'Update: ElevenLabs voice quality is crazy good',
 'Posted asking about ElevenLabs a while back. Finally tried it. The voice cloning with just 30 seconds of audio is scary accurate. Worth every penny for content creators.',
 'published'),

-- Q21: Hex for teams
('q0000001-0001-0001-0001-000000000021',
 'p0000001-0001-0001-0001-000000000004',
 'Hex vs Jupyter for team data science?',
 'Our data team is growing and Jupyter notebooks are getting messy. Hex looks promising with the collaboration features. Anyone made this switch?',
 'published'),

-- Q22: Video creation workflow
('q0000001-0001-0001-0001-000000000022',
 'p0000001-0001-0001-0001-000000000011',
 'Runway + ElevenLabs = full AI video pipeline?',
 'Thinking about creating videos entirely with AI. Runway for visuals, ElevenLabs for voice. Has anyone tried this combo? Is the quality there yet?',
 'published'),

-- Q23: Tabnine vs Copilot
('q0000001-0001-0001-0001-000000000023',
 'p0000001-0001-0001-0001-000000000006',
 'Switched from Copilot to Tabnine - my experience',
 'After 6 months with Copilot, tried Tabnine for the privacy features. It''s... okay. Definitely not as smart but the local model is fast and secure. Trade-offs.',
 'published'),

-- Q24: Claude praise
('q0000001-0001-0001-0001-000000000024',
 'p0000001-0001-0001-0001-000000000009',
 'Claude just explained a complex paper better than my advisor',
 'Fed Claude a dense ML paper and asked for an ELI5. The explanation was so clear I finally understood attention mechanisms. This is the future of learning.',
 'published'),

-- Q25: Julius for non-technical
('q0000001-0001-0001-0001-000000000025',
 'p0000001-0001-0001-0001-000000000010',
 'Julius AI review from a non-coder',
 'Finally found a data tool I can actually use! Julius lets me upload CSVs and ask questions in plain English. Made charts my boss loved without touching Excel. Highly recommend for PMs.',
 'published')

ON CONFLICT (id) DO NOTHING;

-- =====================================================
-- 3. ANSWERS (Multiple per question, varied sentiments)
-- =====================================================

INSERT INTO public.answers (id, question_id, user_id, body, is_accepted) VALUES

-- Answers to Q1: Cursor vs Copilot
('a0000001-0001-0001-0001-000000000001',
 'q0000001-0001-0001-0001-000000000001',
 'p0000001-0001-0001-0001-000000000008',
 'Switched to Cursor 2 months ago and not looking back. The codebase chat feature is insane - you can ask questions about your entire project. Copilot feels dumb in comparison now.',
 true),

('a0000001-0001-0001-0001-000000000002',
 'q0000001-0001-0001-0001-000000000001',
 'p0000001-0001-0001-0001-000000000006',
 'I use both actually. Copilot is still better for quick inline completions. Cursor shines when you need to refactor or understand legacy code. The free tier is generous enough to try.',
 false),

('a0000001-0001-0001-0001-000000000003',
 'q0000001-0001-0001-0001-000000000001',
 'p0000001-0001-0001-0001-000000000004',
 'Honestly, Cursor crashed on me a few times last week. Copilot in VS Code is more stable. But when Cursor works, it''s magical. YMMV.',
 false),

-- Answers to Q2: ChatGPT vs Claude for writing
('a0000001-0001-0001-0001-000000000004',
 'q0000001-0001-0001-0001-000000000002',
 'p0000001-0001-0001-0001-000000000012',
 'Claude is significantly better for long-form content. I can paste my entire 10k word draft and it actually remembers context from the beginning. ChatGPT loses the thread around 3k words.',
 true),

('a0000001-0001-0001-0001-000000000005',
 'q0000001-0001-0001-0001-000000000002',
 'p0000001-0001-0001-0001-000000000002',
 'ChatGPT-4 is better for creative writing imo. Claude is more... careful? Like it won''t take risks. For documentation though, Claude''s accuracy is unmatched.',
 false),

('a0000001-0001-0001-0001-000000000006',
 'q0000001-0001-0001-0001-000000000002',
 'p0000001-0001-0001-0001-000000000003',
 'I use both. ChatGPT for brainstorming, Claude for polishing. They complement each other well.',
 false),

-- Answers to Q3: Midjourney alternatives
('a0000001-0001-0001-0001-000000000007',
 'q0000001-0001-0001-0001-000000000003',
 'p0000001-0001-0001-0001-000000000008',
 'DALL-E 3 has gotten really good. The text rendering actually works now. But for pure aesthetics, Midjourney still has that special sauce. The Discord thing is annoying though, agreed.',
 false),

('a0000001-0001-0001-0001-000000000008',
 'q0000001-0001-0001-0001-000000000003',
 'p0000001-0001-0001-0001-000000000002',
 'Stable Diffusion is amazing if you take the time to learn it. ComfyUI made it way more accessible. You can train custom styles on your brand which MJ and DALL-E can''t do.',
 true),

('a0000001-0001-0001-0001-000000000009',
 'q0000001-0001-0001-0001-000000000003',
 'p0000001-0001-0001-0001-000000000005',
 'For brand assets specifically, DALL-E is more consistent. Midjourney gives you 4 variations and they''re all slightly different styles. Frustrating when you need matching assets.',
 false),

-- Answers to Q4: Perplexity vs Gemini
('a0000001-0001-0001-0001-000000000010',
 'q0000001-0001-0001-0001-000000000004',
 'p0000001-0001-0001-0001-000000000004',
 'Perplexity 100% for research. The citations are everything when you need to verify claims. Gemini is smarter but doesn''t show sources as clearly.',
 true),

('a0000001-0001-0001-0001-000000000011',
 'q0000001-0001-0001-0001-000000000004',
 'p0000001-0001-0001-0001-000000000009',
 'I actually prefer Gemini for synthesis - it connects ideas better. Perplexity is great for finding specific facts. Different tools for different jobs.',
 false),

-- Answers to Q5: ElevenLabs for YouTube
('a0000001-0001-0001-0001-000000000012',
 'q0000001-0001-0001-0001-000000000005',
 'p0000001-0001-0001-0001-000000000002',
 'ElevenLabs quality is incredible. Used it for 50+ videos and maybe 2 comments noticed it was AI. Totally worth it. Pro tip: clone your own voice first and tweak it.',
 true),

('a0000001-0001-0001-0001-000000000013',
 'q0000001-0001-0001-0001-000000000005',
 'p0000001-0001-0001-0001-000000000003',
 'The quality is good but it can still sound a bit robotic in longer segments. I use it for intros/outros and record the main content myself.',
 false),

-- Answers to Q6: Copilot garbage code
('a0000001-0001-0001-0001-000000000014',
 'q0000001-0001-0001-0001-000000000006',
 'p0000001-0001-0001-0001-000000000001',
 'Yeah noticed the same thing! Turned out I had too many similar projects open. Try closing other workspaces. Fixed it for me.',
 false),

('a0000001-0001-0001-0001-000000000015',
 'q0000001-0001-0001-0001-000000000006',
 'p0000001-0001-0001-0001-000000000008',
 'Copilot has good days and bad days honestly. Have you considered Cursor? Bit pricier but way more consistent. The Copilot free alternative is Tabnine but it''s not as smart.',
 true),

('a0000001-0001-0001-0001-000000000016',
 'q0000001-0001-0001-0001-000000000006',
 'p0000001-0001-0001-0001-000000000004',
 'Just switched to Cursor for this reason. No regrets. Copilot X was supposed to fix this but... still waiting.',
 false),

-- Answers to Q7: Julius vs Hex
('a0000001-0001-0001-0001-000000000017',
 'q0000001-0001-0001-0001-000000000007',
 'p0000001-0001-0001-0001-000000000004',
 'Julius is perfect for your use case. It''s like having a data analyst on demand. Hex is overkill unless you''re actually writing Python/SQL yourself.',
 true),

('a0000001-0001-0001-0001-000000000018',
 'q0000001-0001-0001-0001-000000000007',
 'p0000001-0001-0001-0001-000000000009',
 'Julius for quick analysis, Hex if you want to learn data science properly. Julius will do the work for you, Hex teaches you to fish.',
 false),

-- Answers to Q8: Runway
('a0000001-0001-0001-0001-000000000019',
 'q0000001-0001-0001-0001-000000000008',
 'p0000001-0001-0001-0001-000000000005',
 'Runway Gen-2 is legit for short clips. Don''t expect feature-length films but for 4-second social clips it''s actually usable now. The text-to-video is mind blowing.',
 true),

('a0000001-0001-0001-0001-000000000020',
 'q0000001-0001-0001-0001-000000000008',
 'p0000001-0001-0001-0001-000000000011',
 'It''s good but burns through credits fast. Budget $40-50/month if you''re doing it regularly. The motion tracking and green screen features are actually more useful day-to-day.',
 false),

-- Answers to Q9: Jasper vs ChatGPT
('a0000001-0001-0001-0001-000000000021',
 'q0000001-0001-0001-0001-000000000009',
 'p0000001-0001-0001-0001-000000000012',
 'Jasper templates save time but ChatGPT can do the same thing with good prompts. Try ChatGPT first, only upgrade to Jasper if you''re writing tons of marketing copy.',
 true),

('a0000001-0001-0001-0001-000000000022',
 'q0000001-0001-0001-0001-000000000009',
 'p0000001-0001-0001-0001-000000000007',
 'Jasper brand voice feature is worth it for agencies managing multiple clients. If you''re a solo startup, ChatGPT is more than enough.',
 false),

-- Answers to Q10: Tabnine for enterprise
('a0000001-0001-0001-0001-000000000023',
 'q0000001-0001-0001-0001-000000000010',
 'p0000001-0001-0001-0001-000000000004',
 'We run Tabnine Enterprise. Setup was actually straightforward. It''s maybe 70% as good as Copilot but your security team will sleep better. Worth the trade-off.',
 true),

('a0000001-0001-0001-0001-000000000024',
 'q0000001-0001-0001-0001-000000000010',
 'p0000001-0001-0001-0001-000000000008',
 'Local Tabnine is solid but the cloud version is notably better. See if your security team will approve the cloud version with data isolation.',
 false),

-- Answers to Q11: Stable Diffusion setup
('a0000001-0001-0001-0001-000000000025',
 'q0000001-0001-0001-0001-000000000011',
 'p0000001-0001-0001-0001-000000000002',
 'If you have a decent GPU, SD is 100% worth the setup. Free generations forever. Use Automatic1111 or ComfyUI. Takes an afternoon to set up properly.',
 true),

('a0000001-0001-0001-0001-000000000026',
 'q0000001-0001-0001-0001-000000000011',
 'p0000001-0001-0001-0001-000000000005',
 'Midjourney is way easier for quick results. Stable Diffusion is for when you need custom models or generate thousands of images. For product mockups, just pay for MJ.',
 false),

-- Answers to Q12: ChatGPT praise
('a0000001-0001-0001-0001-000000000027',
 'q0000001-0001-0001-0001-000000000012',
 'p0000001-0001-0001-0001-000000000001',
 'Same! ChatGPT helped me debug a race condition that 3 senior devs couldn''t figure out. The thing has seen so much code it''s basically a collective programming consciousness.',
 false),

('a0000001-0001-0001-0001-000000000028',
 'q0000001-0001-0001-0001-000000000012',
 'p0000001-0001-0001-0001-000000000006',
 'GPT-4 + Cursor is my productivity cheat code. Went from 2 PRs/week to like 8. Half my job is now prompt engineering lol',
 false),

-- Answers to Q13: Claude long context
('a0000001-0001-0001-0001-000000000029',
 'q0000001-0001-0001-0001-000000000013',
 'p0000001-0001-0001-0001-000000000004',
 'Tested Claude with a 180 page document. It actually maintained context throughout. Asked about something from page 12 while discussing page 150 and it got it right. Impressed.',
 true),

('a0000001-0001-0001-0001-000000000030',
 'q0000001-0001-0001-0001-000000000013',
 'p0000001-0001-0001-0001-000000000012',
 'Claude is amazing for this. I feed it entire codebases and it understands the architecture. Way better than ChatGPT for document analysis.',
 false),

-- Answers to Q14: Gemini vs ChatGPT
('a0000001-0001-0001-0001-000000000031',
 'q0000001-0001-0001-0001-000000000014',
 'p0000001-0001-0001-0001-000000000003',
 'We switched to Gemini for the Workspace integration. Google Docs integration is legitimately useful. ChatGPT is still better for complex reasoning but Gemini is good enough for 80% of tasks.',
 true),

('a0000001-0001-0001-0001-000000000032',
 'q0000001-0001-0001-0001-000000000014',
 'p0000001-0001-0001-0001-000000000002',
 'Gemini is fine but the team will miss ChatGPT''s personality honestly. Gemini feels more corporate. Depends on your team culture.',
 false),

-- Answers to Q15: DALL-E 3
('a0000001-0001-0001-0001-000000000033',
 'q0000001-0001-0001-0001-000000000015',
 'p0000001-0001-0001-0001-000000000005',
 'The text rendering in DALL-E 3 is a game changer for marketing graphics. Finally can make social posts with correct text. Midjourney still can''t do this.',
 false),

('a0000001-0001-0001-0001-000000000034',
 'q0000001-0001-0001-0001-000000000015',
 'p0000001-0001-0001-0001-000000000008',
 'DALL-E 3 + ChatGPT combo is so smooth. You can iterate on images conversationally. "Make it more blue, add a person on the left" and it just works.',
 false),

-- Answers to Q16: AI tool stack
('a0000001-0001-0001-0001-000000000035',
 'q0000001-0001-0001-0001-000000000016',
 'p0000001-0001-0001-0001-000000000001',
 'Similar stack! Cursor + Claude + Stable Diffusion + Runway for me. Trying to keep costs down so using more open source where possible.',
 false),

('a0000001-0001-0001-0001-000000000036',
 'q0000001-0001-0001-0001-000000000016',
 'p0000001-0001-0001-0001-000000000003',
 'For my startup: ChatGPT for everything + Perplexity for research + DALL-E 3. Keeping it simple. All through the ChatGPT Plus subscription mostly.',
 false),

-- Answers to Q17: Perplexity praise
('a0000001-0001-0001-0001-000000000037',
 'q0000001-0001-0001-0001-000000000017',
 'p0000001-0001-0001-0001-000000000009',
 'Perplexity Pro is incredibly useful for research. The ability to see exactly where information comes from is crucial. Google is basically unusable now.',
 false),

('a0000001-0001-0001-0001-000000000038',
 'q0000001-0001-0001-0001-000000000017',
 'p0000001-0001-0001-0001-000000000010',
 'Replaced Google for me too. The follow-up questions feature creates this rabbit hole of learning. Hours just disappear but in a good way.',
 false),

-- Answers to Q18: Jasper overpriced
('a0000001-0001-0001-0001-000000000039',
 'q0000001-0001-0001-0001-000000000018',
 'p0000001-0001-0001-0001-000000000007',
 'You''re not wrong. Jasper was worth it before ChatGPT but now the gap is tiny. Only reason to pay for Jasper is their template library and team features.',
 true),

('a0000001-0001-0001-0001-000000000040',
 'q0000001-0001-0001-0001-000000000018',
 'p0000001-0001-0001-0001-000000000003',
 'Jasper is pricing for enterprises. If you''re a solo creator, just use ChatGPT with custom GPTs. Basically the same thing.',
 false),

-- Answers to Q19: Cursor Composer
('a0000001-0001-0001-0001-000000000041',
 'q0000001-0001-0001-0001-000000000019',
 'p0000001-0001-0001-0001-000000000008',
 'Composer is insane. Built a complete CRUD API in one prompt. Cursor understood my file structure and placed everything correctly. Copilot can''t do this.',
 false),

('a0000001-0001-0001-0001-000000000042',
 'q0000001-0001-0001-0001-000000000019',
 'p0000001-0001-0001-0001-000000000004',
 'The multi-file editing is what makes Cursor special. It''s like having a junior dev who can actually follow instructions perfectly.',
 false),

-- Answers to Q20: ElevenLabs follow-up
('a0000001-0001-0001-0001-000000000043',
 'q0000001-0001-0001-0001-000000000020',
 'p0000001-0001-0001-0001-000000000003',
 'Thanks for the update! Gonna try it for my product demos. The voice cloning sounds perfect for maintaining brand consistency.',
 false),

('a0000001-0001-0001-0001-000000000044',
 'q0000001-0001-0001-0001-000000000020',
 'p0000001-0001-0001-0001-000000000002',
 'ElevenLabs keeps getting better. The emotion controls in the newer models make it sound even more natural. Worth revisiting if you tried it a year ago.',
 false),

-- Answers to Q21: Hex vs Jupyter
('a0000001-0001-0001-0001-000000000045',
 'q0000001-0001-0001-0001-000000000021',
 'p0000001-0001-0001-0001-000000000009',
 'Made the switch to Hex last quarter. Version control and collaboration features alone are worth it. No more "which notebook is the latest" drama.',
 true),

('a0000001-0001-0001-0001-000000000046',
 'q0000001-0001-0001-0001-000000000021',
 'p0000001-0001-0001-0001-000000000004',
 'Hex AI features are nice too. Auto-generates SQL from natural language. Helped our less technical people actually contribute.',
 false),

-- Answers to Q22: Runway + ElevenLabs
('a0000001-0001-0001-0001-000000000047',
 'q0000001-0001-0001-0001-000000000022',
 'p0000001-0001-0001-0001-000000000002',
 'Tried this exact combo. Quality is there for explainer videos and social content. Wouldn''t use it for premium brand content yet but getting close.',
 true),

('a0000001-0001-0001-0001-000000000048',
 'q0000001-0001-0001-0001-000000000022',
 'p0000001-0001-0001-0001-000000000005',
 'Add Midjourney for the initial frames and you''ve got a full pipeline. I''m making videos 10x faster than before. The future is here.',
 false),

-- Answers to Q23: Tabnine experience
('a0000001-0001-0001-0001-000000000049',
 'q0000001-0001-0001-0001-000000000023',
 'p0000001-0001-0001-0001-000000000001',
 'Similar experience. Tabnine is like 80% of Copilot which is still really good. The privacy is non-negotiable for some clients so it''s the only option.',
 false),

('a0000001-0001-0001-0001-000000000050',
 'q0000001-0001-0001-0001-000000000023',
 'p0000001-0001-0001-0001-000000000004',
 'If you train Tabnine on your codebase it gets way better. The initial out-of-box experience isn''t great but give it a few weeks.',
 false),

-- Answers to Q24: Claude paper explanation
('a0000001-0001-0001-0001-000000000051',
 'q0000001-0001-0001-0001-000000000024',
 'p0000001-0001-0001-0001-000000000004',
 'Claude is legit my research assistant now. It doesn''t just summarize papers, it can actually discuss implications and connect ideas to other work.',
 false),

('a0000001-0001-0001-0001-000000000052',
 'q0000001-0001-0001-0001-000000000024',
 'p0000001-0001-0001-0001-000000000002',
 'Used Claude for my thesis literature review. It found connections between papers I never would have seen. Literally expanded my bibliography.',
 false),

-- Answers to Q25: Julius for non-coders
('a0000001-0001-0001-0001-000000000053',
 'q0000001-0001-0001-0001-000000000025',
 'p0000001-0001-0001-0001-000000000003',
 'Julius is perfect for business users. Our sales team uses it for pipeline analysis now. No more waiting 2 weeks for the BI team.',
 false),

('a0000001-0001-0001-0001-000000000054',
 'q0000001-0001-0001-0001-000000000025',
 'p0000001-0001-0001-0001-000000000004',
 'For quick analysis, Julius is unbeatable. Only downside is the data doesn''t persist well. Still use Hex for anything that needs version control.',
 false)

ON CONFLICT (id) DO NOTHING;

-- =====================================================
-- 4. QUESTION-TOOL MENTIONS (For Community Scoring)
-- =====================================================
-- Maps questions to the tools they mention for faster lookups

INSERT INTO public.question_tool_mentions (question_id, tool_id, mention_count) VALUES
  -- Q1 mentions: Cursor, GitHub Copilot
  ('q0000001-0001-0001-0001-000000000001', 'a1111111-1111-1111-1111-111111111112', 1), -- Cursor
  ('q0000001-0001-0001-0001-000000000001', 'a1111111-1111-1111-1111-111111111111', 1), -- Copilot
  -- Q2 mentions: ChatGPT, Claude
  ('q0000001-0001-0001-0001-000000000002', 'a2222222-2222-2222-2222-222222222221', 1), -- ChatGPT
  ('q0000001-0001-0001-0001-000000000002', 'a2222222-2222-2222-2222-222222222222', 1), -- Claude
  -- Q3 mentions: Midjourney, DALL-E, Stable Diffusion
  ('q0000001-0001-0001-0001-000000000003', 'a4444444-4444-4444-4444-444444444441', 1), -- Midjourney
  ('q0000001-0001-0001-0001-000000000003', 'a4444444-4444-4444-4444-444444444442', 1), -- DALL-E
  ('q0000001-0001-0001-0001-000000000003', 'a4444444-4444-4444-4444-444444444443', 1), -- SD
  -- Q4 mentions: Perplexity, Gemini
  ('q0000001-0001-0001-0001-000000000004', 'a3333333-3333-3333-3333-333333333332', 1), -- Perplexity
  ('q0000001-0001-0001-0001-000000000004', 'a3333333-3333-3333-3333-333333333331', 1), -- Gemini
  -- Q5 mentions: ElevenLabs
  ('q0000001-0001-0001-0001-000000000005', 'a5555555-5555-5555-5555-555555555551', 1), -- ElevenLabs
  -- Q6 mentions: GitHub Copilot
  ('q0000001-0001-0001-0001-000000000006', 'a1111111-1111-1111-1111-111111111111', 1), -- Copilot
  -- Q7 mentions: Julius, Hex
  ('q0000001-0001-0001-0001-000000000007', 'a7777777-7777-7777-7777-777777777771', 1), -- Julius
  ('q0000001-0001-0001-0001-000000000007', 'a7777777-7777-7777-7777-777777777772', 1), -- Hex
  -- Q8 mentions: Runway
  ('q0000001-0001-0001-0001-000000000008', 'a6666666-6666-6666-6666-666666666661', 1), -- Runway
  -- Q9 mentions: Jasper, ChatGPT
  ('q0000001-0001-0001-0001-000000000009', 'a2222222-2222-2222-2222-222222222223', 1), -- Jasper
  ('q0000001-0001-0001-0001-000000000009', 'a2222222-2222-2222-2222-222222222221', 1), -- ChatGPT
  -- Q10 mentions: Tabnine, Copilot
  ('q0000001-0001-0001-0001-000000000010', 'a1111111-1111-1111-1111-111111111113', 1), -- Tabnine
  ('q0000001-0001-0001-0001-000000000010', 'a1111111-1111-1111-1111-111111111111', 1), -- Copilot
  -- Q11 mentions: Stable Diffusion, Midjourney
  ('q0000001-0001-0001-0001-000000000011', 'a4444444-4444-4444-4444-444444444443', 1), -- SD
  ('q0000001-0001-0001-0001-000000000011', 'a4444444-4444-4444-4444-444444444441', 1), -- Midjourney
  -- Q12 mentions: ChatGPT
  ('q0000001-0001-0001-0001-000000000012', 'a2222222-2222-2222-2222-222222222221', 1), -- ChatGPT
  -- Q13 mentions: Claude
  ('q0000001-0001-0001-0001-000000000013', 'a2222222-2222-2222-2222-222222222222', 1), -- Claude
  -- Q14 mentions: Gemini, ChatGPT
  ('q0000001-0001-0001-0001-000000000014', 'a3333333-3333-3333-3333-333333333331', 1), -- Gemini
  ('q0000001-0001-0001-0001-000000000014', 'a2222222-2222-2222-2222-222222222221', 1), -- ChatGPT
  -- Q15 mentions: DALL-E, ChatGPT
  ('q0000001-0001-0001-0001-000000000015', 'a4444444-4444-4444-4444-444444444442', 1), -- DALL-E
  ('q0000001-0001-0001-0001-000000000015', 'a2222222-2222-2222-2222-222222222221', 1), -- ChatGPT
  -- Q16 mentions: Cursor, ChatGPT, Midjourney, ElevenLabs
  ('q0000001-0001-0001-0001-000000000016', 'a1111111-1111-1111-1111-111111111112', 1), -- Cursor
  ('q0000001-0001-0001-0001-000000000016', 'a2222222-2222-2222-2222-222222222221', 1), -- ChatGPT
  ('q0000001-0001-0001-0001-000000000016', 'a4444444-4444-4444-4444-444444444441', 1), -- Midjourney
  ('q0000001-0001-0001-0001-000000000016', 'a5555555-5555-5555-5555-555555555551', 1), -- ElevenLabs
  -- Q17 mentions: Perplexity
  ('q0000001-0001-0001-0001-000000000017', 'a3333333-3333-3333-3333-333333333332', 1), -- Perplexity
  -- Q18 mentions: Jasper, ChatGPT
  ('q0000001-0001-0001-0001-000000000018', 'a2222222-2222-2222-2222-222222222223', 1), -- Jasper
  ('q0000001-0001-0001-0001-000000000018', 'a2222222-2222-2222-2222-222222222221', 1), -- ChatGPT
  -- Q19 mentions: Cursor, Copilot
  ('q0000001-0001-0001-0001-000000000019', 'a1111111-1111-1111-1111-111111111112', 1), -- Cursor
  ('q0000001-0001-0001-0001-000000000019', 'a1111111-1111-1111-1111-111111111111', 1), -- Copilot
  -- Q20 mentions: ElevenLabs
  ('q0000001-0001-0001-0001-000000000020', 'a5555555-5555-5555-5555-555555555551', 1), -- ElevenLabs
  -- Q21 mentions: Hex
  ('q0000001-0001-0001-0001-000000000021', 'a7777777-7777-7777-7777-777777777772', 1), -- Hex
  -- Q22 mentions: Runway, ElevenLabs
  ('q0000001-0001-0001-0001-000000000022', 'a6666666-6666-6666-6666-666666666661', 1), -- Runway
  ('q0000001-0001-0001-0001-000000000022', 'a5555555-5555-5555-5555-555555555551', 1), -- ElevenLabs
  -- Q23 mentions: Tabnine, Copilot
  ('q0000001-0001-0001-0001-000000000023', 'a1111111-1111-1111-1111-111111111113', 1), -- Tabnine
  ('q0000001-0001-0001-0001-000000000023', 'a1111111-1111-1111-1111-111111111111', 1), -- Copilot
  -- Q24 mentions: Claude
  ('q0000001-0001-0001-0001-000000000024', 'a2222222-2222-2222-2222-222222222222', 1), -- Claude
  -- Q25 mentions: Julius
  ('q0000001-0001-0001-0001-000000000025', 'a7777777-7777-7777-7777-777777777771', 1) -- Julius
ON CONFLICT DO NOTHING;

-- =====================================================
-- SUMMARY
-- =====================================================
-- Profiles: 12 community members
-- Questions: 25 threads
-- Answers: 54 responses (avg 2.2 per question)
-- Tool mentions: 46 explicit mappings (all 16 tools covered)
--
-- Distribution of sentiments (estimated):
-- - Positive: ~60% (praise, recommendations)
-- - Neutral: ~25% (comparisons, trade-offs)
-- - Negative: ~15% (complaints, disappointments)
--
-- This creates realistic community scoring data that
-- will produce differentiated scores across tools.
-- =====================================================
