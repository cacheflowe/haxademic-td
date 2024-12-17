import ObjectUtil from "../object-util.js";

class AppStoreElement extends HTMLElement {
  connectedCallback() {
    this.initialHTML = this.innerHTML;
    // this.shadow = this.attachShadow({ mode: "open" }); // "open" allows querying and probably lots more
    this.el = this.shadow ? this.shadow : this;
    this.initComponent();
    this.render();
  }

  disconnectedCallback() {
    _store?.removeListener(this);
  }

  initComponent() {
    this.storeKey = String(this.getAttribute("key")) || "key";
    this.storeValue = String(this.getAttribute("value")) || "value";

    // handle special values to coerce datatypes
    if (this.storeValue == "true") this.storeValue = true;
    else if (this.storeValue == "false") this.storeValue = false;
    else if (this.storeValue == "0") this.storeValue = 0;
    else if (this.storeValue == "1") this.storeValue = 1;

    // AppStore connection
    this.valueFromStore = null;
    ObjectUtil.callbackWhenPropertyExists(window, "_store", () => {
      this.initStoreListener();
    });
  }

  initStoreListener() {
    this.valueFromStore = _store.get(this.storeKey) || this.valueFromStore;
    _store.addListener(this);
  }

  storeUpdated(key, value) {
    if (key != this.storeKey) return; // ignore other keys
    if (value != this.valueFromStore) {
      this.valueFromStore = value;
      this.setStoreValue(value);
    }
  }

  setStoreValue(value) {
    console.log("setStoreValue", value);
    this.el ? (this.el.innerHTML = value) : this.render();
  }

  css() {
    return /*css*/ `
    `;
  }

  html() {
    return /*html*/ `
      <div>${this.valueFromStore || this.initialHTML}</div>
    `;
  }

  render() {
    this.el.innerHTML = /*html*/ `
      ${this.html()}
      <style>
        ${this.css()}
      </style>
    `;
  }

  static register() {
    customElements.define("app-store-element", AppStoreElement);
  }
}

AppStoreElement.register();

export default AppStoreElement;
