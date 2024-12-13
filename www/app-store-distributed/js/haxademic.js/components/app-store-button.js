import MobileUtil from "../mobile-util.js";
import AppStoreElement from "./app-store-element.js";

class AppStoreButton extends AppStoreElement {
  clickEvent() {
    return MobileUtil.isMobileBrowser() ? "touchstart" : "click";
  }

  initStoreListener() {
    this.button = this.el.querySelector("button");
    this.isToggle = this.getAttribute("toggle") != null;
    this.isMomentary = this.getAttribute("momentary") != null;
    this.button.addEventListener(this.clickEvent(), (e) => {
      if (!this.storeKey) return;
      let currentValue = _store.get(this.storeKey);
      // if the storeValue is "toggle", toggle the boolean value
      if (this.isToggle) this.storeValue = !currentValue;
      // if the storeValue is "toggle", toggle the boolean value
      if (this.isMomentary) this.storeValue = true;
      // // if the storeValue is "true" or "false", send the boolean instead of the string
      currentValue = this.storeValue;
      // broadcast current value
      _store.set(this.storeKey, currentValue, true);
      // if the storeValue is "momentary", send true and immediately false
      if (this.isMomentary) _store.set(this.storeKey, false, true);
    });

    if (this.isToggle) {
      this.button.innerHTML += '<input type="checkbox" role="switch" />';
      this.setStoreValue(this.storeValue);
    }

    super.initStoreListener();
  }

  setStoreValue(value) {
    if (this.isToggle) {
      // toggle button
      console.log(value);
      let checkbox = this.button.querySelector("input");
      checkbox.checked = value;
      console.log("checkbox.checked", checkbox.checked, value);
    } else {
      // notmal button w/possible shared key
      if (value == this.storeValue) this.button.setAttribute("disabled", true);
      else this.button.removeAttribute("disabled");
    }
  }

  css() {
    return /*css*/ `
      button input[type="checkbox"] {
        margin-right: 0;
        pointer-events: none;
      }
    `;
  }

  html() {
    return /*html*/ `
      <button>${this.initialHTML}</button>
    `;
  }

  static register() {
    customElements.define("app-store-button", AppStoreButton);
  }
}

AppStoreButton.register();

export default AppStoreButton;
