import { supabase } from '@/integrations/supabase/client';

export interface ScalematesKit {
  name: string;
  brand: string;
  scale: string;
  category: string;
  reference: string;
  barcode?: string;
  image_url?: string;
  scalemates_url?: string;
  year?: number;
}

export async function searchScalemates(params: { query?: string; barcode?: string }): Promise<ScalematesKit[]> {
  const { data, error } = await supabase.functions.invoke('scalemates-search', {
    body: params,
  });

  if (error) {
    console.error('Scalemates search error:', error);
    throw new Error('Error buscando en Scalemates');
  }

  if (!data?.success) {
    throw new Error(data?.error || 'Error desconocido');
  }

  return data.data || [];
}
