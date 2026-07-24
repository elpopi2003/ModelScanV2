import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, ExternalLink, Pencil, Trash2, Check, X } from 'lucide-react';
import { useUserKits, useDeleteUserKit, useUpdateUserKit } from '@/hooks/useKits';
import { Badge } from '@/components/ui/badge';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';

const statusLabels: Record<string, string> = {
  stash: 'En Stash',
  'in-progress': 'En Progreso',
  completed: 'Completado',
  wishlist: 'Wishlist',
};

const statusColors: Record<string, string> = {
  stash: 'bg-primary/20 text-primary',
  'in-progress': 'bg-accent/20 text-accent',
  completed: 'bg-[hsl(var(--kit-completed))]/20 text-[hsl(var(--kit-completed))]',
  wishlist: 'bg-[hsl(var(--kit-wishlist))]/20 text-[hsl(var(--kit-wishlist))]',
};

export default function KitDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { data: userKits = [] } = useUserKits();
  const deleteKit = useDeleteUserKit();
  const updateKit = useUpdateUserKit();

  const userKit = userKits.find((uk) => uk.id === id);
  const [editing, setEditing] = useState(false);

  // Edit form state
  const [status, setStatus] = useState('');
  const [notes, setNotes] = useState('');
  const [price, setPrice] = useState('');
  const [purchaseDate, setPurchaseDate] = useState('');

  const startEditing = () => {
    if (!userKit) return;
    setStatus(userKit.status);
    setNotes(userKit.notes ?? '');
    setPrice(userKit.price != null ? String(userKit.price) : '');
    setPurchaseDate(userKit.purchase_date ?? '');
    setEditing(true);
  };

  const cancelEditing = () => setEditing(false);

  const saveChanges = async () => {
    if (!userKit) return;
    try {
      await updateKit.mutateAsync({
        id: userKit.id,
        status,
        notes: notes || null,
        price: price ? parseFloat(price) : null,
        purchase_date: purchaseDate || null,
      });
      toast({ title: 'Maqueta actualizada' });
      setEditing(false);
    } catch {
      toast({ title: 'Error al guardar', variant: 'destructive' });
    }
  };

  if (!userKit) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-muted-foreground">Maqueta no encontrada</p>
      </div>
    );
  }

  const kit = userKit.kits;

  const handleDelete = async () => {
    try {
      await deleteKit.mutateAsync(userKit.id);
      toast({ title: 'Maqueta eliminada' });
      navigate('/stash');
    } catch {
      toast({ title: 'Error al eliminar', variant: 'destructive' });
    }
  };

  return (
    <div className="min-h-screen pb-24 safe-top">
      <div className="relative">
        {kit.image_url ? (
         <motion.img
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            src={kit.image_url}
            alt={kit.name}
            loading="lazy"
            className="h-64 w-full object-cover"
          />
        ) : (
          <div className="flex h-64 items-center justify-center bg-muted">
            <span className="text-6xl">📦</span>
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-background/30" />
        <button
          onClick={() => navigate(-1)}
          className="absolute top-4 left-4 rounded-full bg-background/60 p-2 backdrop-blur-sm"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <div className="absolute top-4 right-4 flex gap-2">
          {editing ? (
            <>
              <Button
                size="icon"
                variant="ghost"
                onClick={saveChanges}
                disabled={updateKit.isPending}
                className="rounded-full bg-background/60 backdrop-blur-sm text-primary"
              >
                <Check className="h-4 w-4" />
              </Button>
              <Button
                size="icon"
                variant="ghost"
                onClick={cancelEditing}
                className="rounded-full bg-background/60 backdrop-blur-sm text-muted-foreground"
              >
                <X className="h-4 w-4" />
              </Button>
            </>
          ) : (
            <>
              <Button
                size="icon"
                variant="ghost"
                onClick={startEditing}
                className="rounded-full bg-background/60 backdrop-blur-sm"
              >
                <Pencil className="h-4 w-4" />
              </Button>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button
                    size="icon"
                    variant="ghost"
                    className="rounded-full bg-destructive backdrop-blur-sm text-destructive-foreground hover:bg-destructive/90"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>¿Eliminar maqueta?</AlertDialogTitle>
                    <AlertDialogDescription>
                      Esta acción no se puede deshacer. Se eliminará «{kit.name}» de tu stash.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancelar</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={handleDelete}
                      className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                    >
                      Eliminar
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </>
          )}
        </div>
      </div>

      <div className="relative -mt-8 rounded-t-3xl bg-background px-4 pt-6">
        <div className="flex items-start justify-between gap-2">
          <div>
            <p className="text-sm font-medium text-primary">{kit.brand}</p>
            <h1 className="text-xl font-bold">{kit.name}</h1>
          </div>
          {editing ? (
            <Select value={status} onValueChange={setStatus}>
              <SelectTrigger className="w-36 h-8 text-xs rounded-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(statusLabels).map(([value, label]) => (
                  <SelectItem key={value} value={value}>{label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          ) : (
            <Badge className={cn('shrink-0 border-0', statusColors[userKit.status] ?? '')}>
              {statusLabels[userKit.status] ?? userKit.status}
            </Badge>
          )}
        </div>

        <div className="mt-5 grid grid-cols-2 gap-3">
          {[
            { label: 'Escala', value: kit.scale },
            { label: 'Referencia', value: kit.reference ?? '—' },
            { label: 'Año', value: kit.year?.toString() ?? '—' },
          ].map((item) => (
            <div key={item.label} className="rounded-lg bg-secondary/50 p-3">
              <p className="text-[10px] uppercase tracking-wider text-muted-foreground">{item.label}</p>
              <p className="mt-0.5 text-sm font-semibold font-mono">{item.value}</p>
            </div>
          ))}

          {/* Editable fields: Price & Purchase date */}
          <div className="rounded-lg bg-secondary/50 p-3">
            <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Precio</p>
            {editing ? (
              <Input
                type="number"
                step="0.01"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                placeholder="0.00"
                className="mt-1 h-7 text-sm px-2"
              />
            ) : (
              <p className="mt-0.5 text-sm font-semibold font-mono">
                {userKit.price ? `${Number(userKit.price).toFixed(2)} €` : '—'}
              </p>
            )}
          </div>
          <div className="rounded-lg bg-secondary/50 p-3">
            <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Compra</p>
            {editing ? (
              <Input
                type="date"
                value={purchaseDate}
                onChange={(e) => setPurchaseDate(e.target.value)}
                className="mt-1 h-7 text-sm px-2"
              />
            ) : (
              <p className="mt-0.5 text-sm font-semibold font-mono">{userKit.purchase_date ?? '—'}</p>
            )}
          </div>
        </div>

        {/* Notes section */}
        <div className="mt-5">
          <h2 className="text-sm font-semibold mb-1">Notas</h2>
          {editing ? (
            <Textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Añade notas sobre esta maqueta..."
              className="text-sm"
              rows={3}
            />
          ) : (
            userKit.notes ? (
              <p className="text-sm text-muted-foreground">{userKit.notes}</p>
            ) : (
              <p className="text-sm text-muted-foreground/50 italic">Sin notas</p>
            )
          )}
        </div>

        {kit.scalemates_url && (
          <a
            href={kit.scalemates_url}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-5 flex items-center gap-2 rounded-lg border border-border p-3 text-sm text-primary hover:bg-secondary/50 transition-colors"
          >
            <ExternalLink className="h-4 w-4" />
            Ver en Scalemates
          </a>
        )}
      </div>
    </div>
  );
}
