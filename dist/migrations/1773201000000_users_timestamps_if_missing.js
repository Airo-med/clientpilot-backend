"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.up = up;
exports.down = down;
/**
 * Older or manually created `public.users` tables may lack `updated_at` (or
 * `created_at`). Registration RETURNING expects both; add them idempotently.
 */
async function up(pgm) {
    pgm.sql(`
    ALTER TABLE users ADD COLUMN IF NOT EXISTS created_at timestamptz NOT NULL DEFAULT current_timestamp;
    ALTER TABLE users ADD COLUMN IF NOT EXISTS updated_at timestamptz NOT NULL DEFAULT current_timestamp;
  `);
}
async function down(_pgm) {
    /* Irreversible: these columns may have existed before this migration. */
}
