"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.up = up;
exports.down = down;
const bcrypt_1 = __importDefault(require("bcrypt"));
async function up(pgm) {
    // Hash the default admin password
    const passwordHash = await bcrypt_1.default.hash("admin123", 10);
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
async function down(pgm) {
    pgm.sql(`
    DELETE FROM users WHERE email = 'admin@clientpilot.com';
  `);
}
