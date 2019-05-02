import './org-chart-item.js';

const template = document.createElement('template');
template.innerHTML = `
    <style>
        :host {
            display: block;
            font-family: sans-serif;
            text-align: center;
        }
        .org-chart {
          padding: 0;
          width: 1200px;
          height: 1200px;
          margin: 0 auto;
          display: flex;
          flex-flow: row;
          justify-content: center;
          position: relative;
          overflow: scroll;
          background: #fff;
        }
    </style>
    <h1>Org Chart</h1>
    <br>
    <div class="org-chart"></div>
`;


class OrgChart extends HTMLElement {
  constructor() {
    super();
    this._shadowRoot = this.attachShadow({
      'mode': 'open'
    });
    this._shadowRoot.appendChild(template.content.cloneNode(true));
    this.$orgChart = this._shadowRoot.querySelector('.org-chart');
  }

  _iterate(current) {
    var oThis = this;
    var reportees = current.reportees;

    if (reportees.length === 0) return 1;

    reportees.forEach(function(reportee) {
      reportee.manager = current;
      var totalReportees = oThis._iterate(reportee);
      current.totalReportees = (current.totalReportees) ? current.totalReportees : 0;
      current.totalReportees += totalReportees;
    });
    console.log(current.totalReportees)
    return current.totalReportees;
  }

  _render(data, dom) {
    let $orgChartItem = document.createElement('org-chart-item');
    $orgChartItem.setAttribute('parent', (data.manager) ? data.manager.team : null);
    $orgChartItem.setAttribute('team', data.team);
    $orgChartItem.setAttribute('name', data.name);
    $orgChartItem.setAttribute('designation', data.designation);
    $orgChartItem.setAttribute('directreportees', data.reportees.length);
    $orgChartItem.setAttribute('totalreportees', isNaN(data.totalReportees) ? 0 : data.totalReportees);
    $orgChartItem.$reportees = data;
    $orgChartItem.addEventListener('onToggle', this._toggleCard.bind(this));
    dom.appendChild($orgChartItem);
  }

  _toggleCard(e) {
    var dom = e["path"][0];
    var parent = e["path"][1];
    var orgChartItem = dom._shadowRoot.querySelector(".org-chart-item");

    parent.querySelectorAll("org-chart-item").forEach(child => {
      if (child.$team.innerHTML !== dom.$team.innerHTML) {
        child.$items.innerHTML = '';
        console.log(child)
        var orgChartItem = child._shadowRoot.querySelector(".org-chart-item");
        orgChartItem.classList.remove("expanded");
      }
    });

    dom.$items.innerHTML = '';
    if (!orgChartItem.classList.contains("expanded")) {
      var detail = e["detail"];
      var reportees = e["detail"].reportees;
      reportees.forEach((item, index) => {
        this._render(item, dom.$items);
      });
    }
    orgChartItem.classList.toggle('expanded')
  }

  set data(value) {
    this._data = value;
    if (this._data.length > 0) {
      this._iterate(this._data[0]);
      this._render(this._data[0], this.$orgChart);
    }
  }

  get data() {
    return this._data;
  }
}

window.customElements.define('org-chart', OrgChart);
