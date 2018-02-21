/// <reference path="../interfaces/iGridCssStyleDeclaration.ts" />

class GridLayout extends HTMLElement {

  public state: any;
  private childObserver: any;
  private readonly gridAttributes = {
    gridColumnStart: 'data-grid-column-start',
    gridColumnEnd: 'data-grid-column-end',
    gridRowStart: 'data-grid-row-start',
    gridRowEnd: 'data-grid-row-end'
  };
  public support: boolean;

  constructor() {
    super();

    // Init state
    this.state = {};

    // TODO: Check for implemented version msGrid
    this.support = this._detectGridSupport();
  }

  connectedCallback() {

    this._getState();
    this._setStyles();

    this._setObserver();

  }
  disconnectedCallback() {
    if (this.childObserver) this.childObserver.disconnect();
  }

  private _detectGridSupport(): boolean {
    const el = document.createElement('div');
    return typeof el.style.grid === 'string';

    // Test for legacy support (IE & early Edge)
    // typeof el.style.msGridColumn === 'string';
  }

  private _attributeValidation(name: string, value: any): any {
    switch (name) {
      case 'columns':
      case 'rows':
        return (/^\d+$/g.test(value)) ? 'repeat(' + value + ', 1fr)' : value;
      case 'auto-flow':
        return (/^((row|column) ?)?(dense)?$/.test(value)) ? value : 'row';
      default: return value;
    }
  }

  private _getState(attribute?: string, value?: any): void {

    // When attribute is set, only update specific entry in state
    if (attribute) {

      this.state[attribute] = this._attributeValidation(attribute, value);
      return;
    }

    // Recalculate whole state
    GridLayout.observedAttributes.map((attribute) => {
      this.state[attribute] = this._attributeValidation(attribute, this.getAttribute(attribute));
    });
  }

  private _setStyles() {

    // Set style to grid
    this.style.display = (this.hasAttribute('inline')) ? 'inline-grid' : 'grid';

    // TODO: when columns or rows are simple Ints then expand to fraction units
    if (this.state.columns) this.style.gridTemplateColumns = this.state.columns;
    if (this.state.rows) this.style.gridTemplateRows = this.state.rows;

    if (this.state["auto-columns"]) this.style.gridAutoColumns = this.state["auto-columns"];
    if (this.state["auto-rows"]) this.style.gridAutoRows = this.state["auto-rows"];

    if (this.state['gap']) {
      this.style.gridGap = this.state['gap'];
    } else {
      if (this.state["row-gap"]) this.style.gridRowGap = this.state["row-gap"];
      if (this.state["column-gap"]) this.style.gridColumnGap = this.state["column-gap"];
    }

    if (this.state["auto-flow"]) this.style.gridAutoFlow = this.state["auto-flow"];

  }

  /**
   * Defines a MutationObserver to watch direct children for attribute changes
   * 
   * Transforms data-grid-* attributes into styles
   * 
   * @private
   * @memberof GridLayout
   */
  private _setObserver() {

    this.childObserver = new MutationObserver((mutations: MutationRecord[]) => {

      var mutatedNodes: Node[] = [];

      // Check mutations for grid operations
      mutations.forEach((mutation: MutationRecord) => {

        // grid-Attributes of child has been altered
        if (mutation.type === 'attributes' && mutation.target.parentNode === this
          //@ts-ignore
          // && !mutatedNodes.includes(mutation.target)
        ) {
          mutatedNodes.push(mutation.target);
        }

      });

      // Loop through mutated nodes
      mutatedNodes.forEach(node => {
        this._setChildAttributes(node);
      });

    });

    const observerConfig: MutationObserverInit = {
      attributes: true,
      childList: true,
      // IE 11 does not support "Object.values(this.gridAttributes)"
      //@ts-ignore
      attributeFilter: Object.keys(this.gridAttributes).map(key => this.gridAttributes[key]),
      subtree: true,
      attributeOldValue: false
    }

    // Initial processing
    // Check what children have data-grid-* attributes
    const propertyNames = Object.keys(this.gridAttributes);
    Array.from(this.children).filter((child) => {
      const datasetNames = Object.keys((<HTMLElement>child).dataset);
      return (propertyNames.filter(x => datasetNames.indexOf(x) > -1).length > 0);
    }).forEach((element) => { this._setChildAttributes(element) })

    // Start observing changes
    this.childObserver.observe(this, observerConfig)

  }

  private _setChildAttributes(node: Node) {
    if (!node) return;
    const data = (<HTMLElement>node).dataset;

    Object.keys(this.gridAttributes).forEach((attribute: string) => {
      //@ts-ignore
      (<HTMLElement>node).style[attribute] = data[attribute] || '';
    });
  }

  static get observedAttributes() {
    return ['inline', 'columns', 'rows', 'auto-rows', 'auto-columns', 'gap', 'column-gap', 'row-gap', 'auto-flow'];
  }

  attributeChangedCallback(attrName: string, oldVal: string, newVal: string) {
    this._getState(attrName, newVal);
    this._setStyles();
  }

}

window.customElements.define('grid-layout', GridLayout);