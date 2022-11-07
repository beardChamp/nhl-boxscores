import './game-block.js';

export class ScoreBase extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this.baseUrl = 'https://statsapi.web.nhl.com/api/v1/schedule';
    this.copyright = '';
    this.games = {};
    this.season = '';
    this.seasonMax = '';
    this.seasonMin = '';
    this.today = '';
    this.tomorrow = '';
    this.totalGames = 0;
    this.yesterday = '';
    this.seasons = [
        20222023,
        20212022,
        20202021,
        20192020,
        20182019
    ];
    this.site = `<style>
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

    .date-nav li {
      margin: 0;
      padding: 0;
    }
    .date-nav a {
      color: black;
      text-decoration: none;
    }
    .date_nav a:hover {
      text-decoration: underline;
    }
    .previous {
      text-align: right;
    }
    .current {
      text-align: center;
    }
    .today {
      font-family: 'FigtreeBold',sans-serif;
    }
    .next {
      text-align: left;
    }
    footer {
      padding: 0 2.5rem;
    }
  </style>`
  }

  async connectedCallback() {
    await this.setScheduleBounds(this.seasons[0]);
    this.updateScheduleData(new dayjs());

    this.shadowRoot.addEventListener('click', (event) => {
        this.dateResponse(event);
    });
  }

  async updateGameData(dateObject) {
    const response = await fetch(`${this.baseUrl}?date=${dateObject.format('YYYY-MM-DD')}`);
    const json = await response.json();
    this.copyright = await json.copyright;
    this.games = await json.dates[0];
    this.totalGames = await json.totalGames;
  }

  async updateDateData(dateObject) {
    this.todayDisplay = dateObject.format('YYYY-MM-DD');
    const updatedYesterday = dateObject.subtract(1, 'day').format('YYYY-MM-DD');
    const updatedTomorrow = dateObject.add(1, 'day').format('YYYY-MM-DD');
    if(dateObject.isBetween(this.seasonMin, this.seasonMax)) {
        this.today = dateObject;
        this.yesterday = updatedYesterday;
        this.tomorrow = updatedTomorrow;
    }
  }

  async setScheduleBounds(seasonString) {
    const seasonResponse = await fetch(`${this.baseUrl}?season=${seasonString}`);
    const seasonJson = await seasonResponse.json();
    this.season = seasonString;
    this.seasonMin = seasonJson.dates[0].date;
    this.seasonMax = seasonJson.dates.at(-1).date;
  }

  async updateScheduleData(dateObject) {
    await this.updateGameData(dateObject);
    await this.updateDateData(dateObject);
    this.render();
  }

  attributeChangedCallback(attrName, oldVal, newVal) {
    this.render();
  }

  async dateResponse(event) {
    event.preventDefault();
    if (event.target.nodeName === 'A') {
        const dateURL = event.composedPath()[0].getAttribute('href');
        const dateFromUrl =  dateURL.split('/').at(-1).split('=').at(-1);
        this.updateScheduleData(dayjs(dateFromUrl));
    }
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
          flex: 1 1 25%;
          list-style-type: none;
          margin: 1rem 1.5rem 0.5rem;
          padding: 0 1rem;
      }

      .date-nav li {
        margin: 0;
        padding: 0;
      }
      .date-nav a {
        color: black;
        text-decoration: none;
      }
      .date_nav a:hover {
        text-decoration: underline;
      }
      .previous {
        text-align: right;
      }
      .current {
        text-align: center;
      }
      .today {
        font-family: 'FigtreeBold',sans-serif;
      }
      .next {
        text-align: left;
      }
      footer {
        padding: 0 2.5rem;
      }
    </style>
    <nav class="date-nav">
      <ul>
        <li class="previous ${this.yesterday === new dayjs().format('YYYY-MM-DD') ? 'today' : ''}">
            <a href="${this.baseUrl}?date=${this.yesterday}">&laquo; ${this.yesterday}</a>
        </li>
        <li class="current ${this.todayDisplay === new dayjs().format('YYYY-MM-DD') ? 'today' : ''}">
            <a href="${this.baseUrl}?date=${this.todayDisplay}">Current: ${this.todayDisplay}</a>
        </li>
        <li class="next ${this.tomorrow === new dayjs().format('YYYY-MM-DD') ? 'today' : ''}">
            <a href="${this.baseUrl}?date=${this.tomorrow}">${this.tomorrow} &raquo;</a>
        </li>
      </ul>
    </nav>
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
            }).join("")
            : `<li>
                <p>There are no games available for today.</p>
            </li>`
        }
    </ul>
    <footer>
      <p><small>Disclaimer: ${this.copyright}</small></p>
    </footer>`;
  }

  async render() {
    if (this.loading) {
      this.shadowRoot.innerHTML = `Loading...`;
    } else {
      this.renderData();
    }
  }
}

window.customElements.define('score-base', ScoreBase);
