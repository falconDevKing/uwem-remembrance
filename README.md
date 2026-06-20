# Uwem Remembrance

Next.js registration and event access application backed by Supabase Postgres.

## Configuration

Copy `.env.example` to `.env.local` and provide the admin passwords, session
secret, Supabase project URL, and Supabase publishable key.

The current schema has no Row Level Security policies and grants the publishable
key access to registration data. Add RLS policies before treating the key as a
database authorization boundary.

## Database

The schema stores every attendee as a row in `registrations`. Extra persons are
created by the application and linked to the primary registration through
`linked_to_id`.

For local development with Docker running:

```bash
yarn db:start
yarn db:reset
```

To apply migrations to a hosted Supabase project:

```bash
yarn supabase link --project-ref YOUR_PROJECT_REF
yarn db:push
```

The migration is schema-only and does not add demo attendees.

## Development

```bash
yarn dev
```

Quality checks:

```bash
yarn lint
yarn build
```

Gate volunteers can sign in and search the attendee list at `/gate`.
