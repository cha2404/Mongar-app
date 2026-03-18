import { useState, useMemo } from 'react';
import { useApp } from '@/context/AppContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Navigate } from 'react-router-dom';
import { FileText, Plus, TrendingUp, Search, CalendarDays, DollarSign } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

const LecturasPage = () => {
  const { user, equipment, pageReadings, createPageReading } = useApp();
  const [open, setOpen] = useState(false);
  const [equipmentId, setEquipmentId] = useState('');
  const [reading, setReading] = useState('');
  const [readingDate, setReadingDate] = useState(new Date().toISOString().split('T')[0]);
  const [search, setSearch] = useState('');

  if (!user || user.role === 'usuario') return <Navigate to="/" replace />;

  const filtered = useMemo(() => {
    if (!search) return pageReadings;
    const s = search.toLowerCase();
    return pageReadings.filter(r => {
      const eq = equipment.find(e => e.id === r.equipmentId);
      return (eq?.brand + ' ' + eq?.model).toLowerCase().includes(s) ||
        (eq?.serialNumber || '').toLowerCase().includes(s) ||
        (eq?.assignedTo || '').toLowerCase().includes(s);
    });
  }, [pageReadings, search, equipment]);

  const sorted = [...filtered].sort((a, b) => new Date(b.readingDate).getTime() - new Date(a.readingDate).getTime());

  // Get last reading per equipment
  const lastReadingByEq: Record<string, number> = {};
  [...pageReadings].sort((a, b) => new Date(a.readingDate).getTime() - new Date(b.readingDate).getTime())
    .forEach(r => { lastReadingByEq[r.equipmentId] = r.reading; });

  const selectedEquipment = equipment.find(e => e.id === equipmentId);
  const lastReading = equipmentId ? (lastReadingByEq[equipmentId] || selectedEquipment?.pageCount || 0) : 0;
  const pagesUsed = reading ? Math.max(0, parseInt(reading) - lastReading) : 0;

  // Estimated cost
  const estimatedCost = selectedEquipment?.pricePerPage
    ? pagesUsed * selectedEquipment.pricePerPage
    : null;

  const handleSave = async () => {
    if (!equipmentId || !reading) return;
    const readingNum = parseInt(reading);
    if (readingNum < lastReading) {
      toast({ title: '❌ Error', description: 'La lectura no puede ser menor a la anterior', variant: 'destructive' });
      return;
    }
    await createPageReading({
      equipmentId,
      reading: readingNum,
      previousReading: lastReading,
      pagesUsed: Math.max(0, readingNum - lastReading),
      readingDate,
      recordedBy: user.id,
    });
    toast({ title: '✅ Lectura registrada', description: `${pagesUsed.toLocaleString()} páginas este período` });
    setOpen(false);
    setEquipmentId('');
    setReading('');
  };

  const totalPagesThisMonth = pageReadings
    .filter(r => new Date(r.readingDate).getMonth() === new Date().getMonth())
    .reduce((sum, r) => sum + r.pagesUsed, 0);

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight">Lecturas de Páginas</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Control de páginas impresas por equipo</p>
        </div>
        <Button onClick={() => setOpen(true)} className="gap-2 font-semibold">
          <Plus className="h-4 w-4" /> Nueva Lectura
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { label: 'Total lecturas', value: pageReadings.length, icon: FileText },
          { label: 'Páginas este mes', value: totalPagesThisMonth.toLocaleString(), icon: TrendingUp },
          { label: 'Equipos con lectura', value: Object.keys(lastReadingByEq).length, icon: FileText },
          { label: 'Sin lectura aún', value: equipment.filter(e => !lastReadingByEq[e.id] && e.status === 'activo').length, icon: FileText },
        ].map((s, i) => (
          <Card key={i}>
            <CardContent className="p-4">
              <p className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wider">{s.label}</p>
              <p className="text-2xl font-extrabold mt-0.5">{s.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Equipment without reading this month */}
      {(() => {
        const thisMonth = new Date().getMonth();
        const withReadingThisMonth = new Set(pageReadings.filter(r => new Date(r.readingDate).getMonth() === thisMonth).map(r => r.equipmentId));
        const withoutReading = equipment.filter(e => e.status === 'activo' && e.contractType === 'renta' && !withReadingThisMonth.has(e.id));
        if (withoutReading.length === 0) return null;
        return (
          <Card className="border-primary/20 bg-primary/5">
            <CardContent className="p-4">
              <p className="text-sm font-bold text-primary mb-2">📋 {withoutReading.length} equipos sin lectura este mes</p>
              <div className="flex flex-wrap gap-1.5">
                {withoutReading.slice(0, 8).map(e => (
                  <button key={e.id} onClick={() => { setEquipmentId(e.id); setOpen(true); }}
                    className="text-[10px] bg-primary/10 text-primary px-2 py-1 rounded-full font-medium hover:bg-primary/20 transition-colors">
                    {e.brand} {e.model} — {e.assignedTo}
                  </button>
                ))}
                {withoutReading.length > 8 && <span className="text-xs text-muted-foreground">+{withoutReading.length - 8} más</span>}
              </div>
            </CardContent>
          </Card>
        );
      })()}

      {/* Search */}
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
        <Input placeholder="Buscar equipo..." value={search} onChange={e => setSearch(e.target.value)} className="pl-8" />
      </div>

      {/* Readings list */}
      <div className="space-y-2">
        {sorted.length === 0 ? (
          <Card><CardContent className="py-14 text-center text-muted-foreground text-sm">No hay lecturas registradas aún</CardContent></Card>
        ) : sorted.map(r => {
          const eq = equipment.find(e => e.id === r.equipmentId);
          const cost = eq?.pricePerPage ? r.pagesUsed * eq.pricePerPage : null;
          return (
            <Card key={r.id} className="hover:shadow-sm transition-all">
              <CardContent className="p-4 flex items-center gap-4">
                <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                  <TrendingUp className="h-5 w-5 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    {eq && <span className="font-bold text-sm">{eq.brand} {eq.model}</span>}
                    {eq && <span className="text-xs text-muted-foreground font-mono">{eq.serialNumber}</span>}
                    {eq && <span className="text-xs text-muted-foreground">— {eq.assignedTo}</span>}
                  </div>
                  <div className="flex items-center gap-3 mt-0.5 flex-wrap text-xs text-muted-foreground">
                    <span className="flex items-center gap-1"><CalendarDays className="h-3 w-3" />{new Date(r.readingDate).toLocaleDateString('es-MX')}</span>
                    <span>Lectura: <strong className="text-foreground">{r.reading.toLocaleString()}</strong></span>
                    <span>Anterior: {r.previousReading.toLocaleString()}</span>
                    <span className="font-bold text-primary">+{r.pagesUsed.toLocaleString()} págs</span>
                    {cost && <span className="flex items-center gap-1 font-bold text-success"><DollarSign className="h-3 w-3" />${cost.toLocaleString('es-MX', { minimumFractionDigits: 2 })}</span>}
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* New reading dialog */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Nueva Lectura de Páginas</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-2">
            <div className="space-y-2">
              <Label>Equipo <span className="text-destructive">*</span></Label>
              <Select value={equipmentId} onValueChange={v => { setEquipmentId(v); setReading(''); }}>
                <SelectTrigger><SelectValue placeholder="Selecciona el equipo..." /></SelectTrigger>
                <SelectContent className="max-h-60">
                  {equipment.filter(e => e.status !== 'inactivo').map(e => (
                    <SelectItem key={e.id} value={e.id}>
                      {e.brand} {e.model} — {e.serialNumber} — {e.assignedTo}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {equipmentId && (
              <div className="p-3 rounded-xl bg-secondary/40 border border-border text-sm space-y-1">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Última lectura:</span>
                  <span className="font-bold">{lastReading.toLocaleString()} págs</span>
                </div>
                {selectedEquipment?.pricePerPage && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Precio por página:</span>
                    <span className="font-bold">${selectedEquipment.pricePerPage}</span>
                  </div>
                )}
              </div>
            )}

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label>Lectura actual <span className="text-destructive">*</span></Label>
                <Input type="number" value={reading} onChange={e => setReading(e.target.value)} placeholder="0" />
              </div>
              <div className="space-y-2">
                <Label>Fecha de lectura</Label>
                <Input type="date" value={readingDate} onChange={e => setReadingDate(e.target.value)} />
              </div>
            </div>

            {reading && parseInt(reading) >= lastReading && (
              <div className="p-3 rounded-xl bg-primary/5 border border-primary/20 space-y-1 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Páginas impresas:</span>
                  <span className="font-bold text-primary">{pagesUsed.toLocaleString()}</span>
                </div>
                {estimatedCost !== null && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Costo estimado:</span>
                    <span className="font-bold text-success">${estimatedCost.toLocaleString('es-MX', { minimumFractionDigits: 2 })}</span>
                  </div>
                )}
              </div>
            )}

            <div className="flex gap-3 justify-end pt-2">
              <Button variant="outline" onClick={() => setOpen(false)}>Cancelar</Button>
              <Button onClick={handleSave} className="font-semibold" disabled={!equipmentId || !reading}>Registrar</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default LecturasPage;
