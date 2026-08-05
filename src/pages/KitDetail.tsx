import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, ExternalLink, Pencil, Trash2, Check, X, Package } from 'lucide-react';
import { useUserKits, useDeleteUserKit, useUpdateUserKit } from '@/hooks/useKits';
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
import { cleanKitImage } from '@/lib/kitImage';
import { KIT_STATUS_LABELS, KIT_STATUS_ICONS, KIT_STATUS_SOLID } from '@/lib/kitStatus';
import { useToast } from '@/hooks/use-toast';

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
  const imgSrc = cleanKitImage(kit.image_url);
  const StatusIcon = KIT_STATUS_ICONS[userKit.status] ?? Package;

  const handleDelete = async () => {
    try {
      await deleteKit.mutateAsync(userKit.id);
      toast({ title: 'Maqueta eliminada' });
      navigate('/stash');
    } catch {
      toast({ title: 'Error al eliminar', variant: 'destructive' });
    }
  };

  const btnBase =
    'flex h-10 w-10 items-center justify-center rounded-md border border-border bg-background/80 backdrop-blur-sm text-primary';

  return (
    <div className="min-h-screen pb-24 safe-top">
      {/* Hero: carátula limpia (sin watermark, recorte mínimo superior) */}
      <div className="relative overflow-hidden">
        {imgSrc ? (
          <div className="-mt-[5%]">
            <motion.img
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              src={imgSrc}
              alt={kit.name}
              loading="lazy"
              className="block h-auto w-full"
            />
          </div>
        ) : (
          <div className="mm-grid flex h-56 items-center justify-center text-muted-foreground/30">
            <span className="text-6xl">📦</span>
          </div>
        )}
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-background to-transparent" />

        <button onClick={() => navigate(-1)} className={cn(btnBase, 'absolute left-4 top-4')}>
          <ArrowLeft className="h-5 w-5" />
        </button>

        <div className="absolute right-4 top-4 flex gap-2">
          {editing ? (
            <>
              <button onClick={saveChanges} disabled={updateKit.isPending} className={btnBase}>
                <Check className="h-5 w-5" />
              </button>
              <button onClick={cancelEditing} className={cn(btnBase, 'text-muted-foreground')}>
                <X className="h-5 w-5" />
              </button>
            </>
          ) : (
            <>
              <button onClick={startEditing} className={btnBase}>
                <Pencil className="h-4 w-4" />
              </button>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <button className="flex h-10 w-10 items-center justify-center rounded-md bg-destructive text-destructive-foreground">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>¿Eliminar maqueta?</AlertDialogTitle>
                    <AlertDialogDescription>
                      Esta acción no se puede deshacer. Se eliminará «{kit.name}» de tu colección.
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

      {/* Ficha */}
      <div className="relative -mt-6 rounded-t-2xl bg-background px-4 pt-6">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="font-mono text-[11px] font-medium uppercase tracking-wider text-accent">{kit.brand}</p>
            <h1 className="mt-1 text-xl leading-tight text-primary">{kit.name}</h1>
          </div>
          {editing ? (
            <Select value={status} onValueChange={setStatus}>
              <SelectTrigger className="h-8 w-40 shrink-0 rounded-md text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(KIT_STATUS_LABELS).map(([value, label]) => (
                  <SelectItem key={value} value={value}>{label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          ) : (
            <div className="flex shrink-0 flex-col items-center gap-1.5">
              <div
                className={cn(
                  'flex h-11 w-11 items-center justify-center rounded-full text-white shadow-md ring-2 ring-white/70',
                  KIT_STATUS_SOLID[userKit.status] ?? 'bg-primary',
                )}
              >
                <StatusIcon className="h-5 w-5" strokeWidth={2.5} />
              </div>
              <span className="font-mono text-[9px] uppercase tracking-wider text-muted-foreground">
                {KIT_STATUS_LABELS[userKit.status] ?? userKit.status}
              </span>
            </div>
          )}
        </div>

        {/* Specs (tarjetas blueprint) */}
        <div className="mt-5 grid grid-cols-2 gap-3">
          {[
            { label: 'Escala', value: kit.scale },
            { label: 'Referencia', value: kit.reference ?? '—' },
            { label: 'Año', value: kit.year?.toString() ?? '—' },
          ].map((item) => (
            <div key={item.label} className="rounded-md border border-border bg-muted/40 p-3">
              <p className="font-mono text-[9px] uppercase tracking-wider text-muted-foreground">{item.label}</p>
              <p className="mt-0.5 font-mono text-sm font-medium text-foreground">{item.value}</p>
            </div>
          ))}

          <div className="rounded-md border border-border bg-muted/40 p-3">
            <p className="font-mono text-[9px] uppercase tracking-wider text-muted-foreground">Precio</p>
            {editing ? (
              <Input
                type="number"
                step="0.01"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                placeholder="0.00"
                className="mt-1 h-7 px-2 text-sm"
              />
            ) : (
              <p className="mt-0.5 font-mono text-sm font-medium text-foreground">
                {userKit.price ? `${Number(userKit.price).toFixed(2)} €` : '—'}
              </p>
            )}
          </div>
          <div className="rounded-md border border-border bg-muted/40 p-3">
            <p className="font-mono text-[9px] uppercase tracking-wider text-muted-foreground">Compra</p>
            {editing ? (
              <Input
                type="date"
                value={purchaseDate}
                onChange={(e) => setPurchaseDate(e.target.value)}
                className="mt-1 h-7 px-2 text-sm"
              />
            ) : (
              <p className="mt-0.5 font-mono text-sm font-medium text-foreground">{userKit.purchase_date ?? '—'}</p>
            )}
          </div>
        </div>

        {/* Notas */}
        <div className="mt-5">
          <h2 className="mb-1.5 font-mono text-[11px] uppercase tracking-wider text-muted-foreground">Notas</h2>
          {editing ? (
            <Textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Añade notas sobre esta maqueta..."
              className="text-sm"
              rows={3}
            />
          ) : userKit.notes ? (
            <p className="text-sm text-foreground">{userKit.notes}</p>
          ) : (
            <p className="text-sm italic text-muted-foreground/60">Sin notas</p>
          )}
        </div>

        {kit.scalemates_url && (
          <a
            href={kit.scalemates_url}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-5 flex items-center gap-2 rounded-md border border-border bg-card p-3 text-sm font-medium text-primary transition-colors hover:bg-secondary/50"
          >
            <ExternalLink className="h-4 w-4" />
            Ver en Scalemates
          </a>
        )}
      </div>
    </div>
  );
}
