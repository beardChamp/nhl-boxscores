
const styles = new CSSStyleSheet()
styles.replaceSync(`
    .date-nav ul {
        display: flex;
        flex-wrap: wrap;
        padding: 0;
    }
    .date-nav li {
        flex: 1 1 15%;
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
    .previous, .next-game {
        text-align: right;
    }
    .current {
        text-align: center;
    }
    .current h2 {
        font-size: 1rem;
        font-weight: normal;
        margin: 0;
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
        this.baseUrl = 'https://api-web.nhle.com/v1/schedule';
        this.nextStartDate = '';
        this.previousStartDate = '';
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
        return ['todayDate', 'nextStartDate', 'previousStartDate'];
    }

    async connectedCallback() {
        this.shadowRoot.adoptedStyleSheets = [styles]
        // await this.setScheduleBounds(this.seasons[0]);
        this.todayDate = this.getAttribute("todayDate");
        this.today = this.todayDate !== '' ? dayjs(this.todayDate) : new dayjs();
        this.nextStartDate = this.getAttribute("nextStartDate");
        this.previousStartDate = this.getAttribute("previousStartDate");
        
        await this.updateDateData(this.today);
        await this.render();
        this.postRender();
    }

    // async setScheduleBounds(seasonString) {
    //     const seasonResponse = await fetch(`${this.baseUrl}?season=${seasonString}`);
    //     const seasonJson = await seasonResponse.json();
    //     this.season = seasonString;
    //     this.seasonMin = seasonJson.dates[0].date;
    //     this.seasonMax = seasonJson.dates.at(-1).date;
    //     console.log('season, min, max', this.season, this.seasonMin, this.seasonMax);
    // }

    async updateDateData(dateObject) {
        this.todayDisplay = dateObject.format('YYYY-MM-DD');
        const updatedYesterday = dateObject.subtract(1, 'day').format('YYYY-MM-DD');
        const updatedTomorrow = dateObject.add(1, 'day').format('YYYY-MM-DD');
        // if(dateObject.isBetween(this.seasonMin, this.seasonMax)) {
            this.today = dateObject;
            this.yesterday = updatedYesterday;
            this.tomorrow = updatedTomorrow;
        // }
    }

    async dateResponse(event) {
        event.preventDefault();
        if (event.target.nodeName === 'A') {
            const dateURL = event.composedPath()[0].getAttribute('href');
            const dateFromUrl = dateURL.split('/').at(-1).split('=').at(-1);
            this.updateDateData(dayjs(dateFromUrl));
            this.dispatchEvent(new CustomEvent("dateUpdated",{
                detail: dayjs(dateFromUrl)
              }));
        }
      }
    
    goToNearestComingDate() {
        // jump to nearest future game date
    }

    async render() {
        this.shadowRoot.innerHTML = `
        <nav class="date-nav">
            <ul>
                <li class="last-game">
                    <a href="${this.baseUrl}/${this.previousStartDate}">Previous Game</a>
                </li>
                <li class="previous ${this.yesterday === new dayjs().format('YYYY-MM-DD') ? 'today' : ''}">
                    &laquo; Yesterday</a>
                </li>
                <li class="current ${this.todayDisplay === new dayjs().format('YYYY-MM-DD') ? 'today' : ''}">
                    Current</li>
                <li class="next ${this.tomorrow === new dayjs().format('YYYY-MM-DD') ? 'today' : ''}">
                    Tomorrow &raquo;
                </li>
                <li class="next-game">
                    <a href="${this.baseUrl}/${this.nextStartDate}">Next Game</a>
                <li>
            </ul>
        </nav>
        `
    }

    postRender() {
        this.shadowRoot.innerHTML = `
        <nav class="date-nav">
            <ul>
                <li class="last-game">
                    <a href="${this.baseUrl}/${this.previousStartDate}">Previous Game</a>
                </li>
                <li class="previous ${this.yesterday === new dayjs().format('YYYY-MM-DD') ? 'today' : ''}">
                    <a href="${this.baseUrl}/${this.yesterday}">&laquo; ${this.yesterday}</a>
                </li>
                <li class="current ${this.todayDisplay === new dayjs().format('YYYY-MM-DD') ? 'today' : ''}">
                    <a href="${this.baseUrl}/=${this.todayDisplay}"><h2>Current: ${this.todayDisplay}</h2></a>
                </li>
                <li class="next ${this.tomorrow === new dayjs().format('YYYY-MM-DD') ? 'today' : ''}">
                    <a href="${this.baseUrl}/=${this.tomorrow}">${this.tomorrow} &raquo;</a>
                </li>
                <li class="next-game">
                    <a href="${this.baseUrl}/${this.nextStartDate}">Next Game</a>
                <li>
            </ul>
        </nav>
        `
        const dateNav = this.shadowRoot.querySelectorAll('.date-nav li a');
        dateNav.forEach((navItem) => 
            navItem.addEventListener('click', (event) => {
                this.dateResponse(event);
            })
        );
    }
}

window.customElements.define('date-nav', DateNav);
