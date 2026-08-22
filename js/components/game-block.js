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
        font-family: 'FigtreeMedium', sans-serif;
        font-size: 1.25rem;
        font-weight: normal;
        margin: 0;
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
    .goal-scorers .time-remaining dl {
        padding-bottom: 0;
    }
    .scoring-block {
        display: flex;
        padding-left: 0.8rem;
    }
    .scoring-block > div {
        flex: 1 1 auto;
        margin-top: 0.5rem;
    }
    .scoring-block h4 {
        border-bottom: 1px solid #ddd;
        font-family: "FigtreeMedium", sans-serif;
        font-weight: normal;
        margin: 0px 0 6px 0;
        padding-bottom: 2px;
    }
    .scoring-block .team-name,
    .scoring-block .player-name {
        display: inline-block;
        width: 45%;
    }
    .scoring-block .team-goals, 
    .scoring-block .player-goals,
    .scoring-block .team-assists,
    .scoring-block .player-assists {
        color: #666;
        display: inline-block;
        width: 15%;
    }
    .skeleton {
        li, details {
        color: #666;
        }
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
    this.postRender();
  }

  render() {
    this.shadowRoot.innerHTML = `
        <ul class="boxscore skeleton">
            <li class="team-data">
                <dl class="away">
                    <dt>
                        <h3 class="team-name">&#9702;&#9702;&#9702;</h3>
                        <span class="record">(&#9702;&#9702;-&#9702;&#9702;-&#9702;&#9702;)</span>
                    </dt>
                    <dd>0</dd>
                </dl>
                <dl class="home">
                    <dt>
                        <h3 class="team-name">&#9702;&#9702;&#9702;</h3>
                        <span class="record">(&#9702;&#9702;-&#9702;&#9702;-&#9702;&#9702;)</span>
                    </dt>
                    <dd>0</dd>
                </dl>
            </li>
            <li class="game-data">
                <dl class="time-remaining">
                    <dt></dt>
                    <dd>00:00</dd>
                </dl>
            </li> 
            <details class="goal-scorers">
                <summary>Scoring Details</summary>
                <section class="scoring-block">
                </section>
            </details>
        </ul>
    `
  }

  postRender() {
    if (this.loading) {
      this.shadowRoot.innerHTML = `Loading...`;
    } else {
        if (this.data && this.data.id) {
            const away = this.data.awayTeam;
            const awayPlayers = this.data.playerByGameStats ? [...this.data.playerByGameStats.awayTeam.forwards, ...this.data.playerByGameStats.awayTeam.defense] : [];
            const awayScore = away.score ? away.score : 0;
            const awayScorers = awayPlayers.length > 0 ? awayPlayers.filter((player) => player.goals > 0 || player.assists > 0) : [];
            
            const home = this.data.homeTeam;
            const homePlayers = this.data.playerByGameStats ? [...this.data.playerByGameStats.homeTeam.forwards, ...this.data.playerByGameStats.homeTeam.defense] : [];
            const homeScore = home.score ? home.score : 0;
            const homeScorers = homePlayers.length > 0 ? homePlayers.filter((player) => player.goals > 0 || player.assists > 0) : [];

            const dateString = Temporal.Instant.from(this.data.startTimeUTC).toZonedDateTimeISO('America/New_York');
            const dateObj = Temporal.Instant.from(this.data.startTimeUTC).toZonedDateTimeISO('America/New_York');
            const now = Temporal.Now.plainDateISO();


            this.shadowRoot.innerHTML = `
            <ul class="boxscore">
                <li class="team-data">
                    <dl class="away">
                        <dt>
                            <h3 class="team-name">${away.abbrev}</h3>
                            <span class="record">${this.awayRecord}</span>
                        </dt>
                        <dd>${awayScore}</dd>
                    </dl>
                    <dl class="home">
                        <dt>
                            <h3 class="team-name">${home.abbrev}</h3>
                            <span class="record">${this.homeRecord}</span>
                        </dt>
                        <dd>${homeScore}</dd>
                    </dl>
                </li>
                <li class="game-data">
                    <dl class="time-remaining ${this.data.gameState === 'LIVE' ? 'show' : 'hide'}">
                        <dt>${Temporal.PlainDateTime.compare(dateObj, now) > 0  && this.data.clock && this.data.clock.running ? 'Period ' + this.data.periodDescriptor.number : ''}</dt>
                        <dd>${Temporal.PlainDateTime.compare(dateObj, now) > 0  && this.data.clock ? this.data.clock.timeRemaining : Temporal.PlainTime.from(dateString).toString()}</dd>
                    </dl>
                </li> 
                <details class="goal-scorers">
                    <summary>Scoring Details</summary>
                    <section class="scoring-block">
                        <div class="goals-away">
                            <h4><span class="team-name">${away.abbrev}</span> <span class="team-goals">G</span> <span class="team-assists">A</span></h4>
                            <ul>
                                ${awayScorers.length > 0 ?
                                    awayScorers.map((player) => `<li><span class="player-name">${player.name.default}</span> <span class="player-goals">${player.goals}</span> <span class="player-assists">${player.assists}</span></li>`).join('')
                                    : ``
                                }
                            </ul>
                        </div>
                        <div class="goals-home">
                            <h4><span class="team-name">${home.abbrev}</span> <span class="team-goals">G</span> <span class="team-assists">A</span></h4>
                            <ul>
                                ${homeScorers.length > 0 ?
                                    homeScorers.map((player) => `<li><span class="player-name">${player.name.default}</span>  <span class="player-goals">${player.goals}</span> <span class="player-assists">${player.assists}</span></li>`).join('')
                                    : ``
                                }
                            </ul>
                        </div>
                    </section>
                </details>
            </ul>
            `
        }
    }
  }
}

window.customElements.define('game-block', GameBlock);