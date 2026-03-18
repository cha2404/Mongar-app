import { useState, useMemo } from 'react';
import { useApp } from '@/context/AppContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Navigate, Link } from 'react-router-dom';
import { Printer, Wrench, Hash, MapPin, CalendarDays, Search, TrendingUp, AlertTriangle, Building2, RefreshCw, ChevronLeft, ChevronRight } from 'lucide-react';
import { Equipment } from '@/lib/types';
import { toast } from '@/hooks/use-toast';

const statusBadge: Record<string, string> = {
  activo: 'border-success/40 text-success bg-success/5',
  en_mantenimiento: 'border-warning/40 text-warning bg-warning/5',
  inactivo: 'border-muted-foreground/30 text-muted-foreground',
};

const contractBadge: Record<string, string> = {
  renta: 'border-blue-400/40 text-blue-500 bg-blue-50 dark:bg-blue-950',
  venta: 'border-violet-400/40 text-violet-500 bg-violet-50 dark:bg-violet-950',
};

const PAGE_SIZE = 24;

const EquiposPage = () => {
  const { user, equipment, updateEquipment, createRequest } = useApp();
  const [selected, setSelected] = useState<Equipment | null>(null);
  const [editToner, setEditToner] = useState('');
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [contractFilter, setContractFilter] = useState('all');
  const [brandFilter, setBrandFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [clientFilter, setClientFilter] = useState('all');
  const [page, setPage] = useState(1);

  if (!user || user.role === 'usuario') return <Navigate to="/" replace />;

  // Unique filter options
  const brands = useMemo(() => ['all', ...Array.from(new Set(equipment.map(e => e.brand))).sort()], [equipment]);
  const clients = useMemo(() => ['all', ...Array.from(new Set(equipment.map(e => e.assignedTo).filter(Boolean))).sort()], [equipment]);

  // Stats
  const totalActive = equipment.filter(e => e.status === 'activo').length;
  const inMaintenance = equipment.filter(e => e.status === 'en_mantenimiento').length;
  const lowToner = equipment.filter(e => (e.tonerLevel ?? 100) < 20 && e.status === 'activo').length;
  const renta = equipment.filter(e => e.contractType === 'renta').length;
  const venta = equipment.filter(e => e.contractType === 'venta').length;

  // Filtered list
  const filtered = useMemo(() => {
    let list = equipment;
    if (search) {
      const s = search.toLowerCase();
      list = list.filter(e =>
        e.model.toLowerCase().includes(s) ||
        e.brand.toLowerCase().includes(s) ||
        e.serialNumber.toLowerCase().includes(s) ||
        e.location.toLowerCase().includes(s) ||
        e.assignedTo.toLowerCase().includes(s)
      );
    }
    if (statusFilter !== 'all') list = list.filter(e => e.status === statusFilter);
    if (contractFilter !== 'all') list = list.filter(e => e.contractType === contractFilter);
    if (brandFilter !== 'all') list = list.filter(e => e.brand === brandFilter);
    if (typeFilter !== 'all') list = list.filter(e => e.type === typeFilter);
    if (clientFilter !== 'all') list = list.filter(e => e.assignedTo === clientFilter);
    return list;
  }, [equipment, search, statusFilter, contractFilter, brandFilter, typeFilter, clientFilter]);

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const resetFilters = () => {
    setSearch(''); setStatusFilter('all'); setContractFilter('all');
    setBrandFilter('all'); setTypeFilter('all'); setClientFilter('all'); setPage(1);
  };

  const handleSaveToner = async () => {
    if (!selected) return;
    const val = parseInt(editToner);
    if (isNaN(val) || val < 0 || val > 100) return;
    await updateEquipment(selected.id, { tonerLevel: val });
    setSelected(prev => prev ? { ...prev, tonerLevel: val } : null);
    toast({ title: '✅ Nivel de toner actualizado' });
  };

  const handleStatusChange = async (id: string, status: Equipment['status']) => {
    await updateEquipment(id, { status, ...(status === 'en_mantenimiento' ? { lastService: new Date().toISOString().split('T')[0] } : {}) });
    setSelected(prev => prev?.id === id ? { ...prev, status } : prev);
    toast({ title: '✅ Estado actualizado' });
  };

  const handleRequestToner = async (eq: Equipment) => {
    await createRequest({
      type: 'toner',
      priority: (eq.tonerLevel ?? 100) < 10 ? 'urgente' : 'alta',
      title: `Reposición de toner - ${eq.brand} ${eq.model}`,
      description: `El equipo ${eq.brand} ${eq.model} (S/N: ${eq.serialNumber}) en ${eq.location} tiene ${eq.tonerLevel ?? '?'}% de toner. Se solicita reposición urgente.`,
      createdBy: user.id,
      printerModel: `${eq.brand} ${eq.model}`,
      serialNumber: eq.serialNumber,
      location: eq.location,
      contractType: eq.contractType,
    });
    toast({ title: '✅ Solicitud de toner creada' });
    setSelected(null);
  };

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-extrabold tracking-tight">Equipos</h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          {equipment.length} equipos registrados · {filtered.length} mostrados
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
        {[
          { label: 'Activos', value: totalActive, color: 'text-success', bg: 'bg-success/10', icon: Printer },
          { label: 'Mantenimiento', value: inMaintenance, color: 'text-warning', bg: 'bg-warning/10', icon: Wrench },
          { label: 'Toner Bajo', value: lowToner, color: 'text-destructive', bg: 'bg-destructive/10', icon: AlertTriangle },
          { label: 'En Renta', value: renta, color: 'text-blue-500', bg: 'bg-blue-500/10', icon: TrendingUp },
          { label: 'Venta', value: venta, color: 'text-violet-500', bg: 'bg-violet-500/10', icon: Building2 },
        ].map((s, i) => (
          <Card key={i}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wider">{s.label}</p>
                  <p className="text-2xl font-extrabold mt-0.5">{s.value}</p>
                </div>
                <div className={`h-9 w-9 rounded-xl ${s.bg} flex items-center justify-center`}>
                  <s.icon className={`h-4 w-4 ${s.color}`} />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-wrap gap-2 items-center">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
              <Input placeholder="Buscar por modelo, serie, cliente, ubicación..." value={search}
                onChange={e => { setSearch(e.target.value); setPage(1); }} className="pl-8 h-9 text-sm" />
            </div>
            <Select value={brandFilter} onValueChange={v => { setBrandFilter(v); setPage(1); }}>
              <SelectTrigger className="w-[130px] h-9 text-sm"><SelectValue placeholder="Marca" /></SelectTrigger>
              <SelectContent>
                {brands.map(b => <SelectItem key={b} value={b}>{b === 'all' ? 'Todas las marcas' : b}</SelectItem>)}
              </SelectContent>
            </Select>
            <Select value={typeFilter} onValueChange={v => { setTypeFilter(v); setPage(1); }}>
              <SelectTrigger className="w-[140px] h-9 text-sm"><SelectValue placeholder="Tipo" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los tipos</SelectItem>
                <SelectItem value="impresora">🖨️ Impresora</SelectItem>
                <SelectItem value="multifuncional">📠 Multifuncional</SelectItem>
                <SelectItem value="plotter">🗺️ Plotter</SelectItem>
              </SelectContent>
            </Select>
            <Select value={contractFilter} onValueChange={v => { setContractFilter(v); setPage(1); }}>
              <SelectTrigger className="w-[120px] h-9 text-sm"><SelectValue placeholder="Contrato" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todo contrato</SelectItem>
                <SelectItem value="renta">Renta</SelectItem>
                <SelectItem value="venta">Venta</SelectItem>
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={v => { setStatusFilter(v); setPage(1); }}>
              <SelectTrigger className="w-[140px] h-9 text-sm"><SelectValue placeholder="Estado" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todo estado</SelectItem>
                <SelectItem value="activo">✅ Activo</SelectItem>
                <SelectItem value="en_mantenimiento">🔧 Mantenimiento</SelectItem>
                <SelectItem value="inactivo">⚫ Inactivo</SelectItem>
              </SelectContent>
            </Select>
            <Select value={clientFilter} onValueChange={v => { setClientFilter(v); setPage(1); }}>
              <SelectTrigger className="w-[160px] h-9 text-sm"><SelectValue placeholder="Cliente" /></SelectTrigger>
              <SelectContent className="max-h-60">
                {clients.map(c => <SelectItem key={c} value={c}>{c === 'all' ? 'Todos los clientes' : c}</SelectItem>)}
              </SelectContent>
            </Select>
            <Button variant="ghost" size="sm" onClick={resetFilters} className="gap-1.5 h-9">
              <RefreshCw className="h-3.5 w-3.5" /> Limpiar
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Equipment grid */}
      {paginated.length === 0 ? (
        <Card><CardContent className="py-16 text-center text-muted-foreground">No se encontraron equipos</CardContent></Card>
      ) : (
        <div className="grid sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-3">
          {paginated.map(eq => (
            <Card key={eq.id}
              className="hover:shadow-md transition-all hover:border-primary/20 cursor-pointer"
              onClick={() => { setSelected(eq); setEditToner(String(eq.tonerLevel ?? 100)); }}>
              <CardContent className="p-4 space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="h-9 w-9 rounded-lg bg-secondary flex items-center justify-center shrink-0">
                      <Printer className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <div className="min-w-0">
                      <p className="font-bold text-sm leading-tight truncate">{eq.brand} {eq.model}</p>
                      <p className="text-[10px] text-muted-foreground capitalize">{eq.type}</p>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-1 shrink-0">
                    <Badge variant="outline" className={`${statusBadge[eq.status]} text-[9px] px-1.5 py-0`}>
                      {eq.status.replace('_', ' ')}
                    </Badge>
                    <Badge variant="outline" className={`${contractBadge[eq.contractType]} text-[9px] px-1.5 py-0`}>
                      {eq.contractType}
                    </Badge>
                  </div>
                </div>

                <div className="space-y-1 text-[11px] text-muted-foreground">
                  <div className="flex items-center gap-1.5 truncate">
                    <Building2 className="h-3 w-3 shrink-0" />
                    <span className="truncate font-medium text-foreground/80">{eq.assignedTo || '—'}</span>
                  </div>
                  <div className="flex items-center gap-1.5 truncate">
                    <MapPin className="h-3 w-3 shrink-0" />
                    <span className="truncate">{eq.location}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Hash className="h-3 w-3 shrink-0" />
                    <span className="font-mono">{eq.serialNumber}</span>
                  </div>
                </div>

                {eq.tonerLevel !== undefined && (
                  <div className="space-y-1">
                    <div className="flex justify-between text-[11px]">
                      <span className="text-muted-foreground">Toner</span>
                      <span className={`font-bold ${eq.tonerLevel < 20 ? 'text-destructive' : eq.tonerLevel < 40 ? 'text-warning' : 'text-success'}`}>
                        {eq.tonerLevel}%
                      </span>
                    </div>
                    <Progress value={eq.tonerLevel} className="h-1.5" />
                    {eq.tonerLevel < 20 && (
                      <Button size="sm" variant="destructive" className="w-full text-[11px] h-6 mt-1"
                        onClick={e => { e.stopPropagation(); handleRequestToner(eq); }}>
                        ⚡ Solicitar toner
                      </Button>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-3 pt-2">
          <Button variant="outline" size="sm" onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="text-sm text-muted-foreground">
            Página <strong>{page}</strong> de <strong>{totalPages}</strong> · {filtered.length} equipos
          </span>
          <Button variant="outline" size="sm" onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      )}

      {/* Detail Dialog */}
      {selected && (
        <Dialog open onOpenChange={() => setSelected(null)}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Printer className="h-4 w-4" /> {selected.brand} {selected.model}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-1">
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div><span className="text-muted-foreground block text-xs mb-0.5">Tipo</span><span className="font-semibold capitalize">{selected.type}</span></div>
                <div><span className="text-muted-foreground block text-xs mb-0.5">Contrato</span>
                  <Badge variant="outline" className={`${contractBadge[selected.contractType]} text-xs`}>{selected.contractType}</Badge>
                </div>
                <div><span className="text-muted-foreground block text-xs mb-0.5">N° Serie</span><span className="font-mono text-xs font-semibold">{selected.serialNumber}</span></div>
                <div><span className="text-muted-foreground block text-xs mb-0.5">Páginas</span><span className="font-semibold">{(selected.pageCount || 0).toLocaleString('es-MX')}</span></div>
                <div className="col-span-2"><span className="text-muted-foreground block text-xs mb-0.5">Cliente</span><span className="font-semibold">{selected.assignedTo || '—'}</span></div>
                <div className="col-span-2"><span className="text-muted-foreground block text-xs mb-0.5">Ubicación</span><span className="font-semibold text-sm">{selected.location}</span></div>
                {selected.installDate && <div><span className="text-muted-foreground block text-xs mb-0.5">Instalación</span><span className="font-semibold">{new Date(selected.installDate).toLocaleDateString('es-MX')}</span></div>}
                {selected.lastService && <div><span className="text-muted-foreground block text-xs mb-0.5">Último servicio</span><span className="font-semibold">{new Date(selected.lastService).toLocaleDateString('es-MX')}</span></div>}
              </div>

              {/* Toner update */}
              <div className="space-y-2 p-3 rounded-xl bg-secondary/40 border border-border">
                <Label className="text-xs font-semibold">Actualizar nivel de toner (%)</Label>
                <div className="flex gap-2">
                  <Input type="number" min="0" max="100" value={editToner}
                    onChange={e => setEditToner(e.target.value)} className="w-24 h-8 text-sm" />
                  <Button size="sm" onClick={handleSaveToner} className="h-8">Guardar</Button>
                  <Button size="sm" variant="outline" className="h-8" onClick={() => handleRequestToner(selected)}>
                    Pedir toner
                  </Button>
                </div>
              </div>

              {/* Status change */}
              {user.role === 'admin' && (
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold">Estado del equipo</Label>
                  <Select value={selected.status} onValueChange={v => handleStatusChange(selected.id, v as any)}>
                    <SelectTrigger className="h-9"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="activo">✅ Activo</SelectItem>
                      <SelectItem value="en_mantenimiento">🔧 En mantenimiento</SelectItem>
                      <SelectItem value="inactivo">⚫ Inactivo</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}

              <Link to="/nueva" onClick={() => setSelected(null)}>
                <Button variant="outline" className="w-full gap-2 mt-1">
                  <Wrench className="h-4 w-4" /> Crear solicitud de servicio
                </Button>
              </Link>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

export default EquiposPage;
