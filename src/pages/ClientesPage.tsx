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
import { Building2, Phone, Mail, MapPin, UserPlus, Pencil, Search, Printer, CalendarDays, TriangleAlert as AlertTriangle } from 'lucide-react';
import { Client } from '@/lib/types';
import { toast } from '@/hooks/use-toast';

const emptyClient = (): Omit<Client, 'id' | 'createdAt'> => ({
  name: '', contactName: '', email: '', phone: '', address: '',
  contractStart: '', contractEnd: '', contractType: 'renta', active: true, notes: '',
});

const ClientesPage = () => {
  const { user, clients, equipment, requests, createClient, updateClient } = useApp();
  const [search, setSearch] = useState('');
  const [open, setOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyClient());
  const [selected, setSelected] = useState<Client | null>(null);

  if (!user || user.role === 'usuario') return <Navigate to="/" replace />;

  const filtered = useMemo(() => {
    if (!search) return clients;
    const s = search.toLowerCase();
    return clients.filter(c =>
      c.name.toLowerCase().includes(s) ||
      (c.contactName || '').toLowerCase().includes(s) ||
      (c.email || '').toLowerCase().includes(s)
    );
  }, [clients, search]);

  // Contracts expiring in next 60 days
  const expiringSoon = clients.filter(c => {
    if (!c.contractEnd || !c.active) return false;
    const days = (new Date(c.contractEnd).getTime() - Date.now()) / (1000 * 60 * 60 * 24);
    return days >= 0 && days <= 60;
  });

  const openCreate = () => { setEditId(null); setForm(emptyClient()); setOpen(true); };
  const openEdit = (c: Client) => {
    setEditId(c.id);
    setForm({ name: c.name, contactName: c.contactName || '', email: c.email || '', phone: c.phone || '',
      address: c.address || '', contractStart: c.contractStart || '', contractEnd: c.contractEnd || '',
      contractType: c.contractType, active: c.active, notes: c.notes || '' });
    setOpen(true);
  };

  const handleSave = async () => {
    if (!form.name.trim()) return;
    if (editId) {
      await updateClient(editId, form);
      toast({ title: '✅ Cliente actualizado' });
    } else {
      await createClient(form);
      toast({ title: '✅ Cliente creado' });
    }
    setOpen(false);
  };

  const getClientEquipment = (clientId: string) => equipment.filter(e => e.clientId === clientId);
  const getClientRequests = (clientName: string) =>
    requests.filter(r => equipment.find(e => e.assignedTo === clientName && e.serialNumber === r.serialNumber));

  const daysUntilExpiry = (dateStr: string) => {
    const days = Math.ceil((new Date(dateStr).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
    return days;
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight">Clientes</h1>
          <p className="text-sm text-muted-foreground mt-0.5">{clients.length} clientes registrados</p>
        </div>
        <Button onClick={openCreate} className="gap-2 font-semibold">
          <UserPlus className="h-4 w-4" /> Nuevo Cliente
        </Button>
      </div>

      {/* Expiring contracts alert */}
      {expiringSoon.length > 0 && (
        <Card className="border-warning/30 bg-warning/5">
          <CardContent className="p-4 flex items-start gap-3">
            <AlertTriangle className="h-5 w-5 text-warning shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-bold text-warning">
                {expiringSoon.length} contrato{expiringSoon.length > 1 ? 's' : ''} vence{expiringSoon.length === 1 ? '' : 'n'} en los próximos 60 días
              </p>
              <p className="text-xs text-muted-foreground mt-0.5">
                {expiringSoon.map(c => `${c.name} (${daysUntilExpiry(c.contractEnd!)} días)`).join(' · ')}
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { label: 'Total', value: clients.length, color: 'text-primary', bg: 'bg-primary/10' },
          { label: 'Activos', value: clients.filter(c => c.active).length, color: 'text-success', bg: 'bg-success/10' },
          { label: 'Renta', value: clients.filter(c => c.contractType === 'renta').length, color: 'text-blue-500', bg: 'bg-blue-500/10' },
          { label: 'Vencen pronto', value: expiringSoon.length, color: 'text-warning', bg: 'bg-warning/10' },
        ].map((s, i) => (
          <Card key={i}>
            <CardContent className="p-4 flex items-center justify-between">
              <div>
                <p className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wider">{s.label}</p>
                <p className="text-2xl font-extrabold mt-0.5">{s.value}</p>
              </div>
              <Building2 className={`h-6 w-6 ${s.color}`} />
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Search */}
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
        <Input placeholder="Buscar cliente..." value={search} onChange={e => setSearch(e.target.value)} className="pl-8" />
      </div>

      {/* Client list */}
      <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-3">
        {filtered.map(c => {
          const eqs = getClientEquipment(c.id);
          const days = c.contractEnd ? daysUntilExpiry(c.contractEnd) : null;
          return (
            <Card key={c.id} className={`hover:shadow-md transition-all cursor-pointer hover:border-primary/20 ${!c.active ? 'opacity-60' : ''}`}
              onClick={() => setSelected(c)}>
              <CardContent className="p-4 space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2.5">
                    <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                      <span className="text-sm font-extrabold text-primary">{c.name[0]}</span>
                    </div>
                    <div>
                      <p className="font-bold text-sm leading-tight">{c.name}</p>
                      {c.contactName && <p className="text-xs text-muted-foreground">{c.contactName}</p>}
                    </div>
                  </div>
                  <Badge variant="outline" className={`text-[10px] shrink-0 ${
                    c.contractType === 'renta' ? 'border-blue-400/40 text-blue-500' :
                    c.contractType === 'venta' ? 'border-violet-400/40 text-violet-500' :
                    'border-primary/40 text-primary'
                  }`}>{c.contractType}</Badge>
                </div>

                <div className="space-y-1 text-xs text-muted-foreground">
                  {c.phone && <div className="flex items-center gap-1.5"><Phone className="h-3 w-3" />{c.phone}</div>}
                  {c.email && <div className="flex items-center gap-1.5"><Mail className="h-3 w-3" />{c.email}</div>}
                  {c.address && <div className="flex items-center gap-1.5"><MapPin className="h-3 w-3" />{c.address}</div>}
                </div>

                <div className="flex items-center justify-between pt-1 border-t border-border">
                  <div className="flex items-center gap-1.5 text-xs">
                    <Printer className="h-3.5 w-3.5 text-muted-foreground" />
                    <span className="font-semibold">{eqs.length}</span>
                    <span className="text-muted-foreground">equipos</span>
                  </div>
                  {c.contractEnd && days !== null && (
                    <div className={`text-xs font-semibold flex items-center gap-1 ${days <= 30 ? 'text-destructive' : days <= 60 ? 'text-warning' : 'text-muted-foreground'}`}>
                      <CalendarDays className="h-3 w-3" />
                      {days <= 0 ? 'Vencido' : `${days}d`}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Detail dialog */}
      {selected && (
        <Dialog open onOpenChange={() => setSelected(null)}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Building2 className="h-4 w-4" /> {selected.name}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-1">
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div><span className="text-xs text-muted-foreground block mb-0.5">Contacto</span><span className="font-semibold">{selected.contactName || '—'}</span></div>
                <div><span className="text-xs text-muted-foreground block mb-0.5">Teléfono</span><span className="font-semibold">{selected.phone || '—'}</span></div>
                <div className="col-span-2"><span className="text-xs text-muted-foreground block mb-0.5">Email</span><span className="font-semibold">{selected.email || '—'}</span></div>
                <div className="col-span-2"><span className="text-xs text-muted-foreground block mb-0.5">Dirección</span><span className="font-semibold">{selected.address || '—'}</span></div>
                <div><span className="text-xs text-muted-foreground block mb-0.5">Inicio contrato</span><span className="font-semibold">{selected.contractStart ? new Date(selected.contractStart).toLocaleDateString('es-MX') : '—'}</span></div>
                <div><span className="text-xs text-muted-foreground block mb-0.5">Fin contrato</span>
                  <span className={`font-semibold ${selected.contractEnd && daysUntilExpiry(selected.contractEnd) <= 30 ? 'text-destructive' : ''}`}>
                    {selected.contractEnd ? new Date(selected.contractEnd).toLocaleDateString('es-MX') : '—'}
                  </span>
                </div>
              </div>
              {selected.notes && (
                <div className="p-3 rounded-lg bg-secondary/40 text-sm">
                  <p className="text-xs text-muted-foreground mb-1 font-semibold">Notas</p>
                  <p>{selected.notes}</p>
                </div>
              )}
              <div>
                <p className="text-xs font-semibold text-muted-foreground mb-2">EQUIPOS ASIGNADOS ({getClientEquipment(selected.id).length})</p>
                <div className="space-y-1.5 max-h-40 overflow-y-auto">
                  {getClientEquipment(selected.id).length === 0 ? (
                    <p className="text-xs text-muted-foreground">Sin equipos asignados</p>
                  ) : getClientEquipment(selected.id).map(e => (
                    <div key={e.id} className="flex items-center justify-between text-xs p-2 rounded-lg bg-secondary/40">
                      <span className="font-medium">{e.brand} {e.model}</span>
                      <span className="text-muted-foreground font-mono">{e.serialNumber}</span>
                    </div>
                  ))}
                </div>
              </div>
              <Button variant="outline" className="w-full gap-2" onClick={() => { setSelected(null); openEdit(selected); }}>
                <Pencil className="h-4 w-4" /> Editar cliente
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* Create/Edit dialog */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editId ? 'Editar Cliente' : 'Nuevo Cliente'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-2">
            <div className="space-y-2">
              <Label>Nombre de empresa <span className="text-destructive">*</span></Label>
              <Input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="Ej: Embotelladora Mexicana" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label>Nombre de contacto</Label>
                <Input value={form.contactName} onChange={e => setForm(f => ({ ...f, contactName: e.target.value }))} placeholder="Juan Pérez" />
              </div>
              <div className="space-y-2">
                <Label>Teléfono</Label>
                <Input value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} placeholder="555-0000" />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Email</Label>
              <Input type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} placeholder="contacto@empresa.com" />
            </div>
            <div className="space-y-2">
              <Label>Dirección</Label>
              <Input value={form.address} onChange={e => setForm(f => ({ ...f, address: e.target.value }))} placeholder="Calle, Col., Ciudad" />
            </div>
            <div className="space-y-2">
              <Label>Tipo de contrato</Label>
              <Select value={form.contractType} onValueChange={v => setForm(f => ({ ...f, contractType: v as any }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="renta">Renta</SelectItem>
                  <SelectItem value="venta">Venta</SelectItem>
                  <SelectItem value="mixto">Mixto</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label>Inicio de contrato</Label>
                <Input type="date" value={form.contractStart} onChange={e => setForm(f => ({ ...f, contractStart: e.target.value }))} />
              </div>
              <div className="space-y-2">
                <Label>Fin de contrato</Label>
                <Input type="date" value={form.contractEnd} onChange={e => setForm(f => ({ ...f, contractEnd: e.target.value }))} />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Notas</Label>
              <Textarea value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} placeholder="Observaciones, condiciones especiales..." className="min-h-[80px]" />
            </div>
            <div className="flex gap-3 justify-end pt-2">
              <Button variant="outline" onClick={() => setOpen(false)}>Cancelar</Button>
              <Button onClick={handleSave} className="font-semibold">{editId ? 'Guardar' : 'Crear cliente'}</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ClientesPage;
