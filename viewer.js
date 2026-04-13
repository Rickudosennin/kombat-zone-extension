const TOKEN = "43b15884e09284466a58db7b06350b50";
const EVENT_SLUG = "tournament/kombat-zone-iron-fist-8-powered-by-exitlag/event/kz-iron-fist-8";

let currentPhaseId = null;

window.Twitch.ext.onAuthorized((auth) => {
    loadPhases();
});

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
            const phases = res.data.event.phases;
            renderNav(phases);
            if (!currentPhaseId) changePhase(phases[0].id);
        }
    } catch (e) { console.error("Erro start.gg phases"); }
}

function changePhase(id) {
    currentPhaseId = id;
    document.querySelectorAll('.btn-phase').forEach(btn => {
        btn.classList.toggle('active', btn.getAttribute('data-id') == id);
    });
    loadSets();
}

function renderNav(phases) {
    const nav = document.getElementById('phase-nav');
    nav.innerHTML = '';
    phases.forEach(p => {
        const btn = document.createElement('button');
        btn.className = 'btn-phase';
        btn.setAttribute('data-id', p.id);
        btn.innerText = p.name;
        btn.onclick = () => changePhase(p.id);
        nav.appendChild(btn);
    });
}

async function loadSets() {
    const query = `query GetSets($phaseId: ID) {
      phase(id: $phaseId) {
        sets(page: 1, perPage: 50) {
          nodes {
            id fullRoundText round state
            stream { id }
            slots { 
                entrant { name id } 
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
    } catch (e) { console.error("Erro start.gg sets"); }
}

function renderBracket(sets) {
    const wRoot = document.getElementById('winners-root');
    const lRoot = document.getElementById('losers-root');
    wRoot.innerHTML = ''; lRoot.innerHTML = '';
    
    const rounds = {};
    sets.forEach(set => {
        if (!set.slots[0].entrant && !set.slots[1].entrant) return;
        if (!rounds[set.round]) rounds[set.round] = { title: set.fullRoundText, sets: [] };
        rounds[set.round].sets.push(set);
    });

    const setMap = new Map();
    Object.keys(rounds).sort((a, b) => a - b).forEach(r => {
        const col = document.createElement('div');
        col.className = 'column';
        col.innerHTML = `<div class="round-title">${rounds[r].title}</div>`;
        
        rounds[r].sets.forEach(set => {
            const card = document.createElement('div');
            card.className = `match-card ${set.state === 2 && set.stream ? 'on-stream' : ''}`;
            const s1 = set.slots[0].standing?.stats.score.value;
            const s2 = set.slots[1].standing?.stats.score.value;
            
            card.innerHTML = `
                <div class="player ${set.state === 3 && s1 > s2 ? 'winner' : ''}">
                    <div class="name">${set.slots[0].entrant?.name || 'TBD'}</div>
                    <div class="score">${s1 !== null ? s1 : '-'}</div>
                </div>
                <div class="player ${set.state === 3 && s2 > s1 ? 'winner' : ''}">
                    <div class="name">${set.slots[1].entrant?.name || 'TBD'}</div>
                    <div class="score">${s2 !== null ? s2 : '-'}</div>
                </div>`;
            col.appendChild(card);
            setMap.set(set.id, card);
        });
        
        if (parseInt(r) > 0) wRoot.appendChild(col);
        else lRoot.appendChild(col);
    });
}

setInterval(loadSets, 60000);
