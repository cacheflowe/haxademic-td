import MobileUtil from "./haxademic.js/mobile-util.js";
import ErrorUtil from "./haxademic.js/error-util.js";

// Import to trigger self-executing register() functions inside the component classes
import "./haxademic.js/components/app-store-element.js";
import "./haxademic.js/components/app-store-button.js";
import "./haxademic.js/components/app-store-textfield.js";
import "./haxademic.js/components/app-store-slider.js";
import "./haxademic.js/components/app-state-distributed.js";
import "./haxademic.js/components/event-log-view.js";

class CustomApp extends HTMLElement {
  connectedCallback() {
    this.init();
  }

  init() {
    ErrorUtil.initErrorCatching();
    MobileUtil.enablePseudoStyles();
  }
}

customElements.define("custom-app", CustomApp);
