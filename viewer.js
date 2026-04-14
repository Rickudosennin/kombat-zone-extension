const TOKEN = "43b15884e09284466a58db7b06350b50";
const EVENT_SLUG = "tournament/kombat-zone-circuito-das-lendas-4-mk1-edition-3/event/kzcl4-mk1-etapa-3";

const COUNTRY_MAP = {
    "Brazil": "BR", "United States": "US", "Argentina": "AR", "Chile": "CL", "Colombia": "CO",
    "Mexico": "MX", "Peru": "PE", "Uruguay": "UY", "Portugal": "PT", "Spain": "ES"
};

let currentPhaseId = null;
const setMap = new Map();

// Atalhos de teclado
window.addEventListener('keydown', (e) => {
    if (e.key.toLowerCase() === 'h') document.getElementById('phase-nav').classList.toggle('show-nav');
});

// Inicialização da Twitch
window.Twitch.ext.onAuthorized((auth) => {
    loadPhases();
});

async function loadPhases() {
    const query = `query GetPhases($slug: String) { event(slug: $slug) { phases { id name } } }`;
    const res = await fetchAPI(query, { slug: EVENT_SLUG });
    if (res?.data?.event?.phases) {
        const phases = res.data.event.phases;
        const nav = document.getElementById('phase-nav');
        nav.innerHTML = '';
        phases.forEach((p, idx) => {
            const btn = document.createElement('button');
            btn.className = `btn-phase ${idx === 0 ? 'active' : ''}`;
            btn.innerText = p.name;
            btn.onclick = () => {
                document.querySelectorAll('.btn-phase').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                currentPhaseId = p.id;
                loadSets();
            };
            nav.appendChild(btn);
            if (idx === 0) currentPhaseId = p.id;
        });
        loadSets();
    }
}

async function loadSets() {
    const query = `query GetSets($phaseId: ID) {
        phase(id: $phaseId) {
            sets(page: 1, perPage: 100) {
                nodes {
                    id fullRoundText round state stream { id }
                    slots {
                        entrant { name id participants { user { location { country } } } }
                        standing { stats { score { value } } }
                    }
                }
            }
        }
    }`;
    const res = await fetchAPI(query, { phaseId: currentPhaseId });
    if (res?.data?.phase) renderBracket(res.data.phase.sets.nodes);
}

function renderBracket(sets) {
    const wRoot = document.getElementById('winners-root');
    const lRoot = document.getElementById('losers-root');
    wRoot.innerHTML = ''; lRoot.innerHTML = '';
    setMap.clear();

    const rounds = {};
    sets.forEach(set => {
        if (!set.slots.some(s => s.entrant)) return;
        const key = `${set.round}_${set.fullRoundText}`;
        if (!rounds[key]) rounds[key] = { round: set.round, title: set.fullRoundText, sets: [] };
        rounds[key].sets.push(set);
    });

    // Ordenação: Winners (1, 2, 3...) e Losers (-1, -2, -3 corrigido para fluxo visual)
    const sortedKeys = Object.keys(rounds).sort((a, b) => {
        const rA = rounds[a].round, rB = rounds[b].round;
        if (rA < 0 && rB < 0) return rB - rA; 
        return rA - rB;
    });

    sortedKeys.forEach(key => {
        const rData = rounds[key];
        const col = document.createElement('div');
        col.className = 'column';
        col.innerHTML = `<div class="round-title">${rData.title}</div>`;

        rData.sets.forEach(set => {
            const card = createMatchCard(set);
            col.appendChild(card);
            setMap.set(set.id, card);
        });

        if (rData.round > 0) wRoot.appendChild(col);
        else lRoot.appendChild(col);
    });
}

function createMatchCard(set) {
    const p1 = set.slots[0], p2 = set.slots[1];
    const s1 = p1.standing?.stats.score.value, s2 = p2.standing?.stats.score.value;
    const isDone = set.state === 3;
    const isStream = (set.state === 2 || set.state === 1) && set.stream !== null;

    const div = document.createElement('div');
    div.className = `match-card ${isStream ? 'on-stream' : ''}`;
    div.innerHTML = `
        <div class="player ${isDone && s1 > s2 ? 'winner' : ''}">
            <div style="display:flex; align-items:center;">
                ${getFlagHTML(p1.entrant)} <span class="name">${p1.entrant?.name || 'TBD'}</span>
            </div>
            <span class="score">${isDone ? (s1 < 0 ? 'DQ' : s1) : '-'}</span>
        </div>
        <div class="player ${isDone && s2 > s1 ? 'winner' : ''}">
            <div style="display:flex; align-items:center;">
                ${getFlagHTML(p2.entrant)} <span class="name">${p2.entrant?.name || 'TBD'}</span>
            </div>
            <span class="score">${isDone ? (s2 < 0 ? 'DQ' : s2) : '-'}</span>
        </div>`;
    return div;
}

function getFlagHTML(entrant) {
    const country = entrant?.participants?.[0]?.user?.location?.country;
    const code = COUNTRY_MAP[country];
    return code ? `<img src="https://flagcdn.com/w40/${code.toLowerCase()}.png" class="flag-img">` : `<div style="width:35px; margin-right:12px;"></div>`;
}

async function fetchAPI(query, variables) {
    const response = await fetch('https://api.start.gg/gql/alpha', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${TOKEN}` },
        body: JSON.stringify({ query, variables }),
    });
    return response.json();
}

setInterval(loadSets, 60000);
