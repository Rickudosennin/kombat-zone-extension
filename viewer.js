const TOKEN = "43b15884e09284466a58db7b06350b50".trim();
const EVENT_SLUG = "tournament/kombat-zone-iron-fist-8-powered-by-exitlag/event/kz-iron-fist-8";

const COUNTRY_MAP = {
    "Brazil": "BR", "United States": "US", "Argentina": "AR", "Chile": "CL", "Colombia": "CO", 
    "Mexico": "MX", "Peru": "PE", "Venezuela": "VE", "Ecuador": "EC", "Bolivia": "BO",
    "Paraguay": "PY", "Uruguay": "UY", "Portugal": "PT", "Spain": "ES", "France": "FR"
};

let currentPhaseId = null;
let phasesList = [];

// Autenticação da Twitch
window.Twitch.ext.onAuthorized((auth) => {
    loadPhases();
});

function getFlagHTML(entrant) {
    const countryName = entrant?.participants?.[0]?.user?.location?.country;
    if (!countryName) return `<div style="width:35px; height:20px; margin-right:12px; background:rgba(255,255,255,0.05);"></div>`;
    const code = COUNTRY_MAP[countryName];
    if (!code) return `<div style="width:35px; height:20px; margin-right:12px; background:rgba(255,255,255,0.05);"></div>`;
    return `<img src="https://flagcdn.com/w40/${code.toLowerCase()}.png" class="flag-img">`;
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
        if (res.data?.event?.phases) {
            const allPhases = res.data.event.phases;
            // Busca Automática do TOP 8
            const top8 = allPhases.find(p => p.name.toLowerCase().includes("top 8") || p.name.toLowerCase().includes("finals"));
            phasesList = top8 ? [top8] : allPhases;
            if (!currentPhaseId) changePhase(phasesList[0].id);
        }
    } catch (e) { console.error("Erro API"); }
}

function changePhase(id) {
    currentPhaseId = id;
    loadSets();
}

async function loadSets() {
    const query = `query GetSets($phaseId: ID) {
      phase(id: $phaseId) {
        sets(page: 1, perPage: 60) {
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
        if (res.data?.phase) renderBracket(res.data.phase.sets.nodes);
    } catch (e) { console.error("Erro Sets"); }
}

function renderBracket(sets) {
    const wRoot = document.getElementById('winners-root');
    const lRoot = document.getElementById('losers-root');
    wRoot.innerHTML = ''; lRoot.innerHTML = '';
    
    const rounds = {};
    const setMap = new Map();

    sets.forEach(set => {
        if (!set.slots.some(s => s.entrant)) return;
        const key = `${set.round}_${set.fullRoundText}`;
        if (!rounds[key]) rounds[key] = { round: set.round, title: set.fullRoundText, sets: [] };
        rounds[key].sets.push(set);
    });

    const sortedKeys = Object.keys(rounds).sort((a, b) => {
        const rA = rounds[a], rB = rounds[b];
        if (rA.round > 0 && rB.round > 0) return rA.round - rB.round;
        if (rA.round < 0 && rB.round < 0) return rB.round - rA.round;
        return rA.round - rB.round;
    });

    sortedKeys.forEach(key => {
        const rData = rounds[key];
        const col = document.createElement('div');
        col.className = 'column';
        col.innerHTML = `<div class="round-title">${rData.title}</div>`;
        
        rData.sets.sort((a, b) => a.id - b.id).forEach(set => {
            const p1 = set.slots[0], p2 = set.slots[1];
            const s1 = p1?.standing?.stats.score.value, s2 = p2?.standing?.stats.score.value;
            const card = document.createElement('div');
            card.className = `match-card ${set.state === 2 && set.stream ? 'on-stream' : ''}`;
            card.innerHTML = `
                <div class="player ${set.state === 3 && s1 > s2 ? 'winner' : ''}">
                    <div class="name-container">${getFlagHTML(p1.entrant)} <div class="name">${p1.entrant?.name || 'TBD'}</div></div>
                    <div class="score">${set.state === 3 ? (s1 < 0 ? 'DQ' : s1) : '-'}</div>
                </div>
                <div class="player ${set.state === 3 && s2 > s1 ? 'winner' : ''}">
                    <div class="name-container">${getFlagHTML(p2.entrant)} <div class="name">${p2.entrant?.name || 'TBD'}</div></div>
                    <div class="score">${set.state === 3 ? (s2 < 0 ? 'DQ' : s2) : '-'}</div>
                </div>`;
            col.appendChild(card);
            setMap.set(set.id, card);
        });

        if (rData.round > 0) wRoot.appendChild(col);
        else lRoot.appendChild(col);
    });
}

setInterval(loadSets, 45000);