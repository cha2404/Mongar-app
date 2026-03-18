import { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RequestType, RequestPriority } from '@/lib/types';
import { toast } from '@/hooks/use-toast';
import { Printer, Monitor, Wrench, FileBox, PackagePlus, FileText, MapPin, Hash, Tag } from 'lucide-react';

const TYPE_OPTIONS: { value: RequestType; label: string; icon: typeof Printer; desc: string }[] = [
  { value: 'toner', label: 'Toner / Consumible', icon: Printer, desc: 'Toner, tinta, drum, fusores' },
  { value: 'servicio', label: 'Servicio Técnico', icon: Wrench, desc: 'Mantenimiento, reparación, atasco' },
  { value: 'equipo', label: 'Cambio de Equipo', icon: Monitor, desc: 'Sustitución o reemplazo de impresora' },
  { value: 'instalacion', label: 'Instalación', icon: PackagePlus, desc: 'Instalar y configurar equipo nuevo' },
  { value: 'papel', label: 'Papel / Suministros', icon: FileBox, desc: 'Papel bond, sobres, etiquetas' },
  { value: 'contrato', label: 'Consulta de Contrato', icon: FileText, desc: 'Renta, renovación, condiciones' },
];

const NewRequest = () => {
  const { user, createRequest, equipment } = useApp();
  const navigate = useNavigate();
  const [type, setType] = useState<RequestType>('toner');
  const [priority, setPriority] = useState<RequestPriority>('media');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [printerModel, setPrinterModel] = useState('');
  const [serialNumber, setSerialNumber] = useState('');
  const [location, setLocation] = useState('');
  const [contractType, setContractType] = useState<'renta' | 'venta' | 'servicio_externo'>('renta');

  if (!user) return null;

  const showEquipmentFields = ['toner', 'servicio', 'equipo', 'instalacion'].includes(type);

  // Pre-fill from equipment selection
  const handleEquipmentSelect = (eqId: string) => {
    const eq = equipment.find(e => e.id === eqId);
    if (!eq) return;
    setPrinterModel(`${eq.brand} ${eq.model}`);
    setSerialNumber(eq.serialNumber);
    setLocation(eq.location);
    setContractType(eq.contractType);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !description.trim()) return;
    createRequest({
      type, priority, title: title.trim(), description: description.trim(),
      createdBy: user.id,
      ...(showEquipmentFields && printerModel ? { printerModel, serialNumber, contractType } : {}),
      ...(location ? { location } : {}),
    });
    toast({ title: '✅ Solicitud creada', description: `Tu solicitud fue registrada exitosamente.` });
    navigate('/solicitudes');
  };

  const selectedType = TYPE_OPTIONS.find(t => t.value === type)!;

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold tracking-tight">Nueva Solicitud</h1>
        <p className="text-muted-foreground text-sm mt-1">Registra una solicitud de soporte o suministros</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Tipo de solicitud</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {TYPE_OPTIONS.map(t => (
              <button key={t.value} type="button" onClick={() => setType(t.value)}
                className={`flex flex-col gap-1.5 p-3 rounded-xl border text-left transition-all ${
                  type === t.value
                    ? 'border-primary bg-primary/5 ring-1 ring-primary'
                    : 'border-border hover:border-primary/30 hover:bg-secondary/50'
                }`}>
                <t.icon className={`h-5 w-5 ${type === t.value ? 'text-primary' : 'text-muted-foreground'}`} />
                <span className="text-xs font-semibold leading-tight">{t.label}</span>
                <span className="text-[10px] text-muted-foreground leading-tight">{t.desc}</span>
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      <form onSubmit={handleSubmit}>
        <Card>
          <CardContent className="pt-6 space-y-5">
            {/* Equipo existente */}
            {showEquipmentFields && equipment.length > 0 && (
              <div className="space-y-2">
                <Label className="flex items-center gap-1.5"><Printer className="h-3.5 w-3.5" />Seleccionar equipo registrado (opcional)</Label>
                <Select onValueChange={handleEquipmentSelect}>
                  <SelectTrigger><SelectValue placeholder="Elige un equipo para auto-completar..." /></SelectTrigger>
                  <SelectContent>
                    {equipment.map(eq => (
                      <SelectItem key={eq.id} value={eq.id}>
                        {eq.brand} {eq.model} — {eq.location}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Prioridad</Label>
                <Select value={priority} onValueChange={v => setPriority(v as RequestPriority)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="baja">🟢 Baja</SelectItem>
                    <SelectItem value="media">🟡 Media</SelectItem>
                    <SelectItem value="alta">🟠 Alta</SelectItem>
                    <SelectItem value="urgente">🔴 Urgente</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              {showEquipmentFields && (
                <div className="space-y-2">
                  <Label>Tipo de contrato</Label>
                  <Select value={contractType} onValueChange={v => setContractType(v as any)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="renta">Renta</SelectItem>
                      <SelectItem value="venta">Venta</SelectItem>
                      <SelectItem value="servicio_externo">Servicio externo</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label>Título <span className="text-destructive">*</span></Label>
              <Input value={title} onChange={e => setTitle(e.target.value)} placeholder="Describe brevemente tu solicitud" required />
            </div>

            <div className="space-y-2">
              <Label>Descripción <span className="text-destructive">*</span></Label>
              <Textarea value={description} onChange={e => setDescription(e.target.value)}
                placeholder="Incluye todos los detalles: síntomas, cuándo ocurre, urgencia, etc." className="min-h-[110px]" required />
            </div>

            {showEquipmentFields && (
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="flex items-center gap-1.5"><Tag className="h-3.5 w-3.5" />Modelo de impresora</Label>
                  <Input value={printerModel} onChange={e => setPrinterModel(e.target.value)} placeholder="Ej: HP LaserJet Pro M404n" />
                </div>
                <div className="space-y-2">
                  <Label className="flex items-center gap-1.5"><Hash className="h-3.5 w-3.5" />Número de serie</Label>
                  <Input value={serialNumber} onChange={e => setSerialNumber(e.target.value)} placeholder="Ej: VNB3K12345" />
                </div>
              </div>
            )}

            <div className="space-y-2">
              <Label className="flex items-center gap-1.5"><MapPin className="h-3.5 w-3.5" />Ubicación</Label>
              <Input value={location} onChange={e => setLocation(e.target.value)} placeholder="Ej: Contabilidad - Piso 2" />
            </div>

            <div className="flex gap-3 justify-end pt-2">
              <Button type="button" variant="outline" onClick={() => navigate(-1)}>Cancelar</Button>
              <Button type="submit" className="font-semibold px-6">Crear Solicitud</Button>
            </div>
          </CardContent>
        </Card>
      </form>
    </div>
  );
};

export default NewRequest;
