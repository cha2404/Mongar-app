import { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Switch } from '@/components/ui/switch';
import { Navigate } from 'react-router-dom';
import { UserPlus, Pencil, Phone, Building2 } from 'lucide-react';
import { UserRole } from '@/lib/types';
import { toast } from '@/hooks/use-toast';

const roleBadge: Record<string, { label: string; cls: string }> = {
  admin: { label: '👑 Admin', cls: 'bg-primary text-primary-foreground' },
  tecnico: { label: '🔧 Técnico', cls: 'bg-accent text-accent-foreground' },
  usuario: { label: '👤 Usuario', cls: 'bg-secondary text-secondary-foreground' },
};

interface UserForm { name: string; email: string; password: string; role: UserRole; department: string; phone: string; }
const emptyForm = (): UserForm => ({ name: '', email: '', password: '', role: 'usuario', department: '', phone: '' });

const UsersPage = () => {
  const { user, users, createUser, updateUser, toggleUserActive } = useApp();
  const [open, setOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState<UserForm>(emptyForm());
  const [search, setSearch] = useState('');

  if (!user || user.role !== 'admin') return <Navigate to="/" replace />;

  const filtered = users.filter(u =>
    u.name.toLowerCase().includes(search.toLowerCase()) ||
    u.email.toLowerCase().includes(search.toLowerCase()) ||
    (u.department || '').toLowerCase().includes(search.toLowerCase())
  );

  const openCreate = () => { setEditId(null); setForm(emptyForm()); setOpen(true); };
  const openEdit = (u: typeof users[0]) => {
    setEditId(u.id);
    setForm({ name: u.name, email: u.email, password: '', role: u.role, department: u.department || '', phone: u.phone || '' });
    setOpen(true);
  };

  const handleSave = () => {
    if (!form.name.trim() || !form.email.trim()) return;
    if (editId) {
      const updates: any = { name: form.name, email: form.email, role: form.role, department: form.department, phone: form.phone };
      if (form.password) updates.password = form.password;
      updateUser(editId, updates);
      toast({ title: '✅ Usuario actualizado' });
    } else {
      if (!form.password) return;
      createUser({ name: form.name, email: form.email, password: form.password, role: form.role, department: form.department, phone: form.phone, active: true });
      toast({ title: '✅ Usuario creado' });
    }
    setOpen(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight">Gestión de Usuarios</h1>
          <p className="text-sm text-muted-foreground mt-0.5">{users.length} usuarios registrados</p>
        </div>
        <Button onClick={openCreate} className="gap-2 font-semibold">
          <UserPlus className="h-4 w-4" /> Nuevo Usuario
        </Button>
      </div>

      <div className="flex gap-3">
        <Input placeholder="Buscar por nombre, email o departamento..." value={search}
          onChange={e => setSearch(e.target.value)} className="max-w-xs" />
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Usuario</TableHead>
                <TableHead>Departamento</TableHead>
                <TableHead>Teléfono</TableHead>
                <TableHead>Rol</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead className="w-20">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map(u => {
                const rb = roleBadge[u.role];
                return (
                  <TableRow key={u.id} className={!u.active ? 'opacity-50' : ''}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center text-sm font-bold text-primary shrink-0">
                          {u.name[0]}
                        </div>
                        <div>
                          <p className="font-semibold text-sm">{u.name}</p>
                          <p className="text-xs text-muted-foreground">{u.email}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="flex items-center gap-1.5 text-sm">
                        <Building2 className="h-3.5 w-3.5 text-muted-foreground" />
                        {u.department || '—'}
                      </span>
                    </TableCell>
                    <TableCell>
                      <span className="flex items-center gap-1.5 text-sm">
                        <Phone className="h-3.5 w-3.5 text-muted-foreground" />
                        {u.phone || '—'}
                      </span>
                    </TableCell>
                    <TableCell>
                      <Badge className={`${rb.cls} border-0 text-xs`}>{rb.label}</Badge>
                    </TableCell>
                    <TableCell>
                      <Switch checked={u.active} onCheckedChange={() => toggleUserActive(u.id)}
                        disabled={u.id === user.id} />
                    </TableCell>
                    <TableCell>
                      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEdit(u)}>
                        <Pencil className="h-3.5 w-3.5" />
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{editId ? 'Editar Usuario' : 'Nuevo Usuario'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-2">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2 col-span-2">
                <Label>Nombre completo</Label>
                <Input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="Ej: Juan Pérez" />
              </div>
              <div className="space-y-2 col-span-2">
                <Label>Email</Label>
                <Input type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} placeholder="usuario@empresa.com" />
              </div>
              <div className="space-y-2 col-span-2">
                <Label>{editId ? 'Nueva contraseña (dejar vacío para no cambiar)' : 'Contraseña'}</Label>
                <Input type="password" value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))} placeholder="••••••••" />
              </div>
              <div className="space-y-2">
                <Label>Rol</Label>
                <Select value={form.role} onValueChange={v => setForm(f => ({ ...f, role: v as UserRole }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="usuario">👤 Usuario</SelectItem>
                    <SelectItem value="tecnico">🔧 Técnico</SelectItem>
                    <SelectItem value="admin">👑 Admin</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Teléfono</Label>
                <Input value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} placeholder="555-0000" />
              </div>
              <div className="space-y-2 col-span-2">
                <Label>Departamento</Label>
                <Input value={form.department} onChange={e => setForm(f => ({ ...f, department: e.target.value }))} placeholder="Ej: Contabilidad" />
              </div>
            </div>
            <div className="flex gap-3 justify-end pt-2">
              <Button variant="outline" onClick={() => setOpen(false)}>Cancelar</Button>
              <Button onClick={handleSave} className="font-semibold">
                {editId ? 'Guardar cambios' : 'Crear usuario'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default UsersPage;
