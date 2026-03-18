import { useState, useMemo } from 'react';
import { useApp } from '@/context/AppContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Navigate } from 'react-router-dom';
import { Wrench, Plus, Search, CalendarDays, User, FileText, Hash, AlertTriangle } from 'lucide-react';
import { ServiceHistory } from '@/lib/types';
import { toast } from '@/hooks/use-toast';

const emptyForm = () => ({
  equipmentId: '', type: 'preventivo' as 'preventivo' | 'correctivo',
  date: new Date().toISOString().split('T')[0],
  description: '', partsReplaced: '', pageCountAtService: '', cost: '',
});

const HistorialPage = () => {
  const { user, equipment, serviceHistory, users, createServiceHistory } = useApp();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState(emptyForm());
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [techFilter, setTechFilter] = useState('all');

  if (!user || user.role === 'usuario') return <Navigate to="/" replace />;

  const technicians = users.filter(u => u.role === 'tecnico' && u.active);

  const filtered = useMemo(() => {
    let list = serviceHistory;
    if (search) {
      const s = search.toLowerCase();
      list = list.filter(h => {
        const eq = equipment.find(e => e.id === h.equipmentId);
        return (eq?.brand + ' ' + eq?.model).toLowerCase().includes(s) ||
          (eq?.serialNumber || '').toLowerCase().includes(s) ||
          h.description.toLowerCase().includes(s);
      });
    }
    if (typeFilter !== 'all') list = list.filter(h => h.type === typeFilter);
    if (techFilter !== 'all') list = list.filter(h => h.technicianId === techFilter);
    return [...list].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [serviceHistory, search, typeFilter, techFilter, equipment]);

  // Equipos sin servicio en más de 60 días
  const overdueEquipment = equipment.filter(e => {
    if (e.status !== 'activo') return false;
    if (!e.lastService) return true;
    const days = (Date.now() - new Date(e.lastService).getTime()) / (1000 * 60 * 60 * 24);
    return days > 60;
  });

  const handleSave = async () => {
    if (!form.equipmentId || !form.description.trim()) return;
    await createServiceHistory({
      equipmentId: form.equipmentId,
      type: form.type,
      technicianId: user.id,
      date: form.date,
      description: form.description.trim(),
      partsReplaced: form.partsReplaced.trim() || undefined,
      pageCountAtService: form.pageCountAtService ? parseInt(form.pageCountAtService) : undefined,
      cost: form.cost ? parseFloat(form.cost) : undefined,
    });
    toast({ title: '✅ Servicio registrado' });
    setOpen(false);
    setForm(emptyForm());
  };

  const typeBadge = (type: string) => type === 'preventivo'
    ? 'border-success/40 text-success bg-success/5'
    : 'border-warning/40 text-warning bg-warning/5';

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight">Historial de Servicios</h1>
          <p className="text-sm text-muted-foreground mt-0.5">{serviceHistory.length} servicios registrados</p>
        </div>
        <Button onClick={() => { setForm(emptyForm()); setOpen(true); }} className="gap-2 font-semibold">
          <Plus className="h-4 w-4" /> Registrar Servicio
        </Button>
      </div>

      {/* Overdue alert */}
      {overdueEquipment.length > 0 && (
        <Card className="border-warning/30 bg-warning/5">
          <CardContent className="p-4 flex items-start gap-3">
            <AlertTriangle className="h-5 w-5 text-warning shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm font-bold text-warning">
                {overdueEquipment.length} equipo{overdueEquipment.length > 1 ? 's' : ''} sin servicio en más de 60 días
              </p>
              <div className="mt-1.5 flex flex-wrap gap-1.5">
                {overdueEquipment.slice(0, 5).map(e => (
                  <span key={e.id} className="text-[10px] bg-warning/20 text-warning px-2 py-0.5 rounded-full font-medium">
                    {e.brand} {e.model} — {e.assignedTo}
                  </span>
                ))}
                {overdueEquipment.length > 5 && (
                  <span className="text-[10px] text-muted-foreground">+{overdueEquipment.length - 5} más</span>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { label: 'Total servicios', value: serviceHistory.length },
          { label: 'Preventivos', value: serviceHistory.filter(h => h.type === 'preventivo').length },
          { label: 'Correctivos', value: serviceHistory.filter(h => h.type === 'correctivo').length },
          { label: 'Este mes', value: serviceHistory.filter(h => new Date(h.date).getMonth() === new Date().getMonth()).length },
        ].map((s, i) => (
          <Card key={i}>
            <CardContent className="p-4">
              <p className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wider">{s.label}</p>
              <p className="text-2xl font-extrabold mt-0.5">{s.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
          <Input placeholder="Buscar equipo, serie, descripción..." value={search}
            onChange={e => setSearch(e.target.value)} className="pl-8 h-9 text-sm" />
        </div>
        <Select value={typeFilter} onValueChange={setTypeFilter}>
          <SelectTrigger className="w-[150px] h-9 text-sm"><SelectValue placeholder="Tipo" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos los tipos</SelectItem>
            <SelectItem value="preventivo">✅ Preventivo</SelectItem>
            <SelectItem value="correctivo">🔧 Correctivo</SelectItem>
          </SelectContent>
        </Select>
        <Select value={techFilter} onValueChange={setTechFilter}>
          <SelectTrigger className="w-[160px] h-9 text-sm"><SelectValue placeholder="Técnico" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos los técnicos</SelectItem>
            {technicians.map(t => <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      {/* History list */}
      <div className="space-y-2.5">
        {filtered.length === 0 ? (
          <Card><CardContent className="py-14 text-center text-muted-foreground text-sm">No se encontraron servicios</CardContent></Card>
        ) : filtered.map(h => {
          const eq = equipment.find(e => e.id === h.equipmentId);
          const tech = users.find(u => u.id === h.technicianId);
          return (
            <Card key={h.id} className="hover:shadow-sm transition-all">
              <CardContent className="p-4 flex items-start gap-4">
                <div className={`h-10 w-10 rounded-xl flex items-center justify-center shrink-0 ${h.type === 'preventivo' ? 'bg-success/10' : 'bg-warning/10'}`}>
                  <Wrench className={`h-5 w-5 ${h.type === 'preventivo' ? 'text-success' : 'text-warning'}`} />
                </div>
                <div className="flex-1 min-w-0 space-y-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <Badge variant="outline" className={`${typeBadge(h.type)} text-[10px]`}>{h.type}</Badge>
                    {eq && <span className="text-sm font-bold">{eq.brand} {eq.model}</span>}
                    {eq && <span className="text-xs text-muted-foreground font-mono">{eq.serialNumber}</span>}
                  </div>
                  <p className="text-sm text-muted-foreground leading-relaxed">{h.description}</p>
                  {h.partsReplaced && (
                    <p className="text-xs text-muted-foreground flex items-center gap-1">
                      <Hash className="h-3 w-3" /> Piezas: {h.partsReplaced}
                    </p>
                  )}
                  <div className="flex items-center gap-3 text-xs text-muted-foreground flex-wrap">
                    <span className="flex items-center gap-1"><CalendarDays className="h-3 w-3" />{new Date(h.date).toLocaleDateString('es-MX')}</span>
                    {tech && <span className="flex items-center gap-1"><User className="h-3 w-3" />{tech.name}</span>}
                    {h.pageCountAtService && <span className="flex items-center gap-1"><FileText className="h-3 w-3" />{h.pageCountAtService.toLocaleString()} págs</span>}
                    {h.cost && <span className="font-semibold text-foreground">${h.cost.toLocaleString('es-MX', { minimumFractionDigits: 2 })}</span>}
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Register service dialog */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Registrar Servicio</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-2">
            <div className="space-y-2">
              <Label>Equipo <span className="text-destructive">*</span></Label>
              <Select value={form.equipmentId} onValueChange={v => setForm(f => ({ ...f, equipmentId: v }))}>
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
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label>Tipo de servicio</Label>
                <Select value={form.type} onValueChange={v => setForm(f => ({ ...f, type: v as any }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="preventivo">✅ Preventivo</SelectItem>
                    <SelectItem value="correctivo">🔧 Correctivo</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Fecha</Label>
                <Input type="date" value={form.date} onChange={e => setForm(f => ({ ...f, date: e.target.value }))} />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Descripción del servicio <span className="text-destructive">*</span></Label>
              <Textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                placeholder="Detalla qué se hizo: limpieza, ajustes, diagnóstico..." className="min-h-[90px]" />
            </div>
            <div className="space-y-2">
              <Label>Piezas reemplazadas</Label>
              <Input value={form.partsReplaced} onChange={e => setForm(f => ({ ...f, partsReplaced: e.target.value }))}
                placeholder="Ej: Fusor, rodillo de arrastre, drum..." />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label>Páginas al momento</Label>
                <Input type="number" value={form.pageCountAtService}
                  onChange={e => setForm(f => ({ ...f, pageCountAtService: e.target.value }))} placeholder="0" />
              </div>
              <div className="space-y-2">
                <Label>Costo del servicio ($)</Label>
                <Input type="number" value={form.cost}
                  onChange={e => setForm(f => ({ ...f, cost: e.target.value }))} placeholder="0.00" />
              </div>
            </div>
            <div className="flex gap-3 justify-end pt-2">
              <Button variant="outline" onClick={() => setOpen(false)}>Cancelar</Button>
              <Button onClick={handleSave} className="font-semibold">Registrar</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default HistorialPage;
