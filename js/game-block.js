export class GameBlock extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this.feed = '';
    this.awayRecord = '';
    this.homeRecord = '';
    this.data = {};
  }

  static get observedAttributes() {
    return ['feed'];
  }

  async connectedCallback() {
    const feed = this.getAttribute("feed");
    this.awayRecord = this.getAttribute("away-record");
    this.homeRecord = this.getAttribute("home-record")
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
        // need to handle zero or undefined data states (mostly to supress console errors)
        // console.log('data', this.data.liveData);
        const away = this.data.liveData.boxscore.teams.away;
        const home = this.data.liveData.boxscore.teams.home;
        const linescoreData = this.data.liveData.linescore;
        // going to need to check length and loop through periods, need home and away seperately
        const periodsData = linescoreData.periods;
        const gameData = this.data.gameData;
        this.shadowRoot.innerHTML = `
          <style>
            ul {
                margin: 0;
                padding: 0;
            }
            li {
                list-style-type: none;
                margin: 0;
            }
            dl {
                display: flex;
                margin-bottom: 10px;
                padding-bottom: 5px;   
            }
            .team-data dl {
              border-bottom: 1px solid #ddd;
            }
            dt {
                flex: 1 1 auto;
                min-width: 125px;
            }
            dt span {
                font-size: 11px;
            }
            dd {
                flex: 1 1 auto;
                margin: 0;
                min-width: 50px;
                padding: 0;
                text-align: right;
            }
          </style>
          
          <ul class="boxscore">
            <li class="team-data">
              <dl class="away">
                  <dt>
                    ${away.team.triCode} 
                    <span>${this.awayRecord}</span>
                  </dt>
                  <dd>
                    
                  </dd>
                  <dd>${away.teamStats.teamSkaterStats.goals}</dd>
              </dl>
              <dl class="home">
                  <dt>
                    ${home.team.triCode}
                    <span>${this.homeRecord}</span>
                  </dt>
                  <dd>
                    
                  </dd>
                  <dd>${home.teamStats.teamSkaterStats.goals}</dd>
              </dl>
            </li>
            <li class="game-data">
              <dl class="${gameData.status.detailedState === 'In Progress' ? 'show' : 'hide'}">
                <dt>${linescoreData.currentPeriodOrdinal}</dt>
                <dd>${linescoreData.currentPeriodTimeRemaining}</dd>
              </dl>
            </li>
          </ul>
        `
    }
  }
}

window.customElements.define('game-block', GameBlock)
