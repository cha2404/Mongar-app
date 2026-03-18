import { User, ServiceRequest, Notification, Equipment } from './types';

export const MOCK_USERS: (User & { password: string })[] = [
  { id: '1', email: 'admin@mongar.com', password: 'admin123', name: 'Administrador', role: 'admin', department: 'Dirección', phone: '555-0001', active: true },
  { id: '2', email: 'carlos@mongar.com', password: 'carlos123', name: 'Carlos López', role: 'tecnico', department: 'Soporte Técnico', phone: '555-0002', active: true },
  { id: '3', email: 'ana@mongar.com', password: 'ana123', name: 'Ana Rodríguez', role: 'tecnico', department: 'Soporte Técnico', phone: '555-0003', active: true },
  { id: '4', email: 'maria@mongar.com', password: 'maria123', name: 'María García', role: 'usuario', department: 'Contabilidad', phone: '555-0004', active: true },
  { id: '5', email: 'pedro@mongar.com', password: 'pedro123', name: 'Pedro Martínez', role: 'usuario', department: 'Ventas', phone: '555-0005', active: true },
  { id: '6', email: 'lucia@mongar.com', password: 'lucia123', name: 'Lucía Ramírez', role: 'usuario', department: 'Recursos Humanos', phone: '555-0006', active: true },
];

export const MOCK_REQUESTS: ServiceRequest[] = [
  {
    id: 'r1', folio: 'SOL-0001', type: 'toner',
    title: 'Toner negro agotado - Impresora Contabilidad',
    description: 'La impresora HP LaserJet Pro del área de contabilidad se quedó sin toner negro. Necesitamos reposición urgente para poder imprimir estados de cuenta.',
    status: 'pendiente', priority: 'urgente', createdBy: '4',
    printerModel: 'HP LaserJet Pro M404n', serialNumber: 'VNB3K12345', location: 'Contabilidad - Piso 2',
    contractType: 'renta',
    createdAt: '2026-03-15T09:00:00Z', updatedAt: '2026-03-15T09:00:00Z', notes: [],
  },
  {
    id: 'r2', folio: 'SOL-0002', type: 'servicio',
    title: 'Mantenimiento preventivo - MFP Ventas',
    description: 'La multifuncional del área de ventas presenta atascos frecuentes de papel y calidad de impresión deficiente. Requiere mantenimiento preventivo.',
    status: 'en_proceso', priority: 'alta', createdBy: '5', assignedTo: '2',
    printerModel: 'Canon imageRUNNER 2630', serialNumber: 'CRN8B54321', location: 'Ventas - Piso 1',
    contractType: 'renta',
    createdAt: '2026-03-13T14:30:00Z', updatedAt: '2026-03-14T10:00:00Z',
    notes: [
      { id: 'n1', text: 'Equipo revisado. Se detectó acumulación de polvo en el fusor y rodillos desgastados. Se procedió a limpieza profunda.', createdBy: '2', createdAt: '2026-03-14T10:00:00Z', isInternal: false },
      { id: 'n2', text: 'Necesito pedir rodillos de repuesto al almacén, regreso mañana para terminar.', createdBy: '2', createdAt: '2026-03-14T11:00:00Z', isInternal: true },
    ],
  },
  {
    id: 'r3', folio: 'SOL-0003', type: 'equipo',
    title: 'Cambio de equipo - Impresora dañada RRHH',
    description: 'La impresora de Recursos Humanos tiene la pantalla rota y no enciende. Se requiere sustitución del equipo.',
    status: 'completada', priority: 'alta', createdBy: '6', assignedTo: '3',
    printerModel: 'Epson EcoTank L3250', serialNumber: 'ETL3250-78901', location: 'RRHH - Piso 3',
    contractType: 'venta',
    createdAt: '2026-03-08T11:00:00Z', updatedAt: '2026-03-10T16:00:00Z',
    notes: [
      { id: 'n3', text: 'Se confirmó daño irreparable en la tarjeta madre. Se autorizó cambio de equipo.', createdBy: '3', createdAt: '2026-03-09T09:00:00Z', isInternal: false },
      { id: 'n4', text: 'Equipo nuevo instalado y configurado en red. Usuario capacitado.', createdBy: '3', createdAt: '2026-03-10T16:00:00Z', isInternal: false },
    ],
  },
  {
    id: 'r4', folio: 'SOL-0004', type: 'instalacion',
    title: 'Instalación nueva impresora - Dirección General',
    description: 'Se adquirió una nueva impresora de alta velocidad para la Dirección General. Requiere instalación, configuración en red y capacitación.',
    status: 'pendiente', priority: 'media', createdBy: '1',
    printerModel: 'HP Color LaserJet Enterprise M856dn', location: 'Dirección - Piso 4',
    contractType: 'venta',
    createdAt: '2026-03-14T08:00:00Z', updatedAt: '2026-03-14T08:00:00Z', notes: [],
  },
  {
    id: 'r5', folio: 'SOL-0005', type: 'papel',
    title: 'Reposición de papel bond - Almacén general',
    description: 'Se necesitan 10 resmas de papel bond tamaño carta y 5 de oficio para el almacén general.',
    status: 'completada', priority: 'baja', createdBy: '4', assignedTo: '2',
    location: 'Almacén - Planta Baja',
    createdAt: '2026-03-10T10:00:00Z', updatedAt: '2026-03-11T12:00:00Z',
    notes: [{ id: 'n5', text: 'Suministros entregados. Firma de recibido obtenida.', createdBy: '2', createdAt: '2026-03-11T12:00:00Z', isInternal: false }],
  },
  {
    id: 'r6', folio: 'SOL-0006', type: 'contrato',
    title: 'Consulta sobre renovación de contrato de renta',
    description: 'El contrato de renta de las 3 impresoras del área de ventas vence el próximo mes. Necesito información sobre las condiciones de renovación y si hay equipos más modernos disponibles.',
    status: 'en_proceso', priority: 'media', createdBy: '5', assignedTo: '1',
    contractType: 'renta',
    createdAt: '2026-03-12T15:00:00Z', updatedAt: '2026-03-13T09:00:00Z',
    notes: [{ id: 'n6', text: 'Se contactó al cliente. Se enviará propuesta de renovación con upgrade de equipos la próxima semana.', createdBy: '1', createdAt: '2026-03-13T09:00:00Z', isInternal: false }],
  },
];

export const MOCK_NOTIFICATIONS: Notification[] = [
  { id: 'not1', title: 'Solicitud urgente nueva', message: 'María García reportó toner agotado en Contabilidad (SOL-0001)', read: false, createdAt: '2026-03-15T09:00:00Z', userId: '1', type: 'warning', requestId: 'r1' },
  { id: 'not2', title: 'Solicitud urgente nueva', message: 'Tienes una solicitud urgente de toner asignada (SOL-0001)', read: false, createdAt: '2026-03-15T09:00:00Z', userId: '2', type: 'warning', requestId: 'r1' },
  { id: 'not3', title: 'Te asignaron una solicitud', message: 'Carlos López fue asignado a tu solicitud de mantenimiento (SOL-0002)', read: false, createdAt: '2026-03-14T10:00:00Z', userId: '5', type: 'info', requestId: 'r2' },
  { id: 'not4', title: 'Solicitud completada ✅', message: 'Tu solicitud de cambio de equipo fue completada (SOL-0003)', read: true, createdAt: '2026-03-10T16:00:00Z', userId: '6', type: 'success', requestId: 'r3' },
  { id: 'not5', title: 'Solicitud completada ✅', message: 'El papel solicitado fue entregado (SOL-0005)', read: false, createdAt: '2026-03-11T12:00:00Z', userId: '4', type: 'success', requestId: 'r5' },
];

export const MOCK_EQUIPMENT: Equipment[] = [
  { id: 'eq1', brand: 'HP', model: 'LaserJet Pro M404n', type: 'impresora', contractType: 'renta', serialNumber: 'VNB3K12345', location: 'Contabilidad - Piso 2', assignedTo: 'Contabilidad', status: 'activo', installDate: '2024-01-15', lastService: '2025-09-10', tonerLevel: 5, pageCount: 48320 },
  { id: 'eq2', brand: 'Canon', model: 'imageRUNNER 2630', type: 'multifuncional', contractType: 'renta', serialNumber: 'CRN8B54321', location: 'Ventas - Piso 1', assignedTo: 'Ventas', status: 'en_mantenimiento', installDate: '2023-06-01', lastService: '2026-03-14', tonerLevel: 40, pageCount: 132000 },
  { id: 'eq3', brand: 'Epson', model: 'EcoTank L3250', type: 'impresora', contractType: 'venta', serialNumber: 'ETL3250-78902', location: 'RRHH - Piso 3', assignedTo: 'RRHH', status: 'activo', installDate: '2026-03-10', tonerLevel: 90, pageCount: 150 },
  { id: 'eq4', brand: 'HP', model: 'Color LaserJet Enterprise M856dn', type: 'impresora', contractType: 'venta', serialNumber: 'PND9X00001', location: 'Dirección - Piso 4', assignedTo: 'Dirección', status: 'inactivo', installDate: '2026-03-14', tonerLevel: 100, pageCount: 0 },
  { id: 'eq5', brand: 'Xerox', model: 'VersaLink C405', type: 'multifuncional', contractType: 'renta', serialNumber: 'XRX405-99001', location: 'Administración - Piso 2', assignedTo: 'Administración', status: 'activo', installDate: '2024-08-20', lastService: '2025-12-05', tonerLevel: 62, pageCount: 75400 },
  { id: 'eq6', brand: 'Brother', model: 'MFC-L8900CDW', type: 'multifuncional', contractType: 'renta', serialNumber: 'BRO8900-44321', location: 'Marketing - Piso 1', assignedTo: 'Marketing', status: 'activo', installDate: '2023-11-10', lastService: '2026-01-20', tonerLevel: 28, pageCount: 98700 },
];
