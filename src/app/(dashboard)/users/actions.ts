// src/app/(dashboard)/users/actions.ts
'use client';

import { createClient } from '@/lib/supabase/client';
import { revalidatePath } from 'next/cache';
import { Database } from '@/types/database';

export async function updateUser(
  id: string,
  data: { full_name?: string | null; avatar_url?: string | null }
) {
  const supabase = createClient();
  const { error } = await supabase.from('profiles').update(data).eq('id', id);
  if (error) return { error: error.message };
  revalidatePath('/users');
  return { success: true };
}
