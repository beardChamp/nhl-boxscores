// import {LitElement, html, css} from 'lit-element';

export class ScoreBlock extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this.games = {};
    this.copyright = '';
    console.log('score-block: constructor');
  }

  async connectedCallback() {
    console.log('score-block: connectedCallback');
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
          return `
            <li>
              
            </li>
          `;
        }).join("")}
      </ul>

      <h2>Games</h2><p>Disclaimer: ${this.copyright}</p>`
    }
  }
}

window.customElements.define('score-block', ScoreBlock)