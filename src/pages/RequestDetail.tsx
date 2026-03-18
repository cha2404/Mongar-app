import { useParams, useNavigate } from 'react-router-dom';
import { useApp } from '@/context/AppContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { useState } from 'react';
import { ArrowLeft, MessageSquare, MapPin, Tag, Hash, FileText, Lock } from 'lucide-react';

const statusColor: Record<string, string> = {
  pendiente: 'bg-warning text-warning-foreground',
  en_proceso: 'bg-primary text-primary-foreground',
  completada: 'bg-success text-success-foreground',
  cancelada: 'bg-destructive text-destructive-foreground',
};

const priorityColor: Record<string, string> = {
  baja: 'border-muted-foreground/40 text-muted-foreground',
  media: 'border-primary/40 text-primary',
  alta: 'border-warning/40 text-warning',
  urgente: 'border-destructive/40 text-destructive',
};

const typeLabel: Record<string, string> = {
  toner: '🖨️ Toner / Consumible',
  servicio: '🔧 Servicio Técnico',
  equipo: '🖥️ Cambio de Equipo',
  instalacion: '📦 Instalación',
  papel: '📄 Papel / Suministros',
  contrato: '📋 Contrato',
};

const RequestDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, requests, users, updateRequestStatus, assignRequest, addNote } = useApp();
  const [noteText, setNoteText] = useState('');
  const [isInternal, setIsInternal] = useState(false);

  const req = requests.find(r => r.id === id);
  if (!user || !req) return (
    <div className="text-center py-20">
      <p className="text-muted-foreground">Solicitud no encontrada</p>
      <Button variant="link" onClick={() => navigate('/solicitudes')}>Volver</Button>
    </div>
  );

  const creator = users.find(u => u.id === req.createdBy);
  const assigned = users.find(u => u.id === req.assignedTo);
  const technicians = users.filter(u => u.role === 'tecnico' && u.active);
  const canManage = user.role === 'admin' || user.role === 'tecnico';

  const visibleNotes = req.notes.filter(n => canManage || !n.isInternal);

  const handleAddNote = () => {
    if (!noteText.trim()) return;
    addNote(req.id, noteText.trim(), isInternal);
    setNoteText('');
    setIsInternal(false);
  };

  return (
    <div className="max-w-3xl mx-auto space-y-5">
      <Button variant="ghost" onClick={() => navigate(-1)} className="gap-2 -ml-2">
        <ArrowLeft className="h-4 w-4" /> Volver
      </Button>

      {/* Header card */}
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div className="space-y-1">
              <p className="text-xs font-bold text-muted-foreground tracking-widest">{req.folio}</p>
              <CardTitle className="text-xl leading-tight">{req.title}</CardTitle>
              <p className="text-sm text-muted-foreground">
                Creada por <strong>{creator?.name}</strong> · {new Date(req.createdAt).toLocaleString('es-MX')}
              </p>
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              <Badge variant="outline" className={`${priorityColor[req.priority]} font-semibold`}>{req.priority}</Badge>
              <Badge className={`${statusColor[req.status]} border-0`}>{req.status.replace('_', ' ')}</Badge>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-5">
          {/* Info grid */}
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div className="flex items-center gap-2">
              <FileText className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
              <span className="text-muted-foreground">Tipo:</span>
              <span className="font-medium">{typeLabel[req.type]}</span>
            </div>
            <div className="flex items-center gap-2">
              <FileText className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
              <span className="text-muted-foreground">Contrato:</span>
              <span className="font-medium capitalize">{req.contractType || '—'}</span>
            </div>
            {req.printerModel && (
              <div className="flex items-center gap-2">
                <Tag className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                <span className="text-muted-foreground">Modelo:</span>
                <span className="font-medium">{req.printerModel}</span>
              </div>
            )}
            {req.serialNumber && (
              <div className="flex items-center gap-2">
                <Hash className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                <span className="text-muted-foreground">Serie:</span>
                <span className="font-medium font-mono text-xs">{req.serialNumber}</span>
              </div>
            )}
            {req.location && (
              <div className="flex items-center gap-2 col-span-2">
                <MapPin className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                <span className="text-muted-foreground">Ubicación:</span>
                <span className="font-medium">{req.location}</span>
              </div>
            )}
            <div className="flex items-center gap-2">
              <span className="text-muted-foreground">Asignado a:</span>
              <span className="font-medium">{assigned?.name || 'Sin asignar'}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-muted-foreground">Actualizado:</span>
              <span className="font-medium">{new Date(req.updatedAt).toLocaleDateString('es-MX')}</span>
            </div>
          </div>

          {/* Description */}
          <div>
            <h3 className="text-sm font-semibold mb-2">Descripción</h3>
            <p className="text-sm text-muted-foreground bg-secondary/50 p-4 rounded-xl leading-relaxed">{req.description}</p>
          </div>

          {/* Management controls */}
          {canManage && (
            <div className="flex flex-wrap gap-3 p-4 rounded-xl bg-secondary/30 border border-border">
              <div className="space-y-1 w-full">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Gestionar solicitud</p>
              </div>
              <Select onValueChange={v => updateRequestStatus(req.id, v as any)} value={req.status}>
                <SelectTrigger className="w-[170px]"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="pendiente">⏳ Pendiente</SelectItem>
                  <SelectItem value="en_proceso">🔄 En Proceso</SelectItem>
                  <SelectItem value="completada">✅ Completada</SelectItem>
                  <SelectItem value="cancelada">❌ Cancelada</SelectItem>
                </SelectContent>
              </Select>
              {user.role === 'admin' && (
                <Select onValueChange={v => assignRequest(req.id, v)} value={req.assignedTo || ''}>
                  <SelectTrigger className="w-[190px]"><SelectValue placeholder="Asignar técnico..." /></SelectTrigger>
                  <SelectContent>
                    {technicians.map(t => <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Notes */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <MessageSquare className="h-4 w-4" /> Notas ({visibleNotes.length})
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {visibleNotes.length === 0 && (
            <p className="text-sm text-muted-foreground text-center py-4">Sin notas aún</p>
          )}
          {visibleNotes.map(n => {
            const author = users.find(u => u.id === n.createdBy);
            return (
              <div key={n.id} className={`p-3.5 rounded-xl border ${n.isInternal ? 'border-dashed border-warning/40 bg-warning/5' : 'border-border bg-secondary/30'}`}>
                {n.isInternal && (
                  <div className="flex items-center gap-1 mb-2">
                    <Lock className="h-3 w-3 text-warning" />
                    <span className="text-[10px] text-warning font-semibold uppercase tracking-wider">Nota interna</span>
                  </div>
                )}
                <p className="text-sm leading-relaxed">{n.text}</p>
                <p className="text-xs text-muted-foreground mt-2 font-medium">
                  {author?.name} · {new Date(n.createdAt).toLocaleString('es-MX')}
                </p>
              </div>
            );
          })}

          {canManage && (
            <div className="space-y-3 pt-2 border-t border-border">
              <Textarea placeholder="Escribe una nota..." value={noteText}
                onChange={e => setNoteText(e.target.value)} className="min-h-[80px] resize-none" />
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Switch id="internal" checked={isInternal} onCheckedChange={setIsInternal} />
                  <Label htmlFor="internal" className="text-sm cursor-pointer flex items-center gap-1.5">
                    <Lock className="h-3.5 w-3.5" /> Nota interna
                  </Label>
                </div>
                <Button onClick={handleAddNote} disabled={!noteText.trim()} size="sm">Agregar nota</Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default RequestDetail;
