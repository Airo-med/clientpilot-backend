import type { MigrationBuilder } from "node-pg-migrate";

export async function up(pgm: MigrationBuilder): Promise<void> {
  pgm.sql(`
    ALTER TABLE users ADD COLUMN IF NOT EXISTS subscription_status varchar(20) NOT NULL DEFAULT 'free';
    ALTER TABLE users ADD COLUMN IF NOT EXISTS stripe_customer_id text;
    ALTER TABLE users ADD COLUMN IF NOT EXISTS password_reset_token text;
    ALTER TABLE users ADD COLUMN IF NOT EXISTS password_reset_expires timestamptz;
  `);

  pgm.sql(`
    DO $migrate$ BEGIN
      CREATE TYPE project_status AS ENUM ('active', 'completed');
    EXCEPTION
      WHEN duplicate_object THEN NULL;
    END $migrate$;
  `);

  pgm.sql(`
    DO $migrate$ BEGIN
      CREATE TYPE invoice_status AS ENUM ('paid', 'unpaid');
    EXCEPTION
      WHEN duplicate_object THEN NULL;
    END $migrate$;
  `);

  pgm.sql(`
    DO $outer$
    DECLARE
      uid_type text;
    BEGIN
      SELECT c.data_type INTO uid_type
      FROM information_schema.columns c
      WHERE c.table_schema = 'public'
        AND c.table_name = 'users'
        AND c.column_name = 'id';

      IF uid_type IS NULL THEN
        RAISE EXCEPTION 'public.users.id not found';
      END IF;

      IF uid_type NOT IN ('uuid', 'integer') THEN
        RAISE EXCEPTION 'public.users.id must be uuid or integer (got %)', uid_type;
      END IF;

      IF uid_type = 'uuid' THEN
        EXECUTE $sql$
          CREATE TABLE IF NOT EXISTS clients (
            id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
            user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
            name varchar(255) NOT NULL,
            email varchar(255),
            phone varchar(50),
            created_at timestamptz NOT NULL DEFAULT current_timestamp,
            updated_at timestamptz NOT NULL DEFAULT current_timestamp
          );
        $sql$;
        EXECUTE $sql$
          CREATE TABLE IF NOT EXISTS projects (
            id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
            user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
            client_id uuid NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
            title varchar(255) NOT NULL,
            description text,
            status project_status NOT NULL DEFAULT 'active'::project_status,
            notes text,
            attachment_url text,
            created_at timestamptz NOT NULL DEFAULT current_timestamp,
            updated_at timestamptz NOT NULL DEFAULT current_timestamp
          );
        $sql$;
        EXECUTE $sql$
          CREATE TABLE IF NOT EXISTS invoices (
            id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
            user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
            project_id uuid NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
            amount numeric(12,2) NOT NULL,
            status invoice_status NOT NULL DEFAULT 'unpaid'::invoice_status,
            due_date date NOT NULL,
            paid_at timestamptz,
            pdf_url text,
            created_at timestamptz NOT NULL DEFAULT current_timestamp,
            updated_at timestamptz NOT NULL DEFAULT current_timestamp
          );
        $sql$;
      ELSE
        EXECUTE $sql$
          CREATE TABLE IF NOT EXISTS clients (
            id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
            user_id integer NOT NULL REFERENCES users(id) ON DELETE CASCADE,
            name varchar(255) NOT NULL,
            email varchar(255),
            phone varchar(50),
            created_at timestamptz NOT NULL DEFAULT current_timestamp,
            updated_at timestamptz NOT NULL DEFAULT current_timestamp
          );
        $sql$;
        EXECUTE $sql$
          CREATE TABLE IF NOT EXISTS projects (
            id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
            user_id integer NOT NULL REFERENCES users(id) ON DELETE CASCADE,
            client_id uuid NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
            title varchar(255) NOT NULL,
            description text,
            status project_status NOT NULL DEFAULT 'active'::project_status,
            notes text,
            attachment_url text,
            created_at timestamptz NOT NULL DEFAULT current_timestamp,
            updated_at timestamptz NOT NULL DEFAULT current_timestamp
          );
        $sql$;
        EXECUTE $sql$
          CREATE TABLE IF NOT EXISTS invoices (
            id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
            user_id integer NOT NULL REFERENCES users(id) ON DELETE CASCADE,
            project_id uuid NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
            amount numeric(12,2) NOT NULL,
            status invoice_status NOT NULL DEFAULT 'unpaid'::invoice_status,
            due_date date NOT NULL,
            paid_at timestamptz,
            pdf_url text,
            created_at timestamptz NOT NULL DEFAULT current_timestamp,
            updated_at timestamptz NOT NULL DEFAULT current_timestamp
          );
        $sql$;
      END IF;
    END $outer$;
  `);

  pgm.createIndex("clients", "user_id", {
    name: "clients_user_id_idx",
    ifNotExists: true,
  });
  pgm.createIndex("projects", "user_id", {
    name: "projects_user_id_idx",
    ifNotExists: true,
  });
  pgm.createIndex("projects", "client_id", {
    name: "projects_client_id_idx",
    ifNotExists: true,
  });
  pgm.createIndex("invoices", "user_id", {
    name: "invoices_user_id_idx",
    ifNotExists: true,
  });
  pgm.createIndex("invoices", "project_id", {
    name: "invoices_project_id_idx",
    ifNotExists: true,
  });
}

export async function down(pgm: MigrationBuilder): Promise<void> {
  pgm.dropTable("invoices", { ifExists: true });
  pgm.dropTable("projects", { ifExists: true });
  pgm.dropTable("clients", { ifExists: true });
  pgm.sql(`
    ALTER TABLE users DROP COLUMN IF EXISTS subscription_status;
    ALTER TABLE users DROP COLUMN IF EXISTS stripe_customer_id;
    ALTER TABLE users DROP COLUMN IF EXISTS password_reset_token;
    ALTER TABLE users DROP COLUMN IF EXISTS password_reset_expires;
  `);
  pgm.sql(`DROP TYPE IF EXISTS invoice_status;`);
  pgm.sql(`DROP TYPE IF EXISTS project_status;`);
}
