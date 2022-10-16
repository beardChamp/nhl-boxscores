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
          flex: 0 0 auto;
          list-style-type: none;
          margin: 20px 10px;
          padding: 10px;
      }
    </style>
    
    <ul>
      ${this.games.games.map((game) => {
        const awayRecord = game.teams.away.leagueRecord;
        const homeRecord = game.teams.home.leagueRecord
        return `
          <li>
            <game-block feed="${game.link}" away-record="(${awayRecord.wins !== undefined ? awayRecord.wins : ''}-${awayRecord.losses !== undefined ? awayRecord.losses : ''}${awayRecord.ot ? - awayRecord.ot : ''})" home-record="(${homeRecord.wins !== undefined ? homeRecord.wins : ''}-${homeRecord.losses !== undefined ? homeRecord.losses : ''}${homeRecord.ot !== undefined ? - homeRecord.ot : ''})"></game-block>
          </li>
        `;
      }).join("")}
    </ul>

    <p>Disclaimer: <small>${this.copyright}</small></p>`
  }

  renderEmpty() {
    // TODO: should this be rendered as a game-block, or similarly, to maintain consistency?
    this.shadowRoot.innerHTML = `
        <p>There are no games available for today.</p>
        <p>Disclaimer: <small>${this.copyright}</small></p>
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
