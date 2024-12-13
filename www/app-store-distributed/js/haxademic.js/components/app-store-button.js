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
    if (this.isMomentary) this.storeValue = 1; // if the storeValue is "momentary", always use 1/0 to send a pulse
    this.button.addEventListener(this.clickEvent(), (e) => {
      if (!this.storeKey) return;

      // if value isn't in store yet, use initial attribute value
      // this is more for the toggle button, b/c it changes its value
      let curVal = _store.get(this.storeKey) || this.storeValue;

      if (this.isToggle) {
        // if the storeValue is "toggle", toggle the boolean value, which is stored when it comes back from the socket connection
        if (curVal == 0 && typeof curVal == "number") curVal = 1;
        else if (curVal == 1 && typeof curVal == "number") curVal = 0;
        else if (curVal == false && typeof curVal == "boolean") curVal = true;
        else if (curVal == true && typeof curVal == "boolean") curVal = false;
      } else {
        // normal buttons always send the initial attribute value
        curVal = this.storeValue;
      }
      // broadcast current value
      _store.set(this.storeKey, curVal, true);
      // if the storeValue is "momentary", send 1 and immediately 0
      if (this.isMomentary) _store.set(this.storeKey, 0, true);
    });

    if (this.isToggle) {
      this.button.innerHTML += '<input type="checkbox" role="switch" />';
      this.setStoreValue(this.storeValue);
    }

    super.initStoreListener();
  }

  setStoreValue(value) {
    if (this.isToggle) {
      // store the value for future reference
      this.storeValue = value;
      // set checkbox indicator
      let checkbox = this.button.querySelector("input");
      checkbox.checked = value == true || parseInt(value) == 1; // allow for 1/0 or true/false
    } else {
      // normal button behavior (w/possible shared key)
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
