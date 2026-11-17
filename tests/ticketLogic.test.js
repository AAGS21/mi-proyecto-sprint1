// tests/ticketLogic.test.js
import { describe, it, expect, beforeEach, afterAll } from 'vitest';
import * as ticketLogic from '../src/logic/ticketLogic.js';
import * as ticketRepo from '../src/data/ticketRepo.js';

process.env.DB_PATH = ':memory:';

const normalUser = { id: 10, role: 'user' };
const otherUser = { id: 20, role: 'user' };
const adminUser = { id: 1, role: 'admin' };

beforeEach(async () => {
  await ticketRepo.init();
  await ticketRepo._reset();
});

afterAll(async () => {
  await ticketRepo._close();
});

describe('createTicket', () => {
  it('crea un ticket correctamente en estado abierto', async () => {
    const t = await ticketLogic.createTicket({
      requester: normalUser,
      title: 'Fallo en VPN',
      description: 'No conecta desde casa',
      priority: 'alta',
    });
    expect(t.title).toBe('Fallo en VPN');
    expect(t.priority).toBe('alta');
    expect(t.status).toBe('abierto');
    expect(t.user_id).toBe(10);
  });

  it('lanza error si el título está vacío (caso de error)', async () => {
    await expect(
      ticketLogic.createTicket({ requester: normalUser, title: '   ', priority: 'media' })
    ).rejects.toThrow('El título del ticket es obligatorio');
  });

  it('lanza error si la prioridad no es válida (caso de error)', async () => {
    await expect(
      ticketLogic.createTicket({ requester: normalUser, title: 'PC lento', priority: 'urgente' })
    ).rejects.toThrow('Prioridad inválida');
  });
});

describe('listTickets', () => {
  it('un usuario normal solo ve sus propios tickets y el admin ve todos', async () => {
    await ticketLogic.createTicket({ requester: normalUser, title: 'Ticket de User 10' });
    await ticketLogic.createTicket({ requester: otherUser, title: 'Ticket de User 20' });

    const userList = await ticketLogic.listTickets({ requester: normalUser });
    expect(userList).toHaveLength(1);
    expect(userList[0].title).toBe('Ticket de User 10');

    const adminList = await ticketLogic.listTickets({ requester: adminUser });
    expect(adminList).toHaveLength(2);
  });
});

describe('resolveTicket y deleteTicket (autorización)', () => {
  it('rechaza que un usuario normal resuelva un ticket (caso de error)', async () => {
    const t = await ticketLogic.createTicket({ requester: normalUser, title: 'Impresora' });
    await expect(
      ticketLogic.resolveTicket({ requester: normalUser, ticketId: t.id })
    ).rejects.toThrow('solo un administrador puede resolver tickets');
  });

  it('rechaza que un usuario normal elimine el ticket de otro usuario (caso de error)', async () => {
    const t = await ticketLogic.createTicket({ requester: normalUser, title: 'Monitor roto' });
    await expect(
      ticketLogic.deleteTicket({ requester: otherUser, ticketId: t.id })
    ).rejects.toThrow('No tienes permiso para eliminar este ticket');
  });

  it('permite al admin resolver y eliminar cualquier ticket', async () => {
    const t = await ticketLogic.createTicket({ requester: normalUser, title: 'Red caída' });
    const resolved = await ticketLogic.resolveTicket({ requester: adminUser, ticketId: t.id });
    expect(resolved.status).toBe('resuelto');
    expect(await ticketLogic.deleteTicket({ requester: adminUser, ticketId: t.id })).toBe(true);
  });
});