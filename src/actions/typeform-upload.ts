import type { Event } from '@/types/events';
import { createClient } from '@/utils/supabase/elevatedClient';
import { eventsInsertSchema, type typeformInsertType } from '../../schema.zod';

export async function createEvent(
  eventData: Event & {
    is_gated?: boolean;
    always_approve?: boolean;
    more_info_text?: string | null;
  }
) {
  const supabase = createClient();
  const parseResult = eventsInsertSchema.safeParse(eventData);
  if (!parseResult.success) {
    throw new Error('Invalid event data');
  }
  const { data, error } = await supabase
    .from('events')
    .insert({
      title: parseResult.data.title,
      description: parseResult.data.description,
      start_date: parseResult.data.start_date,
      end_date: parseResult.data.end_date,
      publish_date: parseResult.data.publish_date,
      venue: parseResult.data.venue,
      banner_image: parseResult.data.banner_image,
      tags: parseResult.data.tags,
      event_type: parseResult.data.event_type,
      is_featured: parseResult.data.is_featured,
      is_gated: parseResult.data.is_gated ?? false,
      always_approve: parseResult.data.always_approve ?? false,
      more_info: parseResult.data.more_info,
      more_info_text: parseResult.data.more_info_text,
      external_registration_link: parseResult.data.external_registration_link,
      rules: parseResult.data.rules,
      slug: parseResult.data.slug,
      typeform_config: parseResult.data.typeform_config,
    })
    .single();
  if (error) {
    throw new Error(error.message);
  }
  return data;
}

export async function updateEvent(
  eventId: string,
  eventData: Partial<Event> & {
    is_gated?: boolean;
    always_approve?: boolean;
    more_info_text?: string | null;
    external_registration_link?: string | null;
  }
) {
  const supabase = createClient();

  // Build the update payload, only including fields that were actually provided
  const updatePayload: Record<string, unknown> = {};

  if (eventData.title) updatePayload.title = eventData.title;
  if (eventData.description) updatePayload.description = eventData.description;
  if (eventData.start_date) updatePayload.start_date = eventData.start_date;
  if (eventData.end_date) updatePayload.end_date = eventData.end_date;
  if (eventData.publish_date)
    updatePayload.publish_date = eventData.publish_date;
  if (eventData.venue) updatePayload.venue = eventData.venue;
  if (eventData.banner_image)
    updatePayload.banner_image = eventData.banner_image;
  if (eventData.tags) updatePayload.tags = eventData.tags;
  if (eventData.event_type) updatePayload.event_type = eventData.event_type;
  if (eventData.is_featured !== undefined)
    updatePayload.is_featured = eventData.is_featured;
  if (eventData.is_gated !== undefined)
    updatePayload.is_gated = eventData.is_gated;
  if (eventData.always_approve !== undefined)
    updatePayload.always_approve = eventData.always_approve;
  if (eventData.more_info) updatePayload.more_info = eventData.more_info;
  if (eventData.more_info_text !== undefined)
    updatePayload.more_info_text = eventData.more_info_text;
  if (eventData.external_registration_link !== undefined)
    updatePayload.external_registration_link =
      eventData.external_registration_link;
  if (eventData.rules) updatePayload.rules = eventData.rules;
  if (eventData.slug) updatePayload.slug = eventData.slug;
  if (eventData.typeform_config)
    updatePayload.typeform_config = eventData.typeform_config;

  // Validate that at least one field is being updated
  if (Object.keys(updatePayload).length === 0) {
    throw new Error('No valid fields provided to update');
  }

  const { data, error } = await supabase
    .from('events')
    .update(updatePayload)
    .eq('id', eventId)
    .select()
    .single();

  if (error) {
    throw new Error(error.message);
  }
  return data;
}

export async function sendEventRegistration(eventData: typeformInsertType) {
  const supabase = createClient();

  // Single write-first attempt. Only read if we hit a unique violation.
  const { data, error } = await supabase
    .from('eventsregistrations')
    .insert({
      application_id: eventData.application_id,
      attendance: eventData.attendance,
      created_at: eventData.created_at,
      details: eventData.details,
      event_id: eventData.event_id,
      event_title: eventData.event_title,
      id: eventData.id,
      is_approved: eventData.is_approved,
      is_team_entry: eventData.is_team_entry,
      registration_email: eventData.registration_email,
      ticket_id: eventData.ticket_id,
    })
    .select()
    .single();

  if (data) return data;

  // Unique violation (duplicate) → fetch existing once.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  if ((error as any)?.code === '23505') {
    const query = eventData.application_id
      ? supabase
          .from('eventsregistrations')
          .select('*')
          .eq('event_id', eventData.event_id!)
          .eq('application_id', eventData.application_id)
          .maybeSingle()
      : supabase
          .from('eventsregistrations')
          .select('*')
          .eq('event_id', eventData.event_id!)
          .eq('registration_email', eventData.registration_email!)
          .maybeSingle();

    const { data: existing, error: fetchErr } = await query;
    if (existing) return existing;
    throw new Error(
      fetchErr?.message ?? 'Duplicate detected but existing row not found'
    );
  }

  throw new Error(error?.message ?? 'Registration failed');
}
