import './game-block.js';

const styles = new CSSStyleSheet()
styles.replaceSync(`
  ul {
    display: flex;
    flex-wrap: wrap;
    padding: 0;
  }
  li {
    flex: 1 1 25%;
    list-style-type: none;
    margin: 1rem 1.5rem 0.5rem;
    padding: 0 1rem;
  }
  footer {
    padding: 0 2.5rem;
  }
`)

export class ScoreBase extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this.baseUrl = 'https://statsapi.web.nhl.com/api/v1/schedule';
    this.copyright = '';
    this.games = {};
    this.today = {};
  }

  async connectedCallback() {
    this.updateScheduleData(new dayjs());
    this.shadowRoot.adoptedStyleSheets = [styles];
  }

  async updateGameData(dateObject) {
    const response = await fetch(`${this.baseUrl}?date=${dateObject.format('YYYY-MM-DD')}`);
    const json = await response.json();
    this.copyright = await json.copyright;
    this.games = await json.dates[0];
    this.totalGames = await json.totalGames;
    this.today = JSON.stringify(dateObject);
  }

  async updateScheduleData(dateObject) {
    await this.updateGameData(dateObject);
    this.render();
  }

  async render() {
    if (this.loading) {
      this.shadowRoot.innerHTML = `Loading...`;
    } else {
      await this.renderData();
      await this.postRender();
    }
  }

  async renderData() {
    this.shadowRoot.innerHTML = `
    <date-nav todayDate=${this.today}></date-nav>
    <ul>
      ${ this.totalGames > 0
            ? this.games.games.map((game) => {
                const awayRecord = game.teams.away.leagueRecord;
                const homeRecord = game.teams.home.leagueRecord
                return `
                <li>
                    <game-block feed="${game.link}" away-record="(${awayRecord.wins !== undefined ? awayRecord.wins : '0'}-${awayRecord.losses !== undefined ? awayRecord.losses : '0'}-${awayRecord.ot ? awayRecord.ot : '0'})" home-record="(${homeRecord.wins !== undefined ? homeRecord.wins : '0'}-${homeRecord.losses !== undefined ? homeRecord.losses : '0'}-${homeRecord.ot !== undefined ? homeRecord.ot : '0'})"></game-block>
                </li>
                `;
            }).join('')
            : `<li>
                <p>There are no games available for today.</p>
            </li>`
        }
    </ul>
    <footer>
      <p><small>Disclaimer: ${this.copyright}</small></p>
    </footer>`;
  }

  async postRender() {
    const shadow = this.shadowRoot.querySelector('date-nav');
    shadow.addEventListener("dateUpdated", (e) => {
        this.updateScheduleData(e.detail);
    });
  }
}

window.customElements.define('score-base', ScoreBase);
