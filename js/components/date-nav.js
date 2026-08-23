
const styles = new CSSStyleSheet()
styles.replaceSync(`    
    nav {
        margin-left: 2.3rem;
    }
    
    h2 {
        font-size: 1.25rem;
        font-weight: normal;
        margin-top: 2rem;
    }
`)

export class DateNav extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
        this.baseUrl = 'http://localhost:8080/https://api-web.nhle.com/v1/schedule';
        this.season = '';
        this.seasonMax = '';
        this.seasonMin = '';
        this.todayDate = '';
        this.today = '';
        this.tomorrow = '';
        this.totalGames = 0;
        this.yesterday = '';
        this.seasons = [
            20262027,
            20252026,
            20242025,
            20232024,
            20222023,
            20212022,
            20202021,
            20192020,
            20182019
        ];
    }

    static get observedAttributes() {
        return ['todayDate'];
    }

    async connectedCallback() {
        this.shadowRoot.adoptedStyleSheets = [styles];
        this.todayDate = this.getAttribute("todayDate");
        this.today = this.todayDate !== '{}' ? Temporal.PlainDate.from(this.todayDate) : Temporal.Now.plainDateISO();
        await this.updateDateData(this.today);
        await this.render();
        this.postRender();
    }

    async updateDateData(dateObject) {
        const updatedYesterday = dateObject.subtract({days: 1});
        const updatedTomorrow = dateObject.add({days: 1});
        this.today = dateObject;
        this.todayDisplay = dateObject.toString();
        this.yesterday = updatedYesterday;
        this.tomorrow = updatedTomorrow;
    }

    async dateResponse(event) {
        this.dispatchEvent(new CustomEvent("dateUpdated" , {
            detail: event.target.value
        }))
        window.history.pushState( event.target.value, `date_${event.target.value}`, `?date=${event.target.value}` );
    }

    async dateNavigation(event) {
        this.dispatchEvent(new CustomEvent("dateUpdated" , {
            detail: event.target.value
        }))
        window.history.pushState( event.target.value, `date_${event.target.value}`, `?date=${event.target.value}` );
    }

    async render() {
        this.shadowRoot.innerHTML = `
        <nav>
            <h2>Games on YYYY-MM-DD</h2>
        </nav>
        `
    }

    postRender() {
        this.shadowRoot.innerHTML = `
        <nav>
            <label for="gameDay">
                <span>Date Select:
                <input
                    type="date"
                    id="gameDay"
                    name="gameDayStart"
                    value="${this.todayDisplay.toString()}" />
            </label>
            <h2>Games on ${this.todayDisplay.toString()}</h2>

        </nav>
        `
        const dateNav = this.shadowRoot.querySelector('#gameDay');
        dateNav.addEventListener('change', (event) => this.dateResponse(event));
    }
}

window.customElements.define('date-nav', DateNav);
