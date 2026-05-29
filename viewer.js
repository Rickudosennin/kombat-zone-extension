<!DOCTYPE html>
<html lang="pt-br">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>FGC HUB | Red Edition</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <style>
        @import url('https://fonts.googleapis.com/css2?family=Oswald:wght@700&family=Roboto+Condensed:ital,wght@1,700&display=swap');
        
        body { background-color: #050505; color: #f8fafc; font-family: sans-serif; min-height: 100vh; display: flex; flex-direction: column; }
        .glass-card { 
            background: rgba(30, 30, 35, 0.9); 
            backdrop-filter: blur(10px); 
            border: 2px solid #dc2626; 
            box-shadow: 0 0 15px rgba(220, 38, 38, 0.2);
        }
        .btn-primary { 
            background: linear-gradient(to right, #991b1b, #dc2626); 
            transition: all 0.3s ease; 
        }
        .btn-primary:hover { 
            opacity: 0.9; 
            box-shadow: 0 0 20px rgba(220, 38, 38, 0.4);
            transform: translateY(-1px);
        }
        select { background-color: #1a1a1c !important; border-color: #3f3f46 !important; }
        main { flex: 1; }
        .btn-calendar { border: 1px solid #3f3f46; transition: all 0.2s ease; }
        .btn-calendar:hover { background-color: #ffffff; color: #000000; border-color: #ffffff; }
        .day-slot { transition: all 0.2s ease; border: 1px solid #2d2d30; }
        .day-available { background: rgba(34, 197, 94, 0.1); border-color: #22c55e; color: #22c55e; }
        .day-busy { background: rgba(220, 38, 38, 0.1); border-color: #dc2626; color: #ef4444; }
        .timer-red { color: #dc2626; font-family: monospace; font-weight: bold; }
        .timer-checkin { color: #3b82f6; font-family: monospace; font-weight: bold; }
        .timer-checkin-pending { color: #60a5fa; font-family: monospace; font-weight: bold; }
        .timer-end { color: #6b7280; font-family: monospace; font-weight: bold; }
        .timer-ready { color: #f59e0b; font-family: monospace; font-weight: bold; }
        .timer-active { color: #ef4444; font-family: monospace; font-weight: bold; animation: pulse 1.5s infinite; }
        .timer-completed { color: #22c55e; font-family: monospace; font-weight: bold; }
        .bracket-live-badge {
            background: rgba(220, 38, 38, 0.9);
            color: white;
            padding: 4px 12px;
            border-radius: 4px;
            font-size: 10px;
            font-weight: bold;
            text-transform: uppercase;
            letter-spacing: 1px;
            animation: pulse 1.5s infinite;
            white-space: nowrap;
            box-shadow: 0 0 12px rgba(220,38,38,0.5);
            display: inline-block;
            margin-bottom: 8px;
            text-align: center;
        }
        .bracket-upcoming-badge {
            background: rgba(245, 158, 11, 0.9);
            color: white;
            padding: 4px 12px;
            border-radius: 4px;
            font-size: 10px;
            font-weight: bold;
            text-transform: uppercase;
            letter-spacing: 1px;
            white-space: nowrap;
            box-shadow: 0 0 12px rgba(245,158,11,0.5);
            display: inline-block;
            margin-bottom: 8px;
            text-align: center;
        }
        @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.5; } }
        @keyframes slideIn { from { transform: translateX(100%); } to { transform: translateX(0); } }
        .animate-slide-in { animation: slideIn 0.3s ease-out; }

        /* ========== API STATUS INDICATOR ========== */
        .api-status-bar { position: fixed; bottom: 10px; right: 10px; z-index: 50; display: flex; align-items: center; gap: 8px; background: rgba(0,0,0,0.9); padding: 6px 14px; border-radius: 6px; border: 1px solid rgba(220,38,38,0.5); font-size: 10px; font-weight: bold; text-transform: uppercase; letter-spacing: 0.5px; backdrop-filter: blur(8px); box-shadow: 0 4px 15px rgba(0,0,0,0.5); }
        .status-dot { width: 8px; height: 8px; border-radius: 50%; }
        .status-online { background: #22c55e; box-shadow: 0 0 10px #22c55e; }
        .status-offline { background: #ef4444; box-shadow: 0 0 10px #ef4444; }
        .status-checking { background: #eab308; box-shadow: 0 0 10px #eab308; }

        /* ========== OVERLAY & SIDEBARS GLOBAL ========== */
        .overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.7); z-index: 9999; opacity: 0; pointer-events: none; transition: opacity 0.3s ease; }
        .overlay.active { opacity: 1; pointer-events: auto; }
        
        .sidebar-base { 
            position: fixed; top: 0; right: 0; width: 100%; height: 100vh; z-index: 10000; 
            background: #0b0e13; transform: translateX(100%); transition: transform 0.35s cubic-bezier(0.4, 0, 0.2, 1); 
            display: flex; flex-direction: column; 
        }
        .sidebar-base.open { transform: translateX(0); }
        
        .sidebar-header { display: flex; justify-content: space-between; align-items: center; padding: 16px 24px; background: rgba(0,0,0,0.95); flex-shrink: 0; }
        .sidebar-header h2 { font-size: 16px; color: white; text-transform: uppercase; letter-spacing: 2px; font-weight: bold; margin: 0; }
        .sidebar-content { flex: 1; overflow-y: auto; padding: 20px; }
        .sidebar-content::-webkit-scrollbar { width: 6px; height: 6px; }
        .sidebar-content::-webkit-scrollbar-track { background: #111; }
        
        .loading-attendees { text-align: center; padding: 40px; color: #aaa; }
        .loading-attendees .spinner { display: inline-block; width: 30px; height: 30px; border: 3px solid #333; border-radius: 50%; animation: spin 0.8s linear infinite; }
        @keyframes spin { to { transform: rotate(360deg); } }

        /* ========== ATTENDEES SIDEBAR ========== */
        .attendees-sidebar { max-width: 400px; border-left: 3px solid #dc2626; box-shadow: -10px 0 40px rgba(0,0,0,0.9); }
        .attendees-sidebar .sidebar-header { border-bottom: 2px solid #dc2626; }
        .attendees-sidebar .count { color: #dc2626; font-size: 14px; }
        .attendees-sidebar .btn-close { background: #dc2626; color: white; border: none; padding: 10px 18px; cursor: pointer; font-weight: bold; text-transform: uppercase; font-size: 13px; border-radius: 6px; transition: all 0.2s; }
        .attendees-sidebar .btn-close:hover { background: #ef4444; box-shadow: 0 0 15px rgba(220,38,38,0.5); }
        .attendees-sidebar .sidebar-content::-webkit-scrollbar-thumb { background: #dc2626; border-radius: 3px; }
        .attendees-sidebar .spinner { border-top-color: #dc2626; }

        .attendee-item { display: flex; align-items: center; gap: 12px; padding: 12px 16px; background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.06); border-radius: 8px; margin-bottom: 8px; transition: all 0.2s; }
        .attendee-item:hover { background: rgba(220,38,38,0.1); border-color: rgba(220,38,38,0.3); }
        .attendee-number { color: #dc2626; font-weight: bold; font-size: 13px; min-width: 30px; }
        .attendee-name { color: white; font-weight: 600; font-size: 14px; flex: 1; }
        .attendee-name.clickable { cursor: pointer; text-decoration: underline dotted; }
        .attendee-name.clickable:hover { color: #dc2626; }
        .attendee-flag { width: 28px; height: 20px; border-radius: 3px; object-fit: cover; }
        .attendees-icon-left { position: absolute; bottom: 8px; left: 10px; background: rgba(0,0,0,0.75); color: white; width: 28px; height: 28px; border-radius: 6px; display: flex; align-items: center; justify-content: center; cursor: pointer; z-index: 10; transition: all 0.2s ease; border: 1px solid rgba(255,255,255,0.2); padding: 0; }
        .attendees-icon-left:hover { background: #dc2626; border-color: #dc2626; box-shadow: 0 0 15px rgba(220,38,38,0.5); }

        /* PLAYER HISTORY STYLES */
        .player-history { background: rgba(255,255,255,0.02); border: 1px solid rgba(220,38,38,0.3); border-radius: 8px; padding: 12px; margin-top: 8px; margin-bottom: 12px; margin-left: 42px; }
        .history-title { font-size: 12px; font-weight: bold; color: #dc2626; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 10px; }
        .history-empty { font-size: 11px; color: #ef4444; font-weight: bold; background: rgba(239,68,68,0.1); padding: 8px; border-radius: 4px; border: 1px solid rgba(239,68,68,0.3); }
        .history-search { font-size: 11px; color: #aaa; padding: 8px; text-align: center; }
        .history-item { display: flex; align-items: center; gap: 10px; padding: 6px 0; border-bottom: 1px solid rgba(255,255,255,0.05); font-size: 11px; }
        .history-item:last-child { border-bottom: none; }
        .history-name { color: white; flex: 1; font-size: 11px; font-weight: bold; }
        .history-placement { font-weight: 900; font-size: 12px; }
        .history-winrate { font-size: 18px; font-weight: bold; margin-bottom: 12px; }
        .history-winrate-detail { font-size: 11px; color: #aaa; margin-bottom: 8px; }
        .history-winrate-60 { color: #22c55e; }
        .history-winrate-40 { color: #eab308; }
        .history-winrate-0 { color: #ef4444; }
        .legend-bar { display: flex; gap: 12px; padding: 10px 14px; background: rgba(220, 38, 38, 0.1); border: 1px solid rgba(220, 38, 38, 0.3); border-radius: 8px; margin-bottom: 16px; flex-wrap: wrap; position: sticky; top: 0; z-index: 5; backdrop-filter: blur(10px); }
        .legend-item { display: flex; align-items: center; gap: 6px; font-size: 10px; text-transform: uppercase; font-weight: bold; letter-spacing: 1px; color: white; }
        .legend-dot { width: 10px; height: 10px; border-radius: 50%; flex-shrink: 0; }
        .legend-dot.green { background: #22c55e; box-shadow: 0 0 8px rgba(34,197,94,0.5); }
        .legend-dot.yellow { background: #eab308; box-shadow: 0 0 8px rgba(234,179,8,0.5); }
        .legend-dot.red { background: #ef4444; box-shadow: 0 0 8px rgba(239,68,68,0.5); }

        /* ========== RANKING SIDEBAR ========== */
        .ranking-sidebar { max-width: 420px; border-left: 3px solid #7c3aed; box-shadow: -10px 0 40px rgba(124,58,237,0.25); }
        .ranking-sidebar .sidebar-header { border-bottom: 2px solid #7c3aed; }
        .ranking-sidebar .header-left { display: flex; flex-direction: column; gap: 2px; }
        .ranking-sidebar .league-name { color: #a855f7; font-size: 11px; font-weight: 700; letter-spacing: 1px; }
        .ranking-sidebar .btn-close { background: #7c3aed; color: white; border: none; padding: 10px 18px; cursor: pointer; font-weight: bold; text-transform: uppercase; font-size: 13px; border-radius: 6px; transition: all 0.2s; }
        .ranking-sidebar .btn-close:hover { background: #9333ea; box-shadow: 0 0 15px rgba(124,58,237,0.5); }
        .ranking-sidebar .sidebar-content::-webkit-scrollbar-thumb { background: #7c3aed; border-radius: 3px; }
        .ranking-sidebar .spinner { border-top-color: #7c3aed; }

        .btn-ranking { display: flex; align-items: center; justify-content: center; gap: 6px; background: linear-gradient(135deg, #7c3aed, #a855f7); color: white; font-weight: 900; font-size: 10px; text-transform: uppercase; letter-spacing: 1.5px; padding: 8px 12px; border-radius: 8px; border: 1px solid rgba(168,85,247,0.5); cursor: pointer; transition: all 0.2s ease; box-shadow: 0 0 12px rgba(124,58,237,0.3); }
        .btn-ranking:hover { background: linear-gradient(135deg, #6d28d9, #9333ea); box-shadow: 0 0 22px rgba(124,58,237,0.6); transform: translateY(-1px); }
        .league-badge { display: inline-flex; align-items: center; gap: 4px; background: rgba(124,58,237,0.15); border: 1px solid rgba(168,85,247,0.4); color: #c084fc; font-size: 9px; font-weight: 800; text-transform: uppercase; letter-spacing: 1px; padding: 3px 8px; border-radius: 4px; margin-bottom: 6px; }

        .ranking-player-card { display: flex; align-items: center; gap: 12px; padding: 12px 16px; border-radius: 10px; margin-bottom: 8px; border: 1px solid rgba(255,255,255,0.05); background: rgba(255,255,255,0.03); transition: all 0.2s; position: relative; overflow: hidden; }
        .ranking-player-card:hover { background: rgba(124,58,237,0.1); border-color: rgba(168,85,247,0.35); }
        .ranking-player-card.rank-1 { border-color: rgba(255,204,0,0.45); background: rgba(255,204,0,0.05); }
        .ranking-player-card.rank-2 { border-color: rgba(192,192,192,0.4); background: rgba(192,192,192,0.04); }
        .ranking-player-card.rank-3 { border-color: rgba(176,110,60,0.4); background: rgba(176,110,60,0.04); }
        .rank-number { font-size: 20px; font-weight: 900; font-style: italic; min-width: 38px; text-align: center; font-family: 'Georgia', serif; }
        .rank-number.rank-1 { color: #ffcc00; text-shadow: 0 0 12px rgba(255,204,0,0.5); }
        .rank-number.rank-2 { color: #c0c0c0; text-shadow: 0 0 12px rgba(192,192,192,0.4); }
        .rank-number.rank-3 { color: #b06e3c; text-shadow: 0 0 12px rgba(176,110,60,0.4); }
        .rank-number.rank-other { color: #555; }
        .ranking-player-info { flex: 1; min-width: 0; }
        .ranking-player-name { color: white; font-weight: 700; font-size: 14px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
        .ranking-player-pts { color: #a855f7; font-size: 11px; font-weight: 800; letter-spacing: 0.5px; margin-top: 2px; }
        .ranking-flag { width: 28px; height: 20px; border-radius: 3px; object-fit: cover; flex-shrink: 0; }
        .ranking-flag-placeholder { width: 28px; height: 20px; background: rgba(255,255,255,0.05); border-radius: 3px; flex-shrink: 0; }
        .ranking-bar-wrap { position: absolute; bottom: 0; left: 0; right: 0; height: 2px; background: rgba(255,255,255,0.04); }
        .ranking-bar-fill { height: 100%; border-radius: 0 2px 2px 0; transition: width 0.6s ease; }
        .rank-1 .ranking-bar-fill { background: #ffcc00; }
        .rank-2 .ranking-bar-fill { background: #c0c0c0; }
        .rank-3 .ranking-bar-fill { background: #b06e3c; }
        .rank-other-bar { background: #7c3aed; }
        .ranking-footer-link { flex-shrink: 0; padding: 12px 20px; border-top: 1px solid rgba(124,58,237,0.2); background: rgba(0,0,0,0.6); }
        .ranking-footer-link a { display: flex; align-items: center; justify-content: center; gap: 6px; color: #a855f7; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 1px; text-decoration: none; padding: 8px; border-radius: 6px; border: 1px solid rgba(168,85,247,0.3); transition: all 0.2s; }
        .ranking-footer-link a:hover { background: rgba(124,58,237,0.2); border-color: #a855f7; }

        /* ========== BRACKET SIDEBAR & BUTTON ========== */
        .btn-bracket { display: flex; align-items: center; justify-content: center; gap: 6px; background: linear-gradient(135deg, #1e3a8a, #3b82f6); color: white; font-weight: 900; font-size: 10px; text-transform: uppercase; letter-spacing: 1.5px; padding: 8px 12px; border-radius: 8px; border: 1px solid rgba(59,130,246,0.5); cursor: pointer; transition: all 0.2s ease; box-shadow: 0 0 12px rgba(59,130,246,0.3); }
        .btn-bracket:hover { background: linear-gradient(135deg, #1e40af, #2563eb); box-shadow: 0 0 22px rgba(59,130,246,0.6); transform: translateY(-1px); }

        .bracket-sidebar { max-width: 100%; border-left: 3px solid #3b82f6; box-shadow: -10px 0 40px rgba(59,130,246,0.25); }
        .bracket-sidebar .sidebar-header { border-bottom: 2px solid #3b82f6; }
        .bracket-sidebar .header-left { display: flex; align-items: center; gap: 15px; flex-wrap: wrap; }
        .bracket-sidebar .btn-close { background: #3b82f6; color: white; border: none; padding: 10px 18px; cursor: pointer; font-weight: bold; text-transform: uppercase; font-size: 13px; border-radius: 6px; transition: all 0.2s; }
        .bracket-sidebar .btn-close:hover { background: #2563eb; box-shadow: 0 0 15px rgba(59,130,246,0.5); }
        .bracket-sidebar .sidebar-content { overflow: auto; padding: 0; background: #0b0e13; position: relative; }
        .bracket-sidebar .sidebar-content::-webkit-scrollbar-thumb { background: #3b82f6; border-radius: 3px; }
        .bracket-sidebar .spinner { border-top-color: #3b82f6; }
        
        .event-select { background: #1a1a1c; border: 1px solid #3b82f6; color: white; padding: 6px 12px; border-radius: 6px; font-size: 12px; outline: none; cursor: pointer; }

        /* BRACKET LAYOUT START GG */
        .brk-container { --magenta: #ff0055; --led-red: #ff3366; --gold: #ffd700; font-family: 'Oswald', sans-serif; padding: 50px; display: flex; flex-direction: column; gap: 40px; position: relative; z-index: 10; width: max-content; }
        .brk-row { display: flex; gap: 60px; align-items: flex-start; min-height: 200px; flex-wrap: nowrap; position: relative; }
        .brk-label { color: #ffffff; text-transform: uppercase; font-size: 28px; margin-bottom: 15px; border-left: 8px solid var(--magenta); padding-left: 15px; letter-spacing: 2px; }
        .brk-column { display: flex; flex-direction: column; gap: 40px; min-width: 420px; position: relative; }
        .brk-round-title { font-size: 20px; text-transform: uppercase; color: #ffffff; border-bottom: 2px solid #444; padding-bottom: 8px; margin-bottom: 10px; }
        .brk-match-card { background: #161a21; width: 420px; border: 2px solid #333; box-shadow: 0 6px 20px rgba(0,0,0,0.6); position: relative; z-index: 20; }
        .brk-match-card.on-stream { border: 2px solid var(--gold) !important; box-shadow: 0 0 25px rgba(255, 215, 0, 0.5); }
        .brk-match-card.on-stream::after { content: "LIVE ON STREAM"; position: absolute; top: -18px; right: -2px; background: var(--gold); color: black; font-size: 11px; font-weight: 900; padding: 2px 10px; border-radius: 2px; }
        .brk-player { display: flex; justify-content: space-between; align-items: center; height: 65px; padding: 0 0 0 20px; border-bottom: 2px solid #000; position: relative; }
        .brk-name-container { display: flex; align-items: center; overflow: hidden; }
        .brk-name { font-size: 24px; text-transform: uppercase; font-weight: 700; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 280px; color: white; }
        .brk-score { background: #232933; width: 70px; height: 100%; display: flex; justify-content: center; align-items: center; font-size: 32px; color: #ffffff; font-weight: bold; }
        .brk-winner { border-left: 8px solid var(--led-red); background: rgba(255, 51, 102, 0.15); box-shadow: -5px 0 15px rgba(255, 51, 102, 0.5); }
        .brk-winner .brk-score { background: var(--led-red); }
        .brk-loser .brk-name { color: #cccccc; }
        .brk-loser .brk-score { background: #333; color: #ffffff; }
        .brk-flag-img { width: 35px; height: auto; margin-right: 12px; border-radius: 3px; box-shadow: 0 0 6px rgba(0,0,0,0.8); flex-shrink: 0; }
        .brk-connector { position: absolute; background: #333; z-index: 5; overflow: hidden; pointer-events: none; }
        .brk-led-flow { position: absolute; background: var(--led-red); box-shadow: 0 0 10px var(--led-red), 0 0 20px var(--led-red); animation: brk-led-animation 2s linear infinite; }
        .brk-empty-area { display: none; }

        @keyframes brk-led-animation { 0% { transform: translateX(-100%); } 100% { transform: translateX(100%); } }
        @keyframes brk-led-animation-v-down { 0% { transform: translateY(-100%); } 100% { transform: translateY(100%); } }
        @keyframes brk-led-animation-v-up { 0% { transform: translateY(100%); } 100% { transform: translateY(-100%); } }

        @media (max-width: 768px) { 
            .api-status-bar { bottom: 5px; right: 5px; padding: 4px 10px; font-size: 9px; }
            .attendees-icon-left { display: flex; width: 24px; height: 24px; bottom: 6px; left: 6px; border-radius: 4px; }
            .attendees-icon-left i { font-size: 10px; }
            .attendees-sidebar, .ranking-sidebar, .bracket-sidebar { max-width: 100%; border-left: none; }
            .sidebar-header { padding: 12px 16px; flex-wrap: wrap; gap: 10px; }
            .sidebar-header h2 { font-size: 14px; }
            .sidebar-content { padding: 12px; }
            .btn-close { padding: 8px 14px; font-size: 11px; }
            .attendee-item { padding: 10px 12px; gap: 8px; }
            .attendee-name { font-size: 13px; }
            .attendee-number { font-size: 11px; min-width: 24px; }
            .attendee-flag { width: 22px; height: 16px; }
            .player-history { margin-left: 36px; }
            .brk-container { padding: 20px; gap: 20px; }
            .brk-row { gap: 30px; }
            .brk-column { min-width: 280px; gap: 20px; }
            .brk-match-card { width: 280px; }
            .brk-player { height: 45px; }
            .brk-name { font-size: 16px; max-width: 150px; }
            .brk-score { width: 40px; font-size: 20px; }
            .brk-flag-img { width: 24px; }
            .brk-label { font-size: 18px; }
            .brk-round-title { font-size: 14px; }
        }
    </style>
</head>
<body class="p-4 md:p-10">

    <div class="api-status-bar">
        <div id="api_status_dot" class="status-dot status-checking"></div>
        <span id="api_status_text" class="text-slate-300">API: Verificando...</span>
    </div>

    <div class="absolute top-4 right-4 md:top-10 md:right-10 z-40">
        <button onclick="toggleChangelog()" class="text-slate-400 hover:text-red-500 transition-all p-2 rounded-full hover:bg-white/5">
            <i class="fa-solid fa-ellipsis-vertical text-2xl"></i>
        </button>
    </div>

    <div id="changelog_modal" class="fixed inset-0 z-50 hidden">
        <div class="absolute inset-0 bg-black/80 backdrop-blur-sm" onclick="toggleChangelog()"></div>
        <div class="absolute right-0 top-0 h-full w-full max-w-sm glass-card border-l border-red-600 p-6 overflow-y-auto animate-slide-in">
            <div class="flex justify-between items-center mb-8">
                <h2 class="text-xl font-black text-white uppercase italic flex items-center gap-2"><i class="fa-solid fa-code-branch text-red-600"></i> Changelog</h2>
                <button onclick="toggleChangelog()" class="text-slate-500 hover:text-white text-2xl">&times;</button>
            </div>
            <div class="space-y-6">
                <div class="border-l-2 border-green-500 pl-4">
                    <span class="bg-green-600 text-white text-[10px] font-black px-2 py-0.5 rounded">V2.4</span>
                    <h3 class="text-white font-bold text-sm uppercase mt-1">Paginação de Inscritos</h3>
                    <ul class="text-[11px] text-slate-400 mt-2 space-y-2">
                        <li>• <span class="text-green-400 font-bold">Sem limite de 100:</span> Quando o torneio tem mais de 100 inscritos, o botão "Carregar mais" aparece automaticamente no rodapé da lista.</li>
                        <li>• <span class="text-green-400 font-bold">Progressivo:</span> Cada clique carrega mais 100 players sem recarregar os já exibidos.</li>
                        <li>• <span class="text-green-400 font-bold">Contador real:</span> O total de inscritos exibido no topo reflete o número real do torneio, não apenas os carregados.</li>
                    </ul>
                </div>
                <div class="border-l-2 border-blue-500 pl-4">
                    <span class="bg-blue-600 text-white text-[10px] font-black px-2 py-0.5 rounded">V2.3</span>
                    <h3 class="text-white font-bold text-sm uppercase mt-1">Timer de Check-in & Status da Bracket</h3>
                    <ul class="text-[11px] text-slate-400 mt-2 space-y-2">
                        <li>• <span class="text-blue-400 font-bold">Check-in:</span> Timer se adapta automaticamente quando o evento possui check-in habilitado.</li>
                        <li>• <span class="text-blue-400 font-bold">Transições:</span> Inscrições abertas → Check-in aberto → Bracket iniciando/em andamento/finalizado.</li>
                        <li>• <span class="text-blue-400 font-bold">ActivityState:</span> Exibe status real do evento (READY, ACTIVE, COMPLETED) após o período de check-in.</li>
                    </ul>
                </div>
                <div class="border-l-2 border-blue-500 pl-4">
                    <span class="bg-blue-600 text-white text-[10px] font-black px-2 py-0.5 rounded">V2.2</span>
                    <h3 class="text-white font-bold text-sm uppercase mt-1">Bracket Pools & Filters</h3>
                    <ul class="text-[11px] text-slate-400 mt-2 space-y-2">
                        <li>• <span class="text-blue-400 font-bold">Filtro de Pools:</span> Menu dropdown exibe Fase e os seus respectivos Grupos (Pools) separados.</li>
                        <li>• <span class="text-blue-400 font-bold">Layout Start.gg:</span> Conectores animados e marcação de transmissões nativos.</li>
                    </ul>
                </div>
                <div class="border-l-2 border-purple-500 pl-4">
                    <span class="bg-purple-600 text-white text-[10px] font-black px-2 py-0.5 rounded">V2.1</span>
                    <h3 class="text-white font-bold text-sm uppercase mt-1">Rankings de Liga</h3>
                    <ul class="text-[11px] text-slate-400 mt-2 space-y-2">
                        <li>• <span class="text-purple-400 font-bold">Botão RANKING:</span> Torneios vinculados a uma liga exibem badge roxo e botão direto que abre a classificação da liga em painel lateral.</li>
                        <li>• <span class="text-purple-400 font-bold">Sidebar de Classificação:</span> Painel igual ao de inscritos, com top 3 em 🥇🥈🥉 ouro/prata/bronze, barra de pontos proporcional, bandeiras e total de pontos de cada jogador.</li>
                        <li>• <span class="text-purple-400 font-bold">Ligas monitoradas:</span> Kombat Ranking MK1 · Kombat Zone Tekken 8 BR 2026 · Kampeonato Brasileiro MK1.</li>
                        <li>• <span class="text-purple-400 font-bold">Auto-detecção:</span> Cruza o Event Schedule de cada liga com os resultados da pesquisa sem impacto na busca original.</li>
                        <li>• <span class="text-purple-400 font-bold">Link externo:</span> Rodapé do painel com atalho para ver o ranking completo no start.gg.</li>
                    </ul>
                </div>
                <div class="border-l-2 border-red-600 pl-4 opacity-70">
                    <span class="bg-red-600 text-white text-[10px] font-black px-2 py-0.5 rounded">V2.0</span>
                    <h3 class="text-white font-bold text-sm uppercase mt-1">WinRate Real</h3>
                    <ul class="text-[11px] text-slate-400 mt-2 space-y-2">
                        <li>• <span class="text-red-400 font-bold">Wins/Losses:</span> Clique no nome do jogador para ver o WinRate real dos últimos 10 torneios.</li>
                        <li>• <span class="text-red-400 font-bold">Busca por Sets:</span> Calcula vitórias e derrotas diretamente dos sets de cada evento.</li>
                        <li>• 🟢 60%+ | 🟡 40-59% | 🔴 abaixo de 40%</li>
                    </ul>
                </div>
                <div class="border-l-2 border-slate-700 pl-4 opacity-70">
                    <span class="bg-slate-700 text-white text-[10px] font-black px-2 py-0.5 rounded">V1.9</span>
                    <h3 class="text-white font-bold text-sm uppercase mt-1">Direct API Sync</h3>
                    <ul class="text-[11px] text-slate-400 mt-2 space-y-2">
                        <li>• <span class="text-red-400 font-bold">API Key:</span> Conexão direta com start.gg via Client-Side.</li>
                        <li>• <span class="text-red-400 font-bold">Status Badge:</span> Monitor fixo no rodapé indicando saúde da API em tempo real.</li>
                    </ul>
                </div>
                <div class="border-l-2 border-slate-700 pl-4 opacity-70">
                    <span class="bg-slate-700 text-white text-[10px] font-black px-2 py-0.5 rounded">V1.8</span>
                    <h3 class="text-white font-bold text-sm uppercase mt-1">Attendees Panel & Histórico</h3>
                    <ul class="text-[11px] text-slate-400 mt-2 space-y-2">
                        <li>• <span class="text-red-400 font-bold">Lista de Inscritos:</span> Clique no ícone 👥 no canto inferior esquerdo do banner para ver todos os participantes.</li>
                        <li>• <span class="text-red-400 font-bold">Sidebar Desktop/Mobile:</span> Painel lateral adaptável (400px no desktop, tela cheia no mobile).</li>
                        <li>• <span class="text-red-400 font-bold">Histórico do Jogador:</span> Clique no nome para ver os últimos 10 torneios com W/L e colocação.</li>
                        <li>• <span class="text-red-400 font-bold">Invincible Vs.:</span> Adicionado o jogo Invincible Vs. (IVS) à lista de jogos.</li>
                    </ul>
                </div>
                <div class="border-l-2 border-slate-700 pl-4 opacity-70">
                    <span class="bg-slate-700 text-white text-[10px] font-black px-2 py-0.5 rounded">V1.7</span>
                    <h3 class="text-white font-bold text-sm uppercase mt-1">Live / Streams</h3>
                    <ul class="text-[11px] text-slate-400 mt-2 space-y-2">
                        <li>• <span class="text-red-400 font-bold">Live Detection:</span> Badge "LIVE" pulsante automático quando uma partida está em progresso.</li>
                        <li>• <span class="text-red-400 font-bold">Stream Icons:</span> Identificação visual de Twitch/YT no banner do torneio.</li>
                    </ul>
                </div>
                <div class="border-l-2 border-slate-700 pl-4 opacity-70">
                    <span class="bg-slate-700 text-white text-[10px] font-black px-2 py-0.5 rounded">V1.6</span>
                    <h3 class="text-white font-bold text-sm uppercase mt-1">Banner do Evento</h3>
                    <ul class="text-[11px] text-slate-400 mt-2 space-y-2">
                        <li>• <span class="text-red-400 font-bold">Layout Visual:</span> Banner do torneio exibido como fundo dinâmico com gradiente nos cards.</li>
                    </ul>
                </div>
                <div class="border-l-2 border-slate-700 pl-4 opacity-70">
                    <span class="bg-slate-700 text-white text-[10px] font-black px-2 py-0.5 rounded">V1.5</span>
                    <h3 class="text-white font-bold text-sm uppercase mt-1">TO Responsável</h3>
                    <ul class="text-[11px] text-slate-400 mt-2 space-y-2">
                        <li>• <span class="text-red-400 font-bold">Identificação:</span> Nome do organizador (Tournament Organizer) visível nos cards de torneio.</li>
                    </ul>
                </div>
                <div class="border-l-2 border-slate-700 pl-4 opacity-70">
                    <span class="bg-slate-700 text-white text-[10px] font-black px-2 py-0.5 rounded">V1.4</span>
                    <h3 class="text-white font-bold text-sm uppercase mt-1">Inscritos</h3>
                    <ul class="text-[11px] text-slate-400 mt-2 space-y-2">
                        <li>• <span class="text-red-400 font-bold">Contador:</span> Quantidade de participantes inscritos exibida em cada card de torneio.</li>
                    </ul>
                </div>
                <div class="border-l-2 border-slate-700 pl-4 opacity-70">
                    <span class="bg-slate-700 text-white text-[10px] font-black px-2 py-0.5 rounded">V1.3</span>
                    <h3 class="text-white font-bold text-sm uppercase mt-1">Calendário & Timer</h3>
                    <ul class="text-[11px] text-slate-400 mt-2 space-y-2">
                        <li>• <span class="text-red-400 font-bold">Timer Regressivo:</span> Contagem regressiva em tempo real até o encerramento das inscrições.</li>
                        <li>• <span class="text-green-400 font-bold">Mapa de Disponibilidade:</span> Painel com os próximos 14 dias mostrando datas livres e ocupadas para TOs.</li>
                    </ul>
                </div>
                <div class="border-l-2 border-slate-700 pl-4 opacity-70">
                    <span class="bg-slate-700 text-white text-[10px] font-black px-2 py-0.5 rounded">V1.2</span>
                    <h3 class="text-white font-bold text-sm uppercase mt-1">Integração Google Calendar</h3>
                    <ul class="text-[11px] text-slate-400 mt-2 space-y-2">
                        <li>• <span class="text-red-400 font-bold">Suporte direto ao Google Calendar:</span> Botão para adicionar qualquer torneio diretamente à sua agenda com um clique.</li>
                    </ul>
                </div>
            </div>
        </div>
    </div>

    <div class="overlay" id="attendees_overlay" onclick="fecharAttendees()"></div>
    <div class="sidebar-base attendees-sidebar" id="attendees_sidebar">
        <div class="sidebar-header"><div><h2>👥 INSCRITOS</h2><span class="count" id="attendees_count"></span></div><button class="btn-close" onclick="fecharAttendees()"><i class="fa-solid fa-times mr-1"></i> VOLTAR</button></div>
        <div class="sidebar-content" id="attendees_content"><div class="loading-attendees"><div class="spinner"></div><p style="margin-top:15px;">Carregando inscritos...</p></div></div>
    </div>

    <div class="overlay" id="ranking_overlay" onclick="fecharRanking()"></div>
    <div class="sidebar-base ranking-sidebar" id="ranking_sidebar">
        <div class="sidebar-header">
            <div class="header-left"><h2>🏆 CLASSIFICAÇÃO</h2><span class="league-name" id="ranking_league_name">Carregando...</span></div>
            <button class="btn-close" onclick="fecharRanking()"><i class="fa-solid fa-times mr-1"></i> VOLTAR</button>
        </div>
        <div class="sidebar-content" id="ranking_content">
            <div class="loading-attendees"><div class="spinner-purple"></div><p style="margin-top:15px;color:#aaa;">Carregando ranking...</p></div>
        </div>
        <div class="ranking-footer-link"><a id="ranking_external_link" href="#" target="_blank"><i class="fa-solid fa-arrow-up-right-from-square"></i> Ver ranking completo</a></div>
    </div>

    <div class="overlay" id="bracket_overlay" onclick="fecharBracket()"></div>
    <div class="sidebar-base bracket-sidebar" id="bracket_sidebar">
        <div class="sidebar-header">
            <div class="header-left">
                <h2>🎮 BRACKET</h2>
                <select class="event-select" id="bracketEventSelect" style="display:none;" onchange="onBracketEventChange()">
                    <option value="">Selecione um evento</option>
                </select>
                <select class="event-select" id="bracketPoolSelect" style="display:none;" onchange="onBracketPoolChange()">
                    </select>
            </div>
            <button class="btn-close" onclick="fecharBracket()"><i class="fa-solid fa-times mr-1"></i> VOLTAR</button>
        </div>
        <div class="sidebar-content" id="bracket_content">
            <div class="loading-attendees"><div class="spinner"></div><p style="margin-top:15px;color:#aaa;">Carregando chaves...</p></div>
        </div>
    </div>

    <main class="max-w-6xl mx-auto w-full">
        <header class="text-center mb-10"><h1 class="text-4xl font-black text-white mb-2 tracking-tight uppercase italic">FGC TOURNAMENT <span class="text-red-600">HUB</span></h1><p class="text-slate-400 font-medium">Busca avançada de torneios</p></header>
        <div class="glass-card p-6 rounded-xl grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div><label class="block text-xs font-bold uppercase text-red-500 mb-2">Jogo</label><select id="campo_jogo" class="w-full p-3 rounded-lg border border-slate-700 text-white outline-none focus:border-red-500"><option value="">Carregando jogos...</option></select></div>
            <div><label class="block text-xs font-bold uppercase text-red-500 mb-2">Formato</label><select id="campo_tipo" class="w-full p-3 rounded-lg border border-slate-700 text-white outline-none focus:border-red-500"><option value="online">Online</option><option value="offline">Presencial (Offline)</option></select></div>
            <div><label class="block text-xs font-bold uppercase text-red-500 mb-2">Região / País</label><select id="campo_local" class="w-full p-3 rounded-lg border border-slate-700 text-white outline-none focus:border-red-500"><option value="south-america">América do Sul</option><option value="worldwide">Mundo Inteiro</option></select></div>
            <div class="flex items-end"><button onclick="pesquisar()" class="w-full btn-primary text-white p-3 rounded-lg font-black uppercase tracking-tighter shadow-lg">PESQUISAR</button></div>
        </div>
        <div id="painel_disponibilidade" class="hidden glass-card p-6 rounded-xl mb-10 border-slate-800 bg-black/40"><h2 class="text-sm font-bold text-white uppercase tracking-widest mb-4 flex items-center gap-2"><i class="fa-solid fa-calendar-days text-green-500"></i> Sugestão de Datas (Próximos 14 dias)</h2><div id="grid_dias" class="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-3"></div></div>
        <div id="status" class="hidden text-center py-10"><div class="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-red-600"></div><p class="mt-2 text-red-500 font-bold uppercase text-sm">Sincronizando cronogramas...</p></div>
        <div id="resultados" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-10"></div>
    </main>

    <footer class="max-w-5xl mx-auto w-full mt-10 border-t border-slate-800 pt-8 pb-4">
        <div class="flex flex-col md:flex-row justify-around items-center gap-6 text-sm text-slate-400">
            <div class="text-center md:text-left"><p class="uppercase text-[10px] font-bold tracking-widest text-red-500 mb-1">Programador e Desenvolvedor</p><div class="flex items-center justify-center md:justify-start gap-2"><span class="font-bold text-white">CAIONP20</span><a href="https://x.com/caio20silva" target="_blank" class="hover:text-red-500 transition-colors"><i class="fab fa-x-twitter text-lg"></i></a></div></div>
            <div class="text-center md:text-left"><p class="uppercase text-[10px] font-bold tracking-widest text-red-500 mb-1">Programador e Designer</p><div class="flex items-center justify-center md:justify-start gap-2"><span class="font-bold text-white">KZ | Rickudosennin</span><a href="https://x.com/Pcesaroficial" target="_blank" class="hover:text-red-500 transition-colors"><i class="fab fa-x-twitter text-lg"></i></a></div></div>
        </div>
        <p class="text-center text-[10px] text-slate-600 mt-8 uppercase tracking-widest">Powered by Start.gg</p>
    </footer>

    <script>
        const STARTGG_KEY = 'f03f14bdb7f71b5e58ec3555c821dbbd';
        const STARTGG_API = 'https://api.start.gg/gql/alpha';

        const COUNTRY_MAP = {
            "Brazil":"BR","United States":"US","Argentina":"AR","Chile":"CL","Colombia":"CO",
            "Mexico":"MX","Peru":"PE","Venezuela":"VE","Ecuador":"EC","Bolivia":"BO",
            "Paraguay":"PY","Uruguay":"UY","Portugal":"PT","Spain":"ES","France":"FR",
            "Germany":"DE","Italy":"IT","Japan":"JP","South Korea":"KR","Canada":"CA",
            "United Kingdom":"GB","Australia":"AU","Netherlands":"NL","Sweden":"SE"
        };
        const games = [
            { "label": "2XKO", "value": "2XKO", "videogameId": 64423 }, { "label": "BlazBlue: Central Fiction", "value": "BBCF", "videogameId": 37 },
            { "label": "Brawlhalla", "value": "Brawlhalla", "videogameId": 15 }, { "label": "DNF Duel", "value": "DNF", "videogameId": 44345 },
            { "label": "Dragon Ball FighterZ", "value": "DBFZ", "videogameId": 287 }, { "label": "Fatal Fury: COTW", "value": "FFCOTW", "videogameId": 73221 },
            { "label": "Granblue Fantasy Versus: Rising", "value": "GBVSR", "videogameId": 48548 }, { "label": "Guilty Gear: Strive", "value": "GGST", "videogameId": 33945 },
            { "label": "Invincible Vs.", "value": "IVS", "videogameId": 108058 }, { "label": "Injustice 2", "value": "INJ2", "videogameId": 35 },
            { "label": "Marvel vs. Capcom 2", "value": "MVC2", "videogameId": 125 }, { "label": "Melty Blood: Type Lumina", "value": "MBTL", "videogameId": 35879 },
            { "label": "Mortal Kombat 1", "value": "MK1", "videogameId": 48599 }, { "label": "Mortal Kombat 11", "value": "MK11", "videogameId": 3200 },
            { "label": "Mortal Kombat X", "value": "MKX", "videogameId": 22 }, { "label": "Ultimate Mortal Kombat 3", "value": "UMK3", "videogameId": 55 },
            { "label": "MultiVersus", "value": "MVS", "videogameId": 45044 }, { "label": "Pocket Bravery", "value": "PB", "videogameId": 44108 },
            { "label": "Rivals of Aether", "value": "ROA", "videogameId": 24, "hidden": true }, { "label": "Rocket League", "value": "ROCKET_LEAGUE", "videogameId": 17 },
            { "label": "SAMURAI SHODOWN", "value": "SS", "videogameId": 3568, "hidden": true },
            { "label": "Skullgirls 2nd Encore", "value": "SG", "videogameId": 12 }, { "label": "Street Fighter 6", "value": "SF6", "videogameId": 43868 },
            { "label": "Street Fighter III: 3rd Strike", "value": "SF3", "videogameId": 43 }, { "label": "Super Smash Bros. Melee", "value": "SSBM", "videogameId": 1 },
            { "label": "Super Smash Bros. Ultimate", "value": "SSBU", "videogameId": 1386 }, { "label": "Super Street Fighter II Turbo", "value": "ST", "videogameId": 33 },
            { "label": "Tekken 7", "value": "TEKKEN7", "videogameId": 17, "hidden": true }, { "label": "Tekken 8", "value": "TEKKEN8", "videogameId": 49783 },
            { "label": "The King of Fighters XV", "value": "KOF XV", "videogameId": 36963 }, { "label": "Ultimate Marvel vs. Capcom 3", "value": "UMVC3", "videogameId": 10, "hidden": true },
            { "label": "Under Night In-Birth II Sys:Celes", "value": "UNISC", "videogameId": 50203 },{ "label": "Vampire Savior", "value": "VSAVIOR", "videogameId": 11602 }
        ];
        const southAmericanCountries = ["Brazil","Argentina","Chile","Colombia","Peru","Uruguay","Paraguay","Ecuador","Bolivia","Venezuela"];

        async function callStartGG(query, variables = {}) {
            const res = await fetch(STARTGG_API, { method: 'POST', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${STARTGG_KEY}` }, body: JSON.stringify({ query, variables }) });
            return await res.json();
        }

        function extrairSlugTorneio(url) { if (!url) return null; const match = url.match(/\/tournament\/([^\/]+)/i); return match ? match[1].toLowerCase() : null; }

        // ==================== LIGAS MONITORADAS ====================
        const LIGAS_MONITORADAS = [
    { slug: 'kombat-ranking-mk1', label: 'Kombat Ranking MK1', rankingUrl: 'https://www.start.gg/league/kombat-ranking-mk1/standings' },
    { slug: 'kombat-zone-ranking-brasil-tekken-8-2026', label: 'Kombat Zone Tekken 8 BR 2026', rankingUrl: 'https://www.start.gg/league/kombat-zone-ranking-brasil-tekken-8-2026/standings' },
    { slug: 'kampeonato-brasileiro-de-mortal-kombat-1-temporada-1', label: 'Kampeonato Brasileiro MK1', rankingUrl: 'https://www.start.gg/league/kampeonato-brasileiro-de-mortal-kombat-1-temporada-1/standings' },
    { slug: 'liga-de-kolossos-2-edi-o', label: 'Liga de Kolossos 2ª Edição', rankingUrl: 'https://www.start.gg/league/liga-de-kolossos-2-edi-o/standings' },
    { slug: 'world-warrior-2026-capcom-pro-tour', label: 'World Warrior 2026 - Capcom Pro Tour', rankingUrl: 'https://www.start.gg/league/world-warrior-2026-capcom-pro-tour/standings' },
    { slug: 'rocket-league-championship-series-2026', label: 'Rocket League Championship Series 2026', rankingUrl: 'https://www.start.gg/league/rocket-league-championship-series-2026/standings' },
    { slug: '2xko-community-events-program-mixed-duo', label: '2XKO Community Events - Mixed Duo', rankingUrl: 'https://www.start.gg/league/2xko-community-events-program-mixed-duo/standings' },
    { slug: '2xko', label: '2XKO', rankingUrl: 'https://www.start.gg/league/2xko/standings' }
];
        let leagueTournamentMap = {};
        function verificarLigaDeTorneio(url) { const slug = extrairSlugTorneio(url); return slug ? (leagueTournamentMap[slug] || null) : null; }
        async function carregarTorneiosDasLigas() {
            const query = `query LeagueEvents($slug: String) { league(slug: $slug) { events(query: { page: 1, perPage: 100 }) { nodes { tournament { url } } } } }`;
            const fetches = LIGAS_MONITORADAS.map(liga => callStartGG(query, { slug: liga.slug }).then(json => {
                const nodes = json.data?.league?.events?.nodes || [];
                nodes.forEach(node => { const slug = extrairSlugTorneio(node.tournament?.url); if (slug) leagueTournamentMap[slug] = { label: liga.label, rankingUrl: liga.rankingUrl, slug: liga.slug }; });
            }).catch(() => {}));
            await Promise.all(fetches);
        }

        // ==================== RANKING SIDEBAR ====================
        async function abrirRanking(ligaSlug, ligaLabel, rankingUrl) {
            const sidebar = document.getElementById('ranking_sidebar'), overlay = document.getElementById('ranking_overlay'), content = document.getElementById('ranking_content'), leagueEl = document.getElementById('ranking_league_name'), extLink = document.getElementById('ranking_external_link');
            sidebar.classList.add('open'); overlay.classList.add('active'); document.body.style.overflow = 'hidden'; leagueEl.textContent = ligaLabel; extLink.href = rankingUrl;
            content.innerHTML = `<div class="loading-attendees"><div class="spinner-purple"></div><p style="margin-top:15px;color:#aaa;">Carregando ranking...</p></div>`;
            try {
                const query = `query LeagueStandings($slug: String) { league(slug: $slug) { standings(query: { page: 1, perPage: 25 }) { nodes { placement totalPoints entrant { name participants { user { location { country } } } } } } } }`;
                const json = await callStartGG(query, { slug: ligaSlug }); const nodes = json.data?.league?.standings?.nodes || [];
                if (nodes.length === 0) { content.innerHTML = `<div style="text-align:center;padding:40px;color:#aaa;">Nenhum dado de ranking encontrado.</div>`; return; }
                const maxPts = Math.max(...nodes.map(n => n.totalPoints || 0)) || 1; let html = '';
                nodes.forEach(node => {
                    const placement = node.placement, name = node.entrant?.name || '—', pts = node.totalPoints ?? 0, country = node.entrant?.participants?.[0]?.user?.location?.country, code = country && COUNTRY_MAP[country] ? COUNTRY_MAP[country].toLowerCase() : null;
                    const flagHTML = code ? `<img src="https://flagcdn.com/w40/${code}.png" class="ranking-flag" alt="${country}">` : `<div class="ranking-flag-placeholder"></div>`;
                    const rankClass = placement === 1 ? 'rank-1' : placement === 2 ? 'rank-2' : placement === 3 ? 'rank-3' : '', numClass = placement === 1 ? 'rank-1' : placement === 2 ? 'rank-2' : placement === 3 ? 'rank-3' : 'rank-other', barWidth = Math.round((pts / maxPts) * 100), medal = placement === 1 ? '🥇' : placement === 2 ? '🥈' : placement === 3 ? '🥉' : '';
                    html += `<div class="ranking-player-card ${rankClass}"><div class="rank-number ${numClass}">${medal || '#' + placement}</div><div class="ranking-player-info"><div class="ranking-player-name">${name}</div><div class="ranking-player-pts">${pts.toLocaleString('pt-BR')} pts</div></div>${flagHTML}<div class="ranking-bar-wrap"><div class="ranking-bar-fill ${rankClass ? '' : 'rank-other-bar'}" style="width:${barWidth}%;${rankClass ? '' : 'background:#7c3aed;'}"></div></div></div>`;
                });
                content.innerHTML = html;
            } catch (e) { content.innerHTML = `<div style="text-align:center;padding:40px;color:#ef4444;">Erro ao carregar ranking.</div>`; }
        }
        function fecharRanking() { document.getElementById('ranking_sidebar').classList.remove('open'); document.getElementById('ranking_overlay').classList.remove('active'); document.body.style.overflow = ''; }

        // ==================== ATTENDEES COM PAGINAÇÃO ====================
        let _attendeesState = null;

        async function abrirAttendees(tournamentUrl) {
            const sidebar = document.getElementById('attendees_sidebar'), overlay = document.getElementById('attendees_overlay'), content = document.getElementById('attendees_content'), countEl = document.getElementById('attendees_count');
            sidebar.classList.add('open'); overlay.classList.add('active'); document.body.style.overflow = 'hidden';
            content.innerHTML = '<div class="loading-attendees"><div class="spinner"></div><p style="margin-top:15px;">Carregando inscritos...</p></div>'; countEl.textContent = '';

            // Reseta estado de paginação para este torneio
            _attendeesState = {
                slug: tournamentUrl.replace('/tournament/', '').split('/')[0],
                page: 1,
                perPage: 100,
                totalCount: 0,
                globalOffset: 0
            };
            await _carregarPaginaAttendees();
        }

        async function _carregarPaginaAttendees() {
            const content = document.getElementById('attendees_content'), countEl = document.getElementById('attendees_count');
            if (!_attendeesState) return;

            const { slug, page, perPage } = _attendeesState;
            const isFirstPage = page === 1;

            if (!isFirstPage) {
                // Mantém itens existentes, substitui apenas o bloco de paginação por spinner
                const old = document.getElementById('_attendees_pagination');
                if (old) old.innerHTML = '<div class="loading-attendees" style="padding:20px 0;"><div class="spinner"></div></div>';
            }

            try {
                const query = `query Attendees($slug:String!,$page:Int!,$perPage:Int!){tournament(slug:$slug){participants(query:{page:$page,perPage:$perPage}){pageInfo{total}nodes{id,gamerTag,prefix,player{id},user{location{country}}}}}}`;
                const json = await callStartGG(query, { slug, page, perPage });
                const pData = json.data?.tournament?.participants || {};
                const participants = pData.nodes || [];
                const total = pData.pageInfo?.total ?? 0;

                _attendeesState.totalCount = total;
                countEl.textContent = `(${total} inscrito${total !== 1 ? 's' : ''})`;

                if (isFirstPage && participants.length === 0) {
                    content.innerHTML = '<div style="text-align:center;padding:40px;color:#aaa;">Nenhum inscrito encontrado.</div>';
                    return;
                }

                // Renderiza os itens desta página
                let html = '';
                const offset = _attendeesState.globalOffset;
                participants.forEach((p, i) => {
                    const idx = offset + i;
                    const country = p.user?.location?.country, countryCode = COUNTRY_MAP[country] || null;
                    const flagHTML = countryCode
                        ? `<img src="https://flagcdn.com/w40/${countryCode.toLowerCase()}.png" class="attendee-flag" alt="${country}">`
                        : '<div style="width:28px;height:20px;background:rgba(255,255,255,0.05);border-radius:3px;"></div>';
                    const safeGamerTag = (p.gamerTag || 'Sem nome').replace(/'/g, "\\'").replace(/"/g, '&quot;');
                    const playerId = p.player?.id || '';
                    html += `<div class="attendee-item"><span class="attendee-number">#${idx + 1}</span>${flagHTML}<span class="attendee-name clickable" onclick="event.stopPropagation();toggleHistorico('${playerId}', '${safeGamerTag}', ${idx})">${p.gamerTag || 'Sem nome'}</span>${p.prefix ? `<span style="color:#aaa;font-size:11px;">${p.prefix}</span>` : ''}</div><div id="history-${idx}" style="display:none;"></div>`;
                });

                _attendeesState.globalOffset += participants.length;
                const hasMore = _attendeesState.globalOffset < total;

                // Rodapé: contador + botão próxima página (se houver)
                const pageInfo = `<div style="text-align:center;padding:8px 0 4px;color:#666;font-size:11px;font-weight:bold;letter-spacing:0.5px;">Exibindo ${_attendeesState.globalOffset} de ${total}</div>`;
                const nextBtn = hasMore
                    ? `<button onclick="_proximaPaginaAttendees()" style="display:block;width:100%;margin-top:8px;padding:11px;background:linear-gradient(to right,#991b1b,#dc2626);color:white;font-weight:900;font-size:12px;text-transform:uppercase;letter-spacing:1px;border:none;border-radius:8px;cursor:pointer;transition:opacity 0.2s;" onmouseover="this.style.opacity='0.85'" onmouseout="this.style.opacity='1'"><i class="fa-solid fa-chevron-down" style="margin-right:6px;"></i>CARREGAR MAIS <span style="opacity:0.8;">(${total - _attendeesState.globalOffset} restantes)</span></button>`
                    : (total > perPage ? `<div style="text-align:center;padding:10px 0 4px;color:#444;font-size:11px;text-transform:uppercase;letter-spacing:1px;">— Todos os inscritos carregados —</div>` : '');

                if (isFirstPage) {
                    content.innerHTML = html + `<div id="_attendees_pagination">${pageInfo}${nextBtn}</div>`;
                } else {
                    const paginationEl = document.getElementById('_attendees_pagination');
                    if (paginationEl) {
                        paginationEl.insertAdjacentHTML('beforebegin', html);
                        paginationEl.innerHTML = pageInfo + nextBtn;
                    }
                }
            } catch (e) {
                if (page === 1) {
                    content.innerHTML = '<div style="text-align:center;padding:40px;color:#ef4444;">Erro ao carregar inscritos.</div>';
                } else {
                    const paginationEl = document.getElementById('_attendees_pagination');
                    if (paginationEl) paginationEl.innerHTML = '<div style="text-align:center;padding:10px;color:#ef4444;font-size:12px;">Erro ao carregar mais. Tente novamente.</div>';
                }
            }
        }

        async function _proximaPaginaAttendees() {
            if (!_attendeesState) return;
            _attendeesState.page++;
            await _carregarPaginaAttendees();
        }

        function fecharAttendees() { document.getElementById('attendees_sidebar').classList.remove('open'); document.getElementById('attendees_overlay').classList.remove('active'); document.body.style.overflow = ''; }

        // ==================== HISTORICO ====================
        async function buscarSetsDoEvento(eventId, playerId) {
            try {
                const query = `query EventSets($eventId: ID!) { event(id: $eventId) { sets(perPage: 100, filters: {hideEmpty: true}) { nodes { winnerId slots { entrant { id participants { player { id } } } } } } } }`;
                const json = await callStartGG(query, { eventId }); const sets = json.data?.event?.sets?.nodes || []; let wins = 0, losses = 0;
                sets.forEach(set => { const playerSlot = set.slots?.find(slot => slot.entrant?.participants?.some(p => p.player?.id == playerId)); if (!playerSlot || !playerSlot.entrant) return; const myEntrantId = playerSlot.entrant.id; if (set.winnerId) { if (String(set.winnerId) === String(myEntrantId)) wins++; else losses++; } });
                return { wins, losses, total: wins + losses };
            } catch (e) { return { wins: 0, losses: 0, total: 0, error: true }; }
        }

        async function toggleHistorico(playerId, gamerTag, index) {
            const historyDiv = document.getElementById(`history-${index}`); if (!historyDiv) return;
            if (historyDiv.style.display === 'block') { historyDiv.style.display = 'none'; return; }
            historyDiv.style.display = 'block'; historyDiv.innerHTML = '<div class="history-search">🔍 Buscando torneios...</div>';
            try {
                const query1 = `query PlayerHistory($id: ID!) { player(id: $id) { recentStandings(limit: 10) { placement container { ... on Event { id name tournament { name numAttendees } } } } } }`;
                const json1 = await callStartGG(query1, { id: playerId }); const standings = json1.data?.player?.recentStandings || [];
                if (standings.length === 0) { historyDiv.innerHTML = `<div class="player-history"><div class="history-title">🔍 ${gamerTag}</div><div class="history-empty">⚠️ Nenhum torneio encontrado.</div></div>`; return; }
                let totalWins = 0, totalLosses = 0, torneiosProcessados = 0; const torneiosData = [];
                for (let i = 0; i < standings.length; i++) {
                    const standing = standings[i]; const eventId = standing.container?.id; const tournamentName = standing.container?.tournament?.name || 'Torneio';
                    historyDiv.innerHTML = `<div class="history-search">🔍 Analisando ${i + 1}/${standings.length} torneios...</div>`;
                    if (!eventId) continue;
                    const resultado = await buscarSetsDoEvento(eventId, playerId);
                    if (resultado.total > 0 && !resultado.error) { totalWins += resultado.wins; totalLosses += resultado.losses; torneiosProcessados++; }
                    torneiosData.push({ name: tournamentName, wins: resultado.wins, losses: resultado.losses, placement: standing.placement, attendees: standing.container?.tournament?.numAttendees || '?' });
                }
                const totalPartidas = totalWins + totalLosses; const winRateGeral = totalPartidas > 0 ? Math.round((totalWins / totalPartidas) * 100) : 0;
                let wrClass = winRateGeral >= 60 ? 'history-winrate-60' : (winRateGeral >= 40 ? 'history-winrate-40' : 'history-winrate-0');
                let html = `<div class="player-history"><div class="history-title">🔍 ${gamerTag}</div><div class="legend-bar"><div class="legend-item"><span class="legend-dot green"></span> 60%+</div><div class="legend-item"><span class="legend-dot yellow"></span> 40-59%</div><div class="legend-item"><span class="legend-dot red"></span> &lt;40%</div></div><div class="history-winrate ${wrClass}">📊 WinRate: ${winRateGeral}%</div><div class="history-winrate-detail">${totalWins}W / ${totalLosses}L em ${torneiosProcessados} torneios</div>`;
                torneiosData.forEach(t => { const wr = t.wins + t.losses > 0 ? Math.round((t.wins / (t.wins + t.losses)) * 100) : 0; let itemWrClass = wr >= 60 ? 'history-winrate-60' : (wr >= 40 ? 'history-winrate-40' : 'history-winrate-0'); html += `<div class="history-item"><span class="history-name">${t.name}</span><span class="history-placement ${itemWrClass}">${t.wins}W-${t.losses}L (${wr}%) — ${t.placement}º/${t.attendees}</span></div>`; });
                historyDiv.innerHTML = html + `</div>`;
            } catch (e) { historyDiv.innerHTML = `<div class="player-history"><div class="history-empty">❌ Erro ao buscar histórico.</div></div>`; }
        }

        // ==================== BRACKET SIDEBAR (COM POOLS) ====================
        function getFlagHTMLBracket(entrant) {
            const c = entrant?.participants?.[0]?.user?.location?.country;
            if (!c || !COUNTRY_MAP[c]) return '<div style="width:35px;height:20px;margin-right:12px;background:rgba(255,255,255,0.05);border-radius:3px;"></div>';
            return `<img src="https://flagcdn.com/w40/${COUNTRY_MAP[c].toLowerCase()}.png" class="brk-flag-img">`;
        }

        async function abrirBracket(tournamentUrl) {
            const sidebar = document.getElementById('bracket_sidebar'), overlay = document.getElementById('bracket_overlay'), content = document.getElementById('bracket_content');
            const eventSelect = document.getElementById('bracketEventSelect'), poolSelect = document.getElementById('bracketPoolSelect');
            
            sidebar.classList.add('open'); overlay.classList.add('active'); document.body.style.overflow = 'hidden';
            content.innerHTML = '<div class="loading-attendees"><div class="spinner"></div><p style="margin-top:15px;">Buscando eventos...</p></div>';
            eventSelect.style.display = 'none'; poolSelect.style.display = 'none';
            
            try {
                const slug = tournamentUrl.replace('/tournament/', '').split('/')[0];
                const eventQuery = `query($slug: String!) { tournament(slug: $slug) { events { id name slug } } }`;
                const eventJson = await callStartGG(eventQuery, { slug });
                const events = eventJson.data?.tournament?.events || [];
                if (events.length === 0) { content.innerHTML = '<div style="text-align:center;padding:40px;color:#aaa;">Nenhum evento encontrado.</div>'; return; }
                
                if (events.length > 1) {
                    eventSelect.innerHTML = events.map(e => `<option value="${e.slug}">${e.name}</option>`).join('');
                    eventSelect.style.display = 'block'; eventSelect.value = events[0].slug;
                }
                
                await carregarFasesEPools(events[0].slug);
            } catch (e) { content.innerHTML = '<div style="text-align:center;padding:40px;color:#ef4444;">Erro ao carregar eventos da bracket.</div>'; }
        }

        async function onBracketEventChange() {
            const select = document.getElementById('bracketEventSelect');
            if (!select.value) return;
            await carregarFasesEPools(select.value);
        }

        async function carregarFasesEPools(eventSlug) {
            const poolSelect = document.getElementById('bracketPoolSelect');
            const content = document.getElementById('bracket_content');
            content.innerHTML = '<div class="loading-attendees"><div class="spinner"></div><p style="margin-top:15px;">Buscando chaves...</p></div>';
            
            try {
                const queryPhases = `query($slug: String!) { 
                    event(slug: $slug) { 
                        phases { 
                            id name 
                            phaseGroups(query: {perPage: 50}) { 
                                nodes { id displayIdentifier } 
                            } 
                        } 
                    } 
                }`;
                const phasesJson = await callStartGG(queryPhases, { slug: eventSlug });
                const phasesList = phasesJson.data?.event?.phases || [];
                
                if (phasesList.length === 0) { 
                    content.innerHTML = '<div style="text-align:center;padding:40px;color:#aaa;">Nenhuma fase encontrada.</div>'; 
                    poolSelect.style.display = 'none'; 
                    return; 
                }

                let optionsHtml = '';
                let firstPoolId = null;
                
                phasesList.forEach(phase => {
                    const groups = phase.phaseGroups?.nodes || [];
                    if (groups.length === 1) {
                        if (!firstPoolId) firstPoolId = groups[0].id;
                        optionsHtml += `<option value="${groups[0].id}">${phase.name}</option>`;
                    } else if (groups.length > 1) {
                        groups.forEach(g => {
                            if (!firstPoolId) firstPoolId = g.id;
                            optionsHtml += `<option value="${g.id}">${phase.name} - Grupo ${g.displayIdentifier}</option>`;
                        });
                    }
                });

                if (optionsHtml !== '') {
                    poolSelect.innerHTML = optionsHtml;
                    poolSelect.style.display = 'block'; 
                    poolSelect.value = firstPoolId;
                    await carregarBracketPool(firstPoolId, content);
                } else {
                    content.innerHTML = '<div style="text-align:center;padding:40px;color:#aaa;">Nenhuma bracket encontrada.</div>'; 
                    poolSelect.style.display = 'none';
                }
            } catch (e) { 
                content.innerHTML = '<div style="text-align:center;padding:40px;color:#ef4444;">Erro ao buscar chaves.</div>'; 
            }
        }

        async function onBracketPoolChange() {
            const select = document.getElementById('bracketPoolSelect');
            const content = document.getElementById('bracket_content');
            if (!select.value) return;
            content.innerHTML = '<div class="loading-attendees"><div class="spinner"></div><p style="margin-top:15px;">Carregando partidas...</p></div>';
            await carregarBracketPool(select.value, content);
        }

        async function carregarBracketPool(phaseGroupId, container) {
            try {
                const querySets = `query($id: ID!) { 
                    phaseGroup(id: $id) { 
                        sets(page:1,perPage:100) { 
                            nodes { 
                                id fullRoundText round state 
                                stream { id } 
                                slots { 
                                    entrant { name id participants { user { location { country } } } } 
                                    standing { stats { score { value } } } 
                                } 
                            } 
                        } 
                    } 
                }`;
                const setsJson = await callStartGG(querySets, { id: phaseGroupId });
                const sets = setsJson.data?.phaseGroup?.sets?.nodes || [];
                
                if (sets.length === 0) { container.innerHTML = '<div style="text-align:center;padding:40px;color:#aaa;">Nenhuma partida encontrada nesta chave ou torneio ainda não iniciou.</div>'; return; }
                
                const rounds = {};
                sets.forEach(set => {
                    const key = `${set.round}_${set.fullRoundText}`;
                    if (!rounds[key]) rounds[key] = { round: set.round, title: set.fullRoundText, sets: [] };
                    rounds[key].sets.push(set);
                });

                const sortedKeys = Object.keys(rounds).sort((a,b) => {
                    const rA = rounds[a], rB = rounds[b];
                    const isResetA = rA.title.toLowerCase().includes("reset"), isResetB = rB.title.toLowerCase().includes("reset");
                    if (isResetA && !isResetB) return 1; if (!isResetA && isResetB) return -1;
                    if (rA.round > 0 && rB.round > 0) return rA.round - rB.round;
                    if (rA.round < 0 && rB.round < 0) return rB.round - rA.round;
                    return rA.round - rB.round;
                });
                
                let html = `<div class="brk-container"><div id="winners-area"><div class="brk-label">Winners Bracket</div><div id="winners-root" class="brk-row"></div></div><div id="losers-area" style="margin-top:40px;"><div class="brk-label">Losers Bracket</div><div id="losers-root" class="brk-row"></div></div><div id="connectors-container" style="position:absolute; top:0; left:0; width:100%; height:100%; z-index:1;"></div></div>`;
                container.innerHTML = html;

                const wRoot = document.getElementById('winners-root'), lRoot = document.getElementById('losers-root');
                const setMap = new Map();
                let hasWinners = false, hasLosers = false;

                sortedKeys.forEach(key => {
                    const rData = rounds[key];
                    const col = document.createElement('div'); col.className = 'brk-column'; col.innerHTML = `<div class="brk-round-title">${rData.title}</div>`;
                    rData.sets.sort((a,b) => a.id - b.id);
                    rData.sets.forEach(set => {
                        const p1=set.slots[0], p2=set.slots[1], s1=p1?.standing?.stats?.score?.value??0, s2=p2?.standing?.stats?.score?.value??0, done=set.state===3, onStream=set.state===2 && set.stream!==null;
                        const card = document.createElement('div'); card.id=`set-${set.id}`; card.className=`brk-match-card ${onStream?'on-stream':''}`;
                        card.innerHTML = `
                            <div class="brk-player ${done&&s1>s2?'brk-winner':(done&&s2>s1?'brk-loser':'')}"><div class="brk-name-container">${getFlagHTMLBracket(p1?.entrant)}<div class="brk-name">${p1?.entrant?.name||'TBD'}</div></div><div class="brk-score">${done?(s1<0?'DQ':s1):'-'}</div></div>
                            <div class="brk-player ${done&&s2>s1?'brk-winner':(done&&s1>s2?'brk-loser':'')}"><div class="brk-name-container">${getFlagHTMLBracket(p2?.entrant)}<div class="brk-name">${p2?.entrant?.name||'TBD'}</div></div><div class="brk-score">${done?(s2<0?'DQ':s2):'-'}</div></div>
                        `;
                        col.appendChild(card); setMap.set(set.id, card);
                    });
                    if (rData.round > 0) { wRoot.appendChild(col); hasWinners = true; } else { lRoot.appendChild(col); hasLosers = true; }
                });
                document.getElementById('winners-area').classList.toggle('brk-empty-area', !hasWinners);
                document.getElementById('losers-area').classList.toggle('brk-empty-area', !hasLosers);
                
                setTimeout(() => drawConnectorsLayout(sets, setMap), 250);
            } catch (e) { container.innerHTML = '<div style="text-align:center;padding:40px;color:#ef4444;">Erro ao renderizar bracket.</div>'; }
        }

        function drawConnectorsLayout(sets, setMap) {
            const container = document.getElementById('connectors-container'); if(!container) return; container.innerHTML = '';
            const handledConnections = new Set();
            sets.forEach(set => {
                if (set.state !== 3) return;
                const p1Score = set.slots[0]?.standing?.stats?.score?.value ?? 0, p2Score = set.slots[1]?.standing?.stats?.score?.value ?? 0;
                const winnerEntrant = p1Score > p2Score ? set.slots[0]?.entrant : set.slots[1]?.entrant; if (!winnerEntrant) return;
                const targetSet = sets.find(s => s.round === (set.round > 0 ? set.round + 1 : set.round - 1) && s.slots.some(slot => slot.entrant?.id === winnerEntrant.id));
                if (targetSet && setMap.has(set.id) && setMap.has(targetSet.id)) {
                    const connectionKey = `${set.id}_${targetSet.id}`;
                    if (handledConnections.has(connectionKey)) return;
                    createLedConnectorLayout(setMap.get(set.id), setMap.get(targetSet.id), container);
                    handledConnections.add(connectionKey);
                }
            });
        }

        function createLedConnectorLayout(startNode, endNode, container) {
            const startRect = startNode.getBoundingClientRect(), endRect = endNode.getBoundingClientRect(), containerRect = container.getBoundingClientRect();
            const startX = startRect.right - containerRect.left, startY = startRect.top - containerRect.top + (startRect.height / 2), endX = endRect.left - containerRect.left, endY = endRect.top - containerRect.top + (endRect.height / 2);
            const midX = startX + (endX - startX) / 2;
            createSegmentLayout(startX, startY, midX - startX, 4, container, 'none');
            if (Math.abs(endY - startY) > 5) {
                const vHeight = Math.abs(endY - startY), vTop = Math.min(startY, endY), direction = endY > startY ? 'down' : 'up';
                createSegmentLayout(midX - 2, vTop, 4, vHeight, container, direction);
            }
            createSegmentLayout(midX, endY, endX - midX, 4, container, 'none');
        }

        function createSegmentLayout(x, y, w, h, container, direction) {
            const segment = document.createElement('div'); segment.className = 'brk-connector'; segment.style.left = `${x}px`; segment.style.top = `${y - (direction !== 'none' ? 0 : 2)}px`; segment.style.width = `${w}px`; segment.style.height = `${h}px`;
            const led = document.createElement('div'); led.className = 'brk-led-flow'; led.style.width = '100%'; led.style.height = '100%';
            if (direction === 'down') led.style.animationName = 'brk-led-animation-v-down'; else if (direction === 'up') led.style.animationName = 'brk-led-animation-v-up'; else led.style.animationName = 'brk-led-animation';
            segment.appendChild(led); container.appendChild(segment);
        }

        function fecharBracket() { document.getElementById('bracket_sidebar').classList.remove('open'); document.getElementById('bracket_overlay').classList.remove('active'); document.body.style.overflow = ''; }

        // ==================== PESQUISA & MAIN ====================
        async function checkAPIStatus() { const dot = document.getElementById('api_status_dot'), text = document.getElementById('api_status_text'); try { const query = `query HealthCheck { tournaments(query: { perPage: 1, filter: { upcoming: true } }) { nodes { id } } }`; const start = performance.now(); const json = await callStartGG(query); const end = performance.now(); if (json.data?.tournaments?.nodes) { dot.className = 'status-dot status-online'; text.textContent = `API: Online (${Math.round(end-start)}ms)`; } else { throw new Error(); } } catch (e) { dot.className = 'status-dot status-offline'; text.textContent = 'API: Offline'; } }
        setInterval(checkAPIStatus, 45000); checkAPIStatus();
        function toggleChangelog() { document.getElementById('changelog_modal').classList.toggle('hidden'); }
        function carregarJogos() { document.getElementById("campo_jogo").innerHTML = games.filter(g => !g.hidden).map(g => `<option value="${g.value}">${g.label}</option>`).join(''); }
        function atualizarPainelDisponibilidade(nodes) { const painel = document.getElementById("painel_disponibilidade"), grid = document.getElementById("grid_dias"); painel.classList.remove("hidden"); grid.innerHTML = ""; const datasOcupadas = nodes.map(t => { const d = new Date(t.startAt*1000); return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`; }); for (let i=0;i<14;i++){ const dia=new Date();dia.setDate(dia.getDate()+i);const isoDia=`${dia.getFullYear()}-${String(dia.getMonth()+1).padStart(2,'0')}-${String(dia.getDate()).padStart(2,'0')}`;const isOcupado=datasOcupadas.includes(isoDia);grid.innerHTML+=`<div class="day-slot ${isOcupado?'day-busy':'day-available'} p-3 rounded-lg text-center border"><span class="text-[9px] uppercase font-bold opacity-70">${dia.toLocaleDateString('pt-BR',{weekday:'short'})}</span><span class="text-xs font-black block">${dia.toLocaleDateString('pt-BR',{day:'2-digit',month:'2-digit'})}</span><span class="text-[10px] font-bold mt-1 uppercase"><i class="fa-solid ${isOcupado?'fa-calendar-xmark':'fa-calendar-plus'}"></i> ${isOcupado?'Ocupado':'Livre'}</span></div>`; } }
        function iniciarTimer(id, registrationClosesAt, checkInData, eventStartAt, eventState) {
            const el = document.getElementById(id);
            if (!el) return;

            const now = () => new Date().getTime();
            const regClose = registrationClosesAt ? registrationClosesAt * 1000 : null;
            const startAt = eventStartAt ? eventStartAt * 1000 : null;
            const state = eventState || 'CREATED';

            let checkIn = null;
            if (checkInData && checkInData.checkInEnabled && typeof checkInData.checkInDuration === 'number' && typeof checkInData.checkInBuffer === 'number' && startAt) {
                const durationMs = checkInData.checkInDuration * 1000;
                const bufferMs = checkInData.checkInBuffer * 1000;
                if (durationMs >= 0 && bufferMs >= 0) {
                    checkIn = {
                        enabled: true,
                        start: startAt - durationMs - bufferMs,
                        end: startAt - bufferMs
                    };
                }
            }

            const interval = setInterval(() => {
                if (!document.getElementById(id)) { clearInterval(interval); return; }
                const t = now();

                if (regClose && t < regClose) {
                    const diff = regClose - t;
                    const D = Math.floor(diff / 86400000);
                    const h = Math.floor((diff % 86400000) / 3600000);
                    const m = Math.floor((diff % 3600000) / 60000);
                    const s = Math.floor((diff % 60000) / 1000);
                    el.innerHTML = `⏳ INSCRIÇÕES FECHAM EM: ${D}d ${h}h ${m}m ${s}s`;
                    el.className = 'timer-red';
                    return;
                }

                if (checkIn && t >= checkIn.start && t < checkIn.end) {
                    const diff = checkIn.end - t;
                    const h = Math.floor(diff / 3600000);
                    const m = Math.floor((diff % 3600000) / 60000);
                    const s = Math.floor((diff % 60000) / 1000);
                    el.innerHTML = `✅ CHECK-IN ABERTO – FECHA EM: ${h}h ${m}m ${s}s`;
                    el.className = 'timer-checkin';
                    return;
                }

                const afterReg = regClose ? t >= regClose : true;
                const afterCheckIn = checkIn ? t >= checkIn.end : true;

                if (afterReg && afterCheckIn) {
                    if (state === 'READY' || state === 'CALLED') {
                        el.innerHTML = '🎮 BRACKET INICIANDO EM BREVE';
                        el.className = 'timer-ready';
                    } else if (state === 'ACTIVE') {
                        el.innerHTML = '🔴 BRACKET EM ANDAMENTO';
                        el.className = 'timer-active';
                    } else if (state === 'COMPLETED') {
                        el.innerHTML = '🏁 EVENTO FINALIZADO';
                        el.className = 'timer-completed';
                    } else {
                        el.innerHTML = 'INSCRIÇÕES ENCERRADAS';
                        el.className = 'timer-end';
                    }
                    clearInterval(interval);
                    return;
                }

                if (checkIn && t < checkIn.start && regClose && t >= regClose) {
                    const diff = checkIn.start - t;
                    const h = Math.floor(diff / 3600000);
                    const m = Math.floor((diff % 3600000) / 60000);
                    const s = Math.floor((diff % 60000) / 1000);
                    el.innerHTML = `⏰ CHECK-IN INICIA EM: ${h}h ${m}m ${s}s`;
                    el.className = 'timer-checkin-pending';
                    return;
                }

                el.innerHTML = '';
            }, 1000);
        }
        function formatarDataGoogle(ts){return new Date(ts*1000).toISOString().replace(/-|:|\.\d+/g,"");}
        function gerarLinkGoogleCalendar(t){const i=formatarDataGoogle(t.startAt),f=formatarDataGoogle(t.startAt+7200),d=encodeURIComponent(`Inscrição: https://start.gg${t.url}`);return `https://www.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(t.name)}&dates=${i}/${f}&details=${d}`;}

        async function pesquisar() {
            const gameObj = games.find(g => g.value === document.getElementById("campo_jogo").value), typeVal = document.getElementById("campo_tipo").value, localVal = document.getElementById("campo_local").value;
            const container = document.getElementById("resultados"), status = document.getElementById("status"); container.innerHTML = ""; status.classList.remove("hidden");
            const query = `query Tournaments($vId:[ID], $isOnline:Boolean){
              tournaments(query:{perPage:40, filter:{upcoming:true, videogameIds:$vId, hasOnlineEvents:$isOnline}}){
                nodes{
                  name,url,startAt,registrationClosesAt,isRegistrationOpen,addrState,numAttendees,
                  images{url,type},streams{streamName,streamSource},
                  streamQueue{
                    stream{streamName},
                    sets{
                      state
                      fullRoundText
                      phaseGroup{
                        displayIdentifier
                        phase{
                          name
                        }
                      }
                    }
                  },
                  owner{name,slug,player{gamerTag},location{country}},
                  events(limit:1){
                    checkInEnabled
                    checkInDuration
                    checkInBuffer
                    state
                    phases { state }
                  }
                }
              }
            }`;
            try {
                const vars = { vId: [gameObj.videogameId], isOnline: typeVal === "online" };
                const json = await callStartGG(query, vars); let nodes = json.data?.tournaments?.nodes || [];
                if (localVal === "south-america") {
                    nodes = nodes.filter(t => southAmericanCountries.includes(t.owner?.location?.country));
                }
                status.classList.add("hidden"); atualizarPainelDisponibilidade(nodes);
                nodes.forEach((t, i) => {
                    const timerId = `timer_${i}_${Date.now()}`, dEnc = t.registrationClosesAt ? new Date(t.registrationClosesAt*1000) : null, inscritos = t.numAttendees ?? 0;
                    const rawSlug = (t.owner?.slug||'').replace('user/',''), toName = t.owner?.player?.gamerTag || (!/^[0-9A-F]{6,}$/i.test(rawSlug) && rawSlug ? rawSlug : (t.owner?.name || 'Desconhecido'));
                    const banner = t.images?.find(img => img.type==='banner')?.url || t.images?.[0]?.url || '';
                    let streamHTML = ""; const isLiveNow = t.streamQueue && t.streamQueue.some(q => q.sets && q.sets.some(s => s.state===2 || s.state==='ACTIVE'));
                    if (t.streams && t.streams.length > 0) { const hasTwitch = t.streams.some(s => s.streamSource==='TWITCH'), hasYT = t.streams.some(s => s.streamSource==='YOUTUBE'); streamHTML = `<div style="position:absolute;bottom:8px;right:10px;display:flex;align-items:center;gap:6px;background:rgba(0,0,0,0.7);padding:3px 8px;border-radius:4px;border:1px solid ${isLiveNow?'#dc2626':'rgba(255,255,255,0.1)'}">${isLiveNow?'<span class="animate-pulse flex h-2 w-2 rounded-full bg-red-500 mr-1"></span><span class="text-[9px] font-black text-red-500 uppercase mr-2 tracking-tighter">LIVE</span>':'<span class="text-[9px] font-black text-white uppercase tracking-tighter">Stream:</span>'}${hasTwitch?'<i class="fa-brands fa-twitch text-[#a970ff] text-xs"></i>':''}${hasYT?'<i class="fa-brands fa-youtube text-[#ff0000] text-xs"></i>':''}</div>`; }
                    
                    let bracketBadgeHTML = '';
                    const firstSet = t.streamQueue?.[0]?.sets?.[0];
                    if (firstSet && firstSet.fullRoundText) {
                        const phaseName = firstSet.phaseGroup?.phase?.name || '';
                        const roundText = firstSet.fullRoundText;
                        const displayText = phaseName ? `${phaseName} — ${roundText}` : roundText;
                        const setState = firstSet.state;
                        if (setState === 'ACTIVE' || setState === 2) {
                            bracketBadgeHTML = `<div class="bracket-live-badge">🔴 ${displayText}</div>`;
                        } else if (setState === 'CALLED') {
                            bracketBadgeHTML = `<div class="bracket-upcoming-badge">⏳ EM BREVE: ${displayText}</div>`;
                        }
                    }

                    const ligaInfo = verificarLigaDeTorneio(t.url);
                    const ligaBadgeHTML = ligaInfo ? `<div class="league-badge"><i class="fa-solid fa-trophy" style="font-size:8px;color:#a855f7;"></i>&nbsp;${ligaInfo.label}</div>` : '';
                    const rankingBtnHTML = ligaInfo ? `<button onclick="abrirRanking('${ligaInfo.slug}','${ligaInfo.label.replace(/'/g,"\\'")}','${ligaInfo.rankingUrl}')" class="btn-ranking w-full"><i class="fa-solid fa-ranking-star"></i> RANKING</button>` : '';

                    const card = document.createElement("div"); card.className = "glass-card rounded-xl flex flex-col justify-between overflow-hidden";
                    let encHTML = dEnc ? `<div class="mt-1"><p class="text-[10px] text-slate-400 font-bold uppercase italic">Inscrições encerram em: ${dEnc.toLocaleDateString('pt-BR')} às ${dEnc.toLocaleTimeString('pt-BR',{hour:'2-digit',minute:'2-digit'})}</p><p id="${timerId}" class="text-[10px] timer-red uppercase italic">Calculando...</p></div>` : "";
                    card.innerHTML = `<div style="position:relative;height:130px;overflow:hidden;background:#111;">${banner?`<img src="${banner}" alt="banner" style="width:100%;height:100%;object-fit:cover;display:block;" onerror="this.style.display='none'">`:''}<div style="position:absolute;inset:0;background:linear-gradient(to bottom, rgba(0,0,0,0.1) 0%, rgba(20,20,24,0.9) 100%);"></div><div style="position:absolute;top:10px;left:10px;right:10px;display:flex;justify-content:space-between;align-items:center;"><span class="text-[10px] bg-red-900 text-red-100 px-2 py-1 rounded font-bold uppercase tracking-wider">${typeVal}</span><span class="text-xs text-white font-bold" style="text-shadow:0 1px 4px rgba(0,0,0,0.8)">${new Date(t.startAt*1000).toLocaleDateString('pt-BR')}</span></div><div class="attendees-icon-left" onclick="event.stopPropagation();abrirAttendees('${t.url}')" title="Ver Inscritos"><i class="fa-solid fa-users text-xs"></i></div>${streamHTML}</div><div class="p-5 flex flex-col flex-1">${bracketBadgeHTML}${ligaBadgeHTML}<h3 class="font-bold text-lg text-white mb-2 leading-tight">${t.name}</h3><p class="text-[11px] font-black uppercase ${t.isRegistrationOpen?'text-green-500':'text-red-500'}">${t.isRegistrationOpen?'Inscrição Aberta':'Inscrição Fechada'}</p><div class="flex flex-col gap-1 mt-2"><p class="text-[11px] font-bold text-slate-400 uppercase"><i class="fas fa-users"></i> ${inscritos} inscrito${inscritos!==1?'s':''}</p><p class="text-[11px] font-bold text-slate-400 uppercase"><i class="fas fa-crown"></i> TO: ${toName}</p></div>${encHTML}<p class="text-sm text-slate-400 mt-3 italic">${t.addrState?`<i class="fas fa-map-marker-alt"></i> ${t.addrState}`:`<i class="fas fa-globe"></i> ${t.owner?.location?.country||'Online'}`}</p><div class="mt-4 space-y-2">${rankingBtnHTML}<a href="https://start.gg${t.url}" target="_blank" class="block text-center bg-red-700 hover:bg-red-600 text-white font-black py-3 rounded-lg uppercase text-sm tracking-tighter transition shadow-sm">Página do Torneio</a><a href="${gerarLinkGoogleCalendar(t)}" target="_blank" class="block text-center btn-calendar text-slate-300 font-bold py-2 rounded-lg transition uppercase text-[10px] tracking-wider"><i class="fa-solid fa-calendar-plus mr-1"></i> Add ao Google Calendar</a><a href="javascript:void(0)" onclick="event.stopPropagation();abrirBracket('${t.url}')" class="btn-bracket"><i class="fa-solid fa-sitemap mr-1"></i> BRACKET</a></div></div>`;
                    container.appendChild(card);
                    const eventData = t.events?.[0] || null;
                    const checkInData = eventData ? { checkInEnabled: eventData.checkInEnabled, checkInDuration: eventData.checkInDuration, checkInBuffer: eventData.checkInBuffer } : null;
                    const eventState = eventData?.state || null;
                    if (t.registrationClosesAt || (checkInData && checkInData.checkInEnabled)) {
                        iniciarTimer(timerId, t.registrationClosesAt, checkInData, t.startAt, eventState);
                    }
                });
            } catch (e) { status.classList.add("hidden"); }
        }

        document.addEventListener('keydown', (e) => { if (e.key === 'Escape') { fecharAttendees(); fecharRanking(); fecharBracket(); } });
        carregarJogos(); carregarTorneiosDasLigas();
    </script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/js/all.min.js"></script>
</body>
</html>
