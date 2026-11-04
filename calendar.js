document.addEventListener("DOMContentLoaded", function () {
  console.log("Document ready, starting calendar initialization...");

  // Function to wait for FullCalendar to load
  function waitForFullCalendar() {
    if (typeof FullCalendar !== "undefined") {
      console.log("FullCalendar is available, initializing calendar...");
      initializeCalendar();
    } else {
      console.log("FullCalendar not yet loaded, waiting...");
      setTimeout(waitForFullCalendar, 100);
    }
  }

  // Debounce function for performance
  function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  }

  function initializeCalendar() {
    // Enhanced locale detection
    function detectLocale() {
      const currentPath = window.location.pathname;
      let calendarLocale = "en"; // default

      console.log("Current path:", currentPath);

      if (
        currentPath.includes("/zh-hant-hk/") ||
        currentPath.includes("/hk/")
      ) {
        calendarLocale = "zh-hk"; // Try Hong Kong specific locale first
      } else if (currentPath.includes("/zh-hans-hk/")) {
        calendarLocale = "zh-cn";
      } else if (currentPath.includes("/zh/")) {
        calendarLocale = "zh";
      }

      // Fallback if specific locale isn't available
      const availableLocales = ["en", "zh-cn", "zh-tw", "zh-hk", "zh"];
      if (!availableLocales.includes(calendarLocale)) {
        calendarLocale = "en";
      }

      console.log("Detected calendar locale:", calendarLocale);
      return calendarLocale;
    }

    var calendarEl = document.getElementById("divCalendar");
    if (!calendarEl) {
      console.error("Calendar container #divCalendar not found!");
      return;
    }

    // Collect events from your CMS (if any)
    var myEvents = [];

    if (typeof $ !== "undefined") {
      $(".ec-col-item").each(function () {
        var eventTitle = $(this).find(".title").text();
        var startDate = $(this).find(".start-date").text();
        var startEnd = $(this).find(".end-date").text();
        var eventUrl = $(this).find(".url").text();
        var eventAllday = $(this).find(".allday").text();
        var eventClassName = $(this).find(".classname").text();
        var webflowLink = $(this).find(".webflow-link").attr("href");

        myEvents.push({
          title: eventTitle,
          start: startDate,
          end: startEnd,
          url: webflowLink,
          allDay: eventAllday === "true",
          className: eventClassName,
        });
      });
    }

    // Map each ticket date to its Eventbrite event from the current event list.
    var eventMapping = {
      "2026-12-22": "2004273457866",
      "2026-12-23": "2004273461878",
      "2026-12-24": "2004273576220",
      "2026-12-25": "2004273578226",
      "2026-12-26": "2004273580232",
      "2026-12-27": "2004273582238",
      "2026-12-28": "2004273634394",
      "2026-12-29": "2004273636400",
      "2026-12-30": "2004273638406",
      "2026-12-31": "2004273741715",
      "2027-01-01": "2004273744724",
      "2027-01-02": "2004273765787",
      "2027-01-03": "2004273766790",
      "2027-01-04": "2004276419725",
      "2027-01-05": "2004276421731",
      "2027-01-06": "2004276423737",
      "2027-01-07": "2004276426746",
      "2027-01-08": "2004276427749",
      "2027-01-09": "2004276526043",
      "2027-01-10": "2004276528049",
      "2027-01-11": "2004277075687",
      "2027-01-12": "2004277077693",
      "2027-01-13": "2004277078696",
      "2027-01-14": "2004277080702",
      "2027-01-17": "2004277083711",
      "2027-01-18": "2004277298353",
      "2027-01-19": "2004277299356",
      "2027-01-20": "2004277301362",
      "2027-01-21": "2004277302365",
      "2027-01-22": "2004277304371",
      "2027-01-23": "2004277746694",
      "2027-01-24": "2004277747697",
      "2027-01-25": "2004277768760",
      "2027-01-26": "2004277769763",
      "2027-01-27": "2004277777787",
      "2027-01-28": "2004277779793",
      "2027-01-29": "2004277782802",
      "2027-01-30": "2004277810886",
      "2027-01-31": "2004277811889",
      "2027-02-01": "2004277873072",
      "2027-02-02": "2004277874075",
      "2027-02-03": "2004277876081",
      "2027-02-04": "2004277881096",
      "2027-02-05": "2004278054615",
      "2027-02-06": "2004278057624",
      "2027-02-07": "2004278062639",
      "2027-02-08": "2004278068657",
      "2027-02-09": "2004278072669",
      "2027-02-10": "2004278129840",
      "2027-02-11": "2004278133852",
      "2027-02-12": "2004278139870",
      "2027-02-13": "2004278142879",
      "2027-02-14": "2004278145888",
      "2027-02-15": "2004278172969",
      "2027-02-16": "2004278176981",
      "2027-02-17": "2004278177984",
      "2027-02-18": "2004278180993",
      "2027-02-19": "2004278182999",
      "2027-02-20": "2004278257221",
      "2027-02-21": "2004278263239",
    };

   var offPeakDates = [
      "2026-12-22",
      "2026-12-23",
      "2027-01-04",
      "2027-01-05",
      "2027-01-06",
      "2027-01-07",
      "2027-01-08",
      "2027-01-11",
      "2027-01-12",
      "2027-01-13",
      "2027-01-14",
      "2027-01-18",
      "2027-01-19",
      "2027-01-20",
      "2027-01-21",
      "2027-01-22",
      "2027-01-25",
      "2027-01-26",
      "2027-01-27",
      "2027-01-28",
      "2027-01-29",
      "2027-02-01",
      "2027-02-02",
      "2027-02-03",
      "2027-02-04",
      "2027-02-15",
      "2027-02-16",
      "2027-02-17",
      "2027-02-18",
      "2027-02-19",
    ];

    var peakDates = [
      "2026-12-24",
      "2026-12-25",
      "2026-12-26",
      "2026-12-27",
      "2026-12-31",
      "2027-01-01",
      "2027-02-06",
      "2027-02-07",
      "2027-02-08",
      "2027-02-09",
    ];

    var standardDates = [
      "2026-12-28",
      "2026-12-29",
      "2026-12-30",
      "2027-01-02",
      "2027-01-03",
      "2027-01-09",
      "2027-01-10",
      "2027-01-17",
      "2027-01-23",
      "2027-01-24",
      "2027-01-30",
      "2027-01-31",
      "2027-02-05",
      "2027-02-10",
      "2027-02-11",
      "2027-02-12",
      "2027-02-13",
      "2027-02-14",
      "2027-02-20",
      "2027-02-21",
    ];

    var closedDates = ["2027-01-15", "2027-01-16"];

    var currentViewDate = new Date("2026-12-01");

    // Use the parent document when same-origin so the Eventbrite modal renders
    // above the embedding page instead of being clipped by the iframe.
    var eventbriteWindow = window;
    var eventbriteDocument = document;
    var canAccessParent = true;
    if (window.parent !== window) {
      try {
        eventbriteDocument = window.parent.document;
        eventbriteDocument.documentElement;
        eventbriteWindow = window.parent;
      } catch (error) {
        canAccessParent = false;
      }
    }

    // Create a static widget in the document that should display the modal.
    var widgetsInitialized = false;
    var createdButtons = {};

    function createStaticWidgetsOnce() {
      if (widgetsInitialized || !eventbriteWindow.EBWidgets) {
        return;
      }

      console.log("Creating Eventbrite widgets in the display document...");

      // Create a hidden container for all buttons
      var buttonContainer = eventbriteDocument.createElement("div");
      buttonContainer.id = "eventbrite-buttons-container";
      buttonContainer.style.display = "none";
      eventbriteDocument.body.appendChild(buttonContainer);

      // Create a button and widget for each event
      Object.keys(eventMapping).forEach(function (dateStr) {
        var eventId = eventMapping[dateStr];
        var buttonId = "eventbrite-widget-modal-trigger-" + eventId;

        // Skip if button already exists
        if (createdButtons[eventId]) {
          return;
        }

        // Create button
        var button = eventbriteDocument.createElement("button");
        button.id = buttonId;
        button.type = "button";
        button.textContent = "Buy Tickets";
        button.style.display = "none";
        buttonContainer.appendChild(button);

        // Create widget
        try {
          eventbriteWindow.EBWidgets.createWidget({
            widgetType: "checkout",
            eventId: eventId,
            modal: true,
            modalTriggerElementId: buttonId,
            onOrderComplete: function () {
              console.log("Order complete for event:", eventId);
            },
          });

          createdButtons[eventId] = button;
          console.log("Created widget for event:", eventId);
        } catch (error) {
          console.error("Error creating widget for event:", eventId, error);
        }
      });

      widgetsInitialized = true;
      console.log("Eventbrite widgets created successfully");
    }

    function openEventbriteForDate(dateStr) {
      var eventId = eventMapping[dateStr];

      if (!eventId) {
        console.log("No event ID found for date:", dateStr);
        return;
      }

      if (!canAccessParent) {
        var parentOrigin = "*";
        try {
          if (document.referrer) {
            parentOrigin = new URL(document.referrer).origin;
          }
        } catch (error) {
          console.warn("Could not determine parent origin for Eventbrite request.");
        }

        console.log("Requesting parent page to open Eventbrite for:", dateStr);
        window.parent.postMessage(
          {
            type: "calendar:open-eventbrite",
            eventId: eventId,
            date: dateStr,
          },
          parentOrigin,
        );
        return;
      }

      var button = createdButtons[eventId];
      if (!button) {
        console.error("No button found for event:", eventId);
        return;
      }

      var scrollPosition =
        eventbriteWindow.pageYOffset ||
        eventbriteDocument.documentElement.scrollTop;
      var scrollLeft =
        eventbriteWindow.pageXOffset ||
        eventbriteDocument.documentElement.scrollLeft;

      console.log("Triggering widget for date:", dateStr, "Event ID:", eventId);

      button.click();

      if (eventbriteWindow.innerWidth <= 768) {
        setTimeout(function () {
          eventbriteWindow.scrollTo(scrollLeft, scrollPosition);
        }, 150);

        setTimeout(function () {
          eventbriteWindow.scrollTo(scrollLeft, scrollPosition);
        }, 500);
      }
    }

    function loadEventbriteScript() {
      if (!canAccessParent) {
        console.info(
          "Cross-origin embedding detected; the parent must load parent-eventbrite-bridge.js.",
        );
        return;
      }

      var scriptDocument = eventbriteDocument;
      var scriptWindow = eventbriteWindow;
      if (
        !scriptWindow.EBWidgets &&
        !scriptDocument.querySelector('script[src*="eb_widgets.js"]')
      ) {
        var script = scriptDocument.createElement("script");
        script.src = "https://www.eventbrite.hk/static/widgets/eb_widgets.js";
        script.onload = function () {
          console.log("Eventbrite script loaded successfully");
          setTimeout(createStaticWidgetsOnce, 100);
        };
        script.onerror = function () {
          console.error("Failed to load Eventbrite script");
        };
        scriptDocument.head.appendChild(script);
        console.log("Loading Eventbrite script...");
      } else if (scriptWindow.EBWidgets) {
        setTimeout(createStaticWidgetsOnce, 100);
      } else {
        var existingScript = scriptDocument.querySelector(
          'script[src*="eb_widgets.js"]',
        );
        existingScript.addEventListener("load", createStaticWidgetsOnce, {
          once: true,
        });
        existingScript.addEventListener(
          "error",
          function () {
            console.error("Failed to load Eventbrite script");
          },
          { once: true },
        );
      }
    }

    function getMainMonthFromView(viewStart, viewEnd) {
      var midPoint = new Date(
        viewStart.getTime() + (viewEnd.getTime() - viewStart.getTime()) / 2,
      );
      return midPoint;
    }

    function isDateSelectable(date, viewDate) {
      return (
        date.getMonth() === viewDate.getMonth() &&
        date.getFullYear() === viewDate.getFullYear()
      );
    }

    function applyClassToDate(info) {
      var dateStr = info.date.toISOString().split("T")[0];
      var isSelectable = isDateSelectable(info.date, currentViewDate);

      info.el.classList.remove(
        "off-peak",
        "peak",
        "standard",
        "closed",
        "disabled-date",
      );

      if (!isSelectable) {
        info.el.classList.add("disabled-date");
        return;
      }

      if (offPeakDates.includes(dateStr)) {
        info.el.classList.add("off-peak");
      } else if (peakDates.includes(dateStr)) {
        info.el.classList.add("peak");
      } else if (standardDates.includes(dateStr)) {
        info.el.classList.add("standard");
      } else if (closedDates.includes(dateStr)) {
        info.el.classList.add("closed");
      }

      // Add visual feedback for clickable dates
      if (eventMapping[dateStr]) {
        info.el.style.cursor = "pointer";
        info.el.setAttribute("title", "Click to purchase tickets");
      }
    }

    function applyAllDateClasses() {
      setTimeout(function () {
        document
          .querySelectorAll(".fc-daygrid-day[data-date]")
          .forEach(function (dayEl) {
            var dateStr = dayEl.getAttribute("data-date");
            if (dateStr) {
              var date = new Date(dateStr);
              var isSelectable = isDateSelectable(date, currentViewDate);

              dayEl.classList.remove(
                "off-peak",
                "peak",
                "standard",
                "closed",
                "disabled-date",
              );

              if (!isSelectable) {
                dayEl.classList.add("disabled-date");
                return;
              }

              if (offPeakDates.includes(dateStr)) {
                dayEl.classList.add("off-peak");
              } else if (peakDates.includes(dateStr)) {
                dayEl.classList.add("peak");
              } else if (standardDates.includes(dateStr)) {
                dayEl.classList.add("standard");
              } else if (closedDates.includes(dateStr)) {
                dayEl.classList.add("closed");
              }

              // Add visual feedback for clickable dates
              if (eventMapping[dateStr]) {
                dayEl.style.cursor = "pointer";
                dayEl.setAttribute("title", "Click to purchase tickets");
              }
            }
          });
      }, 50);
    }

    // Enhanced function to remove day character
    function removeDayCharacter() {
      setTimeout(function () {
        const dayNumbers = document.querySelectorAll(".fc-daygrid-day-number");
        dayNumbers.forEach(function (element) {
          if (element.textContent) {
            // Remove various day suffixes for different locales
            element.textContent = element.textContent
              .replace("日", "") // Japanese/Chinese
              .replace("號", "") // Traditional Chinese alternative
              .replace("号", "") // Simplified Chinese alternative
              .trim();
          }
        });
      }, 50);
    }

    // Debounced versions for better performance
    const debouncedApplyClasses = debounce(applyAllDateClasses, 100);
    const debouncedRemoveDayChar = debounce(removeDayCharacter, 100);

    // Initialize FullCalendar with enhanced configuration
    try {
      var calendar = new FullCalendar.Calendar(calendarEl, {
        locale: detectLocale(),
        dayNumberFormat: { day: "numeric" },
        dayHeaderFormat: { weekday: "short" },
        titleFormat: { year: "numeric", month: "long" },
        initialView: "dayGridMonth",
        height: "auto",
        firstDay: 1, // Start week on Monday
        headerToolbar: {
          left: "prev,next",
          center: "title",
          right: "",
        },
        validRange: {
          start: "2026-12-01",
          end: "2027-02-28",
        },
        initialDate: "2026-12-01",
        events: myEvents,
        selectable: true,
        fixedWeekCount: false,
        showNonCurrentDates: true,

        // Custom day cell content to remove day characters
        dayCellContent: function (info) {
          return { html: info.dayNumberText.replace(/[日號号]/g, "") };
        },

        dateClick: function (info) {
          if (info.jsEvent) {
            info.jsEvent.preventDefault();
            info.jsEvent.stopPropagation();
          }

          var dateStr = info.dateStr;
          var date = new Date(dateStr);
          var isSelectable = isDateSelectable(date, currentViewDate);

          if (!isSelectable) {
            console.log("Date not selectable, click disabled:", dateStr);
            return false;
          }

          if (eventMapping[dateStr]) {
            console.log("Date clicked:", dateStr, "Opening Eventbrite...");
            openEventbriteForDate(dateStr);
            return false;
          }

          console.log("No Eventbrite event found for date:", dateStr);
          return false;
        },

        datesSet: function (info) {
          console.log("Current view changed to:", info.start, "to", info.end);

          var mainMonth = getMainMonthFromView(info.start, info.end);
          currentViewDate = new Date(
            mainMonth.getFullYear(),
            mainMonth.getMonth(),
            1,
          );

          debouncedApplyClasses();
          debouncedRemoveDayChar();
        },

        dayCellDidMount: function (info) {
          applyClassToDate(info);
        },
      });

      // Start initialization
      loadEventbriteScript();
      calendar.render();
      applyAllDateClasses();
      removeDayCharacter();

      console.log(
        "Calendar initialized successfully with locale:",
        detectLocale(),
      );
    } catch (error) {
      console.error("Error initializing FullCalendar:", error);
    }
  }

  // Start waiting for FullCalendar
  waitForFullCalendar();
});
