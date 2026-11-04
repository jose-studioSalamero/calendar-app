(function () {
  var bridgeScript = document.currentScript;
  var iframeSelector =
    bridgeScript && bridgeScript.getAttribute("data-calendar-iframe");

  if (!iframeSelector) {
    console.error(
      "Eventbrite parent bridge requires data-calendar-iframe to identify the calendar iframe.",
    );
    return;
  }

  var allowedEventIds = {
    "2004273457866": true,
    "2004273461878": true,
    "2004273576220": true,
    "2004273578226": true,
    "2004273580232": true,
    "2004273582238": true,
    "2004273634394": true,
    "2004273636400": true,
    "2004273638406": true,
    "2004273741715": true,
    "2004273744724": true,
    "2004273765787": true,
    "2004273766790": true,
    "2004276419725": true,
    "2004276421731": true,
    "2004276423737": true,
    "2004276426746": true,
    "2004276427749": true,
    "2004276526043": true,
    "2004276528049": true,
    "2004277075687": true,
    "2004277077693": true,
    "2004277078696": true,
    "2004277080702": true,
    "2004277083711": true,
    "2004277298353": true,
    "2004277299356": true,
    "2004277301362": true,
    "2004277302365": true,
    "2004277304371": true,
    "2004277746694": true,
    "2004277747697": true,
    "2004277768760": true,
    "2004277769763": true,
    "2004277777787": true,
    "2004277779793": true,
    "2004277782802": true,
    "2004277810886": true,
    "2004277811889": true,
    "2004277873072": true,
    "2004277874075": true,
    "2004277876081": true,
    "2004277881096": true,
    "2004278054615": true,
    "2004278057624": true,
    "2004278062639": true,
    "2004278068657": true,
    "2004278072669": true,
    "2004278129840": true,
    "2004278133852": true,
    "2004278139870": true,
    "2004278142879": true,
    "2004278145888": true,
    "2004278172969": true,
    "2004278176981": true,
    "2004278177984": true,
    "2004278180993": true,
    "2004278182999": true,
    "2004278257221": true,
    "2004278263239": true,
  };
  var widgetStates = {};

  function getCalendarFrame() {
    try {
      return document.querySelector(iframeSelector);
    } catch (error) {
      console.error("Invalid calendar iframe selector:", iframeSelector, error);
      return null;
    }
  }

  function getExpectedFrameOrigin(frame) {
    var configuredOrigin =
      bridgeScript && bridgeScript.getAttribute("data-iframe-origin");
    var frameUrl = configuredOrigin || frame.src;

    try {
      return new URL(frameUrl, document.baseURI).origin;
    } catch (error) {
      console.error("Could not determine the calendar iframe origin.", error);
      return null;
    }
  }

  function createWidget(eventId) {
    if (!window.EBWidgets) {
      widgetStates[eventId].pendingOpen = true;
      return;
    }

    var widgetState = widgetStates[eventId];
    var triggerButtonId = "eventbrite-parent-widget-trigger-" + eventId;
    var buttonContainer = document.getElementById(
      "eventbrite-parent-buttons-container",
    );
    if (!buttonContainer) {
      buttonContainer = document.createElement("div");
      buttonContainer.id = "eventbrite-parent-buttons-container";
      buttonContainer.style.display = "none";
      document.body.appendChild(buttonContainer);
    }

    widgetState.triggerButton = document.getElementById(triggerButtonId);
    if (!widgetState.triggerButton) {
      widgetState.triggerButton = document.createElement("button");
      widgetState.triggerButton.id = triggerButtonId;
      widgetState.triggerButton.type = "button";
      widgetState.triggerButton.textContent = "Buy Tickets";
      widgetState.triggerButton.style.display = "none";
      buttonContainer.appendChild(widgetState.triggerButton);
    }

    if (widgetState.widgetReady) {
      if (widgetState.pendingOpen) {
        widgetState.pendingOpen = false;
        widgetState.triggerButton.click();
      }
      return;
    }

    try {
      window.EBWidgets.createWidget({
        widgetType: "checkout",
        eventId: eventId,
        modal: true,
        modalTriggerElementId: triggerButtonId,
        onOrderComplete: function () {
          console.log("Order complete for event:", eventId);
        },
      });
      widgetState.widgetReady = true;
      if (widgetState.pendingOpen) {
        widgetState.pendingOpen = false;
        widgetState.triggerButton.click();
      }
    } catch (error) {
      console.error("Error creating parent Eventbrite widget:", error);
    }
  }

  function openWidget(eventId) {
    if (!widgetStates[eventId]) {
      widgetStates[eventId] = {
        triggerButton: null,
        widgetReady: false,
        pendingOpen: true,
      };
    } else if (widgetStates[eventId].widgetReady) {
      widgetStates[eventId].triggerButton.click();
      return;
    }

    createWidget(eventId);
  }

  function handleEventbriteLoaded() {
    Object.keys(widgetStates).forEach(function (eventId) {
      if (widgetStates[eventId].pendingOpen) {
        createWidget(eventId);
      }
    });
  }

  function loadEventbriteScript() {
    if (window.EBWidgets) {
      handleEventbriteLoaded();
      return;
    }

    var existingScript = document.querySelector(
      'script[src*="eb_widgets.js"]',
    );
    if (existingScript) {
      existingScript.addEventListener("load", handleEventbriteLoaded, {
        once: true,
      });
      existingScript.addEventListener(
        "error",
        function () {
          console.error("Failed to load Eventbrite script in the parent page.");
        },
        { once: true },
      );
      return;
    }

    var script = document.createElement("script");
    script.src = "https://www.eventbrite.hk/static/widgets/eb_widgets.js";
    script.onload = handleEventbriteLoaded;
    script.onerror = function () {
      console.error("Failed to load Eventbrite script in the parent page.");
    };
    document.head.appendChild(script);
  }

  window.addEventListener("message", function (messageEvent) {
    var frame = getCalendarFrame();
    if (!frame || messageEvent.source !== frame.contentWindow) {
      return;
    }

    var expectedOrigin = getExpectedFrameOrigin(frame);
    if (!expectedOrigin || messageEvent.origin !== expectedOrigin) {
      console.warn("Ignored Eventbrite request from an unexpected origin.");
      return;
    }

    var request = messageEvent.data;
    if (
      !request ||
      request.type !== "calendar:open-eventbrite" ||
      typeof request.eventId !== "string" ||
      !allowedEventIds[request.eventId] ||
      typeof request.date !== "string"
    ) {
      return;
    }

    openWidget(request.eventId);
  });

  loadEventbriteScript();
})();
