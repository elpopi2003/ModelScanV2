import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ScanBarcode, Camera, X, Check, Plus, Search, Loader2, ExternalLink, Sparkles, ImagePlus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { BarcodeScannerModal } from '@/components/BarcodeScannerModal';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { searchScalemates, type ScalematesKit } from '@/lib/scalemates';
import { useAddKit } from '@/hooks/useKits';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';

interface IdentifiedKit {
  name: string;
  brand: string;
  scale: string;
  category: string;
  reference?: string;
  year?: number;
  confidence: number;
}

const SHELF_OPTIONS = [
  { key: 'stash', label: 'Por montar' },
  { key: 'in-progress', label: 'En construcción' },
  { key: 'completed', label: 'Terminadas' },
  { key: 'wishlist', label: 'Deseados' },
];

const CATEGORY_ES: Record<string, string> = {
  Aircraft: 'Aviación',
  Armor: 'Blindados',
  Ships: 'Barcos',
  Cars: 'Coches',
  Space: 'Espacio',
  Figures: 'Figuras',
  Other: 'Otros',
};

function ShelfPicker({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return (
    <div className="flex flex-wrap gap-1.5">
      {SHELF_OPTIONS.map((s) => (
        <button
          key={s.key}
          type="button"
          onClick={() => onChange(s.key)}
          className={cn(
            'rounded-full border px-2.5 py-1 text-[11px] font-medium transition-colors',
            value === s.key
              ? 'border-primary bg-primary text-primary-foreground'
              : 'border-border text-muted-foreground',
          )}
        >
          {s.label}
        </button>
      ))}
    </div>
  );
}

export default function Scan() {
  const [mode, setMode] = useState<'barcode' | 'camera'>('barcode');
  const [showScanner, setShowScanner] = useState(false);
  const [selectedShelf, setSelectedShelf] = useState('stash');
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [manualBarcode, setManualBarcode] = useState('');
  const [searching, setSearching] = useState(false);
  const [smResults, setSmResults] = useState<ScalematesKit[]>([]);
  const [addingId, setAddingId] = useState<number | null>(null);
  const [identifying, setIdentifying] = useState(false);
  const [identifiedKit, setIdentifiedKit] = useState<IdentifiedKit | null>(null);
  const [addingIdentified, setAddingIdentified] = useState(false);
  const [enriching, setEnriching] = useState(false);
  const [enrichedData, setEnrichedData] = useState<ScalematesKit | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const galleryInputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();
  const { toast } = useToast();
  const addKit = useAddKit();
  const { user } = useAuth();

  const handleSearchScalemates = async (code: string) => {
    setSearching(true);
    setSmResults([]);
    try {
      const results = await searchScalemates({ barcode: code });
      setSmResults(results);
      if (results.length === 0) {
        toast({ title: 'Sin resultados', description: 'No se encontró en Scalemates. Puedes añadirlo manualmente.' });
      }
    } catch (err: any) {
      toast({ title: 'Error buscando', description: err.message, variant: 'destructive' });
    } finally {
      setSearching(false);
    }
  };

  const handleManualSearch = () => {
    if (manualBarcode.trim()) {
      handleSearchScalemates(manualBarcode.trim());
    }
  };

  const handleAddToStash = async (kit: ScalematesKit, index: number) => {
    setAddingId(index);
    try {
      await addKit.mutateAsync({
        kit: {
          name: kit.name,
          brand: kit.brand,
          scale: kit.scale,
          category: kit.category,
          reference: kit.reference || undefined,
          barcode: kit.barcode || undefined,
          scalemates_url: kit.scalemates_url || undefined,
          image_url: kit.image_url || undefined,
          year: kit.year || undefined,
        },
        status: selectedShelf,
      });
      toast({ title: '¡Añadido!', description: `${kit.name} añadido a tu colección` });
    } catch (err: any) {
      toast({ title: 'Error', description: err.message, variant: 'destructive' });
    } finally {
      setAddingId(null);
    }
  };

  const enrichWithScalemates = async (kit: IdentifiedKit) => {
    setEnriching(true);
    setEnrichedData(null);
    try {
      const query = `${kit.brand} ${kit.name} ${kit.scale}`;
      const results = await searchScalemates({ query });
      if (results.length > 0) {
        setEnrichedData(results[0]);
      }
    } catch {
      // Silently fail enrichment
    } finally {
      setEnriching(false);
    }
  };

  const handleIdentifyFromImage = async (imageDataUrl: string) => {
    setIdentifying(true);
    setIdentifiedKit(null);
    setEnrichedData(null);
    try {
      const { data, error } = await supabase.functions.invoke('identify-kit', {
        body: { image: imageDataUrl },
      });
      if (error) throw new Error(error.message);
      if (!data?.success) throw new Error(data?.error || 'No se pudo identificar');
      const kit = data.data as IdentifiedKit;
      setIdentifiedKit(kit);
      toast({
        title: '¡Kit identificado!',
        description: `${kit.brand} ${kit.name} (${Math.round(kit.confidence * 100)}% confianza)`,
      });
      enrichWithScalemates(kit);
    } catch (err: any) {
      toast({ title: 'Error identificando', description: err.message, variant: 'destructive' });
    } finally {
      setIdentifying(false);
    }
  };

  const uploadBoxPhoto = async (dataUrl: string): Promise<string | null> => {
    if (!user) return null;
    try {
      const match = dataUrl.match(/^data:(image\/[a-zA-Z+]+);base64,(.+)$/);
      if (!match) return null;
      const ext = match[1].split('/')[1].replace('+xml', '');
      const binary = Uint8Array.from(atob(match[2]), c => c.charCodeAt(0));
      const path = `${user.id}/box-${Date.now()}.${ext}`;
      const { error } = await supabase.storage.from('kit-photos').upload(path, binary, { contentType: match[1] });
      if (error) throw error;
      const { data: urlData } = supabase.storage.from('kit-photos').getPublicUrl(path);
      return urlData.publicUrl;
    } catch (err) {
      console.error('Error uploading box photo:', err);
      return null;
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result as string;
      setPhotoPreview(dataUrl);
      handleIdentifyFromImage(dataUrl);
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const handleAddIdentifiedToStash = async () => {
    if (!identifiedKit) return;
    setAddingIdentified(true);
    try {
      let imageUrl = enrichedData?.image_url || undefined;
      if (photoPreview) {
        const uploadedUrl = await uploadBoxPhoto(photoPreview);
        if (uploadedUrl) imageUrl = uploadedUrl;
      }

      await addKit.mutateAsync({
        kit: {
          name: enrichedData?.name || identifiedKit.name,
          brand: enrichedData?.brand || identifiedKit.brand,
          scale: enrichedData?.scale || identifiedKit.scale,
          category: enrichedData?.category || identifiedKit.category,
          reference: enrichedData?.reference || identifiedKit.reference || undefined,
          scalemates_url: enrichedData?.scalemates_url || undefined,
          image_url: imageUrl,
          year: enrichedData?.year || identifiedKit.year || undefined,
          barcode: enrichedData?.barcode || undefined,
        },
        status: selectedShelf,
      });
      toast({ title: '¡Añadido!', description: `${identifiedKit.name} añadido a tu colección` });
    } catch (err: any) {
      toast({ title: 'Error', description: err.message, variant: 'destructive' });
    } finally {
      setAddingIdentified(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col pb-24 safe-top">
      {showScanner && (
        <BarcodeScannerModal
          onScanned={(code) => { setShowScanner(false); setManualBarcode(code); handleSearchScalemates(code); }}
          onClose={() => setShowScanner(false)}
          onManual={() => setShowScanner(false)}
        />
      )}
      <header className="px-4 pt-6 pb-4">
        <h1 className="text-xl font-bold text-center">Escanear</h1>
      </header>

      {/* Mode Toggle */}
      <div className="flex justify-center gap-2 mb-4 px-4">
        <Button
          variant={mode === 'barcode' ? 'default' : 'secondary'}
          size="sm"
          onClick={() => setMode('barcode')}
          className="rounded-full"
        >
          <ScanBarcode className="mr-1.5 h-4 w-4" />
          Código de barras
        </Button>
        <Button
          variant={mode === 'camera' ? 'default' : 'secondary'}
          size="sm"
          onClick={() => setMode('camera')}
          className="rounded-full"
        >
          <Camera className="mr-1.5 h-4 w-4" />
          Foto de caja
        </Button>
      </div>

      {/* Barcode Mode */}
      {mode === 'barcode' && (
        <div className="flex flex-col items-center px-4">
          <button
            onClick={() => setShowScanner(true)}
            className="w-full max-w-sm rounded-2xl border-2 border-dashed border-primary/40 bg-primary/5 flex flex-col items-center justify-center py-12 gap-3 transition active:scale-[0.99]"
          >
            <ScanBarcode className="h-12 w-12 text-primary" />
            <p className="text-sm font-semibold">Escanear código en vivo</p>
            <p className="text-xs text-muted-foreground text-center px-4">
              Apunta la cámara al código de barras de la caja
            </p>
          </button>

          {/* Manual entry */}
          <div className="mt-6 w-full max-w-sm">
            <div className="flex gap-2">
              <Input
                value={manualBarcode}
                onChange={(e) => setManualBarcode(e.target.value)}
                placeholder="Código de barras..."
                className="rounded-full font-mono"
                onKeyDown={(e) => e.key === 'Enter' && handleManualSearch()}
              />
              <Button
                size="icon"
                className="rounded-full shrink-0"
                onClick={handleManualSearch}
                disabled={searching}
              >
                {searching ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
              </Button>
            </div>
          </div>

          {/* Scalemates Results */}
          <AnimatePresence>
            {smResults.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-4 w-full max-w-sm space-y-2"
              >
                <p className="text-xs font-medium text-muted-foreground">
                  {smResults.length} resultado{smResults.length > 1 ? 's' : ''} en Scalemates
                </p>
                <div className="mb-1">
                  <p className="mb-1 text-[11px] text-muted-foreground">Añadir a la estantería:</p>
                  <ShelfPicker value={selectedShelf} onChange={setSelectedShelf} />
                </div>
                {smResults.map((kit, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.08 }}
                    className="rounded-xl border border-border bg-card p-3"
                  >
                    <div className="flex items-start gap-3">
                      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-muted text-lg">
                        📦
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-xs text-primary font-medium">{kit.brand}</p>
                        <p className="text-sm font-semibold leading-tight">{kit.name}</p>
                        <p className="text-xs text-muted-foreground font-mono mt-0.5">
                          {kit.scale}
                          {kit.reference && ` · ${kit.reference}`}
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-2 mt-3">
                      <Button
                        size="sm"
                        className="rounded-full flex-1"
                        onClick={() => handleAddToStash(kit, i)}
                        disabled={addingId === i}
                      >
                        {addingId === i ? (
                          <Loader2 className="mr-1 h-3 w-3 animate-spin" />
                        ) : (
                          <Plus className="mr-1 h-3 w-3" />
                        )}
                        Añadir a colección
                      </Button>
                      {kit.scalemates_url && (
                        <Button
                          size="sm"
                          variant="outline"
                          className="rounded-full"
                          asChild
                        >
                          <a href={kit.scalemates_url} target="_blank" rel="noopener noreferrer">
                            <ExternalLink className="h-3 w-3" />
                          </a>
                        </Button>
                      )}
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}

      {/* Camera Mode */}
      {mode === 'camera' && (
        <div className="flex flex-col items-center px-4">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            capture="environment"
            className="hidden"
            onChange={handleFileInput}
          />
          <input
            ref={galleryInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleFileInput}
          />
          <div className="relative w-full max-w-sm aspect-[3/4] rounded-2xl border border-border bg-muted overflow-hidden flex items-center justify-center">
            {photoPreview ? (
              <>
                <img src={photoPreview} alt="Captura" className="h-full w-full object-cover" />
                {identifying && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center bg-background/70 backdrop-blur-sm">
                    <Loader2 className="h-8 w-8 animate-spin text-primary mb-2" />
                    <p className="text-sm font-medium text-foreground">Identificando kit...</p>
                    <p className="text-xs text-muted-foreground mt-1">Analizando imagen con IA</p>
                  </div>
                )}
                <button
                  onClick={() => { setPhotoPreview(null); setIdentifiedKit(null); setEnrichedData(null); }}
                  className="absolute top-3 right-3 rounded-full bg-background/60 p-1.5 backdrop-blur-sm"
                >
                  <X className="h-4 w-4" />
                </button>
              </>
            ) : (
              <div className="text-center p-6">
                <Sparkles className="mx-auto h-12 w-12 text-primary/30" />
                <p className="mt-3 text-sm text-muted-foreground">
                  Toma una foto de la caja del kit
                </p>
                <p className="text-xs text-muted-foreground/60 mt-1">
                  La IA identificará la maqueta automáticamente
                </p>
              </div>
            )}
          </div>

          {/* Identified Kit Result */}
          <AnimatePresence>
            {identifiedKit && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="mt-4 w-full max-w-sm rounded-xl border border-primary/30 bg-primary/10 p-4"
              >
                <div className="flex items-center gap-2 mb-2">
                  <Sparkles className="h-4 w-4 text-primary" />
                  <span className="text-sm font-semibold text-primary">Kit identificado</span>
                  <span className="ml-auto text-xs text-muted-foreground">
                    {Math.round(identifiedKit.confidence * 100)}% confianza
                  </span>
                </div>
                <div className="flex items-start gap-3">
                  {enrichedData?.image_url && (
                    <img
                      src={enrichedData.image_url}
                      alt={identifiedKit.name}
                      className="h-16 w-16 rounded-lg object-cover shrink-0 border border-border"
                    />
                  )}
                  <div className="space-y-1 min-w-0 flex-1">
                    <p className="text-xs text-primary font-medium">
                      {enrichedData?.brand || identifiedKit.brand}
                    </p>
                    <p className="text-sm font-semibold leading-tight">
                      {enrichedData?.name || identifiedKit.name}
                    </p>
                    <p className="text-xs text-muted-foreground font-mono">
                      {enrichedData?.scale || identifiedKit.scale}
                      {(enrichedData?.reference || identifiedKit.reference) && ` · ${enrichedData?.reference || identifiedKit.reference}`}
                      {(() => {
                        const cat = enrichedData?.category || identifiedKit.category;
                        return cat ? ` · ${CATEGORY_ES[cat] ?? cat}` : '';
                      })()}
                      {(enrichedData?.year || identifiedKit.year) && ` · ${enrichedData?.year || identifiedKit.year}`}
                    </p>
                  </div>
                </div>

                {enriching && (
                  <div className="flex items-center gap-2 text-xs text-muted-foreground mt-2">
                    <Loader2 className="h-3 w-3 animate-spin" />
                    Buscando datos adicionales en Scalemates...
                  </div>
                )}
                {enrichedData && (
                  <div className="flex items-center gap-2 text-xs text-muted-foreground mt-2">
                    <Check className="h-3 w-3 text-primary" />
                    Datos enriquecidos con Scalemates
                    {enrichedData.scalemates_url && (
                      <a href={enrichedData.scalemates_url} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline ml-auto flex items-center gap-1">
                        Ver ficha técnica <ExternalLink className="h-3 w-3" />
                      </a>
                    )}
                  </div>
                )}

                <div className="mt-3">
                  <p className="mb-1 text-[11px] text-muted-foreground">Añadir a la estantería:</p>
                  <ShelfPicker value={selectedShelf} onChange={setSelectedShelf} />
                </div>
                <div className="flex gap-2 mt-3">
                  <Button
                    size="sm"
                    className="rounded-full flex-1"
                    onClick={handleAddIdentifiedToStash}
                    disabled={addingIdentified || enriching}
                  >
                    {addingIdentified ? (
                      <Loader2 className="mr-1 h-3 w-3 animate-spin" />
                    ) : (
                      <Plus className="mr-1 h-3 w-3" />
                    )}
                    Añadir al stash
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="rounded-full"
                    onClick={() => navigate(`/add?name=${encodeURIComponent(enrichedData?.name || identifiedKit.name)}&brand=${encodeURIComponent(enrichedData?.brand || identifiedKit.brand)}&scale=${encodeURIComponent(enrichedData?.scale || identifiedKit.scale)}&reference=${encodeURIComponent(enrichedData?.reference || identifiedKit.reference || '')}&status=${selectedShelf}`)}
                  >
                    Editar y añadir
                  </Button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="mt-4 w-full max-w-sm flex gap-2">
            <Button onClick={() => fileInputRef.current?.click()} size="lg" className="rounded-full flex-1" disabled={identifying}>
              <Camera className="mr-2 h-4 w-4" />
              {photoPreview ? 'Otra foto' : 'Tomar foto'}
            </Button>
            <Button onClick={() => galleryInputRef.current?.click()} size="lg" variant="outline" className="rounded-full flex-1" disabled={identifying}>
              <ImagePlus className="mr-2 h-4 w-4" />
              Galería
            </Button>
          </div>
          {photoPreview && !identifying && !identifiedKit && (
            <div className="mt-2 w-full max-w-sm">
              <Button onClick={() => handleIdentifyFromImage(photoPreview)} size="lg" variant="outline" className="rounded-full w-full">
                <Sparkles className="mr-2 h-4 w-4" />
                Reintentar
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
