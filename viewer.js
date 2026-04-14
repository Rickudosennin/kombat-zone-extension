const TOKEN = "43b15884e09284466a58db7b06350b50";
const EVENT_SLUG = "tournament/kombat-zone-circuito-das-lendas-4-mk1-edition-3/event/kzcl4-mk1-etapa-3";

const COUNTRY_MAP = {
    "Brazil": "BR", "United States": "US", "Argentina": "AR", "Chile": "CL", "Colombia": "CO", 
    "Mexico": "MX", "Peru": "PE", "Uruguay": "UY", "Portugal": "PT", "Spain": "ES", "Germany": "DE"
};

let currentPhaseId = null;

// Atalho H para mostrar menu de fases
window.addEventListener('keydown', (e) => {
    if (e.key.toLowerCase() === 'h') document.getElementById('phase-nav').classList.toggle('show-nav');
});

window.Twitch.ext.onAuthorized((auth) => { loadPhases(); });

function getFlagHTML(entrant) {
    const countryName = entrant?.participants?.[0]?.user?.location?.country;
    if (!countryName) return `<div style="width:32px; margin-right:12px;"></div>`;
    const code = COUNTRY_MAP[countryName];
    return code ? `<img src="https://flagcdn.com/w40/${code.toLowerCase()}.png" class="flag-img">` : `<div style="width:32px; margin-right:12px;"></div>`;
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
        res.data.event.phases.forEach((p, idx) => {
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
            if (idx === 0) { currentPhaseId = p.id; loadSets(); }
        });
    } catch (e) { console.error("Erro Fases"); }
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
    try {
        const response = await fetch('https://api.start.gg/gql/alpha', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${TOKEN}` },
            body: JSON.stringify({ query, variables: { phaseId: currentPhaseId } }),
        });
        const res = await response.json();
        renderBracket(res.data.phase.sets.nodes);
    } catch (e) { console.error("Erro Sets"); }
}

function renderBracket(sets) {
    const wRoot = document.getElementById('winners-root');
    const lRoot = document.getElementById('losers-root');
    wRoot.innerHTML = ''; lRoot.innerHTML = '';

    const rounds = {};
    sets.forEach(set => {
        if (!set.slots[0].entrant && !set.slots[1].entrant) return;
        const key = `${set.round}_${set.fullRoundText}`;
        if (!rounds[key]) rounds[key] = { round: set.round, title: set.fullRoundText, sets: [] };
        rounds[key].sets.push(set);
    });

    // LÓGICA DE ORDENAÇÃO CORRIGIDA:
    // Losers (Negativos): -4, -3, -2, -1 (Cronológico)
    // Winners (Positivos): 1, 2, 3 (Cronológico)
    const sortedKeys = Object.keys(rounds).sort((a, b) => {
        const rA = rounds[a].round;
        const rB = rounds[b].round;
        if (rA < 0 && rB < 0) return rA - rB; // Mantém a ordem crescente dos negativos
        return rA - rB;
    });

    sortedKeys.forEach(key => {
        const rData = rounds[key];
        const col = document.createElement('div');
        col.className = 'column';
        col.innerHTML = `<div class="round-title">${rData.title}</div>`;
        
        rData.sets.sort((a, b) => a.id - b.id).forEach(set => {
            const p1 = set.slots[0], p2 = set.slots[1];
            const s1 = p1.standing?.stats.score.value, s2 = p2.standing?.stats.score.value;
            const isDone = set.state === 3;
            const isStream = (set.state === 2 || set.state === 1) && set.stream !== null;

            const card = document.createElement('div');
            card.className = `match-card ${isStream ? 'on-stream' : ''}`;
            card.innerHTML = `
                <div class="player ${isDone && s1 > s2 ? 'winner' : ''}">
                    ${getFlagHTML(p1.entrant)} <span class="name">${p1.entrant?.name || 'TBD'}</span>
                    <span class="score">${s1 < 0 ? 'DQ' : (isDone ? s1 : '-')}</span>
                </div>
                <div class="player ${isDone && s2 > s1 ? 'winner' : ''}">
                    ${getFlagHTML(p2.entrant)} <span class="name">${p2.entrant?.name || 'TBD'}</span>
                    <span class="score">${s2 < 0 ? 'DQ' : (isDone ? s2 : '-')}</span>
                </div>`;
            col.appendChild(card);
        });

        if (rData.round > 0) wRoot.appendChild(col);
        else lRoot.appendChild(col);
    });
}

setInterval(loadSets, 30000);
