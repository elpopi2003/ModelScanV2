import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import type { Tables, TablesInsert } from '@/integrations/supabase/types';

export type Kit = Tables<'kits'>;
export type UserKit = Tables<'user_kits'>;
export type UserKitWithKit = UserKit & { kits: Kit };

export function useUserKits() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['user-kits', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('user_kits')
        .select('*, kits(*)')
        .eq('user_id', user!.id)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data as UserKitWithKit[];
    },
    enabled: !!user,
  });
}

function cleanKitName(name: string): string {
  return name.replace(/\s*model\s+kit\s*/gi, ' ').replace(/\s{2,}/g, ' ').trim();
}

export function useAddKit() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: {
      kit: TablesInsert<'kits'>;
      status: string;
      condition?: string;
      notes?: string;
      price?: number;
      purchase_date?: string;
    }) => {
      const cleanedKit = { ...input.kit, name: cleanKitName(input.kit.name) };
      // First insert the kit into catalog
      const { data: kit, error: kitError } = await supabase
        .from('kits')
        .insert(cleanedKit)
        .select()
        .single();
      if (kitError) throw kitError;

      // Then add to user's stash
      const { data: userKit, error: ukError } = await supabase
        .from('user_kits')
        .insert({
          user_id: user!.id,
          kit_id: kit.id,
          status: input.status,
          condition: input.condition,
          notes: input.notes,
          price: input.price,
          purchase_date: input.purchase_date,
        })
        .select('*, kits(*)')
        .single();
      if (ukError) throw ukError;

      return userKit;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-kits'] });
    },
  });
}

export function useUpdateUserKit() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...updates }: { id: string } & Partial<TablesInsert<'user_kits'>>) => {
      const { data, error } = await supabase
        .from('user_kits')
        .update(updates)
        .eq('id', id)
        .select('*, kits(*)')
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-kits'] });
    },
  });
}

export function useDeleteUserKit() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('user_kits').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-kits'] });
    },
  });
}

export function useSearchKits(query: string) {
  return useQuery({
    queryKey: ['search-kits', query],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('kits')
        .select('*')
        .or(`name.ilike.%${query}%,brand.ilike.%${query}%,reference.ilike.%${query}%`)
        .limit(20);
      if (error) throw error;
      return data;
    },
    enabled: query.length > 1,
  });
}
