import './game-block.js';

export class ScoreBase extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this.totalGames = 0;
    this.games = {};
    this.copyright = '';
  }

  async connectedCallback() {
    const response = await fetch('https://statsapi.web.nhl.com/api/v1/schedule');
    // console.log('resposne = ', response);
    let json = await response.json();

    // if (json.totalGames === 0) {
      // ALT RESPONSE for DEBBUGGING/BUILDING
      // const altResponse = await fetch('../response-examples/api-v1-schedule.json');
      // console.log('altResponse', altResponse);
      // json = await altResponse.json();
    // }
    // console.log('json', json);
    this.copyright = await json.copyright;
    this.games = await json.dates[0];
    this.totalGames = await json.totalGames;
    this.render();
  }

  attributeChangedCallback(attrName, oldVal, newVal) {
    this.render();
  }

  renderData() {
    this.shadowRoot.innerHTML = `
    <style>
      ul {
          display: flex;
          flex-wrap: wrap;
          padding: 0;
      }
      li {
          flex: 1 1 auto;
          list-style-type: none;
          margin: 1rem 1.5rem 0.5rem;
          padding: 0 1rem;
      }
      footer {
        padding: 0 2.5rem;
      }
    </style>
    
    <ul>
      ${this.games.games.map((game) => {
        const awayRecord = game.teams.away.leagueRecord;
        const homeRecord = game.teams.home.leagueRecord
        return `
          <li>
            <game-block feed="${game.link}" away-record="(${awayRecord.wins !== undefined ? awayRecord.wins : '0'}-${awayRecord.losses !== undefined ? awayRecord.losses : '0'}-${awayRecord.ot ? awayRecord.ot : '0'})" home-record="(${homeRecord.wins !== undefined ? homeRecord.wins : '0'}-${homeRecord.losses !== undefined ? homeRecord.losses : '0'}-${homeRecord.ot !== undefined ? homeRecord.ot : '0'})"></game-block>
          </li>
        `;
      }).join("")}
    </ul>

    <footer>
      <p><small>Disclaimer: ${this.copyright}</small></p>
    </footer>`
  }

  renderEmpty() {
    // TODO: should this be rendered as a game-block, or similarly, to maintain consistency?
    this.shadowRoot.innerHTML = `
        <footer>
            <p>There are no games available for today.</p>
            <p><small>Disclaimer: ${this.copyright}</small></p>
        </footer>
      `
  }

  render() {
    if (this.loading) {
      this.shadowRoot.innerHTML = `Loading...`;
    } else if (this.totalGames > 0) {
      this.renderData();
    } else {
      this.renderEmpty();
    }
  }
}

window.customElements.define('score-base', ScoreBase);
