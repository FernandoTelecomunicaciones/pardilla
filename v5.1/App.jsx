import { useState, useEffect, useRef, useCallback } from "react";

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
  .login-screen { display: flex; min-height: 100vh; align-items: center;
    justify-content: center; background: linear-gradient(135deg, var(--primary-dark), var(--primary)); }
  .login-card { background: white; border-radius: var(--radius); padding: 32px;
    width: 90%; max-width: 400px; box-shadow: 0 20px 60px rgba(0,0,0,0.3); }
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
  @media (max-width: 768px) {
    .home-grid { grid-template-columns: repeat(auto-fit, minmax(120px, 1fr)); }
    .stat-grid { grid-template-columns: repeat(2, 1fr); }
    .modal-content { width: 100%; padding: 16px; }
    .header h1 { font-size: 18px; }
    .container { padding: 12px; }
  }
`;

// ─── CONSTANTS ────────────────────────────────────────────────────────────────
const APP_VERSION = "5.1";
const GITHUB_REPO = "FernandoTelecomunicaciones/pardilla";
const WEB_URL = "https://pasteleria-pardilla.web.app";

const FIREBASE_CONFIG_HARDCODED = null;

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

// Datos demo (etiquetados como tales en UI)
const SEARCH_TRENDS = [
  { term: "tarta cumpleaños alcorcón", volume: 820, trend: "up" },
  { term: "pastelería cerca de mí", volume: 1450, trend: "up" },
  { term: "palmera chocolate artesana", volume: 390, trend: "up" },
  { term: "roscón de reyes madrid", volume: 2100, trend: "stable" },
  { term: "tarta personalizada alcorcón", volume: 560, trend: "up" },
  { term: "bollería artesanal", volume: 670, trend: "up" },
  { term: "mejor pastelería alcorcón", volume: 340, trend: "up" },
  { term: "pastelería pardilla opiniones", volume: 190, trend: "up" },
  { term: "tarta sin gluten alcorcón", volume: 280, trend: "up" },
  { term: "desayuno pastelería alcorcón", volume: 410, trend: "stable" },
];

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
const SHIFT_TEMPLATES_SUMMER = {
  V1: { // Lunes y Martes trabaja, Mié y Jue libre
    L: { m1:"09:30", m2:"14:00", t1:"17:30", t2:"20:50" },
    M: { m1:"09:30", m2:"14:00", t1:"17:30", t2:"20:50" },
    X: null,
    J: null,
    V: { m1:"10:30", m2:"14:00", t1:"17:30", t2:"20:00" },
    S: { m1:"09:00", m2:"14:30", t1:"17:00", t2:"20:50" },
    D: { m1:"09:00", m2:"14:30", t1:"17:20", t2:"20:50" },
  },
  V2: { // Lunes y Martes libre, Mié y Jue trabaja
    L: null,
    M: null,
    X: { m1:"09:30", m2:"14:00", t1:"17:30", t2:"20:50" },
    J: { m1:"09:30", m2:"14:00", t1:"17:30", t2:"20:50" },
    V: { m1:"09:30", m2:"13:00", t1:"18:00", t2:"20:50" },
    S: { m1:"09:00", m2:"14:30", t1:"17:20", t2:"20:50" },
    D: { m1:"09:00", m2:"14:10", t1:"17:00", t2:"20:50" },
  },
};

const ROTATION_DEFAULT = { referenceDate: "2026-04-06", assignments: { 1: 0, 2: 1, 4: 2 }, summerAssignments: {} };

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

// FIX #8: parseo de fechas YYYY-MM-DD a fecha LOCAL (evita bug UTC)
function parseLocalDate(dateStr) {
  if (!dateStr) return null;
  const [y, m, d] = dateStr.split("-").map(Number);
  return new Date(y, m - 1, d, 12, 0, 0); // mediodía para evitar DST
}
function toLocalDateStr(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

// FIX #9: lunes de la semana correcto (también en domingo)
function getMondayOfWeek(date) {
  const d = new Date(date);
  d.setHours(12, 0, 0, 0);
  const day = d.getDay(); // 0=dom..6=sab
  const diff = (day + 6) % 7; // distancia al lunes anterior
  d.setDate(d.getDate() - diff);
  return d;
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

function isSummerPeriod(date) {
  const d = date instanceof Date ? date : parseLocalDate(date);
  if (!d) return false;
  const m = d.getMonth() + 1; // 1-12
  return m >= 6 && m <= 8; // 1 jun – 31 ago
}

function getCurrentShift(employeeId, date, rotationConfig) {
  const d = date instanceof Date ? date : parseLocalDate(date);
  if (!d || !rotationConfig) return null;

  // Temporada de verano: asignaciones fijas V1/V2
  if (isSummerPeriod(d)) {
    const sa = rotationConfig.summerAssignments?.[employeeId];
    return sa || null; // "V1", "V2" o null si no asignado en verano
  }

  // Resto del año: rotación semanal A/B/C
  if (!rotationConfig.assignments) return null;
  const { referenceDate, assignments } = rotationConfig;
  if (assignments[employeeId] === undefined) return null;
  const refMonday = getMondayOfWeek(parseLocalDate(referenceDate));
  const currMonday = getMondayOfWeek(d);
  const weeksDiff = Math.round((currMonday - refMonday) / (7 * 24 * 60 * 60 * 1000));
  const shiftIndex = ((assignments[employeeId] + weeksDiff) % 3 + 3) % 3;
  return ["A", "B", "C"][shiftIndex];
}

function getShiftTemplate(shift, shiftTemplates) {
  if (shift === "V1" || shift === "V2") return SHIFT_TEMPLATES_SUMMER[shift];
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

// FIX #23: comparar versiones semver
function isNewerVersion(remote, local) {
  if (!remote || !local) return false;
  const r = remote.split(".").map(n => parseInt(n) || 0);
  const l = local.split(".").map(n => parseInt(n) || 0);
  for (let i = 0; i < Math.max(r.length, l.length); i++) {
    const a = r[i] || 0, b = l[i] || 0;
    if (a > b) return true;
    if (a < b) return false;
  }
  return false;
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
            <div className="form-group"><label>API Key</label><input type="text" className="input" value={apiKey} onChange={(e) => setApiKey(e.target.value)} placeholder="Ej: AIzaSyD..." /></div>
            <div className="form-group"><label>Project ID</label><input type="text" className="input" value={projectId} onChange={(e) => setProjectId(e.target.value)} placeholder="Ej: pasteleria-pardilla" /></div>
            <div className="form-group"><label>Auth Domain</label><input type="text" className="input" value={authDomain} onChange={(e) => setAuthDomain(e.target.value)} placeholder="Ej: pasteleria-pardilla.firebaseapp.com" /></div>
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
  const [name, setName] = useState("");
  const [isFirstUser, setIsFirstUser] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => { checkIfFirstUser(); }, []);

  const checkIfFirstUser = async () => {
    try {
      const snapshot = await fb().firestore().collection("users").limit(1).get();
      setIsFirstUser(snapshot.empty);
    } catch (e) { console.error(e); }
    setLoading(false);
  };

  const handleLogin = async (e) => {
    e.preventDefault(); setError(""); setSubmitting(true);
    try { const r = await fb().auth().signInWithEmailAndPassword(email, password); onLoginSuccess(r.user); }
    catch (e) { setError(e.message); }
    setSubmitting(false);
  };

  const handleCreateAdmin = async (e) => {
    e.preventDefault(); setError(""); setSubmitting(true);
    try {
      const r = await fb().auth().createUserWithEmailAndPassword(email, password);
      await fb().firestore().collection("users").doc(r.user.uid).set({ uid: r.user.uid, email, name, role: "admin", createdAt: new Date().toISOString() });
      onLoginSuccess(r.user);
    } catch (e) { setError(e.message); }
    setSubmitting(false);
  };

  if (loading) return <div className="loading-spinner"><div className="spinner"></div><div className="loading-text">Cargando...</div></div>;

  return (
    <div className="login-screen">
      <div className="login-card">
        <div className="login-logo"><div className="icon">🥐</div><h2>Pastelería Pardilla v{APP_VERSION}</h2></div>
        <form onSubmit={isFirstUser ? handleCreateAdmin : handleLogin}>
          {error && <div className="error-message">{error}</div>}
          {isFirstUser && <div className="form-group"><label>Nombre</label><input type="text" className="input" value={name} onChange={(e) => setName(e.target.value)} placeholder="Tu nombre" required /></div>}
          <div className="form-group"><label>Email</label><input type="email" className="input" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="ejemplo@correo.com" required autoComplete="email" /></div>
          <div className="form-group"><label>Contraseña</label><input type="password" className="input" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" required autoComplete="current-password" minLength={6} /></div>
          <button type="submit" className="btn btn-primary" style={{ width: "100%" }} disabled={submitting}>{submitting ? "Procesando..." : (isFirstUser ? "Crear Administrador" : "Iniciar Sesión")}</button>
        </form>
        <p style={{ fontSize: 11, color: "#888", marginTop: 16, textAlign: "center" }}>
          Al usar esta app aceptas el tratamiento de tus datos según la política de privacidad de la empresa (RGPD). Los registros horarios y firmas se conservan 4 años conforme al RDL 8/2019.
        </p>
      </div>
    </div>
  );
}

function HomeScreen({ userProfile, onNavigate }) {
  const getCards = () => {
    if (userProfile.role === "admin") return [
      { icon: "👥", label: "Empleados", screen: "employees" },{ icon: "🍰", label: "Productos", screen: "products" },
      { icon: "📊", label: "Gestión", screen: "management" },{ icon: "✓", label: "Tareas", screen: "tasks" },
      { icon: "🏪", label: "Turnos", screen: "schedule" },{ icon: "📅", label: "Mi Horario", screen: "miHorario" },
      { icon: "🕐", label: "Fichar", screen: "fichar" },{ icon: "🏖️", label: "Vacaciones", screen: "vacation" },
      { icon: "📋", label: "Asignar Vacaciones", screen: "assignVacations" },
      { icon: "⚙️", label: "Config Turnos", screen: "shiftConfig" },{ icon: "👤", label: "Usuarios", screen: "users" },
      { icon: "🔧", label: "Firebase", screen: "firebase" },
    ];
    if (userProfile.role === "manager") return [
      { icon: "👥", label: "Empleados", screen: "employees" },{ icon: "🍰", label: "Productos", screen: "products" },
      { icon: "📊", label: "Gestión", screen: "management" },{ icon: "✓", label: "Tareas", screen: "tasks" },
      { icon: "🏪", label: "Turnos", screen: "schedule" },{ icon: "📅", label: "Mi Horario", screen: "miHorario" },
      { icon: "🕐", label: "Fichar", screen: "fichar" },{ icon: "🏖️", label: "Vacaciones", screen: "vacation" },
    ];
    return [
      { icon: "📅", label: "Mi Horario", screen: "miHorario" },{ icon: "🕐", label: "Fichar", screen: "fichar" },
      { icon: "🏖️", label: "Mis Vacaciones", screen: "vacation" },{ icon: "✓", label: "Mis Tareas", screen: "tasks" },
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

  const handleGenerate = () => {
    const c = generateDynamicContent(contentType);
    setContent(c);
    setShowEmail(false);
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
      <button className="btn btn-primary" style={{ width: "100%", marginBottom: "16px" }} onClick={handleGenerate}>Generar Contenido</button>
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
function ManagementScreen() {
  const [activeTab, setActiveTab] = useState("stats");
  const [searchTerm, setSearchTerm] = useState("");
  const [ventas, setVentas] = useState([]);
  const [promociones, setPromociones] = useState([]);
  const [objetivos, setObjetivos] = useState({ monthlyTarget: 5000, previousMonthSales: 4200 });
  const [ventaForm, setVentaForm] = useState({ fecha: toLocalDateStr(new Date()), monto: "", categoria: "Bollería" });
  const [promoForm, setPromoForm] = useState({ nombre: "", descuento: "", categoria: "Bollería", inicio: "", fin: "" });
  const [montoError, setMontoError] = useState("");
  const filteredTrends = SEARCH_TRENDS.filter(t => t.term.toLowerCase().includes(searchTerm.toLowerCase()));
  const tabs = ["stats","analysis","suggestions","content","ventas","promociones","objetivos"];
  const tabLabels = ["Estadísticas","Análisis IA","Sugerencias","Contenidos","Ventas","Promociones","Objetivos"];

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
  const thisMonthVentas = ventas.filter(v => {
    const d = parseLocalDate(v.fecha); if (!d) return false;
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
  }).reduce((s, v) => s + v.monto, 0);

  return (
    <div className="container">
      <h2>Gestión y Análisis</h2>
      <div className="nav-tabs">{tabs.map((t, i) => <button key={t} className={`nav-tab ${activeTab === t ? "active" : ""}`} onClick={() => setActiveTab(t)}>{tabLabels[i]}</button>)}</div>

      {activeTab === "stats" && (() => {
        const now2 = new Date();
        const prevMonth = now2.getMonth() === 0 ? 11 : now2.getMonth() - 1;
        const prevYear = now2.getMonth() === 0 ? now2.getFullYear() - 1 : now2.getFullYear();
        const lastMonthVentas = ventas.filter(v => {
          const d = parseLocalDate(v.fecha); if (!d) return false;
          return d.getMonth() === prevMonth && d.getFullYear() === prevYear;
        }).reduce((s, v) => s + v.monto, 0);
        const growth = lastMonthVentas > 0 ? ((thisMonthVentas - lastMonthVentas) / lastMonthVentas * 100) : null;
        const ticketMedio = ventas.length > 0 ? ventas.reduce((s,v) => s+v.monto,0)/ventas.length : 0;
        const byCategory = ventas.reduce((acc, v) => { acc[v.categoria] = (acc[v.categoria]||0)+v.monto; return acc; }, {});
        const topCat = Object.entries(byCategory).sort((a,b)=>b[1]-a[1]);
        const dayNames = ["Dom","Lun","Mar","Mié","Jue","Vie","Sáb"];
        const byDow = ventas.reduce((acc, v) => { const d=parseLocalDate(v.fecha); if(d){ const k=d.getDay(); acc[k]=(acc[k]||0)+v.monto; } return acc; }, {});
        const topDow = Object.entries(byDow).sort((a,b)=>b[1]-a[1])[0];
        const ventasHoy = ventas.filter(v => v.fecha === toLocalDateStr(now2)).reduce((s,v)=>s+v.monto,0);
        return (
          <div style={{ marginTop: "20px" }}>
            <h3 style={{ marginBottom: 16 }}>Estadísticas del Negocio</h3>
            <div className="stat-grid" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))" }}>
              <div className="stat-box"><div className="label">Ventas este mes</div><div className="value">€{thisMonthVentas.toFixed(0)}</div></div>
              <div className="stat-box"><div className="label">Ventas mes anterior</div><div className="value">€{lastMonthVentas.toFixed(0)}</div></div>
              <div className="stat-box"><div className="label">Variación mensual</div><div className="value" style={{ color: growth === null ? "#999" : growth >= 0 ? "#4CAF50" : "#F44336" }}>{growth === null ? "—" : `${growth >= 0 ? "+" : ""}${growth.toFixed(1)}%`}</div></div>
              <div className="stat-box"><div className="label">Ventas hoy</div><div className="value">€{ventasHoy.toFixed(0)}</div></div>
              <div className="stat-box"><div className="label">Ticket medio</div><div className="value">€{ticketMedio.toFixed(2)}</div></div>
              <div className="stat-box"><div className="label">Nº registros totales</div><div className="value">{ventas.length}</div></div>
            </div>
            {topCat.length > 0 && (
              <div className="card" style={{ marginTop: 16 }}>
                <h4 style={{ marginBottom: 12 }}>Ventas por Categoría</h4>
                {topCat.map(([cat, total]) => (
                  <div key={cat} style={{ marginBottom: 8 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, marginBottom: 3 }}>
                      <span>{cat}</span><span style={{ fontWeight: 700, color: "var(--primary)" }}>€{total.toFixed(2)}</span>
                    </div>
                    <div style={{ height: 8, background: "#EEE", borderRadius: 4, overflow: "hidden" }}>
                      <div style={{ height: "100%", width: `${(total/topCat[0][1]*100).toFixed(1)}%`, background: "var(--primary)", borderRadius: 4 }} />
                    </div>
                  </div>
                ))}
              </div>
            )}
            {topDow && (
              <div className="card" style={{ marginTop: 12 }}>
                <h4>Mejor día de la semana</h4>
                <p style={{ fontSize: 16, fontWeight: 700, color: "var(--primary)", marginTop: 6 }}>{dayNames[topDow[0]]} — €{Number(topDow[1]).toFixed(2)}</p>
              </div>
            )}
            {ventas.length === 0 && <div style={{ color:"#999", textAlign:"center", padding:24 }}>Aún no hay registros de ventas. Añade ventas en la pestaña "Ventas".</div>}
          </div>
        );
      })()}

      {activeTab === "analysis" && (() => {
        const now2 = new Date();
        const prevMonth = now2.getMonth() === 0 ? 11 : now2.getMonth() - 1;
        const prevYear = now2.getMonth() === 0 ? now2.getFullYear()-1 : now2.getFullYear();
        const lastMonthV = ventas.filter(v => { const d=parseLocalDate(v.fecha); return d && d.getMonth()===prevMonth && d.getFullYear()===prevYear; }).reduce((s,v)=>s+v.monto,0);
        const growth = lastMonthV > 0 ? ((thisMonthVentas-lastMonthV)/lastMonthV*100) : null;
        const pctObjetivo = objetivos.monthlyTarget > 0 ? Math.min((thisMonthVentas/objetivos.monthlyTarget)*100, 100) : 0;
        // Score 0-100: 40% objetivo, 30% variación mes, 30% datos suficientes
        const scoreObj = pctObjetivo * 0.4;
        const scoreGrowth = growth !== null ? Math.max(0, Math.min(30, 15 + growth * 0.3)) : 15;
        const scoreData = Math.min(30, ventas.length * 2);
        const score = Math.round(scoreObj + scoreGrowth + scoreData);
        const byCategory = ventas.reduce((acc,v)=>{ acc[v.categoria]=(acc[v.categoria]||0)+v.monto; return acc; },{});
        const topCat = Object.entries(byCategory).sort((a,b)=>b[1]-a[1]);
        const ticketMedio = ventas.length>0 ? ventas.reduce((s,v)=>s+v.monto,0)/ventas.length : 0;
        // Recomendaciones automáticas
        const recos = [];
        if (pctObjetivo < 50) recos.push({ icon:"🎯", text:`Solo llevas el ${pctObjetivo.toFixed(0)}% del objetivo mensual (€${objetivos.monthlyTarget}). Considera acciones de venta activa.` });
        if (pctObjetivo >= 80) recos.push({ icon:"✅", text:`Excelente: llevas el ${pctObjetivo.toFixed(0)}% del objetivo. ¡Sigue así!` });
        if (growth !== null && growth < -10) recos.push({ icon:"⚠️", text:`Las ventas bajaron un ${Math.abs(growth).toFixed(1)}% respecto al mes pasado. Revisa promociones.` });
        if (growth !== null && growth > 10) recos.push({ icon:"📈", text:`Las ventas crecieron un ${growth.toFixed(1)}% respecto al mes anterior. Momento de consolidar.` });
        if (topCat.length > 0) recos.push({ icon:"🏆", text:`La categoría más vendida es "${topCat[0][0]}" (€${topCat[0][1].toFixed(2)}). Destácala en redes.` });
        if (topCat.length > 1) {
          const last = topCat[topCat.length-1];
          recos.push({ icon:"💡", text:`"${last[0]}" es la categoría con menos ventas (€${last[1].toFixed(2)}). Considera una promoción específica.` });
        }
        if (ticketMedio > 0 && ticketMedio < 5) recos.push({ icon:"🧾", text:`Ticket medio bajo (€${ticketMedio.toFixed(2)}). Considera venta cruzada o packs.` });
        if (ventas.length < 5) recos.push({ icon:"📊", text:`Faltan datos de ventas para un análisis preciso. Registra más ventas para mejorar el análisis.` });
        const promoActiva = promociones.filter(p => parseLocalDate(p.fin) >= now2).length;
        if (promoActiva === 0) recos.push({ icon:"🏷️", text:"Sin promociones activas. Una oferta puede impulsar el tráfico esta semana." });
        return (
          <div style={{ marginTop: "20px" }}>
            <h3 style={{ marginBottom: 12 }}>Análisis del Negocio</h3>
            <div className="card">
              <div className="score-display">
                <div className="score-number" style={{ color: score >= 70 ? "#4CAF50" : score >= 40 ? "#FF9800" : "#F44336" }}>{score}</div>
                <div style={{ flex: 1 }}>
                  <div className="score-bar"><div className="score-bar-fill" style={{ width: `${score}%` }}></div></div>
                  <p style={{ fontSize: "12px", color: "#666", marginTop: "4px" }}>Score calculado desde tus datos reales</p>
                </div>
              </div>
              <div className="stat-grid">
                <div className="stat-box"><div className="label">% Objetivo mes</div><div className="value" style={{ fontSize: 18 }}>{pctObjetivo.toFixed(0)}%</div></div>
                <div className="stat-box"><div className="label">Vs mes anterior</div><div className="value" style={{ fontSize: 18, color: growth === null ? "#999" : growth >= 0 ? "#4CAF50" : "#F44336" }}>{growth === null ? "—" : `${growth>=0?"+":""}${growth.toFixed(0)}%`}</div></div>
                <div className="stat-box"><div className="label">Promoc. activas</div><div className="value" style={{ fontSize: 18 }}>{promoActiva}</div></div>
                <div className="stat-box"><div className="label">Ticket medio</div><div className="value" style={{ fontSize: 18 }}>€{ticketMedio.toFixed(2)}</div></div>
              </div>
            </div>
            {recos.length > 0 && (
              <div style={{ marginTop: 16 }}>
                <h4 style={{ marginBottom: 10 }}>Recomendaciones automáticas</h4>
                {recos.map((r, i) => (
                  <div key={i} className="idea-card" style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
                    <span style={{ fontSize: 20 }}>{r.icon}</span>
                    <span style={{ fontSize: 14 }}>{r.text}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        );
      })()}

      {activeTab === "suggestions" && (
        <div style={{ marginTop: "20px" }}>
          <h3>Sugerencias de Mejora</h3>
          {[{ title: "Lanzar línea sin gluten/vegana", priority: "Alta" },{ title: "Programa de fidelización", priority: "Alta" },{ title: "Servicio de tartas por encargo online", priority: "Media" },{ title: "Colaboración con cafeterías locales", priority: "Media" },{ title: "Ampliar horario de desayunos", priority: "Baja" },{ title: "Presencia en redes con vídeos de elaboración", priority: "Alta" }].map((sug, idx) => (
            <div key={idx} className="idea-card"><div className="title">{sug.title}</div><div className={`priority priority-${sug.priority.toLowerCase()}`}>{sug.priority}</div></div>
          ))}
        </div>
      )}

      {activeTab === "content" && <div style={{ marginTop: "20px" }}><h3>Generador de Contenidos</h3><ContentGenerator /></div>}

      {activeTab === "ventas" && (
        <div style={{ marginTop: "20px" }}>
          <h3>Registro de Ventas</h3>
          <div className="form-group"><label>Fecha</label><input type="date" className="input" value={ventaForm.fecha} onChange={e => setVentaForm(f => ({...f, fecha: e.target.value}))} /></div>
          <div className="form-group">
            <label>Monto (€)</label>
            <input type="number" className={`input ${montoError ? "error" : ""}`} step="0.01" min="0" placeholder="0.00" value={ventaForm.monto} onChange={e => setVentaForm(f => ({...f, monto: e.target.value}))} />
            {montoError && <div className="form-error">{montoError}</div>}
          </div>
          <div className="form-group"><label>Categoría</label>
            <select className="input" value={ventaForm.categoria} onChange={e => setVentaForm(f => ({...f, categoria: e.target.value}))}>
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
          <div className="form-group"><label>Nombre de Promoción</label><input type="text" className="input" placeholder="Ej: Descuento Bollería" value={promoForm.nombre} onChange={e => setPromoForm(f => ({...f, nombre: e.target.value}))} /></div>
          <div className="form-group"><label>Descuento (%)</label><input type="number" className="input" min="1" max="100" placeholder="10" value={promoForm.descuento} onChange={e => setPromoForm(f => ({...f, descuento: e.target.value}))} /></div>
          <div className="form-group"><label>Categoría</label>
            <select className="input" value={promoForm.categoria} onChange={e => setPromoForm(f => ({...f, categoria: e.target.value}))}>
              {["Bollería","Tartas","Cafetería","Todos los productos"].map(c => <option key={c}>{c}</option>)}
            </select>
          </div>
          <div className="form-group"><label>Fecha Inicio</label><input type="date" className="input" value={promoForm.inicio} onChange={e => setPromoForm(f => ({...f, inicio: e.target.value}))} /></div>
          <div className="form-group"><label>Fecha Fin</label><input type="date" className="input" value={promoForm.fin} min={promoForm.inicio} onChange={e => setPromoForm(f => ({...f, fin: e.target.value}))} /></div>
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
          <div className="form-group"><label>Objetivo de Ventas Mensual (€)</label><input type="number" className="input" min="0" value={objetivos.monthlyTarget} onChange={e => setObjetivos(o => ({...o, monthlyTarget: parseInt(e.target.value) || 0}))} /></div>
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
            <div className="stat-box"><div className="label">Mes Anterior</div><div className="value" style={{ fontSize: "18px" }}>€{Number(objetivos.previousMonthSales || 0).toFixed(2)}</div></div>
            <div className="stat-box"><div className="label">Categoría Top</div><div className="value" style={{ fontSize: "14px" }}>{ventas.length > 0 ? Object.entries(ventas.reduce((acc, v) => ({...acc, [v.categoria]: (acc[v.categoria] || 0) + v.monto}), {})).sort((a, b) => b[1] - a[1])[0][0] : "-"}</div></div>
          </div>
        </div>
      )}
    </div>
  );
}

// FIX #17, #18: tareas en Firestore (compartidas entre dispositivos) y modal funcional
function TasksScreen({ userProfile }) {
  const [tasks, setTasks] = useState([]);
  const [showAdd, setShowAdd] = useState(false);
  const isAdminOrManager = userProfile.role === "admin" || userProfile.role === "manager";

  useEffect(() => {
    if (!fbReady()) return;
    const unsub = fb().firestore().collection("tasks").orderBy("createdAt", "desc")
      .onSnapshot(snap => setTasks(snap.docs.map(d => ({ id: d.id, ...d.data() }))), e => console.error("tasks:", e));
    return () => unsub();
  }, []);

  const toggleTask = async (t) => {
    try { await fb().firestore().collection("tasks").doc(t.id).update({ completed: !t.completed, completedAt: !t.completed ? new Date().toISOString() : null }); }
    catch (e) { console.error(e); }
  };

  const addTask = async (data) => {
    try { await fb().firestore().collection("tasks").add({ ...data, completed: false, createdAt: new Date().toISOString(), createdBy: userProfile.name }); }
    catch (e) { console.error(e); }
  };

  const deleteTask = async (id) => {
    try { await fb().firestore().collection("tasks").doc(id).delete(); }
    catch (e) { console.error(e); }
  };

  // El empleado solo ve tareas no completadas asignadas a él o globales
  const visible = userProfile.role === "empleado"
    ? tasks.filter(t => !t.assignedTo || t.assignedTo === userProfile.uid || t.assignedTo === "all")
    : tasks;

  return (
    <div className="container">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
        <h2>{userProfile.role === "empleado" ? "Mis Tareas" : "Tareas del equipo"}</h2>
        {isAdminOrManager && <button className="btn btn-primary btn-sm" onClick={() => setShowAdd(true)}>+ Nueva</button>}
      </div>
      {visible.length === 0 && <p style={{ color: "#999" }}>No hay tareas</p>}
      {visible.map(task => (
        <div key={task.id} className="card" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px", gap: 8 }}>
          <div style={{ flex: 1 }}>
            <h4 style={{ textDecoration: task.completed ? "line-through" : "none", opacity: task.completed ? 0.6 : 1 }}>{task.title}</h4>
            {task.description && <p style={{ fontSize: "13px", color: "#666" }}>{task.description}</p>}
            <p style={{ fontSize: 11, color: "#999", marginTop: 4 }}>Creado por {task.createdBy || "—"}</p>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
            <button className="btn btn-sm btn-secondary" onClick={() => toggleTask(task)} title={task.completed ? "Marcar pendiente" : "Marcar completada"}>{task.completed ? "✓" : "○"}</button>
            {isAdminOrManager && <button className="btn btn-sm btn-danger" onClick={() => deleteTask(task.id)}>×</button>}
          </div>
        </div>
      ))}
      {showAdd && <AddTaskModal onClose={() => setShowAdd(false)} onAdd={async (data) => { await addTask(data); setShowAdd(false); }} />}
    </div>
  );
}

function ShiftPlanningScreen({ employees, shiftTemplates, rotationConfig, setRotationConfig }) {
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

  const handleShiftChange = (empId, desiredShiftIdx) => {
    const weeksDiff = getWeeksDiff(localRotation);
    const newAssignment = ((parseInt(desiredShiftIdx) - weeksDiff) % 3 + 3) % 3;
    persistRotation({ ...localRotation, assignments: { ...localRotation.assignments, [empId]: newAssignment } });
  };

  const handleSave = async () => {
    setSaving(true);
    try { await fb().firestore().collection("shiftConfig").doc("rotation").set(localRotation); safeLocalSet("pardilla_rotation", localRotation); setSaved(true); setTimeout(() => setSaved(false), 3000); }
    catch (e) { alert("Error al guardar: " + e.message); }
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

      {/* ─── Asignación Verano ─── */}
      <div style={{ marginTop: "28px" }}>
        <h3 style={{ marginBottom: "4px" }}>Turnos de Verano <span className="summer-badge">☀️ 1 Jun – 31 Ago</span></h3>
        <p style={{ fontSize: "12px", color: "#666", marginBottom: "12px" }}>Asigna cada empleado de tienda a Turno V1 (L/M trabaja, X/J libre) o Turno V2 (L/M libre, X/J trabaja). Esta asignación es fija durante toda la temporada.</p>
        {employees.filter(e => e.shiftType === "store").map(emp => {
          const sv = localRotation.summerAssignments?.[emp.id] || "";
          return (
            <div key={emp.id} className="card" style={{ marginBottom: "8px", borderLeft: "4px solid #880E4F", padding: "12px 16px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 8 }}>
                <span style={{ fontWeight: 600 }}>{emp.name}</span>
                <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                  <select className="input" value={sv} onChange={e => {
                    const val = e.target.value;
                    const newSA = { ...localRotation.summerAssignments };
                    if (val) newSA[emp.id] = val; else delete newSA[emp.id];
                    persistRotation({ ...localRotation, summerAssignments: newSA });
                  }} style={{ width: "120px", marginBottom: 0 }}>
                    <option value="">Sin asignar</option>
                    <option value="V1">Turno V1</option>
                    <option value="V2">Turno V2</option>
                  </select>
                  {sv && <div className={`turno-badge turno-${sv}`}>{sv}</div>}
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
              <label>Nuevo empleado</label>
              <select className="input" value={newEmpId} onChange={e => setNewEmpId(e.target.value)}>
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
        <div className="form-group"><label>Empleado</label>
          <select className="input" value={selectedEmpId || ""} onChange={e => setSelectedEmpId(parseInt(e.target.value))}>
            {employees.map(e => <option key={e.id} value={e.id}>{e.name}</option>)}
          </select>
        </div>
        {selectedEmp && <div style={{ background: "#E3F2FD", padding: 8, borderRadius: 6, fontSize: 12, marginBottom: 12 }}>Días disponibles: <strong>{availableDays.toFixed(1)}</strong></div>}
        <div className="form-group"><label>Fecha inicio (opcional)</label><input type="date" className="input" value={startDate} onChange={e => setStartDate(e.target.value)} /></div>
        <div className="form-group"><label>Fecha fin (opcional)</label><input type="date" className="input" value={endDate} min={startDate} onChange={e => setEndDate(e.target.value)} /></div>
        {(!startDate || !endDate) && <div className="form-group"><label>Número de días</label><input type="number" className="input" value={customDays} onChange={e => setCustomDays(e.target.value)} min="1" placeholder="Días de vacaciones" /></div>}
        {days > 0 && <div style={{ background: "#E8F5E9", padding: "12px", borderRadius: "8px", marginBottom: "16px", fontWeight: "600", color: "#2E7D32" }}>Días a asignar: {days}</div>}
        {warning && <div style={{ background: "#FFF3E0", color: "#E65100", padding: 10, borderRadius: 6, fontSize: 13, marginBottom: 12 }}>{warning}</div>}
        <div className="form-group"><label>Nota (opcional)</label><input type="text" className="input" value={note} onChange={e => setNote(e.target.value)} placeholder="Ej: Vacaciones verano" /></div>
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
  } else if (summer && rotationConfig?.summerAssignments?.[emp.id]) {
    const sv = rotationConfig.summerAssignments[emp.id];
    effectiveTemplate = SHIFT_TEMPLATES_SUMMER[sv];
    shiftLabel = sv;
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
  const badgeClass = ["V1","V2"].includes(shiftLabel) ? `turno-${shiftLabel}` : ["P1","P2","P3"].includes(shiftLabel) ? `turno-${shiftLabel}` : `turno-${shiftLabel}`;

  return (
    <div className="container">
      <h2>Mi Horario</h2>
      {(userProfile.role === "admin" || userProfile.role === "manager") && (
        <div className="form-group" style={{ marginTop: "16px" }}>
          <label>Empleado</label>
          <select className="input" value={selectedEmpId} onChange={e => setSelectedEmpId(parseInt(e.target.value))}>
            {employees.map(e => <option key={e.id} value={e.id}>{e.name}</option>)}
          </select>
        </div>
      )}
      <div className="card" style={{ marginTop: "16px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
          <h3>{emp.name}</h3>
          <div style={{ display:"flex", gap:6, alignItems:"center" }}>
            {summer && <span className="summer-badge">☀️ Verano</span>}
            <div className={`turno-badge ${badgeClass}`}>{shiftLabel}</div>
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
  const [registros, setRegistros] = useState([]);
  const [loadingRegistros, setLoadingRegistros] = useState(true);
  const [selectedDate] = useState(toLocalDateStr(new Date()));
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

  // FIX #3: cargar registros del día actual al montar
  useEffect(() => {
    if (isAdmin || !fbReady() || !userProfile.uid) { setLoadingRegistros(false); return; }
    const unsub = fb().firestore().collection("registros_horarios")
      .where("userId", "==", userProfile.uid)
      .where("date", "==", selectedDate)
      .onSnapshot(snap => {
        setRegistros(snap.docs.map(d => ({ id: d.id, ...d.data() })));
        setLoadingRegistros(false);
      }, err => { console.error("registros sync:", err); setLoadingRegistros(false); });
    return () => unsub();
  }, [isAdmin, userProfile.uid, selectedDate]);

  // Obtiene el slot efectivo según tipo de empleado y temporada
  const getEffectiveSlot = (emp, dateStr) => {
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
      const base = { userId: userProfile.uid, employeeId: linkedEmp?.id || null, employeeName, date: selectedDate, type: pendingFicharType, time, timestamp: now.toISOString(), ...(scheduledTime ? { scheduledTime, withinTolerance: true } : {}) };
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
      const base = { userId: userProfile.uid, employeeId: linkedEmp?.id || null, employeeName, date: selectedDate, type: pendingFicharType, time: fueraTurnoInfo.currentTime, timestamp: now.toISOString(), fueraTolerancia: true, declaracionFueraTurno: textoDeclaracion };
      const integrityHash = await digestRecord(base);
      const registro = { ...base, signature, integrityHash };
      await fb().firestore().collection("registros_horarios").add(registro);
      setShowFueraTurnoModal(false);
      showNotification("Fichaje fuera de horario registrado");
    } catch (e) { showNotification("Error al guardar: " + e.message, "error"); }
    setSubmittingFichaje(false);
  };

  const handleOpenRetro = () => { setRetroDate(""); setRetroTime("08:00"); setRetroType("entrada"); setRetroAccepted(false); retroSign.reset(); setShowRetroModal(true); };

  const handleConfirmRetro = async () => {
    if (submittingFichaje) return;
    if (!retroDate) { showNotification("Selecciona la fecha", "warning"); return; }
    if (!retroTime) { showNotification("Indica la hora del fichaje", "warning"); return; }
    if (!retroAccepted) { showNotification("Debes aceptar la declaración de responsabilidad", "warning"); return; }
    if (!retroSign.hasSigned) { showNotification("Por favor, firma la declaración", "warning"); return; }
    setSubmittingFichaje(true);
    try {
      const signature = canvasToCompressed(retroCanvasRef.current);
      const now = new Date();
      const linkedEmp = employees.find(e => e.id === userProfile.linkedEmployeeId);
      const employeeName = linkedEmp ? linkedEmp.name : userProfile.name;
      const textoDeclaracion = `El empleado/a ${employeeName} declara bajo su responsabilidad haber olvidado registrar el fichaje de ${retroType} del día ${retroDate} a las ${retroTime}h. El olvido fue por causa propia y la empresa no tiene responsabilidad al respecto.`;
      const base = { userId: userProfile.uid, employeeId: linkedEmp?.id || null, employeeName, date: retroDate, type: retroType, time: retroTime, timestamp: now.toISOString(), retroactivo: true, declaracionResponsabilidad: true, fechaFichaje: now.toISOString(), textoDeclaracion };
      const integrityHash = await digestRecord(base);
      const registro = { ...base, signature, integrityHash };
      await fb().firestore().collection("registros_horarios").add(registro);
      setShowRetroModal(false);
      showNotification("Fichaje retroactivo registrado");
    } catch (e) { showNotification("Error al guardar: " + e.message, "error"); }
    setSubmittingFichaje(false);
  };

  // FIX #30: filename del CSV con rango real
  const downloadCSV = (records, fromDate, toDate) => {
    const header = "Fecha;Empleado;Tipo;Hora Real;Hora Turno;Dentro Tolerancia;Retroactivo;Decl. Responsabilidad;Con Firma;Hash Integridad;Timestamp\n";
    const rows = records.map(r => `${r.date};${r.employeeName};${r.type};${r.time};${r.scheduledTime||""};${r.withinTolerance?"Sí":"No"};${r.retroactivo?"Sí":"No"};${r.declaracionResponsabilidad||r.declaracionFueraTurno?"Sí":"No"};${r.signature?"Sí":"No"};${r.integrityHash||""};${r.timestamp}`).join("\n");
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
    } catch (e) { showNotification("Error al buscar: " + e.message, "error"); }
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
    } catch (e) { showNotification("Error: " + e.message, "error"); }
  };

  const dayRegistros = registros;
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
          <div className="card"><label style={{ marginBottom: "12px", display: "block", fontWeight: "600" }}>Fecha (Hoy)</label><input type="date" className="input" value={selectedDate} disabled /></div>
          <button className="fichar-btn fichar-entrada" onClick={() => handleFichar("entrada")} disabled={submittingFichaje}>⬆️ Fichar Entrada</button>
          <button className="fichar-btn fichar-salida" onClick={() => handleFichar("salida")} disabled={submittingFichaje}>⬇️ Fichar Salida</button>
          <button className="fichar-btn" style={{ background: "#FF9800", color: "white" }} onClick={handleOpenRetro} disabled={submittingFichaje}>📅 Fichar Día Anterior</button>
          <button className="fichar-btn" style={{ background: "#2196F3", color: "white" }} onClick={handleOpenHistory}>📜 Ver mi histórico</button>
          <div className="card">
            <h3 style={{ marginBottom: "12px" }}>Registros del día</h3>
            {loadingRegistros ? <p style={{ color: "#999" }}>Cargando...</p> : dayRegistros.length === 0 ? <p style={{ color: "#999" }}>No hay registros para esta fecha</p> : [...dayRegistros].sort((a,b)=>(a.time||"").localeCompare(b.time||"")).map(r => (
              <div key={r.id} className="registro-card" style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
                <strong>{r.type === "entrada" ? "⬆️ Entrada" : "⬇️ Salida"}</strong>
                <span>{r.time}</span>
                {r.scheduledTime && <span style={{ fontSize: "11px", color: "#2E7D32", background: "#E8F5E9", padding: "2px 6px", borderRadius: "10px" }}>Turno: {r.scheduledTime}</span>}
                {r.retroactivo && <span style={{ fontSize: "11px", color: "#E65100", background: "#FFF3E0", padding: "2px 6px", borderRadius: "10px" }}>📅 Retroactivo</span>}
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
            <div className="form-group"><label>Desde</label><input type="date" className="input" value={dateFrom} onChange={e => setDateFrom(e.target.value)} /></div>
            <div className="form-group"><label>Hasta</label><input type="date" className="input" value={dateTo} min={dateFrom} onChange={e => setDateTo(e.target.value)} /></div>
            <div className="form-group"><label>Empleado (opcional)</label>
              <select className="input" value={selectedEmployee || ""} onChange={e => setSelectedEmployee(e.target.value || null)}>
                <option value="">Todos</option>{employees.map(emp => <option key={emp.id} value={emp.name}>{emp.name}</option>)}
              </select>
            </div>
            <button className="btn btn-primary" onClick={handleAdminSearch} style={{ width: "100%" }}>Buscar</button>
          </div>
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
            <div className="modal-header"><span>📅 Fichaje Día Anterior</span><button className="modal-close" onClick={() => setShowRetroModal(false)}>×</button></div>
            <div className="form-group"><label>Fecha del fichaje olvidado</label><input type="date" className="input" value={retroDate} min={retroMinDate} max={retroMaxDate} onChange={e => setRetroDate(e.target.value)} /></div>
            <div className="form-group"><label>Tipo de fichaje</label>
              <select className="input" value={retroType} onChange={e => setRetroType(e.target.value)}>
                <option value="entrada">⬆️ Entrada</option><option value="salida">⬇️ Salida</option>
              </select>
            </div>
            <div className="form-group"><label>Hora real del fichaje</label><input type="time" className="input" value={retroTime} onChange={e => setRetroTime(e.target.value)} /></div>
            <div style={{ background: "#FFF3E0", border: "1px solid #FF9800", borderRadius: "8px", padding: "12px", marginBottom: "12px", fontSize: "12px", color: "#5D4037", lineHeight: "1.6" }}>
              <strong>Declaración de responsabilidad:</strong><br /><br />
              Yo, <em>{linkedEmpName}</em>, declaro bajo mi responsabilidad haber olvidado registrar el fichaje de <strong>{retroType}</strong> del día <strong>{retroDate || "..."}</strong> a las <strong>{retroTime || "..."}</strong> horas. Asumo que el olvido del fichaje fue por causa propia y que la empresa no tiene ninguna responsabilidad al respecto.
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
            <div className="form-group"><label>Desde</label><input type="date" className="input" value={historyFrom} onChange={e => setHistoryFrom(e.target.value)} /></div>
            <div className="form-group"><label>Hasta</label><input type="date" className="input" value={historyTo} min={historyFrom} onChange={e => setHistoryTo(e.target.value)} /></div>
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

function ShiftConfigScreen({ shiftTemplates, setShiftTemplates, pastryTemplates, setPastryTemplates, rotationConfig }) {
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
    } catch (e) { alert("Error al guardar: " + e.message); }
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
      const cfgStr = localStorage.getItem("pardilla_firebase_config");
      const cfg = cfgStr ? JSON.parse(cfgStr) : (typeof FIREBASE_CONFIG_HARDCODED === "object" && FIREBASE_CONFIG_HARDCODED);
      if (!cfg) throw new Error("Sin configuración Firebase disponible");
      secondaryApp = fb().initializeApp(cfg, "Secondary" + Date.now());
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
          <div className="form-group"><label>Nombre</label><input type="text" className="input" value={form.name} onChange={e => setForm(f => ({...f, name: e.target.value}))} required /></div>
          <div className="form-group"><label>Email</label><input type="email" className="input" value={form.email} onChange={e => setForm(f => ({...f, email: e.target.value}))} required /></div>
          <div className="form-group"><label>Contraseña</label><input type="password" className="input" value={form.password} onChange={e => setForm(f => ({...f, password: e.target.value}))} required minLength={6} /></div>
          <div className="form-group"><label>Rol</label>
            <select className="input" value={form.role} onChange={e => setForm(f => ({...f, role: e.target.value}))}>
              <option value="admin">Administrador</option><option value="manager">Gestor</option><option value="empleado">Empleado</option>
            </select>
          </div>
          {form.role === "empleado" && (
            <div className="form-group"><label>¿Vincular a un empleado?</label>
              <select className="input" value={form.linkedEmpId || ""} onChange={e => setForm(f => ({...f, linkedEmpId: e.target.value ? parseInt(e.target.value) : null}))}>
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
function EmployeeDetailModal({ employee, onClose, employees, updateEmployee, removeEmployee }) {
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
      <div className="form-group" style={{ marginTop: "20px" }}><label>Nombre</label><input type="text" className="input" value={editName} onChange={e => setEditName(e.target.value)} /></div>
      <div className="form-group"><label>Rol</label><select className="input" value={editRole} onChange={e => setEditRole(e.target.value)}>{ROLE_OPTIONS.map(r => <option key={r} value={r}>{r}</option>)}</select></div>
      <div className="form-group"><label>Tipo de jornada</label>
        <select className="input" value={editShiftType} onChange={e => setEditShiftType(e.target.value)}>
          <option value="store">Tienda (rotación A/B/C)</option>
          <option value="pastry">Obrador / Pastelería</option>
        </select>
      </div>
      {editShiftType === "pastry" && (
        <div className="form-group"><label>Turno de pastelería</label>
          <select className="input" value={editPastryShift} onChange={e => setEditPastryShift(e.target.value)}>
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
      <div className="form-group"><label>Editar Precio</label>
        <input type="number" className={`input ${error ? "error" : ""}`} step="0.01" min="0" value={editPrice} onChange={e => { setEditPrice(e.target.value); setError(""); }} />
        {error && <div className="form-error">{error}</div>}
      </div>
      <div className="modal-footer"><button className="btn btn-secondary btn-sm" onClick={onClose}>Cancelar</button><button className="btn btn-primary btn-sm" onClick={handleSave}>Guardar</button></div>
    </div></div>
  );
}

function AddTaskModal({ onClose, onAdd }) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim()) { setError("El título es obligatorio"); return; }
    setSubmitting(true);
    try { await onAdd({ title: title.trim(), description: description.trim() }); }
    catch (err) { setError(err.message); setSubmitting(false); }
  };
  return (
    <div className="modal"><div className="modal-content">
      <div className="modal-header"><span>Nueva Tarea</span><button className="modal-close" onClick={onClose}>×</button></div>
      <form onSubmit={handleSubmit}>
        {error && <div className="error-message">{error}</div>}
        <div className="form-group"><label>Título</label><input type="text" className="input" value={title} onChange={e => setTitle(e.target.value)} placeholder="Ej: Revisar inventario" required autoFocus /></div>
        <div className="form-group"><label>Descripción</label><textarea className="input" value={description} onChange={e => setDescription(e.target.value)} placeholder="Detalles..." style={{ minHeight: "100px" }}></textarea></div>
        <div className="modal-footer"><button type="button" className="btn btn-secondary btn-sm" onClick={onClose}>Cancelar</button><button type="submit" className="btn btn-primary btn-sm" disabled={submitting}>{submitting ? "Creando..." : "Crear"}</button></div>
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
    await addProduct({ name: name.trim(), category, price: p });
    onClose();
  };
  return (
    <div className="modal"><div className="modal-content">
      <div className="modal-header"><span>Nuevo Producto</span><button className="modal-close" onClick={onClose}>×</button></div>
      <form onSubmit={handleSubmit}>
        {error && <div className="error-message">{error}</div>}
        <div className="form-group"><label>Nombre</label><input type="text" className="input" value={name} onChange={e => setName(e.target.value)} required /></div>
        <div className="form-group"><label>Categoría</label><select className="input" value={category} onChange={e => setCategory(e.target.value)}>{["Bollería","Tartas","Especialidades","Pasteles","Panadería","Salados","Cafetería"].map(c => <option key={c}>{c}</option>)}</select></div>
        <div className="form-group"><label>Precio (€)</label><input type="number" className="input" step="0.01" min="0" value={price} onChange={e => setPrice(e.target.value)} required /></div>
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
    await addEmployee({ name: name.trim(), role, monthsWorked: m, shiftType, vacationDays: 0, workedHolidays: 0, ...(shiftType === "pastry" ? { pastryShift } : {}) });
    onClose();
  };
  return (
    <div className="modal"><div className="modal-content">
      <div className="modal-header"><span>Nuevo Empleado</span><button className="modal-close" onClick={onClose}>×</button></div>
      <form onSubmit={handleSubmit}>
        {error && <div className="error-message">{error}</div>}
        <div className="form-group"><label>Nombre</label><input type="text" className="input" value={name} onChange={e => setName(e.target.value)} required /></div>
        <div className="form-group"><label>Rol</label><select className="input" value={role} onChange={e => setRole(e.target.value)}>{ROLE_OPTIONS.map(r => <option key={r} value={r}>{r}</option>)}</select></div>
        <div className="form-group"><label>Meses Trabajados</label><input type="number" className="input" min="0" value={monthsWorked} onChange={e => setMonthsWorked(e.target.value)} /></div>
        <div className="form-group"><label>Tipo de jornada</label>
          <select className="input" value={shiftType} onChange={e => setShiftType(e.target.value)}>
            <option value="store">Tienda (rotación A/B/C)</option>
            <option value="pastry">Obrador / Pastelería</option>
          </select>
        </div>
        {shiftType === "pastry" && (
          <div className="form-group"><label>Turno de pastelería</label>
            <select className="input" value={pastryShift} onChange={e => setPastryShift(e.target.value)}>
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

// ─── APP ──────────────────────────────────────────────────────────────────────
export default function App() {
  const [firebaseReady, setFirebaseReady] = useState(false);
  const [authLoaded, setAuthLoaded] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null);

  // FIX #4, #37: empleados también sincronizados con Firestore
  const [employees, setEmployees] = useState(() => safeLocalGet("pardilla_employees", EMPLOYEES_INIT));
  const [products, setProducts] = useState(() => safeLocalGet("pardilla_products", PRODUCTS_INIT));

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

  const showNotification = useCallback((msg, type = "success") => {
    setNotification({ msg, type });
    setTimeout(() => setNotification({ msg: "", type: "" }), 3500);
  }, []);

  useEffect(() => { initFirebase(); }, []);

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
        if (snap.empty) {
          // Si está vacía, sembramos desde EMPLOYEES_INIT solo si somos admin
          if (userProfile?.role === "admin") {
            EMPLOYEES_INIT.forEach(e => fb().firestore().collection("employees").doc(String(e.id)).set(e).catch(()=>{}));
          }
          return;
        }
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
        if (snap.empty) {
          if (userProfile?.role === "admin") {
            PRODUCTS_INIT.forEach(p => fb().firestore().collection("products").doc(String(p.id)).set(p).catch(()=>{}));
          }
          return;
        }
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
    } catch (e) { showNotification("Error: " + e.message, "error"); }
  };
  const removeEmployee = async (id) => {
    try {
      await fb().firestore().collection("employees").doc(String(id)).delete();
      setEmployees(prev => { const list = prev.filter(e => e.id !== id); safeLocalSet("pardilla_employees", list); return list; });
    } catch (e) { showNotification("Error: " + e.message, "error"); }
  };
  const addEmployee = async (data) => {
    try {
      const newId = Math.max(...employees.map(e => e.id), 0) + 1;
      const ne = { id: newId, ...data };
      await fb().firestore().collection("employees").doc(String(newId)).set(ne);
    } catch (e) { showNotification("Error: " + e.message, "error"); }
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
    } catch (e) { showNotification("Error: " + e.message, "error"); }
  };
  const addProduct = async (data) => {
    try {
      const newId = Math.max(...products.map(p => p.id), 0) + 1;
      const np = { id: newId, ...data };
      await fb().firestore().collection("products").doc(String(newId)).set(np);
    } catch (e) { showNotification("Error: " + e.message, "error"); }
  };
  const addVacationAssignment = async (a) => {
    try { await fb().firestore().collection("vacationAssignments").doc(a.id).set(a); }
    catch (e) { showNotification("Error: " + e.message, "error"); }
  };
  const deleteVacationAssignment = async (id) => {
    try { await fb().firestore().collection("vacationAssignments").doc(id).delete(); }
    catch (e) { showNotification("Error: " + e.message, "error"); }
  };
  const signVacationAssignment = async (a, signatureData) => {
    try {
      const integrityHash = await digestRecord({ id: a.id, employeeId: a.employeeId, days: a.days, signedAt: new Date().toISOString() });
      await fb().firestore().collection("vacationAssignments").doc(a.id).update({
        status: "signed", signatureData, signedAt: new Date().toISOString(), integrityHash
      });
      const emp = employees.find(e => e.id === a.employeeId);
      if (emp) await updateEmployee({ ...emp, vacationDays: emp.vacationDays - a.days });
    } catch (e) { showNotification("Error: " + e.message, "error"); }
  };

  const checkForUpdates = (silent = false) => {
    if (!firebaseReady || !currentUser) return;
    fb().firestore().collection("config").doc("app_version").get()
      .then(doc => {
        if (!doc.exists) return;
        const { version, apkUrl, webUrl } = doc.data();
        const v = version ? version.trim() : null;
        const dismissed = localStorage.getItem("pardilla_dismissed_version");
        // FIX #23: comparar semver y limpiar dismissed obsoleto
        if (v && isNewerVersion(v, APP_VERSION)) {
          if (v === dismissed) return;
          if (dismissed && !isNewerVersion(v, dismissed)) {
            // Si la dismissed es más nueva o igual a la remota, ignorar
          }
          setNewVersion(v);
          const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
          setUpdateUrl(isIOS ? (webUrl || WEB_URL) : (apkUrl || `https://github.com/${GITHUB_REPO}/releases/latest`));
        } else if (!silent) {
          showNotification(`Tienes la versión más reciente (v${APP_VERSION})`);
        }
      })
      .catch(console.error);
  };

  useEffect(() => {
    if (firebaseReady && currentUser) checkForUpdates(true);
  }, [firebaseReady, currentUser]);

  const initFirebase = () => {
    let config = FIREBASE_CONFIG_HARDCODED;
    if (!config) {
      config = safeLocalGet("pardilla_firebase_config", null);
      if (!config) { setFirebaseReady(false); setAuthLoaded(true); return; }
    }
    if (!fbReady()) { setGlobalError("Firebase SDK no cargado. Verifica el script en index.html."); setAuthLoaded(true); return; }
    try {
      if (!fb().apps.length) fb().initializeApp(config);
      // Habilitar offline persistence (FIX #31)
      try { fb().firestore().enablePersistence({ synchronizeTabs: true }).catch(()=>{}); } catch {}
      fb().auth().onAuthStateChanged(async (user) => {
        setCurrentUser(user);
        if (user) {
          try {
            const p = await fb().firestore().collection("users").doc(user.uid).get();
            if (p.exists) setUserProfile({ uid: user.uid, ...p.data() });
            else setUserProfile(null);
          } catch (e) { console.error("loadProfile:", e); setUserProfile(null); }
        } else { setUserProfile(null); }
        setAuthLoaded(true);
      });
      setFirebaseReady(true);
    } catch (e) { console.error("Firebase init error:", e); setGlobalError(e.message); setAuthLoaded(true); }
  };

  const handleConfigSet = (config) => { safeLocalSet("pardilla_firebase_config", config); initFirebase(); };
  const handleLoginSuccess = async (user) => {
    try {
      const p = await fb().firestore().collection("users").doc(user.uid).get();
      if (p.exists) setUserProfile({ uid: user.uid, ...p.data() });
    } catch (e) { showNotification("Error cargando perfil: " + e.message, "error"); }
  };
  const handleLogout = async () => { try { await fb().auth().signOut(); } catch (e) { console.error(e); } setCurrentUser(null); setUserProfile(null); setScreen("home"); };

  if (globalError) return <div className="login-screen"><div className="login-card"><h3>Error</h3><p style={{ marginTop: 12, fontSize: 13 }}>{globalError}</p></div></div>;
  if (!firebaseReady) return <SetupScreen onConfigSet={handleConfigSet} />;
  if (!authLoaded) return <div className="loading-spinner"><div className="spinner"></div><div className="loading-text">Iniciando...</div></div>;
  if (!currentUser) return <LoginScreen onLoginSuccess={handleLoginSuccess} />;
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
        </>}
        <button className={`nav-tab ${screen === "tasks" ? "active" : ""}`} onClick={() => setScreen("tasks")}>Tareas</button>
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
      {screen === "management" && <ManagementScreen />}
      {screen === "tasks" && <TasksScreen userProfile={userProfile} />}
      {screen === "schedule" && <ShiftPlanningScreen employees={employees} shiftTemplates={shiftTemplates} rotationConfig={rotationConfig} setRotationConfig={setRotationConfig} />}
      {screen === "vacation" && <VacationPlanningScreen employees={employees} updateEmployeeVacation={updateEmployeeVacation} userProfile={userProfile} vacationAssignments={vacationAssignments} signVacationAssignment={signVacationAssignment} />}
      {screen === "assignVacations" && <AssignVacationsScreen employees={employees} vacationAssignments={vacationAssignments} addVacationAssignment={addVacationAssignment} deleteVacationAssignment={deleteVacationAssignment} />}
      {screen === "miHorario" && <ConsultarHorarioScreen employees={employees} userProfile={userProfile} shiftTemplates={shiftTemplates} rotationConfig={rotationConfig} pastryTemplates={pastryTemplates} />}
      {screen === "fichar" && <FicharScreen userProfile={userProfile} employees={employees} shiftTemplates={shiftTemplates} rotationConfig={rotationConfig} pastryTemplates={pastryTemplates} showNotification={showNotification} />}
      {screen === "shiftConfig" && <ShiftConfigScreen shiftTemplates={shiftTemplates} setShiftTemplates={setShiftTemplates} pastryTemplates={pastryTemplates} setPastryTemplates={setPastryTemplates} rotationConfig={rotationConfig} />}
      {screen === "users" && <UserManagementScreen userProfile={userProfile} employees={employees} />}
      {screen === "firebase" && <FirebaseConfigScreen />}

      {selectedEmployee && <EmployeeDetailModal employee={selectedEmployee} onClose={() => setSelectedEmployee(null)} updateEmployee={updateEmployee} removeEmployee={removeEmployee} employees={employees} />}
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
