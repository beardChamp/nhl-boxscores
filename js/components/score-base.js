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
    max-width: 50%;
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
    this.baseUrl = 'http://localhost:8080/https://api-web.nhle.com/v1/schedule';
    this.copyright = '';
    this.games = {};
    this.today = {};
    this.date = new dayjs();
  }

  async connectedCallback() {
    await this.fetchStandings();
    await this.updateScheduleData(this.date);
    this.shadowRoot.adoptedStyleSheets = [styles];
  }

  async fetchStandings(dateObject) {
    dateObject = dateObject ? dayjs(dateObject).format('YYYY-MM-DD') : this.date.format('YYYY-MM-DD');
    const response = await fetch(`http://localhost:8080/https://api-web.nhle.com/v1/standings/${dateObject}`);
    const json = await response.json();
    this.standings = await json.standings;
  }

  async updateGameData(dateObject) {
    const response = await fetch(`${this.baseUrl}/${dateObject.format('YYYY-MM-DD')}`);
    const json = await response.json();
    this.games = await json.gameWeek.find((date) => date.date === dateObject.format('YYYY-MM-DD'));
    this.totalGames = await this.games.games.length;
    this.today = JSON.stringify(dateObject);
  }

  buildTeamRecord(abbr) {
    const teamObject = this.standings.filter((team) => team.teamAbbrev.default === abbr);
    return `(${teamObject[0].wins}-${teamObject[0].losses}-${teamObject[0].otLosses})`
  }

  async updateScheduleData(dateObject) {
    await this.fetchStandings(dateObject);
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
                return `
                <li>
                    <game-block feed="${game.id}" homeRecord="${this.buildTeamRecord(game.homeTeam.abbrev)}" awayRecord="${this.buildTeamRecord(game.awayTeam.abbrev)}"></game-block>
                </li>
                `;
            }).join('')
            : `<li>
                <p>There are no games available for today.</p>
            </li>`
        }
    </ul>
    <footer>
      <p><small>Disclaimer: NHL and the NHL Shield are registered trademarks of the National Hockey League. NHL and NHL team marks are the property of the NHL and its teams. &copy; NHL 2023. All Rights Reserved.</small></p>
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
