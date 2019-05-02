const template = document.createElement('template');
template.innerHTML = `
    <style>
        :host {
            display: block;
            font-family: sans-serif;
        }

        .org-chart-item {
            /* overflow: hidden; */
        }

        .org-chart-item.first:before {
            content: '';
            position: absolute;
            top: -11px;
            width: 202px;
            height: 12px;
            background: #fff;
            border-radius: 10px;
        }

        .org-chart-item.last:before {
            content: '';
            position: absolute;
            top: -11px;
            width: 100%;
            height: 12px;
            background: #fff;
            border-radius: 10px;
        }

        .org-chart-card {
          width: 200px;
          background: #fff;
          border-radius: 4px;
          box-shadow: 0 0 3px 1px #8a8787;
          position: relative;
        }

        .org-chart-card:before {
          content: '';
          position: absolute;
          height: 30px;
          width: 2px;
          top: -30px;
          background: #f5f5f5;
        }

        .org-chart-item.expanded .org-chart-card:after {
          content: '';
          position: absolute;
          height: 30px;
          width: 2px;
          bottom: -30px;
          background: #f5f5f5;
        }

        .org-chart-card-header {
          background: #fff;
          height: 40px;
          line-height: 40px;
          border-radius: 4px 4px 0 0;
          border-bottom: 1px solid #ececec;
        }

        .org-chart-item.expanded .org-chart-card-header {
          background: #1b8b89;
        }

        .org-chart-card-header h1 {
          font-size: 1.3rem;
          font-weight: normal;
          color: #1b8b89;
          margin: 0;
        }

        .org-chart-item.expanded .org-chart-card-header h1 {
          color: #fff;
        }

        .org-chart-card-user {
          padding: 20px 0;
        }

        .org-chart-card-user h1 {
          margin: 0;
          font-size: 1.3rem;
          line-height: 30px;
          height: 30px;
          font-weight: normal;
        }

        .org-chart-card-user h2 {
          font-size: .9rem;
          margin: 0;
          color: #adadad;
          font-weight: normal;
        }

        .org-chart-card-footer {
          height: 30px;
          border-top: 1px solid #ececec;
          padding: 0 10px;
        }

        .org-chart-card-footer span {
          color: #086eaf;
          display: block;
          font-weight: bold;
          height: 30px;
          line-height: 30px;
        }

        .org-chart-card-footer .directreportees {
          float: left;
        }

        .org-chart-card-footer .totalreportees {
          float: right;
        }

        .org-chart-item.expanded .org-chart-item-items {
          display: none;
        }

        .org-chart-item.expanded .org-chart-item-items {
          position: absolute;
          left: 0;
          width: 1200px;
          display: flex;
          flex-flow: row;
          justify-content: space-evenly;
          margin-top: 30px;
          padding-top: 30px;
          border-top: 2px solid #f5f5f5;
        }
    </style>
    <div class="org-chart-item">
        <div class="org-chart-card">
          <div class="org-chart-card-header">
            <h1></h1>
          </div>
          <div class="org-chart-card-user">
            <h1></h1>
            <h2></h2>
          </div>
          <div class="org-chart-card-footer">
            <span class="directreportees"></span>
            <span class="totalreportees"></span>
          </div>
        </div>
        <div class="org-chart-item-items">
        </div>
    </div>
`;

class OrgChartItem extends HTMLElement {
  constructor() {
    super();

    this._shadowRoot = this.attachShadow({
      'mode': 'open'
    });

    this._shadowRoot.appendChild(template.content.cloneNode(true));
    this.$item = this._shadowRoot.querySelector('.org-chart-item');

    this.$team = this._shadowRoot.querySelector(".org-chart-card-header h1");
    this.$name = this._shadowRoot.querySelector(".org-chart-card-user h1");
    this.$designation = this._shadowRoot.querySelector(".org-chart-card-user h2");

    this.$directreportees = this._shadowRoot.querySelector(".org-chart-card-footer .directreportees");
    this.$totalreportees = this._shadowRoot.querySelector(".org-chart-card-footer .totalreportees");

    this.$items = this._shadowRoot.querySelector('.org-chart-item-items');

    this.$reportees = [];

    this.$team.addEventListener('click', (e) => {
      this.dispatchEvent(new CustomEvent('onToggle', {
        detail: this.$reportees
      }));
    });

  }

  connectedCallback() {
    if (!this.hasAttribute('parent')) {
      this.setAttribute('parent', 'parent');
    }
    if (!this.hasAttribute('team')) {
      this.setAttribute('team', 'Team');
    }
    if (!this.hasAttribute('name')) {
      this.setAttribute('name', 'Name');
    }
    if (!this.hasAttribute('designation')) {
      this.setAttribute('designation', 'Designation');
    }
    if (!this.hasAttribute('directreportees')) {
      this.setAttribute('directreportees', '0');
    }
    if (!this.hasAttribute('totalreportees')) {
      this.setAttribute('totalreportees', '0');
    }
    this._render();
  }

  static get observedAttributes() {
    return ['parent', 'team', 'name', 'designation', 'directreportees', 'totalreportees'];
  }

  attributeChangedCallback(name, oldValue, newValue) {
    switch (name) {
      case 'parent':
        this._parent = newValue;
        break;
      case 'team':
        this._team = newValue;
        break;
      case 'name':
        this._name = newValue;
        break;
      case 'designation':
        this._designation = newValue;
        break;
      case 'directreportees':
        this._directreportees = parseInt(newValue);
        break;
      case 'totalreportees':
        this._totalreportees = parseInt(newValue);
        break;
    }
  }

  set parent(val) {
    this.setAttribute('parent', val);
  }

  get parent() {
    return this._parent;
  }

  set team(val) {
    this.setAttribute('team', val);
  }

  get team() {
    return this._team;
  }

  set name(val) {
    this.setAttribute('name', val);
  }

  get name() {
    return this._name;
  }

  set designation(val) {
    this.setAttribute('designation', val);
  }

  get designation() {
    return this._designation;
  }

  set directReportees(val) {
    val = isNaN(parseInt(val)) ? 0 : parseInt(val);
    this.setAttribute('directreportees', val);
  }

  get directReportees() {
    return this._directreportees;
  }

  set totalreportees(val) {
    val = isNaN(parseInt(val)) ? 0 : parseInt(val);
    this.setAttribute('totalreportees', val);
  }

  get totalreportees() {
    return this._totalreportees;
  }

  _render() {
    this.$team.innerHTML = this._team;
    this.$name.innerHTML = this._name;
    this.$designation.innerHTML = this._designation;
    this.$directreportees.innerHTML = this._directreportees;
    this.$totalreportees.innerHTML = this._totalreportees;
  }

}
window.customElements.define('org-chart-item', OrgChartItem);
