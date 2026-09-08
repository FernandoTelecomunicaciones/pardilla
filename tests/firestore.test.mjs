import { before, after, test } from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { initializeTestEnvironment, assertFails, assertSucceeds } from '@firebase/rules-unit-testing';
import { signVacation } from '../src/lib/vacations.js';

let env;
before(async () => {
  env = await initializeTestEnvironment({ projectId: 'demo-pardilla', firestore: { host: '127.0.0.1', port: 8080, rules: await readFile('firestore.rules', 'utf8') } });
  await env.clearFirestore();
  await env.withSecurityRulesDisabled(async context => {
    const db = context.firestore();
    for (const [uid, role, linkedEmployeeId] of [['admin','admin',null], ['manager','manager',3], ['alice','empleado',1], ['bob','empleado',2]]) {
      await db.doc(`users/${uid}`).set({ uid, role, linkedEmployeeId });
    }
    await db.doc('employees/1').set({ id: 1, vacationDays: 12 });
    await db.doc('vacationAssignments/a').set({ employeeId: 1, days: 3, status: 'pending' });
    await db.doc('vacationAssignments/b').set({ employeeId: 1, days: 2, status: 'pending' });
    await db.doc('tasks/private').set({ createdBy: 'alice', assignedTo: 'self', completed: false });
    await db.doc('tasks/shared').set({ createdBy: 'admin', assignedTo: 'all', completed: false });
    await db.doc('reports/private').set({ employeeId: '1', anonymous: false, body: 'Ficticio' });
  });
});
after(async () => { await env?.cleanup(); });
const db = uid => uid ? env.authenticatedContext(uid).firestore() : env.unauthenticatedContext().firestore();
test('unauthenticated and unprovisioned accounts cannot read employee data', async () => {
  await assertFails(db().doc('employees/1').get());
  await assertFails(db('outsider').doc('employees/1').get());
});
test('employees cannot elevate roles or create an administrator', async () => {
  await assertFails(db('alice').doc('users/alice').update({ role: 'admin' }));
  await assertFails(db('outsider').doc('users/outsider').set({ role: 'admin' }));
});
test('administrator can provision users; manager cannot', async () => {
  await assertSucceeds(db('admin').doc('users/new').set({ role:'empleado', linkedEmployeeId:null }));
  await assertFails(db('manager').doc('users/other').set({ role:'admin' }));
});
test('employee cannot read or complete another employee private task', async () => {
  await assertFails(db('bob').doc('tasks/private').get());
  await assertFails(db('bob').doc('tasks/private').update({ completed: true }));
  await assertSucceeds(db('alice').doc('tasks/private').get());
  await assertSucceeds(db('bob').doc('tasks/shared').update({ completed: true }));
});
test('task queries used by the app are allowed; unfiltered employee query is denied', async () => {
  await assertSucceeds(db('alice').collection('tasks').where('createdBy','==','alice').get());
  await assertSucceeds(db('alice').collection('tasks').where('assignedTo','in',['all','1']).get());
  await assertFails(db('alice').collection('tasks').get());
});
test('confidential reports cannot be read by another employee', async () => {
  await assertFails(db('bob').doc('reports/private').get());
  await assertSucceeds(db('alice').doc('reports/private').get());
});
test('vacation signature and debit are atomic and idempotent', async () => {
  const alice = db('alice');
  await assertFails(alice.doc('vacationAssignments/a').update({status:'signed', signatureData:'data:image/png;base64,AA',signedAt:'test'}));
  await assertFails(alice.doc('employees/1').update({vacationDays:100}));
  await signVacation(alice,'a','data:image/png;base64,AA');
  await signVacation(alice,'a','data:image/png;base64,AA');
  assert.equal((await alice.doc('employees/1').get()).data().vacationDays,9);
  assert.equal((await alice.doc('vacationAssignments/a').get()).data().status,'signed');
});
test('cannot sign another employee vacation or change assignment days', async () => {
  await assert.rejects(signVacation(db('bob'),'b','data:image/png;base64,AA'));
  await assertFails(db('alice').doc('vacationAssignments/b').update({days:20,status:'signed'}));
});
test('time entries cannot impersonate others, and cannot be edited or deleted', async () => {
  const entry = { userId:'alice', employeeId:1, type:'entrada', date:'2026-09-09',time:'08:00',signature:'data:image/png;base64,AA' };
  await assertFails(db('bob').doc('registros_horarios/bad').set(entry));
  await assertFails(db('outsider').doc('registros_horarios/out').set({...entry,userId:'outsider'}));
  await assertSucceeds(db('alice').doc('registros_horarios/good').set(entry));
  await assertFails(db('admin').doc('registros_horarios/good').update({time:'09:00'}));
  await assertFails(db('admin').doc('registros_horarios/good').delete());
});
