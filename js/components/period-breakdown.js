const styles = new CSSStyleSheet()
styles.replaceSync(`
    ul, li { 
        list-style-type: none;
        margin: 0;
        padding: 0;
    }
    ul {
        align-content: flex-start;
        display: flex;
        gap: 0.25rem;
        justify-content: flex-start;
        text-align: left;
    }
    li {
        color: #666;
        flex: 1 0 30%;
        text-align: center;
    }
`)

export class PeriodBreakdown extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
        this.periods = '';
        this.team = '';
    }

    static get observedAttributes() {
        return ['periods'];
    }

    async connectedCallback() {
        this.shadowRoot.adoptedStyleSheets = [styles]
        const periods = this.getAttribute('periods');
        this.periods = typeof periods === 'string' ? JSON.parse(periods) : periods;
        this.render();
    }

    attributeChangedCallback(attrName, oldVal, newVal) {
        this.render();
    }

    render() {
        if (this.periods) {
            this.shadowRoot.innerHTML = `
                <ul class="periods">
                    ${this.periods.map((period)=> {
                            return `
                                <li>
                                    ${period}
                                </li>
                            `
                        }).join('')
                    }
                </ul>
            `
        }
        
    }
}

window.customElements.define('period-breakdown', PeriodBreakdown);
