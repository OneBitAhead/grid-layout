"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var GridLayout = (function (_super) {
    __extends(GridLayout, _super);
    function GridLayout() {
        var _this = _super.call(this) || this;
        _this.gridAttributes = {
            gridColumnStart: 'data-grid-column-start',
            gridColumnEnd: 'data-grid-column-end',
            gridRowStart: 'data-grid-row-start',
            gridRowEnd: 'data-grid-row-end'
        };
        _this.msGridAttributes = {
            msGridColumn: 'data-grid-column-start',
            msGridColumnSpan: 'data-grid-column-end',
            msGridRow: 'data-grid-row-start',
            msGridRowSpan: 'data-grid-row-end'
        };
        _this.state = {};
        _this.support = _this._detectGridSupport();
        return _this;
    }
    GridLayout.prototype.connectedCallback = function () {
        this._getState();
        this._setStyles();
        this._setObserver();
    };
    GridLayout.prototype.disconnectedCallback = function () {
        if (this.childObserver)
            this.childObserver.disconnect();
    };
    GridLayout.prototype._detectGridSupport = function () {
        var el = document.createElement('div');
        if (typeof el.style.grid === 'string') {
            return 'grid';
        }
        else if (typeof el.style.msGridColumn) {
            return 'msGrid';
        }
        else {
            return null;
        }
    };
    GridLayout.prototype._attributeValidation = function (name, value) {
        switch (name) {
            case 'columns':
            case 'rows':
                if (this.support === 'grid') {
                    return (/^\d+$/g.test(value)) ? 'repeat(' + value + ', 1fr)' : value;
                }
                else {
                    var to = parseInt(value, 10);
                    var arr = [];
                    for (var i = 1; i <= to; i++) {
                        arr.push('1fr');
                    }
                    return arr.join(' ');
                }
            case 'auto-flow':
                return (/^((row|column) ?)?(dense)?$/.test(value)) ? value : 'row';
            default: return value;
        }
    };
    GridLayout.prototype._getState = function (attribute, value) {
        var _this = this;
        if (attribute) {
            this.state[attribute] = this._attributeValidation(attribute, value);
            return;
        }
        GridLayout.observedAttributes.map(function (attribute) {
            _this.state[attribute] = _this._attributeValidation(attribute, _this.getAttribute(attribute));
        });
    };
    GridLayout.prototype._setStyles = function () {
        if (this.support == null)
            throw new Error('No CSS support');
        if (this.support === 'msGrid') {
            this._setLegacyStyles();
            return;
        }
        this.style.display = (this.hasAttribute('inline')) ? 'inline-grid' : 'grid';
        if (this.state.columns)
            this.style.gridTemplateColumns = this.state.columns;
        if (this.state.rows)
            this.style.gridTemplateRows = this.state.rows;
        if (this.state["auto-columns"])
            this.style.gridAutoColumns = this.state["auto-columns"];
        if (this.state["auto-rows"])
            this.style.gridAutoRows = this.state["auto-rows"];
        if (this.state['gap']) {
            this.style.gridGap = this.state['gap'];
        }
        else {
            if (this.state["row-gap"])
                this.style.gridRowGap = this.state["row-gap"];
            if (this.state["column-gap"])
                this.style.gridColumnGap = this.state["column-gap"];
        }
        if (this.state["auto-flow"])
            this.style.gridAutoFlow = this.state["auto-flow"];
    };
    GridLayout.prototype._setLegacyStyles = function () {
        this.style.display = (this.hasAttribute('inline')) ? '-ms-inline-grid' : '-ms-grid';
        if (this.state.columns)
            this.style.msGridColumns = this.state.columns;
        if (this.state.rows)
            this.style.msGridRows = this.state.rows;
        if (this.state["align-self"])
            this.style.msGridRowAlign = this.state["align-self"];
        if (this.state["justify-self"])
            this.style.msGridColumnAlign = this.state["justify-self"];
    };
    GridLayout.prototype._setObserver = function () {
        var _this = this;
        this.childObserver = new MutationObserver(function (mutations) {
            var mutatedNodes = [];
            mutations.forEach(function (mutation) {
                if (mutation.type === 'attributes' && mutation.target.parentNode === _this) {
                    mutatedNodes.push(mutation.target);
                }
            });
            mutatedNodes.forEach(function (node) {
                _this._setChildAttributes(node);
            });
        });
        var observerConfig = {
            attributes: true,
            childList: true,
            attributeFilter: Object.keys(this.gridAttributes).map(function (key) { return _this.gridAttributes[key]; }),
            subtree: true,
            attributeOldValue: false
        };
        var propertyNames = Object.keys(this.gridAttributes);
        Array.from(this.children).filter(function (child) {
            var datasetNames = Object.keys(child.dataset);
            return (propertyNames.filter(function (x) { return datasetNames.indexOf(x) > -1; }).length > 0);
        }).forEach(function (element) { _this._setChildAttributes(element); });
        this.childObserver.observe(this, observerConfig);
    };
    GridLayout.prototype._setChildAttributes = function (node) {
        if (!node)
            return;
        if (this.support === 'msGrid') {
            this._setMsGridChildAttributes(node);
            return;
        }
        var data = node.dataset;
        Object.keys(this.gridAttributes).forEach(function (attribute) {
            node.style[attribute] = data[attribute] || '';
        });
    };
    GridLayout.prototype._setMsGridChildAttributes = function (node) {
        var _this = this;
        if (!node)
            return;
        var element = node;
        Object.keys(this.msGridAttributes).forEach(function (attribute) {
            var value = element.getAttribute(_this.msGridAttributes[attribute]);
            if (value == null)
                return;
            if (attribute.substr(-4) === 'Span') {
                var withoutSuffix = attribute.substr(0, attribute.length - 4);
                var referenceKey = _this.msGridAttributes[withoutSuffix];
                var start = parseInt(element.getAttribute(referenceKey) || "1", 10);
                var end = parseInt(value, 10) || start;
                element.style[attribute] = ((end - start).toString()) || '1';
            }
            else {
                element.style[attribute] = value || '';
            }
        });
    };
    Object.defineProperty(GridLayout, "observedAttributes", {
        get: function () {
            return ['gap', 'column-gap', 'row-gap', 'inline', 'columns', 'rows', 'auto-rows', 'auto-columns', 'auto-flow', 'align-self', 'justify-self'];
        },
        enumerable: true,
        configurable: true
    });
    GridLayout.prototype.attributeChangedCallback = function (attrName, oldVal, newVal) {
        this._getState(attrName, newVal);
        this._setStyles();
    };
    return GridLayout;
}(HTMLElement));
window.customElements.define('grid-layout', GridLayout);
