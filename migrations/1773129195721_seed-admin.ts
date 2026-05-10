import type { MigrationBuilder } from "node-pg-migrate";
import bcrypt from "bcrypt";

export async function up(pgm: MigrationBuilder): Promise<void> {
  const passwordHash = await bcrypt.hash("admin123", 10);

  pgm.sql(`
    INSERT INTO users (name, email, password, role)
    VALUES (
      'Admin',
      'admin@clientpilot.com',
      '${passwordHash}',
      'admin'
    )
    ON CONFLICT (email) DO NOTHING;
  `);
}

export async function down(pgm: MigrationBuilder): Promise<void> {
  pgm.sql(`
    DELETE FROM users WHERE email = 'admin@clientpilot.com';
  `);
}
