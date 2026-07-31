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
    this.date = window.location.search && window.location.search.includes('date') ? Temporal.PlainDate.from(window.location.search.split('=')[1]) : Temporal.Now.plainDateISO();
  }

  async connectedCallback() { 
    await this.fetchStandings();
    await this.updateScheduleData(this.date);
    this.shadowRoot.adoptedStyleSheets = [styles];
  }

  async fetchStandings(dateObject) {
    dateObject = dateObject ? dateObject : this.date;
    const response = await fetch(`http://localhost:8080/https://api-web.nhle.com/v1/standings/${dateObject.toString()}`);
    const json = await response.json();
    this.standings = await json.standings;
  }

  async updateGameData(dateObject) {
    const response = await fetch(`${this.baseUrl}/${dateObject}`);
    const json = await response.json();
    this.games = await json.gameWeek.find((day) => {const temporalDate = Temporal.PlainDate.from(day.date); return Temporal.PlainDate.compare(day.date, dateObject)});
    this.totalGames = this.games.games.length;
    this.today = dateObject;
    this.nextStartDate = json.nextStartDate;
    this.previousStartDate = json.previousStartDate;
  }

  buildTeamRecord(abbr, seriesStatus) {
    // handle regular season standings
    if (this.standings.length > 0) {
      const teamObject = this.standings.filter((team) => team.teamAbbrev.default === abbr);
      return `(${teamObject[0].wins}-${teamObject[0].losses}-${teamObject[0].otLosses})`
    }
    // handle playoff series standings
    else if (this.standings.length === 0 && seriesStatus !== undefined) {
      const isTopSeed = seriesStatus.topSeedTeamAbbrev === abbr;
      const seedWins = isTopSeed ? seriesStatus.topSeedWins : seriesStatus.bottomSeedWins;
      return `${seriesStatus.seriesTitle}, Game ${seriesStatus.gameNumberOfSeries}: ${seedWins}`;
    } 
    // handle empty standings
    else {
      return `0-0-0`
    }
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
    <date-nav todayDate=${JSON.stringify(this.today)} nextStartDate=${this.nextStartDate} previousStartDate=${this.previousStartDate}></date-nav>
    <ul>
      ${ this.totalGames > 0
            ? this.games.games.map((game) => {
                return `
                <li>
                    <game-block feed="${game.id}" homeRecord="${this.buildTeamRecord(game.homeTeam.abbrev, game.seriesStatus)}" awayRecord="${this.buildTeamRecord(game.awayTeam.abbrev, game.seriesStatus)}"></game-block>
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
        this.updateScheduleData(Temporal.PlainDate.from(e.detail));
    });
  }
}

window.customElements.define('score-base', ScoreBase);