# CardBoda Frontend

Frontend de invitación digital de boda - Angular 17.

## Tech Stack

- **Angular 17** (standalone components, signals)
- **Angular Material**
- **TypeScript 5.4**
- **SCSS**

## Rutas

| Path | Descripción |
|------|-------------|
| `/` | Home - búsqueda por código |
| `/login` | Login admin |
| `/invitacion/:codigo` | Invitación digital |
| `/admin` | Panel de gestión invitados |
| `/admin/mesas` | Distribución de mesas |

## Desarrollo

```bash
npm install
npm start
```

## Build

```bash
npm run build
```

## Docker

```bash
docker build -t cardboda-frontend .
docker run -p 80:80 cardboda-frontend
```

## API

Configurada en `src/environments/`:

- **Dev**: `https://carddboda-5-0.onrender.com/api`
- **Prod**: `/api` (proxy nginx)

## Estructura

```
src/app/
├── components/     # Vistas standalone
│   ├── home/       # Landing + búsqueda
│   ├── invitation/ # Tarjeta digital
│   ├── admin/      # Gestión invitados
│   ├── mesas/      # Distribución mesas
│   └── login/
├── services/       # HTTP services
├── guards/         # Auth guard
├── interceptors/   # Error + Auth
└── core/
```

## Features

- Countdownanimated a la boda
- Búsqueda de invitación por código único
- Código QR por invitado
- Carga masiva de invitados (JSON)
- PDF de invitación (ticket)
- Distribución en mesas
- Panel admin con Angular Material