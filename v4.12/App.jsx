import { useState, useEffect, useRef } from "react";

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
  .btn-primary { background: var(--primary); color: white; }
  .btn-primary:hover { background: var(--primary-dark); transform: translateY(-2px); }
  .btn-secondary { background: var(--secondary); color: var(--dark); }
  .btn-secondary:hover { background: #C9A961; }
  .btn-success { background: var(--success); color: white; }
  .btn-success:hover { background: #45a049; }
  .btn-danger { background: var(--danger); color: white; }
  .btn-danger:hover { background: #da190b; }
  .btn-sm { padding: 6px 12px; font-size: 12px; }
  .input { width: 100%; padding: 12px; border: 1px solid var(--border);
    border-radius: var(--radius-sm); font-size: 16px; font-family: inherit; margin-bottom: 12px; }
  .input:focus { outline: none; border-color: var(--primary);
    box-shadow: 0 0 0 3px rgba(139, 69, 19, 0.1); }
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
  .employee-card .info { flex: 1; }
  .employee-card .name { font-weight: 600; font-size: 16px; }
  .employee-card .role { font-size: 13px; color: #666; }
  .employee-card .actions { display: flex; gap: 8px; }
  .product-card { background: var(--card-bg); border-radius: var(--radius-sm);
    padding: 16px; margin-bottom: 12px; border-left: 4px solid var(--secondary);
    display: flex; justify-content: space-between; align-items: center; }
  .product-card .info { flex: 1; }
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
    justify-content: center; z-index: 200; }
  .modal-content { background: white; border-radius: var(--radius); padding: 24px;
    max-width: 500px; width: 90%; max-height: 90vh; overflow-y: auto; }
  .modal-header { font-size: 20px; font-weight: 700; margin-bottom: 16px;
    display: flex; justify-content: space-between; align-items: center; }
  .modal-close { background: transparent; border: none; font-size: 24px;
    cursor: pointer; color: var(--dark); }
  .modal-footer { display: flex; gap: 8px; margin-top: 20px; justify-content: flex-end; }
  .notification { position: fixed; bottom: 20px; right: 20px; background: var(--success);
    color: white; padding: 16px 20px; border-radius: var(--radius-sm);
    box-shadow: var(--shadow); z-index: 300; animation: slideIn 0.3s ease; }
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
  .vacation-btn:hover { background: var(--primary-dark); }
  .vacation-value { font-size: 28px; font-weight: 700; color: var(--primary); text-align: center; }
  .score-display { display: flex; align-items: center; justify-content: center; gap: 24px; margin: 24px 0; }
  .score-number { font-size: 64px; font-weight: 700; color: var(--primary); }
  .score-bar { flex: 1; height: 20px; background: var(--light); border-radius: 10px; overflow: hidden; }
  .score-bar-fill { height: 100%; width: 74.2%; background: linear-gradient(90deg, var(--success), var(--warning), var(--primary)); border-radius: 10px; }
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
  .trend-icon { display: inline-block; font-size: 16px; margin-left: 4px; }
  .fichar-btn { padding: 20px; border-radius: var(--radius); border: none;
    font-size: 18px; font-weight: 700; width: 100%; cursor: pointer;
    margin: 8px 0; font-family: inherit; }
  .fichar-entrada { background: var(--success); color: white; }
  .fichar-entrada:hover { background: #45a049; }
  .fichar-salida { background: var(--danger); color: white; }
  .fichar-salida:hover { background: #da190b; }
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
  @media (max-width: 768px) {
    .home-grid { grid-template-columns: repeat(auto-fit, minmax(120px, 1fr)); }
    .stat-grid { grid-template-columns: repeat(2, 1fr); }
    .modal-content { width: 95%; }
    .header h1 { font-size: 18px; }
    .container { padding: 12px; }
  }
`;

// ─── CONSTANTS ────────────────────────────────────────────────────────────────
const APP_VERSION = "4.12";
const GITHUB_REPO = "FernandoTelecomunicaciones/pardilla";
const WEB_URL = "https://pasteleria-pardilla.web.app";

const FIREBASE_CONFIG_HARDCODED = null;

const EMPLOYEES_INIT = [
  { id: 1, name: "María de los Ángeles", role: "Ayudante de Dependienta", vacationDays: 0, workedHolidays: 0, monthsWorked: 12, shiftType: "store" },
  { id: 2, name: "Víctor", role: "Ayudante de Dependiente", vacationDays: 0, workedHolidays: 0, monthsWorked: 12, shiftType: "store" },
  { id: 3, name: "Tania", role: "Ayudante de Dependienta", vacationDays: 0, workedHolidays: 0, monthsWorked: 12, shiftType: "store" },
  { id: 4, name: "Aitana", role: "Ayudante de Dependienta", vacationDays: 0, workedHolidays: 0, monthsWorked: 12, shiftType: "store" },
  { id: 5, name: "Roberto", role: "Pastelero", vacationDays: 0, workedHolidays: 0, monthsWorked: 12, shiftType: "pastry" },
  { id: 6, name: "Wilfredy", role: "Pastelero", vacationDays: 0, workedHolidays: 0, monthsWorked: 12, shiftType: "pastry" },
  { id: 7, name: "Edgar", role: "Pastelero", vacationDays: 0, workedHolidays: 0, monthsWorked: 12, shiftType: "pastry" },
  { id: 8, name: "María Galloso", role: "Ayudante de Pastelero", vacationDays: 0, workedHolidays: 0, monthsWorked: 12, shiftType: "pastry" },
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

const SPAIN_HOLIDAYS_2026 = [
  "2026-01-01","2026-01-06","2026-04-02","2026-04-03","2026-05-01","2026-05-02",
  "2026-08-15","2026-10-12","2026-11-01","2026-11-02","2026-12-07","2026-12-08","2026-12-25"
];

// Festivos Comunidad de Madrid 2026 (nacionales + regionales, excluye domingos)
const MADRID_HOLIDAYS_2026 = [
  "2026-01-01","2026-01-06","2026-04-02","2026-04-03","2026-05-01","2026-05-02",
  "2026-08-15","2026-10-12","2026-11-02","2026-11-09","2026-12-07","2026-12-08","2026-12-25"
];

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
  A: { L: null, M: null, X: { m1:"10:00",m2:"13:00",t1:"17:00",t2:"20:00" }, J: { m1:"9:00",m2:"14:00",t1:"17:00",t2:"20:45" }, V: { m1:"10:00",m2:"14:00",t1:"17:00",t2:"20:45" }, S: { m1:"10:00",m2:"15:00",t1:"17:00",t2:"20:00" }, D: { m1:"8:45",m2:"15:00",t1:"17:00",t2:"20:15" } },
  B: { L: { m1:"10:00",m2:"13:00",t1:"17:30",t2:"20:00" }, M: { m1:"9:00",m2:"14:00",t1:"17:00",t2:"20:45" }, X: null, J: null, V: { m1:"9:00",m2:"13:15",t1:"17:15",t2:"20:45" }, S: { m1:"8:30",m2:"14:40",t1:"17:30",t2:"20:45" }, D: { m1:"8:30",m2:"14:15",t1:"17:30",t2:"20:45" } },
  C: { L: { m1:"9:00",m2:"14:00",t1:"17:00",t2:"20:45" }, M: { m1:"10:00",m2:"13:30",t1:"17:30",t2:"20:00" }, X: { m1:"9:00",m2:"14:00",t1:"17:30",t2:"20:45" }, J: { m1:"10:00",m2:"13:30",t1:"17:30",t2:"20:15" }, V: null, S: { m1:"8:45",m2:"14:30",t1:"18:30",t2:"20:45" }, D: { m1:"10:30",m2:"13:45",t1:null,t2:null } },
};

const ROTATION_DEFAULT = { referenceDate: "2026-04-06", assignments: { 1: 0, 2: 1, 4: 2 } };

const TRENDING_HOOKS = ["Abiertos Domingos","Ofertas Semanales","Tartas Personalizadas","Productos Ecológicos","Sin Gluten Disponibles","Venta Online","Catering Empresas","Clases de Repostería","Sostenibilidad","Recetas Caseras"];
const TRENDING_PRODUCTS_FOCUS = ["Roscón de Reyes","Tartas Personalizado","Croissants Artesanos","Bollería Variada","Pasteles Gourmet","Pan Integral","Postres Veganos","Churros Artesanos","Torrijas","Buñuelos"];
const TRENDING_MUSIC = ["Música Relajante de Café","Lo-Fi Beats","Jazz Clásico","Indie Español","Pop Romántico","Ambient"];
const TRENDING_HASHTAGS_POOL = ["#PasteleriaPardilla","#ArtesanoPerdiz","#ArcóonLife","#PanaderiaPerfecta","#PostreDelDía","#TartasDeEnsuenio","#FelizDesayuno","#DesayunaConNosotros","#SaborArtesano","#MejorPasteleriaDeMadrid","#ChocolateArtesano","#FiestaConPardilla","#NuestrasPasiones","#HechoConAmor","#LasTartasMasRicas","#CaféYBollería","#DesayunoMadrid","#AlcorcónGastronomía","#PasteleroArtesano","#ProductosFrescos","#SaborTradicional","#PostresDeLujo"];
const REEL_STRUCTURES = ["Hook visual (3s) → Producto destacado (5s) → Llamada a acción (2s)","Tendencia sonora + Transiciones dinámicas (8s) → Producto (3s)","Before/After de elaboración (6s) → Resultado final (3s) → Compra (1s)","Entrevista rápida cliente (4s) → Producto (3s) → CTA (2s)"];

// ─── HELPERS ─────────────────────────────────────────────────────────────────
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

function getCurrentShift(employeeId, date, rotationConfig) {
  const { referenceDate, assignments } = rotationConfig;
  if (assignments[employeeId] === undefined) return null;
  const ref = new Date(referenceDate);
  const curr = new Date(date);
  const day = curr.getDay();
  const monday = new Date(curr);
  monday.setDate(curr.getDate() - ((day + 6) % 7));
  const refDay = ref.getDay();
  const refMonday = new Date(ref);
  refMonday.setDate(ref.getDate() - ((refDay + 6) % 7));
  const weeksDiff = Math.round((monday - refMonday) / (7 * 24 * 60 * 60 * 1000));
  const shiftIndex = ((assignments[employeeId] + weeksDiff) % 3 + 3) % 3;
  return ["A", "B", "C"][shiftIndex];
}

function generateDynamicContent(type) {
  const hook = TRENDING_HOOKS[Math.floor(Math.random() * TRENDING_HOOKS.length)];
  const product = TRENDING_PRODUCTS_FOCUS[Math.floor(Math.random() * TRENDING_PRODUCTS_FOCUS.length)];
  const music = TRENDING_MUSIC[Math.floor(Math.random() * TRENDING_MUSIC.length)];
  const hashtags = [];
  for (let i = 0; i < 5; i++) hashtags.push(TRENDING_HASHTAGS_POOL[Math.floor(Math.random() * TRENDING_HASHTAGS_POOL.length)]);
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

// ─── FIREBASE FACADE (compat SDK vía CDN) ────────────────────────────────────
// En VS Code necesitas cargar Firebase vía CDN en index.html o instalar el SDK npm.
// Este archivo asume que window.firebase está disponible (compat SDK).
const fb = () => window.firebase;

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
    localStorage.setItem("pardilla_firebase_config", JSON.stringify(config));
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

  useEffect(() => { checkIfFirstUser(); }, []);

  const checkIfFirstUser = async () => {
    try {
      const snapshot = await fb().firestore().collection("users").limit(1).get();
      setIsFirstUser(snapshot.empty);
    } catch (e) { console.error(e); }
    setLoading(false);
  };

  const handleLogin = async (e) => {
    e.preventDefault(); setError("");
    try { const r = await fb().auth().signInWithEmailAndPassword(email, password); onLoginSuccess(r.user); }
    catch (e) { setError(e.message); }
  };

  const handleCreateAdmin = async (e) => {
    e.preventDefault(); setError("");
    try {
      const r = await fb().auth().createUserWithEmailAndPassword(email, password);
      await fb().firestore().collection("users").doc(r.user.uid).set({ uid: r.user.uid, email, name, role: "admin", createdAt: new Date().toISOString() });
      onLoginSuccess(r.user);
    } catch (e) { setError(e.message); }
  };

  if (loading) return <div className="loading-spinner"><div className="spinner"></div><div className="loading-text">Cargando...</div></div>;

  return (
    <div className="login-screen">
      <div className="login-card">
        <div className="login-logo"><div className="icon">🥐</div><h2>Pastelería Pardilla v{APP_VERSION}</h2></div>
        <form onSubmit={isFirstUser ? handleCreateAdmin : handleLogin}>
          {error && <div className="error-message">{error}</div>}
          {isFirstUser && <div className="form-group"><label>Nombre</label><input type="text" className="input" value={name} onChange={(e) => setName(e.target.value)} placeholder="Tu nombre" required /></div>}
          <div className="form-group"><label>Email</label><input type="email" className="input" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="ejemplo@correo.com" required /></div>
          <div className="form-group"><label>Contraseña</label><input type="password" className="input" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" required /></div>
          <button type="submit" className="btn btn-primary" style={{ width: "100%" }}>{isFirstUser ? "Crear Administrador" : "Iniciar Sesión"}</button>
        </form>
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

function EmployeesScreen({ employees, setEmployees, onOpenModal, onSelectEmployee }) {
  const [search, setSearch] = useState("");
  const filtered = employees.filter(e => e.name.toLowerCase().includes(search.toLowerCase()));
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

function ProductsScreen({ products, setProducts, onOpenModal, onSelectProduct }) {
  const [search, setSearch] = useState("");
  const filtered = products.filter(p => p.name.toLowerCase().includes(search.toLowerCase()));
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
            <div className="price">{prod.price.toFixed(2)}€</div>
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
  return (
    <div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(120px, 1fr))", gap: "8px", marginBottom: "16px" }}>
        {["reel","short","post","story"].map(type => (
          <button key={type} className={`content-type-btn ${contentType === type ? "active" : ""}`} onClick={() => setContentType(type)}>
            {type === "reel" ? "🎬 Reel" : type === "short" ? "📺 Short" : type === "post" ? "📸 Post" : "📱 Story"}
          </button>
        ))}
      </div>
      <button className="btn btn-primary" style={{ width: "100%", marginBottom: "16px" }} onClick={() => setContent(generateDynamicContent(contentType))}>Generar Contenido</button>
      {content && <div className="result-box">{content}</div>}
    </div>
  );
}

function ManagementScreen() {
  const [activeTab, setActiveTab] = useState("stats");
  const [searchTerm, setSearchTerm] = useState("");
  const [ventas, setVentas] = useState(() => { const s = localStorage.getItem("pardilla_ventas"); return s ? JSON.parse(s) : []; });
  const [promociones, setPromociones] = useState(() => { const s = localStorage.getItem("pardilla_promociones"); return s ? JSON.parse(s) : []; });
  const [objetivos, setObjetivos] = useState(() => { const s = localStorage.getItem("pardilla_objetivos"); return s ? JSON.parse(s) : { monthlyTarget: 5000, previousMonthSales: 4200 }; });
  const [ventaForm, setVentaForm] = useState({ fecha: new Date().toISOString().split("T")[0], monto: "", categoria: "Bollería" });
  const [promoForm, setPromoForm] = useState({ nombre: "", descuento: "", categoria: "Bollería", inicio: "", fin: "" });
  const filteredTrends = SEARCH_TRENDS.filter(t => t.term.toLowerCase().includes(searchTerm.toLowerCase()));
  const tabs = ["stats","analysis","suggestions","content","ventas","promociones","objetivos"];
  const tabLabels = ["Estadísticas","Análisis IA","Sugerencias","Contenidos","Ventas","Promociones","Objetivos"];

  const addVenta = () => {
    const monto = parseFloat(ventaForm.monto);
    if (monto && ventaForm.fecha) {
      const updated = [...ventas, { ...ventaForm, monto, timestamp: new Date().toISOString() }];
      setVentas(updated); localStorage.setItem("pardilla_ventas", JSON.stringify(updated));
      setVentaForm(f => ({ ...f, monto: "" }));
    }
  };

  const addPromo = () => {
    if (promoForm.nombre && promoForm.descuento && promoForm.inicio && promoForm.fin) {
      const updated = [...promociones, { ...promoForm, descuento: parseInt(promoForm.descuento), timestamp: new Date().toISOString() }];
      setPromociones(updated); localStorage.setItem("pardilla_promociones", JSON.stringify(updated));
      setPromoForm({ nombre: "", descuento: "", categoria: "Bollería", inicio: "", fin: "" });
    }
  };

  const thisMonthVentas = ventas.filter(v => new Date(v.fecha).getMonth() === new Date().getMonth()).reduce((s, v) => s + v.monto, 0);

  return (
    <div className="container">
      <h2>Gestión y Análisis</h2>
      <div className="nav-tabs">{tabs.map((t, i) => <button key={t} className={`nav-tab ${activeTab === t ? "active" : ""}`} onClick={() => setActiveTab(t)}>{tabLabels[i]}</button>)}</div>

      {activeTab === "stats" && (
        <div style={{ marginTop: "20px" }}>
          <h3>Tendencias de Búsqueda</h3>
          <div className="search-box"><input type="text" placeholder="Buscar tendencias..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} /></div>
          {filteredTrends.map((trend, idx) => (
            <div key={idx} className="card">
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div><h4>{trend.term}</h4><p style={{ color: "#666", fontSize: "14px" }}>Volumen: {trend.volume} búsquedas</p></div>
                <div className="trend-icon">{trend.trend === "up" ? "📈" : "➡️"}</div>
              </div>
            </div>
          ))}
        </div>
      )}

      {activeTab === "analysis" && (
        <div style={{ marginTop: "20px" }}>
          <h3>Análisis IA</h3>
          <div className="card">
            <div className="score-display"><div className="score-number">742</div><div style={{ flex: 1 }}><div className="score-bar"><div className="score-bar-fill"></div></div><p style={{ fontSize: "12px", color: "#666", marginTop: "4px" }}>Score de rendimiento</p></div></div>
            <div className="stat-grid">
              <div className="stat-box"><div className="label">Posición Competitiva</div><div className="value" style={{ fontSize: "18px" }}>Top 3</div></div>
              <div className="stat-box"><div className="label">Visibilidad Online</div><div className="value" style={{ fontSize: "18px" }}>Alta</div></div>
              <div className="stat-box"><div className="label">Tendencia</div><div className="value" style={{ fontSize: "18px" }}>↑</div></div>
              <div className="stat-box"><div className="label">Potencial</div><div className="value" style={{ fontSize: "18px" }}>87%</div></div>
            </div>
          </div>
        </div>
      )}

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
          <div className="form-group"><label>Monto (€)</label><input type="number" className="input" step="0.01" placeholder="0.00" value={ventaForm.monto} onChange={e => setVentaForm(f => ({...f, monto: e.target.value}))} /></div>
          <div className="form-group"><label>Categoría</label>
            <select className="input" value={ventaForm.categoria} onChange={e => setVentaForm(f => ({...f, categoria: e.target.value}))}>
              {["Bollería","Tartas","Cafetería","Sándwiches","Bebidas","Otros"].map(c => <option key={c}>{c}</option>)}
            </select>
          </div>
          <button className="btn btn-primary" style={{ width: "100%" }} onClick={addVenta}>Registrar Venta</button>
          <div style={{ marginTop: "20px" }}>
            <h4>Ventas de Hoy</h4>
            <p style={{ fontSize: "18px", fontWeight: "700", color: "var(--primary)" }}>€{ventas.filter(v => v.fecha === new Date().toISOString().split("T")[0]).reduce((s, v) => s + v.monto, 0).toFixed(2)}</p>
            <h4 style={{ marginTop: "16px" }}>Últimas Ventas</h4>
            {ventas.slice(-5).reverse().map((v, idx) => (
              <div key={idx} className="card" style={{ marginTop: "8px" }}>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <div><strong>{v.categoria}</strong><p style={{ fontSize: "12px", color: "#666" }}>{new Date(v.fecha).toLocaleDateString("es-ES")}</p></div>
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
          <div className="form-group"><label>Fecha Fin</label><input type="date" className="input" value={promoForm.fin} onChange={e => setPromoForm(f => ({...f, fin: e.target.value}))} /></div>
          <button className="btn btn-primary" style={{ width: "100%" }} onClick={addPromo}>Crear Promoción</button>
          <div style={{ marginTop: "20px" }}>
            <h4>Promociones Activas</h4>
            {promociones.filter(p => new Date(p.fin) >= new Date()).map((p, idx) => (
              <div key={idx} className="card" style={{ marginTop: "8px", borderLeft: "4px solid var(--success)" }}>
                <strong>{p.nombre}</strong>
                <p style={{ fontSize: "12px", color: "#666" }}>{p.categoria} - {p.descuento}% descuento</p>
                <p style={{ fontSize: "11px", color: "#999" }}>{new Date(p.inicio).toLocaleDateString("es-ES")} al {new Date(p.fin).toLocaleDateString("es-ES")}</p>
              </div>
            ))}
            <h4 style={{ marginTop: "16px" }}>Promociones Expiradas</h4>
            {promociones.filter(p => new Date(p.fin) < new Date()).map((p, idx) => (
              <div key={idx} className="card" style={{ marginTop: "8px", borderLeft: "4px solid var(--danger)", opacity: "0.6" }}>
                <strong>{p.nombre}</strong><p style={{ fontSize: "12px", color: "#666" }}>Expiró el {new Date(p.fin).toLocaleDateString("es-ES")}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === "objetivos" && (
        <div style={{ marginTop: "20px" }}>
          <h3>Objetivos y KPIs</h3>
          <div className="form-group"><label>Objetivo de Ventas Mensual (€)</label><input type="number" className="input" value={objetivos.monthlyTarget} onChange={e => setObjetivos(o => ({...o, monthlyTarget: parseInt(e.target.value) || 0}))} /></div>
          <button className="btn btn-success" style={{ width: "100%", marginBottom: "16px" }} onClick={() => localStorage.setItem("pardilla_objetivos", JSON.stringify(objetivos))}>Guardar Objetivo</button>
          <div className="card" style={{ marginTop: "16px" }}>
            <h4>Progreso del Mes</h4>
            <div className="score-bar" style={{ marginTop: "12px", height: "30px" }}>
              <div className="score-bar-fill" style={{ width: `${Math.min((thisMonthVentas / objetivos.monthlyTarget) * 100, 100)}%` }}></div>
            </div>
            <p style={{ marginTop: "8px", color: "#666", fontSize: "12px" }}>€{thisMonthVentas.toFixed(2)} de €{objetivos.monthlyTarget.toFixed(2)}</p>
          </div>
          <div className="stat-grid" style={{ marginTop: "16px" }}>
            <div className="stat-box"><div className="label">Ticket Medio</div><div className="value" style={{ fontSize: "18px" }}>€{ventas.length > 0 ? (ventas.reduce((s, v) => s + v.monto, 0) / ventas.length).toFixed(2) : "0.00"}</div></div>
            <div className="stat-box"><div className="label">Mes Anterior</div><div className="value" style={{ fontSize: "18px" }}>€{objetivos.previousMonthSales.toFixed(2)}</div></div>
            <div className="stat-box"><div className="label">Categoría Top</div><div className="value" style={{ fontSize: "14px" }}>{ventas.length > 0 ? Object.entries(ventas.reduce((acc, v) => ({...acc, [v.categoria]: (acc[v.categoria] || 0) + v.monto}), {})).sort((a, b) => b[1] - a[1])[0][0] : "-"}</div></div>
          </div>
        </div>
      )}
    </div>
  );
}

function TasksScreen({ onOpenModal }) {
  const [tasks, setTasks] = useState(() => { const s = localStorage.getItem("pardilla_tasks"); return s ? JSON.parse(s) : []; });
  const toggleTask = (id) => { const updated = tasks.map(t => t.id === id ? {...t, completed: !t.completed} : t); setTasks(updated); localStorage.setItem("pardilla_tasks", JSON.stringify(updated)); };
  return (
    <div className="container">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
        <h2>Tareas</h2><button className="btn btn-primary btn-sm" onClick={() => onOpenModal("addTask")}>+ Nueva</button>
      </div>
      {tasks.map(task => (
        <div key={task.id} className="card" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
          <div style={{ flex: 1 }}><h4 style={{ textDecoration: task.completed ? "line-through" : "none" }}>{task.title}</h4><p style={{ fontSize: "13px", color: "#666" }}>{task.description}</p></div>
          <button className="btn btn-sm btn-secondary" onClick={() => toggleTask(task.id)}>{task.completed ? "✓" : "○"}</button>
        </div>
      ))}
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

  useEffect(() => {
    fb().firestore().collection("config").doc("rotation").get()
      .then(doc => { if (doc.exists) { setLocalRotation(doc.data()); setRotationConfig(doc.data()); } })
      .catch(e => console.error(e));
  }, []);

  useEffect(() => { setLocalRotation(rotationConfig); }, [rotationConfig]);

  const today = new Date();
  const day = today.getDay();
  const weekStart = new Date(today); weekStart.setDate(today.getDate() - ((day + 6) % 7));
  const weekEnd = new Date(weekStart); weekEnd.setDate(weekEnd.getDate() + 6);

  // Calcula weeksDiff entre lunes de referencia y lunes de la semana actual
  const getWeeksDiff = (rotation) => {
    const ref = new Date(rotation.referenceDate);
    const refMonday = new Date(ref);
    refMonday.setDate(ref.getDate() - ((ref.getDay() + 6) % 7));
    return Math.round((weekStart - refMonday) / (7 * 24 * 60 * 60 * 1000));
  };

  // El admin selecciona el turno deseado para ESTA SEMANA (desiredShiftIdx 0=A,1=B,2=C).
  // Hay que retroceder el offset: assignment = (deseado − weeksDiff) mod 3
  const handleShiftChange = (empId, desiredShiftIdx) => {
    const weeksDiff = getWeeksDiff(localRotation);
    const newAssignment = ((parseInt(desiredShiftIdx) - weeksDiff) % 3 + 3) % 3;
    const updated = { ...localRotation, assignments: { ...localRotation.assignments, [empId]: newAssignment } };
    setLocalRotation(updated); setRotationConfig(updated);
    localStorage.setItem("pardilla_rotation", JSON.stringify(updated));
    fb().firestore().collection("config").doc("rotation").set(updated).catch(console.error);
  };

  const handleSave = async () => {
    setSaving(true);
    try { await fb().firestore().collection("config").doc("rotation").set(localRotation); localStorage.setItem("pardilla_rotation", JSON.stringify(localRotation)); setSaved(true); setTimeout(() => setSaved(false), 3000); }
    catch (e) { alert("Error al guardar: " + e.message); }
    setSaving(false);
  };

  const persistRotation = (updated) => {
    setLocalRotation(updated); setRotationConfig(updated);
    localStorage.setItem("pardilla_rotation", JSON.stringify(updated));
    fb().firestore().collection("config").doc("rotation").set(updated).catch(console.error);
  };

  const handleRemoveFromRotation = (empId) => {
    const emp = employees.find(e => e.id === empId);
    if (!window.confirm(`¿Quitar a ${emp?.name} de la rotación A/B/C?`)) return;
    const newAssignments = { ...localRotation.assignments };
    delete newAssignments[empId];
    persistRotation({ ...localRotation, assignments: newAssignments });
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

  return (
    <div className="container">
      <h2>Planificación de Turnos</h2>
      <button className="btn btn-primary" onClick={handleSave} disabled={saving} style={{ marginBottom: "16px" }}>{saving ? "Guardando..." : "Guardar Asignación"}</button>
      {saved && <div className="success-message">Cambios guardados correctamente</div>}
      <div style={{ marginTop: "20px" }}>
        <h3>Asignación Actual - Semana del {weekStart.toLocaleDateString("es-ES", { day: "numeric", month: "numeric" })} al {weekEnd.toLocaleDateString("es-ES", { day: "numeric", month: "numeric" })}</h3>
        {Object.keys(localRotation.assignments).map(Number).map(empId => {
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
        {Object.keys(localRotation.assignments).map(Number).map(empId => {
          const emp = employees.find(e => e.id === empId);
          const shiftLetter = getCurrentShift(empId, weekStart, localRotation) || "A";
          return (
            <div key={empId} className="card" style={{ marginBottom: "8px", borderLeft: "4px solid var(--info)", padding: "12px 16px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
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
    </div>
  );
}

function SignatureCanvas({ assignmentDetails, onSave, onCancel }) {
  const canvasRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const lastPos = useRef(null);
  const getPos = (e) => {
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    if (e.touches) return { x: (e.touches[0].clientX - rect.left) * scaleX, y: (e.touches[0].clientY - rect.top) * scaleY };
    return { x: (e.clientX - rect.left) * scaleX, y: (e.clientY - rect.top) * scaleY };
  };
  const startDraw = (e) => { e.preventDefault(); setIsDrawing(true); lastPos.current = getPos(e); };
  const draw = (e) => {
    e.preventDefault();
    if (!isDrawing) return;
    const ctx = canvasRef.current.getContext("2d");
    const pos = getPos(e);
    ctx.beginPath(); ctx.moveTo(lastPos.current.x, lastPos.current.y);
    ctx.lineTo(pos.x, pos.y); ctx.strokeStyle = "#333"; ctx.lineWidth = 2; ctx.lineCap = "round"; ctx.stroke();
    lastPos.current = pos;
  };
  const stopDraw = (e) => { if (e) e.preventDefault(); setIsDrawing(false); lastPos.current = null; };
  const clear = () => { const c = canvasRef.current; c.getContext("2d").clearRect(0, 0, c.width, c.height); };
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
      <canvas ref={canvasRef} width={400} height={150}
        style={{ border: "2px solid #DDD", borderRadius: "8px", width: "100%", touchAction: "none", background: "white", display: "block" }}
        onMouseDown={startDraw} onMouseMove={draw} onMouseUp={stopDraw} onMouseLeave={stopDraw}
        onTouchStart={startDraw} onTouchMove={draw} onTouchEnd={stopDraw}
      />
      <div style={{ marginTop: "8px" }}><button className="btn btn-secondary btn-sm" onClick={clear}>Borrar firma</button></div>
      <div className="modal-footer">
        <button className="btn btn-secondary btn-sm" onClick={onCancel}>Cancelar</button>
        <button className="btn btn-success btn-sm" onClick={() => onSave(canvasRef.current.toDataURL())}>Confirmar Firma</button>
      </div>
    </div></div>
  );
}

function AssignVacationsScreen({ employees, vacationAssignments, setVacationAssignments }) {
  const [selectedEmpId, setSelectedEmpId] = useState(employees[0]?.id || null);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [customDays, setCustomDays] = useState("");
  const [note, setNote] = useState("");
  const [saved, setSaved] = useState(false);
  const calcDays = () => {
    if (startDate && endDate) {
      const diff = Math.round((new Date(endDate) - new Date(startDate)) / 86400000) + 1;
      if (diff > 0) return diff;
    }
    return parseInt(customDays) || 0;
  };
  const days = calcDays();
  const handleAssign = () => {
    if (!selectedEmpId || days <= 0) return;
    const newA = { id: Date.now(), employeeId: selectedEmpId, startDate: startDate || null, endDate: endDate || null, days, note, status: "pending", signatureData: null, signedAt: null, assignedAt: new Date().toISOString() };
    const updated = [...vacationAssignments, newA];
    setVacationAssignments(updated); localStorage.setItem("pardilla_vacation_assignments", JSON.stringify(updated));
    setSaved(true); setTimeout(() => setSaved(false), 3000);
    setStartDate(""); setEndDate(""); setCustomDays(""); setNote("");
  };
  const handleDelete = (id) => {
    const updated = vacationAssignments.filter(a => a.id !== id);
    setVacationAssignments(updated); localStorage.setItem("pardilla_vacation_assignments", JSON.stringify(updated));
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
        <div className="form-group"><label>Fecha inicio (opcional)</label><input type="date" className="input" value={startDate} onChange={e => setStartDate(e.target.value)} /></div>
        <div className="form-group"><label>Fecha fin (opcional)</label><input type="date" className="input" value={endDate} min={startDate} onChange={e => setEndDate(e.target.value)} /></div>
        {(!startDate || !endDate) && <div className="form-group"><label>Número de días</label><input type="number" className="input" value={customDays} onChange={e => setCustomDays(e.target.value)} min="1" placeholder="Días de vacaciones" /></div>}
        {days > 0 && <div style={{ background: "#E8F5E9", padding: "12px", borderRadius: "8px", marginBottom: "16px", fontWeight: "600", color: "#2E7D32" }}>Días a asignar: {days}</div>}
        <div className="form-group"><label>Nota (opcional)</label><input type="text" className="input" value={note} onChange={e => setNote(e.target.value)} placeholder="Ej: Vacaciones verano" /></div>
        {saved && <div style={{ color: "#2E7D32", fontWeight: "600", marginBottom: "12px" }}>✓ Asignación creada — pendiente de firma del empleado</div>}
        <button className="btn btn-primary" style={{ width: "100%" }} onClick={handleAssign} disabled={!selectedEmpId || days <= 0}>Asignar Vacaciones (Pendiente de firma)</button>
      </div>
      <div className="card" style={{ marginTop: "16px" }}>
        <h4 style={{ marginBottom: "16px" }}>Asignaciones realizadas</h4>
        {vacationAssignments.length === 0 && <p style={{ color: "#999" }}>No hay asignaciones</p>}
        {[...vacationAssignments].reverse().map(a => {
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
              {a.status === "pending" && <button className="btn btn-danger btn-sm" onClick={() => handleDelete(a.id)}>×</button>}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function VacationPlanningScreen({ employees, setEmployees, userProfile, vacationAssignments, setVacationAssignments }) {
  const [signingAssignment, setSigningAssignment] = useState(null);
  const visible = userProfile.role === "empleado" ? employees.filter(e => e.id === userProfile.linkedEmployeeId) : employees;
  const canModify = userProfile.role === "admin";
  const updateVacation = (empId, delta) => {
    const updated = employees.map(e => e.id === empId ? {...e, vacationDays: e.vacationDays + delta} : e);
    setEmployees(updated); localStorage.setItem("pardilla_employees", JSON.stringify(updated));
  };
  const pendingAssignments = (userProfile.role === "empleado" && userProfile.linkedEmployeeId)
    ? vacationAssignments.filter(a => a.employeeId === userProfile.linkedEmployeeId && a.status === "pending")
    : [];
  const handleSign = (signatureData) => {
    const a = signingAssignment;
    const updatedA = vacationAssignments.map(x => x.id === a.id ? { ...x, status: "signed", signatureData, signedAt: new Date().toISOString() } : x);
    setVacationAssignments(updatedA); localStorage.setItem("pardilla_vacation_assignments", JSON.stringify(updatedA));
    const updatedE = employees.map(e => e.id === a.employeeId ? { ...e, vacationDays: e.vacationDays - a.days } : e);
    setEmployees(updatedE); localStorage.setItem("pardilla_employees", JSON.stringify(updatedE));
    setSigningAssignment(null);
  };
  if (userProfile.role === "empleado" && !userProfile.linkedEmployeeId) return <div className="container"><h2>Mis Vacaciones</h2><div className="card" style={{ marginTop: "16px", background: "#FFF3E0", border: "2px solid #FF9800" }}><p style={{ color: "#E65100" }}>No tienes un empleado asignado. Contacta con tu administrador.</p></div></div>;
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
        const total = emp.monthsWorked * 2.5 + emp.workedHolidays + emp.vacationDays;
        const signed = vacationAssignments.filter(a => a.employeeId === emp.id && a.status === "signed");
        return (
          <div key={emp.id} className="card" style={{ marginTop: "16px" }}>
            <h4>{emp.name}</h4>
            <div className="stat-grid" style={{ marginTop: "12px" }}>
              <div className="stat-box"><div className="label">Días disponibles</div><div className="value" style={{ color: total < 0 ? "#F44336" : "var(--primary)" }}>{total.toFixed(1)}</div></div>
              <div className="stat-box"><div className="label">Ajuste admin</div><div className="value" style={{ color: emp.vacationDays < 0 ? "#F44336" : "var(--primary)" }}>{emp.vacationDays}</div></div>
            </div>
            <div className="vacation-control">
              {canModify && <button className="vacation-btn" onClick={() => updateVacation(emp.id, -1)}>−</button>}
              <div className="vacation-value" style={{ color: total < 0 ? "#F44336" : "var(--primary)" }}>{total.toFixed(1)}</div>
              {canModify && <button className="vacation-btn" onClick={() => updateVacation(emp.id, 1)}>+</button>}
            </div>
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

function ConsultarHorarioScreen({ employees, userProfile, shiftTemplates, rotationConfig }) {
  const [selectedEmpId, setSelectedEmpId] = useState(() => userProfile.role === "empleado" ? userProfile.linkedEmployeeId : 1);
  const [weekStart, setWeekStart] = useState(() => { const d = new Date(); d.setDate(d.getDate() - d.getDay() + 1); return d; });
  const emp = employees.find(e => e.id === selectedEmpId);
  const shift = selectedEmpId ? getCurrentShift(selectedEmpId, weekStart, rotationConfig) : null;
  const shiftTemplate = shift ? shiftTemplates[shift] : null;

  if (!selectedEmpId || !emp) return <div className="container"><h2>Mi Horario</h2><div className="card" style={{ marginTop: "16px", background: "#FFF3E0", border: "2px solid #FF9800" }}><p style={{ color: "#E65100" }}>No tienes un empleado asignado. Contacta con tu administrador.</p></div></div>;
  if (!shift || !shiftTemplate) return <div className="container"><h2>Mi Horario</h2><div className="card" style={{ marginTop: "16px" }}><h3>{emp.name}</h3><p style={{ color: "#999", marginTop: "8px" }}>No tienes turno asignado esta semana.</p></div></div>;

  const days = ["L","M","X","J","V","S","D"];
  const dayLabels = ["Lunes","Martes","Miércoles","Jueves","Viernes","Sábado","Domingo"];
  const schedule = days.map((day, idx) => {
    const date = new Date(weekStart); date.setDate(weekStart.getDate() + idx);
    const ds = shiftTemplate[day];
    if (ds === null) return { date, label: dayLabels[idx], isFree: true };
    return { date, label: dayLabels[idx], isFree: false, morning: ds.m1 && ds.m2 ? `${ds.m1} - ${ds.m2}` : "-", afternoon: ds.t1 && ds.t2 ? `${ds.t1} - ${ds.t2}` : "-" };
  });

  const prevWeek = () => { const d = new Date(weekStart); d.setDate(d.getDate() - 7); setWeekStart(d); };
  const nextWeek = () => { const d = new Date(weekStart); d.setDate(d.getDate() + 7); setWeekStart(d); };
  const weekEnd = new Date(weekStart.getTime() + 6 * 24 * 60 * 60 * 1000);

  return (
    <div className="container">
      <h2>Consultar Horario</h2>
      {userProfile.role === "admin" && (
        <div className="form-group" style={{ marginTop: "16px" }}>
          <label>Empleado</label>
          <select className="input" value={selectedEmpId} onChange={e => setSelectedEmpId(parseInt(e.target.value))}>
            {employees.map(e => <option key={e.id} value={e.id}>{e.name}</option>)}
          </select>
        </div>
      )}
      <div className="card" style={{ marginTop: "16px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
          <h3>{emp.name}</h3><div className={`turno-badge turno-${shift}`}>{shift}</div>
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

function FicharScreen({ userProfile, employees, shiftTemplates, rotationConfig }) {
  const [registros, setRegistros] = useState([]);
  const [selectedDate] = useState(new Date().toISOString().split("T")[0]);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [adminRegistros, setAdminRegistros] = useState([]);
  const [adminSearched, setAdminSearched] = useState(false);
  const [showSignModal, setShowSignModal] = useState(false);
  const [pendingFicharType, setPendingFicharType] = useState(null);
  const [hasSigned, setHasSigned] = useState(false);
  const [viewSignature, setViewSignature] = useState(null);
  const [showRetroModal, setShowRetroModal] = useState(false);
  const [retroDate, setRetroDate] = useState("");
  const [retroTime, setRetroTime] = useState("08:00");
  const [retroType, setRetroType] = useState("entrada");
  const [retroAccepted, setRetroAccepted] = useState(false);
  const [retroSigned, setRetroSigned] = useState(false);
  const [showFueraTurnoModal, setShowFueraTurnoModal] = useState(false);
  const [fueraTurnoAccepted, setFueraTurnoAccepted] = useState(false);
  const [fueraTurnoSigned, setFueraTurnoSigned] = useState(false);
  const [fueraTurnoInfo, setFueraTurnoInfo] = useState({ currentTime: "", shiftLetter: "-", horarioPrevisto: "" });
  const signCanvasRef = useRef(null);
  const retroCanvasRef = useRef(null);
  const fueraTurnoCanvasRef = useRef(null);
  const isDrawingRef = useRef(false);
  const isRetroDrawingRef = useRef(false);
  const isFueraTurnoDrawingRef = useRef(false);
  const isAdmin = userProfile.role === "admin";

  const TOLERANCE_MIN = 30;
  const DAY_KEYS = ["D","L","M","X","J","V","S"];
  const toMins = (t) => { const [h,m] = t.split(":").map(Number); return h*60+m; };

  const getScheduledCandidates = (type, shiftLetter, dateStr) => {
    if (!shiftTemplates || !shiftLetter) return [];
    const d = new Date(dateStr + "T12:00:00");
    const slot = shiftTemplates[shiftLetter]?.[DAY_KEYS[d.getDay()]];
    if (!slot) return [];
    return (type === "entrada" ? [slot.m1, slot.t1] : [slot.m2, slot.t2]).filter(Boolean);
  };

  const findClosestScheduled = (actualTime, candidates) => {
    if (!candidates.length) return null;
    let best = null, bestDiff = Infinity;
    candidates.forEach(c => { const diff = Math.abs(toMins(c) - toMins(actualTime)); if (diff < bestDiff) { bestDiff = diff; best = c; } });
    return bestDiff <= TOLERANCE_MIN ? best : null;
  };

  const getCanvasPos = (e, canvas) => {
    const rect = canvas.getBoundingClientRect();
    const sx = canvas.width / rect.width, sy = canvas.height / rect.height;
    if (e.touches) return { x: (e.touches[0].clientX - rect.left) * sx, y: (e.touches[0].clientY - rect.top) * sy };
    return { x: (e.clientX - rect.left) * sx, y: (e.clientY - rect.top) * sy };
  };

  const startDrawing = (e) => { e.preventDefault(); const ctx = signCanvasRef.current.getContext("2d"); const p = getCanvasPos(e, signCanvasRef.current); ctx.beginPath(); ctx.moveTo(p.x, p.y); isDrawingRef.current = true; setHasSigned(true); };
  const draw = (e) => { e.preventDefault(); if (!isDrawingRef.current) return; const ctx = signCanvasRef.current.getContext("2d"); const p = getCanvasPos(e, signCanvasRef.current); ctx.lineWidth = 2; ctx.lineCap = "round"; ctx.strokeStyle = "#222"; ctx.lineTo(p.x, p.y); ctx.stroke(); };
  const stopDrawing = () => { isDrawingRef.current = false; };
  const clearSignature = () => { signCanvasRef.current.getContext("2d").clearRect(0, 0, 300, 150); setHasSigned(false); };

  const startRetroDrawing = (e) => { e.preventDefault(); const ctx = retroCanvasRef.current.getContext("2d"); const p = getCanvasPos(e, retroCanvasRef.current); ctx.beginPath(); ctx.moveTo(p.x, p.y); isRetroDrawingRef.current = true; setRetroSigned(true); };
  const drawRetro = (e) => { e.preventDefault(); if (!isRetroDrawingRef.current) return; const ctx = retroCanvasRef.current.getContext("2d"); const p = getCanvasPos(e, retroCanvasRef.current); ctx.lineWidth = 2; ctx.lineCap = "round"; ctx.strokeStyle = "#222"; ctx.lineTo(p.x, p.y); ctx.stroke(); };
  const stopRetroDrawing = () => { isRetroDrawingRef.current = false; };
  const clearRetroSignature = () => { retroCanvasRef.current.getContext("2d").clearRect(0, 0, 300, 120); setRetroSigned(false); };

  const startFueraTurnoDrawing = (e) => { e.preventDefault(); const ctx = fueraTurnoCanvasRef.current.getContext("2d"); const p = getCanvasPos(e, fueraTurnoCanvasRef.current); ctx.beginPath(); ctx.moveTo(p.x, p.y); isFueraTurnoDrawingRef.current = true; setFueraTurnoSigned(true); };
  const drawFueraTurno = (e) => { e.preventDefault(); if (!isFueraTurnoDrawingRef.current) return; const ctx = fueraTurnoCanvasRef.current.getContext("2d"); const p = getCanvasPos(e, fueraTurnoCanvasRef.current); ctx.lineWidth = 2; ctx.lineCap = "round"; ctx.strokeStyle = "#222"; ctx.lineTo(p.x, p.y); ctx.stroke(); };
  const stopFueraTurnoDrawing = () => { isFueraTurnoDrawingRef.current = false; };
  const clearFueraTurnoSignature = () => { fueraTurnoCanvasRef.current.getContext("2d").clearRect(0, 0, 300, 120); setFueraTurnoSigned(false); };

  const handleFichar = (type) => {
    const now = new Date();
    const time = now.toLocaleTimeString("es-ES", { hour: "2-digit", minute: "2-digit" });
    const linkedEmp = employees.find(e => e.id === userProfile.linkedEmployeeId);
    const isInRotation = linkedEmp && rotationConfig?.assignments?.[linkedEmp.id] !== undefined;
    setPendingFicharType(type);
    if (isInRotation) {
      const shiftLetter = getCurrentShift(linkedEmp.id, selectedDate, rotationConfig);
      const candidates = getScheduledCandidates(type, shiftLetter, selectedDate);
      const scheduledTime = findClosestScheduled(time, candidates);
      if (!scheduledTime) {
        const d = new Date(selectedDate + "T12:00:00");
        const slot = shiftLetter ? shiftTemplates?.[shiftLetter]?.[DAY_KEYS[d.getDay()]] : null;
        const entradas = slot ? [slot.m1, slot.t1].filter(Boolean) : [];
        const salidas = slot ? [slot.m2, slot.t2].filter(Boolean) : [];
        const horarioPrevisto = slot ? `Entrada: ${entradas.join(" / ")} · Salida: ${salidas.join(" / ")}` : "Día libre según tu turno";
        setFueraTurnoInfo({ currentTime: time, shiftLetter: shiftLetter || "-", horarioPrevisto });
        setFueraTurnoAccepted(false); setFueraTurnoSigned(false); isFueraTurnoDrawingRef.current = false;
        setShowFueraTurnoModal(true);
        return;
      }
    }
    setHasSigned(false); isDrawingRef.current = false; setShowSignModal(true);
  };

  const handleConfirmFichar = async () => {
    if (!hasSigned) { alert("Por favor, firma antes de fichar"); return; }
    const signature = signCanvasRef.current.toDataURL("image/png");
    const now = new Date();
    const time = now.toLocaleTimeString("es-ES", { hour: "2-digit", minute: "2-digit" });
    const linkedEmp = employees.find(e => e.id === userProfile.linkedEmployeeId);
    const employeeName = linkedEmp ? linkedEmp.name : userProfile.name;
    const shiftLetter = linkedEmp ? getCurrentShift(linkedEmp.id, selectedDate, rotationConfig) : null;
    const candidates = getScheduledCandidates(pendingFicharType, shiftLetter, selectedDate);
    const scheduledTime = findClosestScheduled(time, candidates);
    const registro = { userId: userProfile.uid, employeeName, date: selectedDate, type: pendingFicharType, time, timestamp: now.toISOString(), signature, ...(scheduledTime ? { scheduledTime, withinTolerance: true } : {}) };
    try {
      await fb().firestore().collection("registros_horarios").add(registro);
      setRegistros(r => [...r, { id: Date.now(), ...registro }]);
      setShowSignModal(false); setPendingFicharType(null);
    } catch (e) { alert("Error al guardar: " + e.message); }
  };

  const handleConfirmFueraTurno = async () => {
    if (!fueraTurnoAccepted) { alert("Debes aceptar la declaración de responsabilidad"); return; }
    if (!fueraTurnoSigned) { alert("Por favor, firma la declaración"); return; }
    const signature = fueraTurnoCanvasRef.current.toDataURL("image/png");
    const now = new Date();
    const linkedEmp = employees.find(e => e.id === userProfile.linkedEmployeeId);
    const employeeName = linkedEmp ? linkedEmp.name : userProfile.name;
    const textoDeclaracion = `El empleado/a ${employeeName} declara bajo su responsabilidad haber fichado ${pendingFicharType} a las ${fueraTurnoInfo.currentTime}h fuera del horario establecido. Turno asignado ${fueraTurnoInfo.shiftLetter}: ${fueraTurnoInfo.horarioPrevisto}. La empresa no tiene responsabilidad al respecto.`;
    const registro = { userId: userProfile.uid, employeeName, date: selectedDate, type: pendingFicharType, time: fueraTurnoInfo.currentTime, timestamp: now.toISOString(), signature, fueraTolerancia: true, declaracionFueraTurno: textoDeclaracion };
    try {
      await fb().firestore().collection("registros_horarios").add(registro);
      setRegistros(r => [...r, { id: Date.now(), ...registro }]);
      setShowFueraTurnoModal(false);
    } catch (e) { alert("Error al guardar: " + e.message); }
  };

  const handleOpenRetro = () => { setRetroDate(""); setRetroTime("08:00"); setRetroType("entrada"); setRetroAccepted(false); setRetroSigned(false); isRetroDrawingRef.current = false; setShowRetroModal(true); };

  const handleConfirmRetro = async () => {
    if (!retroDate) { alert("Selecciona la fecha"); return; }
    if (!retroTime) { alert("Indica la hora del fichaje"); return; }
    if (!retroAccepted) { alert("Debes aceptar la declaración de responsabilidad"); return; }
    if (!retroSigned) { alert("Por favor, firma la declaración"); return; }
    const signature = retroCanvasRef.current.toDataURL("image/png");
    const now = new Date();
    const linkedEmp = employees.find(e => e.id === userProfile.linkedEmployeeId);
    const employeeName = linkedEmp ? linkedEmp.name : userProfile.name;
    const textoDeclaracion = `El empleado/a ${employeeName} declara bajo su responsabilidad haber olvidado registrar el fichaje de ${retroType} del día ${retroDate} a las ${retroTime}h. El olvido fue por causa propia y la empresa no tiene responsabilidad al respecto.`;
    const registro = { userId: userProfile.uid, employeeName, date: retroDate, type: retroType, time: retroTime, timestamp: now.toISOString(), signature, retroactivo: true, declaracionResponsabilidad: true, fechaFichaje: now.toISOString(), textoDeclaracion };
    try {
      await fb().firestore().collection("registros_horarios").add(registro);
      setRegistros(r => [...r, { id: Date.now(), ...registro }]);
      setShowRetroModal(false);
    } catch (e) { alert("Error al guardar: " + e.message); }
  };

  const downloadCSV = (records) => {
    const header = "Fecha;Empleado;Tipo;Hora Real;Hora Turno;Dentro Tolerancia;Retroactivo;Decl. Responsabilidad;Con Firma;Timestamp\n";
    const rows = records.map(r => `${r.date};${r.employeeName};${r.type};${r.time};${r.scheduledTime||""};${r.withinTolerance?"Sí":"No"};${r.retroactivo?"Sí":"No"};${r.declaracionResponsabilidad?"Sí":"No"};${r.signature?"Sí":"No"};${r.timestamp}`).join("\n");
    const blob = new Blob(["\ufeff" + header + rows], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url; a.download = `registro_horario_${selectedDate}.csv`; a.click();
    URL.revokeObjectURL(url);
  };

  const handleAdminSearch = async () => {
    if (!dateFrom || !dateTo) { alert("Por favor selecciona ambas fechas"); return; }
    setAdminSearched(true);
    try {
      const snap = await fb().firestore().collection("registros_horarios").where("date",">=",dateFrom).where("date","<=",dateTo).get();
      let results = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      if (selectedEmployee) results = results.filter(r => r.employeeName === selectedEmployee);
      setAdminRegistros(results);
    } catch (e) { alert("Error al buscar: " + e.message); }
  };

  const dayRegistros = registros.filter(r => r.date === selectedDate);
  const retroMinDate = (() => { const d = new Date(); d.setDate(d.getDate()-7); return d.toISOString().split("T")[0]; })();
  const retroMaxDate = (() => { const d = new Date(); d.setDate(d.getDate()-1); return d.toISOString().split("T")[0]; })();
  const linkedEmpName = (() => { const e = employees.find(emp => emp.id === userProfile.linkedEmployeeId); return e ? e.name : userProfile.name; })();

  return (
    <div className="container">
      <h2>Fichar (Registro Horario)</h2>
      <div className="card" style={{ background: "#FFF8E1", borderLeft: "4px solid #FF9800", marginBottom: "16px" }}>
        <p style={{ fontSize: "12px", color: "#E65100", margin: "0" }}>Registro horario conforme al Real Decreto-ley 8/2019</p>
      </div>
      {!isAdmin ? (
        <>
          <div className="card"><label style={{ marginBottom: "12px", display: "block", fontWeight: "600" }}>Fecha (Hoy)</label><input type="date" className="input" value={selectedDate} disabled /></div>
          <button className="fichar-btn fichar-entrada" onClick={() => handleFichar("entrada")}>⬆️ Fichar Entrada</button>
          <button className="fichar-btn fichar-salida" onClick={() => handleFichar("salida")}>⬇️ Fichar Salida</button>
          <button className="fichar-btn" style={{ background: "#FF9800", color: "white" }} onClick={handleOpenRetro}>📅 Fichar Día Anterior</button>
          <div className="card">
            <h3 style={{ marginBottom: "12px" }}>Registros del día</h3>
            {dayRegistros.length === 0 ? <p style={{ color: "#999" }}>No hay registros para esta fecha</p> : dayRegistros.map(r => (
              <div key={r.id} className="registro-card" style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
                <strong>{r.type === "entrada" ? "⬆️ Entrada" : "⬇️ Salida"}</strong>
                <span>{r.time}</span>
                {r.scheduledTime && <span style={{ fontSize: "11px", color: "#2E7D32", background: "#E8F5E9", padding: "2px 6px", borderRadius: "10px" }}>Turno: {r.scheduledTime}</span>}
                {r.retroactivo && <span style={{ fontSize: "11px", color: "#E65100", background: "#FFF3E0", padding: "2px 6px", borderRadius: "10px" }}>📅 Retroactivo</span>}
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
            <div className="form-group"><label>Hasta</label><input type="date" className="input" value={dateTo} onChange={e => setDateTo(e.target.value)} /></div>
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
                  <button className="btn btn-secondary" onClick={() => downloadCSV(adminRegistros)} style={{ width: "100%" }}>Descargar CSV</button>
                </>
              )}
            </div>
          )}
        </>
      )}

      {showFueraTurnoModal && (
        <div className="modal">
          <div className="modal-content">
            <div className="modal-header">
              <span>⚠️ Fichaje Fuera de Horario</span>
              <button className="modal-close" onClick={() => setShowFueraTurnoModal(false)}>×</button>
            </div>
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
            <canvas
              ref={fueraTurnoCanvasRef}
              width={300}
              height={120}
              className="signature-canvas"
              onMouseDown={startFueraTurnoDrawing}
              onMouseMove={drawFueraTurno}
              onMouseUp={stopFueraTurnoDrawing}
              onMouseLeave={stopFueraTurnoDrawing}
              onTouchStart={startFueraTurnoDrawing}
              onTouchMove={drawFueraTurno}
              onTouchEnd={stopFueraTurnoDrawing}
            />
            <div style={{ display: "flex", gap: "8px", marginTop: "12px" }}>
              <button className="btn btn-secondary btn-sm" style={{ flex: 1 }} onClick={clearFueraTurnoSignature}>Limpiar firma</button>
              <button className="btn btn-danger btn-sm" style={{ flex: 2 }} onClick={handleConfirmFueraTurno} disabled={!fueraTurnoAccepted || !fueraTurnoSigned}>
                Registrar {pendingFicharType === "entrada" ? "⬆️ Entrada" : "⬇️ Salida"}
              </button>
            </div>
          </div>
        </div>
      )}

      {showSignModal && (
        <div className="modal">
          <div className="modal-content">
            <div className="modal-header">
              <span>Firma — {pendingFicharType === "entrada" ? "⬆️ Entrada" : "⬇️ Salida"}</span>
              <button className="modal-close" onClick={() => setShowSignModal(false)}>×</button>
            </div>
            <p style={{ fontSize: "13px", color: "#666", marginBottom: "12px" }}>Firma con el dedo o el ratón en el recuadro</p>
            <canvas
              ref={signCanvasRef}
              width={300}
              height={150}
              className="signature-canvas"
              onMouseDown={startDrawing}
              onMouseMove={draw}
              onMouseUp={stopDrawing}
              onMouseLeave={stopDrawing}
              onTouchStart={startDrawing}
              onTouchMove={draw}
              onTouchEnd={stopDrawing}
            />
            <div style={{ display: "flex", gap: "8px", marginTop: "12px" }}>
              <button className="btn btn-secondary btn-sm" style={{ flex: 1 }} onClick={clearSignature}>Limpiar</button>
              <button className="btn btn-primary btn-sm" style={{ flex: 2 }} onClick={handleConfirmFichar} disabled={!hasSigned}>
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
              <span>📅 Fichaje Día Anterior</span>
              <button className="modal-close" onClick={() => setShowRetroModal(false)}>×</button>
            </div>
            <div className="form-group">
              <label>Fecha del fichaje olvidado</label>
              <input type="date" className="input" value={retroDate} min={retroMinDate} max={retroMaxDate} onChange={e => setRetroDate(e.target.value)} />
            </div>
            <div className="form-group">
              <label>Tipo de fichaje</label>
              <select className="input" value={retroType} onChange={e => setRetroType(e.target.value)}>
                <option value="entrada">⬆️ Entrada</option>
                <option value="salida">⬇️ Salida</option>
              </select>
            </div>
            <div className="form-group">
              <label>Hora real del fichaje</label>
              <input type="time" className="input" value={retroTime} onChange={e => setRetroTime(e.target.value)} />
            </div>
            <div style={{ background: "#FFF3E0", border: "1px solid #FF9800", borderRadius: "8px", padding: "12px", marginBottom: "12px", fontSize: "12px", color: "#5D4037", lineHeight: "1.6" }}>
              <strong>Declaración de responsabilidad:</strong><br /><br />
              Yo, <em>{linkedEmpName}</em>, declaro bajo mi responsabilidad haber olvidado registrar el fichaje de <strong>{retroType}</strong> del día <strong>{retroDate || "..."}</strong> a las <strong>{retroTime || "..."}</strong> horas. Asumo que el olvido del fichaje fue por causa propia y que la empresa no tiene ninguna responsabilidad al respecto.
            </div>
            <label style={{ display: "flex", gap: "8px", alignItems: "flex-start", marginBottom: "12px", fontSize: "13px", cursor: "pointer" }}>
              <input type="checkbox" checked={retroAccepted} onChange={e => setRetroAccepted(e.target.checked)} style={{ marginTop: "3px", flexShrink: 0 }} />
              Acepto la declaración anterior y firmo este documento
            </label>
            <p style={{ fontSize: "12px", color: "#666", marginBottom: "8px" }}>Firma con el dedo o el ratón:</p>
            <canvas
              ref={retroCanvasRef}
              width={300}
              height={120}
              className="signature-canvas"
              onMouseDown={startRetroDrawing}
              onMouseMove={drawRetro}
              onMouseUp={stopRetroDrawing}
              onMouseLeave={stopRetroDrawing}
              onTouchStart={startRetroDrawing}
              onTouchMove={drawRetro}
              onTouchEnd={stopRetroDrawing}
            />
            <div style={{ display: "flex", gap: "8px", marginTop: "12px" }}>
              <button className="btn btn-secondary btn-sm" style={{ flex: 1 }} onClick={clearRetroSignature}>Limpiar firma</button>
              <button className="btn btn-primary btn-sm" style={{ flex: 2 }} onClick={handleConfirmRetro} disabled={!retroAccepted || !retroSigned}>
                Registrar fichaje
              </button>
            </div>
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

function ShiftConfigScreen({ shiftTemplates, rotationConfig }) {
  const [templates, setTemplates] = useState(shiftTemplates);
  const days = ["L","M","X","J","V","S","D"];
  const dayLabels = ["Lun","Mar","Mié","Jue","Vie","Sab","Dom"];
  const updateTime = (shift, day, field, value) => {
    const updated = JSON.parse(JSON.stringify(templates));
    if (!updated[shift][day]) updated[shift][day] = {};
    updated[shift][day][field] = value || null;
    setTemplates(updated);
  };
  const handleSave = async () => {
    try {
      await fb().firestore().collection("shiftConfig").doc("templates").set({ templates });
      await fb().firestore().collection("shiftConfig").doc("rotation").set(rotationConfig);
      alert("Configuración de turnos guardada");
    } catch (e) { console.error(e); }
  };
  return (
    <div className="container">
      <h2>Configurar Turnos</h2>
      <div className="card" style={{ marginTop: "20px" }}>
        <h3>Plantillas de Turnos</h3>
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
                      <input type="time" value={templates[shift][day]?.[field] || ""} onChange={e => updateTime(shift, day, field, e.target.value)} />
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
      <button className="btn btn-primary" style={{ width: "100%", marginTop: "16px" }} onClick={handleSave}>Guardar Configuración</button>
    </div>
  );
}

function UserManagementScreen({ userProfile, employees }) {
  const [users, setUsers] = useState([]);
  const [form, setForm] = useState({ email: "", password: "", name: "", role: "manager", linkedEmpId: null });
  const [error, setError] = useState("");

  useEffect(() => { loadUsers(); }, []);

  const loadUsers = async () => {
    try { const snap = await fb().firestore().collection("users").get(); setUsers(snap.docs.map(d => ({ uid: d.id, ...d.data() }))); }
    catch (e) { console.error(e); }
  };

  const handleCreate = async (e) => {
    e.preventDefault(); setError("");
    try {
      const secondaryApp = fb().initializeApp(JSON.parse(localStorage.getItem("pardilla_firebase_config")), "Secondary" + Date.now());
      const cred = await secondaryApp.auth().createUserWithEmailAndPassword(form.email, form.password);
      await fb().firestore().collection("users").doc(cred.user.uid).set({ uid: cred.user.uid, email: form.email, name: form.name, role: form.role, linkedEmployeeId: form.role === "empleado" ? form.linkedEmpId : null, createdAt: new Date().toISOString() });
      await secondaryApp.delete();
      setForm({ email: "", password: "", name: "", role: "manager", linkedEmpId: null });
      loadUsers();
    } catch (e) { setError(e.message); }
  };

  const handleDelete = async (uid) => {
    if (window.confirm("¿Eliminar este usuario?")) {
      try { await fb().firestore().collection("users").doc(uid).delete(); loadUsers(); }
      catch (e) { console.error(e); }
    }
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
          <div className="form-group"><label>Contraseña</label><input type="password" className="input" value={form.password} onChange={e => setForm(f => ({...f, password: e.target.value}))} required /></div>
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
          <button type="submit" className="btn btn-primary" style={{ width: "100%" }}>Crear Usuario</button>
        </form>
      </div>
      <div style={{ marginTop: "20px" }}>
        <h3>Usuarios Existentes</h3>
        {users.map(user => (
          <div key={user.uid} className="user-card">
            <div className="info"><div className="name">{user.name}</div><div className="role">{user.email}</div></div>
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <span className={`role-badge role-${user.role}`}>{user.role}</span>
              {user.role === "empleado" && user.linkedEmployeeId && <span style={{ marginLeft: "8px", fontSize: "12px", color: "#666" }}>→ {employees.find(e => e.id == user.linkedEmployeeId)?.name || "Sin asignar"}</span>}
              {user.uid !== userProfile.uid && <button className="btn btn-sm btn-danger" onClick={() => handleDelete(user.uid)}>Eliminar</button>}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function FirebaseConfigScreen() {
  const config = JSON.parse(localStorage.getItem("pardilla_firebase_config") || "{}");
  return (
    <div className="container">
      <h2>Configuración Firebase</h2>
      <div className="firebase-config"><h3>Configuración Actual</h3><p style={{ fontSize: "12px", fontFamily: "monospace", marginTop: "12px", whiteSpace: "pre-wrap", wordBreak: "break-word" }}>{JSON.stringify(config, null, 2)}</p></div>
      <div className="card">
        <h4 style={{ marginBottom: "12px" }}>Para otros dispositivos:</h4>
        <pre style={{ background: "#f5f5f5", padding: "12px", fontSize: "11px", overflow: "auto", maxHeight: "200px", marginBottom: "12px" }}>{`const FIREBASE_CONFIG_HARDCODED = ${JSON.stringify(config, null, 2)};`}</pre>
        <button className="btn btn-secondary" onClick={() => navigator.clipboard?.writeText(`const FIREBASE_CONFIG_HARDCODED = ${JSON.stringify(config, null, 2)};`)} style={{ width: "100%" }}>Copiar Configuración</button>
      </div>
    </div>
  );
}

// ─── MODALS ───────────────────────────────────────────────────────────────────

function EmployeeDetailModal({ employee, onClose, setEmployees, employees }) {
  const [editName, setEditName] = useState(employee.name);
  const [editRole, setEditRole] = useState(employee.role);
  const [editVacationDays, setEditVacationDays] = useState(employee.vacationDays);
  const [workedHolidaysMap, setWorkedHolidaysMap] = useState(() => { const s = localStorage.getItem(`pardilla_wh_${employee.id}`); return s ? JSON.parse(s) : {}; });
  const [showCalendar, setShowCalendar] = useState(false);
  const totalVacation = employee.monthsWorked * 2.5 + employee.workedHolidays + editVacationDays;

  const handleToggle = (dateStr) => {
    const updated = { ...workedHolidaysMap, [dateStr]: !workedHolidaysMap[dateStr] };
    setWorkedHolidaysMap(updated); localStorage.setItem(`pardilla_wh_${employee.id}`, JSON.stringify(updated));
  };

  const handleSave = () => {
    const updated = employees.map(e => e.id === employee.id ? {...e, name: editName, role: editRole, vacationDays: editVacationDays} : e);
    setEmployees(updated); localStorage.setItem("pardilla_employees", JSON.stringify(updated)); onClose();
  };

  const handleDelete = () => {
    if (window.confirm(`¿Eliminar a ${employee.name}? Escribe su nombre para confirmar.`)) {
      const confirmed = window.prompt("Escribe el nombre del empleado para confirmar:");
      if (confirmed === employee.name) { const updated = employees.filter(e => e.id !== employee.id); setEmployees(updated); localStorage.setItem("pardilla_employees", JSON.stringify(updated)); onClose(); }
    }
  };

  return (
    <div className="modal"><div className="modal-content">
      <div className="modal-header"><span>{employee.name}</span><button className="modal-close" onClick={onClose}>×</button></div>
      <div className="stat-grid">
        <div className="stat-box"><div className="label">Meses Trabajados</div><div className="value">{employee.monthsWorked}</div></div>
        <div className="stat-box"><div className="label">Días Vacaciones</div><div className="value">{totalVacation.toFixed(1)}</div></div>
        <div className="stat-box"><div className="label">Festivos Trabajados</div><div className="value">{employee.workedHolidays}</div></div>
        <div className="stat-box"><div className="label">Tipo Jornada</div><div className="value" style={{ fontSize: "13px" }}>{employee.shiftType}</div></div>
      </div>
      <div className="form-group" style={{ marginTop: "20px" }}><label>Nombre</label><input type="text" className="input" value={editName} onChange={e => setEditName(e.target.value)} /></div>
      <div className="form-group"><label>Rol</label><select className="input" value={editRole} onChange={e => setEditRole(e.target.value)}>{ROLE_OPTIONS.map(r => <option key={r} value={r}>{r}</option>)}</select></div>
      <div className="form-group"><label>Días de Vacación</label>
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
                const date = new Date(2026, 3, 1 + i);
                const dateStr = date.toISOString().split("T")[0];
                const isHoliday = SPAIN_HOLIDAYS_2026.includes(dateStr);
                const isWorked = workedHolidaysMap[dateStr];
                return <div key={i} className={`cal-day ${isHoliday ? "holiday" : ""} ${isWorked ? "worked-holiday" : ""}`} onClick={() => handleToggle(dateStr)}>{i + 1}</div>;
              })}
            </div>
          </div>
        )}
      </div>
      <div className="modal-footer">
        <button className="btn btn-danger btn-sm" onClick={handleDelete}>Eliminar</button>
        <button className="btn btn-secondary btn-sm" onClick={onClose}>Cancelar</button>
        <button className="btn btn-primary btn-sm" onClick={handleSave}>Guardar</button>
      </div>
    </div></div>
  );
}

function ProductDetailModal({ product, onClose, products, setProducts }) {
  const [editPrice, setEditPrice] = useState(product.price);
  const competitors = getCompetitorPrices(product);
  const handleSave = () => {
    const updated = products.map(p => p.id === product.id ? {...p, price: parseFloat(editPrice)} : p);
    setProducts(updated); localStorage.setItem("pardilla_products", JSON.stringify(updated)); onClose();
  };
  return (
    <div className="modal"><div className="modal-content">
      <div className="modal-header"><span>{product.name}</span><button className="modal-close" onClick={onClose}>×</button></div>
      <div className="card"><h4 style={{ marginBottom: "8px" }}>Información</h4><p style={{ fontSize: "13px", color: "#666" }}>Categoría: {product.category}</p><p style={{ fontSize: "20px", fontWeight: "700", color: "var(--primary)", marginTop: "8px" }}>{product.price.toFixed(2)}€</p></div>
      <div className="card"><h4 style={{ marginBottom: "12px" }}>Precios Competencia</h4>{competitors.map((c, idx) => <div key={idx} style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: "1px solid var(--border)", fontSize: "13px" }}><span>{c.name}</span><span style={{ fontWeight: "600" }}>{c.price}€</span></div>)}</div>
      <div className="form-group"><label>Editar Precio</label><input type="number" className="input" step="0.01" value={editPrice} onChange={e => setEditPrice(parseFloat(e.target.value) || 0)} /></div>
      <div className="modal-footer"><button className="btn btn-secondary btn-sm" onClick={onClose}>Cancelar</button><button className="btn btn-primary btn-sm" onClick={handleSave}>Guardar</button></div>
    </div></div>
  );
}

function AddTaskModal({ onClose, onAdd }) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const handleSubmit = (e) => { e.preventDefault(); if (!title) return; onAdd({ title, description }); onClose(); };
  return (
    <div className="modal"><div className="modal-content">
      <div className="modal-header"><span>Nueva Tarea</span><button className="modal-close" onClick={onClose}>×</button></div>
      <form onSubmit={handleSubmit}>
        <div className="form-group"><label>Título</label><input type="text" className="input" value={title} onChange={e => setTitle(e.target.value)} placeholder="Ej: Revisar inventario" required /></div>
        <div className="form-group"><label>Descripción</label><textarea className="input" value={description} onChange={e => setDescription(e.target.value)} placeholder="Detalles..." style={{ minHeight: "100px" }}></textarea></div>
        <div className="modal-footer"><button type="button" className="btn btn-secondary btn-sm" onClick={onClose}>Cancelar</button><button type="submit" className="btn btn-primary btn-sm">Crear</button></div>
      </form>
    </div></div>
  );
}

function AddProductModal({ onClose, products, setProducts }) {
  const [name, setName] = useState("");
  const [category, setCategory] = useState("Bollería");
  const [price, setPrice] = useState("");
  const handleSubmit = (e) => {
    e.preventDefault(); if (!name || !price) return;
    const np = { id: Math.max(...products.map(p => p.id), 0) + 1, name, category, price: parseFloat(price) };
    const updated = [...products, np]; setProducts(updated); localStorage.setItem("pardilla_products", JSON.stringify(updated)); onClose();
  };
  return (
    <div className="modal"><div className="modal-content">
      <div className="modal-header"><span>Nuevo Producto</span><button className="modal-close" onClick={onClose}>×</button></div>
      <form onSubmit={handleSubmit}>
        <div className="form-group"><label>Nombre</label><input type="text" className="input" value={name} onChange={e => setName(e.target.value)} required /></div>
        <div className="form-group"><label>Categoría</label><select className="input" value={category} onChange={e => setCategory(e.target.value)}>{["Bollería","Tartas","Especialidades","Pasteles","Panadería","Salados","Cafetería"].map(c => <option key={c}>{c}</option>)}</select></div>
        <div className="form-group"><label>Precio (€)</label><input type="number" className="input" step="0.01" value={price} onChange={e => setPrice(e.target.value)} required /></div>
        <div className="modal-footer"><button type="button" className="btn btn-secondary btn-sm" onClick={onClose}>Cancelar</button><button type="submit" className="btn btn-primary btn-sm">Crear</button></div>
      </form>
    </div></div>
  );
}

function AddEmployeeModal({ onClose, employees, setEmployees }) {
  const [name, setName] = useState("");
  const [role, setRole] = useState("Ayudante de Dependienta");
  const [monthsWorked, setMonthsWorked] = useState(12);
  const handleSubmit = (e) => {
    e.preventDefault(); if (!name) return;
    const ne = { id: Math.max(...employees.map(e => e.id), 0) + 1, name, role, vacationDays: 0, workedHolidays: 0, monthsWorked, shiftType: "store" };
    const updated = [...employees, ne]; setEmployees(updated); localStorage.setItem("pardilla_employees", JSON.stringify(updated)); onClose();
  };
  return (
    <div className="modal"><div className="modal-content">
      <div className="modal-header"><span>Nuevo Empleado</span><button className="modal-close" onClick={onClose}>×</button></div>
      <form onSubmit={handleSubmit}>
        <div className="form-group"><label>Nombre</label><input type="text" className="input" value={name} onChange={e => setName(e.target.value)} required /></div>
        <div className="form-group"><label>Rol</label><select className="input" value={role} onChange={e => setRole(e.target.value)}>{ROLE_OPTIONS.map(r => <option key={r} value={r}>{r}</option>)}</select></div>
        <div className="form-group"><label>Meses Trabajados</label><input type="number" className="input" value={monthsWorked} onChange={e => setMonthsWorked(parseInt(e.target.value))} /></div>
        <div className="modal-footer"><button type="button" className="btn btn-secondary btn-sm" onClick={onClose}>Cancelar</button><button type="submit" className="btn btn-primary btn-sm">Crear</button></div>
      </form>
    </div></div>
  );
}

// ─── APP ──────────────────────────────────────────────────────────────────────
export default function App() {
  const [firebaseReady, setFirebaseReady] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [employees, setEmployees] = useState(() => { const s = localStorage.getItem("pardilla_employees"); return s ? JSON.parse(s) : EMPLOYEES_INIT; });
  const [products, setProducts] = useState(() => { const s = localStorage.getItem("pardilla_products"); return s ? JSON.parse(s) : PRODUCTS_INIT; });
  const [shiftTemplates] = useState(SHIFT_TEMPLATES_DEFAULT);
  const [rotationConfig, setRotationConfig] = useState(() => { const s = localStorage.getItem("pardilla_rotation"); return s ? JSON.parse(s) : ROTATION_DEFAULT; });
  const [vacationAssignments, setVacationAssignments] = useState(() => { const s = localStorage.getItem("pardilla_vacation_assignments"); return s ? JSON.parse(s) : []; });
  const [screen, setScreen] = useState("home");
  const [modalOpen, setModalOpen] = useState(null);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [notification, setNotification] = useState("");
  const [newVersion, setNewVersion] = useState(null);
  const [updateUrl, setUpdateUrl] = useState("");

  useEffect(() => { initFirebase(); }, []);

  // Acumulación mensual: +2.5 días (= +1 mes trabajado) el día 1 de cada mes
  useEffect(() => {
    const now = new Date();
    const currentYM = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
    const lastAccrual = localStorage.getItem("pardilla_last_accrual");
    if (!lastAccrual) { localStorage.setItem("pardilla_last_accrual", currentYM); return; }
    if (lastAccrual >= currentYM) return;
    const [ly, lm] = lastAccrual.split("-").map(Number);
    const [cy, cm] = currentYM.split("-").map(Number);
    const months = (cy - ly) * 12 + (cm - lm);
    if (months <= 0) return;
    const empsStr = localStorage.getItem("pardilla_employees");
    if (!empsStr) return;
    const emps = JSON.parse(empsStr);
    const updated = emps.map(e => ({ ...e, monthsWorked: e.monthsWorked + months }));
    setEmployees(updated);
    localStorage.setItem("pardilla_employees", JSON.stringify(updated));
    localStorage.setItem("pardilla_last_accrual", currentYM);
  }, []);

  // Crédito automático de vacaciones por festivos de la CM trabajados según turno
  useEffect(() => {
    const empsStr = localStorage.getItem("pardilla_employees");
    if (!empsStr) return;
    const emps = JSON.parse(empsStr);
    const credits = JSON.parse(localStorage.getItem("pardilla_holiday_credits") || "{}");
    const today = new Date(); today.setHours(23, 59, 59, 0);
    const newCredits = { ...credits };
    const updates = {};
    const dayKeys = ["D","L","M","X","J","V","S"];
    MADRID_HOLIDAYS_2026.forEach(dateStr => {
      const date = new Date(dateStr);
      if (date > today) return;
      const dow = date.getDay();
      if (dow === 0) return; // Excluir domingos
      const dayKey = dayKeys[dow];
      emps.forEach(emp => {
        const key = `${emp.id}_${dateStr}`;
        if (newCredits[key]) return;
        const shift = getCurrentShift(emp.id, date, rotationConfig);
        if (!shift || !SHIFT_TEMPLATES_DEFAULT[shift][dayKey]) return;
        updates[emp.id] = (updates[emp.id] || 0) + 1;
        newCredits[key] = true;
      });
    });
    if (Object.keys(updates).length === 0) return;
    const updated = emps.map(e => updates[e.id] ? { ...e, vacationDays: e.vacationDays + updates[e.id] } : e);
    setEmployees(updated);
    localStorage.setItem("pardilla_employees", JSON.stringify(updated));
    localStorage.setItem("pardilla_holiday_credits", JSON.stringify(newCredits));
  }, [rotationConfig]);

  // Listener en tiempo real de Firebase para sincronizar cambios de turno en todos los clientes
  useEffect(() => {
    if (!firebaseReady || !currentUser) return;
    const unsub = fb().firestore().collection("config").doc("rotation")
      .onSnapshot(doc => {
        if (doc.exists) {
          const data = doc.data();
          setRotationConfig(prev => JSON.stringify(prev) === JSON.stringify(data) ? prev : data);
          localStorage.setItem("pardilla_rotation", JSON.stringify(data));
        }
      }, err => console.error("Rotation sync:", err));
    return () => unsub();
  }, [firebaseReady, currentUser]);

  const checkForUpdates = (silent = false) => {
    if (!firebaseReady || !currentUser) return;
    fb().firestore().collection("config").doc("app_version").get()
      .then(doc => {
        if (!doc.exists) return;
        const { version, apkUrl, webUrl } = doc.data();
        const v = version ? version.trim() : null;
        const dismissed = localStorage.getItem("pardilla_dismissed_version");
        if (v && v !== APP_VERSION && v !== dismissed) {
          setNewVersion(v);
          const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
          setUpdateUrl(isIOS ? (webUrl || WEB_URL) : (apkUrl || `https://github.com/${GITHUB_REPO}/releases/latest`));
        } else if (!silent) {
          alert(`Tienes la versión más reciente (v${APP_VERSION})`);
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
      const str = localStorage.getItem("pardilla_firebase_config");
      if (!str) { setFirebaseReady(false); return; }
      try { config = JSON.parse(str); } catch { setFirebaseReady(false); return; }
    }
    try {
      if (!fb().apps.length) fb().initializeApp(config);
      fb().auth().onAuthStateChanged(async (user) => {
        setCurrentUser(user);
        if (user) { const p = await fb().firestore().collection("users").doc(user.uid).get(); if (p.exists) setUserProfile({ uid: user.uid, ...p.data() }); }
      });
      setFirebaseReady(true);
    } catch (e) { console.error("Firebase init error:", e); }
  };

  const handleConfigSet = (config) => { localStorage.setItem("pardilla_firebase_config", JSON.stringify(config)); initFirebase(); };
  const handleLoginSuccess = async (user) => { const p = await fb().firestore().collection("users").doc(user.uid).get(); if (p.exists) setUserProfile({ uid: user.uid, ...p.data() }); };
  const handleLogout = async () => { await fb().auth().signOut(); setCurrentUser(null); setUserProfile(null); };
  const showNotification = (msg) => { setNotification(msg); setTimeout(() => setNotification(""), 3000); };

  if (!firebaseReady) return <SetupScreen onConfigSet={handleConfigSet} />;
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
      {screen === "employees" && <EmployeesScreen employees={employees} setEmployees={setEmployees} onOpenModal={setModalOpen} onSelectEmployee={setSelectedEmployee} />}
      {screen === "products" && <ProductsScreen products={products} setProducts={setProducts} onOpenModal={setModalOpen} onSelectProduct={setSelectedProduct} />}
      {screen === "management" && <ManagementScreen />}
      {screen === "tasks" && <TasksScreen onOpenModal={setModalOpen} />}
      {screen === "schedule" && <ShiftPlanningScreen employees={employees} shiftTemplates={shiftTemplates} rotationConfig={rotationConfig} setRotationConfig={setRotationConfig} />}
      {screen === "vacation" && <VacationPlanningScreen employees={employees} setEmployees={setEmployees} userProfile={userProfile} vacationAssignments={vacationAssignments} setVacationAssignments={setVacationAssignments} />}
      {screen === "assignVacations" && <AssignVacationsScreen employees={employees} vacationAssignments={vacationAssignments} setVacationAssignments={setVacationAssignments} />}
      {screen === "miHorario" && <ConsultarHorarioScreen employees={employees} userProfile={userProfile} shiftTemplates={shiftTemplates} rotationConfig={rotationConfig} />}
      {screen === "fichar" && <FicharScreen userProfile={userProfile} employees={employees} shiftTemplates={shiftTemplates} rotationConfig={rotationConfig} />}
      {screen === "shiftConfig" && <ShiftConfigScreen shiftTemplates={shiftTemplates} rotationConfig={rotationConfig} />}
      {screen === "users" && <UserManagementScreen userProfile={userProfile} employees={employees} />}
      {screen === "firebase" && <FirebaseConfigScreen />}

      {selectedEmployee && <EmployeeDetailModal employee={selectedEmployee} onClose={() => setSelectedEmployee(null)} setEmployees={setEmployees} employees={employees} />}
      {selectedProduct && <ProductDetailModal product={selectedProduct} onClose={() => setSelectedProduct(null)} products={products} setProducts={setProducts} />}
      {modalOpen === "addTask" && <AddTaskModal onClose={() => setModalOpen(null)} onAdd={() => { showNotification("Tarea creada"); setModalOpen(null); }} />}
      {modalOpen === "addProduct" && <AddProductModal onClose={() => setModalOpen(null)} products={products} setProducts={setProducts} />}
      {modalOpen === "addEmployee" && <AddEmployeeModal onClose={() => setModalOpen(null)} employees={employees} setEmployees={setEmployees} />}
      {notification && <div className="notification">{notification}</div>}
    </div>
  );
}

// ─── Inject CSS ───────────────────────────────────────────────────────────────
const styleTag = document.createElement("style");
styleTag.textContent = styles;
document.head.appendChild(styleTag);
