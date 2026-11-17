// src/data/ticketRepo.js
// Capa DATA — Acceso a datos de Tickets con SQLite (sin reglas de negocio).
import sqlite3 from 'sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

let db;

export const init = () =>
  new Promise((resolve, reject) => {
    const dbPath = process.env.DB_PATH || path.join(__dirname, '..', '..', 'data.sqlite');
    db = new sqlite3.Database(dbPath, (err) => {
      if (err) return reject(err);
      db.run(`
        CREATE TABLE IF NOT EXISTS tickets (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          user_id INTEGER NOT NULL,
          title TEXT NOT NULL,
          description TEXT NOT NULL,
          priority TEXT NOT NULL DEFAULT 'media',
          status TEXT NOT NULL DEFAULT 'abierto',
          created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
        )
      `, (err2) => (err2 ? reject(err2) : resolve()));
    });
  });

export const findById = (id) =>
  new Promise((res, rej) =>
    db.get(`SELECT * FROM tickets WHERE id=?`, [id], (e, r) => (e ? rej(e) : res(r))));

export const findAll = () =>
  new Promise((res, rej) =>
    db.all(`SELECT * FROM tickets ORDER BY id DESC`, (e, r) => (e ? rej(e) : res(r))));

export const findByUserId = (userId) =>
  new Promise((res, rej) =>
    db.all(`SELECT * FROM tickets WHERE user_id=? ORDER BY id DESC`, [userId], (e, r) => (e ? rej(e) : res(r))));

export const create = ({ userId, title, description, priority = 'media' }) =>
  new Promise((res, rej) =>
    db.run(
      `INSERT INTO tickets (user_id, title, description, priority, status) VALUES (?, ?, ?, ?, 'abierto')`,
      [userId, title, description, priority],
      function (e) { e ? rej(e) : res(findById(this.lastID)); }
    ));

export const updateStatus = (id, status) =>
  new Promise((res, rej) =>
    db.run(`UPDATE tickets SET status=? WHERE id=?`, [status, id],
      (e) => (e ? rej(e) : res(findById(id)))));

export const remove = (id) =>
  new Promise((res, rej) =>
    db.run(`DELETE FROM tickets WHERE id=?`, [id],
      function (e) { e ? rej(e) : res(this.changes > 0); }));

export const _reset = () =>
  new Promise((res, rej) =>
    db.run(`DELETE FROM tickets`, (e) => (e ? rej(e) : res())));

export const _close = () => new Promise((res) => db && db.close(res));