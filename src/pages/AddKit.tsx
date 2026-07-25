import { ArrowLeft } from 'lucide-react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useAddKit } from '@/hooks/useKits';
import { useToast } from '@/hooks/use-toast';
import { useState } from 'react';



export default function AddKit() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const addKit = useAddKit();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  // Prefill desde el escaneo (botón "Editar y añadir")
  const dName = searchParams.get('name') ?? '';
  const dBrand = searchParams.get('brand') ?? '';
  const dScale = searchParams.get('scale') ?? '';
  const dReference = searchParams.get('reference') ?? '';
  const dStatus = searchParams.get('status') ?? 'stash';

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    const fd = new FormData(e.currentTarget);

    try {
      await addKit.mutateAsync({
        kit: {
          name: fd.get('name') as string,
          brand: fd.get('brand') as string,
          scale: fd.get('scale') as string,
          category: 'Other',
          reference: (fd.get('reference') as string) || undefined,
        },
        status: (fd.get('status') as string) || 'stash',
        notes: (fd.get('notes') as string) || undefined,
        price: fd.get('price') ? parseFloat(fd.get('price') as string) : undefined,
      });
      toast({ title: 'Maqueta añadida' });
      navigate('/stash');
    } catch (error: any) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen pb-24 safe-top">
      <header className="sticky top-0 z-40 flex items-center gap-3 border-b border-border bg-background/80 backdrop-blur-xl px-4 pt-6 pb-4">
        <button onClick={() => navigate(-1)} className="rounded-full p-1">
          <ArrowLeft className="h-5 w-5" />
        </button>
        <h1 className="text-lg font-bold">Añadir Maqueta</h1>
      </header>

      <form className="space-y-4 px-4 pt-4" onSubmit={handleSubmit}>
        <div className="space-y-1.5">
          <Label htmlFor="name">Nombre *</Label>
          <Input id="name" name="name" placeholder="Ej: Spitfire Mk.IX" required defaultValue={dName} />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <Label htmlFor="brand">Marca *</Label>
            <Input id="brand" name="brand" placeholder="Ej: Tamiya" required defaultValue={dBrand} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="scale">Escala *</Label>
            <Input id="scale" name="scale" placeholder="Ej: 1/48" required defaultValue={dScale} />
          </div>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="reference">Referencia</Label>
          <Input id="reference" name="reference" placeholder="Ej: 61033" defaultValue={dReference} />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <Label htmlFor="price">Precio (€)</Label>
            <Input id="price" name="price" type="number" step="0.01" placeholder="0.00" />
          </div>
          <div className="space-y-1.5">
            <Label>Estado</Label>
            <Select name="status" defaultValue={dStatus}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="stash">Por montar</SelectItem>
                <SelectItem value="in-progress">En construcción</SelectItem>
                <SelectItem value="completed">Terminadas</SelectItem>
                <SelectItem value="wishlist">Deseados</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="notes">Notas</Label>
          <Textarea id="notes" name="notes" placeholder="Notas sobre esta maqueta..." rows={3} />
        </div>

        <Button type="submit" className="w-full rounded-full" size="lg" disabled={loading}>
          {loading ? 'Guardando...' : 'Guardar Maqueta'}
        </Button>
      </form>
    </div>
  );
}
