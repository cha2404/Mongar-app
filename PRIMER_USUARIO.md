# Cómo crear tu primer usuario Admin en Supabase

## Paso 1 — Crear usuario en Authentication

1. Ve a Supabase → **Authentication** → **Users**
2. Click en **"Add user"** → **"Create new user"**
3. Ingresa:
   - Email: `admin@mongar.com`
   - Password: (la que quieras)
4. Click **"Create user"**
5. Copia el **UUID** que aparece (algo como `a1b2c3d4-...`)

## Paso 2 — Crear su perfil en la base de datos

Ve a **SQL Editor** y pega esto (reemplaza el UUID):

```sql
insert into public.profiles (id, name, role, department, phone, active)
values (
  'PEGA-AQUI-EL-UUID-DEL-PASO-1',
  'Administrador',
  'admin',
  'Dirección',
  '555-0001',
  true
);
```

## Paso 3 — Repetir para cada usuario

Repite el proceso para cada empleado. Los roles disponibles son:
- `admin` → Acceso total
- `tecnico` → Ve equipos, gestiona solicitudes
- `usuario` → Solo crea y ve sus propias solicitudes

## Ejemplo para un técnico:
```sql
insert into public.profiles (id, name, role, department, phone, active)
values (
  'UUID-DEL-TECNICO',
  'Carlos López',
  'tecnico',
  'Soporte Técnico',
  '555-0002',
  true
);
```

## Insertar datos de equipos de ejemplo:
```sql
insert into public.equipment (brand, model, type, contract_type, serial_number, location, assigned_to, status, install_date, toner_level, page_count)
values
  ('HP', 'LaserJet Pro M404n', 'impresora', 'renta', 'VNB3K12345', 'Contabilidad - Piso 2', 'Contabilidad', 'activo', '2024-01-15', 5, 48320),
  ('Canon', 'imageRUNNER 2630', 'multifuncional', 'renta', 'CRN8B54321', 'Ventas - Piso 1', 'Ventas', 'activo', '2023-06-01', 40, 132000),
  ('Xerox', 'VersaLink C405', 'multifuncional', 'renta', 'XRX405-99001', 'Administración - Piso 2', 'Administración', 'activo', '2024-08-20', 62, 75400);
```
