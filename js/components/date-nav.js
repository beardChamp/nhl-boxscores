
const styles = new CSSStyleSheet()
styles.replaceSync(`
    .date-nav ul {
        display: flex;
        flex-wrap: wrap;
        padding: 0;
    }
    .date-nav li {
        flex: 1 1 25%;
        list-style-type: none;
        margin: 1rem 1.5rem 0.5rem;
        padding: 0 1rem;
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
`)

export class DateNav extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
        this.baseUrl = 'https://statsapi.web.nhl.com/api/v1/schedule';
        this.season = '';
        this.seasonMax = '';
        this.seasonMin = '';
        this.todayDate = '';
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
    }

    static get observedAttributes() {
        return ['todayDate'];
    }

    async connectedCallback() {
        this.shadowRoot.adoptedStyleSheets = [styles]
        await this.setScheduleBounds(this.seasons[0]);
        this.todayDate = this.getAttribute("todayDate");
        this.today = this.todayDate !== '' ? dayjs(this.todayDate) : new dayjs()
        
        await this.updateDateData(this.today);
        await this.render();
        this.postRender();
    }

    async setScheduleBounds(seasonString) {
        const seasonResponse = await fetch(`${this.baseUrl}?season=${seasonString}`);
        const seasonJson = await seasonResponse.json();
        this.season = seasonString;
        this.seasonMin = seasonJson.dates[0].date;
        this.seasonMax = seasonJson.dates.at(-1).date;
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

    async dateResponse(event) {
        event.preventDefault();
        if (event.target.nodeName === 'A') {
            const dateURL = event.composedPath()[0].getAttribute('href');
            const dateFromUrl =  dateURL.split('/').at(-1).split('=').at(-1);
            this.updateDateData(dayjs(dateFromUrl));
            // await this.render();
            // await this.postRender();
            this.dispatchEvent(new CustomEvent("dateUpdated",{
                detail: dayjs(dateFromUrl)
              }));
        }
      }

    async render() {
        this.shadowRoot.innerHTML = `
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
        `
    }

    postRender() {
        const dateNav = this.shadowRoot.querySelectorAll('.date-nav li a');
        dateNav.forEach((navItem) => 
            navItem.addEventListener('click', (event) => {
                this.dateResponse(event);
            })
        );
    }
}

window.customElements.define('date-nav', DateNav);
