# grid-layout
Custom element to declaratively handle CSS Grid Layouts

# How To Use
The `grid-layout` component works in all browsers with support for custom elements (CE). 
Variants for custom elements version 0 and version 1 are available.

To use the element, load the `grid-layout.js` (or minified version) in your script. Load polyfills if necessary (see below).
Place a `grid-layout` tag in your script and set the number of columns and rows as attributes

```html
    <script src="dist/customelement-v1/grid-layout.min.js"></script>
    <grid-layout rows="5" columns="4">
      <div data-grid-column-start="1" data-grid-column-end="3">Hello World</div>
    </grid-layout>
```

## Polyfills
When CE support has to be polyfilled, load the `utils/custom-elements.js` file

# API Options
grid-element: see observedAttributes

|Attribute|Comment|
|---------|-------|
|inline   |bla    |

direct children: 
data-grid-column-start
data-grid-column-end
data-grid-row-start
data-grid-row-end

Positions in the data-* attributes are set in regard of the gutter of the CSS grid.

# Legacy support
The grid-layout elements support for CSS Grid legacy implementations which can be found in Internet Explorer and early versions of Microsoft Edge. Please note that the grid-layout element serves as a unified wrapper for both version of the spec. That means that legacy properties like
-ms-grid-column-span and -ms-grid-row-span are not supported directly but by specifiying start and end positions in gutter - which is the prefered way of the current spec.