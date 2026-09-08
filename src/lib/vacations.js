// Firestore retries this transaction when another client changes either record.
export async function signVacation(db, assignmentId, signatureData) {
  if (typeof signatureData !== 'string' || !signatureData.startsWith('data:image/') || signatureData.length > 200000) {
    throw new Error('Firma inválida');
  }
  const assignmentRef = db.collection('vacationAssignments').doc(assignmentId);
  return db.runTransaction(async transaction => {
    const snapshot = await transaction.get(assignmentRef);
    if (!snapshot.exists) throw new Error('La asignación ya no existe');
    const assignment = snapshot.data();
    if (assignment.status === 'signed') return;
    if (assignment.status !== 'pending' || !Number.isFinite(assignment.days) || assignment.days <= 0) throw new Error('Asignación inválida');
    const employeeRef = db.collection('employees').doc(String(assignment.employeeId));
    const employee = await transaction.get(employeeRef);
    if (!employee.exists || !Number.isFinite(employee.data().vacationDays)) throw new Error('Saldo inválido');
    const signedAt = new Date().toISOString();
    transaction.update(assignmentRef, { status: 'signed', signatureData, signedAt });
    transaction.update(employeeRef, {
      vacationDays: employee.data().vacationDays - assignment.days,
      lastVacationAssignmentId: assignmentId,
    });
  });
}
