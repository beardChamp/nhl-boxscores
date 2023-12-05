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
    this.standings = this.getAttribute("standings");
  }

  static get observedAttributes() {
    return ['feed', 'homeRecord', 'awayRecord'];
  }

  async connectedCallback() {
    this.shadowRoot.adoptedStyleSheets = [styles];
    this.awayRecord = this.getAttribute("awayRecord");
    this.homeRecord = this.getAttribute("homeRecord");
    this.fetchGameData();
  }

  attributeChangedCallback(attrName, oldVal, newVal) {
    this.render();
  }

  async fetchGameData() {
    const feed = this.getAttribute("feed");
    const response = await fetch(`http://localhost:8080/https://api-web.nhle.com/v1/gamecenter/${feed}/boxscore`);
    const json = await response.json();
    this.data = await json;
    this.render();
  }

  render() {
    if (this.loading) {
      this.shadowRoot.innerHTML = `Loading...`;
    } else {
        // need to handle zero or undefined data states (mostly to supress console errors)
        // console.log('standings:', this.standings);
        if (this.data.id) {
            const away = this.data.awayTeam;
            const awayScore = away.score ? away.score : 0;
            const home = this.data.homeTeam;
            const homeScore = home.score ? home.score : 0;
            const linescoreData = this.data.boxscore ? this.data.boxscore.linescore : {};
            // going to need to check length and loop through periods, need home and away seperately
            const periodsData = linescoreData.byPeriod ? linescoreData.byPeriod : [];
            this.awayTeamPeriods = JSON.stringify(periodsData.map((period) => period.away));
            this.homeTeamPeriods = JSON.stringify(periodsData.map((period) => period.home));;
            // const scoringPlays = Object.values(this.data.liveData.plays.scoringPlays);
            // const allPlays = this.data.liveData.plays.allPlays;
            const dateString = dayjs(this.data.startTimeUTC, 'America/New_York').format('h:mm A');
            const dateObj = dayjs(this.data.startTimeUTC);
            const now = new dayjs();

            this.shadowRoot.innerHTML = `
            <ul class="boxscore">
                <li class="team-data">
                    <dl class="away">
                        <dt>
                            <span class="team-name">${away.abbrev}</span>
                            <span class="record">${this.awayRecord}</span>
                        </dt>
                        <dd>
                            <period-breakdown periods=${this.awayTeamPeriods} team="away"></period-breakdown>
                        </dd>
                        <dd>${awayScore}</dd>
                    </dl>
                    <dl class="home">
                        <dt>
                        <span class="team-name">${home.abbrev}</span>
                            <span class="record">${this.homeRecord}</span>
                        </dt>
                        <dd>
                            <period-breakdown periods=${this.homeTeamPeriods} team="home"></period-breakdown>
                        </dd>
                        <dd>${homeScore}</dd>
                    </dl>
                </li>
                <li class="game-data">
                    <dl class="${this.data.gameState === 'LIVE' ? 'show' : 'hide'}">
                        <dt>${now.diff(dateObj) > 0 ? this.data.period : ''}</dt>
                        <dd>${now.diff(dateObj) > 0 ? this.data.clock.timeRemaining : dateString}</dd>
                    </dl>
                </li>
                
            </ul>
            `
        }
    }
  }
}

window.customElements.define('game-block', GameBlock);