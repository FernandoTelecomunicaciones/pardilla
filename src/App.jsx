import { csvCell, createRecord } from "./lib/records.js";
import { firebaseConfig, connectEmulators } from "./firebase.js";
import { signVacation } from "./lib/vacations.js";
import { useState, useEffect, useRef, useCallback, useMemo, Component } from "react";
import {
  parseLocalDate,
  toLocalDateStr,
  getMondayOfWeek,
  isSummerPeriod,
  getCurrentShift,
  isNewerVersion,
} from "./lib/core.js";
import { analizarJornada, jornadasSinCerrar, formatearDuracion, esRegularizacion, minutosDeHora } from "./lib/jornada.js";

// ─── CSS ─────────────────────────────────────────────────────────────────────
const styles = `
  * { margin: 0; padding: 0; box-sizing: border-box; }
  :root {
    --primary: #8B4513; --primary-dark: #6B3410; --primary-light: #A0522D;
    --secondary: #D2B48C; --success: #4CAF50; --danger: #F44336;
    --warning: #FF9800; --info: #2196F3; --light: #F5F1E8;
    --dark: #333; --border: #DDD; --shadow: 0 2px 8px rgba(0,0,0,0.1);
    --card-bg: #FEFDFB; --radius: 12px; --radius-sm: 8px;
  }
  html, body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
    background-color: var(--light); color: var(--dark); overflow-x: hidden; }
  body { padding-top: env(safe-area-inset-top); padding-left: env(safe-area-inset-left);
    padding-right: env(safe-area-inset-right); padding-bottom: env(safe-area-inset-bottom); }
  #root { min-height: 100vh; display: flex; flex-direction: column; }
  .header { background: var(--primary); color: white; padding: 16px;
    display: flex; justify-content: space-between; align-items: center;
    box-shadow: var(--shadow); position: sticky; top: 0; z-index: 100; }
  .header h1 { font-size: 24px; display: flex; align-items: center; gap: 8px; }
  .header-right { display: flex; align-items: center; gap: 16px; }
  .header-user { display: flex; align-items: center; gap: 8px; font-size: 14px; }
  .logout-btn { background: rgba(255,255,255,0.2); border: 1px solid rgba(255,255,255,0.4);
    color: white; padding: 8px 12px; border-radius: 6px; cursor: pointer;
    font-size: 16px; font-family: inherit; }
  .logout-btn:hover { background: rgba(255,255,255,0.3); }
  .nav-tabs { display: flex; background: white; border-bottom: 1px solid var(--border);
    overflow-x: auto; -webkit-overflow-scrolling: touch; }
  .nav-tab { padding: 12px 16px; border: none; background: transparent; cursor: pointer;
    font-size: 14px; font-weight: 500; color: var(--dark);
    border-bottom: 3px solid transparent; transition: all 0.3s ease; white-space: nowrap; }
  .nav-tab.active { color: var(--primary); border-bottom-color: var(--primary); }
  .nav-tab:hover { color: var(--primary); }
  .container { flex: 1; padding: 16px; max-width: 1200px; margin: 0 auto; width: 100%; }
  .card { background: var(--card-bg); border-radius: var(--radius); padding: 20px;
    box-shadow: var(--shadow); margin-bottom: 16px; }
  .badge { display: inline-block; padding: 4px 12px; border-radius: 20px;
    font-size: 12px; font-weight: 600; background: var(--primary); color: white; }
  .role-badge { display: inline-block; padding: 4px 8px; border-radius: 12px;
    font-size: 11px; font-weight: 600; }
  .role-admin { background: #FFEBEE; color: #C62828; }
  .role-manager { background: #E3F2FD; color: #1565C0; }
  .role-empleado { background: #E8F5E9; color: #2E7D32; }
  .btn { padding: 10px 16px; border: none; border-radius: var(--radius-sm);
    font-size: 14px; font-weight: 600; cursor: pointer; font-family: inherit;
    transition: all 0.3s ease; }
  .btn:disabled { opacity: 0.5; cursor: not-allowed; }
  .btn-primary { background: var(--primary); color: white; }
  .btn-primary:hover:not(:disabled) { background: var(--primary-dark); transform: translateY(-2px); }
  .btn-secondary { background: var(--secondary); color: var(--dark); }
  .btn-secondary:hover:not(:disabled) { background: #C9A961; }
  .btn-success { background: var(--success); color: white; }
  .btn-success:hover:not(:disabled) { background: #45a049; }
  .btn-danger { background: var(--danger); color: white; }
  .btn-danger:hover:not(:disabled) { background: #da190b; }
  .btn-sm { padding: 6px 12px; font-size: 12px; }
  .input { width: 100%; padding: 12px; border: 1px solid var(--border);
    border-radius: var(--radius-sm); font-size: 16px; font-family: inherit; margin-bottom: 12px; }
  .input:focus { outline: none; border-color: var(--primary);
    box-shadow: 0 0 0 3px rgba(139, 69, 19, 0.1); }
  .input.error { border-color: var(--danger); }
  .form-error { color: var(--danger); font-size: 12px; margin-top: -8px; margin-bottom: 8px; }
  .form-group { margin-bottom: 16px; }
  .form-group label { display: block; margin-bottom: 6px; font-weight: 600; font-size: 14px; }
  .login-screen { display: flex; flex-direction: column; min-height: 100vh; align-items: center;
    justify-content: center; background: linear-gradient(135deg, var(--primary-dark), var(--primary));
    padding: 24px 16px; overflow-y: auto; }
  .login-card { background: white; border-radius: var(--radius); padding: 32px;
    width: 100%; max-width: 400px; flex-shrink: 0; box-shadow: 0 20px 60px rgba(0,0,0,0.3); }
  .login-logo { text-align: center; margin-bottom: 24px; }
  .login-logo .icon { font-size: 64px; }
  .login-logo h2 { color: var(--primary); margin-top: 8px; }
  .firebase-config { background: var(--card-bg); border: 2px solid var(--warning);
    border-radius: var(--radius); padding: 20px; margin-bottom: 16px; }
  .firebase-config h3 { color: var(--warning); margin-bottom: 12px; }
  .home-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
    gap: 12px; margin-bottom: 16px; }
  .home-card { background: var(--card-bg); border: 2px solid var(--border);
    border-radius: var(--radius-sm); padding: 20px; text-align: center;
    cursor: pointer; transition: all 0.3s ease; }
  .home-card:hover { border-color: var(--primary); transform: translateY(-4px); box-shadow: var(--shadow); }
  .home-card .icon { font-size: 32px; margin-bottom: 8px; }
  .home-card .label { font-weight: 600; font-size: 14px; color: var(--dark); }
  .employee-card { background: var(--card-bg); border-radius: var(--radius-sm);
    padding: 16px; margin-bottom: 12px; border-left: 4px solid var(--primary);
    display: flex; justify-content: space-between; align-items: center; }
  .employee-card .info { flex: 1; cursor: pointer; }
  .employee-card .name { font-weight: 600; font-size: 16px; }
  .employee-card .role { font-size: 13px; color: #666; }
  .employee-card .actions { display: flex; gap: 8px; }
  .product-card { background: var(--card-bg); border-radius: var(--radius-sm);
    padding: 16px; margin-bottom: 12px; border-left: 4px solid var(--secondary);
    display: flex; justify-content: space-between; align-items: center; }
  .product-card .info { flex: 1; cursor: pointer; }
  .product-card .name { font-weight: 600; font-size: 16px; }
  .product-card .price { font-size: 18px; color: var(--primary); font-weight: 700; }
  .stat-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
    gap: 12px; margin: 16px 0; }
  .stat-box { background: var(--card-bg); border-radius: var(--radius-sm);
    padding: 12px; text-align: center; border-top: 3px solid var(--primary); }
  .stat-box .label { font-size: 12px; color: #666; margin-bottom: 4px; }
  .stat-box .value { font-size: 24px; font-weight: 700; color: var(--primary); }
  .modal { position: fixed; top: 0; left: 0; right: 0; bottom: 0;
    background: rgba(0,0,0,0.5); display: flex; align-items: center;
    justify-content: center; z-index: 200; padding: 16px; }
  .modal-content { background: white; border-radius: var(--radius); padding: 24px;
    max-width: 500px; width: 100%; max-height: 90vh; overflow-y: auto; }
  .modal-header { font-size: 20px; font-weight: 700; margin-bottom: 16px;
    display: flex; justify-content: space-between; align-items: center; }
  .modal-close { background: transparent; border: none; font-size: 24px;
    cursor: pointer; color: var(--dark); }
  .modal-footer { display: flex; gap: 8px; margin-top: 20px; justify-content: flex-end; flex-wrap: wrap; }
  .notification { position: fixed; bottom: 20px; right: 20px; background: var(--success);
    color: white; padding: 16px 20px; border-radius: var(--radius-sm);
    box-shadow: var(--shadow); z-index: 300; animation: slideIn 0.3s ease;
    max-width: calc(100vw - 40px); }
  .notification.error { background: var(--danger); }
  .notification.warning { background: var(--warning); }
  @keyframes slideIn { from { transform: translateX(400px); opacity: 0; }
    to { transform: translateX(0); opacity: 1; } }
  .loading-spinner { display: flex; flex-direction: column; align-items: center;
    justify-content: center; min-height: 200px; gap: 16px; }
  .spinner { border: 4px solid var(--light); border-top-color: var(--primary);
    border-radius: 50%; width: 40px; height: 40px; animation: spin 1s linear infinite; }
  @keyframes spin { to { transform: rotate(360deg); } }
  .loading-text { color: var(--primary); font-weight: 600; }
  .search-box { margin-bottom: 16px; }
  .search-box input { width: 100%; padding: 12px; border: 1px solid var(--border);
    border-radius: var(--radius-sm); font-size: 16px; }
  .calendar-month { display: grid; grid-template-columns: repeat(7, 1fr); gap: 4px; }
  .cal-day { aspect-ratio: 1; display: flex; align-items: center; justify-content: center;
    border-radius: 8px; font-size: 12px; cursor: pointer; border: 1px solid var(--border);
    background: white; }
  .cal-day.holiday { background: var(--danger); color: white; font-weight: 700; }
  .cal-day.worked-holiday { background: var(--warning); color: white; font-weight: 700; }
  .vacation-control { display: flex; justify-content: center; align-items: center;
    gap: 16px; margin: 16px 0; }
  .vacation-btn { background: var(--primary); color: white; border: none;
    border-radius: 50%; width: 44px; height: 44px; font-size: 24px;
    cursor: pointer; display: flex; align-items: center; justify-content: center;
    font-weight: 700; }
  .vacation-btn:hover:not(:disabled) { background: var(--primary-dark); }
  .vacation-btn:disabled { opacity: 0.4; cursor: not-allowed; }
  .vacation-value { font-size: 28px; font-weight: 700; color: var(--primary); text-align: center; }
  .score-display { display: flex; align-items: center; justify-content: center; gap: 24px; margin: 24px 0; }
  .score-number { font-size: 64px; font-weight: 700; color: var(--primary); }
  .score-bar { flex: 1; height: 20px; background: var(--light); border-radius: 10px; overflow: hidden; }
  .score-bar-fill { height: 100%; background: linear-gradient(90deg, var(--success), var(--warning), var(--primary)); border-radius: 10px; }
  .idea-card { background: var(--card-bg); border-left: 4px solid var(--info);
    border-radius: var(--radius-sm); padding: 16px; margin-bottom: 12px; }
  .idea-card .title { font-weight: 600; color: var(--dark); margin-bottom: 4px; }
  .idea-card .priority { display: inline-block; padding: 2px 8px; border-radius: 4px;
    font-size: 11px; font-weight: 600; margin-top: 8px; }
  .priority-alta { background: #FFEBEE; color: #C62828; }
  .priority-media { background: #FFF3E0; color: #E65100; }
  .priority-baja { background: #E8F5E9; color: #2E7D32; }
  .content-type-btn { padding: 12px 16px; border: 2px solid var(--border);
    background: white; border-radius: var(--radius-sm); cursor: pointer;
    font-weight: 600; transition: all 0.3s ease; margin-bottom: 12px; width: 100%; }
  .content-type-btn.active { border-color: var(--primary); background: rgba(139, 69, 19, 0.05); color: var(--primary); }
  .content-type-btn:hover { border-color: var(--primary); }
  .result-box { background: var(--light); border-left: 4px solid var(--success);
    border-radius: var(--radius-sm); padding: 16px; margin: 16px 0;
    font-size: 14px; line-height: 1.6; white-space: pre-wrap; word-break: break-word; }
  .demo-banner { background: #FFF8E1; border: 1px solid #FFC107; border-radius: 8px;
    padding: 8px 12px; font-size: 12px; color: #E65100; margin-bottom: 12px; }
  .trend-icon { display: inline-block; font-size: 16px; margin-left: 4px; }
  .fichar-btn { padding: 20px; border-radius: var(--radius); border: none;
    font-size: 18px; font-weight: 700; width: 100%; cursor: pointer;
    margin: 8px 0; font-family: inherit; }
  .fichar-entrada { background: var(--success); color: white; }
  .fichar-entrada:hover:not(:disabled) { background: #45a049; }
  .fichar-salida { background: var(--danger); color: white; }
  .fichar-salida:hover:not(:disabled) { background: #da190b; }
  .registro-card { background: var(--card-bg); border-radius: var(--radius-sm);
    padding: 12px; margin-bottom: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.06);
    border-left: 4px solid var(--info); }
  .user-card { background: var(--card-bg); border-radius: var(--radius-sm);
    padding: 16px; margin-bottom: 12px; border-left: 4px solid var(--primary);
    display: flex; justify-content: space-between; align-items: center; }
  .user-card .info { flex: 1; }
  .user-card .name { font-weight: 600; font-size: 16px; }
  .user-card .role { font-size: 13px; color: #666; margin-top: 4px; }
  .shift-editor-grid { display: grid; grid-template-columns: auto repeat(7, 1fr);
    gap: 4px; font-size: 12px; margin: 16px 0; overflow-x: auto; }
  .shift-cell { padding: 8px 4px; text-align: center; min-width: 70px; }
  .shift-cell input { width: 100%; text-align: center; padding: 6px;
    border: 1px solid var(--border); border-radius: 4px; font-size: 12px; }
  .shift-cell input:focus { outline: none; border-color: var(--primary);
    box-shadow: 0 0 0 2px rgba(139, 69, 19, 0.1); }
  .shift-cell.header { font-weight: 700; background: var(--primary); color: white;
    border-radius: 4px; display: flex; align-items: center; justify-content: center; }
  .turno-badge { display: inline-block; padding: 6px 16px; border-radius: 8px;
    font-weight: 700; font-size: 16px; }
  .turno-A { background: #E8F5E9; color: #2E7D32; }
  .turno-B { background: #E3F2FD; color: #1565C0; }
  .turno-C { background: #FFF3E0; color: #E65100; }
  .turno-V1 { background: #FCE4EC; color: #880E4F; }
  .turno-V2 { background: #F3E5F5; color: #4A148C; }
  .turno-EA { background: #E1F5FE; color: #01579B; }
  .turno-EB { background: #E0F7FA; color: #006064; }
  .turno-P1 { background: #E0F2F1; color: #00695C; }
  .turno-P2 { background: #FFF8E1; color: #F57F17; }
  .turno-P3 { background: #E8EAF6; color: #283593; }
  .summer-badge { display: inline-block; background: #FF7043; color: white; padding: 3px 10px; border-radius: 20px; font-size: 12px; font-weight: 700; margin-left: 8px; }
  .shift-day { background: var(--card-bg); border-radius: var(--radius-sm);
    padding: 12px; margin-bottom: 8px; border-left: 4px solid var(--primary); }
  .shift-day .date { font-weight: 700; font-size: 14px; margin-bottom: 4px; }
  .shift-day .hours { font-size: 13px; color: #666; margin-bottom: 2px; }
  .shift-day.libre { opacity: 0.6; background: #F5F5F5; }
  .week-nav { display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; }
  .week-nav button { padding: 8px 12px; border: none; background: var(--primary);
    color: white; border-radius: var(--radius-sm); cursor: pointer;
    font-family: inherit; font-weight: 600; }
  .week-nav .week-label { font-weight: 600; font-size: 16px; }
  .error-message { background: #FFEBEE; color: #C62828; padding: 12px;
    border-radius: var(--radius-sm); margin-bottom: 16px; font-size: 14px; }
  .success-message { background: #E8F5E9; color: #2E7D32; padding: 12px;
    border-radius: var(--radius-sm); margin-bottom: 16px; font-size: 14px; }
  .signature-canvas { border: 2px dashed #ccc; border-radius: 8px; cursor: crosshair;
    touch-action: none; background: white; display: block; width: 100%; height: 160px; }
  .firma-img { max-width: 80px; max-height: 40px; border: 1px solid #ddd;
    border-radius: 4px; cursor: pointer; vertical-align: middle; }
  .breadcrumb { font-size: 13px; color: #666; margin-bottom: 12px; }
  .breadcrumb a { color: var(--primary); cursor: pointer; text-decoration: none; }
  .breadcrumb a:hover { text-decoration: underline; }
  .copyright-notice { width: 100%; max-width: 400px; text-align: center; color: rgba(255,255,255,0.72); font-size: 11px; margin-top: 18px; line-height: 1.6; padding: 0 4px; }
  .copyright-notice strong { color: rgba(255,255,255,0.92); display: block; margin-bottom: 2px; }
  .report-card { background: var(--card-bg); border-radius: var(--radius); padding: 14px 16px; box-shadow: var(--shadow); margin-bottom: 10px; }
  .priority-alta { background: #FFEBEE; color: #C62828; }
  .priority-media { background: #FFF3E0; color: #E65100; }
  .priority-baja { background: #E8F5E9; color: #2E7D32; }
  .tipo-nota { background: #E3F2FD; color: #1565C0; }
  .tipo-tarea { background: #FFF3E0; color: #E65100; }
  .ai-banner { background: linear-gradient(135deg, #6B3410, #8B4513); color: white;
    border-radius: var(--radius); padding: 16px; margin-bottom: 16px; }
  .ai-banner h4 { margin-bottom: 6px; }
  .ai-banner p { font-size: 13px; opacity: 0.9; }
  .ai-result { background: white; border: 1px solid var(--border); border-left: 4px solid var(--primary);
    border-radius: var(--radius-sm); padding: 16px; margin: 12px 0; font-size: 14px;
    line-height: 1.65; white-space: pre-wrap; word-break: break-word; }
  .ai-chip { display: inline-block; padding: 3px 10px; border-radius: 12px; font-size: 11px;
    font-weight: 700; margin-left: 8px; vertical-align: middle; }
  .ai-chip.on { background: #E8F5E9; color: #2E7D32; }
  .ai-chip.off { background: #FFF3E0; color: #E65100; }
  .forecast-row { display: flex; justify-content: space-between; align-items: center;
    padding: 10px 12px; border-bottom: 1px solid #EEE; font-size: 13px; gap: 8px; }
  .forecast-row:last-child { border-bottom: none; }
  .forecast-row .dia { font-weight: 600; min-width: 110px; }
  .forecast-row .euro { font-weight: 700; color: var(--primary); }
  @media (max-width: 768px) {
    .home-grid { grid-template-columns: repeat(auto-fit, minmax(120px, 1fr)); }
    .stat-grid { grid-template-columns: repeat(2, 1fr); }
    .modal-content { width: 100%; padding: 16px; }
    .header h1 { font-size: 18px; }
    .container { padding: 12px; }
  }
`;

// ─── CONSTANTS ────────────────────────────────────────────────────────────────
const APP_VERSION = "6.4";
const GITHUB_REPO = "FernandoTelecomunicaciones/pardilla";
const WEB_URL = "https://pasteleria-pardilla.web.app";

const FIREBASE_CONFIG_HARDCODED = firebaseConfig;

// Config de Firebase desde variables de entorno de build (.env / CI).
// La clave web de Firebase es pública por diseño (viaja en el bundle igualmente);
// lo que protege los datos son las reglas de firestore.rules, no ocultar esta clave.
// Permite distribuir la app ya configurada en vez de teclear la config en cada
// dispositivo. Si no hay variables, se cae a localStorage / SetupScreen como antes.
function getEnvFirebaseConfig() {
  const env = import.meta.env || {};
  const apiKey = env.VITE_FIREBASE_API_KEY;
  const projectId = env.VITE_FIREBASE_PROJECT_ID;
  if (!apiKey || !projectId) return null;
  return {
    apiKey,
    projectId,
    authDomain: env.VITE_FIREBASE_AUTH_DOMAIN || `${projectId}.firebaseapp.com`,
    storageBucket: env.VITE_FIREBASE_STORAGE_BUCKET || "",
    messagingSenderId: env.VITE_FIREBASE_MESSAGING_SENDER_ID || "",
    appId: env.VITE_FIREBASE_APP_ID || "",
  };
}

const EMPLOYEES_INIT = [
  { id: 1, name: "María de los Ángeles", role: "Ayudante de Dependienta", vacationDays: 0, workedHolidays: 0, monthsWorked: 12, shiftType: "store" },
  { id: 2, name: "Víctor", role: "Ayudante de Dependiente", vacationDays: 0, workedHolidays: 0, monthsWorked: 12, shiftType: "store" },
  { id: 3, name: "Tania", role: "Ayudante de Dependienta", vacationDays: 0, workedHolidays: 0, monthsWorked: 12, shiftType: "store" },
  { id: 4, name: "Aitana", role: "Ayudante de Dependienta", vacationDays: 0, workedHolidays: 0, monthsWorked: 12, shiftType: "store" },
  { id: 5, name: "Roberto", role: "Pastelero", vacationDays: 0, workedHolidays: 0, monthsWorked: 12, shiftType: "pastry", pastryShift: "P3" },
  { id: 6, name: "Wilfredy", role: "Pastelero", vacationDays: 0, workedHolidays: 0, monthsWorked: 12, shiftType: "pastry", pastryShift: "P1" },
  { id: 7, name: "Edgar", role: "Pastelero", vacationDays: 0, workedHolidays: 0, monthsWorked: 12, shiftType: "pastry", pastryShift: "P1" },
  { id: 8, name: "María Carmen Galloso", role: "Ayudante de Pastelero", vacationDays: 0, workedHolidays: 0, monthsWorked: 12, shiftType: "pastry", pastryShift: "P2" },
  { id: 9, name: "Lucía", role: "Limpiadora / Ayudante de Dependienta", vacationDays: 0, workedHolidays: 0, monthsWorked: 12, shiftType: "store", maxHours: 24 },
];

const PRODUCTS_INIT = [
  { id: 1, name: "Palmera de Chocolate", category: "Bollería", price: 2.50 },
  { id: 2, name: "Palmera de Chocolate Blanco", category: "Bollería", price: 2.50 },
  { id: 3, name: "Mini Palmeritas de Chocolate (bandeja)", category: "Bollería", price: 6.50 },
  { id: 4, name: "Bamba de Nata", category: "Bollería", price: 2.00 },
  { id: 5, name: "Donut de Chocolate", category: "Bollería", price: 1.80 },
  { id: 6, name: "Croissant de Mantequilla", category: "Bollería", price: 1.50 },
  { id: 7, name: "Croissant Relleno de Chocolate", category: "Bollería", price: 1.90 },
  { id: 8, name: "Napolitana de Chocolate", category: "Bollería", price: 1.70 },
  { id: 9, name: "Napolitana de Crema", category: "Bollería", price: 1.70 },
  { id: 10, name: "Ensaimada", category: "Bollería", price: 1.90 },
  { id: 11, name: "Caracola", category: "Bollería", price: 1.80 },
  { id: 12, name: "Suizo", category: "Bollería", price: 1.60 },
  { id: 13, name: "Berlina Rellena", category: "Bollería", price: 1.90 },
  { id: 14, name: "Bizcocho Casero", category: "Bollería", price: 8.00 },
  { id: 15, name: "Mini Bollería Variada (bandeja)", category: "Bollería", price: 12.00 },
  { id: 16, name: "Tarta Selva Negra (6 rac.)", category: "Tartas", price: 18.00 },
  { id: 17, name: "Tarta Selva Negra (8 rac.)", category: "Tartas", price: 22.00 },
  { id: 18, name: "Tarta Selva Negra (12 rac.)", category: "Tartas", price: 32.00 },
  { id: 19, name: "Selva Blanca (6 rac.)", category: "Tartas", price: 18.00 },
  { id: 20, name: "Selva Blanca (8 rac.)", category: "Tartas", price: 22.00 },
  { id: 21, name: "Selva Blanca (12 rac.)", category: "Tartas", price: 32.00 },
  { id: 22, name: "Tarta de Frutas (6 rac.)", category: "Tartas", price: 19.00 },
  { id: 23, name: "Tarta de Frutas (8 rac.)", category: "Tartas", price: 24.00 },
  { id: 24, name: "Tarta de Frutas (12 rac.)", category: "Tartas", price: 34.00 },
  { id: 25, name: "Tarta Sacher Negra (6 rac.)", category: "Tartas", price: 18.50 },
  { id: 26, name: "Tarta Sacher Negra (8 rac.)", category: "Tartas", price: 23.00 },
  { id: 27, name: "Tarta Sacher Negra (12 rac.)", category: "Tartas", price: 33.00 },
  { id: 28, name: "Tarta Nata y Fresas (8 rac.)", category: "Tartas", price: 22.00 },
  { id: 29, name: "Tarta Nata y Fresas (12 rac.)", category: "Tartas", price: 32.00 },
  { id: 30, name: "Tarta de Tres Chocolates (8 rac.)", category: "Tartas", price: 24.00 },
  { id: 31, name: "Tarta de Tres Chocolates (12 rac.)", category: "Tartas", price: 34.00 },
  { id: 32, name: "Tarta de Queso (8 rac.)", category: "Tartas", price: 20.00 },
  { id: 33, name: "Hojaldre de Nata y Crema (8 rac.)", category: "Tartas", price: 18.00 },
  { id: 34, name: "Hojaldre de Nata y Crema (12 rac.)", category: "Tartas", price: 26.00 },
  { id: 35, name: "Tarta San Marcos (8 rac.)", category: "Tartas", price: 23.00 },
  { id: 36, name: "Tarta de Yema (8 rac.)", category: "Tartas", price: 22.00 },
  { id: 37, name: "Tarta Personalizada (consultar)", category: "Tartas", price: 30.00 },
  { id: 38, name: "Roscón de Reyes (pequeño)", category: "Especialidades", price: 14.00 },
  { id: 39, name: "Roscón de Reyes (mediano)", category: "Especialidades", price: 18.00 },
  { id: 40, name: "Roscón de Reyes (grande)", category: "Especialidades", price: 24.00 },
  { id: 41, name: "Roscón de Reyes Pistacho", category: "Especialidades", price: 22.00 },
  { id: 42, name: "Torrijas (temporada)", category: "Especialidades", price: 2.50 },
  { id: 43, name: "Huesos de Santo (temporada)", category: "Especialidades", price: 14.00 },
  { id: 44, name: "Buñuelos (temporada)", category: "Especialidades", price: 8.00 },
  { id: 45, name: "Pasteles Variados (bandeja 6 uds.)", category: "Pasteles", price: 8.73 },
  { id: 46, name: "Pasteles Variados (bandeja 12 uds.)", category: "Pasteles", price: 16.50 },
  { id: 47, name: "Milhojas", category: "Pasteles", price: 3.20 },
  { id: 48, name: "Pastas de Té (bandeja)", category: "Pasteles", price: 10.00 },
  { id: 49, name: "Tejas de Almendra (bandeja)", category: "Pasteles", price: 9.50 },
  { id: 50, name: "Tartitas Mini Individuales (ud.)", category: "Pasteles", price: 3.50 },
  { id: 51, name: "Pastel de Crema", category: "Pasteles", price: 3.00 },
  { id: 52, name: "Pastel de Chocolate", category: "Pasteles", price: 3.20 },
  { id: 53, name: "Caña de Crema", category: "Pasteles", price: 2.50 },
  { id: 54, name: "Caña de Chocolate", category: "Pasteles", price: 2.50 },
  { id: 55, name: "Pan de Pueblo", category: "Panadería", price: 2.50 },
  { id: 56, name: "Barra de Pan", category: "Panadería", price: 1.20 },
  { id: 57, name: "Chapata", category: "Panadería", price: 1.50 },
  { id: 58, name: "Pan Integral", category: "Panadería", price: 2.80 },
  { id: 59, name: "Pan de Cereales", category: "Panadería", price: 3.00 },
  { id: 60, name: "Barra Rústica", category: "Panadería", price: 1.80 },
  { id: 61, name: "Empanada de Atún", category: "Salados", price: 3.50 },
  { id: 62, name: "Empanada de Carne", category: "Salados", price: 3.50 },
  { id: 63, name: "Sandwich Mixto", category: "Salados", price: 3.00 },
  { id: 64, name: "Sandwich Vegetal", category: "Salados", price: 3.50 },
  { id: 65, name: "Hojaldre de Jamón y Queso", category: "Salados", price: 2.80 },
  { id: 66, name: "Pizza Individual", category: "Salados", price: 3.50 },
  { id: 67, name: "Quiche Lorraine", category: "Salados", price: 3.80 },
  { id: 68, name: "Café Solo", category: "Cafetería", price: 1.20 },
  { id: 69, name: "Café con Leche", category: "Cafetería", price: 1.50 },
  { id: 70, name: "Cortado", category: "Cafetería", price: 1.30 },
  { id: 71, name: "Tostada con Tomate", category: "Cafetería", price: 2.50 },
  { id: 72, name: "Tostada con Mantequilla y Mermelada", category: "Cafetería", price: 2.50 },
  { id: 73, name: "Zumo de Naranja Natural", category: "Cafetería", price: 2.80 },
  { id: 74, name: "Cola Cao / Chocolate Caliente", category: "Cafetería", price: 2.00 },
  { id: 75, name: "Infusión / Té", category: "Cafetería", price: 1.50 },
];

const ROLE_OPTIONS = [
  "Ayudante de Dependienta","Ayudante de Dependiente","Pastelero","Pastelera",
  "Ayudante de Pastelero","Ayudante de Pastelera","Limpiadora / Ayudante de Dependienta",
  "Dependiente","Dependienta"
];

// FIX #10: Festivos por año (extender cada año)
const HOLIDAYS_BY_YEAR = {
  2026: {
    spain: ["2026-01-01","2026-01-06","2026-04-02","2026-04-03","2026-05-01","2026-05-02","2026-08-15","2026-10-12","2026-11-01","2026-11-02","2026-12-07","2026-12-08","2026-12-25"],
    madrid: ["2026-01-01","2026-01-06","2026-04-02","2026-04-03","2026-05-01","2026-05-02","2026-08-15","2026-10-12","2026-11-02","2026-11-09","2026-12-07","2026-12-08","2026-12-25"],
  },
  2027: {
    spain: ["2027-01-01","2027-01-06","2027-03-25","2027-03-26","2027-05-01","2027-08-15","2027-10-12","2027-11-01","2027-12-06","2027-12-08","2027-12-25"],
    madrid: ["2027-01-01","2027-01-06","2027-03-25","2027-03-26","2027-05-03","2027-08-16","2027-10-12","2027-11-01","2027-11-09","2027-12-06","2027-12-08","2027-12-25"],
  },
};
const getMadridHolidays = (year) => HOLIDAYS_BY_YEAR[year]?.madrid || [];
const getSpainHolidays = (year) => HOLIDAYS_BY_YEAR[year]?.spain || [];
// El calendario laboral se publica cada año en el BOE, así que la tabla de
// arriba hay que ampliarla a mano. Si se agota, la acumulación de festivos
// trabajados dejaría de contar SIN avisar (y eso son días de vacaciones del
// equipo). Esta comprobación convierte ese fallo silencioso en un aviso visible.
const hasHolidayData = (year) => Array.isArray(HOLIDAYS_BY_YEAR[year]?.madrid);
const missingHolidayYears = () => {
  const y = new Date().getFullYear();
  return [y, y + 1].filter(year => !hasHolidayData(year));
};

// (v6.0) SEARCH_TRENDS eliminado: eran datos inventados sin uso. Sustituido por el módulo IA real.

const SHIFT_TEMPLATES_DEFAULT = {
  A: { L: null, M: null, X: { m1:"10:00",m2:"13:00",t1:"17:00",t2:"20:00" }, J: { m1:"09:00",m2:"14:00",t1:"17:00",t2:"20:45" }, V: { m1:"10:00",m2:"14:00",t1:"17:00",t2:"20:45" }, S: { m1:"10:00",m2:"15:00",t1:"17:00",t2:"20:00" }, D: { m1:"08:45",m2:"15:00",t1:"17:00",t2:"20:15" } },
  B: { L: { m1:"10:00",m2:"13:00",t1:"17:30",t2:"20:00" }, M: { m1:"09:00",m2:"14:00",t1:"17:00",t2:"20:45" }, X: null, J: null, V: { m1:"09:00",m2:"13:15",t1:"17:15",t2:"20:45" }, S: { m1:"08:30",m2:"14:40",t1:"17:30",t2:"20:45" }, D: { m1:"08:30",m2:"14:15",t1:"17:30",t2:"20:45" } },
  C: { L: { m1:"09:00",m2:"14:00",t1:"17:00",t2:"20:45" }, M: { m1:"10:00",m2:"13:30",t1:"17:30",t2:"20:00" }, X: { m1:"09:00",m2:"14:00",t1:"17:30",t2:"20:45" }, J: { m1:"10:00",m2:"13:30",t1:"17:30",t2:"20:15" }, V: null, S: { m1:"08:45",m2:"14:30",t1:"18:30",t2:"20:45" }, D: { m1:"10:30",m2:"13:45",t1:null,t2:null } },
};

// Plantillas individuales de obrador (P1=Wilfredy, P2=Mª Carmen Galloso, P3=Roberto)
const PASTRY_TEMPLATES_DEFAULT = {
  P1: { // Turno 1 - Lunes libre, Martes 8-13, resto 7-14
    L: null,
    M: { m1:"08:00", m2:"13:00", t1:null, t2:null },
    X: { m1:"07:00", m2:"14:00", t1:null, t2:null },
    J: { m1:"07:00", m2:"14:00", t1:null, t2:null },
    V: { m1:"07:00", m2:"14:00", t1:null, t2:null },
    S: { m1:"07:00", m2:"14:00", t1:null, t2:null },
    D: { m1:"07:00", m2:"14:00", t1:null, t2:null },
  },
  P2: { // Turno 2 - Lunes 8-13, Martes libre, resto 7-14
    L: { m1:"08:00", m2:"13:00", t1:null, t2:null },
    M: null,
    X: { m1:"07:00", m2:"14:00", t1:null, t2:null },
    J: { m1:"07:00", m2:"14:00", t1:null, t2:null },
    V: { m1:"07:00", m2:"14:00", t1:null, t2:null },
    S: { m1:"07:00", m2:"14:00", t1:null, t2:null },
    D: { m1:"07:00", m2:"14:00", t1:null, t2:null },
  },
  P3: { // Turno 3 - Miércoles libre, Jueves 8-13, resto 7-14
    L: { m1:"07:00", m2:"14:00", t1:null, t2:null },
    M: { m1:"07:00", m2:"14:00", t1:null, t2:null },
    X: null,
    J: { m1:"08:00", m2:"13:00", t1:null, t2:null },
    V: { m1:"07:00", m2:"14:00", t1:null, t2:null },
    S: { m1:"07:00", m2:"14:00", t1:null, t2:null },
    D: { m1:"07:00", m2:"14:00", t1:null, t2:null },
  },
};
// Alias para compatibilidad hacia atrás (migraciones desde localStorage antiguo)
const SHIFT_TEMPLATE_PASTRY_DEFAULT = PASTRY_TEMPLATES_DEFAULT.P1;

// Turnos de verano (1 jun – 31 ago): solo 2 turnos fijos, sin rotación semanal
// ─── Cuadrante de DOS dependientes ───────────────────────────────────────────
// Se usa siempre que la tienda se cubre entre dos personas en lugar de tres:
//   · en verano (1 jun – 31 ago), automáticamente, por las vacaciones → V1/V2
//   · el resto del año, activando el "modo 2 dependientes" (baja, vacante...)
//     → Especial A / Especial B
// Es la MISMA situación, así que es el MISMO cuadrante y se define una sola vez:
// duplicarlo dejaría las dos versiones descuadradas en cuanto se retoque una hora.
// Ambos turnos suman exactamente 40 h semanales.
const SHIFT_TEMPLATES_2P = {
  T1: { // Lunes y Martes trabaja, Mié y Jue libre
    L: { m1:"09:30", m2:"14:00", t1:"17:30", t2:"20:50" },
    M: { m1:"09:30", m2:"14:00", t1:"17:30", t2:"20:50" },
    X: null,
    J: null,
    V: { m1:"10:30", m2:"14:00", t1:"17:30", t2:"20:00" },
    S: { m1:"09:00", m2:"14:30", t1:"17:00", t2:"20:50" },
    D: { m1:"09:00", m2:"14:30", t1:"17:20", t2:"20:50" },
  },
  T2: { // Lunes y Martes libre, Mié y Jue trabaja
    L: null,
    M: null,
    X: { m1:"09:30", m2:"14:00", t1:"17:30", t2:"20:50" },
    J: { m1:"09:30", m2:"14:00", t1:"17:30", t2:"20:50" },
    V: { m1:"09:30", m2:"13:00", t1:"18:00", t2:"20:50" },
    S: { m1:"09:00", m2:"14:30", t1:"17:20", t2:"20:50" },
    D: { m1:"09:00", m2:"14:10", t1:"17:00", t2:"20:50" },
  },
};

// Los dos nombres con los que aparece ese cuadrante según por qué está activo.
// Apuntan al mismo objeto a propósito: una sola fuente de verdad.
const SHIFT_TEMPLATES_SUMMER = { V1: SHIFT_TEMPLATES_2P.T1, V2: SHIFT_TEMPLATES_2P.T2 };
const SHIFT_TEMPLATES_SPECIAL = { EA: SHIFT_TEMPLATES_2P.T1, EB: SHIFT_TEMPLATES_2P.T2 };

const ROTATION_DEFAULT = {
  referenceDate: "2026-04-06",
  assignments: { 1: 0, 2: 1, 4: 2 },
  summerAssignments: {},
  // Modo 2 dependientes: apagado por defecto. Se enciende desde Turnos cuando
  // falta alguien y se apaga al recuperar el tercer dependiente.
  specialMode: false,
  specialAssignments: {},
};

// FIX #21: typos corregidos
const TRENDING_HOOKS = ["Abiertos Domingos","Ofertas Semanales","Tartas Personalizadas","Productos Ecológicos","Sin Gluten Disponibles","Venta Online","Catering Empresas","Clases de Repostería","Sostenibilidad","Recetas Caseras"];
const TRENDING_PRODUCTS_FOCUS = ["Roscón de Reyes","Tartas Personalizadas","Croissants Artesanos","Bollería Variada","Pasteles Gourmet","Pan Integral","Postres Veganos","Churros Artesanos","Torrijas","Buñuelos"];
const TRENDING_MUSIC = ["Música Relajante de Café","Lo-Fi Beats","Jazz Clásico","Indie Español","Pop Romántico","Ambient"];
const TRENDING_HASHTAGS_POOL = ["#PasteleríaPardilla","#ArtesanoEnAlcorcón","#AlcorcónLife","#PanaderíaPerfecta","#PostreDelDía","#TartasDeEnsueño","#FelizDesayuno","#DesayunaConNosotros","#SaborArtesano","#MejorPasteleríaDeMadrid","#ChocolateArtesano","#FiestaConPardilla","#NuestrasPasiones","#HechoConAmor","#LasTartasMasRicas","#CaféYBollería","#DesayunoMadrid","#AlcorcónGastronomía","#PasteleroArtesano","#ProductosFrescos","#SaborTradicional","#PostresDeLujo"];
const REEL_STRUCTURES = ["Hook visual (3s) → Producto destacado (5s) → Llamada a acción (2s)","Tendencia sonora + Transiciones dinámicas (8s) → Producto (3s)","Before/After de elaboración (6s) → Resultado final (3s) → Compra (1s)","Entrevista rápida cliente (4s) → Producto (3s) → CTA (2s)"];

// ─── HELPERS ─────────────────────────────────────────────────────────────────

// FIX #36: parseo seguro de localStorage
function safeLocalGet(key, fallback) {
  try {
    const s = localStorage.getItem(key);
    if (s === null || s === undefined) return fallback;
    return JSON.parse(s);
  } catch (e) {
    console.warn(`localStorage corrupto en clave "${key}", usando fallback`, e);
    return fallback;
  }
}
function safeLocalSet(key, value) {
  try { localStorage.setItem(key, JSON.stringify(value)); } catch (e) { console.warn(`Error guardando en localStorage "${key}":`, e); }
}

function seededRandom(seed) {
  const x = Math.sin(seed * 9301 + 49297) * 49297;
  return x - Math.floor(x);
}

function getCompetitorPrices(product) {
  const competitors = [
    { name: "Pastelería La Tahona" },
    { name: "Horno San Onofre" },
    { name: "Pastelería Mallorca" },
    { name: "Granier Alcorcón" },
  ];
  return competitors.map((c, i) => ({
    ...c,
    price: (product.price * (0.75 + seededRandom(product.id * 100 + i * 17) * 0.5)).toFixed(2),
  }));
}

function getShiftTemplate(shift, shiftTemplates) {
  if (shift === "V1" || shift === "V2") return SHIFT_TEMPLATES_SUMMER[shift];
  if (shift === "EA" || shift === "EB") return SHIFT_TEMPLATES_SPECIAL[shift];
  return shiftTemplates?.[shift] || null;
}

function generateDynamicContent(type) {
  const hook = TRENDING_HOOKS[Math.floor(Math.random() * TRENDING_HOOKS.length)];
  const product = TRENDING_PRODUCTS_FOCUS[Math.floor(Math.random() * TRENDING_PRODUCTS_FOCUS.length)];
  const music = TRENDING_MUSIC[Math.floor(Math.random() * TRENDING_MUSIC.length)];
  const hashtags = [];
  const usados = new Set();
  while (hashtags.length < 5 && usados.size < TRENDING_HASHTAGS_POOL.length) {
    const idx = Math.floor(Math.random() * TRENDING_HASHTAGS_POOL.length);
    if (!usados.has(idx)) { usados.add(idx); hashtags.push(TRENDING_HASHTAGS_POOL[idx]); }
  }
  const cta = ["¡Visítanos hoy!","Encarga ahora","Prueba nuestros sabores","¡No esperes más!"][Math.floor(Math.random() * 4)];
  if (type === "reel") {
    const structure = REEL_STRUCTURES[Math.floor(Math.random() * REEL_STRUCTURES.length)];
    return `🎬 REEL VIRAL\n\nTema: ${hook}\nProducto: ${product}\nMúsica: ${music}\nEstructura: ${structure}\nCTA: ${cta}\nHashtags: ${hashtags.join(" ")}`;
  } else if (type === "short") {
    return `📺 YOUTUBE SHORT\n\nEnlace visual: ${product}\nHook: ${hook}\nMensaje: "En Pastelería Pardilla hacemos ${product.toLowerCase()} de forma artesana"\nMúsica: ${music}\nCTA: ${cta}\nHashtags: ${hashtags.slice(0, 3).join(" ")}`;
  } else if (type === "post") {
    return `📸 POST REDES\n\nCaption:\n"${hook} 🎉\n\nEsta semana destacamos nuestro ${product}. Elaborado con ingredientes frescos y amor.\n\n${cta}\n\n${hashtags.join(" ")}\n\n#AlcorcónSeMueve #Pastelería"`;
  } else {
    return `📱 STORY\n\nTexto: "${product} - ${hook}"\nSticker: CTA ${cta}\nMúsica: ${music}\nTiempo: 24h\nEtiquetas: Negocio local, Pastelería`;
  }
}


// FIX #6: Firebase facade con guarda
const fb = () => {
  if (typeof window === "undefined" || !window.firebase) {
    throw new Error("Firebase SDK no cargado. Verifica el script en index.html.");
  }
  return window.firebase;
};
const fbReady = () => typeof window !== "undefined" && !!window.firebase;

// FIX #32: comprime canvas a JPEG calidad 0.5 para reducir peso de firmas
function canvasToCompressed(canvas) {
  try {
    return canvas.toDataURL("image/jpeg", 0.5);
  } catch {
    return canvas.toDataURL("image/png");
  }
}

// FIX #42: hook reusable de firma para modales
function useSignaturePad(canvasRef) {
  const [hasSigned, setHasSigned] = useState(false);
  const drawingRef = useRef(false);
  const getPos = (e) => {
    const c = canvasRef.current; if (!c) return { x: 0, y: 0 };
    const r = c.getBoundingClientRect();
    const sx = c.width / r.width, sy = c.height / r.height;
    if (e.touches) return { x: (e.touches[0].clientX - r.left) * sx, y: (e.touches[0].clientY - r.top) * sy };
    return { x: (e.clientX - r.left) * sx, y: (e.clientY - r.top) * sy };
  };
  const start = (e) => { e.preventDefault(); const c = canvasRef.current; if (!c) return; const ctx = c.getContext("2d"); const p = getPos(e); ctx.beginPath(); ctx.moveTo(p.x, p.y); drawingRef.current = true; setHasSigned(true); };
  const move = (e) => { e.preventDefault(); if (!drawingRef.current) return; const c = canvasRef.current; if (!c) return; const ctx = c.getContext("2d"); const p = getPos(e); ctx.lineWidth = 2; ctx.lineCap = "round"; ctx.strokeStyle = "#222"; ctx.lineTo(p.x, p.y); ctx.stroke(); };
  const end = () => { drawingRef.current = false; };
  const clear = () => { const c = canvasRef.current; if (!c) return; c.getContext("2d").clearRect(0, 0, c.width, c.height); setHasSigned(false); };
  const reset = () => { drawingRef.current = false; setHasSigned(false); };
  const handlers = { onMouseDown: start, onMouseMove: move, onMouseUp: end, onMouseLeave: end, onTouchStart: start, onTouchMove: move, onTouchEnd: end };
  return { hasSigned, handlers, clear, reset };
}

// FIX #48: hash simple para integridad de firma+timestamp (no es criptográfico fuerte pero deja huella auditable)
async function digestRecord(payload) {
  try {
    const data = new TextEncoder().encode(JSON.stringify(payload));
    const buf = await crypto.subtle.digest("SHA-256", data);
    return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, "0")).join("");
  } catch { return null; }
}

// Traduce los errores de Firestore a algo que un empleado pueda entender y sobre
// lo que pueda actuar. Los errores crudos de Firebase traen enlaces a la consola
// y el identificador del proyecto: ni le sirven a quien está en el mostrador ni
// deberían enseñarse fuera del equipo. El detalle técnico va a la consola del
// navegador, donde el administrador sí puede consultarlo.
function mensajeConsulta(error, accion = "la búsqueda") {
  console.error("Operación de Firestore fallida:", error);
  switch (error?.code) {
    case "failed-precondition":
      return "Esta búsqueda todavía no está disponible. Avisa al administrador: falta publicar un índice en Firestore.";
    case "permission-denied":
      return "No tienes permiso para hacer esto.";
    case "not-found":
      return "El dato ya no existe. Actualiza la pantalla.";
    case "unavailable":
    case "deadline-exceeded":
      return "Sin conexión con el servidor. Comprueba tu conexión y vuelve a intentarlo.";
    default:
      return `No se pudo completar ${accion}. Inténtalo de nuevo en unos segundos.`;
  }
}

// FIX #13: Modal de confirmación reusable (sustituye window.confirm/prompt)
function ConfirmModal({ title, message, confirmText = "Confirmar", cancelText = "Cancelar", danger, requireText, onConfirm, onCancel }) {
  const [typed, setTyped] = useState("");
  const ok = !requireText || typed === requireText;
  return (
    <div className="modal">
      <div className="modal-content">
        <div className="modal-header"><span>{title}</span><button className="modal-close" onClick={onCancel}>×</button></div>
        <p style={{ marginBottom: 16, fontSize: 14 }}>{message}</p>
        {requireText && (
          <div className="form-group">
            <label>Escribe <strong>{requireText}</strong> para confirmar:</label>
            <input className="input" value={typed} onChange={e => setTyped(e.target.value)} autoFocus />
          </div>
        )}
        <div className="modal-footer">
          <button className="btn btn-secondary btn-sm" onClick={onCancel}>{cancelText}</button>
          <button className={`btn btn-sm ${danger ? "btn-danger" : "btn-primary"}`} onClick={onConfirm} disabled={!ok}>{confirmText}</button>
        </div>
      </div>
    </div>
  );
}

// ─── MÓDULO IA (v6.0) ─────────────────────────────────────────────────────────
// Integración real con la API de Claude (Anthropic) + modo local sin clave.
// La clave API se guarda SOLO en este dispositivo (localStorage), nunca en Firestore.
// Los IDs deben ir EXACTOS, sin sufijo de fecha: la API rechaza variantes como
// "claude-haiku-4-5-20251001" (era el valor anterior y hacía fallar la opción
// económica con un error de modelo inexistente).
const AI_MODELS = [
  { id: "claude-opus-5", label: "Claude Opus 5 — mejor calidad (recomendado)" },
  { id: "claude-sonnet-5", label: "Claude Sonnet 5 — equilibrado" },
  { id: "claude-haiku-4-5", label: "Claude Haiku 4.5 — más rápido y económico" },
];
function getAIConfig() {
  const cfg = safeLocalGet("pardilla_ai_config", { apiKey: "", model: AI_MODELS[0].id });
  // Si el dispositivo tiene guardado un modelo retirado o mal escrito de una
  // versión anterior, se cae al recomendado en vez de fallar en cada llamada.
  if (!AI_MODELS.some(m => m.id === cfg.model)) return { ...cfg, model: AI_MODELS[0].id };
  return cfg;
}
function saveAIConfig(cfg) { safeLocalSet("pardilla_ai_config", cfg); }
const aiEnabled = () => !!getAIConfig().apiKey;

async function callClaude(system, user, maxTokens = 1500) {
  const cfg = getAIConfig();
  if (!cfg.apiKey) throw new Error("Sin clave API configurada. Ve a Asesor IA → Configuración.");
  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "x-api-key": cfg.apiKey,
      "anthropic-version": "2023-06-01",
      "anthropic-dangerous-direct-browser-access": "true",
    },
    body: JSON.stringify({
      model: cfg.model || AI_MODELS[0].id,
      max_tokens: maxTokens,
      system,
      messages: [{ role: "user", content: user }],
    }),
  });
  if (!res.ok) {
    let msg = `Error de la API (${res.status})`;
    // Si el cuerpo del error no es JSON, nos quedamos con el mensaje genérico.
    try { const j = await res.json(); msg = j?.error?.message || msg; } catch { /* respuesta no JSON */ }
    throw new Error(msg);
  }
  const data = await res.json();
  return (data.content || []).map(b => b.text || "").join("").trim();
}

const AI_SYSTEM_PROMPT = "Eres un consultor experto en pastelerías y panaderías artesanas de España. Asesoras a Pastelería Pardilla, una pastelería artesana de Alcorcón (Madrid) que lleva un año perdiendo clientes y facturación, con presupuesto muy ajustado. Responde SIEMPRE en español, con acciones concretas, realistas y baratas que el dueño pueda ejecutar esta misma semana. Usa secciones cortas con un emoji como título. Nada de teoría vacía.";

// Suma de ventas por día (fecha -> total €)
function totalesDiarios(ventas) {
  const map = {};
  ventas.forEach(v => { if (v.fecha && Number.isFinite(v.monto)) map[v.fecha] = (map[v.fecha] || 0) + v.monto; });
  return map;
}

// Previsión de los próximos 7 días según la media por día de la semana (últimas 12 semanas)
function previsionSemana(ventas) {
  const daily = totalesDiarios(ventas);
  const hoy = new Date(); hoy.setHours(12, 0, 0, 0);
  const desde = new Date(hoy); desde.setDate(desde.getDate() - 84);
  const porDow = {};
  Object.entries(daily).forEach(([fecha, total]) => {
    const d = parseLocalDate(fecha);
    if (!d || d < desde || d > hoy) return;
    (porDow[d.getDay()] = porDow[d.getDay()] || []).push(total);
  });
  const dayNamesFull = ["Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"];
  const medias = {};
  Object.entries(porDow).forEach(([k, arr]) => { medias[k] = arr.reduce((a, b) => a + b, 0) / arr.length; });
  const valores = Object.values(medias);
  const mediaGlobal = valores.length ? valores.reduce((a, b) => a + b, 0) / valores.length : 0;
  const filas = [];
  for (let i = 1; i <= 7; i++) {
    const d = new Date(hoy); d.setDate(d.getDate() + i);
    const fecha = toLocalDateStr(d);
    const festivo = getMadridHolidays(d.getFullYear()).includes(fecha);
    const media = medias[d.getDay()] ?? null;
    filas.push({
      fecha, dia: dayNamesFull[d.getDay()], media, festivo,
      etiqueta: media === null ? "Sin histórico aún" : festivo ? "🎉 Festivo: prepara producción extra" : media >= mediaGlobal * 1.15 ? "💪 Día fuerte: sube producción" : media <= mediaGlobal * 0.85 ? "📉 Día flojo: ideal para una promo" : "Día normal",
    });
  }
  return { filas, mediaGlobal, muestras: Object.keys(daily).length };
}

// Resumen de métricas reales del negocio (desde Firestore)
function resumenNegocio(ventas, promociones, objetivos) {
  const now = new Date();
  const ym = (d) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
  const mesActual = ym(now);
  const mesPrev = ym(new Date(now.getFullYear(), now.getMonth() - 1, 15));
  let totalMes = 0, totalPrev = 0, totalHist = 0;
  const porCategoria = {};
  ventas.forEach(v => {
    if (!Number.isFinite(v.monto)) return;
    totalHist += v.monto;
    porCategoria[v.categoria] = (porCategoria[v.categoria] || 0) + v.monto;
    if ((v.fecha || "").startsWith(mesActual)) totalMes += v.monto;
    if ((v.fecha || "").startsWith(mesPrev)) totalPrev += v.monto;
  });
  const catOrden = Object.entries(porCategoria).sort((a, b) => b[1] - a[1]);
  const growth = totalPrev > 0 ? ((totalMes - totalPrev) / totalPrev) * 100 : null;
  const ticketMedio = ventas.length ? totalHist / ventas.length : 0;
  const diaMes = now.getDate();
  const diasMes = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
  const pace = objetivos.monthlyTarget > 0 ? (totalMes / objetivos.monthlyTarget) * 100 : null;
  const paceEsperado = (diaMes / diasMes) * 100;
  const promosActivas = promociones.filter(p => parseLocalDate(p.fin) >= now);
  return { totalMes, totalPrev, growth, ticketMedio, catOrden, pace, paceEsperado, diaMes, diasMes, promosActivas, prevision: previsionSemana(ventas), nVentas: ventas.length };
}

function datosParaIA(r, products) {
  return JSON.stringify({
    ventas_mes_actual_eur: Math.round(r.totalMes),
    ventas_mes_anterior_eur: Math.round(r.totalPrev),
    variacion_pct: r.growth === null ? "sin datos" : Math.round(r.growth),
    ticket_medio_eur: Number(r.ticketMedio.toFixed(2)),
    objetivo_alcanzado_pct: r.pace === null ? "sin objetivo" : Math.round(r.pace),
    avance_esperado_a_dia_de_hoy_pct: Math.round(r.paceEsperado),
    ingresos_por_categoria: Object.fromEntries(r.catOrden.map(([c, v]) => [c, Math.round(v)])),
    media_por_dia_semana: Object.fromEntries(r.prevision.filas.map(f => [f.dia, f.media === null ? "sin datos" : Math.round(f.media)])),
    promociones_activas: r.promosActivas.map(p => `${p.nombre} (${p.descuento}% en ${p.categoria})`),
    num_registros_ventas: r.nVentas,
    carta: (products || []).slice(0, 25).map(p => `${p.name} ${p.price}€`),
  });
}

const CONSEJOS_TEMPORADA = {
  0: "Cierra bien la campaña del Roscón (hasta el 6) y prepara San Valentín: tartas para dos y dulces personalizados.",
  1: "San Valentín (día 14) y Carnaval: packs pareja, dulces personalizados y bollería de feria.",
  2: "Día del Padre (día 19) y arranque de torrijas de Cuaresma: anúncialas pronto, son tu producto estrella de temporada.",
  3: "Semana Santa: torrijas a tope (encargos por bandeja) y primeras comuniones a la vista.",
  4: "Día de la Madre (primer domingo) y comuniones: tartas personalizadas por encargo con señal/depósito.",
  5: "Empieza el calor: meriendas frías, tarta helada, granizados y refuerza la tarde. Últimas comuniones del año.",
  6: "Pleno verano: piezas individuales frías, encargos de cumpleaños y empuja la cafetería de las mañanas.",
  7: "Mes valle: ajusta producción para no tirar género, cuadra vacaciones del equipo y prepara la vuelta al cole.",
  8: "Vuelta al cole: packs de desayuno y merienda, bollería para llevar, ofertas a primera hora.",
  9: "Prepara Huesos de Santo y buñuelos para Todos los Santos. Comunícalo desde la última semana del mes.",
  10: "Buñuelos y huesos a pleno rendimiento y arranca la campaña de Navidad: encargos de troncos y dulces navideños.",
  11: "Navidad: troncos y turrones artesanos, y ABRE LA RESERVA DE ROSCÓN antes del día 20: es tu mayor pico del año.",
};

function asesorLocal(r, now = new Date()) {
  const meses = ["enero", "febrero", "marzo", "abril", "mayo", "junio", "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre"];
  const L = [];
  L.push("📊 DIAGNÓSTICO (modo local — activa la IA en Configuración para un plan 100% personalizado)");
  L.push("");
  if (r.nVentas === 0) {
    L.push("Aún no hay ventas registradas. Apunta el cierre de caja de cada día en Gestión → Ventas: con 2-3 semanas de datos este análisis se vuelve útil de verdad.");
    return L.join("\n");
  }
  L.push(`• Mes en curso: €${r.totalMes.toFixed(0)} (mes anterior: €${r.totalPrev.toFixed(0)})${r.growth !== null ? ` → ${r.growth >= 0 ? "+" : ""}${r.growth.toFixed(1)}%` : ""}`);
  if (r.pace !== null) {
    const gap = r.pace - r.paceEsperado;
    L.push(`• Objetivo: llevas el ${r.pace.toFixed(0)}% y a día ${r.diaMes} deberías llevar ~${r.paceEsperado.toFixed(0)}%. ${gap >= 0 ? "Vas por delante ✅" : `Vas ${Math.abs(gap).toFixed(0)} puntos por detrás ⚠️`}`);
  }
  L.push(`• Ticket medio: €${r.ticketMedio.toFixed(2)}${r.ticketMedio > 0 && r.ticketMedio < 6 ? " — bajo: ofrece packs (café+bollo, bandejas) para subirlo" : ""}`);
  if (r.catOrden.length > 1) {
    L.push(`• Categoría fuerte: ${r.catOrden[0][0]} (€${r.catOrden[0][1].toFixed(0)}). Floja: ${r.catOrden[r.catOrden.length - 1][0]} (€${r.catOrden[r.catOrden.length - 1][1].toFixed(0)})`);
  }
  const conMedia = r.prevision.filas.filter(f => f.media !== null);
  if (conMedia.length >= 3) {
    const fuerte = [...conMedia].sort((a, b) => b.media - a.media)[0];
    const flojo = [...conMedia].sort((a, b) => a.media - b.media)[0];
    L.push(`• Día fuerte: ${fuerte.dia} (media €${fuerte.media.toFixed(0)}). Día flojo: ${flojo.dia} (media €${flojo.media.toFixed(0)}) → ideal para una promo solo ese día`);
  }
  if (r.promosActivas.length === 0) L.push("• Sin promociones activas: lanza al menos una para dar un motivo de visita esta semana.");
  L.push("");
  L.push(`🗓️ TEMPORADA — ${meses[now.getMonth()]}`);
  L.push(CONSEJOS_TEMPORADA[now.getMonth()]);
  L.push("");
  L.push("✅ PLAN DE ACCIÓN ESTA SEMANA");
  L.push("1. Google: pide una reseña a cada cliente satisfecho (tarjeta con QR junto a la caja) y responde TODAS las reseñas.");
  L.push("2. WhatsApp Business: catálogo con tartas de encargo y lista de difusión semanal con la oferta.");
  L.push("3. Instagram: mínimo 3 publicaciones/semana (usa la pestaña Contenido de esta pantalla).");
  L.push("4. Promo del día flojo: oferta solo ese día para mover tráfico sin regalar margen toda la semana.");
  L.push("5. Pack desayuno (café + pieza) a precio cerrado: sube el ticket y crea hábito diario.");
  L.push("6. Encargos: teléfono y WhatsApp bien visibles en mostrador, bolsas, Google y redes.");
  return L.join("\n");
}

async function generarContenidoIA(tipo, producto, products = []) {
  const tipoLabel = { reel: "Reel de Instagram (vídeo corto)", short: "YouTube Short", post: "Post de Instagram/Facebook", story: "Story de Instagram" }[tipo] || "Post de Instagram";
  const lista = (products || []).slice(0, 30).map(p => `${p.name} (${p.price}€)`).join(", ");
  const user = `Crea un ${tipoLabel} para Pastelería Pardilla (Alcorcón, Madrid).
Producto a destacar: ${producto || "elige tú el más apetecible para la temporada actual"}.
Fecha de hoy: ${new Date().toLocaleDateString("es-ES", { day: "numeric", month: "long", year: "numeric" })}.
${lista ? `Carta real: ${lista}.` : ""}
Incluye: gancho inicial, texto o guión completo listo para copiar, 8-10 hashtags locales de Alcorcón/Madrid, llamada a la acción y la mejor hora para publicarlo. Tono cercano y artesano.`;
  return await callClaude(AI_SYSTEM_PROMPT, user, 1200);
}

function respuestaResenaLocal(texto) {
  const t = (texto || "").toLowerCase();
  const negativa = ["malo", "mala", "caro", "cara", "sucio", "sucia", "tarde", "frio", "frío", "fria", "fría", "duro", "dura", "decepcion", "decepción", "horrible", "peor", "nunca", "queja", "seco", "seca", "fatal", "lento", "lenta"].some(w => t.includes(w));
  if (negativa) {
    return "Sentimos mucho que tu experiencia no haya sido la que merecías. No es el nivel que queremos dar y nos lo tomamos muy en serio. Nos encantaría que nos dieras otra oportunidad: pásate por la tienda y pregunta por el encargado, queremos compensarte. Gracias por avisarnos, nos ayuda a mejorar. — Pastelería Pardilla";
  }
  return "¡Mil gracias por tomarte el tiempo de dejarnos esta reseña! 🥐 Nos alegra muchísimo que hayas disfrutado. Todo lo elaboramos de forma artesana cada mañana, y leer opiniones así es la mejor recompensa. ¡Te esperamos pronto con algo recién hecho! — Pastelería Pardilla";
}

function AsesorIAScreen({ products, showNotification }) {
  const [tab, setTab] = useState("asesor");
  const [ventas, setVentas] = useState([]);
  const [promociones, setPromociones] = useState([]);
  const [objetivos, setObjetivos] = useState({ monthlyTarget: 5000 });
  const [cfg, setCfg] = useState(getAIConfig());
  const [loading, setLoading] = useState(false);
  const [resultado, setResultado] = useState("");
  const [tipoContenido, setTipoContenido] = useState("post");
  const [productoSel, setProductoSel] = useState("");
  const [contenido, setContenido] = useState("");
  const [resena, setResena] = useState("");
  const [tono, setTono] = useState("Cercano y agradecido");
  const [respuesta, setRespuesta] = useState("");
  const [testMsg, setTestMsg] = useState("");

  useEffect(() => {
    if (!fbReady()) return;
    const unsubV = fb().firestore().collection("ventas").onSnapshot(snap => setVentas(snap.docs.map(d => ({ id: d.id, ...d.data() }))), e => console.error("ventas:", e));
    const unsubP = fb().firestore().collection("promociones").onSnapshot(snap => setPromociones(snap.docs.map(d => ({ id: d.id, ...d.data() }))), e => console.error("promociones:", e));
    const unsubO = fb().firestore().collection("config").doc("objetivos").onSnapshot(d => { if (d.exists) setObjetivos(d.data()); }, e => console.error("objetivos:", e));
    return () => { unsubV(); unsubP(); unsubO(); };
  }, []);

  const r = resumenNegocio(ventas, promociones, objetivos);
  const on = !!cfg.apiKey;
  const tabs = ["asesor", "contenido", "resenas", "promos", "prevision", "config"];
  const tabLabels = ["🧠 Asesor", "📣 Contenido", "⭐ Reseñas", "🏷️ Promos", "📈 Previsión", "⚙️ Configuración"];

  const generarPlan = async () => {
    setLoading(true); setResultado("");
    try {
      if (on) {
        const user = `Fecha de hoy: ${new Date().toLocaleDateString("es-ES", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}.
Datos reales del negocio (JSON): ${datosParaIA(r, products)}
Dame: 1) Diagnóstico en 4-5 frases directas. 2) Plan de los próximos 7 días: 5-7 acciones priorizadas y concretas. 3) Una promoción lista para lanzar (nombre, descuento, categoría, fechas). 4) Un guión de post de Instagram con uno de los productos de la carta. 5) El error más probable que está cometiendo el negocio según estos datos.`;
        setResultado(await callClaude(AI_SYSTEM_PROMPT, user, 2000));
      } else {
        setResultado(asesorLocal(r));
      }
    } catch (e) {
      setResultado("⚠️ La IA no respondió (" + e.message + "). Mostrando análisis local:\n\n" + asesorLocal(r));
    }
    setLoading(false);
  };

  const generarContenido = async () => {
    setLoading(true); setContenido("");
    try {
      if (on) setContenido(await generarContenidoIA(tipoContenido, productoSel || null, products));
      else setContenido(generateDynamicContent(tipoContenido) + "\n\n(Plantilla local — activa la IA en Configuración para contenido único basado en tus productos reales)");
    } catch (e) {
      setContenido("⚠️ " + e.message + "\n\n" + generateDynamicContent(tipoContenido));
    }
    setLoading(false);
  };

  const generarRespuesta = async () => {
    if (!resena.trim()) return;
    setLoading(true); setRespuesta("");
    try {
      if (on) {
        setRespuesta(await callClaude(AI_SYSTEM_PROMPT, `Reseña recibida en Google: «${resena}»\nEscribe la respuesta pública del dueño (máximo 120 palabras), tono ${tono.toLowerCase()}, en español. Si hay queja: disculpa sincera sin excusas e invitación concreta a volver. Firma: Pastelería Pardilla.`, 400));
      } else setRespuesta(respuestaResenaLocal(resena));
    } catch (e) {
      setRespuesta("⚠️ " + e.message + "\n\n" + respuestaResenaLocal(resena));
    }
    setLoading(false);
  };

  const sugerencias = (() => {
    const sug = [];
    if (r.catOrden.length > 1) {
      const [cat, val] = r.catOrden[r.catOrden.length - 1];
      sug.push({ nombre: `Impulso ${cat}`, descuento: 20, categoria: cat, motivo: `«${cat}» es tu categoría con menos ingresos (€${val.toFixed(0)}). Un 20% durante una semana la pone en el radar de tus clientes.` });
    }
    const conMedia = r.prevision.filas.filter(f => f.media !== null);
    if (conMedia.length >= 3) {
      const flojo = [...conMedia].sort((a, b) => a.media - b.media)[0];
      sug.push({ nombre: `${flojo.dia} dulce`, descuento: 15, categoria: "Bollería", motivo: `El ${flojo.dia.toLowerCase()} es tu día más flojo (media €${flojo.media.toFixed(0)}). Una oferta solo ese día atrae visitas sin regalar margen el resto de la semana.` });
    }
    sug.push({ nombre: "Pack desayuno", descuento: 10, categoria: "Cafetería", motivo: `Tu ticket medio es €${r.ticketMedio.toFixed(2)}. Café + pieza a precio cerrado sube el ticket y crea hábito de visita diaria.` });
    return sug;
  })();

  const crearPromo = async (s) => {
    try {
      const ini = new Date(); ini.setDate(ini.getDate() + 1);
      const fin = new Date(ini); fin.setDate(fin.getDate() + 6);
      await fb().firestore().collection("promociones").add({ nombre: s.nombre, descuento: s.descuento, categoria: s.categoria, inicio: toLocalDateStr(ini), fin: toLocalDateStr(fin), timestamp: new Date().toISOString() });
      showNotification(`Promoción «${s.nombre}» creada (7 días desde mañana)`);
    } catch (e) { showNotification(mensajeConsulta(e, "crear la promoción"), "error"); }
  };

  const guardarYProbar = async () => {
    saveAIConfig(cfg);
    setTestMsg("Guardado. Probando conexión…");
    if (!cfg.apiKey) { setTestMsg("Clave vacía: la app funcionará en modo local."); return; }
    try {
      const out = await callClaude("Responde únicamente: OK", "ping", 10);
      setTestMsg(out.toUpperCase().includes("OK") ? "✅ Conexión correcta — IA activada en toda la app" : "✅ Respuesta recibida: " + out);
    } catch (e) { setTestMsg("❌ " + e.message); }
  };

  const copiar = (txt) => { navigator.clipboard?.writeText(txt); showNotification("Copiado al portapapeles"); };

  return (
    <div className="container">
      <h2>🤖 Asesor IA <span className={`ai-chip ${on ? "on" : "off"}`}>{on ? "IA activada" : "Modo local"}</span></h2>
      <p style={{ fontSize: 13, color: "#666", margin: "6px 0 12px" }}>Analiza tus datos reales de ventas y te ayuda a vender más: plan de acción, marketing, reseñas y previsión.</p>
      <div className="nav-tabs">{tabs.map((t, i) => <button key={t} className={`nav-tab ${tab === t ? "active" : ""}`} onClick={() => setTab(t)}>{tabLabels[i]}</button>)}</div>

      {tab === "asesor" && (
        <div style={{ marginTop: 16 }}>
          <div className="stat-grid">
            <div className="stat-box"><div className="label">Mes en curso</div><div className="value" style={{ fontSize: 20 }}>€{r.totalMes.toFixed(0)}</div></div>
            <div className="stat-box"><div className="label">Variación</div><div className="value" style={{ fontSize: 20, color: r.growth === null ? "#999" : r.growth >= 0 ? "#4CAF50" : "#F44336" }}>{r.growth === null ? "—" : `${r.growth >= 0 ? "+" : ""}${r.growth.toFixed(1)}%`}</div></div>
            <div className="stat-box"><div className="label">Objetivo</div><div className="value" style={{ fontSize: 20 }}>{r.pace === null ? "—" : `${r.pace.toFixed(0)}%`}</div></div>
            <div className="stat-box"><div className="label">Ticket medio</div><div className="value" style={{ fontSize: 20 }}>€{r.ticketMedio.toFixed(2)}</div></div>
          </div>
          <button className="btn btn-primary" style={{ width: "100%" }} onClick={generarPlan} disabled={loading}>{loading ? "Analizando tu negocio…" : on ? "✨ Generar diagnóstico y plan de acción con IA" : "Generar diagnóstico y plan de acción"}</button>
          {resultado && (<>
            <div className="ai-result">{resultado}</div>
            <button className="btn btn-secondary btn-sm" onClick={() => copiar(resultado)}>📋 Copiar plan</button>
          </>)}
        </div>
      )}

      {tab === "contenido" && (
        <div style={{ marginTop: 16 }}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(110px, 1fr))", gap: 8, marginBottom: 12 }}>
            {["reel", "short", "post", "story"].map(t => (
              <button key={t} className={`content-type-btn ${tipoContenido === t ? "active" : ""}`} style={{ marginBottom: 0 }} onClick={() => setTipoContenido(t)}>
                {t === "reel" ? "🎬 Reel" : t === "short" ? "📺 Short" : t === "post" ? "📸 Post" : "📱 Story"}
              </button>
            ))}
          </div>
          <div className="form-group">
            <label htmlFor="field-1">Producto a destacar (opcional)</label>
            <select id="field-1" className="input" value={productoSel} onChange={e => setProductoSel(e.target.value)}>
              <option value="">— Que la IA elija según la temporada —</option>
              {[...products].sort((a, b) => a.name.localeCompare(b.name)).map(p => <option key={p.id} value={p.name}>{p.name} ({p.price.toFixed(2)}€)</option>)}
            </select>
          </div>
          <button className="btn btn-primary" style={{ width: "100%" }} onClick={generarContenido} disabled={loading}>{loading ? "Creando contenido…" : on ? "✨ Crear contenido con IA" : "Crear contenido (plantilla local)"}</button>
          {contenido && (<>
            <div className="ai-result">{contenido}</div>
            <button className="btn btn-secondary btn-sm" onClick={() => copiar(contenido)}>📋 Copiar</button>
          </>)}
        </div>
      )}

      {tab === "resenas" && (
        <div style={{ marginTop: 16 }}>
          <p style={{ fontSize: 13, color: "#666", marginBottom: 12 }}>Pega una reseña de Google y genera una respuesta profesional. Responder reseñas (sobre todo las malas) mejora tu posición en Google Maps y recupera clientes.</p>
          <div className="form-group">
            <label htmlFor="field-2">Reseña del cliente</label>
            <textarea id="field-2" className="input" rows={4} style={{ resize: "vertical" }} placeholder="Pega aquí la reseña…" value={resena} onChange={e => setResena(e.target.value)} />
          </div>
          <div className="form-group">
            <label htmlFor="field-3">Tono</label>
            <select id="field-3" className="input" value={tono} onChange={e => setTono(e.target.value)}>
              {["Cercano y agradecido", "Profesional y formal", "Con humor amable"].map(t => <option key={t}>{t}</option>)}
            </select>
          </div>
          <button className="btn btn-primary" style={{ width: "100%" }} onClick={generarRespuesta} disabled={loading || !resena.trim()}>{loading ? "Redactando…" : on ? "✨ Redactar respuesta con IA" : "Redactar respuesta (plantilla)"}</button>
          {respuesta && (<>
            <div className="ai-result">{respuesta}</div>
            <button className="btn btn-secondary btn-sm" onClick={() => copiar(respuesta)}>📋 Copiar respuesta</button>
          </>)}
        </div>
      )}

      {tab === "promos" && (
        <div style={{ marginTop: 16 }}>
          <p style={{ fontSize: 13, color: "#666", marginBottom: 12 }}>Promociones sugeridas a partir de tus datos reales. Con un toque se crean en el gestor de promociones (activas desde mañana, 7 días).</p>
          {r.nVentas === 0 && <div className="demo-banner">Registra ventas en Gestión → Ventas para que las sugerencias se basen en tus datos reales.</div>}
          {sugerencias.map((s, i) => (
            <div key={i} className="idea-card">
              <div className="title">🏷️ {s.nombre} — {s.descuento}% en {s.categoria}</div>
              <p style={{ fontSize: 13, color: "#555", margin: "6px 0 10px" }}>{s.motivo}</p>
              <button className="btn btn-success btn-sm" onClick={() => crearPromo(s)}>＋ Crear esta promoción</button>
            </div>
          ))}
          <p style={{ fontSize: 12, color: "#999", marginTop: 8 }}>💡 Para una campaña completa (cartel, textos, mecánica), usa la pestaña Asesor con la IA activada.</p>
        </div>
      )}

      {tab === "prevision" && (
        <div style={{ marginTop: 16 }}>
          <h3 style={{ marginBottom: 4 }}>Previsión próximos 7 días</h3>
          <p style={{ fontSize: 12, color: "#999", marginBottom: 12 }}>Media por día de la semana sobre las últimas 12 semanas de ventas registradas ({r.prevision.muestras} días con datos). Úsala para ajustar producción y no tirar género.</p>
          <div className="card" style={{ padding: "4px 8px" }}>
            {r.prevision.filas.map(f => (
              <div key={f.fecha} className="forecast-row">
                <span className="dia">{f.dia} {parseLocalDate(f.fecha).getDate()}</span>
                <span className="euro">{f.media === null ? "—" : `~€${f.media.toFixed(0)}`}</span>
                <span style={{ fontSize: 12, color: "#666", textAlign: "right", flex: 1 }}>{f.etiqueta}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {tab === "config" && (
        <div style={{ marginTop: 16 }}>
          <div className="card">
            <h4 style={{ marginBottom: 10 }}>Clave API de Anthropic (Claude)</h4>
            <p style={{ fontSize: 13, color: "#666", marginBottom: 12 }}>Crea una clave en <strong>console.anthropic.com</strong> (pago por uso, céntimos por consulta) y pégala aquí. Con la clave puesta, toda la app usa IA real; sin ella funciona en modo local. La clave se guarda solo en este dispositivo.</p>
            <div className="form-group"><label htmlFor="field-4">Clave API</label><input id="field-4" type="password" className="input" placeholder="sk-ant-…" value={cfg.apiKey} onChange={e => setCfg(c => ({ ...c, apiKey: e.target.value.trim() }))} /></div>
            <div className="form-group"><label htmlFor="field-5">Modelo</label>
              <select id="field-5" className="input" value={cfg.model} onChange={e => setCfg(c => ({ ...c, model: e.target.value }))}>
                {AI_MODELS.map(m => <option key={m.id} value={m.id}>{m.label}</option>)}
              </select>
            </div>
            <button className="btn btn-primary" style={{ width: "100%" }} onClick={guardarYProbar}>Guardar y probar conexión</button>
            {testMsg && <p style={{ fontSize: 13, marginTop: 10, fontWeight: 600 }}>{testMsg}</p>}
            <p style={{ fontSize: 11, color: "#999", marginTop: 12 }}>⚠️ Consejo de seguridad: pon un límite de gasto mensual bajo (p. ej. 5-10 €) en console.anthropic.com → Billing, y no compartas la clave. Si algún día la app se hace pública en internet, conviene mover las llamadas a una Cloud Function.</p>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── COMPONENTS ──────────────────────────────────────────────────────────────

function SetupScreen({ onConfigSet }) {
  const [apiKey, setApiKey] = useState("");
  const [projectId, setProjectId] = useState("");
  const [authDomain, setAuthDomain] = useState("");
  const [error, setError] = useState("");
  const [showConfig, setShowConfig] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!apiKey || !projectId || !authDomain) { setError("Por favor completa todos los campos"); return; }
    const config = { apiKey, projectId, authDomain, storageBucket: "", messagingSenderId: "", appId: "" };
    safeLocalSet("pardilla_firebase_config", config);
    setShowConfig(true);
    setTimeout(() => onConfigSet(config), 1000);
  };

  return (
    <div className="login-screen">
      <div className="login-card">
        <div className="login-logo"><div className="icon">🥐</div><h2>Pastelería Pardilla v{APP_VERSION}</h2></div>
        {!showConfig ? (
          <form onSubmit={handleSubmit}>
            {error && <div className="error-message">{error}</div>}
            <div className="form-group"><label htmlFor="field-6">API Key</label><input id="field-6" type="text" className="input" value={apiKey} onChange={(e) => setApiKey(e.target.value)} placeholder="Ej: AIzaSyD..." /></div>
            <div className="form-group"><label htmlFor="field-7">Project ID</label><input id="field-7" type="text" className="input" value={projectId} onChange={(e) => setProjectId(e.target.value)} placeholder="Ej: pasteleria-pardilla" /></div>
            <div className="form-group"><label htmlFor="field-8">Auth Domain</label><input id="field-8" type="text" className="input" value={authDomain} onChange={(e) => setAuthDomain(e.target.value)} placeholder="Ej: pasteleria-pardilla.firebaseapp.com" /></div>
            <button type="submit" className="btn btn-primary" style={{ width: "100%" }}>Configurar Firebase</button>
          </form>
        ) : (
          <div style={{ marginTop: "20px" }}>
            <h4 style={{ color: "var(--success)", marginBottom: "12px" }}>✓ Firebase configurado</h4>
            <p style={{ fontSize: "12px", color: "#666", marginBottom: "12px" }}>Para usar en otros dispositivos, copia esta configuración reemplazando FIREBASE_CONFIG_HARDCODED:</p>
            <pre style={{ background: "#f5f5f5", padding: "12px", fontSize: "11px", overflow: "auto", maxHeight: "200px", marginBottom: "12px" }}>
              {`const FIREBASE_CONFIG_HARDCODED = ${JSON.stringify({ apiKey, projectId, authDomain, storageBucket: "", messagingSenderId: "", appId: "" }, null, 2)};`}
            </pre>
            <button className="btn btn-secondary" onClick={() => navigator.clipboard?.writeText(`const FIREBASE_CONFIG_HARDCODED = ${JSON.stringify({ apiKey, projectId, authDomain, storageBucket: "", messagingSenderId: "", appId: "" }, null, 2)};`)} style={{ width: "100%" }}>Copiar Configuración</button>
          </div>
        )}
      </div>
    </div>
  );
}

function LoginScreen({ onLoginSuccess }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [notice, setNotice] = useState("");
  const handleReset = async () => {
    if (!email.trim()) { setError("Introduce tu email para recuperar la contraseña."); return; }
    setSubmitting(true); setError(""); setNotice("");
    try {
      await fb().auth().sendPasswordResetEmail(email.trim());
      setNotice("Si la cuenta existe, recibirás un correo para restablecer la contraseña.");
    } catch { setError("No se pudo enviar la solicitud. Comprueba el email y la conexión."); }
    finally { setSubmitting(false); }
  };
  const handleLogin = async (e) => {
    e.preventDefault(); setError(""); setSubmitting(true);
    try { const r = await fb().auth().signInWithEmailAndPassword(email, password); onLoginSuccess(r.user); }
    catch { setError("No se pudo iniciar sesión. Revisa tus datos y la conexión."); }
    setSubmitting(false);
  };

  return (
    <div className="login-screen">
      <div className="login-card">
        <div className="login-logo"><div className="icon">🥐</div><h2>Pastelería Pardilla v{APP_VERSION}</h2></div>
        <form onSubmit={handleLogin}>
          {error && <div className="error-message">{error}</div>}
          <div className="form-group"><label htmlFor="field-9">Email</label><input id="field-9" type="email" className="input" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="ejemplo@correo.com" required autoComplete="email" /></div>
          <div className="form-group"><label htmlFor="field-10">Contraseña</label><input id="field-10" type="password" className="input" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" required autoComplete="current-password" minLength={6} /></div>
          <button type="submit" className="btn btn-primary" style={{ width: "100%" }} disabled={submitting}>{submitting ? "Procesando..." : "Iniciar Sesión"}</button>
        <button type="button" className="btn btn-secondary" disabled={submitting} onClick={handleReset}>Recuperar contraseña</button>
          {notice && <p role="status">{notice}</p>}
        </form>
        <p style={{ fontSize: 11, color: "#888", marginTop: 16, textAlign: "center" }}>
          Al usar esta app aceptas el tratamiento de tus datos según la política de privacidad de la empresa (RGPD). Los registros horarios y firmas se conservan 4 años conforme al RDL 8/2019.
        </p>
      </div>
      <div className="copyright-notice">
        <strong>© Fernando Sanz García — Todos los derechos reservados</strong>
        Aplicación y código desarrollados, protegidos y registrados a nombre de Fernando Sanz García.
        Queda prohibida su reproducción o distribución sin autorización expresa.
      </div>
    </div>
  );
}

function HomeScreen({ userProfile, onNavigate }) {
  const getCards = () => {
    if (userProfile.role === "admin") return [
      { icon: "👥", label: "Empleados", screen: "employees" },{ icon: "🍰", label: "Productos", screen: "products" },
      { icon: "📊", label: "Gestión", screen: "management" },{ icon: "🤖", label: "Asesor IA", screen: "ia" },{ icon: "✓", label: "Tareas", screen: "tasks" },
      { icon: "🛠", label: "Sugerencias", screen: "sugerencias" },{ icon: "🏪", label: "Turnos", screen: "schedule" },
      { icon: "📅", label: "Mi Horario", screen: "miHorario" },{ icon: "🕐", label: "Fichar", screen: "fichar" },
      { icon: "🏖️", label: "Vacaciones", screen: "vacation" },{ icon: "📋", label: "Asignar Vacaciones", screen: "assignVacations" },
      { icon: "⚙️", label: "Config Turnos", screen: "shiftConfig" },{ icon: "👤", label: "Usuarios", screen: "users" },
      { icon: "🔧", label: "Firebase", screen: "firebase" },
    ];
    if (userProfile.role === "manager") return [
      { icon: "👥", label: "Empleados", screen: "employees" },{ icon: "🍰", label: "Productos", screen: "products" },
      { icon: "📊", label: "Gestión", screen: "management" },{ icon: "🤖", label: "Asesor IA", screen: "ia" },{ icon: "✓", label: "Tareas", screen: "tasks" },
      { icon: "🛠", label: "Sugerencias", screen: "sugerencias" },{ icon: "🏪", label: "Turnos", screen: "schedule" },
      { icon: "📅", label: "Mi Horario", screen: "miHorario" },{ icon: "🕐", label: "Fichar", screen: "fichar" },
      { icon: "🏖️", label: "Vacaciones", screen: "vacation" },
    ];
    return [
      { icon: "📅", label: "Mi Horario", screen: "miHorario" },{ icon: "🕐", label: "Fichar", screen: "fichar" },
      { icon: "🏖️", label: "Mis Vacaciones", screen: "vacation" },{ icon: "✓", label: "Mis Tareas", screen: "tasks" },
      { icon: "🛠", label: "Sugerencias", screen: "sugerencias" },
    ];
  };
  return (
    <div className="container">
      <div className="card"><h2>Bienvenido, {userProfile.name}</h2><p style={{ color: "#666", marginTop: "8px" }}>Rol: {userProfile.role === "admin" ? "Administrador" : userProfile.role === "manager" ? "Gestor" : "Empleado"}</p></div>
      <div className="home-grid">{getCards().map(c => <div key={c.screen} className="home-card" onClick={() => onNavigate(c.screen)}><div className="icon">{c.icon}</div><div className="label">{c.label}</div></div>)}</div>
    </div>
  );
}

function EmployeesScreen({ employees, onOpenModal, onSelectEmployee }) {
  const [search, setSearch] = useState("");
  // FIX #7: orden estable
  const sorted = [...employees].sort((a, b) => a.id - b.id);
  const filtered = sorted.filter(e => e.name.toLowerCase().includes(search.toLowerCase()));
  return (
    <div className="container">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
        <h2>Empleados</h2><button className="btn btn-primary btn-sm" onClick={() => onOpenModal("addEmployee")}>+ Agregar</button>
      </div>
      <div className="search-box"><input type="text" placeholder="Buscar empleado..." value={search} onChange={(e) => setSearch(e.target.value)} /></div>
      {filtered.map(emp => (
        <div key={emp.id} className="employee-card">
          <div className="info" onClick={() => onSelectEmployee(emp)}><div className="name">{emp.name}</div><div className="role">{emp.role}</div></div>
          <div className="actions"><button className="btn btn-sm btn-secondary" onClick={() => onSelectEmployee(emp)}>Ver</button></div>
        </div>
      ))}
    </div>
  );
}

function ProductsScreen({ products, onOpenModal, onSelectProduct }) {
  const [search, setSearch] = useState("");
  const sorted = [...products].sort((a, b) => a.id - b.id);
  const filtered = sorted.filter(p => p.name.toLowerCase().includes(search.toLowerCase()));
  return (
    <div className="container">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
        <h2>Productos</h2><button className="btn btn-primary btn-sm" onClick={() => onOpenModal("addProduct")}>+ Agregar</button>
      </div>
      <div className="search-box"><input type="text" placeholder="Buscar producto..." value={search} onChange={(e) => setSearch(e.target.value)} /></div>
      {filtered.map(prod => (
        <div key={prod.id} className="product-card">
          <div className="info" onClick={() => onSelectProduct(prod)}><div className="name">{prod.name}</div><div className="role">{prod.category}</div></div>
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <div className="price">{Number(prod.price || 0).toFixed(2)}€</div>
            <button className="btn btn-sm btn-secondary" onClick={() => onSelectProduct(prod)}>Ver</button>
          </div>
        </div>
      ))}
    </div>
  );
}

function ContentGenerator() {
  const [contentType, setContentType] = useState("reel");
  const [content, setContent] = useState("");
  const [emailTo, setEmailTo] = useState("");
  const [showEmail, setShowEmail] = useState(false);
  const [genLoading, setGenLoading] = useState(false);

  // v6.0: usa IA real si hay clave configurada; si no, plantilla local
  const handleGenerate = async () => {
    setShowEmail(false);
    if (aiEnabled()) {
      setGenLoading(true);
      try { setContent(await generarContenidoIA(contentType, null)); setGenLoading(false); return; }
      catch (e) { console.warn("IA no disponible, usando plantilla:", e); }
      setGenLoading(false);
    }
    setContent(generateDynamicContent(contentType));
  };

  const handleSendEmail = () => {
    if (!content) return;
    const typeLabel = contentType === "reel" ? "Reel" : contentType === "short" ? "YouTube Short" : contentType === "post" ? "Post Redes" : "Story";
    const subject = encodeURIComponent(`Guión de contenido: ${typeLabel} - Pastelería Pardilla`);
    const body = encodeURIComponent(content);
    const to = emailTo.trim();
    window.open(`mailto:${to}?subject=${subject}&body=${body}`, "_self");
  };

  return (
    <div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(120px, 1fr))", gap: "8px", marginBottom: "16px" }}>
        {["reel","short","post","story"].map(type => (
          <button key={type} className={`content-type-btn ${contentType === type ? "active" : ""}`} onClick={() => setContentType(type)}>
            {type === "reel" ? "🎬 Reel" : type === "short" ? "📺 Short" : type === "post" ? "📸 Post" : "📱 Story"}
          </button>
        ))}
      </div>
      <button className="btn btn-primary" style={{ width: "100%", marginBottom: "16px" }} onClick={handleGenerate} disabled={genLoading}>{genLoading ? "Generando con IA…" : aiEnabled() ? "✨ Generar con IA" : "Generar Contenido"}</button>
      {content && (
        <>
          <div className="result-box">{content}</div>
          <div style={{ marginTop: "12px", display: "flex", gap: "8px", flexWrap: "wrap" }}>
            <button className="btn btn-secondary btn-sm" onClick={() => { navigator.clipboard?.writeText(content); }}>📋 Copiar</button>
            <button className="btn btn-primary btn-sm" onClick={() => setShowEmail(v => !v)}>📧 Enviar por email</button>
          </div>
          {showEmail && (
            <div style={{ marginTop: "12px", background: "#f5f1e8", borderRadius: 8, padding: 14 }}>
              <label style={{ display: "block", fontSize: 13, fontWeight: 600, marginBottom: 6 }}>Dirección de email</label>
              <div style={{ display: "flex", gap: "8px" }}>
                <input type="email" className="input" style={{ marginBottom: 0, flex: 1 }} placeholder="ejemplo@correo.com" value={emailTo} onChange={e => setEmailTo(e.target.value)} />
                <button className="btn btn-success btn-sm" onClick={handleSendEmail} disabled={!emailTo.trim()}>Enviar</button>
              </div>
              <p style={{ fontSize: 11, color: "#888", marginTop: 6 }}>Abrirá tu cliente de correo con el guión precargado.</p>
            </div>
          )}
        </>
      )}
    </div>
  );
}

// ─── MANAGEMENT (con Firestore para ventas/promos/objetivos) ─────────────────
// FIX #17: tareas, ventas, promos y objetivos en Firestore en lugar de localStorage
function ManagementScreen({ onNavigate }) {
  const [activeTab, setActiveTab] = useState("stats");
  const [ventas, setVentas] = useState([]);
  const [promociones, setPromociones] = useState([]);
  const [objetivos, setObjetivos] = useState({ monthlyTarget: 5000, previousMonthSales: 4200 });
  const [ventaForm, setVentaForm] = useState({ fecha: toLocalDateStr(new Date()), monto: "", categoria: "Bollería" });
  const [promoForm, setPromoForm] = useState({ nombre: "", descuento: "", categoria: "Bollería", inicio: "", fin: "" });
  const [montoError, setMontoError] = useState("");
  const tabs = ["stats","analysis","suggestions","content","ventas","promociones","objetivos"];
  const tabLabels = ["Estadísticas","Análisis","Sugerencias","Contenidos","Ventas","Promociones","Objetivos"];

  useEffect(() => {
    if (!fbReady()) return;
    const unsubV = fb().firestore().collection("ventas").onSnapshot(snap => setVentas(snap.docs.map(d => ({ id: d.id, ...d.data() }))), e => console.error("ventas:", e));
    const unsubP = fb().firestore().collection("promociones").onSnapshot(snap => setPromociones(snap.docs.map(d => ({ id: d.id, ...d.data() }))), e => console.error("promociones:", e));
    const unsubO = fb().firestore().collection("config").doc("objetivos").onSnapshot(d => { if (d.exists) setObjetivos(d.data()); }, e => console.error("objetivos:", e));
    return () => { unsubV(); unsubP(); unsubO(); };
  }, []);

  const addVenta = async () => {
    setMontoError("");
    const monto = parseFloat(ventaForm.monto);
    if (!Number.isFinite(monto) || monto <= 0) { setMontoError("Introduce un importe válido mayor que 0"); return; }
    if (!ventaForm.fecha) { setMontoError("Falta la fecha"); return; }
    try {
      await fb().firestore().collection("ventas").add({ ...ventaForm, monto, timestamp: new Date().toISOString() });
      setVentaForm(f => ({ ...f, monto: "" }));
    } catch (e) { setMontoError("Error al guardar: " + e.message); }
  };

  const addPromo = async () => {
    if (!promoForm.nombre || !promoForm.descuento || !promoForm.inicio || !promoForm.fin) return;
    const desc = parseInt(promoForm.descuento);
    if (!Number.isFinite(desc) || desc <= 0 || desc > 100) return;
    try {
      await fb().firestore().collection("promociones").add({ ...promoForm, descuento: desc, timestamp: new Date().toISOString() });
      setPromoForm({ nombre: "", descuento: "", categoria: "Bollería", inicio: "", fin: "" });
    } catch (e) { console.error(e); }
  };

  const saveObjetivos = async () => {
    try { await fb().firestore().collection("config").doc("objetivos").set(objetivos); }
    catch (e) { console.error(e); }
  };

  const now = new Date();
  const monthNames = ["Enero","Febrero","Marzo","Abril","Mayo","Junio","Julio","Agosto","Septiembre","Octubre","Noviembre","Diciembre"];
  const dayNames = ["Dom","Lun","Mar","Mié","Jue","Vie","Sáb"];

  // Cálculos de ventas (mes actual y anterior)
  const thisMonthVentas = ventas.filter(v => { const d=parseLocalDate(v.fecha); return d && d.getMonth()===now.getMonth() && d.getFullYear()===now.getFullYear(); }).reduce((s,v)=>s+v.monto,0);
  const prevMonth = now.getMonth()===0 ? 11 : now.getMonth()-1;
  const prevYear = now.getMonth()===0 ? now.getFullYear()-1 : now.getFullYear();
  const lastMonthVentas = ventas.filter(v => { const d=parseLocalDate(v.fecha); return d && d.getMonth()===prevMonth && d.getFullYear()===prevYear; }).reduce((s,v)=>s+v.monto,0);
  const ventasHoy = ventas.filter(v => v.fecha===toLocalDateStr(now)).reduce((s,v)=>s+v.monto,0);
  const ticketMedio = ventas.length>0 ? ventas.reduce((s,v)=>s+v.monto,0)/ventas.length : 0;
  const growth = lastMonthVentas>0 ? ((thisMonthVentas-lastMonthVentas)/lastMonthVentas*100) : null;
  const byCategory = ventas.reduce((acc,v)=>{ acc[v.categoria]=(acc[v.categoria]||0)+v.monto; return acc; },{});
  const topCat = Object.entries(byCategory).sort((a,b)=>b[1]-a[1]);
  const byDow = ventas.reduce((acc,v)=>{ const d=parseLocalDate(v.fecha); if(d){ const k=d.getDay(); acc[k]=(acc[k]||0)+v.monto; } return acc; },{});
  const topDow = Object.entries(byDow).sort((a,b)=>b[1]-a[1])[0];
  const pctObjetivo = objetivos.monthlyTarget>0 ? Math.min((thisMonthVentas/objetivos.monthlyTarget)*100,100) : 0;
  const promoActiva = promociones.filter(p => parseLocalDate(p.fin)>=now).length;

  return (
    <div className="container">
      <h2>Gestión y Análisis</h2>
      <div className="nav-tabs">{tabs.map((t, i) => <button key={t} className={`nav-tab ${activeTab === t ? "active" : ""}`} onClick={() => setActiveTab(t)}>{tabLabels[i]}</button>)}</div>

      {activeTab === "stats" && (
        <div style={{ marginTop: "20px" }}>
          <h3 style={{ marginBottom: 4 }}>Ventas registradas — {monthNames[now.getMonth()]} {now.getFullYear()}</h3>
          <p style={{ fontSize: 12, color: "#999", marginBottom: 16 }}>Datos del módulo de Ventas. Usa la pestaña "Ventas" para añadir registros.</p>
          {ventas.length === 0 ? (
            <div className="card" style={{ textAlign: "center", color: "#999", padding: 32 }}>
              <div style={{ fontSize: 40, marginBottom: 12 }}>📊</div>
              <p style={{ fontWeight: 600 }}>Todavía no hay ventas registradas</p>
              <p style={{ fontSize: 13, marginTop: 8 }}>Ve a la pestaña <strong>Ventas</strong> y añade los importes del día para ver aquí las estadísticas.</p>
            </div>
          ) : (
            <>
              <div className="stat-grid" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(130px, 1fr))" }}>
                <div className="stat-box"><div className="label">{monthNames[now.getMonth()]}</div><div className="value">€{thisMonthVentas.toFixed(2)}</div></div>
                <div className="stat-box"><div className="label">{monthNames[prevMonth]}</div><div className="value">€{lastMonthVentas.toFixed(2)}</div></div>
                <div className="stat-box"><div className="label">Hoy</div><div className="value">€{ventasHoy.toFixed(2)}</div></div>
                <div className="stat-box"><div className="label">Ticket medio</div><div className="value">€{ticketMedio.toFixed(2)}</div></div>
                <div className="stat-box"><div className="label">Nº ventas mes</div><div className="value">{ventas.filter(v=>{const d=parseLocalDate(v.fecha);return d&&d.getMonth()===now.getMonth()&&d.getFullYear()===now.getFullYear();}).length}</div></div>
                {growth !== null && <div className="stat-box"><div className="label">Variación</div><div className="value" style={{ color: growth>=0?"#4CAF50":"#F44336" }}>{growth>=0?"+":""}{growth.toFixed(1)}%</div></div>}
              </div>
              {topCat.length > 0 && (
                <div className="card" style={{ marginTop: 16 }}>
                  <h4 style={{ marginBottom: 12 }}>Ingresos por categoría (histórico)</h4>
                  {topCat.map(([cat, total]) => (
                    <div key={cat} style={{ marginBottom: 10 }}>
                      <div style={{ display:"flex", justifyContent:"space-between", fontSize:13, marginBottom:3 }}>
                        <span style={{ fontWeight: 600 }}>{cat}</span>
                        <span style={{ color:"var(--primary)", fontWeight:700 }}>€{total.toFixed(2)}</span>
                      </div>
                      <div style={{ height:8, background:"#EEE", borderRadius:4, overflow:"hidden" }}>
                        <div style={{ height:"100%", width:`${(total/topCat[0][1]*100).toFixed(1)}%`, background:"var(--primary)", borderRadius:4 }} />
                      </div>
                    </div>
                  ))}
                </div>
              )}
              {topDow && (
                <div className="card" style={{ marginTop: 12 }}>
                  <h4 style={{ marginBottom: 6 }}>Día con más ingresos registrados</h4>
                  <p style={{ fontSize:16, fontWeight:700, color:"var(--primary)" }}>{dayNames[topDow[0]]} — €{Number(topDow[1]).toFixed(2)} acumulado</p>
                </div>
              )}
              <div className="card" style={{ marginTop: 12 }}>
                <h4 style={{ marginBottom: 8 }}>Objetivo del mes</h4>
                <div style={{ display:"flex", justifyContent:"space-between", fontSize:13, marginBottom:6 }}>
                  <span>€{thisMonthVentas.toFixed(2)} de €{objetivos.monthlyTarget}</span>
                  <span style={{ fontWeight:700, color: pctObjetivo>=100?"#4CAF50":"var(--primary)" }}>{pctObjetivo.toFixed(0)}%</span>
                </div>
                <div style={{ height:12, background:"#EEE", borderRadius:6, overflow:"hidden" }}>
                  <div style={{ height:"100%", width:`${pctObjetivo}%`, background: pctObjetivo>=100?"#4CAF50":"var(--primary)", borderRadius:6, transition:"width 0.4s" }} />
                </div>
              </div>
            </>
          )}
        </div>
      )}

      {activeTab === "analysis" && (
        <div style={{ marginTop: "20px" }}>
          <h3 style={{ marginBottom: 4 }}>Análisis del Negocio</h3>
          <p style={{ fontSize: 12, color: "#999", marginBottom: 16 }}>Métricas operativas calculadas desde las ventas y promociones registradas.</p>
          <div className="ai-banner" onClick={() => onNavigate && onNavigate("ia")} style={{ cursor: "pointer" }}>
            <h4>🤖 Nuevo: Asesor IA</h4>
            <p>Diagnóstico completo, plan de acción semanal, previsión de ventas, promos sugeridas y marketing automático. Toca aquí para abrirlo.</p>
          </div>
          {ventas.length === 0 ? (
            <div className="card" style={{ textAlign:"center", color:"#999", padding:32 }}>
              <div style={{ fontSize:40, marginBottom:12 }}>🔍</div>
              <p style={{ fontWeight:600 }}>Sin datos suficientes para el análisis</p>
              <p style={{ fontSize:13, marginTop:8 }}>Registra ventas en la pestaña <strong>Ventas</strong> para que el análisis tenga sentido.</p>
            </div>
          ) : (
            <>
              <div className="card">
                <h4 style={{ marginBottom:12 }}>Resumen del mes — {monthNames[now.getMonth()]}</h4>
                <div className="stat-grid">
                  <div className="stat-box"><div className="label">Objetivo alcanzado</div><div className="value" style={{ color: pctObjetivo>=100?"#4CAF50":pctObjetivo>=70?"#FF9800":"var(--primary)" }}>{pctObjetivo.toFixed(0)}%</div></div>
                  <div className="stat-box"><div className="label">vs {monthNames[prevMonth]}</div><div className="value" style={{ color: growth===null?"#999":growth>=0?"#4CAF50":"#F44336" }}>{growth===null?"Sin datos":growth>=0?`+${growth.toFixed(1)}%`:`${growth.toFixed(1)}%`}</div></div>
                  <div className="stat-box"><div className="label">Ticket medio</div><div className="value">€{ticketMedio.toFixed(2)}</div></div>
                  <div className="stat-box"><div className="label">Promo activas</div><div className="value">{promoActiva}</div></div>
                </div>
              </div>
              {(() => {
                const alertas = [];
                if (pctObjetivo < 50 && objetivos.monthlyTarget > 0) alertas.push({ icon:"🎯", color:"#F44336", text:`Llevas el ${pctObjetivo.toFixed(0)}% del objetivo de ${monthNames[now.getMonth()]} (€${objetivos.monthlyTarget}). Quedan €${(objetivos.monthlyTarget-thisMonthVentas).toFixed(2)} para alcanzarlo.` });
                if (pctObjetivo >= 100) alertas.push({ icon:"✅", color:"#4CAF50", text:`Objetivo de ${monthNames[now.getMonth()]} superado (€${thisMonthVentas.toFixed(2)} / €${objetivos.monthlyTarget}).` });
                if (growth !== null && growth <= -15) alertas.push({ icon:"⚠️", color:"#F44336", text:`Las ventas han bajado un ${Math.abs(growth).toFixed(1)}% respecto a ${monthNames[prevMonth]}. Revisa si hay algún día sin registrar.` });
                if (growth !== null && growth >= 15) alertas.push({ icon:"📈", color:"#4CAF50", text:`Las ventas de ${monthNames[now.getMonth()]} superan en un ${growth.toFixed(1)}% al mes anterior. Buen ritmo.` });
                if (topCat.length > 0) alertas.push({ icon:"🥐", color:"#8B4513", text:`Categoría con más ingresos: "${topCat[0][0]}" con €${topCat[0][1].toFixed(2)} acumulados.` });
                if (topCat.length > 1) alertas.push({ icon:"💡", color:"#FF9800", text:`Categoría con menos ingresos: "${topCat[topCat.length-1][0]}" (€${topCat[topCat.length-1][1].toFixed(2)}). Plantéate crear una promoción específica.` });
                if (ticketMedio > 0 && ticketMedio < 5) alertas.push({ icon:"🧾", color:"#FF9800", text:`Ticket medio de €${ticketMedio.toFixed(2)}. Si subes el importe medio por venta, el objetivo se alcanza antes.` });
                if (promoActiva === 0) alertas.push({ icon:"🏷️", color:"#9C27B0", text:`No hay promociones activas este mes. Una oferta puntual puede ayudar a subir el volumen de ventas.` });
                if (alertas.length === 0) alertas.push({ icon:"✅", color:"#4CAF50", text:"Todo en orden. Sigue registrando las ventas para mantener el análisis actualizado." });
                return (
                  <div style={{ marginTop:16 }}>
                    <h4 style={{ marginBottom:10 }}>Avisos y puntos de acción</h4>
                    {alertas.map((a,i) => (
                      <div key={i} style={{ display:"flex", gap:10, alignItems:"flex-start", background:"#FAFAFA", border:`1px solid ${a.color}22`, borderLeft:`4px solid ${a.color}`, borderRadius:8, padding:"10px 12px", marginBottom:8 }}>
                        <span style={{ fontSize:18 }}>{a.icon}</span>
                        <span style={{ fontSize:13, color:"#333" }}>{a.text}</span>
                      </div>
                    ))}
                  </div>
                );
              })()}
            </>
          )}
        </div>
      )}

      {activeTab === "suggestions" && (
        <div style={{ marginTop: "20px" }}>
          <h3>Sugerencias de Mejora</h3>
          {[{ title: "Lanzar línea sin gluten/vegana", priority: "Alta" },{ title: "Programa de fidelización", priority: "Alta" },{ title: "Servicio de tartas por encargo online", priority: "Media" },{ title: "Colaboración con cafeterías locales", priority: "Media" },{ title: "Ampliar horario de desayunos", priority: "Baja" },{ title: "Packs y lotes para fechas especiales", priority: "Alta" }].map((sug, idx) => (
            <div key={idx} className="idea-card"><div className="title">{sug.title}</div><div className={`priority priority-${sug.priority.toLowerCase()}`}>{sug.priority}</div></div>
          ))}
        </div>
      )}

      {activeTab === "content" && <div style={{ marginTop: "20px" }}><h3>Generador de Contenidos</h3><ContentGenerator /></div>}

      {activeTab === "ventas" && (
        <div style={{ marginTop: "20px" }}>
          <h3>Registro de Ventas</h3>
          <div className="form-group"><label htmlFor="field-11">Fecha</label><input id="field-11" type="date" className="input" value={ventaForm.fecha} onChange={e => setVentaForm(f => ({...f, fecha: e.target.value}))} /></div>
          <div className="form-group">
            <label htmlFor="field-12">Monto (€)</label>
            <input id="field-12" type="number" className={`input ${montoError ? "error" : ""}`} step="0.01" min="0" placeholder="0.00" value={ventaForm.monto} onChange={e => setVentaForm(f => ({...f, monto: e.target.value}))} />
            {montoError && <div className="form-error">{montoError}</div>}
          </div>
          <div className="form-group"><label htmlFor="field-13">Categoría</label>
            <select id="field-13" className="input" value={ventaForm.categoria} onChange={e => setVentaForm(f => ({...f, categoria: e.target.value}))}>
              {["Bollería","Tartas","Cafetería","Sándwiches","Bebidas","Otros"].map(c => <option key={c}>{c}</option>)}
            </select>
          </div>
          <button className="btn btn-primary" style={{ width: "100%" }} onClick={addVenta}>Registrar Venta</button>
          <div style={{ marginTop: "20px" }}>
            <h4>Ventas de Hoy</h4>
            <p style={{ fontSize: "18px", fontWeight: "700", color: "var(--primary)" }}>€{ventas.filter(v => v.fecha === toLocalDateStr(new Date())).reduce((s, v) => s + v.monto, 0).toFixed(2)}</p>
            <h4 style={{ marginTop: "16px" }}>Últimas Ventas</h4>
            {[...ventas].sort((a,b) => (b.timestamp||"").localeCompare(a.timestamp||"")).slice(0,5).map(v => (
              <div key={v.id} className="card" style={{ marginTop: "8px" }}>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <div><strong>{v.categoria}</strong><p style={{ fontSize: "12px", color: "#666" }}>{parseLocalDate(v.fecha)?.toLocaleDateString("es-ES")}</p></div>
                  <div style={{ fontSize: "16px", fontWeight: "700", color: "var(--primary)" }}>€{v.monto.toFixed(2)}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === "promociones" && (
        <div style={{ marginTop: "20px" }}>
          <h3>Gestor de Promociones</h3>
          <div className="form-group"><label htmlFor="field-14">Nombre de Promoción</label><input id="field-14" type="text" className="input" placeholder="Ej: Descuento Bollería" value={promoForm.nombre} onChange={e => setPromoForm(f => ({...f, nombre: e.target.value}))} /></div>
          <div className="form-group"><label htmlFor="field-15">Descuento (%)</label><input id="field-15" type="number" className="input" min="1" max="100" placeholder="10" value={promoForm.descuento} onChange={e => setPromoForm(f => ({...f, descuento: e.target.value}))} /></div>
          <div className="form-group"><label htmlFor="field-16">Categoría</label>
            <select id="field-16" className="input" value={promoForm.categoria} onChange={e => setPromoForm(f => ({...f, categoria: e.target.value}))}>
              {["Bollería","Tartas","Cafetería","Todos los productos"].map(c => <option key={c}>{c}</option>)}
            </select>
          </div>
          <div className="form-group"><label htmlFor="field-17">Fecha Inicio</label><input id="field-17" type="date" className="input" value={promoForm.inicio} onChange={e => setPromoForm(f => ({...f, inicio: e.target.value}))} /></div>
          <div className="form-group"><label htmlFor="field-18">Fecha Fin</label><input id="field-18" type="date" className="input" value={promoForm.fin} min={promoForm.inicio} onChange={e => setPromoForm(f => ({...f, fin: e.target.value}))} /></div>
          <button className="btn btn-primary" style={{ width: "100%" }} onClick={addPromo}>Crear Promoción</button>
          <div style={{ marginTop: "20px" }}>
            <h4>Promociones Activas</h4>
            {promociones.filter(p => parseLocalDate(p.fin) >= new Date()).map(p => (
              <div key={p.id} className="card" style={{ marginTop: "8px", borderLeft: "4px solid var(--success)" }}>
                <strong>{p.nombre}</strong>
                <p style={{ fontSize: "12px", color: "#666" }}>{p.categoria} - {p.descuento}% descuento</p>
                <p style={{ fontSize: "11px", color: "#999" }}>{parseLocalDate(p.inicio)?.toLocaleDateString("es-ES")} al {parseLocalDate(p.fin)?.toLocaleDateString("es-ES")}</p>
              </div>
            ))}
            <h4 style={{ marginTop: "16px" }}>Promociones Expiradas</h4>
            {promociones.filter(p => parseLocalDate(p.fin) < new Date()).map(p => (
              <div key={p.id} className="card" style={{ marginTop: "8px", borderLeft: "4px solid var(--danger)", opacity: "0.6" }}>
                <strong>{p.nombre}</strong><p style={{ fontSize: "12px", color: "#666" }}>Expiró el {parseLocalDate(p.fin)?.toLocaleDateString("es-ES")}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === "objetivos" && (
        <div style={{ marginTop: "20px" }}>
          <h3>Objetivos y KPIs</h3>
          <div className="form-group"><label htmlFor="field-19">Objetivo de Ventas Mensual (€)</label><input id="field-19" type="number" className="input" min="0" value={objetivos.monthlyTarget} onChange={e => setObjetivos(o => ({...o, monthlyTarget: parseInt(e.target.value) || 0}))} /></div>
          <button className="btn btn-success" style={{ width: "100%", marginBottom: "16px" }} onClick={saveObjetivos}>Guardar Objetivo</button>
          <div className="card" style={{ marginTop: "16px" }}>
            <h4>Progreso del Mes</h4>
            <div className="score-bar" style={{ marginTop: "12px", height: "30px" }}>
              <div className="score-bar-fill" style={{ width: `${objetivos.monthlyTarget > 0 ? Math.min((thisMonthVentas / objetivos.monthlyTarget) * 100, 100) : 0}%` }}></div>
            </div>
            <p style={{ marginTop: "8px", color: "#666", fontSize: "12px" }}>€{thisMonthVentas.toFixed(2)} de €{Number(objetivos.monthlyTarget || 0).toFixed(2)}</p>
          </div>
          <div className="stat-grid" style={{ marginTop: "16px" }}>
            <div className="stat-box"><div className="label">Ticket Medio</div><div className="value" style={{ fontSize: "18px" }}>€{ventas.length > 0 ? (ventas.reduce((s, v) => s + v.monto, 0) / ventas.length).toFixed(2) : "0.00"}</div></div>
            <div className="stat-box"><div className="label">Mes anterior (real)</div><div className="value" style={{ fontSize: "18px" }}>€{lastMonthVentas.toFixed(2)}</div></div>
            <div className="stat-box"><div className="label">Categoría Top</div><div className="value" style={{ fontSize: "14px" }}>{ventas.length > 0 ? Object.entries(ventas.reduce((acc, v) => ({...acc, [v.categoria]: (acc[v.categoria] || 0) + v.monto}), {})).sort((a, b) => b[1] - a[1])[0][0] : "-"}</div></div>
          </div>
        </div>
      )}
    </div>
  );
}

function TasksScreen({ userProfile, employees, showNotification }) {
  const isAdmin = userProfile.role === "admin" || userProfile.role === "manager";
  const [tasks, setTasks] = useState([]);
  const [activeTab, setActiveTab] = useState(isAdmin ? "all" : "assigned");
  const [showAdd, setShowAdd] = useState(false);
  const [filterEmp, setFilterEmp] = useState("");

  useEffect(() => {
    if (!fbReady()) return;
    const collection = fb().firestore().collection("tasks");
    const queries = isAdmin ? [collection] : [
      collection.where("createdBy", "==", userProfile.uid),
      collection.where("assignedTo", "in", ["all", String(userProfile.linkedEmployeeId || "unlinked")]),
    ];
    const results = queries.map(() => []);
    const unsubscribers = queries.map((query, index) => query.onSnapshot(snap => {
      results[index] = snap.docs.map(d => ({ ...d.data(), id: d.id }));
      setTasks([...new Map(results.flat().map(task => [task.id, task])).values()]
        .sort((a,b) => (b.createdAt || "").localeCompare(a.createdAt || "")));
    }, () => showNotification("No se pudieron cargar las tareas. Comprueba la conexión y tus permisos.", "error")));
    return () => unsubscribers.forEach(unsubscribe => unsubscribe());
  }, [isAdmin, userProfile.uid, userProfile.linkedEmployeeId, showNotification]);

  const addTask = async (data) => {
    await fb().firestore().collection("tasks").add({
      ...data,
      completed: false,
      createdAt: new Date().toISOString(),
      createdBy: userProfile.uid,
      createdByName: userProfile.name,
    });
  };

  const toggleTask = async (t) => {
    try { await fb().firestore().collection("tasks").doc(t.id).update({ completed: !t.completed, completedAt: !t.completed ? new Date().toISOString() : null }); }
    catch (e) { console.error(e); }
  };

  const deleteTask = async (id) => {
    try { await fb().firestore().collection("tasks").doc(id).delete(); }
    catch (e) { console.error(e); }
  };

  const getVisible = () => {
    if (isAdmin) {
      if (activeTab === "all") {
        let t = tasks.filter(x => x.assignedTo && x.assignedTo !== "self");
        if (filterEmp) t = t.filter(x => x.assignedTo === filterEmp);
        return t;
      }
      return tasks.filter(x => x.assignedTo === "self" && x.createdBy === userProfile.uid);
    }
    const myEmpId = String(userProfile.linkedEmployeeId || "");
    if (activeTab === "assigned") {
      return tasks.filter(x =>
        (x.assignedTo === myEmpId || x.assignedTo === "all") && x.createdBy !== userProfile.uid
      );
    }
    return tasks.filter(x => x.createdBy === userProfile.uid && x.assignedTo === "self");
  };

  const visible = getVisible();
  const prioBorderColor = (p) => p === "alta" ? "#F44336" : p === "media" ? "#FF9800" : "#4CAF50";

  return (
    <div className="container">
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:16 }}>
        <h2>{isAdmin ? "Tareas y Notas" : "Mis Tareas"}</h2>
        <button className="btn btn-primary btn-sm" onClick={() => setShowAdd(true)}>+ Nueva</button>
      </div>

      <div className="nav-tabs" style={{ marginBottom:16 }}>
        {isAdmin ? (
          <>
            <button className={`nav-tab ${activeTab==="all"?"active":""}`} onClick={() => setActiveTab("all")}>Asignadas a empleados</button>
            <button className={`nav-tab ${activeTab==="mine"?"active":""}`} onClick={() => setActiveTab("mine")}>Mis notas</button>
          </>
        ) : (
          <>
            <button className={`nav-tab ${activeTab==="assigned"?"active":""}`} onClick={() => setActiveTab("assigned")}>Del admin</button>
            <button className={`nav-tab ${activeTab==="mine"?"active":""}`} onClick={() => setActiveTab("mine")}>Mis notas</button>
          </>
        )}
      </div>

      {isAdmin && activeTab === "all" && (
        <div style={{ marginBottom:12 }}>
          <select className="input" style={{ maxWidth:240, marginBottom:0 }} value={filterEmp} onChange={e => setFilterEmp(e.target.value)}>
            <option value="">Todos los empleados</option>
            {employees.map(e => <option key={e.id} value={String(e.id)}>{e.name}</option>)}
            <option value="all">Globales (todos)</option>
          </select>
        </div>
      )}

      {visible.length === 0 && (
        <div className="card" style={{ textAlign:"center", color:"#999", padding:28 }}>
          <div style={{ fontSize:36, marginBottom:8 }}>📋</div>
          <p>No hay {activeTab==="mine" ? "notas" : "tareas"} aquí todavía.</p>
        </div>
      )}

      {visible.map(task => {
        const assigneeName = task.assignedTo && task.assignedTo !== "self" && task.assignedTo !== "all"
          ? (employees.find(e => String(e.id) === String(task.assignedTo))?.name || "Empleado")
          : task.assignedTo === "all" ? "Todos" : null;
        const borderColor = task.type === "nota" ? "#2196F3" : prioBorderColor(task.priority);
        return (
          <div key={task.id} className="card" style={{ marginBottom:10, borderLeft:`4px solid ${borderColor}`, opacity: task.completed ? 0.72 : 1 }}>
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", gap:8 }}>
              <div style={{ flex:1 }}>
                <div style={{ display:"flex", flexWrap:"wrap", gap:6, marginBottom:5, alignItems:"center" }}>
                  <span className={`badge tipo-${task.type||"tarea"}`} style={{ fontSize:11, padding:"2px 8px" }}>{task.type === "nota" ? "Nota" : "Tarea"}</span>
                  {task.type === "tarea" && task.priority && (
                    <span className={`badge priority-${task.priority}`} style={{ fontSize:11, padding:"2px 8px" }}>{task.priority.charAt(0).toUpperCase()+task.priority.slice(1)}</span>
                  )}
                  {task.completed && <span className="badge" style={{ fontSize:11, padding:"2px 8px", background:"#E8F5E9", color:"#2E7D32" }}>Completada</span>}
                </div>
                <h4 style={{ textDecoration: task.completed ? "line-through" : "none", marginBottom: task.body ? 4 : 2 }}>{task.title}</h4>
                {task.body && <p style={{ fontSize:13, color:"#555", marginBottom:4 }}>{task.body}</p>}
                <div style={{ fontSize:11, color:"#999", display:"flex", gap:10, flexWrap:"wrap" }}>
                  {assigneeName && <span>Para: <strong>{assigneeName}</strong></span>}
                  {task.dueDate && <span>Fecha: <strong>{task.dueDate}{task.dueDateEnd ? " — "+task.dueDateEnd : ""}</strong></span>}
                  {task.createdByName && <span>Por: {task.createdByName}</span>}
                </div>
              </div>
              <div style={{ display:"flex", gap:4, flexShrink:0 }}>
                <button className="btn btn-sm btn-secondary" onClick={() => toggleTask(task)} style={{ minWidth:30 }}>{task.completed ? "↩" : "✓"}</button>
                {(isAdmin || task.createdBy === userProfile.uid) && (
                  <button className="btn btn-sm btn-danger" onClick={() => deleteTask(task.id)} style={{ minWidth:30 }}>×</button>
                )}
              </div>
            </div>
          </div>
        );
      })}

      {showAdd && (
        <AddTaskModal
          onClose={() => setShowAdd(false)}
          onAdd={async (data) => { await addTask(data); setShowAdd(false); }}
          isAdmin={isAdmin}
          employees={employees}
          defaultAssignedTo={activeTab === "mine" ? "self" : ""}
        />
      )}
    </div>
  );
}

function ShiftPlanningScreen({ employees, rotationConfig, setRotationConfig, showNotification }) {
  const [localRotation, setLocalRotation] = useState(rotationConfig);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [showReplaceModal, setShowReplaceModal] = useState(false);
  const [replaceSlotId, setReplaceSlotId] = useState(null);
  const [newEmpId, setNewEmpId] = useState("");
  const [addEmpId, setAddEmpId] = useState("");
  const [addShiftIdx, setAddShiftIdx] = useState("0");
  const [confirmRemove, setConfirmRemove] = useState(null);

  useEffect(() => { setLocalRotation(rotationConfig); }, [rotationConfig]);

  const today = new Date();
  const weekStart = getMondayOfWeek(today);
  const weekEnd = new Date(weekStart); weekEnd.setDate(weekEnd.getDate() + 6);

  const getWeeksDiff = (rotation) => {
    const refMonday = getMondayOfWeek(parseLocalDate(rotation.referenceDate));
    return Math.round((weekStart - refMonday) / (7 * 24 * 60 * 60 * 1000));
  };

  const persistRotation = async (updated) => {
    setLocalRotation(updated); setRotationConfig(updated);
    safeLocalSet("pardilla_rotation", updated);
    try { await fb().firestore().collection("shiftConfig").doc("rotation").set(updated); }
    catch (e) { console.error("rotation save:", e); }
  };

  // Propuesta al activar el modo 2 dependientes: los dos habituales (Víctor y
  // María de los Ángeles). Si no están, se cogen los dos primeros de tienda.
  // Es solo una propuesta: se puede cambiar quién entra en cualquier momento.
  const proponerDuo = () => {
    const tienda = employees.filter(e => e.shiftType === "store");
    const preferidos = ["víctor", "maría de los ángeles"];
    const elegidos = preferidos
      .map(p => tienda.find(e => e.name.toLowerCase().startsWith(p)))
      .filter(Boolean);
    for (const e of tienda) {
      if (elegidos.length >= 2) break;
      if (!elegidos.some(x => x.id === e.id)) elegidos.push(e);
    }
    return Object.fromEntries(elegidos.slice(0, 2).map((e, i) => [e.id, i]));
  };

  // El cuadrante especial solo cubre la tienda si hay exactamente dos personas,
  // una en cada turno. Avisar es mejor que dejar un domingo sin nadie.
  const avisoDuo = (() => {
    if (!localRotation.specialMode) return null;
    const asignados = Object.values(localRotation.specialAssignments || {});
    if (asignados.length === 0) return "No has asignado a nadie: nadie tiene turno de tienda.";
    if (asignados.length === 1) return "Solo hay un dependiente asignado: habrá días sin cubrir.";
    if (asignados.length > 2) return `Hay ${asignados.length} dependientes asignados. Este cuadrante está pensado para dos: repasa que no sobre nadie.`;
    const bases = asignados.map(Number).sort();
    if (bases[0] === bases[1]) return "Los dos empiezan en el mismo turno, así que coincidirán siempre y habrá días sin cubrir. Pon uno en A y otro en B.";
    return null;
  })();

  const handleShiftChange = (empId, desiredShiftIdx) => {
    const weeksDiff = getWeeksDiff(localRotation);
    const newAssignment = ((parseInt(desiredShiftIdx) - weeksDiff) % 3 + 3) % 3;
    persistRotation({ ...localRotation, assignments: { ...localRotation.assignments, [empId]: newAssignment } });
  };

  const handleSave = async () => {
    setSaving(true);
    try { await fb().firestore().collection("shiftConfig").doc("rotation").set(localRotation); safeLocalSet("pardilla_rotation", localRotation); setSaved(true); setTimeout(() => setSaved(false), 3000); }
    catch { showNotification("No se pudo guardar la rotación. Comprueba la conexión y tus permisos.", "error"); }
    setSaving(false);
  };

  const handleRemoveFromRotation = (empId) => {
    setConfirmRemove(empId);
  };
  const confirmRemoveDo = () => {
    if (confirmRemove == null) return;
    const newAssignments = { ...localRotation.assignments };
    delete newAssignments[confirmRemove];
    persistRotation({ ...localRotation, assignments: newAssignments });
    setConfirmRemove(null);
  };

  const handleReplaceEmployee = () => {
    if (!newEmpId) return;
    const oldBaseIdx = localRotation.assignments[replaceSlotId];
    const newAssignments = { ...localRotation.assignments };
    delete newAssignments[replaceSlotId];
    newAssignments[parseInt(newEmpId)] = oldBaseIdx;
    persistRotation({ ...localRotation, assignments: newAssignments });
    setShowReplaceModal(false); setNewEmpId("");
  };

  const handleAddToRotation = () => {
    if (!addEmpId) return;
    const weeksDiff = getWeeksDiff(localRotation);
    const newBaseIdx = ((parseInt(addShiftIdx) - weeksDiff) % 3 + 3) % 3;
    const newAssignments = { ...localRotation.assignments, [parseInt(addEmpId)]: newBaseIdx };
    persistRotation({ ...localRotation, assignments: newAssignments });
    setAddEmpId(""); setAddShiftIdx("0");
  };

  // FIX #7: orden estable
  const sortedAssignments = Object.keys(localRotation.assignments).map(Number).sort((a,b) => a - b);

  return (
    <div className="container">
      <h2>Planificación de Turnos</h2>
      <button className="btn btn-primary" onClick={handleSave} disabled={saving} style={{ marginBottom: "16px" }}>{saving ? "Guardando..." : "Guardar Asignación"}</button>
      {saved && <div className="success-message">Cambios guardados correctamente</div>}
      <div style={{ marginTop: "20px" }}>
        <h3>Asignación Actual - Semana del {weekStart.toLocaleDateString("es-ES", { day: "numeric", month: "numeric" })} al {weekEnd.toLocaleDateString("es-ES", { day: "numeric", month: "numeric" })}</h3>
        {sortedAssignments.map(empId => {
          const emp = employees.find(e => e.id === empId);
          const shiftLetter = getCurrentShift(empId, weekStart, localRotation) || "A";
          const shiftIdx = ["A","B","C"].indexOf(shiftLetter);
          return (
            <div key={empId} className="card" style={{ marginBottom: "12px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <h4>{emp?.name || "Empleado #"+empId}</h4>
                <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                  <select className="input" value={shiftIdx} onChange={e => handleShiftChange(empId, e.target.value)} style={{ width: "100px", marginBottom: "0" }}>
                    <option value="0">Turno A</option><option value="1">Turno B</option><option value="2">Turno C</option>
                  </select>
                  <div className={`turno-badge turno-${shiftLetter}`}>{shiftLetter}</div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div style={{ marginTop: "28px" }}>
        <h3 style={{ marginBottom: "8px" }}>Gestión de Empleados en Rotación</h3>
        <p style={{ fontSize: "12px", color: "#666", marginBottom: "12px" }}>Empleados que rotan semanalmente entre los turnos A, B y C (dependientes y ayudantes).</p>
        {sortedAssignments.map(empId => {
          const emp = employees.find(e => e.id === empId);
          const shiftLetter = getCurrentShift(empId, weekStart, localRotation) || "A";
          return (
            <div key={empId} className="card" style={{ marginBottom: "8px", borderLeft: "4px solid var(--info)", padding: "12px 16px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 8 }}>
                <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
                  <span style={{ fontWeight: "600" }}>{emp?.name || "Empleado #"+empId}</span>
                  <span style={{ fontSize: "12px", color: "#666" }}>{emp?.role || ""}</span>
                  <div className={`turno-badge turno-${shiftLetter}`} style={{ fontSize: "13px", padding: "3px 10px" }}>{shiftLetter}</div>
                </div>
                <div style={{ display: "flex", gap: "8px" }}>
                  <button className="btn btn-secondary btn-sm" onClick={() => { setReplaceSlotId(empId); setNewEmpId(""); setShowReplaceModal(true); }}>Reemplazar</button>
                  <button className="btn btn-danger btn-sm" onClick={() => handleRemoveFromRotation(empId)}>Quitar</button>
                </div>
              </div>
            </div>
          );
        })}

        <div className="card" style={{ marginTop: "16px", borderLeft: "4px solid var(--success)" }}>
          <h4 style={{ marginBottom: "12px" }}>Añadir empleado a rotación</h4>
          <div style={{ display: "flex", gap: "8px", alignItems: "flex-end", flexWrap: "wrap" }}>
            <div style={{ flex: 1, minWidth: "140px" }}>
              <label style={{ display: "block", fontSize: "12px", marginBottom: "4px" }}>Empleado</label>
              <select className="input" value={addEmpId} onChange={e => setAddEmpId(e.target.value)} style={{ marginBottom: 0 }}>
                <option value="">Seleccionar...</option>
                {employees.filter(e => e.shiftType === "store" && localRotation.assignments[e.id] === undefined).map(e => (
                  <option key={e.id} value={e.id}>{e.name}</option>
                ))}
              </select>
            </div>
            <div style={{ width: "140px" }}>
              <label style={{ display: "block", fontSize: "12px", marginBottom: "4px" }}>Turno esta semana</label>
              <select className="input" value={addShiftIdx} onChange={e => setAddShiftIdx(e.target.value)} style={{ marginBottom: 0 }}>
                <option value="0">Turno A</option>
                <option value="1">Turno B</option>
                <option value="2">Turno C</option>
              </select>
            </div>
            <button className="btn btn-success btn-sm" onClick={handleAddToRotation} disabled={!addEmpId} style={{ height: "44px" }}>Añadir</button>
          </div>
        </div>
      </div>

      {/* ─── Modo 2 dependientes (baja, vacante...) ─── */}
      <div style={{ marginTop: "28px" }}>
        <h3 style={{ marginBottom: "4px" }}>Modo 2 dependientes <span style={{ fontSize: 12, background: "#E1F5FE", color: "#01579B", padding: "2px 8px", borderRadius: 10, fontWeight: 600 }}>Especial A / B</span></h3>
        <p style={{ fontSize: "12px", color: "#666", marginBottom: "12px" }}>
          Para cuando la tienda se queda con dos dependientes (una baja, una vacante...). Sustituye la
          rotación A/B/C por dos turnos que se alternan cada semana. Es el mismo cuadrante que se usa
          en verano, porque es la misma situación. Al desactivarlo se vuelve solo a A/B/C.
        </p>

        <div className="card" style={{ marginBottom: 12, background: localRotation.specialMode ? "#E1F5FE" : "var(--card-bg)", borderLeft: `4px solid ${localRotation.specialMode ? "#0288D1" : "var(--border)"}` }}>
          <label style={{ display: "flex", alignItems: "center", gap: 10, cursor: "pointer", fontWeight: 600 }}>
            <input
              type="checkbox"
              checked={!!localRotation.specialMode}
              onChange={e => {
                const activar = e.target.checked;
                // Al activarlo por primera vez se proponen los dos dependientes
                // habituales, pero se pueden cambiar abajo en cualquier momento.
                const yaHay = Object.keys(localRotation.specialAssignments || {}).length > 0;
                const propuesta = yaHay ? localRotation.specialAssignments : proponerDuo();
                persistRotation({ ...localRotation, specialMode: activar, specialAssignments: propuesta });
              }}
              style={{ width: 18, height: 18 }}
            />
            {localRotation.specialMode ? "Activado: la tienda funciona con 2 dependientes" : "Activar cuando falte un dependiente"}
          </label>
          {localRotation.specialMode && (
            <p style={{ fontSize: 12, color: "#01579B", marginTop: 8, marginBottom: 0 }}>
              Mientras esté activo, los turnos A/B/C y los de verano quedan en pausa. Quien no aparezca
              asignado aquí no tendrá turno de tienda.
            </p>
          )}
        </div>

        {localRotation.specialMode && employees.filter(e => e.shiftType === "store").map(emp => {
          const baseIdx = localRotation.specialAssignments?.[emp.id];
          const hasBase = baseIdx !== undefined && baseIdx !== null && baseIdx !== "";
          const currentShift = hasBase ? getCurrentShift(emp.id, today, localRotation) : null;
          return (
            <div key={emp.id} className="card" style={{ marginBottom: "8px", borderLeft: "4px solid #0288D1", padding: "12px 16px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 8 }}>
                <div>
                  <span style={{ fontWeight: 600 }}>{emp.name}</span>
                  {currentShift && <span style={{ fontSize: 11, color: "#888", marginLeft: 8 }}>Esta semana: <strong>{currentShift === "EA" ? "Especial A" : "Especial B"}</strong></span>}
                </div>
                <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                  <select className="input" value={hasBase ? String(baseIdx) : ""} onChange={e => {
                    const val = e.target.value;
                    const nuevas = { ...(localRotation.specialAssignments || {}) };
                    if (val !== "") nuevas[emp.id] = Number(val); else delete nuevas[emp.id];
                    persistRotation({ ...localRotation, specialAssignments: nuevas });
                  }} style={{ width: "190px", marginBottom: 0 }}>
                    <option value="">No entra en el modo especial</option>
                    <option value="0">Base Especial A (esta semana A)</option>
                    <option value="1">Base Especial B (esta semana B)</option>
                  </select>
                  {currentShift && <div className={`turno-badge turno-${currentShift}`}>{currentShift === "EA" ? "EA" : "EB"}</div>}
                </div>
              </div>
            </div>
          );
        })}

        {localRotation.specialMode && (
          <>
            {avisoDuo && (
              <div className="card" style={{ background: "#FFF3E0", border: "1px solid #FF9800", marginTop: 10 }}>
                <p style={{ fontSize: 12, color: "#E65100", margin: 0 }}>⚠️ {avisoDuo}</p>
              </div>
            )}
            <div className="card" style={{ marginTop: 10, background: "#E1F5FE", border: "1px solid #81D4FA" }}>
              <p style={{ fontSize: 12, color: "#01579B", margin: 0 }}><strong>Resumen horarios especiales (40 h cada uno):</strong><br/>
                <strong>Especial A:</strong> L/M 9:30-14 y 17:30-20:50 · X/J libre · V 10:30-14 y 17:30-20 · S 9-14:30 y 17-20:50 · D 9-14:30 y 17:20-20:50<br/>
                <strong>Especial B:</strong> L/M libre · X/J 9:30-14 y 17:30-20:50 · V 9:30-13 y 18-20:50 · S 9-14:30 y 17:20-20:50 · D 9-14:10 y 17-20:50
              </p>
            </div>
          </>
        )}
      </div>

      {/* ─── Asignación Verano ─── */}
      <div style={{ marginTop: "28px" }}>
        <h3 style={{ marginBottom: "4px" }}>Turnos de Verano <span className="summer-badge">☀️ 1 Jun – 31 Ago</span></h3>
        <p style={{ fontSize: "12px", color: "#666", marginBottom: "12px" }}>Asigna el turno base de esta semana a cada empleado de tienda. Rotarán automáticamente cada semana (V1→V2→V1…) igual que hacen A/B/C en invierno.</p>
        {employees.filter(e => e.shiftType === "store").map(emp => {
          const baseIdx = localRotation.summerAssignments?.[emp.id];
          const hasBase = baseIdx !== undefined && baseIdx !== null && baseIdx !== "";
          const currentShift = hasBase ? getCurrentShift(emp.id, today, localRotation) : null;
          return (
            <div key={emp.id} className="card" style={{ marginBottom: "8px", borderLeft: "4px solid #880E4F", padding: "12px 16px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 8 }}>
                <div>
                  <span style={{ fontWeight: 600 }}>{emp.name}</span>
                  {currentShift && <span style={{ fontSize: 11, color: "#888", marginLeft: 8 }}>Esta semana: <strong>{currentShift}</strong></span>}
                </div>
                <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                  <select className="input" value={hasBase ? String(baseIdx) : ""} onChange={e => {
                    const val = e.target.value;
                    const newSA = { ...(localRotation.summerAssignments || {}) };
                    if (val !== "") newSA[emp.id] = Number(val); else delete newSA[emp.id];
                    persistRotation({ ...localRotation, summerAssignments: newSA });
                  }} style={{ width: "150px", marginBottom: 0 }}>
                    <option value="">Sin asignar</option>
                    <option value="0">Base V1 (esta semana V1)</option>
                    <option value="1">Base V2 (esta semana V2)</option>
                  </select>
                  {currentShift && <div className={`turno-badge turno-${currentShift}`}>{currentShift}</div>}
                </div>
              </div>
            </div>
          );
        })}
        <div className="card" style={{ marginTop: 10, background: "#FCE4EC", border: "1px solid #F48FB1" }}>
          <p style={{ fontSize: 12, color: "#880E4F" }}><strong>Resumen horarios de verano:</strong><br/>
            <strong>V1:</strong> L/M 9:30-14 y 17:30-20:50 · X/J libre · V 10:30-14 y 17:30-20 · S 9-14:30 y 17-20:50 · D 9-14:30 y 17:20-20:50<br/>
            <strong>V2:</strong> L/M libre · X/J 9:30-14 y 17:30-20:50 · V 9:30-13 y 18-20:50 · S 9-14:30 y 17:20-20:50 · D 9-14:10 y 17-20:50
          </p>
        </div>
      </div>

      {showReplaceModal && (
        <div className="modal">
          <div className="modal-content">
            <div className="modal-header">
              <span>Reemplazar empleado en rotación</span>
              <button className="modal-close" onClick={() => setShowReplaceModal(false)}>×</button>
            </div>
            <p style={{ fontSize: "13px", marginBottom: "8px" }}>Reemplazando a: <strong>{employees.find(e => e.id === replaceSlotId)?.name}</strong></p>
            <p style={{ fontSize: "12px", color: "#666", marginBottom: "16px" }}>El nuevo empleado continuará la rotación desde el mismo turno. Sus vacaciones y datos son independientes.</p>
            <div className="form-group">
              <label htmlFor="field-20">Nuevo empleado</label>
              <select id="field-20" className="input" value={newEmpId} onChange={e => setNewEmpId(e.target.value)}>
                <option value="">Seleccionar...</option>
                {employees.filter(e => e.shiftType === "store" && localRotation.assignments[e.id] === undefined).map(e => (
                  <option key={e.id} value={e.id}>{e.name} — {e.role}</option>
                ))}
              </select>
            </div>
            <div style={{ display: "flex", gap: "8px" }}>
              <button className="btn btn-secondary btn-sm" style={{ flex: 1 }} onClick={() => setShowReplaceModal(false)}>Cancelar</button>
              <button className="btn btn-primary btn-sm" style={{ flex: 2 }} onClick={handleReplaceEmployee} disabled={!newEmpId}>Confirmar reemplazo</button>
            </div>
          </div>
        </div>
      )}

      {confirmRemove != null && (
        <ConfirmModal
          title="Quitar de rotación"
          message={`¿Quitar a ${employees.find(e => e.id === confirmRemove)?.name || "este empleado"} de la rotación A/B/C?`}
          danger
          confirmText="Sí, quitar"
          onCancel={() => setConfirmRemove(null)}
          onConfirm={confirmRemoveDo}
        />
      )}
    </div>
  );
}

// FIX #42: SignatureCanvas usa el hook
function SignatureCanvas({ assignmentDetails, onSave, onCancel }) {
  const canvasRef = useRef(null);
  const { hasSigned, handlers, clear } = useSignaturePad(canvasRef);
  const a = assignmentDetails;
  return (
    <div className="modal"><div className="modal-content">
      <div className="modal-header"><span>Firmar Vacaciones</span><button className="modal-close" onClick={onCancel}>×</button></div>
      <div style={{ background: "#FFF3E0", border: "1px solid #FF9800", borderRadius: "8px", padding: "12px", marginBottom: "16px" }}>
        {a.startDate && a.endDate && <p><strong>Período:</strong> {a.startDate} al {a.endDate}</p>}
        <p><strong>Días:</strong> {a.days}</p>
        {a.note && <p><strong>Nota:</strong> {a.note}</p>}
      </div>
      <p style={{ fontSize: "14px", color: "#666", marginBottom: "8px" }}>Firma con el dedo en el recuadro:</p>
      <canvas ref={canvasRef} width={400} height={150} className="signature-canvas" {...handlers} />
      <div style={{ marginTop: "8px" }}><button className="btn btn-secondary btn-sm" onClick={clear}>Borrar firma</button></div>
      <div className="modal-footer">
        <button className="btn btn-secondary btn-sm" onClick={onCancel}>Cancelar</button>
        <button className="btn btn-success btn-sm" onClick={() => onSave(canvasToCompressed(canvasRef.current))} disabled={!hasSigned}>Confirmar Firma</button>
      </div>
    </div></div>
  );
}

// FIX #34: validar que el empleado tiene días suficientes
function AssignVacationsScreen({ employees, vacationAssignments, addVacationAssignment, deleteVacationAssignment }) {
  const [selectedEmpId, setSelectedEmpId] = useState(employees[0]?.id || null);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [customDays, setCustomDays] = useState("");
  const [note, setNote] = useState("");
  const [saved, setSaved] = useState(false);
  const [warning, setWarning] = useState("");

  const calcDays = () => {
    if (startDate && endDate) {
      const sd = parseLocalDate(startDate), ed = parseLocalDate(endDate);
      if (!sd || !ed) return 0;
      const diff = Math.round((ed - sd) / 86400000) + 1;
      if (diff > 0) return diff;
    }
    const n = parseInt(customDays);
    return Number.isFinite(n) && n > 0 ? n : 0;
  };
  const days = calcDays();

  const selectedEmp = employees.find(e => e.id === selectedEmpId);
  const availableDays = selectedEmp ? selectedEmp.monthsWorked * 2.5 + selectedEmp.workedHolidays + selectedEmp.vacationDays : 0;

  const handleAssign = async () => {
    setWarning("");
    if (!selectedEmpId || days <= 0) return;
    if (days > availableDays) { setWarning(`Atención: el empleado solo tiene ${availableDays.toFixed(1)} días disponibles. Se asignarán de todas formas pero el contador quedará en negativo.`); }
    const newA = { id: Date.now().toString(), employeeId: selectedEmpId, startDate: startDate || null, endDate: endDate || null, days, note, status: "pending", signatureData: null, signedAt: null, assignedAt: new Date().toISOString() };
    await addVacationAssignment(newA);
    setSaved(true); setTimeout(() => setSaved(false), 3000);
    setStartDate(""); setEndDate(""); setCustomDays(""); setNote("");
  };

  return (
    <div className="container">
      <h2>Asignar Vacaciones</h2>
      <div className="card" style={{ marginTop: "16px" }}>
        <h4 style={{ marginBottom: "16px" }}>Nueva Asignación</h4>
        <div className="form-group"><label htmlFor="field-21">Empleado</label>
          <select id="field-21" className="input" value={selectedEmpId || ""} onChange={e => setSelectedEmpId(parseInt(e.target.value))}>
            {employees.map(e => <option key={e.id} value={e.id}>{e.name}</option>)}
          </select>
        </div>
        {selectedEmp && <div style={{ background: "#E3F2FD", padding: 8, borderRadius: 6, fontSize: 12, marginBottom: 12 }}>Días disponibles: <strong>{availableDays.toFixed(1)}</strong></div>}
        <div className="form-group"><label htmlFor="field-22">Fecha inicio (opcional)</label><input id="field-22" type="date" className="input" value={startDate} onChange={e => setStartDate(e.target.value)} /></div>
        <div className="form-group"><label htmlFor="field-23">Fecha fin (opcional)</label><input id="field-23" type="date" className="input" value={endDate} min={startDate} onChange={e => setEndDate(e.target.value)} /></div>
        {(!startDate || !endDate) && <div className="form-group"><label htmlFor="field-24">Número de días</label><input id="field-24" type="number" className="input" value={customDays} onChange={e => setCustomDays(e.target.value)} min="1" placeholder="Días de vacaciones" /></div>}
        {days > 0 && <div style={{ background: "#E8F5E9", padding: "12px", borderRadius: "8px", marginBottom: "16px", fontWeight: "600", color: "#2E7D32" }}>Días a asignar: {days}</div>}
        {warning && <div style={{ background: "#FFF3E0", color: "#E65100", padding: 10, borderRadius: 6, fontSize: 13, marginBottom: 12 }}>{warning}</div>}
        <div className="form-group"><label htmlFor="field-25">Nota (opcional)</label><input id="field-25" type="text" className="input" value={note} onChange={e => setNote(e.target.value)} placeholder="Ej: Vacaciones verano" /></div>
        {saved && <div style={{ color: "#2E7D32", fontWeight: "600", marginBottom: "12px" }}>✓ Asignación creada — pendiente de firma del empleado</div>}
        <button className="btn btn-primary" style={{ width: "100%" }} onClick={handleAssign} disabled={!selectedEmpId || days <= 0}>Asignar Vacaciones (Pendiente de firma)</button>
      </div>
      <div className="card" style={{ marginTop: "16px" }}>
        <h4 style={{ marginBottom: "16px" }}>Asignaciones realizadas</h4>
        {vacationAssignments.length === 0 && <p style={{ color: "#999" }}>No hay asignaciones</p>}
        {[...vacationAssignments].sort((a,b) => (b.assignedAt||"").localeCompare(a.assignedAt||"")).map(a => {
          const emp = employees.find(e => e.id === a.employeeId);
          return (
            <div key={a.id} style={{ background: a.status === "signed" ? "#E8F5E9" : "#FFF3E0", border: `1px solid ${a.status === "signed" ? "#4CAF50" : "#FF9800"}`, borderRadius: "8px", padding: "12px", marginBottom: "8px", display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
              <div>
                <div style={{ fontWeight: "600" }}>{emp?.name || "Desconocido"}</div>
                <div style={{ fontSize: "13px", color: "#666" }}>{a.startDate && a.endDate ? `${a.startDate} al ${a.endDate} · ` : ""}{a.days} días{a.note ? ` · ${a.note}` : ""}</div>
                <div style={{ marginTop: "4px" }}>
                  <span style={{ padding: "2px 8px", borderRadius: "12px", fontSize: "12px", fontWeight: "600", background: a.status === "signed" ? "#4CAF50" : "#FF9800", color: "white" }}>{a.status === "signed" ? "Firmada" : "Pendiente de firma"}</span>
                  {a.signedAt && <span style={{ fontSize: "12px", color: "#666", marginLeft: "8px" }}>Firmada: {new Date(a.signedAt).toLocaleDateString("es-ES")}</span>}
                </div>
              </div>
              {a.status === "pending" && <button className="btn btn-danger btn-sm" onClick={() => deleteVacationAssignment(a.id)}>×</button>}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// FIX #33: bloquear -/+ si hay asignaciones firmadas pendientes recientes
function VacationPlanningScreen({ employees, updateEmployeeVacation, userProfile, vacationAssignments, signVacationAssignment }) {
  const [signingAssignment, setSigningAssignment] = useState(null);
  const visible = userProfile.role === "empleado" ? employees.filter(e => e.id === userProfile.linkedEmployeeId) : employees;
  const canModify = userProfile.role === "admin";
  const pendingAssignments = (userProfile.role === "empleado" && userProfile.linkedEmployeeId)
    ? vacationAssignments.filter(a => a.employeeId === userProfile.linkedEmployeeId && a.status === "pending")
    : [];

  const handleSign = async (signatureData) => {
    const a = signingAssignment;
    await signVacationAssignment(a, signatureData);
    setSigningAssignment(null);
  };

  if (userProfile.role === "empleado" && !userProfile.linkedEmployeeId) {
    return <div className="container"><h2>Mis Vacaciones</h2><div className="card" style={{ marginTop: "16px", background: "#FFF3E0", border: "2px solid #FF9800" }}><p style={{ color: "#E65100" }}>No tienes un empleado asignado. Contacta con tu administrador.</p></div></div>;
  }

  return (
    <div className="container">
      <h2>{userProfile.role === "empleado" ? "Mis Vacaciones" : "Planificación de Vacaciones"}</h2>
      {pendingAssignments.length > 0 && (
        <div className="card" style={{ marginTop: "16px", background: "#FFF3E0", border: "2px solid #FF9800" }}>
          <h4 style={{ color: "#E65100", marginBottom: "12px" }}>Vacaciones pendientes de firma</h4>
          {pendingAssignments.map(a => (
            <div key={a.id} style={{ marginBottom: "12px" }}>
              <p>{a.startDate && a.endDate ? `Del ${a.startDate} al ${a.endDate}: ` : ""}<strong>{a.days} días</strong>{a.note ? ` (${a.note})` : ""}</p>
              <button className="btn btn-primary btn-sm" style={{ marginTop: "8px" }} onClick={() => setSigningAssignment(a)}>Firmar</button>
            </div>
          ))}
        </div>
      )}
      {visible.map(emp => {
        const baseVac = emp.monthsWorked * 2.5;
        const total = baseVac + emp.vacationDays;
        const signed = vacationAssignments.filter(a => a.employeeId === emp.id && a.status === "signed");
        const daysUsed = signed.reduce((s,a) => s + (a.days || 0), 0);
        return (
          <div key={emp.id} className="card" style={{ marginTop: "16px" }}>
            <h4>{emp.name}</h4>
            {/* Desglose detallado */}
            <div style={{ background: "#F5F1E8", borderRadius: 8, padding: "10px 12px", marginTop: 12, fontSize: 13 }}>
              <div style={{ display:"flex", justifyContent:"space-between", marginBottom:4 }}>
                <span>Acumulado ({emp.monthsWorked} meses × 2.5):</span>
                <strong>{baseVac.toFixed(1)} días</strong>
              </div>
              <div style={{ display:"flex", justifyContent:"space-between", marginBottom:4, color: emp.vacationDays < 0 ? "#F44336" : "#333" }}>
                <span>Ajuste / festivos trabajados:</span>
                <strong>{emp.vacationDays >= 0 ? "+" : ""}{emp.vacationDays} días</strong>
              </div>
              <div style={{ display:"flex", justifyContent:"space-between", borderTop:"1px solid #DDD", paddingTop:4, marginTop:4, fontWeight:700 }}>
                <span>Total disponible:</span>
                <span style={{ color: total < 0 ? "#F44336" : "var(--primary)" }}>{total.toFixed(1)} días</span>
              </div>
              {daysUsed > 0 && (
                <div style={{ display:"flex", justifyContent:"space-between", color:"#666", marginTop:4, fontSize:12 }}>
                  <span>Ya disfrutados (firmados):</span>
                  <span>−{daysUsed} días</span>
                </div>
              )}
            </div>
            <div className="vacation-control">
              {canModify && <button className="vacation-btn" onClick={() => updateEmployeeVacation(emp.id, -1)} title="Restar 1 día">−</button>}
              <div className="vacation-value" style={{ color: total < 0 ? "#F44336" : "var(--primary)" }}>{total.toFixed(1)}</div>
              {canModify && <button className="vacation-btn" onClick={() => updateEmployeeVacation(emp.id, 1)} title="Sumar 1 día">+</button>}
            </div>
            {canModify && <p style={{ fontSize:11, color:"#999", textAlign:"center", marginTop:4 }}>Los botones ±1 ajustan el campo "Ajuste / festivos trabajados"</p>}
            {signed.length > 0 && (
              <div style={{ marginTop: "12px", borderTop: "1px solid #EEE", paddingTop: "12px" }}>
                <p style={{ fontSize: "13px", fontWeight: "600", marginBottom: "8px", color: "#666" }}>Vacaciones firmadas:</p>
                {signed.map(a => (
                  <div key={a.id} style={{ fontSize: "13px", color: "#555", marginBottom: "4px" }}>• {a.startDate && a.endDate ? `${a.startDate} al ${a.endDate}: ` : ""}{a.days} días{a.note ? ` (${a.note})` : ""}</div>
                ))}
              </div>
            )}
          </div>
        );
      })}
      {signingAssignment && <SignatureCanvas assignmentDetails={signingAssignment} onSave={handleSign} onCancel={() => setSigningAssignment(null)} />}
    </div>
  );
}

function ConsultarHorarioScreen({ employees, userProfile, shiftTemplates, rotationConfig, pastryTemplates }) {
  const [selectedEmpId, setSelectedEmpId] = useState(() => userProfile.role === "empleado" ? userProfile.linkedEmployeeId : (employees[0]?.id || null));
  const [weekStart, setWeekStart] = useState(() => getMondayOfWeek(new Date()));
  const emp = employees.find(e => e.id === selectedEmpId);

  if (!selectedEmpId || !emp) return <div className="container"><h2>Mi Horario</h2><div className="card" style={{ marginTop: "16px", background: "#FFF3E0", border: "2px solid #FF9800" }}><p style={{ color: "#E65100" }}>No tienes un empleado asignado. Contacta con tu administrador.</p></div></div>;

  const shift = getCurrentShift(emp.id, weekStart, rotationConfig);
  const summer = isSummerPeriod(weekStart);

  // Determina la plantilla efectiva según tipo de empleado y temporada
  let effectiveTemplate = null;
  let shiftLabel = "—";
  if (shift) {
    effectiveTemplate = getShiftTemplate(shift, shiftTemplates);
    shiftLabel = shift;
  } else if (emp.shiftType === "pastry") {
    const pKey = emp.pastryShift || "P1";
    effectiveTemplate = pastryTemplates?.[pKey] || null;
    shiftLabel = pKey;
  }

  if (!effectiveTemplate) {
    return <div className="container"><h2>Mi Horario</h2><div className="card" style={{ marginTop: "16px" }}><h3>{emp.name}</h3><p style={{ color: "#999", marginTop: "8px" }}>No tienes turno asignado esta semana. Habla con tu responsable.</p></div></div>;
  }

  const days = ["L","M","X","J","V","S","D"];
  const dayLabels = ["Lunes","Martes","Miércoles","Jueves","Viernes","Sábado","Domingo"];
  const schedule = days.map((day, idx) => {
    const date = new Date(weekStart); date.setDate(weekStart.getDate() + idx);
    const ds = effectiveTemplate[day];
    if (ds === null || ds === undefined) return { date, label: dayLabels[idx], isFree: true };
    return { date, label: dayLabels[idx], isFree: false, morning: ds.m1 && ds.m2 ? `${ds.m1} - ${ds.m2}` : "-", afternoon: ds.t1 && ds.t2 ? `${ds.t1} - ${ds.t2}` : "-" };
  });

  const prevWeek = () => { const d = new Date(weekStart); d.setDate(d.getDate() - 7); setWeekStart(d); };
  const nextWeek = () => { const d = new Date(weekStart); d.setDate(d.getDate() + 7); setWeekStart(d); };
  const weekEnd = new Date(weekStart.getTime() + 6 * 24 * 60 * 60 * 1000);
  const badgeClass = `turno-${shiftLabel}`;
  const esEspecial = shiftLabel === "EA" || shiftLabel === "EB";

  return (
    <div className="container">
      <h2>Mi Horario</h2>
      {(userProfile.role === "admin" || userProfile.role === "manager") && (
        <div className="form-group" style={{ marginTop: "16px" }}>
          <label htmlFor="field-26">Empleado</label>
          <select id="field-26" className="input" value={selectedEmpId} onChange={e => setSelectedEmpId(parseInt(e.target.value))}>
            {employees.map(e => <option key={e.id} value={e.id}>{e.name}</option>)}
          </select>
        </div>
      )}
      <div className="card" style={{ marginTop: "16px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
          <h3>{emp.name}</h3>
          <div style={{ display:"flex", gap:6, alignItems:"center" }}>
            {/* En modo especial el turno no es el de verano aunque estemos en
                julio, así que el distintivo de verano no debe confundir. */}
            {summer && !esEspecial && <span className="summer-badge">☀️ Verano</span>}
            {esEspecial && <span style={{ display: "inline-block", background: "#0288D1", color: "white", padding: "3px 10px", borderRadius: 20, fontSize: 12, fontWeight: 700 }}>2 dependientes</span>}
            <div className={`turno-badge ${badgeClass}`}>{esEspecial ? (shiftLabel === "EA" ? "Especial A" : "Especial B") : shiftLabel}</div>
          </div>
        </div>
      </div>
      <div className="week-nav">
        <button onClick={prevWeek}>← Anterior</button>
        <div className="week-label">{weekStart.toLocaleDateString("es-ES", { day: "2-digit", month: "2-digit" })} - {weekEnd.toLocaleDateString("es-ES", { day: "2-digit", month: "2-digit" })}</div>
        <button onClick={nextWeek}>Siguiente →</button>
      </div>
      <div className="shift-schedule">
        {schedule.map((day, idx) => (
          <div key={idx} className={`shift-day ${day.isFree ? "libre" : ""}`}>
            <div className="date">{day.label} - {day.date.toLocaleDateString("es-ES")}</div>
            {day.isFree ? <div className="hours" style={{ fontStyle: "italic", color: "#999" }}>Libre</div> : <><div className="hours">Mañana: {day.morning}</div><div className="hours">Tarde: {day.afternoon}</div></>}
          </div>
        ))}
      </div>
    </div>
  );
}

// FIX #3, #5, #15, #31, #47, #48: fichaje robusto con histórico, validación pastry, hash, etc.
function FicharScreen({ userProfile, employees, shiftTemplates, rotationConfig, pastryTemplates, showNotification }) {
  const [registrosVentana, setRegistrosVentana] = useState([]);
  const [loadingRegistros, setLoadingRegistros] = useState(userProfile.role !== "admin");
  // La fecha se refresca sola: si la app se queda abierta y pasa la medianoche,
  // el listener y el formulario tienen que apuntar ya al día nuevo.
  const [selectedDate, setSelectedDate] = useState(toLocalDateStr(new Date()));
  useEffect(() => {
    const id = setInterval(() => {
      const hoy = toLocalDateStr(new Date());
      setSelectedDate(prev => (prev === hoy ? prev : hoy));
    }, 60000);
    return () => clearInterval(id);
  }, []);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [adminRegistros, setAdminRegistros] = useState([]);
  const [adminSearched, setAdminSearched] = useState(false);
  const [showSignModal, setShowSignModal] = useState(false);
  const [pendingFicharType, setPendingFicharType] = useState(null);
  const [viewSignature, setViewSignature] = useState(null);
  const [showRetroModal, setShowRetroModal] = useState(false);
  const [retroDate, setRetroDate] = useState("");
  const [retroTime, setRetroTime] = useState("08:00");
  const [retroType, setRetroType] = useState("entrada");
  const [retroAccepted, setRetroAccepted] = useState(false);
  // Entrada abierta que se está subsanando (null = fichaje retroactivo suelto).
  const [cerrandoEntrada, setCerrandoEntrada] = useState(null);
  const [showFueraTurnoModal, setShowFueraTurnoModal] = useState(false);
  const [fueraTurnoAccepted, setFueraTurnoAccepted] = useState(false);
  const [fueraTurnoInfo, setFueraTurnoInfo] = useState({ currentTime: "", shiftLetter: "-", horarioPrevisto: "" });
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [historyRegistros, setHistoryRegistros] = useState([]);
  const [historyFrom, setHistoryFrom] = useState("");
  const [historyTo, setHistoryTo] = useState("");
  const [submittingFichaje, setSubmittingFichaje] = useState(false);

  const signCanvasRef = useRef(null);
  const retroCanvasRef = useRef(null);
  const fueraTurnoCanvasRef = useRef(null);
  const sign = useSignaturePad(signCanvasRef);
  const retroSign = useSignaturePad(retroCanvasRef);
  const fueraTurnoSign = useSignaturePad(fueraTurnoCanvasRef);

  const isAdmin = userProfile.role === "admin";
  const TOLERANCE_MIN = 30;
  const DAY_KEYS = ["D","L","M","X","J","V","S"];
  const toMins = (t) => { const [h,m] = t.split(":").map(Number); return h*60+m; };

  // FIX #3: cargar registros del día actual al montar.
  // Se carga una ventana de 14 días en vez de solo hoy, para poder detectar
  // jornadas que quedaron sin cerrar. Es la misma consulta (userId + rango de
  // date) y usa el mismo índice compuesto, así que no cuesta nada más.
  const VENTANA_DIAS = 14;
  const desdeVentana = useMemo(() => {
    const d = parseLocalDate(selectedDate);
    if (!d) return selectedDate;
    d.setDate(d.getDate() - VENTANA_DIAS);
    return toLocalDateStr(d);
  }, [selectedDate]);

  useEffect(() => {
    if (isAdmin || !fbReady() || !userProfile.uid) return;
    const unsub = fb().firestore().collection("registros_horarios")
      .where("userId", "==", userProfile.uid)
      .where("date", ">=", desdeVentana)
      .where("date", "<=", selectedDate)
      .onSnapshot(snap => {
        setRegistrosVentana(snap.docs.map(d => ({ id: d.id, ...d.data() })));
        setLoadingRegistros(false);
      }, err => { console.error("registros sync:", err); setLoadingRegistros(false); });
    return () => unsub();
  }, [isAdmin, userProfile.uid, selectedDate, desdeVentana]);

  // Los del día, para la pantalla de fichar.
  const registros = useMemo(
    () => registrosVentana.filter(r => r.date === selectedDate),
    [registrosVentana, selectedDate]
  );
  // Días anteriores con una entrada sin su salida: el olvido que hay que subsanar.
  const sinCerrar = useMemo(
    () => jornadasSinCerrar(registrosVentana, selectedDate),
    [registrosVentana, selectedDate]
  );

  // Obtiene el slot efectivo según tipo de empleado y temporada
  const getEffectiveSlot = (emp, dateStr) => {
    if (!emp) return null;
    const d = parseLocalDate(dateStr);
    if (!d) return null;
    const dayKey = DAY_KEYS[d.getDay()];
    const sl = getCurrentShift(emp.id, d, rotationConfig);
    if (sl) {
      const tmpl = getShiftTemplate(sl, shiftTemplates);
      return tmpl?.[dayKey] ?? null;
    }
    if (emp.shiftType === "pastry") {
      const pKey = emp.pastryShift || "P1";
      return pastryTemplates?.[pKey]?.[dayKey] ?? null;
    }
    return null;
  };

  const getScheduledCandidates = (type, slot) => {
    if (!slot) return [];
    return (type === "entrada" ? [slot.m1, slot.t1] : [slot.m2, slot.t2]).filter(Boolean);
  };

  const findClosestScheduled = (actualTime, candidates) => {
    if (!candidates.length) return null;
    let best = null, bestDiff = Infinity;
    candidates.forEach(c => { const diff = Math.abs(toMins(c) - toMins(actualTime)); if (diff < bestDiff) { bestDiff = diff; best = c; } });
    return bestDiff <= TOLERANCE_MIN ? best : null;
  };

  const getShiftLabel = (emp, dateStr) => {
    const d = parseLocalDate(dateStr);
    if (!d) return "-";
    const sl = getCurrentShift(emp.id, d, rotationConfig);
    if (sl) return sl;
    if (emp.shiftType === "pastry") return emp.pastryShift || "PA";
    return "-";
  };

  const handleFichar = (type) => {
    if (!userProfile.linkedEmployeeId) {
      showNotification("Tu usuario no está vinculado a un empleado. Pide al administrador que lo vincule.", "error");
      return;
    }
    const linkedEmp = employees.find(e => e.id === userProfile.linkedEmployeeId);
    if (!linkedEmp) { showNotification("Empleado no encontrado", "error"); return; }
    const now = new Date();
    const time = now.toLocaleTimeString("es-ES", { hour: "2-digit", minute: "2-digit" });
    const slot = getEffectiveSlot(linkedEmp, selectedDate);
    const candidates = getScheduledCandidates(type, slot);
    const scheduledTime = findClosestScheduled(time, candidates);
    setPendingFicharType(type);
    if (slot && !scheduledTime) {
      // FIX #5: aplicable también a panaderos
      const entradas = slot ? [slot.m1, slot.t1].filter(Boolean) : [];
      const salidas = slot ? [slot.m2, slot.t2].filter(Boolean) : [];
      const horarioPrevisto = slot ? `Entrada: ${entradas.join(" / ")} · Salida: ${salidas.join(" / ")}` : "Día libre según tu turno";
      setFueraTurnoInfo({ currentTime: time, shiftLetter: getShiftLabel(linkedEmp, selectedDate), horarioPrevisto });
      setFueraTurnoAccepted(false); fueraTurnoSign.reset();
      setShowFueraTurnoModal(true);
      return;
    }
    if (!slot) {
      // Día libre o empleado sin horario definido
      setFueraTurnoInfo({ currentTime: time, shiftLetter: getShiftLabel(linkedEmp, selectedDate), horarioPrevisto: "Día libre según tu turno" });
      setFueraTurnoAccepted(false); fueraTurnoSign.reset();
      setShowFueraTurnoModal(true);
      return;
    }
    sign.reset();
    setShowSignModal(true);
  };

  const handleConfirmFichar = async () => {
    if (submittingFichaje) return;
    if (!sign.hasSigned) { showNotification("Por favor, firma antes de fichar", "warning"); return; }
    setSubmittingFichaje(true);
    try {
      const signature = canvasToCompressed(signCanvasRef.current);
      const now = new Date();
      const time = now.toLocaleTimeString("es-ES", { hour: "2-digit", minute: "2-digit" });
      const linkedEmp = employees.find(e => e.id === userProfile.linkedEmployeeId);
      const employeeName = linkedEmp ? linkedEmp.name : userProfile.name;
      const slot = getEffectiveSlot(linkedEmp, selectedDate);
      const candidates = getScheduledCandidates(pendingFicharType, slot);
      const scheduledTime = findClosestScheduled(time, candidates);
      // La fecha se toma del instante real del fichaje, no de cuando se abrió
      // la pantalla: es un registro horario legal (RDL 8/2019).
      const base = { userId: userProfile.uid, employeeId: linkedEmp?.id || null, employeeName, date: toLocalDateStr(now), type: pendingFicharType, time, timestamp: now.toISOString(), ...(scheduledTime ? { scheduledTime, withinTolerance: true } : {}) };
      const integrityHash = await digestRecord({ ...base, signatureHashOf: "raw" });
      const registro = { ...base, signature, integrityHash };
      await fb().firestore().collection("registros_horarios").add(registro);
      setShowSignModal(false); setPendingFicharType(null);
      showNotification(`${pendingFicharType === "entrada" ? "Entrada" : "Salida"} registrada a las ${time}`);
    } catch (e) { showNotification("Error al guardar: " + e.message, "error"); }
    setSubmittingFichaje(false);
  };

  const handleConfirmFueraTurno = async () => {
    if (submittingFichaje) return;
    if (!fueraTurnoAccepted) { showNotification("Debes aceptar la declaración de responsabilidad", "warning"); return; }
    if (!fueraTurnoSign.hasSigned) { showNotification("Por favor, firma la declaración", "warning"); return; }
    setSubmittingFichaje(true);
    try {
      const signature = canvasToCompressed(fueraTurnoCanvasRef.current);
      const now = new Date();
      const linkedEmp = employees.find(e => e.id === userProfile.linkedEmployeeId);
      const employeeName = linkedEmp ? linkedEmp.name : userProfile.name;
      const textoDeclaracion = `El empleado/a ${employeeName} declara bajo su responsabilidad haber fichado ${pendingFicharType} a las ${fueraTurnoInfo.currentTime}h fuera del horario establecido. Turno asignado ${fueraTurnoInfo.shiftLetter}: ${fueraTurnoInfo.horarioPrevisto}. La empresa no tiene responsabilidad al respecto.`;
      const base = { userId: userProfile.uid, employeeId: linkedEmp?.id || null, employeeName, date: toLocalDateStr(now), type: pendingFicharType, time: fueraTurnoInfo.currentTime, timestamp: now.toISOString(), fueraTolerancia: true, declaracionFueraTurno: textoDeclaracion };
      const integrityHash = await digestRecord(base);
      const registro = { ...base, signature, integrityHash };
      await fb().firestore().collection("registros_horarios").add(registro);
      setShowFueraTurnoModal(false);
      showNotification("Fichaje fuera de horario registrado");
    } catch (e) { showNotification("Error al guardar: " + e.message, "error"); }
    setSubmittingFichaje(false);
  };

  const handleOpenRetro = () => { setRetroDate(""); setRetroTime("08:00"); setRetroType("entrada"); setRetroAccepted(false); setCerrandoEntrada(null); retroSign.reset(); setShowRetroModal(true); };

  // Subsanar una jornada que quedó abierta. Se abre el mismo modal, pero ya
  // apuntando a la entrada concreta que hay que cerrar: así el apunte nuevo
  // queda enlazado con ella (`corrigeA`) y la trazabilidad es explícita, no
  // deducida por quien revise el registro.
  const handleCerrarJornada = (entradaAbierta) => {
    setCerrandoEntrada(entradaAbierta);
    setRetroDate(entradaAbierta.date);
    setRetroType("salida");
    // Propuesta de hora: el fin de turno previsto ese día. El trabajador la
    // confirma o la cambia — nunca se guarda sola.
    const linkedEmp = employees.find(e => e.id === userProfile.linkedEmployeeId);
    const slot = linkedEmp ? getEffectiveSlot(linkedEmp, entradaAbierta.date) : null;
    const inicio = minutosDeHora(entradaAbierta.time);
    // De los dos finales de turno del día (mañana y tarde), se propone el primero
    // que sea posterior a la entrada que quedó abierta.
    const candidatos = [slot?.m2, slot?.t2].filter(h => {
      const m = minutosDeHora(h);
      return m !== null && inicio !== null && m > inicio;
    });
    setRetroTime(candidatos[0] || "");
    setRetroAccepted(false);
    retroSign.reset();
    setShowRetroModal(true);
  };

  const handleConfirmRetro = async () => {
    if (submittingFichaje) return;
    if (!retroDate) { showNotification("Selecciona la fecha", "warning"); return; }
    if (!retroTime) { showNotification("Indica la hora del fichaje", "warning"); return; }
    if (!retroAccepted) { showNotification("Debes aceptar la declaración de responsabilidad", "warning"); return; }
    if (!retroSign.hasSigned) { showNotification("Por favor, firma la declaración", "warning"); return; }
    // Al cerrar una jornada abierta, la salida tiene que ser posterior a la
    // entrada: si no, quedaría un tramo de duración imposible en el registro.
    if (cerrandoEntrada) {
      const ini = minutosDeHora(cerrandoEntrada.time);
      const fin = minutosDeHora(retroTime);
      if (fin === null) { showNotification("La hora no es válida", "warning"); return; }
      if (ini !== null && fin <= ini) {
        showNotification(`La salida debe ser posterior a la entrada de las ${cerrandoEntrada.time}h`, "warning");
        return;
      }
    }
    setSubmittingFichaje(true);
    try {
      const signature = canvasToCompressed(retroCanvasRef.current);
      const now = new Date();
      const linkedEmp = employees.find(e => e.id === userProfile.linkedEmployeeId);
      const employeeName = linkedEmp ? linkedEmp.name : userProfile.name;
      const textoDeclaracion = cerrandoEntrada
        ? `El empleado/a ${employeeName} declara bajo su responsabilidad que el día ${retroDate} finalizó su jornada a las ${retroTime}h, habiendo olvidado registrar la salida correspondiente a la entrada de las ${cerrandoEntrada.time}h. Declara que la hora indicada es la real.`
        : `El empleado/a ${employeeName} declara bajo su responsabilidad haber olvidado registrar el fichaje de ${retroType} del día ${retroDate} a las ${retroTime}h. El olvido fue por causa propia y la empresa no tiene responsabilidad al respecto.`;
      const base = {
        userId: userProfile.uid, employeeId: linkedEmp?.id || null, employeeName,
        date: retroDate, type: retroType,
        // `time` es la hora DECLARADA (cuándo ocurrió) y `fechaFichaje` el momento
        // real del apunte. Tienen que verse por separado: un apunte hecho hoy que
        // declara una salida de ayer es válido si consta como tal, y solo como tal.
        time: retroTime, timestamp: now.toISOString(),
        retroactivo: true, regularizacion: true,
        declaracionResponsabilidad: true, fechaFichaje: now.toISOString(), textoDeclaracion,
        origenCorreccion: "empleado",
        ...(cerrandoEntrada ? { corrigeA: cerrandoEntrada.id, motivo: "olvido_salida" } : {}),
      };
      const integrityHash = await digestRecord(base);
      const registro = { ...base, signature, integrityHash };
      await fb().firestore().collection("registros_horarios").add(registro);
      setShowRetroModal(false);
      setCerrandoEntrada(null);
      showNotification(cerrandoEntrada ? "Jornada cerrada y firmada" : "Fichaje retroactivo registrado");
    } catch (e) { showNotification(mensajeConsulta(e, "el registro"), "error"); }
    setSubmittingFichaje(false);
  };

  // FIX #30: filename del CSV con rango real
  const downloadCSV = (records, fromDate, toDate) => {
    // El CSV es lo que acaba en manos de una inspección o de una reclamación,
    // así que tiene que dejar ver la diferencia entre la hora declarada y el
    // momento en que se apuntó, y a qué entrada corrige cada regularización.
    const header = "Fecha;Empleado;Tipo;Hora Declarada;Hora Turno;Dentro Tolerancia;Regularizado;Motivo;Corrige Registro;Apuntado El;Origen;Decl. Responsabilidad;Con Firma;Hash Integridad;Timestamp\n";
    const rows = records.map(r => [
      r.date, r.employeeName, r.type, r.time, r.scheduledTime || "",
      r.withinTolerance ? "Sí" : "No",
      esRegularizacion(r) ? "Sí" : "No",
      r.motivo || "",
      r.corrigeA || "",
      r.fechaFichaje || "",
      r.origenCorreccion || "",
      r.declaracionResponsabilidad || r.declaracionFueraTurno ? "Sí" : "No",
      r.signature ? "Sí" : "No",
      r.integrityHash || "",
      r.timestamp,
    ].map(csvCell).join(";")).join("\n");
    const blob = new Blob(["﻿" + header + rows], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url; a.download = `registro_horario_${fromDate||"x"}_${toDate||"x"}.csv`; a.click();
    URL.revokeObjectURL(url);
  };

  const handleAdminSearch = async () => {
    if (!dateFrom || !dateTo) { showNotification("Por favor selecciona ambas fechas", "warning"); return; }
    setAdminSearched(true);
    try {
      const snap = await fb().firestore().collection("registros_horarios").where("date",">=",dateFrom).where("date","<=",dateTo).get();
      let results = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      if (selectedEmployee) results = results.filter(r => r.employeeName === selectedEmployee);
      results.sort((a,b) => (a.timestamp||"").localeCompare(b.timestamp||""));
      setAdminRegistros(results);
    } catch (e) { showNotification(mensajeConsulta(e), "error"); }
  };

  // FIX #47: histórico para empleado
  const handleOpenHistory = () => {
    const today = new Date();
    const last30 = new Date(today); last30.setDate(today.getDate() - 30);
    setHistoryFrom(toLocalDateStr(last30));
    setHistoryTo(toLocalDateStr(today));
    setHistoryRegistros([]);
    setShowHistoryModal(true);
  };
  const handleHistorySearch = async () => {
    if (!historyFrom || !historyTo) return;
    try {
      const snap = await fb().firestore().collection("registros_horarios")
        .where("userId","==",userProfile.uid)
        .where("date",">=",historyFrom)
        .where("date","<=",historyTo)
        .get();
      const results = snap.docs.map(d => ({ id: d.id, ...d.data() })).sort((a,b) => (b.timestamp||"").localeCompare(a.timestamp||""));
      setHistoryRegistros(results);
    } catch (e) { showNotification(mensajeConsulta(e), "error"); }
  };

  const dayRegistros = registros;
  const jornadaHoy = useMemo(() => analizarJornada(registros), [registros]);

  // Incidencias del periodo que el admin acaba de buscar: se agrupa por
  // empleado y día, y se analiza cada jornada por separado. Se excluye el día de
  // hoy, que aún puede estar en curso.
  const incidenciasAdmin = useMemo(() => {
    const hoy = toLocalDateStr(new Date());
    const grupos = {};
    for (const r of adminRegistros) {
      if (!r?.date || r.date >= hoy) continue;
      const clave = `${r.date}||${r.employeeName || "—"}`;
      (grupos[clave] = grupos[clave] || []).push(r);
    }
    return Object.entries(grupos)
      .flatMap(([clave, regs]) => {
        const [fecha, empleado] = clave.split("||");
        return analizarJornada(regs).abiertas.map(a => ({ fecha, empleado, hora: a.time }));
      })
      .sort((a, b) => b.fecha.localeCompare(a.fecha) || a.empleado.localeCompare(b.empleado));
  }, [adminRegistros]);
  const retroMinDate = (() => { const d = new Date(); d.setDate(d.getDate()-7); return toLocalDateStr(d); })();
  const retroMaxDate = (() => { const d = new Date(); d.setDate(d.getDate()-1); return toLocalDateStr(d); })();
  const linkedEmpName = (() => { const e = employees.find(emp => emp.id === userProfile.linkedEmployeeId); return e ? e.name : userProfile.name; })();

  return (
    <div className="container">
      <h2>Fichar (Registro Horario)</h2>
      <div className="card" style={{ background: "#FFF8E1", borderLeft: "4px solid #FF9800", marginBottom: "16px" }}>
        <p style={{ fontSize: "12px", color: "#E65100", margin: "0" }}>Registro horario conforme al Real Decreto-ley 8/2019. Conservación: 4 años.</p>
      </div>
      {!isAdmin ? (
        <>
          {/* Jornadas que quedaron abiertas. El aviso va lo primero y con acción
              directa: cuanto antes lo cierre el propio trabajador firmando, más
              sólido es el registro. Nunca se cierra solo. */}
          {sinCerrar.length > 0 && (
            <div className="card" style={{ background: "#FFEBEE", borderLeft: "4px solid #F44336", marginBottom: 16 }}>
              <h3 style={{ color: "#C62828", marginBottom: 8, fontSize: 16 }}>
                ⚠️ {sinCerrar.length === 1 ? "Tienes una jornada sin cerrar" : `Tienes ${sinCerrar.length} jornadas sin cerrar`}
              </h3>
              <p style={{ fontSize: 13, color: "#5D4037", marginBottom: 12 }}>
                Fichaste la entrada pero no la salida. Indica la hora real a la que terminaste
                y fírmala para completar tu registro horario.
              </p>
              {sinCerrar.map(dia => dia.abiertas.map(entrada => (
                <div key={entrada.id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, flexWrap: "wrap", padding: "8px 0", borderTop: "1px solid #FFCDD2" }}>
                  <span style={{ fontSize: 14 }}>
                    <strong>{dia.fecha}</strong> · entrada a las {entrada.time}h, sin salida
                  </span>
                  <button className="btn btn-primary btn-sm" onClick={() => handleCerrarJornada(entrada)} disabled={submittingFichaje}>
                    Cerrar jornada
                  </button>
                </div>
              )))}
            </div>
          )}

          <div className="card"><label style={{ marginBottom: "12px", display: "block", fontWeight: "600" }}>Fecha (Hoy)</label><input type="date" className="input" value={selectedDate} disabled /></div>
          <button className="fichar-btn fichar-entrada" onClick={() => handleFichar("entrada")} disabled={submittingFichaje}>⬆️ Fichar Entrada</button>
          <button className="fichar-btn fichar-salida" onClick={() => handleFichar("salida")} disabled={submittingFichaje}>⬇️ Fichar Salida</button>
          <button className="fichar-btn" style={{ background: "#FF9800", color: "white" }} onClick={handleOpenRetro} disabled={submittingFichaje}>📅 Fichar Día Anterior</button>
          <button className="fichar-btn" style={{ background: "#2196F3", color: "white" }} onClick={handleOpenHistory}>📜 Ver mi histórico</button>
          <div className="card">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", flexWrap: "wrap", gap: 8, marginBottom: 12 }}>
              <h3>Registros del día</h3>
              {/* Solo suma tramos cerrados: una entrada sin salida no aporta horas. */}
              {dayRegistros.length > 0 && (
                <span style={{ fontSize: 13, color: "#666" }}>
                  Trabajado hoy: <strong style={{ color: "var(--primary)" }}>{formatearDuracion(jornadaHoy.minutos)}</strong>
                  {jornadaHoy.abiertas.length > 0 && <span style={{ color: "#E65100" }}> · jornada en curso</span>}
                </span>
              )}
            </div>
            {loadingRegistros ? <p style={{ color: "#999" }}>Cargando...</p> : dayRegistros.length === 0 ? <p style={{ color: "#999" }}>No hay registros para esta fecha</p> : [...dayRegistros].sort((a,b)=>(a.time||"").localeCompare(b.time||"")).map(r => (
              <div key={r.id} className="registro-card" style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
                <strong>{r.type === "entrada" ? "⬆️ Entrada" : "⬇️ Salida"}</strong>
                <span>{r.time}</span>
                {r.scheduledTime && <span style={{ fontSize: "11px", color: "#2E7D32", background: "#E8F5E9", padding: "2px 6px", borderRadius: "10px" }}>Turno: {r.scheduledTime}</span>}
                {/* Un apunte corregido no puede parecer un fichaje hecho en el
                    momento: se marca, y se muestra cuándo se apuntó de verdad. */}
                {esRegularizacion(r) && (
                  <span style={{ fontSize: "11px", color: "#E65100", background: "#FFF3E0", padding: "2px 6px", borderRadius: "10px" }}
                    title={r.fechaFichaje ? `Apuntado el ${new Date(r.fechaFichaje).toLocaleString("es-ES")}` : undefined}>
                    ✍️ Regularizado
                  </span>
                )}
                {r.fueraTolerancia && <span style={{ fontSize: "11px", color: "#C62828", background: "#FFCDD2", padding: "2px 6px", borderRadius: "10px" }}>⚠️ Fuera</span>}
                {r.signature && <img src={r.signature} alt="firma" className="firma-img" onClick={() => setViewSignature(r.signature)} title="Ver firma" />}
              </div>
            ))}
          </div>
        </>
      ) : (
        <>
          <div className="card">
            <h3 style={{ marginBottom: "16px" }}>Registros Horarios</h3>
            <div className="form-group"><label htmlFor="field-27">Desde</label><input id="field-27" type="date" className="input" value={dateFrom} onChange={e => setDateFrom(e.target.value)} /></div>
            <div className="form-group"><label htmlFor="field-28">Hasta</label><input id="field-28" type="date" className="input" value={dateTo} min={dateFrom} onChange={e => setDateTo(e.target.value)} /></div>
            <div className="form-group"><label htmlFor="field-29">Empleado (opcional)</label>
              <select id="field-29" className="input" value={selectedEmployee || ""} onChange={e => setSelectedEmployee(e.target.value || null)}>
                <option value="">Todos</option>{employees.map(emp => <option key={emp.id} value={emp.name}>{emp.name}</option>)}
              </select>
            </div>
            <button className="btn btn-primary" onClick={handleAdminSearch} style={{ width: "100%" }}>Buscar</button>
          </div>

          {/* Incidencias del periodo buscado: jornadas que nadie cerró. Es lo
              primero que hay que mirar, porque son los huecos del registro. */}
          {adminSearched && (
            <div className="card" style={incidenciasAdmin.length > 0
              ? { background: "#FFEBEE", borderLeft: "4px solid #F44336" }
              : { background: "#E8F5E9", borderLeft: "4px solid #4CAF50" }}>
              <h3 style={{ marginBottom: 8, fontSize: 16, color: incidenciasAdmin.length > 0 ? "#C62828" : "#2E7D32" }}>
                {incidenciasAdmin.length > 0
                  ? `⚠️ ${incidenciasAdmin.length} jornada${incidenciasAdmin.length > 1 ? "s" : ""} sin cerrar`
                  : "✓ Sin incidencias: todas las jornadas del periodo están cerradas"}
              </h3>
              {incidenciasAdmin.length > 0 && (
                <>
                  <p style={{ fontSize: 13, color: "#5D4037", marginBottom: 10 }}>
                    Entradas sin su salida. Pide al trabajador que las cierre desde su pantalla de
                    fichar: la subsanación firmada por él es la prueba más sólida.
                  </p>
                  <div style={{ overflowX: "auto" }}>
                    <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
                      <thead><tr style={{ borderBottom: "2px solid #FFCDD2" }}>
                        <th style={{ padding: 6, textAlign: "left" }}>Fecha</th>
                        <th style={{ padding: 6, textAlign: "left" }}>Empleado</th>
                        <th style={{ padding: 6, textAlign: "left" }}>Entrada sin cerrar</th>
                      </tr></thead>
                      <tbody>{incidenciasAdmin.map(i => (
                        <tr key={`${i.fecha}-${i.empleado}-${i.hora}`} style={{ borderBottom: "1px solid #FFCDD2" }}>
                          <td style={{ padding: 6 }}>{i.fecha}</td>
                          <td style={{ padding: 6 }}>{i.empleado}</td>
                          <td style={{ padding: 6 }}>{i.hora}h</td>
                        </tr>
                      ))}</tbody>
                    </table>
                  </div>
                </>
              )}
            </div>
          )}

          {adminSearched && (
            <div className="card">
              <h3 style={{ marginBottom: "12px" }}>Resultados ({adminRegistros.length})</h3>
              {adminRegistros.length === 0 ? <p style={{ color: "#999" }}>No hay registros para los criterios seleccionados</p> : (
                <>
                  <div style={{ overflowX: "auto", marginBottom: "16px" }}>
                    <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "12px" }}>
                      <thead><tr style={{ background: "#f5f5f5", borderBottom: "2px solid #ddd" }}>
                        <th style={{ padding: "8px", textAlign: "left" }}>Fecha</th>
                        <th style={{ padding: "8px", textAlign: "left" }}>Empleado</th>
                        <th style={{ padding: "8px", textAlign: "left" }}>Tipo</th>
                        <th style={{ padding: "8px", textAlign: "left" }}>Hora Real</th>
                        <th style={{ padding: "8px", textAlign: "left" }}>Hora Turno</th>
                        <th style={{ padding: "8px", textAlign: "left" }}>Firma</th>
                      </tr></thead>
                      <tbody>{adminRegistros.map((r, idx) => (
                        <tr key={idx} style={{ borderBottom: "1px solid #eee", background: r.retroactivo ? "#FFF8F0" : r.fueraTolerancia ? "#FFF3F3" : "white" }}>
                          <td style={{ padding: "8px" }}>
                            {r.date}
                            {r.retroactivo && <span style={{ marginLeft: "4px", fontSize: "10px", color: "#E65100", background: "#FFE0B2", padding: "1px 5px", borderRadius: "8px" }}>Retro</span>}
                            {r.fueraTolerancia && <span style={{ marginLeft: "4px", fontSize: "10px", color: "#C62828", background: "#FFCDD2", padding: "1px 5px", borderRadius: "8px" }}>⚠️ Fuera</span>}
                          </td>
                          <td style={{ padding: "8px" }}>{r.employeeName}</td>
                          <td style={{ padding: "8px" }}>{r.type === "entrada" ? "⬆️ Entrada" : "⬇️ Salida"}</td>
                          <td style={{ padding: "8px" }}>{r.time}</td>
                          <td style={{ padding: "8px" }}>{r.scheduledTime ? <span style={{ color: "#2E7D32", fontWeight: "600" }}>{r.scheduledTime}</span> : r.fueraTolerancia ? <span style={{ color: "#C62828", fontSize: "11px" }}>Fuera de turno</span> : <span style={{ color: "#bbb" }}>—</span>}</td>
                          <td style={{ padding: "8px" }}>
                            {r.signature
                              ? <img src={r.signature} alt="firma" className="firma-img" onClick={() => setViewSignature(r.signature)} title="Ver firma" />
                              : <span style={{ color: "#999", fontSize: "11px" }}>Sin firma</span>}
                          </td>
                        </tr>
                      ))}</tbody>
                    </table>
                  </div>
                  <button className="btn btn-secondary" onClick={() => downloadCSV(adminRegistros, dateFrom, dateTo)} style={{ width: "100%" }}>Descargar CSV</button>
                </>
              )}
            </div>
          )}
        </>
      )}

      {showFueraTurnoModal && (
        <div className="modal">
          <div className="modal-content">
            <div className="modal-header"><span>⚠️ Fichaje Fuera de Horario</span><button className="modal-close" onClick={() => setShowFueraTurnoModal(false)}>×</button></div>
            <div style={{ background: "#FFCDD2", border: "1px solid #E57373", borderRadius: "8px", padding: "12px", marginBottom: "12px", fontSize: "12px", color: "#B71C1C", lineHeight: "1.6" }}>
              <strong>⚠️ Estás fichando fuera de tu horario establecido</strong><br /><br />
              Tu turno hoy (Turno <strong>{fueraTurnoInfo.shiftLetter}</strong>): {fueraTurnoInfo.horarioPrevisto}<br />
              Hora actual: <strong>{fueraTurnoInfo.currentTime}</strong> (fuera de la ventana de ±{TOLERANCE_MIN} min)
            </div>
            <div style={{ background: "#FFF3E0", border: "1px solid #FF9800", borderRadius: "8px", padding: "12px", marginBottom: "12px", fontSize: "12px", color: "#5D4037", lineHeight: "1.6" }}>
              <strong>Declaración de responsabilidad:</strong><br /><br />
              Yo, <em>{linkedEmpName}</em>, declaro bajo mi responsabilidad que el fichaje de <strong>{pendingFicharType}</strong> a las <strong>{fueraTurnoInfo.currentTime}</strong>h se realiza fuera del horario establecido para mi turno ({fueraTurnoInfo.shiftLetter}: {fueraTurnoInfo.horarioPrevisto}). Asumo que la discrepancia horaria es por causa propia y que la empresa no tiene ninguna responsabilidad al respecto.
            </div>
            <label style={{ display: "flex", gap: "8px", alignItems: "flex-start", marginBottom: "12px", fontSize: "13px", cursor: "pointer" }}>
              <input type="checkbox" checked={fueraTurnoAccepted} onChange={e => setFueraTurnoAccepted(e.target.checked)} style={{ marginTop: "3px", flexShrink: 0 }} />
              Acepto la declaración anterior y firmo este documento
            </label>
            <p style={{ fontSize: "12px", color: "#666", marginBottom: "8px" }}>Firma con el dedo o el ratón:</p>
            <canvas ref={fueraTurnoCanvasRef} width={300} height={120} className="signature-canvas" {...fueraTurnoSign.handlers} />
            <div style={{ display: "flex", gap: "8px", marginTop: "12px" }}>
              <button className="btn btn-secondary btn-sm" style={{ flex: 1 }} onClick={fueraTurnoSign.clear}>Limpiar firma</button>
              <button className="btn btn-danger btn-sm" style={{ flex: 2 }} onClick={handleConfirmFueraTurno} disabled={!fueraTurnoAccepted || !fueraTurnoSign.hasSigned || submittingFichaje}>
                Registrar {pendingFicharType === "entrada" ? "⬆️ Entrada" : "⬇️ Salida"}
              </button>
            </div>
          </div>
        </div>
      )}

      {showSignModal && (
        <div className="modal">
          <div className="modal-content">
            <div className="modal-header"><span>Firma — {pendingFicharType === "entrada" ? "⬆️ Entrada" : "⬇️ Salida"}</span><button className="modal-close" onClick={() => setShowSignModal(false)}>×</button></div>
            <p style={{ fontSize: "13px", color: "#666", marginBottom: "12px" }}>Firma con el dedo o el ratón en el recuadro</p>
            <canvas ref={signCanvasRef} width={300} height={150} className="signature-canvas" {...sign.handlers} />
            <div style={{ display: "flex", gap: "8px", marginTop: "12px" }}>
              <button className="btn btn-secondary btn-sm" style={{ flex: 1 }} onClick={sign.clear}>Limpiar</button>
              <button className="btn btn-primary btn-sm" style={{ flex: 2 }} onClick={handleConfirmFichar} disabled={!sign.hasSigned || submittingFichaje}>
                Confirmar {pendingFicharType === "entrada" ? "⬆️ Entrada" : "⬇️ Salida"}
              </button>
            </div>
          </div>
        </div>
      )}

      {showRetroModal && (
        <div className="modal">
          <div className="modal-content">
            <div className="modal-header">
              <span>{cerrandoEntrada ? "🔒 Cerrar jornada sin salida" : "📅 Fichaje Día Anterior"}</span>
              <button className="modal-close" onClick={() => { setShowRetroModal(false); setCerrandoEntrada(null); }}>×</button>
            </div>

            {/* Cerrando una jornada concreta: la fecha y el tipo ya están fijados
                por la entrada que quedó abierta, así que no se dejan editar. */}
            {cerrandoEntrada ? (
              <div className="card" style={{ background: "#FFF8E1", marginBottom: 12, padding: 12 }}>
                <p style={{ fontSize: 13, margin: 0 }}>
                  Día <strong>{cerrandoEntrada.date}</strong> · fichaste la entrada a las <strong>{cerrandoEntrada.time}h</strong> y no registraste la salida.
                </p>
              </div>
            ) : (
              <>
                <div className="form-group"><label htmlFor="field-30">Fecha del fichaje olvidado</label><input id="field-30" type="date" className="input" value={retroDate} min={retroMinDate} max={retroMaxDate} onChange={e => setRetroDate(e.target.value)} /></div>
                <div className="form-group"><label htmlFor="field-31">Tipo de fichaje</label>
                  <select id="field-31" className="input" value={retroType} onChange={e => setRetroType(e.target.value)}>
                    <option value="entrada">⬆️ Entrada</option><option value="salida">⬇️ Salida</option>
                  </select>
                </div>
              </>
            )}
            <div className="form-group">
              <label htmlFor="field-32">{cerrandoEntrada ? "¿A qué hora terminaste realmente?" : "Hora real del fichaje"}</label>
              <input id="field-32" type="time" className="input" value={retroTime} onChange={e => setRetroTime(e.target.value)} />
              {cerrandoEntrada && (
                <p style={{ fontSize: 12, color: "#666", marginTop: -6 }}>
                  Proponemos la hora de fin de tu turno. Cámbiala si terminaste a otra hora: debe ser la real.
                </p>
              )}
            </div>
            <div style={{ background: "#FFF3E0", border: "1px solid #FF9800", borderRadius: "8px", padding: "12px", marginBottom: "12px", fontSize: "12px", color: "#5D4037", lineHeight: "1.6" }}>
              <strong>Declaración de responsabilidad:</strong><br /><br />
              {cerrandoEntrada ? (
                <>Yo, <em>{linkedEmpName}</em>, declaro que el día <strong>{cerrandoEntrada.date}</strong> finalicé mi jornada a las <strong>{retroTime || "..."}</strong> horas, habiendo olvidado registrar la salida correspondiente a la entrada de las <strong>{cerrandoEntrada.time}</strong> horas. Declaro que la hora indicada es la real.</>
              ) : (
                <>Yo, <em>{linkedEmpName}</em>, declaro bajo mi responsabilidad haber olvidado registrar el fichaje de <strong>{retroType}</strong> del día <strong>{retroDate || "..."}</strong> a las <strong>{retroTime || "..."}</strong> horas. Asumo que el olvido del fichaje fue por causa propia y que la empresa no tiene ninguna responsabilidad al respecto.</>
              )}
            </div>
            <label style={{ display: "flex", gap: "8px", alignItems: "flex-start", marginBottom: "12px", fontSize: "13px", cursor: "pointer" }}>
              <input type="checkbox" checked={retroAccepted} onChange={e => setRetroAccepted(e.target.checked)} style={{ marginTop: "3px", flexShrink: 0 }} />
              Acepto la declaración anterior y firmo este documento
            </label>
            <p style={{ fontSize: "12px", color: "#666", marginBottom: "8px" }}>Firma con el dedo o el ratón:</p>
            <canvas ref={retroCanvasRef} width={300} height={120} className="signature-canvas" {...retroSign.handlers} />
            <div style={{ display: "flex", gap: "8px", marginTop: "12px" }}>
              <button className="btn btn-secondary btn-sm" style={{ flex: 1 }} onClick={retroSign.clear}>Limpiar firma</button>
              <button className="btn btn-primary btn-sm" style={{ flex: 2 }} onClick={handleConfirmRetro} disabled={!retroAccepted || !retroSign.hasSigned || submittingFichaje}>Registrar fichaje</button>
            </div>
          </div>
        </div>
      )}

      {showHistoryModal && (
        <div className="modal">
          <div className="modal-content">
            <div className="modal-header"><span>📜 Mi histórico de fichajes</span><button className="modal-close" onClick={() => setShowHistoryModal(false)}>×</button></div>
            <div className="form-group"><label htmlFor="field-33">Desde</label><input id="field-33" type="date" className="input" value={historyFrom} onChange={e => setHistoryFrom(e.target.value)} /></div>
            <div className="form-group"><label htmlFor="field-34">Hasta</label><input id="field-34" type="date" className="input" value={historyTo} min={historyFrom} onChange={e => setHistoryTo(e.target.value)} /></div>
            <button className="btn btn-primary" style={{ width: "100%", marginBottom: 12 }} onClick={handleHistorySearch}>Buscar</button>
            {historyRegistros.length === 0 ? <p style={{ color: "#999", fontSize: 13 }}>No hay registros (busca para cargar)</p> : (
              <>
                <div style={{ maxHeight: 300, overflowY: "auto" }}>
                  {historyRegistros.map(r => (
                    <div key={r.id} className="registro-card" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 8 }}>
                      <span style={{ fontWeight: 600 }}>{r.date}</span>
                      <span>{r.type === "entrada" ? "⬆️" : "⬇️"} {r.time}</span>
                      {r.retroactivo && <span style={{ fontSize: 10, background: "#FFE0B2", color: "#E65100", padding: "1px 5px", borderRadius: 6 }}>Retro</span>}
                      {r.fueraTolerancia && <span style={{ fontSize: 10, background: "#FFCDD2", color: "#C62828", padding: "1px 5px", borderRadius: 6 }}>Fuera</span>}
                    </div>
                  ))}
                </div>
                <button className="btn btn-secondary btn-sm" style={{ width: "100%", marginTop: 12 }} onClick={() => downloadCSV(historyRegistros, historyFrom, historyTo)}>Descargar mi histórico CSV</button>
              </>
            )}
          </div>
        </div>
      )}

      {viewSignature && (
        <div className="modal" onClick={() => setViewSignature(null)}>
          <div className="modal-content" style={{ textAlign: "center" }} onClick={e => e.stopPropagation()}>
            <div className="modal-header"><span>Firma registrada</span><button className="modal-close" onClick={() => setViewSignature(null)}>×</button></div>
            <img src={viewSignature} alt="firma completa" style={{ maxWidth: "100%", border: "1px solid #ddd", borderRadius: "8px", marginTop: "12px" }} />
          </div>
        </div>
      )}
    </div>
  );
}

function ShiftConfigScreen({ shiftTemplates, setShiftTemplates, pastryTemplates, setPastryTemplates, rotationConfig, showNotification }) {
  const [templates, setTemplates] = useState(shiftTemplates);
  const [pastry, setPastry] = useState(pastryTemplates);
  const [activePastryTab, setActivePastryTab] = useState("P1");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const days = ["L","M","X","J","V","S","D"];
  const dayLabels = ["Lun","Mar","Mié","Jue","Vie","Sab","Dom"];
  const PASTRY_LABELS = { P1: "P1 – Wilfredy (L libre)", P2: "P2 – Mª Carmen (M libre)", P3: "P3 – Roberto (X libre)" };

  const updateTime = (shift, day, field, value) => {
    const updated = JSON.parse(JSON.stringify(templates));
    if (!updated[shift][day]) updated[shift][day] = { m1: null, m2: null, t1: null, t2: null };
    updated[shift][day][field] = value || null;
    setTemplates(updated);
  };
  const updatePastryTime = (pKey, day, field, value) => {
    const updated = JSON.parse(JSON.stringify(pastry));
    if (!updated[pKey][day]) updated[pKey][day] = { m1: null, m2: null, t1: null, t2: null };
    updated[pKey][day][field] = value || null;
    setPastry(updated);
  };
  const togglePastryDay = (pKey, day) => {
    const updated = JSON.parse(JSON.stringify(pastry));
    updated[pKey][day] = updated[pKey][day] === null ? { m1: "07:00", m2: "14:00", t1: null, t2: null } : null;
    setPastry(updated);
  };
  const handleSave = async () => {
    setSaving(true);
    try {
      await fb().firestore().collection("shiftConfig").doc("templates").set({ templates, pastry });
      await fb().firestore().collection("shiftConfig").doc("rotation").set(rotationConfig);
      setShiftTemplates(templates);
      setPastryTemplates(pastry);
      safeLocalSet("pardilla_shift_templates", templates);
      safeLocalSet("pardilla_pastry_templates", pastry);
      setSaved(true); setTimeout(() => setSaved(false), 3000);
    } catch { showNotification("No se pudieron guardar las plantillas. Comprueba la conexión y tus permisos.", "error"); }
    setSaving(false);
  };

  const curPastry = pastry[activePastryTab] || {};
  return (
    <div className="container">
      <h2>Configurar Turnos</h2>
      {saved && <div className="success-message">Configuración guardada correctamente</div>}
      <div className="card" style={{ marginTop: "20px" }}>
        <h3>Plantillas de Turnos (Tienda A/B/C)</h3>
        {["A","B","C"].map(shift => (
          <div key={shift} style={{ marginBottom: "24px" }}>
            <h4 style={{ marginBottom: "12px" }}>Turno {shift}</h4>
            <div className="shift-editor-grid">
              <div className="shift-cell header">Día</div>
              {dayLabels.map(label => <div key={label} className="shift-cell header">{label}</div>)}
              {["m1","m2","t1","t2"].map(field => (
                <div key={field} style={{ display: "contents" }}>
                  <div className="shift-cell header" style={{ textAlign: "left" }}>{field === "m1" ? "M1" : field === "m2" ? "M2" : field === "t1" ? "T1" : "T2"}</div>
                  {days.map(day => (
                    <div key={`${shift}-${day}-${field}`} className="shift-cell">
                      <input type="time" value={templates[shift]?.[day]?.[field] || ""} onChange={e => updateTime(shift, day, field, e.target.value)} />
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="card">
        <h3>Plantillas Obrador (Pasteleros)</h3>
        <p style={{ fontSize: 12, color: "#666", marginBottom: 12 }}>Cada turno de pastelero tiene su propio horario. Selecciona cuál editar:</p>
        <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
          {["P1","P2","P3"].map(pk => (
            <button key={pk} className={`btn btn-sm ${activePastryTab === pk ? "btn-primary" : "btn-secondary"}`} onClick={() => setActivePastryTab(pk)}>{PASTRY_LABELS[pk]}</button>
          ))}
        </div>
        <div className="shift-editor-grid">
          <div className="shift-cell header">Día</div>
          {dayLabels.map(label => <div key={label} className="shift-cell header">{label}</div>)}
          <div className="shift-cell header" style={{ textAlign: "left" }}>Activo</div>
          {days.map(day => (
            <div key={`pa-active-${day}`} className="shift-cell">
              <input type="checkbox" checked={curPastry[day] !== null && curPastry[day] !== undefined} onChange={() => togglePastryDay(activePastryTab, day)} />
            </div>
          ))}
          {["m1","m2","t1","t2"].map(field => (
            <div key={`pa-${field}`} style={{ display: "contents" }}>
              <div className="shift-cell header" style={{ textAlign: "left" }}>{field === "m1" ? "M1" : field === "m2" ? "M2" : field === "t1" ? "T1" : "T2"}</div>
              {days.map(day => (
                <div key={`pa-${day}-${field}`} className="shift-cell">
                  <input type="time" value={curPastry[day]?.[field] || ""} onChange={e => updatePastryTime(activePastryTab, day, field, e.target.value)} disabled={!curPastry[day]} />
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>

      <button className="btn btn-primary" style={{ width: "100%", marginTop: "16px" }} onClick={handleSave} disabled={saving}>{saving ? "Guardando..." : "Guardar Configuración"}</button>
    </div>
  );
}

// FIX #11: gestión robusta de la app secundaria
function UserManagementScreen({ userProfile, employees }) {
  const [users, setUsers] = useState([]);
  const [form, setForm] = useState({ email: "", password: "", name: "", role: "manager", linkedEmpId: null });
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(null);

  useEffect(() => { loadUsers(); }, []);

  const loadUsers = async () => {
    try { const snap = await fb().firestore().collection("users").get(); setUsers(snap.docs.map(d => ({ uid: d.id, ...d.data() }))); }
    catch (e) { console.error(e); }
  };

  const handleCreate = async (e) => {
    e.preventDefault(); setError(""); setSubmitting(true);
    let secondaryApp = null;
    try {
      const cfg = fb().app().options;
      if (!cfg) throw new Error("Sin configuración Firebase disponible");
      secondaryApp = fb().initializeApp(cfg, "Secondary" + Date.now());
      connectEmulators(secondaryApp);
      const cred = await secondaryApp.auth().createUserWithEmailAndPassword(form.email, form.password);
      await fb().firestore().collection("users").doc(cred.user.uid).set({
        uid: cred.user.uid, email: form.email, name: form.name, role: form.role,
        linkedEmployeeId: form.role === "empleado" ? form.linkedEmpId : null,
        createdAt: new Date().toISOString()
      });
      setForm({ email: "", password: "", name: "", role: "manager", linkedEmpId: null });
      loadUsers();
    } catch (e) { setError(e.message); }
    finally {
      if (secondaryApp) { try { await secondaryApp.delete(); } catch (e) { console.warn("secondaryApp.delete:", e); } }
      setSubmitting(false);
    }
  };

  const doDelete = async (uid) => {
    try { await fb().firestore().collection("users").doc(uid).delete(); loadUsers(); }
    catch (e) { console.error(e); }
    setConfirmDelete(null);
  };

  return (
    <div className="container">
      <h2>Gestión de Usuarios</h2>
      <div className="card" style={{ marginTop: "20px" }}>
        <h3 style={{ marginBottom: "16px" }}>Crear Nuevo Usuario</h3>
        <form onSubmit={handleCreate}>
          {error && <div className="error-message">{error}</div>}
          <div className="form-group"><label htmlFor="field-35">Nombre</label><input id="field-35" type="text" className="input" value={form.name} onChange={e => setForm(f => ({...f, name: e.target.value}))} required /></div>
          <div className="form-group"><label htmlFor="field-36">Email</label><input id="field-36" type="email" className="input" value={form.email} onChange={e => setForm(f => ({...f, email: e.target.value}))} required /></div>
          <div className="form-group"><label htmlFor="field-37">Contraseña</label><input id="field-37" type="password" className="input" value={form.password} onChange={e => setForm(f => ({...f, password: e.target.value}))} required minLength={6} /></div>
          <div className="form-group"><label htmlFor="field-38">Rol</label>
            <select id="field-38" className="input" value={form.role} onChange={e => setForm(f => ({...f, role: e.target.value}))}>
              <option value="admin">Administrador</option><option value="manager">Gestor</option><option value="empleado">Empleado</option>
            </select>
          </div>
          {form.role === "empleado" && (
            <div className="form-group"><label htmlFor="field-39">¿Vincular a un empleado?</label>
              <select id="field-39" className="input" value={form.linkedEmpId || ""} onChange={e => setForm(f => ({...f, linkedEmpId: e.target.value ? parseInt(e.target.value) : null}))}>
                <option value="">-- Ninguno --</option>{employees.map(emp => <option key={emp.id} value={emp.id}>{emp.name}</option>)}
              </select>
            </div>
          )}
          <button type="submit" className="btn btn-primary" style={{ width: "100%" }} disabled={submitting}>{submitting ? "Creando..." : "Crear Usuario"}</button>
        </form>
      </div>
      <div style={{ marginTop: "20px" }}>
        <h3>Usuarios Existentes</h3>
        {users.map(user => (
          <div key={user.uid} className="user-card">
            <div className="info"><div className="name">{user.name}</div><div className="role">{user.email}</div></div>
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <span className={`role-badge role-${user.role}`}>{user.role}</span>
              {user.role === "empleado" && user.linkedEmployeeId && <span style={{ marginLeft: "8px", fontSize: "12px", color: "#666" }}>→ {employees.find(e => e.id === user.linkedEmployeeId)?.name || "Sin asignar"}</span>}
              {user.uid !== userProfile.uid && <button className="btn btn-sm btn-danger" onClick={() => setConfirmDelete(user)}>Eliminar</button>}
            </div>
          </div>
        ))}
      </div>
      {confirmDelete && (
        <ConfirmModal
          title="Eliminar usuario"
          message={`¿Eliminar a ${confirmDelete.name} (${confirmDelete.email})? Esta acción no se puede deshacer. Nota: solo elimina su acceso a la app, no su cuenta de Firebase Auth (debes hacerlo desde la consola de Firebase).`}
          danger
          confirmText="Sí, eliminar"
          onCancel={() => setConfirmDelete(null)}
          onConfirm={() => doDelete(confirmDelete.uid)}
        />
      )}
    </div>
  );
}

function FirebaseConfigScreen() {
  const config = safeLocalGet("pardilla_firebase_config", {});
  return (
    <div className="container">
      <h2>Configuración Firebase</h2>
      <div className="firebase-config"><h3>Configuración Actual</h3><p style={{ fontSize: "12px", fontFamily: "monospace", marginTop: "12px", whiteSpace: "pre-wrap", wordBreak: "break-word" }}>{JSON.stringify(config, null, 2)}</p></div>
      <div className="card">
        <h4 style={{ marginBottom: "12px" }}>Para otros dispositivos:</h4>
        <pre style={{ background: "#f5f5f5", padding: "12px", fontSize: "11px", overflow: "auto", maxHeight: "200px", marginBottom: "12px" }}>{`const FIREBASE_CONFIG_HARDCODED = ${JSON.stringify(config, null, 2)};`}</pre>
        <button className="btn btn-secondary" onClick={() => navigator.clipboard?.writeText(`const FIREBASE_CONFIG_HARDCODED = ${JSON.stringify(config, null, 2)};`)} style={{ width: "100%" }}>Copiar Configuración</button>
      </div>
      <div className="card" style={{ background: "#FFF3E0", border: "1px solid #FF9800" }}>
        <h4 style={{ color: "#E65100", marginBottom: 8 }}>⚠️ Reglas de seguridad de Firestore</h4>
        <p style={{ fontSize: 13, color: "#5D4037" }}>Antes de producción asegúrate de tener publicadas reglas que validen rol del usuario. Ejemplo mínimo:</p>
        <pre style={{ background: "#fff", padding: 8, fontSize: 11, overflow: "auto", marginTop: 8 }}>{`rules_version='2';
service cloud.firestore {
  match /databases/{db}/documents {
    function isAuth() { return request.auth != null; }
    function role() { return get(/databases/$(db)/documents/users/$(request.auth.uid)).data.role; }
    match /users/{uid} {
      allow read: if isAuth();
      allow write: if role() == 'admin';
    }
    match /shiftConfig/{doc} {
      allow read: if isAuth();
      allow write: if role() == 'admin';
    }
    match /registros_horarios/{id} {
      allow create: if isAuth() && request.resource.data.userId == request.auth.uid;
      allow read: if isAuth() && (resource.data.userId == request.auth.uid || role() in ['admin','manager']);
      allow update, delete: if false;
    }
    match /vacationAssignments/{id} {
      allow read: if isAuth();
      allow create, update: if role() in ['admin'];
      allow delete: if role() == 'admin';
    }
    match /tasks/{id} {
      allow read: if isAuth();
      allow create, update, delete: if role() in ['admin','manager'];
    }
    match /ventas/{id} { allow read, write: if role() in ['admin','manager']; }
    match /promociones/{id} { allow read, write: if role() in ['admin','manager']; }
    match /config/{doc} { allow read: if isAuth(); allow write: if role() == 'admin'; }
    match /employees/{id} { allow read: if isAuth(); allow write: if role() in ['admin']; }
  }
}`}</pre>
      </div>
    </div>
  );
}

// ─── MODALS ───────────────────────────────────────────────────────────────────
function EmployeeDetailModal({ employee, onClose, updateEmployee, removeEmployee }) {
  const [editName, setEditName] = useState(employee.name);
  const [editRole, setEditRole] = useState(employee.role);
  const [editVacationDays, setEditVacationDays] = useState(employee.vacationDays);
  const [editShiftType, setEditShiftType] = useState(employee.shiftType || "store");
  const [editPastryShift, setEditPastryShift] = useState(employee.pastryShift || "P1");
  const [workedHolidaysMap, setWorkedHolidaysMap] = useState(() => safeLocalGet(`pardilla_wh_${employee.id}`, {}));
  const [showCalendar, setShowCalendar] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const totalVacation = employee.monthsWorked * 2.5 + employee.vacationDays;

  const handleToggle = (dateStr) => {
    const updated = { ...workedHolidaysMap, [dateStr]: !workedHolidaysMap[dateStr] };
    setWorkedHolidaysMap(updated); safeLocalSet(`pardilla_wh_${employee.id}`, updated);
  };

  const handleSave = async () => {
    await updateEmployee({ ...employee, name: editName, role: editRole, vacationDays: editVacationDays, shiftType: editShiftType, pastryShift: editShiftType === "pastry" ? editPastryShift : undefined });
    onClose();
  };

  const handleDelete = async () => { await removeEmployee(employee.id); onClose(); };

  // FIX #8: usar parseLocalDate y los festivos del año actual
  const holidaysSpain = getSpainHolidays(new Date().getFullYear());

  return (
    <div className="modal"><div className="modal-content">
      <div className="modal-header"><span>{employee.name}</span><button className="modal-close" onClick={onClose}>×</button></div>
      <div className="stat-grid">
        <div className="stat-box"><div className="label">Meses Trabajados</div><div className="value">{employee.monthsWorked}</div></div>
        <div className="stat-box"><div className="label">Días Vacaciones</div><div className="value">{totalVacation.toFixed(1)}</div></div>
        <div className="stat-box"><div className="label">Acumulado base</div><div className="value">{(employee.monthsWorked*2.5).toFixed(1)}</div></div>
        <div className="stat-box"><div className="label">Tipo Jornada</div><div className="value" style={{ fontSize: "13px" }}>{editShiftType === "pastry" ? `Pastry ${editPastryShift}` : "Tienda"}</div></div>
      </div>
      <div className="form-group" style={{ marginTop: "20px" }}><label htmlFor="field-40">Nombre</label><input id="field-40" type="text" className="input" value={editName} onChange={e => setEditName(e.target.value)} /></div>
      <div className="form-group"><label htmlFor="field-41">Rol</label><select id="field-41" className="input" value={editRole} onChange={e => setEditRole(e.target.value)}>{ROLE_OPTIONS.map(r => <option key={r} value={r}>{r}</option>)}</select></div>
      <div className="form-group"><label htmlFor="field-42">Tipo de jornada</label>
        <select id="field-42" className="input" value={editShiftType} onChange={e => setEditShiftType(e.target.value)}>
          <option value="store">Tienda (rotación A/B/C)</option>
          <option value="pastry">Obrador / Pastelería</option>
        </select>
      </div>
      {editShiftType === "pastry" && (
        <div className="form-group"><label htmlFor="field-43">Turno de pastelería</label>
          <select id="field-43" className="input" value={editPastryShift} onChange={e => setEditPastryShift(e.target.value)}>
            <option value="P1">P1 – Lunes libre, Martes 8-13</option>
            <option value="P2">P2 – Martes libre, Lunes 8-13</option>
            <option value="P3">P3 – Miércoles libre, Jueves 8-13</option>
          </select>
        </div>
      )}
      <div className="form-group"><label>Días de Vacación (ajuste manual)</label>
        <div className="vacation-control">
          <button className="vacation-btn" onClick={() => setEditVacationDays(editVacationDays - 1)}>−</button>
          <div className="vacation-value">{editVacationDays}</div>
          <button className="vacation-btn" onClick={() => setEditVacationDays(editVacationDays + 1)}>+</button>
        </div>
      </div>
      <div className="form-group">
        <button className="btn btn-secondary" style={{ width: "100%" }} onClick={() => setShowCalendar(!showCalendar)}>{showCalendar ? "Ocultar" : "Mostrar"} Festivos Trabajados</button>
        {showCalendar && (
          <div style={{ marginTop: "12px" }}>
            <p style={{ fontSize: "12px", color: "#666", marginBottom: "12px" }}>Haz clic en los días para marcar como festivo trabajado</p>
            <div className="calendar-month">
              {Array.from({ length: 30 }).map((_, i) => {
                const date = new Date(new Date().getFullYear(), 3, 1 + i);
                const dateStr = toLocalDateStr(date);
                const isHoliday = holidaysSpain.includes(dateStr);
                const isWorked = workedHolidaysMap[dateStr];
                return <div key={i} className={`cal-day ${isHoliday ? "holiday" : ""} ${isWorked ? "worked-holiday" : ""}`} onClick={() => handleToggle(dateStr)}>{i + 1}</div>;
              })}
            </div>
          </div>
        )}
      </div>
      <div className="modal-footer">
        <button className="btn btn-danger btn-sm" onClick={() => setConfirmDelete(true)}>Eliminar</button>
        <button className="btn btn-secondary btn-sm" onClick={onClose}>Cancelar</button>
        <button className="btn btn-primary btn-sm" onClick={handleSave}>Guardar</button>
      </div>
      {confirmDelete && (
        <ConfirmModal
          title="Eliminar empleado"
          message={`Vas a eliminar permanentemente a ${employee.name}. Esta acción no se puede deshacer.`}
          danger
          requireText={employee.name}
          confirmText="Sí, eliminar"
          onCancel={() => setConfirmDelete(false)}
          onConfirm={handleDelete}
        />
      )}
    </div></div>
  );
}

function ProductDetailModal({ product, onClose, updateProduct }) {
  const [editPrice, setEditPrice] = useState(product.price);
  const [error, setError] = useState("");
  const competitors = getCompetitorPrices(product);
  const handleSave = async () => {
    const p = parseFloat(editPrice);
    if (!Number.isFinite(p) || p < 0) { setError("Introduce un precio válido"); return; }
    await updateProduct({ ...product, price: p });
    onClose();
  };
  return (
    <div className="modal"><div className="modal-content">
      <div className="modal-header"><span>{product.name}</span><button className="modal-close" onClick={onClose}>×</button></div>
      <div className="card"><h4 style={{ marginBottom: "8px" }}>Información</h4><p style={{ fontSize: "13px", color: "#666" }}>Categoría: {product.category}</p><p style={{ fontSize: "20px", fontWeight: "700", color: "var(--primary)", marginTop: "8px" }}>{Number(product.price).toFixed(2)}€</p></div>
      <div className="card">
        <div className="demo-banner">⚠️ Precios de competencia simulados (solo demo).</div>
        <h4 style={{ marginBottom: "12px" }}>Precios Competencia</h4>
        {competitors.map((c, idx) => <div key={idx} style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: "1px solid var(--border)", fontSize: "13px" }}><span>{c.name}</span><span style={{ fontWeight: "600" }}>{c.price}€</span></div>)}
      </div>
      <div className="form-group"><label htmlFor="field-44">Editar Precio</label>
        <input id="field-44" type="number" className={`input ${error ? "error" : ""}`} step="0.01" min="0" value={editPrice} onChange={e => { setEditPrice(e.target.value); setError(""); }} />
        {error && <div className="form-error">{error}</div>}
      </div>
      <div className="modal-footer"><button className="btn btn-secondary btn-sm" onClick={onClose}>Cancelar</button><button className="btn btn-primary btn-sm" onClick={handleSave}>Guardar</button></div>
    </div></div>
  );
}

function AddTaskModal({ onClose, onAdd, isAdmin, employees, defaultAssignedTo }) {
  const [type, setType] = useState("tarea");
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [assignedTo, setAssignedTo] = useState(defaultAssignedTo !== undefined ? defaultAssignedTo : "self");
  const [priority, setPriority] = useState("media");
  const [dueDate, setDueDate] = useState("");
  const [dueDateEnd, setDueDateEnd] = useState("");
  const [useRange, setUseRange] = useState(false);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const prioColors = { alta: "#F44336", media: "#FF9800", baja: "#4CAF50" };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim()) { setError("El título es obligatorio"); return; }
    setSubmitting(true);
    const data = { type, title: title.trim(), body: body.trim(), assignedTo: assignedTo || "self" };
    if (type === "tarea") {
      data.priority = priority;
      if (dueDate) data.dueDate = dueDate;
      if (useRange && dueDateEnd) data.dueDateEnd = dueDateEnd;
    }
    try { await onAdd(data); }
    catch (err) { setError(err.message); setSubmitting(false); }
  };

  return (
    <div className="modal"><div className="modal-content">
      <div className="modal-header"><span>Nueva tarea / nota</span><button className="modal-close" onClick={onClose}>×</button></div>
      <form onSubmit={handleSubmit}>
        {error && <div className="error-message">{error}</div>}

        <div className="form-group">
          <label>Tipo</label>
          <div style={{ display:"flex", gap:8 }}>
            <button type="button" className={`btn btn-sm ${type==="tarea"?"btn-primary":"btn-secondary"}`} onClick={() => setType("tarea")}>Tarea</button>
            <button type="button" className={`btn btn-sm ${type==="nota"?"btn-primary":"btn-secondary"}`} onClick={() => setType("nota")}>Nota</button>
          </div>
        </div>

        {isAdmin && (
          <div className="form-group">
            <label htmlFor="field-45">Asignar a</label>
            <select id="field-45" className="input" value={assignedTo} onChange={e => setAssignedTo(e.target.value)}>
              <option value="self">Solo para mí (nota propia)</option>
              <option value="all">Todos los empleados</option>
              {(employees || []).map(e => <option key={e.id} value={String(e.id)}>{e.name}</option>)}
            </select>
          </div>
        )}

        <div className="form-group">
          <label htmlFor="field-46">Título</label>
          <input id="field-46" type="text" className="input" value={title} onChange={e => setTitle(e.target.value)} placeholder="Ej: Revisar inventario" required autoFocus />
        </div>
        <div className="form-group">
          <label htmlFor="field-47">Descripción (opcional)</label>
          <textarea id="field-47" className="input" value={body} onChange={e => setBody(e.target.value)} placeholder="Detalles..." style={{ minHeight:80 }} />
        </div>

        {type === "tarea" && (
          <>
            <div className="form-group">
              <label>Prioridad</label>
              <div style={{ display:"flex", gap:8 }}>
                {["alta","media","baja"].map(p => (
                  <button key={p} type="button" onClick={() => setPriority(p)}
                    className={`btn btn-sm ${priority===p?"btn-primary":"btn-secondary"}`}
                    style={{ flex:1, ...(priority===p ? { background: prioColors[p], borderColor: prioColors[p] } : { color: prioColors[p] }) }}>
                    {p.charAt(0).toUpperCase()+p.slice(1)}
                  </button>
                ))}
              </div>
            </div>
            <div className="form-group">
              <label htmlFor="field-48">Fecha de realización</label>
              <input id="field-48" type="date" className="input" value={dueDate} onChange={e => setDueDate(e.target.value)} />
            </div>
            <div className="form-group">
              <label style={{ display:"flex", alignItems:"center", gap:8, fontWeight:"normal", cursor:"pointer" }}>
                <input type="checkbox" checked={useRange} onChange={e => setUseRange(e.target.checked)} />
                Usar rango de fechas (fecha de inicio y fin)
              </label>
              {useRange && (
                <input type="date" className="input" style={{ marginTop:8 }} value={dueDateEnd} onChange={e => setDueDateEnd(e.target.value)} />
              )}
            </div>
          </>
        )}

        <div className="modal-footer">
          <button type="button" className="btn btn-secondary btn-sm" onClick={onClose}>Cancelar</button>
          <button type="submit" className="btn btn-primary btn-sm" disabled={submitting}>{submitting ? "Guardando..." : "Guardar"}</button>
        </div>
      </form>
    </div></div>
  );
}

// FIX #24: validación de precio
function AddProductModal({ onClose, addProduct }) {
  const [name, setName] = useState("");
  const [category, setCategory] = useState("Bollería");
  const [price, setPrice] = useState("");
  const [error, setError] = useState("");
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (!name.trim()) { setError("El nombre es obligatorio"); return; }
    const p = parseFloat(price);
    if (!Number.isFinite(p) || p < 0) { setError("Introduce un precio válido"); return; }
    if (await addProduct({ name: name.trim(), category, price: p })) onClose();
  };
  return (
    <div className="modal"><div className="modal-content">
      <div className="modal-header"><span>Nuevo Producto</span><button className="modal-close" onClick={onClose}>×</button></div>
      <form onSubmit={handleSubmit}>
        {error && <div className="error-message">{error}</div>}
        <div className="form-group"><label htmlFor="field-49">Nombre</label><input id="field-49" type="text" className="input" value={name} onChange={e => setName(e.target.value)} required /></div>
        <div className="form-group"><label htmlFor="field-50">Categoría</label><select id="field-50" className="input" value={category} onChange={e => setCategory(e.target.value)}>{["Bollería","Tartas","Especialidades","Pasteles","Panadería","Salados","Cafetería"].map(c => <option key={c}>{c}</option>)}</select></div>
        <div className="form-group"><label htmlFor="field-51">Precio (€)</label><input id="field-51" type="number" className="input" step="0.01" min="0" value={price} onChange={e => setPrice(e.target.value)} required /></div>
        <div className="modal-footer"><button type="button" className="btn btn-secondary btn-sm" onClick={onClose}>Cancelar</button><button type="submit" className="btn btn-primary btn-sm">Crear</button></div>
      </form>
    </div></div>
  );
}

function AddEmployeeModal({ onClose, addEmployee }) {
  const [name, setName] = useState("");
  const [role, setRole] = useState("Ayudante de Dependienta");
  const [monthsWorked, setMonthsWorked] = useState("12");
  const [shiftType, setShiftType] = useState("store");
  const [pastryShift, setPastryShift] = useState("P1");
  const [error, setError] = useState("");
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (!name.trim()) { setError("Falta el nombre"); return; }
    const m = parseInt(monthsWorked);
    if (!Number.isFinite(m) || m < 0) { setError("Meses trabajados inválido"); return; }
    const saved = await addEmployee({ name: name.trim(), role, monthsWorked: m, shiftType, vacationDays: 0, workedHolidays: 0, ...(shiftType === "pastry" ? { pastryShift } : {}) });
    if (saved) onClose();
  };
  return (
    <div className="modal"><div className="modal-content">
      <div className="modal-header"><span>Nuevo Empleado</span><button className="modal-close" onClick={onClose}>×</button></div>
      <form onSubmit={handleSubmit}>
        {error && <div className="error-message">{error}</div>}
        <div className="form-group"><label htmlFor="field-52">Nombre</label><input id="field-52" type="text" className="input" value={name} onChange={e => setName(e.target.value)} required /></div>
        <div className="form-group"><label htmlFor="field-53">Rol</label><select id="field-53" className="input" value={role} onChange={e => setRole(e.target.value)}>{ROLE_OPTIONS.map(r => <option key={r} value={r}>{r}</option>)}</select></div>
        <div className="form-group"><label htmlFor="field-54">Meses Trabajados</label><input id="field-54" type="number" className="input" min="0" value={monthsWorked} onChange={e => setMonthsWorked(e.target.value)} /></div>
        <div className="form-group"><label htmlFor="field-55">Tipo de jornada</label>
          <select id="field-55" className="input" value={shiftType} onChange={e => setShiftType(e.target.value)}>
            <option value="store">Tienda (rotación A/B/C)</option>
            <option value="pastry">Obrador / Pastelería</option>
          </select>
        </div>
        {shiftType === "pastry" && (
          <div className="form-group"><label htmlFor="field-56">Turno de pastelería</label>
            <select id="field-56" className="input" value={pastryShift} onChange={e => setPastryShift(e.target.value)}>
              <option value="P1">P1 – Lunes libre, Martes 8-13</option>
              <option value="P2">P2 – Martes libre, Lunes 8-13</option>
              <option value="P3">P3 – Miércoles libre, Jueves 8-13</option>
            </select>
          </div>
        )}
        <div className="modal-footer"><button type="button" className="btn btn-secondary btn-sm" onClick={onClose}>Cancelar</button><button type="submit" className="btn btn-primary btn-sm">Crear</button></div>
      </form>
    </div></div>
  );
}

// ─── SUGERENCIAS E INCIDENCIAS ───────────────────────────────────────────────
function SugerenciasScreen({ userProfile, showNotification }) {
  const isAdmin = userProfile.role === "admin" || userProfile.role === "manager";
  const [reports, setReports] = useState([]);
  const [activeTab, setActiveTab] = useState(isAdmin ? "all" : "new");
  const [formType, setFormType] = useState("incidencia");
  const [category, setCategory] = useState("");
  const [body, setBody] = useState("");
  const [anonymous, setAnonymous] = useState(false);
  const [priority, setPriority] = useState("media");
  const [photo, setPhoto] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [filterType, setFilterType] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const fileRef = useRef(null);

  // PRIVACIDAD: los reportes incluyen denuncias confidenciales y anónimas.
  // Un empleado solo puede descargar los suyos; el filtro va en la CONSULTA, no
  // en memoria (antes se bajaba la colección entera —con las fotos en base64— a
  // todos los dispositivos y se filtraba en el cliente, así que cualquiera podía
  // leer los confidenciales ajenos desde la consola del navegador).
  const myReportKey = String(userProfile.linkedEmployeeId || "") || userProfile.uid;
  useEffect(() => {
    if (!fbReady()) return;
    const base = fb().firestore().collection("reports");
    const query = isAdmin
      ? base.orderBy("createdAt", "desc")
      : base.where("employeeId", "==", myReportKey).orderBy("createdAt", "desc");
    const unsub = query.onSnapshot(
      snap => setReports(snap.docs.map(d => ({ id: d.id, ...d.data() }))),
      e => console.error("reports:", e)
    );
    return () => unsub();
  }, [isAdmin, myReportKey]);

  const resetForm = () => {
    setCategory(""); setBody(""); setAnonymous(false); setPriority("media"); setPhoto(null);
    if (fileRef.current) fileRef.current.value = "";
  };

  const handlePhotoChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) { showNotification("Selecciona una imagen JPEG, PNG o WebP.", "warning"); return; }
    if (file.size > 500 * 1024) { showNotification("La foto no puede superar 500 KB.", "warning"); return; }
    const reader = new FileReader();
    reader.onload = (ev) => setPhoto(ev.target.result);
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!body.trim() && formType !== "incidencia") return;
    if (formType === "incidencia" && !category) { showNotification("Selecciona el tipo de incidencia", "warning"); return; }
    setSubmitting(true);
    const myEmpId = String(userProfile.linkedEmployeeId || "");
    const data = {
      type: formType,
      category: category || null,
      body: body.trim(),
      anonymous: (formType === "confidencial" || formType === "sugerencia") ? anonymous : false,
      employeeId: anonymous ? null : myEmpId || userProfile.uid,
      employeeName: anonymous ? null : userProfile.name,
      priority: formType === "mejora" ? priority : null,
      photo: photo || null,
      status: "pendiente",
      createdAt: new Date().toISOString(),
    };
    try {
      await fb().firestore().collection("reports").add(data);
      resetForm();
      setSubmitted(true);
      setTimeout(() => setSubmitted(false), 4000);
    } catch { showNotification("No se pudo enviar. Comprueba la conexión y vuelve a intentarlo.", "error"); }
    setSubmitting(false);
  };

  const updateStatus = async (id, status) => {
    try {
      await fb().firestore().collection("reports").doc(id).update({
        status,
        resolvedAt: status === "resuelto" ? new Date().toISOString() : null,
      });
    } catch (e) { console.error(e); }
  };

  const deleteReport = async (id) => {
    if (!window.confirm("¿Eliminar este reporte?")) return;
    try { await fb().firestore().collection("reports").doc(id).delete(); } catch (e) { console.error(e); }
  };

  const INCIDENCIA_CATS = ["Falta de producto", "Máquina averiada", "Hay una gotera", "Se ha roto una bandeja", "Otro"];
  const TYPE_ICONS = { incidencia: "🛠", sugerencia: "💡", confidencial: "🚨", mejora: "🔍" };
  const TYPE_LABELS = { incidencia: "Incidencia", sugerencia: "Sugerencia", confidencial: "Confidencial", mejora: "Mejora detectada" };
  const STATUS_LABELS = { pendiente: "Pendiente", en_proceso: "En proceso", resuelto: "Resuelto" };
  const STATUS_COLORS = { pendiente: "#FF9800", en_proceso: "#2196F3", resuelto: "#4CAF50" };
  const PRIO_COLORS = { alta: "#C62828", media: "#E65100", baja: "#2E7D32" };
  const PRIO_BG = { alta: "#FFEBEE", media: "#FFF3E0", baja: "#E8F5E9" };
  const PRIO_ICON = { alta: "🔴", media: "🟡", baja: "🟢" };

  const myEmpId = String(userProfile.linkedEmployeeId || "");
  const myReports = reports.filter(r => !r.anonymous && (r.employeeId === myEmpId || r.employeeId === userProfile.uid));
  const visibleAdmin = reports.filter(r =>
    (!filterType || r.type === filterType) &&
    (!filterStatus || r.status === filterStatus)
  );

  const renderReportCard = (r, showControls) => {
    const prioColor = r.priority ? PRIO_COLORS[r.priority] : null;
    const prioBg = r.priority ? PRIO_BG[r.priority] : null;
    return (
      <div key={r.id} className="report-card" style={{ borderLeft: `4px solid ${STATUS_COLORS[r.status] || "#DDD"}` }}>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", gap:8 }}>
          <div style={{ flex:1 }}>
            <div style={{ display:"flex", flexWrap:"wrap", gap:6, marginBottom:6, alignItems:"center" }}>
              <span style={{ fontWeight:700, fontSize:14 }}>{TYPE_ICONS[r.type]} {TYPE_LABELS[r.type]}</span>
              {r.category && <span style={{ fontSize:12, background:"#F5F1E8", padding:"2px 8px", borderRadius:10 }}>{r.category}</span>}
              {r.priority && (
                <span style={{ fontSize:11, background:prioBg, color:prioColor, padding:"2px 8px", borderRadius:10, fontWeight:600 }}>
                  {PRIO_ICON[r.priority]} {r.priority.charAt(0).toUpperCase()+r.priority.slice(1)}
                </span>
              )}
              <span style={{ fontSize:11, background:STATUS_COLORS[r.status]+"22", color:STATUS_COLORS[r.status], padding:"2px 8px", borderRadius:10, fontWeight:600 }}>
                {STATUS_LABELS[r.status]}
              </span>
            </div>
            {r.body && <p style={{ fontSize:13, color:"#333", marginBottom:6 }}>{r.body}</p>}
            {r.photo && (
              <img src={r.photo} alt="adjunto" style={{ maxWidth:"100%", maxHeight:140, borderRadius:8, marginBottom:8, objectFit:"cover", display:"block" }} />
            )}
            <p style={{ fontSize:11, color:"#999" }}>
              {r.anonymous ? "Anónimo" : (r.employeeName || "—")} · {r.createdAt ? new Date(r.createdAt).toLocaleDateString("es-ES") : "—"}
            </p>
          </div>
          {showControls && (
            <div style={{ display:"flex", flexDirection:"column", gap:4, minWidth:110 }}>
              <select className="input" value={r.status} onChange={e => updateStatus(r.id, e.target.value)}
                style={{ fontSize:12, padding:"4px 6px", marginBottom:0 }}>
                <option value="pendiente">Pendiente</option>
                <option value="en_proceso">En proceso</option>
                <option value="resuelto">Resuelto</option>
              </select>
              <button className="btn btn-sm btn-danger" onClick={() => deleteReport(r.id)} style={{ fontSize:11 }}>Eliminar</button>
            </div>
          )}
        </div>
      </div>
    );
  };

  if (isAdmin) {
    const pending = visibleAdmin.filter(r => r.status === "pendiente").length;
    return (
      <div className="container">
        <h2>Sugerencias e Incidencias</h2>
        {pending > 0 && (
          <div style={{ background:"#FFF3E0", border:"1px solid #FF9800", borderRadius:8, padding:"10px 14px", marginBottom:14, color:"#E65100", fontSize:13, fontWeight:600 }}>
            {pending} reporte{pending > 1 ? "s" : ""} pendiente{pending > 1 ? "s" : ""} de gestionar
          </div>
        )}
        <div style={{ display:"flex", gap:8, flexWrap:"wrap", marginBottom:14 }}>
          <select className="input" style={{ flex:1, minWidth:130, marginBottom:0 }} value={filterType} onChange={e => setFilterType(e.target.value)}>
            <option value="">Todos los tipos</option>
            {Object.entries(TYPE_LABELS).map(([k,v]) => <option key={k} value={k}>{TYPE_ICONS[k]} {v}</option>)}
          </select>
          <select className="input" style={{ flex:1, minWidth:130, marginBottom:0 }} value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
            <option value="">Todos los estados</option>
            {Object.entries(STATUS_LABELS).map(([k,v]) => <option key={k} value={k}>{v}</option>)}
          </select>
        </div>
        {visibleAdmin.length === 0 ? (
          <div className="card" style={{ textAlign:"center", color:"#999", padding:28 }}>
            <div style={{ fontSize:36, marginBottom:8 }}>📬</div>
            <p>Sin reportes todavía.</p>
          </div>
        ) : (
          visibleAdmin.map(r => renderReportCard(r, true))
        )}
      </div>
    );
  }

  return (
    <div className="container">
      <h2>Sugerencias e Incidencias</h2>
      <div className="nav-tabs" style={{ marginBottom:0 }}>
        <button className={`nav-tab ${activeTab==="new"?"active":""}`} onClick={() => setActiveTab("new")}>Nuevo</button>
        <button className={`nav-tab ${activeTab==="mine"?"active":""}`} onClick={() => setActiveTab("mine")}>
          Mis envíos {myReports.length > 0 ? `(${myReports.length})` : ""}
        </button>
      </div>

      {activeTab === "new" && (
        <div style={{ marginTop:16 }}>
          <div style={{ display:"flex", gap:8, flexWrap:"wrap", marginBottom:16 }}>
            {Object.entries(TYPE_LABELS).map(([t, label]) => (
              <button key={t} type="button" onClick={() => { setFormType(t); resetForm(); }}
                className={`btn btn-sm ${formType===t?"btn-primary":"btn-secondary"}`}>
                {TYPE_ICONS[t]} {label}
              </button>
            ))}
          </div>

          {submitted && (
            <div style={{ background:"#E8F5E9", border:"1px solid #4CAF50", borderRadius:8, padding:12, marginBottom:12, color:"#2E7D32", fontWeight:600 }}>
              Enviado correctamente. Gracias.
            </div>
          )}

          <form onSubmit={handleSubmit} className="card">
            <h4 style={{ marginBottom:14 }}>{TYPE_ICONS[formType]} {TYPE_LABELS[formType]}</h4>

            {formType === "confidencial" && (
              <div style={{ background:"#FFF3E0", border:"1px solid #FFB74D", borderRadius:8, padding:"10px 12px", marginBottom:12, fontSize:12, color:"#795548" }}>
                Este canal es para asuntos serios: conflictos, acoso o comportamientos inadecuados. Puedes enviarlo de forma completamente anónima.
              </div>
            )}

            {formType === "incidencia" && (
              <div className="form-group">
                <label htmlFor="field-57">Tipo de incidencia</label>
                <select id="field-57" className="input" value={category} onChange={e => setCategory(e.target.value)} required>
                  <option value="">Selecciona...</option>
                  {INCIDENCIA_CATS.map(c => <option key={c}>{c}</option>)}
                </select>
              </div>
            )}

            <div className="form-group">
              <label>
                {formType === "incidencia" ? "Descripción (opcional)" :
                 formType === "mejora" ? "Descripción de la mejora" :
                 formType === "confidencial" ? "Describe la situación" : "Tu sugerencia"}
              </label>
              <textarea className="input" value={body} onChange={e => setBody(e.target.value)}
                placeholder={
                  formType === "sugerencia" ? "Ej: Creo que deberíamos cambiar el horario de limpieza..." :
                  formType === "confidencial" ? "Describe con el detalle que consideres oportuno..." :
                  formType === "mejora" ? "Ej: Falta cambiar el cartel de precios de la vitrina izquierda." :
                  "Describe la incidencia..."
                }
                style={{ minHeight:100 }}
                required={formType !== "incidencia"}
              />
            </div>

            {(formType === "incidencia" || formType === "mejora") && (
              <div className="form-group">
                <label htmlFor="field-58">Foto adjunta (opcional, máx. 500 KB)</label>
                <input id="field-58" ref={fileRef} type="file" accept="image/*" onChange={handlePhotoChange}
                  className="input" style={{ padding:"8px" }} />
                {photo && (
                  <div style={{ marginTop:8, position:"relative" }}>
                    <img src={photo} alt="preview" style={{ maxWidth:"100%", maxHeight:160, borderRadius:8, objectFit:"cover" }} />
                    <button type="button" onClick={() => { setPhoto(null); if (fileRef.current) fileRef.current.value = ""; }}
                      style={{ position:"absolute", top:4, right:4, background:"rgba(0,0,0,0.6)", color:"white", border:"none", borderRadius:"50%", width:24, height:24, cursor:"pointer", fontSize:14, display:"flex", alignItems:"center", justifyContent:"center" }}>×</button>
                  </div>
                )}
              </div>
            )}

            {formType === "mejora" && (
              <div className="form-group">
                <label>Prioridad</label>
                <div style={{ display:"flex", gap:8 }}>
                  {[["baja","🟢"],["media","🟡"],["alta","🔴"]].map(([p, icon]) => (
                    <button key={p} type="button" onClick={() => setPriority(p)}
                      className={`btn btn-sm ${priority===p?"btn-primary":"btn-secondary"}`} style={{ flex:1 }}>
                      {icon} {p.charAt(0).toUpperCase()+p.slice(1)}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {(formType === "confidencial" || formType === "sugerencia") && (
              <div className="form-group">
                <label style={{ display:"flex", alignItems:"center", gap:10, fontWeight:"normal", cursor:"pointer" }}>
                  <input type="checkbox" checked={anonymous} onChange={e => setAnonymous(e.target.checked)} />
                  <span>Enviar anónimamente</span>
                </label>
                <p style={{ fontSize:12, color:"#666", marginTop:5 }}>
                  {anonymous ? "No se guardará tu nombre." : `Tu nombre quedará registrado: ${userProfile.name}`}
                </p>
              </div>
            )}

            <button type="submit" className="btn btn-primary" style={{ width:"100%" }} disabled={submitting}>
              {submitting ? "Enviando..." : "Enviar"}
            </button>
          </form>
        </div>
      )}

      {activeTab === "mine" && (
        <div style={{ marginTop:16 }}>
          {myReports.length === 0 ? (
            <div className="card" style={{ textAlign:"center", color:"#999", padding:28 }}>
              <div style={{ fontSize:36, marginBottom:8 }}>📬</div>
              <p>Aún no has enviado ningún reporte.</p>
            </div>
          ) : (
            myReports.map(r => renderReportCard(r, false))
          )}
        </div>
      )}
    </div>
  );
}

// ─── APP ──────────────────────────────────────────────────────────────────────
function AppInner() {
  const [firebaseReady, setFirebaseReady] = useState(false);
  const [authLoaded, setAuthLoaded] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null);

  // FIX #4, #37: empleados también sincronizados con Firestore
  const [employees, setEmployees] = useState(() => []);
  const [products, setProducts] = useState(() => []);

  // FIX #1, #2: shiftTemplates ES estado, persistido y cargado de Firestore
  const [shiftTemplates, setShiftTemplates] = useState(() => safeLocalGet("pardilla_shift_templates", SHIFT_TEMPLATES_DEFAULT));
  // v5.1: plantillas individuales por turno de pastelero (P1/P2/P3)
  const [pastryTemplates, setPastryTemplates] = useState(() => {
    const stored = safeLocalGet("pardilla_pastry_templates", null);
    if (stored && stored.P1 && stored.P2 && stored.P3) return stored;
    // Migración desde formato antiguo (clave "pardilla_pastry_template")
    return safeLocalGet("pardilla_pastry_template", null) ? PASTRY_TEMPLATES_DEFAULT : PASTRY_TEMPLATES_DEFAULT;
  });

  const [rotationConfig, setRotationConfig] = useState(() => safeLocalGet("pardilla_rotation", ROTATION_DEFAULT));
  const [vacationAssignments, setVacationAssignments] = useState([]);
  const [screen, setScreen] = useState("home");
  const [modalOpen, setModalOpen] = useState(null);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [notification, setNotification] = useState({ msg: "", type: "" });
  const [newVersion, setNewVersion] = useState(null);
  const [updateUrl, setUpdateUrl] = useState("");
  const [globalError, setGlobalError] = useState("");
  const [profileError, setProfileError] = useState(null);

  const showNotification = useCallback((msg, type = "success") => {
    setNotification({ msg, type });
    setTimeout(() => setNotification({ msg: "", type: "" }), 3500);
  }, []);

  // FIX #20, #37: acumulación mensual y festivos solo se ejecutan UNA VEZ por sesión cuando hay user
  const accrualRanRef = useRef(false);
  useEffect(() => {
    if (!currentUser || accrualRanRef.current) return;
    accrualRanRef.current = true;
    const now = new Date();
    const currentYM = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
    const lastAccrual = localStorage.getItem("pardilla_last_accrual");
    if (!lastAccrual) { localStorage.setItem("pardilla_last_accrual", currentYM); return; }
    if (lastAccrual >= currentYM) return;
    const [ly, lm] = lastAccrual.split("-").map(Number);
    const [cy, cm] = currentYM.split("-").map(Number);
    const months = (cy - ly) * 12 + (cm - lm);
    if (months <= 0) return;
    setEmployees(prev => {
      const updated = prev.map(e => ({ ...e, monthsWorked: e.monthsWorked + months }));
      safeLocalSet("pardilla_employees", updated);
      return updated;
    });
    localStorage.setItem("pardilla_last_accrual", currentYM);
  }, [currentUser]);

  // FIX #8, #20: festivos con parseLocalDate y solo una vez por sesión
  const holidayCreditsRef = useRef(false);
  useEffect(() => {
    if (!currentUser || holidayCreditsRef.current) return;
    holidayCreditsRef.current = true;
    const credits = safeLocalGet("pardilla_holiday_credits", {});
    const today = new Date(); today.setHours(23, 59, 59, 0);
    const newCredits = { ...credits };
    const updates = {};
    const dayKeys = ["D","L","M","X","J","V","S"];
    const yearsToCheck = [today.getFullYear() - 1, today.getFullYear(), today.getFullYear() + 1];
    yearsToCheck.forEach(year => {
      getMadridHolidays(year).forEach(dateStr => {
        const date = parseLocalDate(dateStr);
        if (!date || date > today) return;
        const dow = date.getDay();
        if (dow === 0) return;
        const dayKey = dayKeys[dow];
        employees.forEach(emp => {
          const key = `${emp.id}_${dateStr}`;
          if (newCredits[key]) return;
          const sl = getCurrentShift(emp.id, date, rotationConfig);
          if (sl) {
            const tmpl = getShiftTemplate(sl, shiftTemplates);
            if (!tmpl?.[dayKey]) return;
          } else if (emp.shiftType === "pastry") {
            const pKey = emp.pastryShift || "P1";
            if (!pastryTemplates?.[pKey]?.[dayKey]) return;
          } else { return; }
          updates[emp.id] = (updates[emp.id] || 0) + 1;
          newCredits[key] = true;
        });
      });
    });
    if (Object.keys(updates).length === 0) return;
    setEmployees(prev => {
      const updated = prev.map(e => updates[e.id] ? { ...e, vacationDays: e.vacationDays + updates[e.id] } : e);
      safeLocalSet("pardilla_employees", updated);
      return updated;
    });
    safeLocalSet("pardilla_holiday_credits", newCredits);
  }, [currentUser, employees, rotationConfig, shiftTemplates, pastryTemplates]);

  // Sync rotación
  useEffect(() => {
    if (!firebaseReady || !currentUser) return;
    const unsub = fb().firestore().collection("shiftConfig").doc("rotation")
      .onSnapshot(doc => {
        if (doc.exists) {
          const data = doc.data();
          setRotationConfig(prev => JSON.stringify(prev) === JSON.stringify(data) ? prev : data);
          safeLocalSet("pardilla_rotation", data);
        }
      }, err => console.error("Rotation sync:", err));
    return () => unsub();
  }, [firebaseReady, currentUser]);

  // FIX #2: Sync plantillas turnos (shiftConfig/templates)
  useEffect(() => {
    if (!firebaseReady || !currentUser) return;
    const unsub = fb().firestore().collection("shiftConfig").doc("templates")
      .onSnapshot(doc => {
        if (doc.exists) {
          const d = doc.data();
          if (d.templates) { setShiftTemplates(d.templates); safeLocalSet("pardilla_shift_templates", d.templates); }
          // v5.1: pastry es ahora un objeto {P1, P2, P3}
          if (d.pastry && d.pastry.P1) { setPastryTemplates(d.pastry); safeLocalSet("pardilla_pastry_templates", d.pastry); }
          else if (d.pastry && !d.pastry.P1) {
            // migración: formato antiguo (plantilla única) — usar defaults
            safeLocalSet("pardilla_pastry_templates", PASTRY_TEMPLATES_DEFAULT);
          }
        }
      }, err => console.error("Templates sync:", err));
    return () => unsub();
  }, [firebaseReady, currentUser]);

  // FIX #4: Sync empleados desde Firestore (colección "employees")
  useEffect(() => {
    if (!firebaseReady || !currentUser) return;
    const unsub = fb().firestore().collection("employees").orderBy("id")
      .onSnapshot(snap => {
        const list = snap.docs.map(d => d.data());
        setEmployees(list); safeLocalSet("pardilla_employees", list);
      }, err => console.error("Employees sync:", err));
    return () => unsub();
  }, [firebaseReady, currentUser, userProfile?.role]);

  // Sync productos
  useEffect(() => {
    if (!firebaseReady || !currentUser) return;
    const unsub = fb().firestore().collection("products").orderBy("id")
      .onSnapshot(snap => {
        const list = snap.docs.map(d => d.data());
        setProducts(list); safeLocalSet("pardilla_products", list);
      }, err => console.error("Products sync:", err));
    return () => unsub();
  }, [firebaseReady, currentUser, userProfile?.role]);

  // Sync vacaciones
  useEffect(() => {
    if (!firebaseReady || !currentUser) return;
    const unsub = fb().firestore().collection("vacationAssignments")
      .onSnapshot(snap => setVacationAssignments(snap.docs.map(d => ({ id: d.id, ...d.data() }))), err => console.error("Vacations sync:", err));
    return () => unsub();
  }, [firebaseReady, currentUser]);

  // CRUD empleados/productos/vacaciones (centralizados)
  const updateEmployee = async (emp) => {
    try {
      await fb().firestore().collection("employees").doc(String(emp.id)).set(emp);
      setEmployees(prev => { const list = prev.map(e => e.id === emp.id ? emp : e); safeLocalSet("pardilla_employees", list); return list; });
    } catch (e) { showNotification(mensajeConsulta(e, "guardar el empleado"), "error"); }
  };
  const removeEmployee = async (id) => {
    try {
      await fb().firestore().collection("employees").doc(String(id)).delete();
      setEmployees(prev => { const list = prev.filter(e => e.id !== id); safeLocalSet("pardilla_employees", list); return list; });
    } catch (e) { showNotification(mensajeConsulta(e, "eliminar el empleado"), "error"); }
  };
  const addEmployee = async (data) => {
    try { await createRecord(fb().firestore(), "employees", data); return true; }
    catch { showNotification("No se pudo guardar. Comprueba la conexión y vuelve a intentarlo.", "error"); return false; }
  };
  const updateEmployeeVacation = async (empId, delta) => {
    const emp = employees.find(e => e.id === empId);
    if (!emp) return;
    const updated = { ...emp, vacationDays: emp.vacationDays + delta };
    await updateEmployee(updated);
  };
  const updateProduct = async (prod) => {
    try {
      await fb().firestore().collection("products").doc(String(prod.id)).set(prod);
    } catch (e) { showNotification(mensajeConsulta(e, "guardar el producto"), "error"); }
  };
  const addProduct = async (data) => {
    try { await createRecord(fb().firestore(), "products", data); return true; }
    catch { showNotification("No se pudo guardar. Comprueba la conexión y vuelve a intentarlo.", "error"); return false; }
  };
  const addVacationAssignment = async (a) => {
    try { await fb().firestore().collection("vacationAssignments").doc(a.id).set(a); }
    catch (e) { showNotification(mensajeConsulta(e, "asignar las vacaciones"), "error"); }
  };
  const deleteVacationAssignment = async (id) => {
    try { await fb().firestore().collection("vacationAssignments").doc(id).delete(); }
    catch (e) { showNotification(mensajeConsulta(e, "eliminar la asignación"), "error"); }
  };
  const signVacationAssignment = async (a, signatureData) => {
    try { await signVacation(fb().firestore(), a.id, signatureData); }
    catch { showNotification("No se pudo firmar. Comprueba la conexión y vuelve a intentarlo.", "error"); }
  };

  const checkForUpdates = useCallback((silent = false) => {
    if (!firebaseReady || !currentUser) return;
    fb().firestore().collection("config").doc("app_version").get()
      .then(doc => {
        if (!doc.exists) return;
        const { version, apkUrl, webUrl } = doc.data();
        const v = version ? version.trim() : null;
        const dismissed = localStorage.getItem("pardilla_dismissed_version");
        // FIX #23: comparar semver y respetar la versión ya descartada
        if (v && isNewerVersion(v, APP_VERSION)) {
          // Si el usuario ya descartó esta versión (o una posterior), no insistir.
          // Antes esta condición existía pero su bloque estaba vacío, así que solo
          // funcionaba cuando la versión coincidía exactamente.
          if (silent && dismissed && !isNewerVersion(v, dismissed)) return;
          setNewVersion(v);
          const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
          setUpdateUrl(isIOS ? (webUrl || WEB_URL) : (apkUrl || `https://github.com/${GITHUB_REPO}/releases/latest`));
        } else if (!silent) {
          showNotification(`Tienes la versión más reciente (v${APP_VERSION})`);
        }
      })
      .catch(console.error);
  }, [firebaseReady, currentUser, showNotification]);

  useEffect(() => {
    if (firebaseReady && currentUser) checkForUpdates(true);
  }, [firebaseReady, currentUser, checkForUpdates]);

  const initFirebase = useCallback(() => {
    // Prioridad: config compilada > variables de entorno > config guardada en el
    // dispositivo. Solo si no hay ninguna se muestra la pantalla de configuración.
    let config = FIREBASE_CONFIG_HARDCODED || getEnvFirebaseConfig();
    if (!config) {
      config = safeLocalGet("pardilla_firebase_config", null);
      if (!config) { setFirebaseReady(false); setAuthLoaded(true); return; }
    }
    if (!fbReady()) { setGlobalError("Firebase SDK no cargado. Verifica el script en index.html."); setAuthLoaded(true); return; }
    try {
      if (!fb().apps.length) { const app = fb().initializeApp(config); connectEmulators(app); }
      // Habilitar offline persistence (FIX #31)
      // Persistencia offline: si el navegador no la soporta (o hay varias
      // pestañas sin sincronizar) la app sigue funcionando online.
      let active = true;
      const unsubscribe = fb().auth().onAuthStateChanged(async (user) => {
        setAuthLoaded(false); setUserProfile(null);
        setScreen("home"); setSelectedEmployee(null); setSelectedProduct(null); setModalOpen(null);
        setEmployees([]); setProducts([]); setVacationAssignments([]);
        setCurrentUser(user);
        if (user) {
          try {
            const p = await fb().firestore().collection("users").doc(user.uid).get();
            if (!active || fb().auth().currentUser?.uid !== user.uid) return;
            if (p.exists) { setUserProfile({ ...p.data(), uid: user.uid }); setProfileError(null); }
            // Autenticado pero sin ficha en "users": ocurre si el admin le quitó
            // el acceso (borra el doc, no la cuenta de Auth) o si la cuenta se
            // creó desde la consola de Firebase. Antes se quedaba colgado en
            // "Cargando perfil..." para siempre y sin botón de salir.
            else { setUserProfile(null); setProfileError("sin-perfil"); }
          } catch (e) {
            console.error("loadProfile:", e);
            setUserProfile(null);
            setProfileError(e.message || "error");
          }
        } else { setUserProfile(null); setProfileError(null); }
        setAuthLoaded(true);
      });
      setFirebaseReady(true);
      return () => { active = false; unsubscribe(); };
    } catch (e) { console.error("Firebase init error:", e); setGlobalError("No se pudo iniciar Firebase. Comprueba la configuración."); setAuthLoaded(true); }
  }, []);

  // Se declara initFirebase antes de usarlo en el efecto (evita el TDZ que
  // señalaba react-hooks/immutability).
  useEffect(() => initFirebase(), [initFirebase]);

  const handleConfigSet = (config) => { safeLocalSet("pardilla_firebase_config", config); initFirebase(); };
  const handleLoginSuccess = () => {};
  const handleLogout = async () => { try { await fb().auth().signOut(); } catch (e) { console.error(e); } setCurrentUser(null); setUserProfile(null); setScreen("home"); };

  if (globalError) return <div className="login-screen"><div className="login-card"><h3>Error</h3><p style={{ marginTop: 12, fontSize: 13 }}>{globalError}</p></div></div>;
  if (!firebaseReady) return <SetupScreen onConfigSet={handleConfigSet} />;
  if (!authLoaded) return <div className="loading-spinner"><div className="spinner"></div><div className="loading-text">Iniciando...</div></div>;
  if (!currentUser) return <LoginScreen onLoginSuccess={handleLoginSuccess} />;
  if (!userProfile && profileError) return (
    <div className="login-screen"><div className="login-card">
      <div className="login-logo"><div className="icon">🥐</div><h2>Sin acceso</h2></div>
      <p style={{ fontSize: 14, color: "#666", marginBottom: 16 }}>
        {profileError === "sin-perfil"
          ? "Tu cuenta existe pero no tiene permisos asignados en la aplicación. Pide al administrador que te dé de alta."
          : "No hemos podido cargar tu perfil. Comprueba tu conexión e inténtalo de nuevo."}
      </p>
      <button className="btn btn-primary" style={{ width: "100%", marginBottom: 8 }} onClick={() => window.location.reload()}>Reintentar</button>
      <button className="btn btn-secondary" style={{ width: "100%" }} onClick={handleLogout}>Cerrar sesión</button>
    </div></div>
  );
  if (!userProfile) return <div className="loading-spinner"><div className="spinner"></div><div className="loading-text">Cargando perfil...</div></div>;

  return (
    <div>
      <div className="header">
        <h1><span style={{ fontSize: "28px" }}>🥐</span>Pastelería Pardilla<span className="badge" style={{ marginLeft: "12px", fontSize: "11px" }}>v{APP_VERSION}</span></h1>
        <div className="header-right">
          <div className="header-user"><span>{userProfile.name}</span></div>
          <button className="logout-btn" onClick={() => checkForUpdates(false)} title="Comprobar actualizaciones" style={{ fontSize: 13, padding: "6px 10px" }}>🔄</button>
          <button className="logout-btn" onClick={handleLogout}>🚪 Salir</button>
        </div>
      </div>

      {newVersion && (
        <div style={{ background: "#FFF3CD", borderBottom: "2px solid #FFC107", padding: "10px 16px", display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12 }}>
          <span style={{ fontSize: 14 }}>🆕 Nueva versión disponible: <strong>v{newVersion}</strong></span>
          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            <a href={updateUrl} target="_blank" rel="noopener noreferrer"
              style={{ background: "#FF9800", color: "white", padding: "7px 16px", borderRadius: 6, fontWeight: 600, fontSize: 13, textDecoration: "none", whiteSpace: "nowrap" }}>
              Actualizar ahora
            </a>
            <button onClick={() => { localStorage.setItem("pardilla_dismissed_version", newVersion); setNewVersion(null); }}
              style={{ background: "transparent", border: "none", fontSize: 18, cursor: "pointer", color: "#888", padding: "0 4px" }}>
              ✕
            </button>
          </div>
        </div>
      )}

      {/* Aviso al admin cuando falta el calendario laboral de algún año: sin él,
          los festivos trabajados dejarían de sumarse a las vacaciones en silencio. */}
      {userProfile.role === "admin" && missingHolidayYears().length > 0 && (
        <div style={{ background: "#FFEBEE", borderBottom: "2px solid #F44336", padding: "10px 16px", fontSize: 14 }}>
          ⚠️ Falta el calendario laboral de {missingHolidayYears().join(" y ")}. Hasta que se añada,
          los festivos trabajados de {missingHolidayYears()[0]} <strong>no se sumarán</strong> a las vacaciones del equipo.
        </div>
      )}

      {/* FIX #28: breadcrumb sencillo */}
      {screen !== "home" && (
        <div className="container" style={{ paddingBottom: 0 }}>
          <div className="breadcrumb"><a onClick={() => setScreen("home")}>← Inicio</a></div>
        </div>
      )}

      <div className="nav-tabs">
        {screen !== "home" && <button className="nav-tab" onClick={() => setScreen("home")}>Inicio</button>}
        {(userProfile.role === "admin" || userProfile.role === "manager") && <>
          <button className={`nav-tab ${screen === "employees" ? "active" : ""}`} onClick={() => setScreen("employees")}>Empleados</button>
          <button className={`nav-tab ${screen === "products" ? "active" : ""}`} onClick={() => setScreen("products")}>Productos</button>
          <button className={`nav-tab ${screen === "management" ? "active" : ""}`} onClick={() => setScreen("management")}>Gestión</button>
          <button className={`nav-tab ${screen === "ia" ? "active" : ""}`} onClick={() => setScreen("ia")}>🤖 Asesor IA</button>
        </>}
        <button className={`nav-tab ${screen === "tasks" ? "active" : ""}`} onClick={() => setScreen("tasks")}>Tareas</button>
        <button className={`nav-tab ${screen === "sugerencias" ? "active" : ""}`} onClick={() => setScreen("sugerencias")}>Sugerencias</button>
        {(userProfile.role === "admin" || userProfile.role === "manager") && <button className={`nav-tab ${screen === "schedule" ? "active" : ""}`} onClick={() => setScreen("schedule")}>Turnos</button>}
        <button className={`nav-tab ${screen === "miHorario" ? "active" : ""}`} onClick={() => setScreen("miHorario")}>Mi Horario</button>
        <button className={`nav-tab ${screen === "fichar" ? "active" : ""}`} onClick={() => setScreen("fichar")}>Fichar</button>
        <button className={`nav-tab ${screen === "vacation" ? "active" : ""}`} onClick={() => setScreen("vacation")}>Vacaciones</button>
        {userProfile.role === "admin" && <button className={`nav-tab ${screen === "assignVacations" ? "active" : ""}`} onClick={() => setScreen("assignVacations")}>Asignar Vacaciones</button>}
        {userProfile.role === "admin" && <>
          <button className={`nav-tab ${screen === "shiftConfig" ? "active" : ""}`} onClick={() => setScreen("shiftConfig")}>Config Turnos</button>
          <button className={`nav-tab ${screen === "users" ? "active" : ""}`} onClick={() => setScreen("users")}>Usuarios</button>
          <button className={`nav-tab ${screen === "firebase" ? "active" : ""}`} onClick={() => setScreen("firebase")}>Firebase</button>
        </>}
      </div>

      {screen === "home" && <HomeScreen userProfile={userProfile} onNavigate={setScreen} />}
      {screen === "employees" && <EmployeesScreen employees={employees} onOpenModal={setModalOpen} onSelectEmployee={setSelectedEmployee} />}
      {screen === "products" && <ProductsScreen products={products} onOpenModal={setModalOpen} onSelectProduct={setSelectedProduct} />}
      {screen === "management" && <ManagementScreen onNavigate={setScreen} />}
      {screen === "ia" && (userProfile.role === "admin" || userProfile.role === "manager") && <AsesorIAScreen products={products} showNotification={showNotification} />}
      {screen === "tasks" && <TasksScreen userProfile={userProfile} employees={employees} showNotification={showNotification} />}
      {screen === "sugerencias" && <SugerenciasScreen userProfile={userProfile} showNotification={showNotification} />}
      {screen === "schedule" && <ShiftPlanningScreen employees={employees} rotationConfig={rotationConfig} setRotationConfig={setRotationConfig} showNotification={showNotification} />}
      {screen === "vacation" && <VacationPlanningScreen employees={employees} updateEmployeeVacation={updateEmployeeVacation} userProfile={userProfile} vacationAssignments={vacationAssignments} signVacationAssignment={signVacationAssignment} />}
      {screen === "assignVacations" && <AssignVacationsScreen employees={employees} vacationAssignments={vacationAssignments} addVacationAssignment={addVacationAssignment} deleteVacationAssignment={deleteVacationAssignment} />}
      {screen === "miHorario" && <ConsultarHorarioScreen employees={employees} userProfile={userProfile} shiftTemplates={shiftTemplates} rotationConfig={rotationConfig} pastryTemplates={pastryTemplates} />}
      {screen === "fichar" && <FicharScreen userProfile={userProfile} employees={employees} shiftTemplates={shiftTemplates} rotationConfig={rotationConfig} pastryTemplates={pastryTemplates} showNotification={showNotification} />}
      {screen === "shiftConfig" && <ShiftConfigScreen shiftTemplates={shiftTemplates} setShiftTemplates={setShiftTemplates} pastryTemplates={pastryTemplates} setPastryTemplates={setPastryTemplates} rotationConfig={rotationConfig} showNotification={showNotification} />}
      {screen === "users" && <UserManagementScreen userProfile={userProfile} employees={employees} />}
      {screen === "firebase" && <FirebaseConfigScreen />}

      {selectedEmployee && <EmployeeDetailModal employee={selectedEmployee} onClose={() => setSelectedEmployee(null)} updateEmployee={updateEmployee} removeEmployee={removeEmployee} />}
      {selectedProduct && <ProductDetailModal product={selectedProduct} onClose={() => setSelectedProduct(null)} updateProduct={updateProduct} />}
      {modalOpen === "addProduct" && <AddProductModal onClose={() => setModalOpen(null)} addProduct={addProduct} />}
      {modalOpen === "addEmployee" && <AddEmployeeModal onClose={() => setModalOpen(null)} addEmployee={addEmployee} />}
      {notification.msg && <div className={`notification ${notification.type === "error" ? "error" : notification.type === "warning" ? "warning" : ""}`}>{notification.msg}</div>}
    </div>
  );
}

// ─── Inject CSS ───────────────────────────────────────────────────────────────
if (typeof document !== "undefined" && !document.getElementById("pardilla-styles")) {
  const styleTag = document.createElement("style");
  styleTag.id = "pardilla-styles";
  styleTag.textContent = styles;
  document.head.appendChild(styleTag);
}

// ─── ERROR BOUNDARY (v6.0) ────────────────────────────────────────────────────
class ErrorBoundary extends Component {
  constructor(props) { super(props); this.state = { error: null }; }
  static getDerivedStateFromError(error) { return { error }; }
  componentDidCatch(error, info) { console.error("ErrorBoundary:", error, info); }
  render() {
    if (this.state.error) {
      return (
        <div className="login-screen"><div className="login-card">
          <div className="login-logo"><div className="icon">🥐</div><h2>Algo ha fallado</h2></div>
          <p style={{ fontSize: 13, color: "#666", marginBottom: 16 }}>Se ha producido un error inesperado. Tus datos están a salvo en la nube; recarga para continuar.</p>
          <pre style={{ fontSize: 11, background: "#f5f5f5", padding: 10, borderRadius: 8, overflow: "auto", maxHeight: 120, marginBottom: 16 }}>{String(this.state.error)}</pre>
          <button className="btn btn-primary" style={{ width: "100%" }} onClick={() => window.location.reload()}>Recargar aplicación</button>
        </div></div>
      );
    }
    return this.props.children;
  }
}

export default function App() { return <ErrorBoundary><AppInner /></ErrorBoundary>; }
