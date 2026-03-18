import { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { motion } from 'framer-motion';
import { Printer, Loader as Loader2 } from 'lucide-react';

const Login = () => {
  const { login } = useApp();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    const ok = await login(email, password);
    if (!ok) {
      setError('Correo o contraseña incorrectos.');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
        <Card className="w-[400px] shadow-2xl">
          <CardHeader className="text-center pb-2 pt-8">
            <div className="mx-auto mb-5 h-16 w-16 rounded-2xl bg-primary flex items-center justify-center shadow-lg">
              <Printer className="h-8 w-8 text-primary-foreground" />
            </div>
            <h1 className="text-3xl font-extrabold tracking-tight">Mongar</h1>
            <p className="text-sm text-muted-foreground mt-1">Renta & Venta de Impresoras</p>
          </CardHeader>
          <CardContent className="space-y-5 pb-8">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="email">Correo electrónico</Label>
                <Input id="email" type="email" value={email}
                  onChange={e => { setEmail(e.target.value); setError(''); }}
                  placeholder="usuario@mongar.com" autoComplete="email" disabled={loading} />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="password">Contraseña</Label>
                <Input id="password" type="password" value={password}
                  onChange={e => { setPassword(e.target.value); setError(''); }}
                  placeholder="••••••••" autoComplete="current-password" disabled={loading} />
              </div>
              {error && (
                <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                  className="text-sm text-destructive font-medium bg-destructive/10 px-3 py-2 rounded-lg">
                  {error}
                </motion.p>
              )}
              <Button type="submit" className="w-full font-bold text-base h-11" disabled={loading}>
                {loading ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Ingresando...</> : 'Iniciar Sesión'}
              </Button>
            </form>
            <p className="text-xs text-center text-muted-foreground">
              ¿Sin acceso? Contacta al administrador del sistema.
            </p>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};

export default Login;
