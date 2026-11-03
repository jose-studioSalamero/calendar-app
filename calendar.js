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

    // Map every selectable calendar date to the current Eventbrite event.
    var eventMapping = {};
    var eventDate = new Date(Date.UTC(2026, 11, 1));
    var eventDateEnd = new Date(Date.UTC(2027, 1, 28));
    while (eventDate < eventDateEnd) {
      eventMapping[eventDate.toISOString().slice(0, 10)] = "2003951821844";
      eventDate.setUTCDate(eventDate.getUTCDate() + 1);
    }

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

    // Create separate static widgets for each event
    var widgetsInitialized = false;
    var createdButtons = {};

    function createStaticWidgetsOnce() {
      if (widgetsInitialized || !window.EBWidgets) {
        return;
      }

      console.log("Creating static widgets for all events...");

      // Create a hidden container for all buttons
      var buttonContainer = document.createElement("div");
      buttonContainer.id = "eventbrite-buttons-container";
      buttonContainer.style.display = "none";
      document.body.appendChild(buttonContainer);

      // Create a button and widget for each event
      Object.keys(eventMapping).forEach(function (dateStr) {
        var eventId = eventMapping[dateStr];
        var buttonId = "eventbrite-widget-modal-trigger-" + eventId;

        // Skip if button already exists
        if (createdButtons[eventId]) {
          return;
        }

        // Create button
        var button = document.createElement("button");
        button.id = buttonId;
        button.type = "button";
        button.textContent = "Buy Tickets";
        button.style.display = "none";
        buttonContainer.appendChild(button);

        // Create widget
        try {
          window.EBWidgets.createWidget({
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
      console.log("All static widgets created successfully");
    }

    function openEventbriteForDate(dateStr) {
      var eventId = eventMapping[dateStr];

      if (!eventId) {
        console.log("No event ID found for date:", dateStr);
        return;
      }

      var button = createdButtons[eventId];
      if (!button) {
        console.error("No button found for event:", eventId);
        return;
      }

      var scrollPosition =
        window.pageYOffset || document.documentElement.scrollTop;
      var scrollLeft =
        window.pageXOffset || document.documentElement.scrollLeft;

      console.log("Triggering widget for date:", dateStr, "Event ID:", eventId);

      button.click();

      if (window.innerWidth <= 768) {
        setTimeout(function () {
          window.scrollTo(scrollLeft, scrollPosition);
        }, 150);

        setTimeout(function () {
          window.scrollTo(scrollLeft, scrollPosition);
        }, 500);
      }
    }

    function loadEventbriteScript() {
      if (
        !window.EBWidgets &&
        !document.querySelector('script[src*="eb_widgets.js"]')
      ) {
        var script = document.createElement("script");
        script.src = "https://www.eventbrite.hk/static/widgets/eb_widgets.js";
        script.onload = function () {
          console.log("Eventbrite script loaded successfully");
          setTimeout(createStaticWidgetsOnce, 100);
        };
        script.onerror = function () {
          console.error("Failed to load Eventbrite script");
        };
        document.head.appendChild(script);
        console.log("Loading Eventbrite script...");
      } else if (window.EBWidgets) {
        setTimeout(createStaticWidgetsOnce, 100);
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
