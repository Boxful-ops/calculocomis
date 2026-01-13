# Sistema de Gestión de Comisiones

Una aplicación web completa para la gestión de comisiones de leads, con funcionalidades de administración de usuarios y procesamiento de archivos.

## Características

### 🎯 Gestión de Usuarios
- **Super Admin**: Crear, editar y eliminar usuarios
- **Roles y Permisos**: Super Admin, Admin, Vendedor
- **Autenticación segura** con JWT

### 💼 Gestión de Comisiones
- **Cálculo automático** basado en reglas configuradas
- **Primer Mes**: $1 por envío (tiers: $5, $30, $100, $300)
- **Segundo Mes**: $0.50 por envío (tiers: $2.50, $15, $50, $150)
- **Regla especial**: Afiliación después del día 21 = comisión siguiente mes

### 📁 Procesamiento de Archivos
- **CSV**: Importación de datos de leads
- **XLS/XLSX**: Procesamiento mensual de envíos
- **Integración con HubSpot** para comparación de datos

### 📊 Dashboard y Reportes
- Estadísticas en tiempo real
- Exportación de datos a CSV
- Filtros avanzados
- Visualización de comisiones por estado

## Instalación

### Requisitos Previos
- Node.js (v14 o superior)
- MongoDB
- npm o yarn

### Backend
```bash
# Instalar dependencias
npm install

# Configurar variables de entorno
cp .env.example .env
# Editar .env con tus credenciales

# Iniciar servidor
npm run dev
```

### Frontend
```bash
# Navegar al directorio del cliente
cd client

# Instalar dependencias
npm install

# Iniciar aplicación
npm start
```

## Configuración

### Variables de Entorno
```env
MONGODB_URI=mongodb://localhost:27017/commission_system
JWT_SECRET=your_super_secret_key_here
NODE_ENV=development
HUBSPOT_PRIVATE_APP_TOKEN=your_hubspot_private_app_token_here
```

### Configuración de HubSpot
1. **Crear App Privada en HubSpot**:
   - Ve a HubSpot > Configuración > Integraciones > App Privada
   - Crea una nueva app con los permisos necesarios
   - Genera un token de acceso

2. **Permisos Requeridos**:
   - `crm.objects.contacts.read` - Leer contactos
   - `crm.objects.companies.read` - Leer empresas
   - `crm.lists.read` - Leer listas

3. **Configurar Token**:
   - Copia el token generado
   - Agrégalo al archivo `.env` como `HUBSPOT_PRIVATE_APP_TOKEN`

### Estructura del Proyecto
```
├── server.js              # Servidor principal
├── package.json           # Dependencias del backend
├── .env                   # Variables de entorno
├── client/                # Aplicación React
│   ├── src/
│   │   ├── components/    # Componentes reutilizables
│   │   ├── pages/         # Páginas principales
│   │   ├── utils/         # Utilidades y contexto
│   │   └── App.js         # Componente principal
│   └── package.json       # Dependencias del frontend
├── uploads/               # Archivos subidos
└── public/                # Archivos estáticos
```

## Uso

### 1. Crear Super Admin
```javascript
// En MongoDB, crear primer usuario:
{
  "username": "admin",
  "email": "admin@demo.com",
  "password": "admin123", // será encriptado
  "role": "super_admin"
}
```

### 2. Importar Leads (CSV)
Formato esperado:
```csv
name,email,affiliationDate
Juan Pérez,juan@email.com,2024-01-15
María García,maria@email.com,2024-01-25
```

### 3. Procesar Envíos (XLS)
Formato esperado:
| Cliente | Envíos |
|---------|--------|
| Juan Pérez | 25 |
| María García | 15 |

## Reglas de Comisión

### Primer Mes
- **Tarifa**: $1 por envío
- **Tiers**: $5, $30, $100, $300
- **Excepción**: Si se afilia el día 21 o después, las comisiones aplican para el siguiente mes calendario

### Segundo Mes
- **Tarifa**: $0.50 por envío
- **Tiers**: $2.50, $15, $50, $150
- **Vigencia**: Solo durante el segundo mes

### Estados de Comisión
- **Completa**: Comisión total aplicable
- **Mitad**: Comisión reducida
- **Siguiente Mes**: Pospuesta para el siguiente período

## API Endpoints

### Autenticación
- `POST /api/auth/login` - Iniciar sesión
- `GET /api/auth/verify` - Verificar token

### Usuarios
- `GET /api/users` - Listar usuarios (solo super admin)
- `POST /api/users` - Crear usuario (solo super admin)
- `PUT /api/users/:id` - Actualizar usuario (solo super admin)
- `DELETE /api/users/:id` - Eliminar usuario (solo super admin)

### Archivos
- `POST /api/upload/csv` - Subir archivo CSV de leads
- `POST /api/upload/xls` - Subir archivo XLS de envíos

### Comisiones
- `GET /api/commissions` - Listar comisiones
- `GET /api/dashboard/stats` - Estadísticas del dashboard

## Tecnologías

### Backend
- **Node.js** - Runtime
- **Express** - Framework web
- **MongoDB** - Base de datos
- **JWT** - Autenticación
- **Multer** - Manejo de archivos
- **csv-parser** - Lectura CSV
- **xlsx** - Lectura Excel

### Frontend
- **React** - Framework UI
- **React Router** - Navegación
- **Tailwind CSS** - Estilos
- **Lucide React** - Iconos
- **Axios** - Cliente HTTP

## Contribución

1. Fork del proyecto
2. Crear rama feature (`git checkout -b feature/NuevaCaracteristica`)
3. Commit de cambios (`git commit -m 'Agregar nueva característica'`)
4. Push a la rama (`git push origin feature/NuevaCaracteristica`)
5. Abrir Pull Request

## Licencia

Este proyecto está bajo la Licencia MIT.
