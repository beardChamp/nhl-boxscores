import './period-breakdown.js';

const styles = new CSSStyleSheet()
styles.replaceSync(`
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
    dt .team-name {
        display: inline-block;
        font-family: 'FigtreeMedium',sans-serif;
        font-size: 1.25rem;
        min-width: 3rem;
        padding-right: 0.5rem;
    }
    dt .record {
        display: inline-block;
        font-size: .75rem;
        min-width: 3rem;
    }
    dd {
        flex: 1 1 auto;
        margin: 0;
        min-width: 50px;
        padding: 0;
        text-align: right;
    }
    .away dd:last-of-type,
    .home dd:last-of-type {
        font-size: 1.5rem;
    }
    .game-data dl {
        margin-bottom: 0;
    }
    details {
        display: block;
        line-height: 1.5rem;
        padding: 0 0 0.5rem;
    }
    .goal-scorers {
        font-size: 0.9rem;
    }
    .goal-scorers .team-name {
        font-family: 'FigtreeMedium', sans-serif;
    }
`)

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
    this.shadowRoot.adoptedStyleSheets = [styles];
    this.awayRecord = this.getAttribute("away-record");
    this.homeRecord = this.getAttribute("home-record");
    this.fetchGameData();
  }

  attributeChangedCallback(attrName, oldVal, newVal) {
    this.render();
  }

  async fetchGameData() {
    const feed = this.getAttribute("feed");
    const response = await fetch(`https://statsapi.web.nhl.com${feed}`);
    const json = await response.json();
    this.data = await json;
    this.render();
  }

  render() {
    if (this.loading) {
      this.shadowRoot.innerHTML = `Loading...`;
    } else {
        // need to handle zero or undefined data states (mostly to supress console errors)
        if (this.data.liveData) {
            const away = this.data.liveData.boxscore.teams.away;
            const home = this.data.liveData.boxscore.teams.home;
            const linescoreData = this.data.liveData.linescore;
            // going to need to check length and loop through periods, need home and away seperately
            const periodsData = JSON.stringify(linescoreData.periods);
            const gameData = this.data.gameData;
            const scoringPlays = Object.values(this.data.liveData.plays.scoringPlays);
            const allPlays = this.data.liveData.plays.allPlays;
            const dateString = dayjs(gameData.datetime.dateTime, 'America/New_York').format('h:mm A');
            const dateObj = dayjs(gameData.datetime.dateTime);
            const now = new dayjs();

            this.shadowRoot.innerHTML = `
            <ul class="boxscore">
                <li class="team-data">
                    <dl class="away">
                        <dt>
                            <span class="team-name">${away.team.triCode}</span>
                            <span class="record">${this.awayRecord}</span>
                        </dt>
                        <dd>
                            <period-breakdown periods=${periodsData} team="away"></period-breakdown>
                        </dd>
                        <dd>${away.teamStats.teamSkaterStats.goals}</dd>
                    </dl>
                    <dl class="home">
                        <dt>
                        <span class="team-name">${home.team.triCode}</span>
                            <span class="record">${this.homeRecord}</span>
                        </dt>
                        <dd>
                        <period-breakdown periods=${periodsData} team="home"></period-breakdown>
                        </dd>
                        <dd>${home.teamStats.teamSkaterStats.goals}</dd>
                    </dl>
                </li>
                <li class="game-data">
                    <dl class="${gameData.status.detailedState === 'In Progress' ? 'show' : 'hide'}">
                        <dt>${now.diff(dateObj) > 0 ? linescoreData.currentPeriodOrdinal : ''}</dt>
                        <dd>${now.diff(dateObj) > 0 ? linescoreData.currentPeriodTimeRemaining : dateString}</dd>
                    </dl>
                </li>
                <details class="goal-scorers">
                    <summary>Scoring Details</summary>
                    <ul>
                        ${scoringPlays.length > 0 
                            ? scoringPlays.map(play => {
                                return `<li><span class="team-name">${allPlays[play].team.triCode}</span>: ${allPlays[play].result.description}</li>`
                            }).join('')
                            : ``
                        }
                    </ul>
                </details>
            </ul>
            `
        }
    }
  }
}

window.customElements.define('game-block', GameBlock);