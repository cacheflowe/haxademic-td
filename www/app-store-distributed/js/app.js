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
    _store.addListener(this);
  }

  storeUpdated(key, value) {
    console.log(key, value);
    if (key == "presets") {
      let presetsJSON = JSON.parse(value);
      console.log(presetsJSON);
    } else if (key == "activePreset") {
      let activePresetJSON = JSON.parse(value);
      console.log(activePresetJSON);
    }
  }

  init() {
    ErrorUtil.initErrorCatching();
    MobileUtil.enablePseudoStyles();
  }
}

customElements.define("custom-app", CustomApp);
