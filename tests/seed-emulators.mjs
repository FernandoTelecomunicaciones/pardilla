// Only touches the demo emulator on loopback; never accepts a remote host.
import { initializeTestEnvironment } from '@firebase/rules-unit-testing';
const env = await initializeTestEnvironment({projectId:'demo-pardilla',firestore:{host:'127.0.0.1',port:8080}});
try {
  for (const [email, role, employeeId] of [['admin@example.test','admin',null],['employee@example.test','empleado',101]]) {
    const response = await fetch('http://127.0.0.1:9099/identitytoolkit.googleapis.com/v1/accounts:signUp?key=demo-key', {
      method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({email,password:'Local-test-only-2026',returnSecureToken:true})
    });
    let account = await response.json();
    if (!response.ok && account.error?.message === 'EMAIL_EXISTS') {
      const login = await fetch('http://127.0.0.1:9099/identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=demo-key', {
        method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({email,password:'Local-test-only-2026',returnSecureToken:true})
      });
      account = await login.json();
    }
    if (!account.localId) throw new Error('No se pudo crear la cuenta ficticia');
    await env.withSecurityRulesDisabled(async context => {
      const db=context.firestore();
      await db.doc(`users/${account.localId}`).set({uid:account.localId,email,role,name:role==='admin'?'Administración QA':'Empleado QA',linkedEmployeeId:employeeId});
      if (employeeId) await db.doc(`employees/${employeeId}`).set({id:employeeId,name:'Empleado QA',role:'Dependiente',vacationDays:10,monthsWorked:0,workedHolidays:0,shiftType:'store'});
    });
  }
  console.log('Cuentas ficticias preparadas exclusivamente en los emuladores locales.');
} finally { await env.cleanup(); }
