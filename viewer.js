const STARTGG_TOKEN = '43b15884e09284466a58db7b06350b50'; 
const TOURNAMENT_SLUG = 'tournament/kombat-zone-iron-fist-6-powered-by-exitlag'; 

async function fetchBracket() {
    const query = `
    query GetSets($slug: String) {
      tournament(slug: $slug) {
        events {
          sets(page: 1, perPage: 20, sortType: CALL_ORDER) {
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
        const allSets = json.data.tournament.events[0].sets.nodes;

        // Definimos as rodadas que pertencem ao Top 8
        const top8Rounds = [
            "Grand Final",
            "Winners Final",
            "Losers Final",
            "Winners Semi-Final",
            "Losers Semi-Final",
            "Losers Quarter-Final",
            "Losers Round 1"
        ];

        // Filtramos para mostrar apenas o que é Top 8
        const filteredSets = allSets.filter(set => 
            top8Rounds.some(roundName => set.fullRoundText.includes(roundName))
        );

        // Mapeamento para garantir a ordem correta (Grand Final no topo)
        const orderMap = {
            "Grand Final": 1,
            "Winners Final": 2,
            "Losers Final": 3,
            "Winners Semi-Final": 4,
            "Losers Semi-Final": 5,
            "Losers Quarter-Final": 6,
            "Losers Round 1": 7
        };

        filteredSets.sort((a, b) => {
            const getRank = (text) => {
                for (const key in orderMap) {
                    if (text.includes(key)) return orderMap[key];
                }
                return 99;
            };
            return getRank(a.fullRoundText) - getRank(b.fullRoundText);
        });

        render(filteredSets);
    } catch (err) {
        console.error("Erro na API:", err);
        document.getElementById('bracket-container').innerHTML = "<p class='status-msg'>Erro ao carregar dados.</p>";
    }
}

function render(sets) {
    const container = document.getElementById('bracket-container');
    if (!sets || sets.length === 0) {
        container.innerHTML = "<p class='status-msg'>Nenhuma partida de Top 8 encontrada.</p>";
        return;
    }

    container.innerHTML = sets.map(set => `
        <div class="set-card">
            <div class="round-name">${set.fullRoundText.replace("Bracket", "").trim()}</div>
            <div class="score-line">
                <span>${set.displayScore || 'VS'}</span>
            </div>
        </div>
    `).join('');
}

// Atualiza a cada 1 minuto
setInterval(fetchBracket, 60000);
fetchBracket();
