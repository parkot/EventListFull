# EventListFull

Monorepo for a multilingual invitation platform covering backend API, organizer/admin web apps, promo site, and mobile experience.

## Workspace layout

- `src/Backend/EventList.Api` - ASP.NET Core 10 API host
- `src/Backend/EventList.Application` - application contracts and use-case layer
- `src/Backend/EventList.Domain` - domain entities and enums
- `src/Backend/EventList.Infrastructure` - EF Core, authentication, and infrastructure services
- `apps/promo-vue` - placeholder for the Vue promo site
- `apps/organizer-web` - placeholder for the React organizer portal
- `apps/admin-web` - placeholder for the React admin panel
- `apps/mobile-rn` - placeholder for the React Native mobile app

## Current backend scope

The first implementation pass includes:

- SQL Server-backed user persistence
- EF Core migrations for schema management
- registration
- email confirmation
- login with JWT
- refresh tokens with rotation
- current-session and all-session logout support
- forgot/reset password flow
- admin-only user creation endpoint
- development bootstrap admin creation
- organizer event creation and listing
- guest creation per event with invitation code generation
- public invitation lookup endpoint
- public RSVP submission with event statistics updates
- table assignment for attending guests
- per-invitation scan code generation for venue entry
- idempotent check-in endpoint returning guest and table information
- invitation template creation with channel and language selection
- template-based invitation sending for email and SMS channels
- persistent delivery logs with subject, recipient, and provider message id
- billing catalog for premium plans and SMS credit packs
- checkout session creation with VivaWallet-style webhook completion flow
- user entitlements for premium access and SMS credit balances
- delivery enforcement that blocks SMS sends without credits and decrements balance on send

## Run the backend

1. Ensure a local SQL Server instance is available, or update the connection string in `src/Backend/EventList.Api/appsettings.Development.json`.
2. Run `dotnet run --project src/Backend/EventList.Api`.
3. The API applies EF Core migrations automatically on startup.
4. Use the bootstrap admin credentials from `src/Backend/EventList.Api/appsettings.json` for initial administrator access in development.

## Developer commands

- `dotnet build EventListFull.slnx`
- `dotnet tool run dotnet-ef migrations add <MigrationName> --project src/Backend/EventList.Infrastructure/EventList.Infrastructure.csproj --startup-project src/Backend/EventList.Api/EventList.Api.csproj`
- `dotnet tool run dotnet-ef database update --project src/Backend/EventList.Infrastructure/EventList.Infrastructure.csproj --startup-project src/Backend/EventList.Api/EventList.Api.csproj`

Email confirmation and password reset notifications currently write tokens to the API logs for development. Replace the development notification sink with real email/SMS providers in the next iteration.