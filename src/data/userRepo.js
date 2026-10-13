// Capa DATA — Acceso a datos con SQLite (persistencia real).
import sqlite3 from 'sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DB_PATH = process.env.DB_PATH || path.join(__dirname, '..', '..', 'data.sqlite');

let db;

export const init = () =>
  new Promise((resolve, reject) => {
    db = new sqlite3.Database(DB_PATH, (err) => {
      if (err) return reject(err);
      db.run(`
        CREATE TABLE IF NOT EXISTS users (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          email TEXT UNIQUE NOT NULL,
          name TEXT NOT NULL,
          password_hash TEXT,
          role TEXT NOT NULL DEFAULT 'user',
          confirmed INTEGER NOT NULL DEFAULT 0,
          provider TEXT NOT NULL DEFAULT 'local',
          confirm_token TEXT,
          deleted INTEGER NOT NULL DEFAULT 0,
          created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
        )
      `, (err2) => (err2 ? reject(err2) : resolve()));
    });
  });

export const findAll = () =>
  new Promise((res, rej) =>
    db.all(`SELECT id,email,name,role,confirmed,provider,deleted FROM users WHERE deleted=0`,
      (e, r) => e ? rej(e) : res(r)));

export const findById = (id) =>
  new Promise((res, rej) =>
    db.get(`SELECT * FROM users WHERE id=?`, [id], (e, r) => e ? rej(e) : res(r)));

export const findByEmail = (email) =>
  new Promise((res, rej) =>
    db.get(`SELECT * FROM users WHERE email=?`, [email.toLowerCase()], (e, r) => e ? rej(e) : res(r)));

export const create = ({ email, name, passwordHash = null, role = 'user', confirmed = false, provider = 'local', confirmToken = null }) =>
  new Promise((res, rej) =>
    db.run(
      `INSERT INTO users (email,name,password_hash,role,confirmed,provider,confirm_token) VALUES (?,?,?,?,?,?,?)`,
      [email.toLowerCase(), name, passwordHash, role, confirmed ? 1 : 0, provider, confirmToken],
      function (e) { e ? rej(e) : res(findById(this.lastID)); }
    ));

export const update = (id, fields) => {
  const keys = Object.keys(fields);
  const values = Object.values(fields);
  const set = keys.map(k => `${k}=?`).join(',');
  return new Promise((res, rej) =>
    db.run(`UPDATE users SET ${set} WHERE id=?`, [...values, id],
      (e) => e ? rej(e) : res(findById(id))));
};

export const remove = (id) =>
  new Promise((res, rej) =>
    db.run(`UPDATE users SET deleted=1 WHERE id=?`, [id],
      function (e) { e ? rej(e) : res(this.changes > 0); }));

export const _reset = () =>
  new Promise((res, rej) =>
    db.run(`DELETE FROM users`, (e) => e ? rej(e) : res()));

export const findAllRaw = () =>
  new Promise((res, rej) =>
    db.all(`SELECT * FROM users`, (e, r) => e ? rej(e) : res(r)));

export const _close = () => new Promise((res) => db && db.close(res));