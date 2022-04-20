export class GameBlock extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this.feed = '';
  }

  static get observedAttributes() {
    return ['feed'];
  }

  async connectedCallback() {
    const feed = this.getAttribute("feed");
    const response = await fetch(`https://statsapi.web.nhl.com${feed}`);
    const json = await response.json();
    this.data = await json;
    this.render();
  }

  attributeChangedCallback(attrName, oldVal, newVal) {
    this.render();
  }

  render() {
    if (this.loading) {
      this.shadowRoot.innerHTML = `Loading...`;
    } else {
        const away = this.data.liveData.boxscore.teams.away;
        const home = this.data.liveData.boxscore.teams.home;
        const gameData = this.data.liveData.linescore;
        this.shadowRoot.innerHTML = `
          <style>
            ul {
                padding: 0;
            }
            li {
                list-style-type: none;
                margin: 0;
                padding-bottom: 20px;
            }
            dl {
                display: flex;
                margin-bottom: 10px;
            }
            dt {
                min-width: 100px;
            }
            dd {
                padding: 0;
            }
          </style>
          
          <ul class="boxscore">
            <li class="team-data">
              <dl class="away">
                  <dt>${away.team.triCode}</dt>
                  <dd>${away.teamStats.teamSkaterStats.goals}</dd>
              </dl>
              <dl class="home">
                  <dt>${home.team.triCode}</dt>
                  <dd>${home.teamStats.teamSkaterStats.goals}</dd>
              </dl>
            </li>
            <li class="game-data">
              <dl>
                <dt>${gameData.currentPeriodOrdinal}</dt>
                <dd>${gameData.currentPeriodTimeRemaining}</dd>
              </dl>
            </li>
          </ul>
        `
    }
  }
}

window.customElements.define('game-block', GameBlock)
