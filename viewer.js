const STARTGG_TOKEN = '43b15884e09284466a58db7b06350b50'; 
const TOURNAMENT_SLUG = 'tournament/kombat-zone-iron-fist-6-powered-by-exitlag'; // Mude para o torneio do dia

async function fetchBracket() {
    const query = `
    query GetSets($slug: String) {
      tournament(slug: $slug) {
        events {
          sets(page: 1, perPage: 5, sortType: RECENT) {
            nodes {
              fullRoundText
              displayScore
            }
          }
        }
      }
    }`;

    try {
        const response = await fetch('https://api.start.gg/gql/alpha', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${STARTGG_TOKEN}`,
            },
            body: JSON.stringify({ query, variables: { slug: TOURNAMENT_SLUG } }),
        });

        const json = await response.json();
        const sets = json.data.tournament.events[0].sets.nodes;
        render(sets);
    } catch (err) {
        console.error("Erro na API:", err);
        document.getElementById('bracket-container').innerHTML = "<p class='status-msg'>Erro ao carregar dados.</p>";
    }
}

function render(sets) {
    const container = document.getElementById('bracket-container');
    if (!sets || sets.length === 0) {
        container.innerHTML = "<p class='status-msg'>Nenhuma partida ativa.</p>";
        return;
    }

    container.innerHTML = sets.map(set => `
        <div class="set-card">
            <div class="round-name">${set.fullRoundText}</div>
            <div class="score-line">
                <span>${set.displayScore || 'Aguardando...'}</span>
            </div>
        </div>
    `).join('');
}

// Atualiza a cada 1 minuto
setInterval(fetchBracket, 60000);
fetchBracket();