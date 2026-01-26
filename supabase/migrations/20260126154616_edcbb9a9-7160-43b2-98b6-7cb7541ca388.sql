-- Fix overly permissive RLS policy on question_tool_mentions
DROP POLICY IF EXISTS "Authenticated users can create mentions" ON public.question_tool_mentions;

-- Only allow creating mentions for questions the user owns
CREATE POLICY "Users can create mentions for own questions" 
ON public.question_tool_mentions 
FOR INSERT 
TO authenticated 
WITH CHECK (
    EXISTS (
        SELECT 1 FROM public.questions 
        WHERE id = question_id 
        AND user_id = auth.uid()
    )
);