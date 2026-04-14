const TOKEN = "43b15884e09284466a58db7b06350b50";
const EVENT_SLUG = "tournament/kombat-zone-circuito-das-lendas-4-mk1-edition-3/event/kzcl4-mk1-etapa-3";
let currentPhaseName = "";
let currentPhaseId = null;

if (window.Twitch?.ext) {
    window.Twitch.ext.onAuthorized((auth) => { loadPhases(); });
}

async function loadPhases() {
    const query = `query GetPhases($slug: String) { event(slug: $slug) { phases { id name } } }`;
    try {
        const response = await fetch('https://api.start.gg/gql/alpha', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${TOKEN}` },
            body: JSON.stringify({ query, variables: { slug: EVENT_SLUG } }),
        });
        const res = await response.json();
        const nav = document.getElementById('phase-nav');
        nav.innerHTML = '';

        res.data.event.phases.forEach((phase, index) => {
            const btn = document.createElement('button');
            btn.className = 'btn-phase' + (index === 0 ? ' active' : '');
            btn.innerText = phase.name.replace(/pool/gi, 'Pool');
            btn.onclick = () => {
                document.querySelectorAll('.btn-phase').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                currentPhaseName = phase.name.toLowerCase();
                currentPhaseId = phase.id;
                toggleFilters();
                loadSets();
            };
            nav.appendChild(btn);
            if (index === 0) { 
                currentPhaseName = phase.name.toLowerCase(); 
                currentPhaseId = phase.id;
                toggleFilters(); 
                loadSets(); 
            }
        });
    } catch (e) { console.error("Erro API Fases"); }
}

function toggleFilters() {
    const filterDiv = document.getElementById('side-filter');
    const isBigPhase = currentPhaseName.includes("pool") || currentPhaseName.includes("16");
    filterDiv.classList.toggle('visible', isBigPhase);
    document.getElementById('l-label').style.display = isBigPhase ? 'none' : 'block';
    
    if (isBigPhase) filterSide('winners');
    else {
        document.getElementById('w-container').style.display = 'block';
        document.getElementById('l-container').style.display = 'block';
    }
}

function filterSide(side) {
    document.getElementById('btn-win').classList.toggle('active', side === 'winners');
    document.getElementById('btn-los').classList.toggle('active', side === 'losers');
    document.getElementById('w-container').style.display = side === 'winners' ? 'block' : 'none';
    document.getElementById('l-container').style.display = side === 'losers' ? 'block' : 'none';
}

async function loadSets() {
    if (!currentPhaseId) return;
    const query = `query GetSets($phaseId: ID) { phase(id: $phaseId) { sets(page: 1, perPage: 60) { nodes { fullRoundText round state slots { entrant { name } standing { stats { score { value } } } } } } } }`;
    try {
        const response = await fetch('https://api.start.gg/gql/alpha', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${TOKEN}` },
            body: JSON.stringify({ query, variables: { phaseId: currentPhaseId } }),
        });
        const res = await response.json();
        render(res.data.phase.sets.nodes);
    } catch (e) { console.error("Erro API Sets"); }
}

function render(sets) {
    const wRoot = document.getElementById('winners-root');
    const lRoot = document.getElementById('losers-root');
    wRoot.innerHTML = ''; lRoot.innerHTML = '';
    document.getElementById('phase-label').innerText = currentPhaseName.toUpperCase();

    const rounds = {};
    sets.forEach(set => {
        if (!set.slots[0].entrant) return;
        const key = `${set.round}_${set.fullRoundText}`;
        if (!rounds[key]) rounds[key] = { round: set.round, title: set.fullRoundText, sets: [] };
        rounds[key].sets.push(set);
    });

    const sortedKeys = Object.keys(rounds).sort((a, b) => {
        const rA = rounds[a], rB = rounds[b];
        if (a.toLowerCase().includes("reset")) return 1;
        if (b.toLowerCase().includes("reset")) return -1;
        if (rA.round > 0 && rB.round > 0) return rA.round - rB.round;
        if (rA.round < 0 && rB.round < 0) return rB.round - rA.round; // Correção da Losers
        return rA.round - rB.round;
    });

    sortedKeys.forEach(key => {
        const rData = rounds[key];
        const col = document.createElement('div');
        col.className = 'column';
        col.innerHTML = `<div class="round-title">${rData.title}</div>`;
        rData.sets.forEach(set => {
            const p1 = set.slots[0], p2 = set.slots[1];
            const s1 = p1.standing?.stats.score.value, s2 = p2.standing?.stats.score.value;
            const card = document.createElement('div');
            card.className = 'match-card';
            card.innerHTML = `
                <div class="player ${s1 > s2 && set.state === 3 ? 'winner' : ''}"><span class="name">${p1.entrant.name}</span><span class="score">${s1 ?? 0}</span></div>
                <div class="player ${s2 > s1 && set.state === 3 ? 'winner' : ''}"><span class="name">${p2.entrant?.name || 'TBD'}</span><span class="score">${s2 ?? 0}</span></div>`;
            col.appendChild(card);
        });
        if (rData.round > 0) wRoot.appendChild(col);
        else lRoot.appendChild(col);
    });
}

setInterval(loadSets, 30000);
