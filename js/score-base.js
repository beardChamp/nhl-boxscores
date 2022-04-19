import './game-block.js'

export class ScoreBase extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this.games = {};
    this.copyright = '';
  }

  async connectedCallback() {
    const response = await fetch('https://statsapi.web.nhl.com/api/v1/schedule');
    const json = await response.json();
    this.games = await json.dates[0];
    this.copyright = await json.copyright;
    this.render();
  }

  attributeChangedCallback(attrName, oldVal, newVal) {
    this.render();
  }

  render() {
    if (this.loading) {
      this.shadowRoot.innerHTML = `Loading...`;
    } else {
      console.log('render: this.games = ', this.games);
      this.shadowRoot.innerHTML = `
      <ul>
        ${this.games.games.map((game) => {
          console.log('game.link', game.link, typeof game.link);
          return `
            <li>
              <game-block feed="${game.link}"></game-block>
            </li>
          `;
        }).join("")}
      </ul>

      <p>Disclaimer: <small>${this.copyright}</small></p>`
    }
  }
}

window.customElements.define('score-base', ScoreBase)