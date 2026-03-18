import { useApp } from '@/context/AppContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { FileText, Clock, CheckCircle, AlertTriangle, Printer, Monitor, Wrench, PackagePlus, FileBox, TrendingUp, Zap } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Progress } from '@/components/ui/progress';

const statusColor: Record<string, string> = {
  pendiente: 'bg-warning text-warning-foreground',
  en_proceso: 'bg-primary text-primary-foreground',
  completada: 'bg-success text-success-foreground',
  cancelada: 'bg-destructive text-destructive-foreground',
};

const typeIcon: Record<string, { icon: typeof Printer; label: string }> = {
  toner: { icon: Printer, label: 'Toner' },
  equipo: { icon: Monitor, label: 'Equipo' },
  servicio: { icon: Wrench, label: 'Servicio' },
  instalacion: { icon: PackagePlus, label: 'Instalación' },
  papel: { icon: FileBox, label: 'Papel' },
  contrato: { icon: FileText, label: 'Contrato' },
};

const priorityColor: Record<string, string> = {
  baja: 'text-muted-foreground', media: 'text-primary', alta: 'text-warning', urgente: 'text-destructive',
};

const Dashboard = () => {
  const { user, requests, users, equipment } = useApp();
  if (!user) return null;

  const visible = user.role === 'usuario' ? requests.filter(r => r.createdBy === user.id) : requests;

  const stats = [
    { label: 'Total', value: visible.length, icon: FileText, color: 'text-primary', bg: 'bg-primary/10' },
    { label: 'Pendientes', value: visible.filter(r => r.status === 'pendiente').length, icon: Clock, color: 'text-warning', bg: 'bg-warning/10' },
    { label: 'En Proceso', value: visible.filter(r => r.status === 'en_proceso').length, icon: TrendingUp, color: 'text-blue-500', bg: 'bg-blue-500/10' },
    { label: 'Completadas', value: visible.filter(r => r.status === 'completada').length, icon: CheckCircle, color: 'text-success', bg: 'bg-success/10' },
  ];

  const urgent = visible.filter(r => r.priority === 'urgente' && r.status === 'pendiente');
  const recent = visible.slice(0, 5);

  // Equipment status for admin/tecnico
  const lowToner = equipment.filter(e => (e.tonerLevel ?? 100) < 20 && e.status === 'activo');

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold tracking-tight">Bienvenido, {user.name}</h1>
        <p className="text-muted-foreground text-sm mt-1">{new Date().toLocaleDateString('es-MX', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
      </div>

      {/* Urgent alert */}
      {urgent.length > 0 && (
        <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-3 p-4 rounded-xl bg-destructive/10 border border-destructive/20">
          <Zap className="h-5 w-5 text-destructive shrink-0" />
          <div className="flex-1">
            <p className="text-sm font-bold text-destructive">{urgent.length} solicitud{urgent.length > 1 ? 'es' : ''} urgente{urgent.length > 1 ? 's' : ''} pendiente{urgent.length > 1 ? 's' : ''}</p>
            <p className="text-xs text-destructive/70">{urgent.map(r => r.folio).join(', ')}</p>
          </div>
          <Link to="/solicitudes"><Button size="sm" variant="destructive">Ver</Button></Link>
        </motion.div>
      )}

      {/* Low toner alert for admin/tecnico */}
      {(user.role === 'admin' || user.role === 'tecnico') && lowToner.length > 0 && (
        <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}
          className="flex items-center gap-3 p-4 rounded-xl bg-warning/10 border border-warning/20">
          <Printer className="h-5 w-5 text-warning shrink-0" />
          <p className="text-sm font-semibold text-warning flex-1">
            {lowToner.length} equipo{lowToner.length > 1 ? 's' : ''} con toner bajo (&lt;20%): {lowToner.map(e => `${e.brand} ${e.model}`).join(', ')}
          </p>
          <Link to="/equipos"><Button size="sm" variant="outline" className="border-warning/40 text-warning">Ver equipos</Button></Link>
        </motion.div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((s, i) => (
          <motion.div key={s.label} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.07 }}>
            <Card>
              <CardContent className="p-5">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wider">{s.label}</p>
                    <p className="text-3xl font-extrabold mt-1">{s.value}</p>
                  </div>
                  <div className={`h-11 w-11 rounded-xl ${s.bg} flex items-center justify-center`}>
                    <s.icon className={`h-5 w-5 ${s.color}`} />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Recent requests */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader className="flex-row items-center justify-between">
              <CardTitle className="text-base">Solicitudes Recientes</CardTitle>
              <Link to="/solicitudes" className="text-xs text-primary font-semibold hover:underline">Ver todas</Link>
            </CardHeader>
            <CardContent className="p-0">
              {recent.length === 0 ? (
                <p className="text-muted-foreground text-sm py-10 text-center">No hay solicitudes aún</p>
              ) : (
                <div>
                  {recent.map((r, i) => {
                    const ti = typeIcon[r.type] || { icon: FileText, label: r.type };
                    const creator = users.find(u => u.id === r.createdBy);
                    return (
                      <Link key={r.id} to={`/solicitudes/${r.id}`}
                        className={`flex items-center gap-4 px-5 py-3.5 hover:bg-secondary/40 transition-colors ${i < recent.length - 1 ? 'border-b border-border' : ''}`}>
                        <div className="h-9 w-9 rounded-lg bg-secondary flex items-center justify-center shrink-0">
                          <ti.icon className="h-4 w-4 text-muted-foreground" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <p className="text-sm font-semibold truncate">{r.title}</p>
                          </div>
                          <p className="text-xs text-muted-foreground">{r.folio} · {creator?.name} · {new Date(r.createdAt).toLocaleDateString('es-MX')}</p>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          <span className={`text-xs font-bold ${priorityColor[r.priority]}`}>{r.priority}</span>
                          <Badge className={`${statusColor[r.status]} text-[10px] border-0`}>{r.status.replace('_', ' ')}</Badge>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Equipment status (admin/tecnico) */}
        {(user.role === 'admin' || user.role === 'tecnico') && (
          <div>
            <Card>
              <CardHeader className="flex-row items-center justify-between">
                <CardTitle className="text-base">Estado de Equipos</CardTitle>
                <Link to="/equipos" className="text-xs text-primary font-semibold hover:underline">Ver todos</Link>
              </CardHeader>
              <CardContent className="space-y-4">
                {equipment.slice(0, 4).map(eq => (
                  <div key={eq.id} className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs font-semibold truncate">{eq.brand} {eq.model}</p>
                        <p className="text-[10px] text-muted-foreground">{eq.location}</p>
                      </div>
                      <Badge variant="outline" className={`text-[10px] shrink-0 ml-2 ${
                        eq.status === 'activo' ? 'border-success/40 text-success' :
                        eq.status === 'en_mantenimiento' ? 'border-warning/40 text-warning' :
                        'border-muted-foreground/30 text-muted-foreground'
                      }`}>{eq.status.replace('_', ' ')}</Badge>
                    </div>
                    {eq.tonerLevel !== undefined && (
                      <div className="flex items-center gap-2">
                        <Progress value={eq.tonerLevel} className="h-1.5 flex-1" />
                        <span className={`text-[10px] font-bold w-8 text-right ${eq.tonerLevel < 20 ? 'text-destructive' : eq.tonerLevel < 40 ? 'text-warning' : 'text-muted-foreground'}`}>
                          {eq.tonerLevel}%
                        </span>
                      </div>
                    )}
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
