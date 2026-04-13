const TOKEN = "43b15884e09284466a58db7b06350b50";
const EVENT_SLUG = "tournament/kombat-zone-iron-fist-8-powered-by-exitlag/event/kz-iron-fist-8";

window.Twitch.ext.onAuthorized((auth) => {
    fetchTop8Data();
});

async function fetchTop8Data() {
    const queryPhases = `query GetPhases($slug: String) { event(slug: $slug) { phases { id name } } }`;
    try {
        const responsePhases = await fetch('https://api.start.gg/gql/alpha', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${TOKEN}` },
            body: JSON.stringify({ query: queryPhases, variables: { slug: EVENT_SLUG } }),
        });
        const resPhases = await responsePhases.json();
        const phases = resPhases.data?.event?.phases;

        if (phases && phases.length > 0) {
            // Busca automaticamente a fase final (Top 8)
            const targetPhase = phases.find(p => 
                p.name.toLowerCase().includes("top 8") || 
                p.name.toLowerCase().includes("finals")
            ) || phases[phases.length - 1];

            loadSets(targetPhase.id);
        }
    } catch (e) { console.error("Erro na conexão com start.gg"); }
}

async function loadSets(phaseId) {
    const querySets = `query GetSets($phaseId: ID) {
      phase(id: $phaseId) {
        sets(page: 1, perPage: 40) {
          nodes {
            id fullRoundText round state
            stream { id }
            slots { 
                entrant { name } 
                standing { stats { score { value } } } 
            }
          }
        }
      }
    }`;

    try {
        const responseSets = await fetch('https://api.start.gg/gql/alpha', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${TOKEN}` },
            body: JSON.stringify({ query: querySets, variables: { phaseId } }),
        });
        const resSets = await responseSets.json();
        if (resSets.data?.phase) renderBracket(resSets.data.phase.sets.nodes);
    } catch (e) { console.error("Erro ao carregar partidas"); }
}

function renderBracket(sets) {
    const wRoot = document.getElementById('winners-root');
    const lRoot = document.getElementById('losers-root');
    wRoot.innerHTML = ''; lRoot.innerHTML = '';
    
    const winnersRounds = {};
    const losersRounds = {};

    sets.forEach(set => {
        if (!set.slots[0].entrant && !set.slots[1].entrant) return;
        
        if (set.round > 0) {
            // Winners Bracket: Chave positiva
            if (!winnersRounds[set.round]) winnersRounds[set.round] = { title: set.fullRoundText, sets: [] };
            winnersRounds[set.round].sets.push(set);
        } else {
            // Losers Bracket: Chave negativa
            const rKey = Math.abs(set.round);
            if (!losersRounds[rKey]) losersRounds[rKey] = { title: set.fullRoundText, sets: [] };
            losersRounds[rKey].sets.push(set);
        }
    });

    // Renderiza Winners: Ordem crescente (Round 1 -> Final)
    Object.keys(winnersRounds).sort((a, b) => a - b).forEach(r => {
        appendColumn(winnersRounds[r], wRoot);
    });

    // Renderiza Losers: Ordem DECRESCENTE (Corrige a sequência para mostrar Round 1 primeiro)
    Object.keys(losersRounds).sort((a, b) => b - a).forEach(r => {
        appendColumn(losersRounds[r], lRoot);
    });
}

function appendColumn(roundData, container) {
    const col = document.createElement('div');
    col.className = 'column';
    col.innerHTML = `<div class="round-title">${roundData.title}</div>`;
    
    roundData.sets.forEach(set => {
        const card = document.createElement('div');
        card.className = `match-card ${set.state === 2 && set.stream ? 'on-stream' : ''}`;
        const s1 = set.slots[0].standing?.stats.score.value;
        const s2 = set.slots[1].standing?.stats.score.value;
        
        card.innerHTML = `
            <div class="player ${set.state === 3 && s1 > s2 ? 'winner' : ''}">
                <div class="name">${set.slots[0].entrant?.name || 'TBD'}</div>
                <div class="score">${s1 !== null && s1 >= 0 ? s1 : (s1 < 0 ? 'DQ' : '-')}</div>
            </div>
            <div class="player ${set.state === 3 && s2 > s1 ? 'winner' : ''}">
                <div class="name">${set.slots[1].entrant?.name || 'TBD'}</div>
                <div class="score">${s2 !== null && s2 >= 0 ? s2 : (s2 < 0 ? 'DQ' : '-')}</div>
            </div>`;
        col.appendChild(card);
    });
    container.appendChild(col);
}

// Atualização automática para acompanhar a live
setInterval(fetchTop8Data, 60000);
