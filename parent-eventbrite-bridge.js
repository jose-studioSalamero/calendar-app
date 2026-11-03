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

  var eventId = "2003951821844";
  var triggerButtonId = "eventbrite-parent-widget-trigger-" + eventId;
  var triggerButton = null;
  var widgetReady = false;
  var pendingOpen = false;

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

  function openWidget() {
    if (!widgetReady || !triggerButton) {
      pendingOpen = true;
      return;
    }

    pendingOpen = false;
    triggerButton.click();
  }

  function createWidget() {
    if (!window.EBWidgets) {
      console.error("Eventbrite widgets did not load in the parent page.");
      return;
    }

    var buttonContainer = document.getElementById(
      "eventbrite-parent-buttons-container",
    );
    if (!buttonContainer) {
      buttonContainer = document.createElement("div");
      buttonContainer.id = "eventbrite-parent-buttons-container";
      buttonContainer.style.display = "none";
      document.body.appendChild(buttonContainer);
    }

    triggerButton = document.getElementById(triggerButtonId);
    if (!triggerButton) {
      triggerButton = document.createElement("button");
      triggerButton.id = triggerButtonId;
      triggerButton.type = "button";
      triggerButton.textContent = "Buy Tickets";
      triggerButton.style.display = "none";
      buttonContainer.appendChild(triggerButton);
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
      widgetReady = true;
      if (pendingOpen) {
        openWidget();
      }
    } catch (error) {
      console.error("Error creating parent Eventbrite widget:", error);
    }
  }

  function loadEventbriteScript() {
    if (window.EBWidgets) {
      createWidget();
      return;
    }

    var existingScript = document.querySelector(
      'script[src*="eb_widgets.js"]',
    );
    if (existingScript) {
      existingScript.addEventListener("load", createWidget, { once: true });
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
    script.onload = createWidget;
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
      request.eventId !== eventId ||
      typeof request.date !== "string"
    ) {
      return;
    }

    openWidget();
  });

  loadEventbriteScript();
})();
