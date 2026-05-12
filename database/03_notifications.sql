-- ==============================================================================
-- SYNAPSE: NOTIFICATION SYSTEM
-- Phase 3: Real-time Notifications & Activity Feed
-- ==============================================================================

-- ==========================================
-- 1. NOTIFICATIONS TABLE
-- ==========================================

CREATE TYPE public.notification_type AS ENUM (
    'task_assigned',
    'task_updated',
    'task_completed',
    'project_created',
    'member_invited',
    'member_joined',
    'mention',
    'comment',
    'system'
);

CREATE TABLE public.notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    recipient_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    actor_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
    type notification_type NOT NULL,
    title TEXT NOT NULL,
    body TEXT,
    resource_type TEXT,
    resource_id UUID,
    is_read BOOLEAN DEFAULT false,
    read_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_notifications_recipient ON public.notifications(recipient_id, is_read, created_at DESC);
CREATE INDEX idx_notifications_org ON public.notifications(organization_id);

-- RLS
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view own notifications" ON public.notifications
    FOR SELECT USING (auth.uid() = recipient_id);

CREATE POLICY "Users update own notifications" ON public.notifications
    FOR UPDATE USING (auth.uid() = recipient_id);

-- ==========================================
-- 2. MARK NOTIFICATION AS READ FUNCTION
-- ==========================================

CREATE OR REPLACE FUNCTION public.mark_notification_read(notification_id UUID)
RETURNS VOID AS $$
BEGIN
    UPDATE public.notifications
    SET is_read = true, read_at = NOW()
    WHERE id = notification_id AND recipient_id = auth.uid();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ==========================================
-- 3. MARK ALL NOTIFICATIONS AS READ
-- ==========================================

CREATE OR REPLACE FUNCTION public.mark_all_notifications_read()
RETURNS VOID AS $$
BEGIN
    UPDATE public.notifications
    SET is_read = true, read_at = NOW()
    WHERE recipient_id = auth.uid() AND is_read = false;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ==========================================
-- 4. ENABLE REALTIME FOR NOTIFICATIONS
-- ==========================================
-- Supabase Realtime listens on this table for INSERT events

ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;
