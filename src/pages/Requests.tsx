import { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Link } from 'react-router-dom';
import { Printer, Monitor, Wrench, FileText, Search, Trash2, FileBox, PackagePlus, MapPin, ArrowUpDown } from 'lucide-react';

const statusColor: Record<string, string> = {
  pendiente: 'bg-warning text-warning-foreground',
  en_proceso: 'bg-primary text-primary-foreground',
  completada: 'bg-success text-success-foreground',
  cancelada: 'bg-destructive text-destructive-foreground',
};

const priorityColor: Record<string, string> = {
  baja: 'border-muted-foreground/30 text-muted-foreground',
  media: 'border-primary/30 text-primary',
  alta: 'border-warning/30 text-warning',
  urgente: 'border-destructive/30 text-destructive',
};

const priorityOrder: Record<string, number> = { urgente: 0, alta: 1, media: 2, baja: 3 };

const typeIcon: Record<string, typeof Printer> = {
  toner: Printer, equipo: Monitor, servicio: Wrench,
  instalacion: PackagePlus, papel: FileBox, contrato: FileText,
};

const Requests = () => {
  const { user, requests, users, deleteRequest } = useApp();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [sortBy, setSortBy] = useState<'date' | 'priority' | 'folio'>('date');

  if (!user) return null;

  let visible = user.role === 'usuario' ? requests.filter(r => r.createdBy === user.id) : requests;

  if (search) visible = visible.filter(r =>
    r.title.toLowerCase().includes(search.toLowerCase()) ||
    r.folio.toLowerCase().includes(search.toLowerCase()) ||
    (r.printerModel || '').toLowerCase().includes(search.toLowerCase()) ||
    (r.location || '').toLowerCase().includes(search.toLowerCase())
  );
  if (statusFilter !== 'all') visible = visible.filter(r => r.status === statusFilter);
  if (typeFilter !== 'all') visible = visible.filter(r => r.type === typeFilter);
  if (priorityFilter !== 'all') visible = visible.filter(r => r.priority === priorityFilter);

  if (sortBy === 'priority') visible = [...visible].sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]);
  else if (sortBy === 'folio') visible = [...visible].sort((a, b) => b.folio.localeCompare(a.folio));
  else visible = [...visible].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight">Solicitudes</h1>
          <p className="text-sm text-muted-foreground mt-0.5">{visible.length} resultado{visible.length !== 1 ? 's' : ''}</p>
        </div>
        <Link to="/nueva"><Button className="font-semibold gap-1">+ Nueva</Button></Link>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Buscar folio, título, modelo, ubicación..." value={search}
            onChange={e => setSearch(e.target.value)} className="pl-9" />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[140px]"><SelectValue placeholder="Estado" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todo estado</SelectItem>
            <SelectItem value="pendiente">⏳ Pendiente</SelectItem>
            <SelectItem value="en_proceso">🔄 En Proceso</SelectItem>
            <SelectItem value="completada">✅ Completada</SelectItem>
            <SelectItem value="cancelada">❌ Cancelada</SelectItem>
          </SelectContent>
        </Select>
        <Select value={typeFilter} onValueChange={setTypeFilter}>
          <SelectTrigger className="w-[140px]"><SelectValue placeholder="Tipo" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todo tipo</SelectItem>
            <SelectItem value="toner">🖨️ Toner</SelectItem>
            <SelectItem value="servicio">🔧 Servicio</SelectItem>
            <SelectItem value="equipo">🖥️ Equipo</SelectItem>
            <SelectItem value="instalacion">📦 Instalación</SelectItem>
            <SelectItem value="papel">📄 Papel</SelectItem>
            <SelectItem value="contrato">📋 Contrato</SelectItem>
          </SelectContent>
        </Select>
        <Select value={priorityFilter} onValueChange={setPriorityFilter}>
          <SelectTrigger className="w-[130px]"><SelectValue placeholder="Prioridad" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Toda prioridad</SelectItem>
            <SelectItem value="urgente">🔴 Urgente</SelectItem>
            <SelectItem value="alta">🟠 Alta</SelectItem>
            <SelectItem value="media">🟡 Media</SelectItem>
            <SelectItem value="baja">🟢 Baja</SelectItem>
          </SelectContent>
        </Select>
        <Select value={sortBy} onValueChange={v => setSortBy(v as any)}>
          <SelectTrigger className="w-[130px]">
            <ArrowUpDown className="h-3.5 w-3.5 mr-1.5" /><SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="date">Más reciente</SelectItem>
            <SelectItem value="priority">Prioridad</SelectItem>
            <SelectItem value="folio">Folio</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* List */}
      <div className="space-y-2.5">
        {visible.length === 0 ? (
          <Card><CardContent className="py-14 text-center text-muted-foreground text-sm">
            No se encontraron solicitudes
          </CardContent></Card>
        ) : visible.map(r => {
          const Icon = typeIcon[r.type] || FileText;
          const creator = users.find(u => u.id === r.createdBy);
          const assigned = users.find(u => u.id === r.assignedTo);
          return (
            <Link key={r.id} to={`/solicitudes/${r.id}`} className="block">
              <Card className="hover:shadow-md transition-all hover:border-primary/20">
                <CardContent className="p-4 flex items-center gap-4">
                  <div className="h-11 w-11 rounded-xl bg-secondary flex items-center justify-center shrink-0">
                    <Icon className="h-5 w-5 text-muted-foreground" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs font-mono text-muted-foreground">{r.folio}</span>
                      <p className="font-semibold text-sm truncate">{r.title}</p>
                    </div>
                    <div className="flex items-center gap-3 mt-0.5 flex-wrap">
                      <span className="text-xs text-muted-foreground">{creator?.name} · {new Date(r.createdAt).toLocaleDateString('es-MX')}</span>
                      {assigned && <span className="text-xs text-muted-foreground">→ {assigned.name}</span>}
                      {r.location && <span className="text-xs text-muted-foreground flex items-center gap-0.5"><MapPin className="h-3 w-3" />{r.location}</span>}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <Badge variant="outline" className={`${priorityColor[r.priority]} text-[10px]`}>{r.priority}</Badge>
                    <Badge className={`${statusColor[r.status]} border-0 text-[10px]`}>{r.status.replace('_', ' ')}</Badge>
                    {user.role === 'admin' && (
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive"
                        onClick={e => { e.preventDefault(); deleteRequest(r.id); }}>
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            </Link>
          );
        })}
      </div>
    </div>
  );
};

export default Requests;
