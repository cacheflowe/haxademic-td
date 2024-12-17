import AppStoreElement from "./app-store-element.js";

class AppStoreSlider extends AppStoreElement {
  initStoreListener() {
    this.input = this.el.querySelector("input");
    this.input.addEventListener("input", (e) => {
      _store.set(this.storeKey, parseFloat(e.target.value), true);
    });
    this.input.setAttribute("min", this.getAttribute("min") || 0);
    this.input.setAttribute("max", this.getAttribute("max") || 1);
    this.input.setAttribute("step", this.getAttribute("step") || 0.001);
    this.input.value = this.hasAttribute("value")
      ? parseFloat(this.getAttribute("value"))
      : 0;

    super.initStoreListener();
  }

  setStoreValue(value) {
    this.input.value = value;
  }

  css() {
    return /*css*/ ``;
  }

  html() {
    return /*html*/ `
      <input type="range" value="0" >
    `;
  }

  static register() {
    customElements.define("app-store-slider", AppStoreSlider);
  }
}

AppStoreSlider.register();

export default AppStoreSlider;
