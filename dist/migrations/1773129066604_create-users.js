"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.up = up;
exports.down = down;
async function up(pgm) {
    // Create UUID extension if not exists
    pgm.createExtension("pgcrypto", { ifNotExists: true });
    // Enum: no IF NOT EXISTS in node-pg-migrate; safe if a previous run left the type behind
    pgm.sql(`
    DO $migrate$ BEGIN
      CREATE TYPE "user_role" AS ENUM ('admin', 'user');
    EXCEPTION
      WHEN duplicate_object THEN NULL;
    END $migrate$;
  `);
    // Table may already exist from an older migration or manual schema
    pgm.createTable("users", {
        id: {
            type: "uuid",
            primaryKey: true,
            default: pgm.func("gen_random_uuid()"),
        },
        name: {
            type: "varchar(100)",
            notNull: true,
        },
        email: {
            type: "varchar(150)",
            notNull: true,
            unique: true,
        },
        password: {
            type: "text",
            notNull: true,
        },
        role: {
            type: "user_role",
            notNull: true,
            default: "user",
        },
        created_at: {
            type: "timestamp",
            notNull: true,
            default: pgm.func("current_timestamp"),
        },
        updated_at: {
            type: "timestamp",
            notNull: true,
            default: pgm.func("current_timestamp"),
        },
    }, { ifNotExists: true });
}
async function down(pgm) {
    pgm.dropTable("users", { ifExists: true });
    pgm.dropType("user_role", { ifExists: true });
}
