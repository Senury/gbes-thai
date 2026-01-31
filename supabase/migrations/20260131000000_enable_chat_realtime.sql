-- Enable realtime for chat tables
-- This allows clients to subscribe to changes via Supabase's realtime feature

-- Add tables to the realtime publication
alter publication supabase_realtime add table public.messages;
alter publication supabase_realtime add table public.conversation_members;

-- Enable replica identity full for better change tracking
alter table public.messages replica identity full;
alter table public.conversation_members replica identity full;
