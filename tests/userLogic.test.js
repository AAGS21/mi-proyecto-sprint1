import { describe, it, expect, beforeEach, afterAll } from 'vitest';
import * as logic from '../src/logic/userLogic.js';
import * as repo from '../src/data/userRepo.js';

process.env.DB_PATH = ':memory:';

beforeEach(async () => {
  await repo.init();
  await repo._reset();
});

afterAll(async () => { await repo._close(); });

describe('registerUser', () => {
  it('registra un usuario nuevo', async () => {
    const { user } = await logic.registerUser({
      email: 'ana@test.com', name: 'Ana', password: 'secreto123',
    });
    expect(user.email).toBe('ana@test.com');
    expect(user.role).toBe('user');
    expect(user.confirmed).toBe(0);
  });

  it('lanza error si el email ya existe (caso de error)', async () => {
    await logic.registerUser({ email: 'a@a.com', name: 'A', password: '123456' });
    await expect(logic.registerUser({ email: 'a@a.com', name: 'B', password: '123456' }))
      .rejects.toThrow('Ya existe un usuario con ese email');
  });

  it('lanza error si la contraseña es corta', async () => {
    await expect(logic.registerUser({ email: 'b@b.com', name: 'B', password: '123' }))
      .rejects.toThrow('al menos 6 caracteres');
  });
});

describe('loginUser', () => {
  it('rechaza login si la cuenta no está confirmada', async () => {
    await logic.registerUser({ email: 'c@c.com', name: 'C', password: '123456' });
    await expect(logic.loginUser({ email: 'c@c.com', password: '123456' }))
      .rejects.toThrow('pendiente de confirmación');
  });

  it('rechaza login con contraseña incorrecta (caso de error)', async () => {
    const { user } = await logic.registerUser({ email: 'd@d.com', name: 'D', password: '123456' });
    await repo.update(user.id, { confirmed: 1 });
    await expect(logic.loginUser({ email: 'd@d.com', password: 'mala' }))
      .rejects.toThrow('Credenciales inválidas');
  });
});

describe('isUserActive', () => {
  it('false si no está confirmado', async () => {
    const { user } = await logic.registerUser({ email: 'e@e.com', name: 'E', password: '123456' });
    expect(await logic.isUserActive(user.id)).toBe(false);
  });
});

describe('deleteUser', () => {
  it('un usuario normal NO puede eliminar a otro', async () => {
    const { user: a } = await logic.registerUser({ email: 'fa@a.com', name: 'A', password: '123456' });
    const { user: b } = await logic.registerUser({ email: 'fb@b.com', name: 'B', password: '123456' });
    await expect(logic.deleteUser({ requester: a, targetId: b.id }))
      .rejects.toThrow('No tienes permiso');
  });

  it('un admin SÍ puede eliminar a otro', async () => {
    const { user: admin } = await logic.registerUser({ email: 'g@g.com', name: 'G', password: '123456' });
    await repo.update(admin.id, { role: 'admin' });
    const adminFull = await repo.findById(admin.id);
    const { user: victim } = await logic.registerUser({ email: 'h@h.com', name: 'H', password: '123456' });
    expect(await logic.deleteUser({ requester: adminFull, targetId: victim.id })).toBe(true);
  });
});

describe('confirmAccount', () => {
  it('confirma con token válido', async () => {
    const { confirmToken } = await logic.registerUser({ email: 'i@i.com', name: 'I', password: '123456' });
    expect(await logic.confirmAccount(confirmToken)).toBe(true);
  });

  it('falla con token inválido (caso de error)', async () => {
    await expect(logic.confirmAccount('noexiste')).rejects.toThrow('Token');
  });
});