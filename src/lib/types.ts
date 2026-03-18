export type UserRole = 'admin' | 'tecnico' | 'usuario';

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  department?: string;
  phone?: string;
  active: boolean;
}

export type RequestType = 'toner' | 'equipo' | 'servicio' | 'papel' | 'instalacion' | 'contrato';
export type RequestStatus = 'pendiente' | 'en_proceso' | 'completada' | 'cancelada';
export type RequestPriority = 'baja' | 'media' | 'alta' | 'urgente';

export interface ServiceRequest {
  id: string;
  folio: string;
  type: RequestType;
  title: string;
  description: string;
  status: RequestStatus;
  priority: RequestPriority;
  createdBy: string;
  assignedTo?: string;
  createdAt: string;
  updatedAt: string;
  notes: RequestNote[];
  printerModel?: string;
  serialNumber?: string;
  location?: string;
  contractType?: 'renta' | 'venta' | 'servicio_externo';
}

export interface RequestNote {
  id: string;
  text: string;
  createdBy: string;
  createdAt: string;
  isInternal?: boolean;
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  read: boolean;
  createdAt: string;
  userId: string;
  type: 'info' | 'success' | 'warning' | 'error';
  requestId?: string;
}

export interface Equipment {
  id: string;
  model: string;
  brand: string;
  type: 'impresora' | 'multifuncional' | 'plotter';
  contractType: 'renta' | 'venta';
  serialNumber: string;
  location: string;
  assignedTo: string;
  clientId?: string;
  status: 'activo' | 'en_mantenimiento' | 'inactivo';
  installDate: string;
  lastService?: string;
  nextService?: string;
  tonerLevel?: number;
  pageCount?: number;
  monthlyPageLimit?: number;
  pricePerPage?: number;
  monthlyRent?: number;
}

export interface ServiceHistory {
  id: string;
  equipmentId: string;
  type: 'preventivo' | 'correctivo';
  technicianId: string;
  date: string;
  description: string;
  partsReplaced?: string;
  pageCountAtService?: number;
  cost?: number;
  createdAt: string;
}

export interface PageReading {
  id: string;
  equipmentId: string;
  reading: number;
  previousReading: number;
  pagesUsed: number;
  readingDate: string;
  recordedBy: string;
  createdAt: string;
}

export interface Client {
  id: string;
  name: string;
  contactName?: string;
  email?: string;
  phone?: string;
  address?: string;
  contractStart?: string;
  contractEnd?: string;
  contractType: 'renta' | 'venta' | 'mixto';
  active: boolean;
  notes?: string;
  createdAt: string;
}
