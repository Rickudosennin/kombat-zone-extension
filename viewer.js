const TOKEN = "43b15884e09284466a58db7b06350b50";
const EVENT_SLUG = "tournament/kombat-zone-iron-fist-8-powered-by-exitlag/event/kz-iron-fist-8";

window.Twitch.ext.onAuthorized((auth) => {
    fetchTop8Data();
});

async function fetchTop8Data() {
    // Primeiro, pegamos as fases para identificar qual é o Top 8
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
            // Filtra para encontrar a fase de encerramento (Top 8 / Finals)
            const targetPhase = phases.find(p => 
                p.name.toLowerCase().includes("top 8") || 
                p.name.toLowerCase().includes("finals")
            ) || phases[phases.length - 1]; // Se não achar pelo nome, pega a última fase criada

            loadSets(targetPhase.id);
        }
    } catch (e) { console.error("Erro ao identificar fase final"); }
}

async function loadSets(phaseId) {
    const querySets = `query GetSets($phaseId: ID) {
      phase(id: $phaseId) {
        sets(page: 1, perPage: 30) {
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
    
    const rounds = {};
    sets.forEach(set => {
        if (!set.slots[0].entrant && !set.slots[1].entrant) return;
        if (!rounds[set.round]) rounds[set.round] = { title: set.fullRoundText, sets: [] };
        rounds[set.round].sets.push(set);
    });

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
                    <div class="score">${s1 !== null && s1 >= 0 ? s1 : (s1 < 0 ? 'DQ' : '-')}</div>
                </div>
                <div class="player ${set.state === 3 && s2 > s1 ? 'winner' : ''}">
                    <div class="name">${set.slots[1].entrant?.name || 'TBD'}</div>
                    <div class="score">${s2 !== null && s2 >= 0 ? s2 : (s2 < 0 ? 'DQ' : '-')}</div>
                </div>`;
            col.appendChild(card);
        });
        
        if (parseInt(r) > 0) wRoot.appendChild(col);
        else lRoot.appendChild(col);
    });
}

// Atualiza a cada 45 segundos
setInterval(fetchTop8Data, 45000);
