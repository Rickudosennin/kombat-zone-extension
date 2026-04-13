const TOKEN = "43b15884e09284466a58db7b06350b50";
const EVENT_SLUG = "tournament/kombat-zone-iron-fist-8-powered-by-exitlag/event/kz-iron-fist-8";

const COUNTRY_MAP = {
    "Brazil": "BR", "United States": "US", "Argentina": "AR", "Chile": "CL", "Colombia": "CO", 
    "Mexico": "MX", "Peru": "PE", "Venezuela": "VE", "Ecuador": "EC", "Bolivia": "BO",
    "Paraguay": "PY", "Uruguay": "UY", "Portugal": "PT", "Spain": "ES", "France": "FR", 
    "Germany": "DE", "Italy": "IT", "Japan": "JP", "South Korea": "KR", "Canada": "CA"
};

let currentPhaseId = null;
let phasesList = [];

// Inicia quando a Twitch autoriza
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

// Atalhos de teclado
window.addEventListener('keydown', (e) => {
    const key = parseInt(e.key);
    if (key >= 1 && key <= phasesList.length) changePhase(phasesList[key - 1].id);
    if (e.key.toLowerCase() === 'h') document.getElementById('phase-nav').classList.toggle('show-nav');
});

function changePhase(id) {
    currentPhaseId = id;
    document.querySelectorAll('.btn-phase').forEach(btn => {
        btn.classList.toggle('active', btn.getAttribute('data-id') == id);
    });
    loadSets();
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
            phasesList = res.data.event.phases;
            renderNav(phasesList);
            if (!currentPhaseId) changePhase(phasesList[0].id);
        }
    } catch (e) { console.error("Erro ao carregar fases"); }
}

async function loadSets() {
    const query = `query GetSets($phaseId: ID) {
      phase(id: $phaseId) {
        sets(page: 1, perPage: 100) {
          nodes {
            id fullRoundText round state
            stream { id }
            slots { 
                entrant { 
                    name id 
                    participants { user { location { country } } }
                } 
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
            body: JSON.stringify({ query, variables: { slug: EVENT_SLUG, phaseId: currentPhaseId } }),
        });
        const res = await response.json();
        if (res.data?.phase) renderBracket(res.data.phase.sets.nodes);
    } catch (e) { console.error("Erro ao carregar partidas"); }
}

function renderNav(phases) {
    const nav = document.getElementById('phase-nav');
    nav.innerHTML = '';
    phases.forEach((p, index) => {
        const btn = document.createElement('button');
        btn.className = `btn-phase ${currentPhaseId === p.id ? 'active' : ''}`;
        btn.setAttribute('data-id', p.id);
        btn.innerText = `[${index + 1}] ${p.name}`;
        btn.onclick = () => changePhase(p.id);
        nav.appendChild(btn);
    });
}

function createCol(data, setMap) {
    const col = document.createElement('div');
    col.className = 'column';
    col.innerHTML = `<div class="round-title">${data.title}</div>`;
    data.sets.sort((a, b) => a.id - b.id);

    data.sets.forEach(set => {
        const p1 = set.slots[0], p2 = set.slots[1];
        const s1 = p1?.standing?.stats.score.value ?? 0, s2 = p2?.standing?.stats.score.value ?? 0;
        const isDone = set.state === 3;
        const isStartedOnStream = set.state === 2 && set.stream !== null;

        const card = document.createElement('div');
        card.id = `set-${set.id}`;
        card.className = `match-card ${isStartedOnStream ? 'on-stream' : ''}`;
        card.innerHTML = `
            <div class="player ${isDone && s1 > s2 ? 'winner' : (isDone && s2 > s1 ? 'loser' : '')}">
                <div class="name-container">
                    ${getFlagHTML(p1?.entrant)}
                    <div class="name">${p1?.entrant?.name || 'TBD'}</div>
                </div>
                <div class="score">${isDone ? (s1 < 0 ? 'DQ' : s1) : '-'}</div>
            </div>
            <div class="player ${isDone && s2 > s1 ? 'winner' : (isDone && s1 > s2 ? 'loser' : '')}">
                <div class="name-container">
                    ${getFlagHTML(p2?.entrant)}
                    <div class="name">${p2?.entrant?.name || 'TBD'}</div>
                </div>
                <div class="score">${isDone ? (s2 < 0 ? 'DQ' : s2) : '-'}</div>
            </div>`;
        col.appendChild(card);
        setMap.set(set.id, card);
    });
    return col;
}

function renderBracket(sets) {
    const wRoot = document.getElementById('winners-root');
    const lRoot = document.getElementById('losers-root');
    wRoot.innerHTML = ''; lRoot.innerHTML = '';
    
    const rounds = {};
    sets.forEach(set => {
        const hasPlayers = set.slots.some(s => s.entrant !== null);
        if (!hasPlayers) return; 
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

    const setMap = new Map();
    let hasWinners = false, hasLosers = false;

    sortedKeys.forEach(key => {
        const rData = rounds[key];
        const col = createCol(rData, setMap);
        if (rData.round > 0) { wRoot.appendChild(col); hasWinners = true; }
        else { lRoot.appendChild(col); hasLosers = true; }
    });

    document.getElementById('winners-area').classList.toggle('empty-area', !hasWinners);
    document.getElementById('losers-area').classList.toggle('empty-area', !hasLosers);
    setTimeout(() => drawConnectors(sets, setMap), 150);
}

function drawConnectors(sets, setMap) {
    const container = document.getElementById('connectors-container');
    container.innerHTML = '';
    const handledConnections = new Set();

    sets.forEach(set => {
        if (set.state !== 3) return;
        const p1Score = set.slots[0]?.standing?.stats.score.value ?? 0;
        const p2Score = set.slots[1]?.standing?.stats.score.value ?? 0;
        const winnerEntrant = p1Score > p2Score ? set.slots[0]?.entrant : set.slots[1]?.entrant;
        if (!winnerEntrant) return;

        const targetSet = sets.find(s => 
            s.round === (set.round > 0 ? set.round + 1 : set.round - 1) && 
            s.slots.some(slot => slot.entrant?.id === winnerEntrant.id)
        );

        if (targetSet && setMap.has(set.id) && setMap.has(targetSet.id)) {
            const connectionKey = `${set.id}_${targetSet.id}`;
            if (handledConnections.has(connectionKey)) return;
            createLedConnector(setMap.get(set.id), setMap.get(targetSet.id), container);
            handledConnections.add(connectionKey);
        }
    });
}

function createLedConnector(startNode, endNode, container) {
    const startRect = startNode.getBoundingClientRect();
    const endRect = endNode.getBoundingClientRect();
    const bodyRect = document.body.getBoundingClientRect();
    const startX = startRect.right - bodyRect.left;
    const startY = startRect.top - bodyRect.top + (startRect.height / 2);
    const endX = endRect.left - bodyRect.left;
    const endY = endRect.top - bodyRect.top + (endRect.height / 2);
    const midX = startX + (endX - startX) / 2;

    createSegment(startX, startY, midX - startX, 4, container, 'none');
    if (Math.abs(endY - startY) > 5) {
        createSegment(midX - 2, Math.min(startY, endY), 4, Math.abs(endY - startY), container, endY > startY ? 'down' : 'up');
    }
    createSegment(midX, endY, endX - midX, 4, container, 'none');
}

function createSegment(x, y, w, h, container, direction) {
    const segment = document.createElement('div');
    segment.className = 'connector';
    segment.style.left = `${x}px`;
    segment.style.top = `${y - (direction !== 'none' ? 0 : 2)}px`;
    segment.style.width = `${w}px`;
    segment.style.height = `${h}px`;
    const led = document.createElement('div');
    led.className = 'led-flow';
    led.style.width = '100%'; led.style.height = '100%';
    if (direction === 'down') led.style.animationName = 'led-animation-v-down';
    else if (direction === 'up') led.style.animationName = 'led-animation-v-up';
    else led.style.animationName = 'led-animation';
    segment.appendChild(led);
    container.appendChild(segment);
}

setInterval(loadSets, 30000);
