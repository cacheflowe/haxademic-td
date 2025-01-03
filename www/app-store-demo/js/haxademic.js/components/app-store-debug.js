class AppStoreDebug extends HTMLElement {
  connectedCallback() {
    this.shadow = this.attachShadow({ mode: "open" });
    _store.addListener(this);
    this.render();
    this.div = this.shadow.querySelector("div");
    this.initKeyListener();
    this.showing = false;
    _store.set("SHOW_DEBUG", false);
  }

  html() {
    let htmlStr = "<table>";
    for (let storeKey in _store.state) {
      let val = _store.state[storeKey];
      if (val && typeof val == "object" && val.length && val.length > 0) {
        val = `Array(${val.length})`; // special display for arrays
      }
      if (val && typeof val == "string" && val.length && val.length > 100) {
        val = `${val.substring(0, 100)}...`; // special display for long strings
      }
      htmlStr += `<tr><td>${storeKey}</td><td>${val}</td></tr>`;
    }
    htmlStr += "</table>";
    return htmlStr;
  }

  css() {
    let isSideDisplay = this.hasAttribute("side-debug");
    let sideCSS = isSideDisplay
      ? `
        top: 0; 
        left: 0;
        width: auto; 
        height: 100%; 
        max-width: 70%;
        border-top: none;
        border-right: 2px solid green;
      `
      : "";
    return /*css*/ `
      :host {
        pointer-events: none;
        border-top: 2px solid green;
        position: fixed;
        bottom: 0;
        left: 0;
        padding: 1rem;
        width: 100%; 
        background: rgba(0,0,0,0.8);
        color: #fff;
        overflow-y: auto;
        font-family: arial;
        font-size: 12px;
        z-index: 9999;
        display: none;
        ${sideCSS}
      }
      table {
        border-collapse: collapse;
        border-spacing: 0;
      }
      td {
        background: rgba(255, 255, 255, 0.1);
        padding: 0.5rem;
      }
      tr {
        border-bottom: 1px solid rgba(255, 255, 255, 0.4);
      }
    `;
  }

  render() {
    this.shadow.innerHTML = /*html*/ `
      ${this.html()}
      <style>
        ${this.css()}
      </style>
    `;
  }

  initKeyListener() {
    window.addEventListener("keyup", (e) => {
      let notFocused = document.activeElement.tagName != "INPUT"; // e.target.tagName != "INPUT"
      if (e.key == "/" && notFocused) {
        this.showing = !this.showing;
        _store.set("SHOW_DEBUG", this.showing);
        if (this.showing == false) {
          this.hide();
        } else {
          this.show();
        }
      }
    });
  }

  storeUpdated(key, value) {
    if (key == "SHOW_DEBUG") {
      value ? this.show() : this.hide();
    }
    if (this.showing) this.render();
  }

  show() {
    this.render();
    this.style.display = "block";
    this.showing = true;
  }

  hide() {
    this.innerHTML = "";
    this.style.display = "none";
    this.showing = false;
  }

  static register() {
    customElements.define("app-store-debug", AppStoreDebug);
  }
}

AppStoreDebug.register();

export default AppStoreDebug;
