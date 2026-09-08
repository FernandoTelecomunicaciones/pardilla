export function csvCell(value) {
  let text = String(value ?? '');
  if (/^[\s]*[=+@-]/.test(text)) text = "'" + text;
  return '"' + text.replaceAll('"', '""') + '"';
}

// Keep numeric IDs for existing selectors, but never overwrite a colliding ID.
export async function createRecord(db, collection, data) {
  const random = new Uint32Array(1);
  crypto.getRandomValues(random);
  const id = Date.now() * 1000 + random[0] % 1000;
  const ref = db.collection(collection).doc(String(id));
  await db.runTransaction(async transaction => {
    if ((await transaction.get(ref)).exists) throw new Error('Conflicto al crear. Vuelve a intentarlo.');
    transaction.set(ref, { ...data, id });
  });
  return id;
}
