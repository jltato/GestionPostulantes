# WARP.md

This file provides guidance to WARP (warp.dev) when working with code in this repository.

## Project Overview
GestionPostulantes is an Angular 20 application for managing job applicants (recruitment management system). It uses Angular Material, Bootstrap, DataTables, and integrates with OIDC authentication.

## Common Commands

### Development
```bash
npm start                    # Start dev server (http://localhost:4200)
ng serve                     # Alternative dev server command
ng serve --configuration development  # Explicit dev configuration
```

### Building
```bash
npm run build                # Production build → dist/gestion-postulantes
ng build                     # Same as above
ng build --configuration development  # Dev build → dist/gestion-postulantes-dev
ng build --configuration test        # Test build → dist/gestion-postulantes-test
npm run watch                # Watch mode for development
```

### Testing & Quality
```bash
npm test                     # Run unit tests (Karma + Jasmine)
ng test                      # Same as above
npm run lint                 # Run ESLint
ng lint                      # Same as above
npm run format               # Format code with Prettier
```

### Code Generation
```bash
ng generate component <name>     # Generate new component
ng generate service <name>        # Generate new service
ng generate directive <name>      # Generate new directive
ng generate --help                # List all available schematics
```

## Architecture

### Environment Configuration
The application uses three environment files:
- `environment.ts` - Production (https://api.formulariopostulantes.com.ar/api)
- `environment.development.ts` - Local development (https://localhost:7244/api)
- `environment.test.ts` - Test server (http://api2.formulariopostulantes.com.ar/api)

Environment files are swapped via `angular.json` build configurations.

### Authentication
Uses `angular-auth-oidc-client` library with OIDC authentication:
- Authority: https://auth2.spc.com/
- Auth callbacks handled by `auth-callback` and `logout-callback` components
- Authentication interceptor configured in `app.config.ts`
- Tokens are automatically injected into HTTP requests

### Routing Structure
The app uses lazy-loaded routes defined in `app.routes.ts`:
- `/home` - Home component (landing page)
- `/listado/:tipo?est=<estadoId>` - List view with DataTables (lazy loaded)
- `/gestion/:id` - Applicant management/detail view (lazy loaded)

Navigation state uses `sessionStorage` to maintain context when navigating between list and detail views.

### Core Services
All services are in `src/app/Services/`:
- **PostulanteService** - Main API service for applicant data, includes hardcoded API key for backend authentication
- **AlertService** - Global alert/notification system
- **ConfigService** - Configuration management

### API Integration
- Base URL comes from environment files
- All requests require `X-API-KEY` header
- REST endpoints: `/Postulantes`, `/Seguimientos`, `/Documentos`
- Server-side pagination for DataTables

### DataTables Integration
The list component uses DataTables with:
- Server-side processing and pagination
- State saving in `sessionStorage` (preserves filters, sorting, pagination)
- Custom buttons for Excel export
- Row click handlers for navigation to detail view
- Spanish language file at `assets/Language.Json`

### Component Structure
- **Standalone components** - All components use `standalone: true`
- **list** - DataTable-based listing with filtering by applicant type and status
- **gestion** - Complex form-based detail view with multiple child components:
  - `contactos` - Contact information
  - `estudios` - Education history
  - `trabajos` - Work history
  - `familia` - Family information
  - Uses `seguimiento` component for status tracking
- **home** - Landing page
- **shared/** - Reusable components:
  - `navbar` - Navigation bar
  - `alert` - Global alert component
  - `configuration-popup` - Configuration dialog
  - `enums/estados-postulantes.ts` - Applicant status enum (Pendientes, En Proceso, Aptos, etc.)

### Forms & Validation
- Uses Reactive Forms (`ReactiveFormsModule`)
- Angular Material form components
- Custom validators (e.g., age validation in gestion component)
- Custom directive: `UppercaseDirective` for text input formatting

### State Management
- SessionStorage for DataTables state and navigation context
- Observable-based service communication
- No global state management library (e.g., NgRx)

### Styling
Global styles loaded in `angular.json`:
- Angular Material theme: azure-blue (production) / magenta-violet (test)
- Bootstrap 5
- DataTables CSS with buttons extension

### Key Libraries
- **jQuery** - Required for DataTables (loaded in scripts)
- **DataTables.net** - Multiple extensions (buttons, responsive, state restore, scroller, colreorder)
- **jszip** - Excel export functionality
- **moment** - Date manipulation
- **Bootstrap 5** - UI framework
- **Angular Material** - Form components and UI elements

## Development Notes

### TypeScript Configuration
- Target: ES2022
- Strict mode enabled
- ESLint configured with `angular-eslint`

### Testing Framework
- Karma test runner
- Jasmine for unit tests
- Tests run with `ng test` command

### Build Optimization
Production build includes:
- AOT compilation
- Output hashing for cache busting
- Bundle size budgets (500kB warning, 2MB error for initial bundle)
- License extraction
