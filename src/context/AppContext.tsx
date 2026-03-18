import React, { createContext, useContext, useState, useCallback, useEffect, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { User, ServiceRequest, Notification, Equipment, RequestNote } from '@/lib/types';

interface AppContextType {
  user: User | null;
  users: User[];
  requests: ServiceRequest[];
  notifications: Notification[];
  equipment: Equipment[];
  loading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
  createRequest: (req: Omit<ServiceRequest, 'id' | 'folio' | 'createdAt' | 'updatedAt' | 'notes' | 'status'>) => Promise<void>;
  updateRequestStatus: (id: string, status: ServiceRequest['status']) => Promise<void>;
  assignRequest: (id: string, techId: string) => Promise<void>;
  addNote: (requestId: string, text: string, isInternal?: boolean) => Promise<void>;
  deleteRequest: (id: string) => Promise<void>;
  markNotificationRead: (id: string) => Promise<void>;
  markAllNotificationsRead: () => Promise<void>;
  unreadCount: number;
  createUser: (data: Omit<User, 'id'> & { password: string }) => Promise<void>;
  updateUser: (id: string, updates: Partial<User & { password?: string }>) => Promise<void>;
  toggleUserActive: (id: string) => Promise<void>;
  updateEquipment: (id: string, updates: Partial<Equipment>) => Promise<void>;
}

const AppContext = createContext<AppContextType | null>(null);

export const useApp = () => {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
};

// ── helpers to map DB rows → app types ──────────────────────────────────────
function mapProfile(row: any): User {
  return {
    id: row.id,
    email: row.email ?? '',
    name: row.name,
    role: row.role,
    department: row.department ?? undefined,
    phone: row.phone ?? undefined,
    active: row.active ?? true,
  };
}

function mapRequest(row: any, notes: RequestNote[] = []): ServiceRequest {
  return {
    id: row.id,
    folio: row.folio,
    type: row.type,
    title: row.title,
    description: row.description,
    status: row.status,
    priority: row.priority,
    createdBy: row.created_by,
    assignedTo: row.assigned_to ?? undefined,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    notes,
    printerModel: row.printer_model ?? undefined,
    serialNumber: row.serial_number ?? undefined,
    location: row.location ?? undefined,
    contractType: row.contract_type ?? undefined,
  };
}

function mapNote(row: any): RequestNote {
  return {
    id: row.id,
    text: row.text,
    createdBy: row.created_by,
    createdAt: row.created_at,
    isInternal: row.is_internal ?? false,
  };
}

function mapNotification(row: any): Notification {
  return {
    id: row.id,
    userId: row.user_id,
    title: row.title,
    message: row.message,
    type: row.type ?? 'info',
    read: row.read ?? false,
    createdAt: row.created_at,
    requestId: row.request_id ?? undefined,
  };
}

function mapEquipment(row: any): Equipment {
  return {
    id: row.id,
    brand: row.brand,
    model: row.model,
    type: row.type,
    contractType: row.contract_type,
    serialNumber: row.serial_number,
    location: row.location,
    assignedTo: row.assigned_to ?? '',
    status: row.status,
    installDate: row.install_date ?? '',
    lastService: row.last_service ?? undefined,
    tonerLevel: row.toner_level ?? undefined,
    pageCount: row.page_count ?? 0,
  };
}

// ── Provider ──────────────────────────────────────────────────────────────────
export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [requests, setRequests] = useState<ServiceRequest[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [equipment, setEquipment] = useState<Equipment[]>([]);
  const [loading, setLoading] = useState(true);
  const channelsRef = useRef<any[]>([]);

  // ── Load data ──────────────────────────────────────────────────────────────
  const loadProfiles = useCallback(async () => {
    const { data } = await supabase.from('profiles').select('*').order('name');
    if (data) setUsers(data.map(mapProfile));
  }, []);

  const loadRequests = useCallback(async () => {
    const { data: reqs } = await supabase
      .from('requests')
      .select('*')
      .order('created_at', { ascending: false });
    const { data: notes } = await supabase
      .from('request_notes')
      .select('*')
      .order('created_at', { ascending: true });
    if (reqs) {
      const notesByReq: Record<string, RequestNote[]> = {};
      (notes ?? []).forEach(n => {
        if (!notesByReq[n.request_id]) notesByReq[n.request_id] = [];
        notesByReq[n.request_id].push(mapNote(n));
      });
      setRequests(reqs.map(r => mapRequest(r, notesByReq[r.id] ?? [])));
    }
  }, []);

  const loadNotifications = useCallback(async (uid: string) => {
    const { data } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', uid)
      .order('created_at', { ascending: false });
    if (data) setNotifications(data.map(mapNotification));
  }, []);

  const loadEquipment = useCallback(async () => {
    const { data } = await supabase.from('equipment').select('*').order('brand');
    if (data) setEquipment(data.map(mapEquipment));
  }, []);

  // ── Realtime subscriptions ─────────────────────────────────────────────────
  const setupRealtime = useCallback((uid: string) => {
    // Clean previous
    channelsRef.current.forEach(c => supabase.removeChannel(c));
    channelsRef.current = [];

    const reqChannel = supabase
      .channel('requests-realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'requests' }, () => loadRequests())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'request_notes' }, () => loadRequests())
      .subscribe();

    const notifChannel = supabase
      .channel('notifications-realtime')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'notifications', filter: `user_id=eq.${uid}` },
        payload => setNotifications(prev => [mapNotification(payload.new), ...prev]))
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'notifications', filter: `user_id=eq.${uid}` },
        payload => setNotifications(prev => prev.map(n => n.id === payload.new.id ? mapNotification(payload.new) : n)))
      .subscribe();

    const eqChannel = supabase
      .channel('equipment-realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'equipment' }, () => loadEquipment())
      .subscribe();

    channelsRef.current = [reqChannel, notifChannel, eqChannel];
  }, [loadRequests, loadEquipment]);

  // ── Auth init ──────────────────────────────────────────────────────────────
  useEffect(() => {
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (session?.user) {
        await initUser(session.user.id, session.user.email ?? '');
      }
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' && session?.user) {
        await initUser(session.user.id, session.user.email ?? '');
      } else if (event === 'SIGNED_OUT') {
        setUser(null);
        setNotifications([]);
        channelsRef.current.forEach(c => supabase.removeChannel(c));
        channelsRef.current = [];
      }
    });
    return () => subscription.unsubscribe();
  }, []);

  const initUser = async (uid: string, email: string) => {
    const { data: profile } = await supabase.from('profiles').select('*').eq('id', uid).single();
    if (profile) {
      setUser(mapProfile({ ...profile, email }));
      await Promise.all([loadProfiles(), loadRequests(), loadNotifications(uid), loadEquipment()]);
      setupRealtime(uid);
    }
  };

  // ── Auth actions ───────────────────────────────────────────────────────────
  const login = useCallback(async (email: string, password: string): Promise<boolean> => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    return !error;
  }, []);

  const logout = useCallback(async () => {
    await supabase.auth.signOut();
  }, []);

  // ── Push notification helper ───────────────────────────────────────────────
  const pushNotif = useCallback(async (userId: string, title: string, message: string, type: Notification['type'], requestId?: string) => {
    await supabase.from('notifications').insert({
      user_id: userId, title, message, type,
      request_id: requestId ?? null,
    });
  }, []);

  // ── Request actions ────────────────────────────────────────────────────────
  const createRequest = useCallback(async (req: Omit<ServiceRequest, 'id' | 'folio' | 'createdAt' | 'updatedAt' | 'notes' | 'status'>) => {
    const { data, error } = await supabase.from('requests').insert({
      folio: '',
      type: req.type,
      title: req.title,
      description: req.description,
      priority: req.priority,
      created_by: req.createdBy,
      printer_model: req.printerModel ?? null,
      serial_number: req.serialNumber ?? null,
      location: req.location ?? null,
      contract_type: req.contractType ?? null,
    }).select().single();

    if (!error && data) {
      // Notify all admins and tecnicos
      const adminsTechs = users.filter(u => u.role !== 'usuario' && u.active);
      await Promise.all(adminsTechs.map(u =>
        pushNotif(u.id,
          req.priority === 'urgente' ? '🔴 Solicitud urgente' : 'Nueva solicitud',
          `${data.folio}: ${req.title}`,
          req.priority === 'urgente' ? 'warning' : 'info',
          data.id
        )
      ));
    }
  }, [users, pushNotif]);

  const updateRequestStatus = useCallback(async (id: string, status: ServiceRequest['status']) => {
    await supabase.from('requests').update({ status }).eq('id', id);
    const req = requests.find(r => r.id === id);
    if (req) {
      const msg = status === 'completada' ? `Tu solicitud ${req.folio} fue completada ✅`
        : status === 'cancelada' ? `Tu solicitud ${req.folio} fue cancelada`
        : `Tu solicitud ${req.folio} cambió a ${status.replace('_', ' ')}`;
      const type: Notification['type'] = status === 'completada' ? 'success' : status === 'cancelada' ? 'error' : 'info';
      await pushNotif(req.createdBy, `Solicitud ${status.replace('_', ' ')}`, msg, type, id);
    }
  }, [requests, pushNotif]);

  const assignRequest = useCallback(async (id: string, techId: string) => {
    await supabase.from('requests').update({ assigned_to: techId, status: 'en_proceso' }).eq('id', id);
    const req = requests.find(r => r.id === id);
    const tech = users.find(u => u.id === techId);
    if (req && tech) {
      await pushNotif(req.createdBy, 'Técnico asignado', `${tech.name} fue asignado a tu solicitud ${req.folio}`, 'info', id);
      await pushNotif(techId, 'Solicitud asignada', `Se te asignó ${req.folio}: ${req.title}`, 'info', id);
    }
  }, [requests, users, pushNotif]);

  const addNote = useCallback(async (requestId: string, text: string, isInternal = false) => {
    if (!user) return;
    await supabase.from('request_notes').insert({
      request_id: requestId,
      text,
      created_by: user.id,
      is_internal: isInternal,
    });
    if (!isInternal) {
      const req = requests.find(r => r.id === requestId);
      if (req && req.createdBy !== user.id) {
        await pushNotif(req.createdBy, 'Nueva nota en tu solicitud', `${user.name} agregó una nota en ${req.folio}`, 'info', requestId);
      }
    }
  }, [user, requests, pushNotif]);

  const deleteRequest = useCallback(async (id: string) => {
    await supabase.from('requests').delete().eq('id', id);
  }, []);

  // ── Notification actions ───────────────────────────────────────────────────
  const markNotificationRead = useCallback(async (id: string) => {
    await supabase.from('notifications').update({ read: true }).eq('id', id);
  }, []);

  const markAllNotificationsRead = useCallback(async () => {
    if (!user) return;
    await supabase.from('notifications').update({ read: true }).eq('user_id', user.id).eq('read', false);
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  }, [user]);

  // ── User management (admin only) ───────────────────────────────────────────
  const createUser = useCallback(async (data: Omit<User, 'id'> & { password: string }) => {
    // Create auth user via Supabase (requires service role in production)
    // For now, insert profile directly — admin creates via Supabase Auth dashboard
    // or use a Supabase Edge Function. This is a placeholder.
    console.warn('createUser: use Supabase Auth dashboard or an Edge Function to invite users.');
  }, []);

  const updateUser = useCallback(async (id: string, updates: Partial<User & { password?: string }>) => {
    const dbUpdates: any = {};
    if (updates.name) dbUpdates.name = updates.name;
    if (updates.role) dbUpdates.role = updates.role;
    if (updates.department !== undefined) dbUpdates.department = updates.department;
    if (updates.phone !== undefined) dbUpdates.phone = updates.phone;
    if (updates.active !== undefined) dbUpdates.active = updates.active;
    await supabase.from('profiles').update(dbUpdates).eq('id', id);
    setUsers(prev => prev.map(u => u.id === id ? { ...u, ...updates } : u));
    if (user?.id === id) setUser(prev => prev ? { ...prev, ...updates } : prev);
  }, [user]);

  const toggleUserActive = useCallback(async (id: string) => {
    const u = users.find(u => u.id === id);
    if (!u) return;
    await updateUser(id, { active: !u.active });
  }, [users, updateUser]);

  // ── Equipment actions ──────────────────────────────────────────────────────
  const updateEquipment = useCallback(async (id: string, updates: Partial<Equipment>) => {
    const dbUpdates: any = {};
    if (updates.status !== undefined) dbUpdates.status = updates.status;
    if (updates.tonerLevel !== undefined) dbUpdates.toner_level = updates.tonerLevel;
    if (updates.pageCount !== undefined) dbUpdates.page_count = updates.pageCount;
    if (updates.lastService !== undefined) dbUpdates.last_service = updates.lastService;
    await supabase.from('equipment').update(dbUpdates).eq('id', id);
  }, []);

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <AppContext.Provider value={{
      user, users, requests, notifications, equipment, loading,
      login, logout, createRequest, updateRequestStatus, assignRequest,
      addNote, deleteRequest, markNotificationRead, markAllNotificationsRead,
      unreadCount, createUser, updateUser, toggleUserActive, updateEquipment,
    }}>
      {children}
    </AppContext.Provider>
  );
};
