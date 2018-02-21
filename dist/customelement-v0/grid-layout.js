"use strict";
(function (w, d) {
    'use strict';
    var GridLayoutProto = Object.create(HTMLElement.prototype);
    Object.defineProperty(GridLayoutProto, 'observedAttributes', {
        value: ['inline', 'columns', 'rows', 'auto-rows', 'auto-columns', 'gap', 'column-gap', 'row-gap', 'auto-flow']
    });
    Object.defineProperty(GridLayoutProto, 'gridAttributes', {
        value: {
            gridColumnStart: 'data-grid-column-start',
            gridColumnEnd: 'data-grid-column-end',
            gridRowStart: 'data-grid-row-start',
            gridRowEnd: 'data-grid-row-end'
        }
    });
    GridLayoutProto._detectGridSupport = function () {
        var el = document.createElement('div');
        return typeof el.style.grid === 'string';
    };
    GridLayoutProto._getState = function (attribute, value) {
        var _this = this;
        if (attribute) {
            this.state[attribute] = this._attributeValidation(attribute, value);
            return;
        }
        this.observedAttributes.map(function (attribute) {
            _this.state[attribute] = _this._attributeValidation(attribute, _this.getAttribute(attribute));
        });
    };
    GridLayoutProto._attributeValidation = function (name, value) {
        switch (name) {
            case 'columns':
            case 'rows':
                return (/^\d+$/g.test(value)) ? 'repeat(' + value + ', 1fr)' : value;
            case 'auto-flow':
                return (/^((row|column) ?)?(dense)?$/.test(value)) ? value : 'row';
            default: return value;
        }
    };
    GridLayoutProto._setStyles = function () {
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
    GridLayoutProto._setObserver = function () {
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
    GridLayoutProto._setChildAttributes = function (node) {
        if (!node)
            return;
        var data = node.dataset;
        Object.keys(this.gridAttributes).forEach(function (attribute) {
            node.style[attribute] = data[attribute] || '';
        });
    };
    GridLayoutProto.createdCallback = function () {
        this.support = this._detectGridSupport();
        this.state = {};
    };
    GridLayoutProto.attachedCallback = function () {
        this._getState();
        this._setStyles();
        this._setObserver();
    };
    GridLayoutProto.detachedCallback = function () {
        if (this.childObserver)
            this.childObserver.disconnect();
    };
    GridLayoutProto.attributeChangedCallback = function (attributeName, oldValue, newValue) {
        if (this.observedAttributes.indexOf(attributeName) !== -1) {
            this._getState(attributeName, newValue);
            this._setStyles();
        }
    };
    var GridLayout = document.registerElement('grid-layout', { prototype: GridLayoutProto });
}(window, document));
