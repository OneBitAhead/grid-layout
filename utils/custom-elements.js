function _customElementsAssertion( assertion, version ){
  if(assertion) document.dispatchEvent( new CustomEvent('WebComponentsReady', {detail: {version: version, polyfill: false}}) );
  return assertion;
}

function customElementsV0Supported() {
  return _customElementsAssertion('registerElement' in document, 'v0');
}

function customElementsV1Supported(){
  return _customElementsAssertion('customElements' in window, 'v1');
}

function appendScript(path, callback){
  const script = document.createElement('SCRIPT')
  script.src = path;
  script.type = "text/javascript";
  if(callback && typeof callback === 'function') script.onload = callback;
  document.head.appendChild(script);
}

function polyfillCustomElementsV0(callback){
  const path = 'https://cdnjs.cloudflare.com/ajax/libs/webcomponentsjs/0.7.24/CustomElements.min.js';
  appendScript(path, callback);
}


function polyfillCustomElementsV1(callback){
  const path = 'https://unpkg.com/@webcomponents/webcomponentsjs/webcomponents-loader.js';
  appendScript(path, callback);
}


