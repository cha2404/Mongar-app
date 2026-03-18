import { useApp } from '@/context/AppContext';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Bell, Check, CheckCheck, Info, TriangleAlert as AlertTriangle, CircleCheck as CheckCircle, Circle as XCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const typeIcon: Record<string, { icon: typeof Bell; cls: string }> = {
  info: { icon: Info, cls: 'text-primary' },
  warning: { icon: AlertTriangle, cls: 'text-warning' },
  success: { icon: CheckCircle, cls: 'text-success' },
  error: { icon: XCircle, cls: 'text-destructive' },
};

const Notifications = () => {
  const { user, notifications, markNotificationRead, markAllNotificationsRead } = useApp();
  const navigate = useNavigate();
  if (!user) return null;

  const mine = notifications.filter(n => n.userId === user.id);
  const unread = mine.filter(n => !n.read).length;

  return (
    <div className="max-w-2xl mx-auto space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight">Notificaciones</h1>
          <p className="text-sm text-muted-foreground mt-0.5">{unread} sin leer</p>
        </div>
        {unread > 0 && (
          <Button variant="outline" size="sm" onClick={markAllNotificationsRead} className="gap-1.5">
            <CheckCheck className="h-4 w-4" /> Marcar todas como leídas
          </Button>
        )}
      </div>

      {mine.length === 0 ? (
        <Card>
          <CardContent className="py-16 text-center text-muted-foreground">
            <Bell className="h-10 w-10 mx-auto mb-3 opacity-20" />
            <p>No tienes notificaciones</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-2">
          {mine.map(n => {
            const t = typeIcon[n.type] || typeIcon.info;
            return (
              <Card key={n.id}
                className={`transition-all cursor-pointer hover:shadow-sm ${n.read ? 'opacity-60' : 'border-primary/20'}`}
                onClick={() => { markNotificationRead(n.id); if (n.requestId) navigate(`/solicitudes/${n.requestId}`); }}>
                <CardContent className="p-4 flex items-center gap-4">
                  <div className={`h-9 w-9 rounded-full flex items-center justify-center shrink-0 ${n.read ? 'bg-secondary' : 'bg-primary/10'}`}>
                    <t.icon className={`h-4 w-4 ${n.read ? 'text-muted-foreground' : t.cls}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-semibold">{n.title}</p>
                      {!n.read && <span className="h-2 w-2 rounded-full bg-primary shrink-0" />}
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5">{n.message}</p>
                    <p className="text-[10px] text-muted-foreground/70 mt-1">{new Date(n.createdAt).toLocaleString('es-MX')}</p>
                  </div>
                  {!n.read && (
                    <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0"
                      onClick={e => { e.stopPropagation(); markNotificationRead(n.id); }}>
                      <Check className="h-4 w-4" />
                    </Button>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Notifications;
