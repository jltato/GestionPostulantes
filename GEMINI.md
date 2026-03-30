# Gemini Context: GestionPostulantes

This file provides essential context for Gemini CLI to effectively assist with development, maintenance, and troubleshooting in the `GestionPostulantes` repository.

## Project Overview
`GestionPostulantes` is a modern recruitment management system built with **Angular 20**. It allows administrators to manage job applicants, track their status, and view detailed personal, educational, and professional records.

### Key Technologies
- **Framework:** Angular 20 (Standalone Components)
- **UI Libraries:** Angular Material, Bootstrap 5
- **Data Display:** DataTables.net (with server-side processing)
- **Authentication:** OIDC via `angular-auth-oidc-client`
- **Utilities:** jQuery (for DataTables), Moment.js, JSZip (Excel export)
- **API Communication:** HttpClient with OIDC Interceptor and custom `X-API-KEY` header

## Architecture & Design Patterns

### Component Architecture
- **Standalone Components:** The project strictly uses `standalone: true` for all components.
- **Route-Based Navigation:** Lazy loading is used for main views (`/listado/:tipo`, `/gestion/:id`).
- **Composition:** The `GestionComponent` is a composite view that embeds multiple child components (`contactos`, `estudios`, `trabajos`, `familia`, `seguimiento`) to manage complex applicant data.

### Authentication & Security
- **OIDC Integration:** Configured in `app.config.ts`. Authority is `https://auth2.spc.com/`.
- **Auth Guard:** Routes are protected by `authGuard` (except landing and callbacks).
- **Interceptors:** The `authInterceptor` automatically attaches Bearer tokens to requests matching the `apiUrl`.
- **API Key:** All requests also require an `X-API-KEY` header, managed by `PostulanteService`.

### Data Management
- **Services:** Centralized in `src/app/Services/`. `PostulanteService` is the primary interface for applicant-related REST actions.
- **State Management:** Uses `sessionStorage` to persist DataTables state (filters, sorting, pagination) and to pass navigation context (e.g., `postulanteIds` for "Next/Previous" navigation in the detail view).
- **Enums:** Status constants are defined in `src/app/shared/enums/estados-postulantes.ts`.

### Environment Configuration
Configurations are managed via files in `src/environments/`:
- `environment.ts`: Production API (`api.formulariopostulantes.com.ar`)
- `environment.development.ts`: Local API (`localhost:7244`)
- `environment.test.ts`: Test environment

## Development Workflow

### Common Commands
- **Start Dev Server:** `npm start` or `ng serve`
- **Production Build:** `npm run build`
- **Unit Testing:** `npm test` or `ng test`
- **Linting:** `npm run lint`
- **Formatting:** `npm run format` (uses Prettier)

### Code Scaffolding
Always use Angular CLI for generating new artifacts to maintain consistency:
- `ng generate component path/to/component`
- `ng generate service Services/name`

### Coding Standards
- **Strict Typing:** Avoid `any` where possible, although some legacy usage exists in complex form data.
- **Reactive Forms:** Use `ReactiveFormsModule` for all data entry.
- **Async Pipe:** Prefer the `async` pipe in templates for handling Observables when possible.
- **Naming:** Follow standard Angular naming conventions (`kebab-case.component.ts`, `PascalCase` for classes).

## Important Files
- `src/app/app.config.ts`: Application providers and OIDC configuration.
- `src/app/app.routes.ts`: Central routing definition with lazy loading.
- `src/app/Services/postulante.service.ts`: Main API integration logic.
- `src/app/list/list.component.ts`: Complex DataTable implementation with server-side logic.
- `src/app/gestion/gestion.component.ts`: Master applicant management form.
