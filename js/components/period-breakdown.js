export class PeriodBreakdown extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
        this.periods = '';
        this.team = '';
    }

    static get observedAttributes() {
        return ['feed'];
    }

    async connectedCallback() {
        this.periods = this.getAttribute('periods') !=='' ? JSON.parse(this.getAttribute('periods')) : [{}];
        this.team = this.getAttribute('team');
        this.render();
    }

    attributeChangedCallback(attrName, oldVal, newVal) {
        this.render();
    }

    render() {
        const periodsListing = this.periods.map((period) => {
            return period[this.team]
        });
        this.shadowRoot.innerHTML = `
            <style>
                ul, li { 
                    list-style-type: none;
                    margin: 0;
                    padding: 0;
                }
                ul {
                    display: flex;
                }
                li {
                    color: #666;
                    font-size: 0.9rem;
                    padding: 0 7px;
                }
            </style>
            <ul class="periods">
                ${periodsListing.map((period)=> {
                        return `
                            <li>${period.goals}</li>
                        `
                    }).join('')
                }
            </ul>
        `
    }
}

window.customElements.define('period-breakdown', PeriodBreakdown);
