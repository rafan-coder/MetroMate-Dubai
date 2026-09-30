/* =========================================================
   METROMATE DUBAI
   Automatic Journey Tracking
========================================================= */


/* =========================================================
   TRANSLATIONS
========================================================= */

const translations = {

    en: {

        welcomeTitle:
            "Dubai Metro Made Simple",

        welcomeText:
            "Choose your current station and destination. MetroMate will guide you step by step.",

        currentStation:
            "Where are you now?",

        currentStationSub:
            "Select your current metro station",

        detectLocation:
            "Detect My Location",

        destination:
            "Where do you want to go?",

        destinationSub:
            "Select your destination",

        popularDestinations:
            "Popular destinations",

        voiceGuide:
            "Voice Guidance",

        showRoute:
            "Show My Route",

        yourJourney:
            "Your Journey"

    },


    hi: {

        welcomeTitle:
            "दुबई मेट्रो को आसान बनाएं",

        welcomeText:
            "अपना वर्तमान स्टेशन और गंतव्य चुनें। MetroMate आपको चरण-दर-चरण मार्गदर्शन करेगा।",

        currentStation:
            "आप अभी कहाँ हैं?",

        currentStationSub:
            "अपना वर्तमान मेट्रो स्टेशन चुनें",

        detectLocation:
            "मेरी लोकेशन पता करें",

        destination:
            "आप कहाँ जाना चाहते हैं?",

        destinationSub:
            "अपना गंतव्य चुनें",

        popularDestinations:
            "लोकप्रिय गंतव्य",

        voiceGuide:
            "आवाज़ मार्गदर्शन",

        showRoute:
            "मेरा मार्ग दिखाएं",

        yourJourney:
            "आपकी यात्रा"

    }

};


/* =========================================================
   METRO STATIONS
========================================================= */

const redLine = [

    "Centrepoint",
    "Emirates",
    "Airport Terminal 3",
    "Airport Terminal 1",
    "Al Garhoud",
    "City Centre Deira",
    "Al Rigga",
    "Union",
    "BurJuman",
    "ADCB",
    "max",
    "World Trade Center",
    "Emirates Towers",
    "Financial Centre",
    "Burj Khalifa / Dubai Mall",
    "Business Bay",
    "Garmin",
    "Equiti",
    "Mall of the Emirates",
    "InsuranceMarket",
    "Dubai Internet City",
    "Al Fardan Exchange",
    "Sobha Realty",
    "DMCC",
    "National Paints",
    "Ibn Battuta",
    "Energy",
    "Danube",
    "Life Pharmacy",
    "The Gardens",
    "Discovery Gardens",
    "Al Furjan",
    "Jumeirah Golf Estates",
    "Dubai Investment Park",
    "EXPO 2020"

];


const greenLine = [

    "e&",
    "Al Qusais",
    "Dubai Airport Free Zone",
    "Al Nahda",
    "Stadium",
    "Al Qiyadah",
    "Abu Hail",
    "Abu Baker Al Siddique",
    "Salah Al Din",
    "Union",
    "Baniyas Square",
    "Gold Souq",
    "Al Ras",
    "Al Gubaiba",
    "Sharaf DG",
    "BurJuman",
    "Oud Metha",
    "Dubai Healthcare City",
    "Al Jadaf",
    "Creek"

];


/* =========================================================
   GLOBAL STATE
========================================================= */

let currentLanguage = "en";

let selectedCurrentStation = null;

let selectedDestination = null;

let selectedPopupType = null;

let selectedLineFilter = "all";

let currentRoute = null;

let journeyIndex = 0;

let journeyStarted = false;

let watchId = null;

let lastAutoAnnouncedIndex = -1;

let lastDetectedStation = null;

let gpsAvailable = false;

let gpsAccuracy = null;

let detectionCandidate = null;

let detectionCount = 0;


/* =========================================================
   AUTOMATIC DETECTION SETTINGS
========================================================= */

const REQUIRED_DETECTIONS = 2;

const MAX_GPS_ACCURACY = 200;

/*
   400 metres is intentionally used because
   browser location can have significant error.
*/
const STATION_DETECTION_RADIUS = 400;


/* =========================================================
   DOM ELEMENTS
========================================================= */

const languageBtn =
    document.getElementById("languageBtn");

const languageMenu =
    document.getElementById("languageMenu");

const currentStationButton =
    document.getElementById("currentStationButton");

const destinationButton =
    document.getElementById("destinationButton");

const currentStationText =
    document.getElementById("currentStationText");

const destinationText =
    document.getElementById("destinationText");

const stationPopup =
    document.getElementById("stationPopup");

const popupTitle =
    document.getElementById("popupTitle");

const closePopup =
    document.getElementById("closePopup");

const stationSearch =
    document.getElementById("stationSearch");

const stationList =
    document.getElementById("stationList");

const lineTabs =
    document.getElementById("lineTabs");

const routeButton =
    document.getElementById("routeButton");

const routeResult =
    document.getElementById("routeResult");

const routeTitle =
    document.getElementById("routeTitle");

const routeBadge =
    document.getElementById("routeBadge");

const timeline =
    document.getElementById("timeline");

const startJourneyButton =
    document.getElementById("startJourneyButton");

const manualStationButton =
    document.getElementById("manualStationButton");

const journeyStatusTitle =
    document.getElementById("journeyStatusTitle");

const journeyStatusText =
    document.getElementById("journeyStatusText");

const trackingStatus =
    document.getElementById("trackingStatus");

const trackingStatusText =
    document.getElementById("trackingStatusText");

const nextStationName =
    document.getElementById("nextStationName");

const nextStationMessage =
    document.getElementById("nextStationMessage");

const journeyTipText =
    document.getElementById("journeyTipText");

const routeMessage =
    document.getElementById("routeMessage");

const voiceButton =
    document.getElementById("voiceButton");

const detectLocationButton =
    document.getElementById("detectLocationBtn");

const locationStatus =
    document.getElementById("locationStatus");


/* =========================================================
   LANGUAGE
========================================================= */

function setLanguage(language) {

    currentLanguage = language;

    document.documentElement.lang = language;

    languageBtn.textContent =
        language === "hi"
            ? "हिन्दी ▾"
            : "EN ▾";

    document
        .querySelectorAll("[data-i18n]")
        .forEach(element => {

            const key =
                element.getAttribute("data-i18n");

            if (
                translations[language] &&
                translations[language][key]
            ) {

                element.textContent =
                    translations[language][key];

            }

        });

    localStorage.setItem(
        "metromate-language",
        language
    );

    languageMenu.classList.remove("show");
}


const savedLanguage =
    localStorage.getItem("metromate-language");


if (savedLanguage === "hi") {

    setLanguage("hi");

} else {

    setLanguage("en");

}


languageBtn.addEventListener(
    "click",
    function(event) {

        event.stopPropagation();

        languageMenu.classList.toggle("show");

    }
);


document
    .querySelectorAll("[data-language]")
    .forEach(button => {

        button.addEventListener(
            "click",
            function() {

                setLanguage(
                    this.dataset.language
                );

            }
        );

    });


document.addEventListener(
    "click",
    function(event) {

        if (
            !event.target.closest(".language-wrapper")
        ) {

            languageMenu.classList.remove("show");

        }

    }
);


/* =========================================================
   STATION DATA
========================================================= */

function getAllStations() {

    const stations = [];

    redLine.forEach(
        (station, index) => {

            if (
                !stations.some(
                    item =>
                        item.name === station
                )
            ) {

                stations.push({

                    name: station,

                    line: "red",

                    index: index

                });

            }

        }
    );


    greenLine.forEach(
        (station, index) => {

            const existing =
                stations.find(
                    item =>
                        item.name === station
                );


            if (existing) {

                existing.line =
                    "interchange";

            } else {

                stations.push({

                    name: station,

                    line: "green",

                    index: index

                });

            }

        }
    );


    return stations;
}


/* =========================================================
   POPUP
========================================================= */

function openStationPopup(type) {

    selectedPopupType = type;

    popupTitle.textContent =
        type === "current"
            ? "Select Current Station"
            : "Select Destination";

    stationSearch.value = "";

    selectedLineFilter = "all";


    document
        .querySelectorAll(".line-tab")
        .forEach(tab => {

            tab.classList.remove("active");

        });


    const allTab =
        document.querySelector(
            '.line-tab[data-line="all"]'
        );


    if (allTab) {

        allTab.classList.add("active");

    }


    renderStationList();

    stationPopup.classList.add("show");

    setTimeout(
        () => stationSearch.focus(),
        100
    );
}


function closeStationPopup() {

    stationPopup.classList.remove("show");

}


currentStationButton.addEventListener(
    "click",
    function() {

        openStationPopup("current");

    }
);


destinationButton.addEventListener(
    "click",
    function() {

        openStationPopup("destination");

    }
);


closePopup.addEventListener(
    "click",
    closeStationPopup
);


stationPopup.addEventListener(
    "click",
    function(event) {

        if (
            event.target === stationPopup
        ) {

            closeStationPopup();

        }

    }
);


/* =========================================================
   STATION LIST
========================================================= */

function renderStationList() {

    const search =
        stationSearch.value
            .trim()
            .toLowerCase();


    const allStations =
        getAllStations();


    const filtered =
        allStations.filter(
            station => {

                const matchesSearch =
                    station.name
                        .toLowerCase()
                        .includes(search);


                const matchesLine =
                    selectedLineFilter === "all" ||
                    station.line === selectedLineFilter ||
                    (
                        station.line === "interchange" &&
                        (
                            selectedLineFilter === "red" ||
                            selectedLineFilter === "green"
                        )
                    );


                return (
                    matchesSearch &&
                    matchesLine
                );

            }
        );


    stationList.innerHTML = "";


    if (!filtered.length) {

        stationList.innerHTML = `
            <div class="no-stations">
                No stations found
            </div>
        `;

        return;

    }


    filtered.forEach(
        station => {

            const button =
                document.createElement("button");

            button.type = "button";

            button.className =
                "station-option";


            let lineText = "Red Line";

            let lineClass = "red";


            if (station.line === "green") {

                lineText = "Green Line";

                lineClass = "green";

            }


            if (
                station.line === "interchange"
            ) {

                lineText =
                    "Red + Green";

                lineClass =
                    "red";

            }


            button.innerHTML = `

                <span class="station-option-name">
                    ${station.name}
                </span>

                <span class="station-line ${lineClass}">
                    ${lineText}
                </span>

            `;


            button.addEventListener(
                "click",
                function() {

                    selectStation(
                        station.name
                    );

                }
            );


            stationList.appendChild(button);

        }
    );
}


stationSearch.addEventListener(
    "input",
    renderStationList
);


lineTabs.addEventListener(
    "click",
    function(event) {

        const tab =
            event.target.closest(".line-tab");


        if (!tab) return;


        selectedLineFilter =
            tab.dataset.line;


        document
            .querySelectorAll(".line-tab")
            .forEach(item => {

                item.classList.remove("active");

            });


        tab.classList.add("active");

        renderStationList();

    }
);


/* =========================================================
   SELECT STATION
========================================================= */

function selectStation(stationName) {

    if (
        selectedPopupType === "current"
    ) {

        selectedCurrentStation =
            stationName;

        currentStationText.textContent =
            stationName;

    } else {

        selectedDestination =
            stationName;

        destinationText.textContent =
            stationName;

    }


    closeStationPopup();

}


/* =========================================================
   POPULAR DESTINATIONS
========================================================= */

document
    .querySelectorAll(".destination-card")
    .forEach(card => {

        card.addEventListener(
            "click",
            function() {

                selectedDestination =
                    this.dataset.station;

                destinationText.textContent =
                    selectedDestination;


                destinationButton.scrollIntoView({
                    behavior: "smooth",
                    block: "center"
                });

            }
        );

    });


/* =========================================================
   ROUTE CALCULATION
========================================================= */

function findIndex(line, station) {

    return line.indexOf(station);

}


function buildSameLineRoute(
    line,
    start,
    destination,
    lineName
) {

    const startIndex =
        findIndex(line, start);

    const destinationIndex =
        findIndex(line, destination);


    if (
        startIndex === -1 ||
        destinationIndex === -1
    ) {

        return null;

    }


    const direction =
        destinationIndex >= startIndex
            ? 1
            : -1;


    const stations = [];


    for (
        let i = startIndex;
        ;
        i += direction
    ) {

        stations.push(line[i]);


        if (i === destinationIndex) {

            break;

        }

    }


    return {

        stations,

        line: lineName,

        interchange: false

    };

}


/* =========================================================
   INTERCHANGE ROUTES
========================================================= */

function buildInterchangeRoute(
    start,
    destination
) {

    const candidates = [];


    const interchangeStations = [
        "Union",
        "BurJuman"
    ];


    interchangeStations.forEach(
        interchange => {

            /* RED -> GREEN */

            if (
                redLine.includes(start) &&
                greenLine.includes(destination)
            ) {

                const redPart =
                    buildSameLineRoute(
                        redLine,
                        start,
                        interchange,
                        "Red Line"
                    );


                const greenPart =
                    buildSameLineRoute(
                        greenLine,
                        interchange,
                        destination,
                        "Green Line"
                    );


                if (
                    redPart &&
                    greenPart
                ) {

                    candidates.push({

                        stations:
                            redPart.stations.concat(
                                greenPart.stations.slice(1)
                            ),

                        line:
                            "Red → Green",

                        interchange: true,

                        interchangeStation:
                            interchange

                    });

                }

            }


            /* GREEN -> RED */

            if (
                greenLine.includes(start) &&
                redLine.includes(destination)
            ) {

                const greenPart =
                    buildSameLineRoute(
                        greenLine,
                        start,
                        interchange,
                        "Green Line"
                    );


                const redPart =
                    buildSameLineRoute(
                        redLine,
                        interchange,
                        destination,
                        "Red Line"
                    );


                if (
                    greenPart &&
                    redPart
                ) {

                    candidates.push({

                        stations:
                            greenPart.stations.concat(
                                redPart.stations.slice(1)
                            ),

                        line:
                            "Green → Red",

                        interchange: true,

                        interchangeStation:
                            interchange

                    });

                }

            }

        }
    );


    if (!candidates.length) {

        return null;

    }


    candidates.sort(
        (a, b) =>
            a.stations.length -
            b.stations.length
    );


    return candidates[0];

}


/* =========================================================
   FIND ROUTE
========================================================= */

function calculateRoute(
    start,
    destination
) {

    if (
        !start ||
        !destination
    ) {

        return null;

    }


    if (
        start === destination
    ) {

        return {

            stations: [start],

            line: "Current Station",

            interchange: false

        };

    }


    if (
        redLine.includes(start) &&
        redLine.includes(destination)
    ) {

        return buildSameLineRoute(
            redLine,
            start,
            destination,
            "Red Line"
        );

    }


    if (
        greenLine.includes(start) &&
        greenLine.includes(destination)
    ) {

        return buildSameLineRoute(
            greenLine,
            start,
            destination,
            "Green Line"
        );

    }


    return buildInterchangeRoute(
        start,
        destination
    );

}


/* =========================================================
   SHOW ROUTE
========================================================= */

routeButton.addEventListener(
    "click",
    function() {

        if (
            !selectedCurrentStation
        ) {

            alert(
                "Please select your current station."
            );

            return;

        }


        if (
            !selectedDestination
        ) {

            alert(
                "Please select your destination."
            );

            return;

        }


        currentRoute =
            calculateRoute(
                selectedCurrentStation,
                selectedDestination
            );


        if (!currentRoute) {

            routeResult.classList.add("show");

            routeMessage.textContent =
                "A route could not be calculated for these stations.";

            routeMessage.className =
                "route-message error";

            return;

        }


        journeyIndex = 0;

        journeyStarted = false;

        lastAutoAnnouncedIndex = -1;

        lastDetectedStation = null;

        detectionCandidate = null;

        detectionCount = 0;


        stopAutomaticTracking();


        renderRoute();


        routeResult.classList.add("show");


        routeResult.scrollIntoView({

            behavior: "smooth",

            block: "start"

        });

    }
);


/* =========================================================
   RENDER ROUTE
========================================================= */

function renderRoute() {

    const stations =
        currentRoute.stations;


    routeTitle.textContent =
        `${stations[0]} → ${stations[stations.length - 1]}`;


    routeBadge.className =
        "route-badge";


    if (
        currentRoute.interchange
    ) {

        routeBadge.textContent =
            "INTERCHANGE";

        routeBadge.classList.add(
            "interchange"
        );

    } else {

        routeBadge.textContent =
            currentRoute.line;

        routeBadge.classList.add(
            currentRoute.line === "Green Line"
                ? "green"
                : "red"
        );

    }


    timeline.innerHTML = "";


    stations.forEach(
        (station, index) => {

            const item =
                document.createElement("div");

            item.className =
                "live-station";


            if (index === 0) {

                item.classList.add(
                    "current"
                );

            }


            if (
                index === stations.length - 1
            ) {

                item.classList.add(
                    "destination"
                );

            }


            item.innerHTML = `
                <div class="live-station-circle"></div>
                <div class="live-station-name">${station}</div>
            `;

            if (redLine.includes(station)) item.classList.add("red-stop");
            if (greenLine.includes(station)) item.classList.add("green-stop");
            if (redLine.includes(station) && greenLine.includes(station)) item.classList.add("interchange-stop");


            timeline.appendChild(item);

        }
    );


    updateJourneyUI();

}


/* =========================================================
   UPDATE TIMELINE
========================================================= */

function updateTimeline() {

    const items =
        timeline.querySelectorAll(
            ".live-station"
        );


    items.forEach(
        (item, index) => {

            item.classList.remove(
                "completed",
                "current"
            );


            if (
                index < journeyIndex
            ) {

                item.classList.add(
                    "completed"
                );

            }


            if (
                index === journeyIndex
            ) {

                item.classList.add(
                    "current"
                );

            }

        }
    );

    if (window.MetroMateAdvanced) window.MetroMateAdvanced.updateTrain(journeyIndex);

}


/* =========================================================
   UPDATE JOURNEY UI
========================================================= */

function updateJourneyUI() {

    if (!currentRoute) return;


    updateTimeline();


    const stations =
        currentRoute.stations;


    const current =
        stations[journeyIndex];


    const next =
        stations[journeyIndex + 1];


    if (
        journeyIndex >=
        stations.length - 1
    ) {

        journeyStatusTitle.textContent =
            "Journey completed";

        journeyStatusText.textContent =
            `You have reached ${current}.`;


        nextStationName.textContent =
            "You arrived";


        nextStationMessage.textContent =
            `Your destination is ${current}.`;


        startJourneyButton.textContent =
            "✓ Journey Completed";


        startJourneyButton.disabled =
            true;


        trackingStatus.classList.remove(
            "active",
            "warning"
        );


        trackingStatusText.textContent =
            "Journey completed";


        return;

    }


    if (journeyStarted) {

        journeyStatusTitle.textContent =
            `You are at ${current}`;

        journeyStatusText.textContent =
            "Automatic journey tracking is active.";

    } else {

        journeyStatusTitle.textContent =
            `You are at ${current}`;

        journeyStatusText.textContent =
            "Start your journey to enable automatic tracking.";

    }


    nextStationName.textContent =
        next;


    nextStationMessage.textContent =
        `Next station after ${current}`;


    startJourneyButton.disabled =
        false;


    startJourneyButton.classList.remove(
        "stop"
    );


    startJourneyButton.textContent =
        journeyStarted
            ? "⏸ Stop Automatic Tracking"
            : "▶ Start Journey";


    journeyTipText.textContent =
        journeyStarted
            ? "MetroMate is monitoring your location. If GPS becomes unavailable, use the manual button."
            : "MetroMate will automatically detect your journey when location is available. If GPS is unavailable, use the manual button.";

}


/* =========================================================
   START / STOP JOURNEY
========================================================= */

startJourneyButton.addEventListener(
    "click",
    function() {

        if (!currentRoute) return;


        if (journeyStarted) {

            journeyStarted = false;

            stopAutomaticTracking();

            setTrackingStatus(
                "inactive",
                "Automatic tracking stopped"
            );

            updateJourneyUI();

            return;

        }


        journeyStarted = true;


        startAutomaticTracking();


        updateJourneyUI();


        speakCurrentStep();

    }
);


/* =========================================================
   MANUAL STATION BUTTON
========================================================= */

manualStationButton.addEventListener(
    "click",
    function() {

        if (
            !currentRoute ||
            !journeyStarted
        ) {

            if (!journeyStarted) {

                alert(
                    "Please start your journey first."
                );

            }

            return;

        }


        moveToNextStation(true);

    }
);


/* =========================================================
   MOVE TO NEXT STATION
========================================================= */

function moveToNextStation(
    manual = false
) {

    if (!currentRoute) return;


    if (
        journeyIndex >=
        currentRoute.stations.length - 1
    ) {

        return;

    }


    journeyIndex++;


    detectionCandidate = null;

    detectionCount = 0;


    const station =
        currentRoute.stations[journeyIndex];


    lastDetectedStation =
        station;


    updateJourneyUI();


    if (manual) {

        routeMessage.textContent =
            `Updated manually: You reached ${station}.`;

        routeMessage.className =
            "route-message success";

    } else {

        routeMessage.textContent =
            `Automatically detected: ${station}.`;

        routeMessage.className =
            "route-message success";

    }


    speakCurrentStep();


    if (
        journeyIndex >=
        currentRoute.stations.length - 1
    ) {

        stopAutomaticTracking();

        journeyStarted = false;

        trackingStatus.classList.remove(
            "active",
            "warning"
        );

        trackingStatusText.textContent =
            "Journey completed";

        startJourneyButton.textContent =
            "✓ Journey Completed";

    }

}


/* =========================================================
   VOICE
========================================================= */

voiceButton.addEventListener(
    "click",
    function() {

        if (!currentRoute) {

            speak(
                currentLanguage === "hi"
                    ? "कृपया पहले अपना मार्ग चुनें।"
                    : "Please select your route first."
            );

            return;

        }


        speakCurrentStep();

    }
);


function speakCurrentStep() {

    if (!currentRoute) return;


    const current =
        currentRoute.stations[
            journeyIndex
        ];


    const next =
        currentRoute.stations[
            journeyIndex + 1
        ];


    if (
        journeyIndex >=
        currentRoute.stations.length - 1
    ) {

        if (currentLanguage === "hi") {

            speak(
                `आप अपने गंतव्य ${current} पर पहुंच गए हैं।`
            );

        } else {

            speak(
                `You have reached your destination, ${current}.`
            );

        }

        return;

    }


    if (
        currentRoute.interchange &&
        current ===
            currentRoute.interchangeStation
    ) {

        if (currentLanguage === "hi") {

            speak(
                `${current} स्टेशन आ गया है। अब लाइन बदलें। अगला स्टेशन ${next} है।`
            );

        } else {

            speak(
                `You have reached ${current}. Change lines here. Your next station is ${next}.`
            );

        }

        return;

    }


    if (currentLanguage === "hi") {

        speak(
            `आप अभी ${current} स्टेशन पर हैं। अगला स्टेशन ${next} है।`
        );

    } else {

        speak(
            `You are at ${current}. Your next station is ${next}.`
        );

    }

}


function speak(text) {

    if (
        !("speechSynthesis" in window)
    ) {

        return;

    }


    window.speechSynthesis.cancel();


    const speech =
        new SpeechSynthesisUtterance(text);


    speech.lang =
        currentLanguage === "hi"
            ? "hi-IN"
            : "en-US";


    speech.rate = 0.9;

    speech.pitch = 1;

    speech.volume = 1;


    window.speechSynthesis.speak(
        speech
    );

}


/* =========================================================
   AUTOMATIC GPS TRACKING
========================================================= */

function startAutomaticTracking() {

    if (
        !navigator.geolocation
    ) {

        setTrackingStatus(
            "warning",
            "Location is not available — use manual tracking"
        );

        return;

    }


    watchId =
        navigator.geolocation.watchPosition(

            handleLocationUpdate,

            handleLocationError,

            {

                enableHighAccuracy: true,

                timeout: 15000,

                maximumAge: 5000

            }

        );


    setTrackingStatus(
        "active",
        "Automatic tracking active"
    );

}


/* =========================================================
   STOP GPS TRACKING
========================================================= */

function stopAutomaticTracking() {

    if (
        watchId !== null &&
        navigator.geolocation
    ) {

        navigator.geolocation.clearWatch(
            watchId
        );

    }


    watchId = null;

}


/* =========================================================
   LOCATION UPDATE
========================================================= */

function handleLocationUpdate(
    position
) {

    gpsAvailable = true;


    gpsAccuracy =
        Math.round(
            position.coords.accuracy
        );

    const nearestLive = findNearestKnownStation(
        position.coords.latitude,
        position.coords.longitude
    );
    if (window.MetroMateAdvanced) {
        window.MetroMateAdvanced.gps(position, nearestLive ? `${nearestLive.name} · ${Math.round(nearestLive.distance)} m` : null);
    }


    if (
        gpsAccuracy >
        MAX_GPS_ACCURACY
    ) {

        setTrackingStatus(
            "warning",
            `GPS available but accuracy is low (${gpsAccuracy} m)`
        );

        return;

    }


    setTrackingStatus(
        "active",
        `Automatic tracking active • GPS ±${gpsAccuracy} m`
    );


    if (!currentRoute) {

        return;

    }


    detectJourneyStation(

        position.coords.latitude,

        position.coords.longitude

    );

}


/* =========================================================
   LOCATION ERROR
========================================================= */

function handleLocationError(
    error
) {

    gpsAvailable = false;


    let message =
        "Location unavailable";


    if (
        error.code ===
        error.PERMISSION_DENIED
    ) {

        message =
            "Location permission denied — use manual tracking";

    }


    if (
        error.code ===
        error.POSITION_UNAVAILABLE
    ) {

        message =
            "GPS unavailable — manual tracking is available";

    }


    if (
        error.code ===
        error.TIMEOUT
    ) {

        message =
            "GPS timeout — waiting for location";

    }


    setTrackingStatus(
        "warning",
        message
    );
    if (window.MetroMateAdvanced) window.MetroMateAdvanced.gpsStandby("Waiting for GPS");

}


/* =========================================================
   AUTOMATIC STATION DETECTION
========================================================= */

function detectJourneyStation(
    latitude,
    longitude
) {

    if (
        !currentRoute ||
        !journeyStarted
    ) {

        return;

    }


    const possibleIndexes = [];


    for (
        let i = journeyIndex + 1;
        i <=
            Math.min(
                journeyIndex + 2,
                currentRoute.stations.length - 1
            );
        i++
    ) {

        possibleIndexes.push(i);

    }


    let closestIndex = null;

    let closestDistance =
        Infinity;


    possibleIndexes.forEach(
        index => {

            const station =
                currentRoute.stations[index];


            const coordinates =
                getStationCoordinates(
                    station
                );


            if (!coordinates) {

                return;

            }


            const distance =
                distanceInMeters(

                    latitude,

                    longitude,

                    coordinates.lat,

                    coordinates.lon

                );


            if (
                distance <
                closestDistance
            ) {

                closestDistance =
                    distance;

                closestIndex =
                    index;

            }

        }
    );


    if (
        closestIndex === null
    ) {

        return;

    }


    if (
        closestDistance >
        STATION_DETECTION_RADIUS
    ) {

        detectionCandidate = null;

        detectionCount = 0;

        return;

    }


    const detectedStation =
        currentRoute.stations[
            closestIndex
        ];


    if (
        detectionCandidate ===
        detectedStation
    ) {

        detectionCount++;

    } else {

        detectionCandidate =
            detectedStation;

        detectionCount = 1;

    }


    if (
        detectionCount >=
        REQUIRED_DETECTIONS
    ) {

        if (
            closestIndex >
            journeyIndex
        ) {

            /*
               Never skip stations automatically.
            */

            if (
                closestIndex ===
                journeyIndex + 1
            ) {

                moveToNextStation(false);

            }

        }

        detectionCandidate = null;

        detectionCount = 0;

    }

}


/* =========================================================
   HAVERSINE DISTANCE
========================================================= */

function distanceInMeters(
    lat1,
    lon1,
    lat2,
    lon2
) {

    const earthRadius =
        6371000;


    const latDifference =
        toRadians(lat2 - lat1);


    const lonDifference =
        toRadians(lon2 - lon1);


    const a =
        Math.sin(
            latDifference / 2
        ) ** 2 +

        Math.cos(
            toRadians(lat1)
        ) *

        Math.cos(
            toRadians(lat2)
        ) *

        Math.sin(
            lonDifference / 2
        ) ** 2;


    const c =
        2 *

        Math.atan2(
            Math.sqrt(a),
            Math.sqrt(1 - a)
        );


    return earthRadius * c;

}


function toRadians(
    degrees
) {

    return degrees *
        Math.PI /
        180;

}


/* =========================================================
   DUBAI METRO STATION COORDINATES
========================================================= */

/*
   These are station-area coordinates used by the
   browser location detector.

   Coordinate sources include public
   OpenStreetMap-derived station records,
   Wikidata and public station map databases.

   They are intentionally used as station-center
   reference points rather than exact platform GPS
   positions.

   RTA station names/codes are kept separately in
   redLine and greenLine above.
*/

const STATION_COORDINATES = {

    /* =========================
       RED LINE
    ========================= */

    "Centrepoint": {
        lat: 25.23034,
        lon: 55.39098
    },

    "Emirates": {
        lat: 25.21780,
        lon: 55.40100
    },

    "Airport Terminal 3": {
        lat: 25.24880,
        lon: 55.36810
    },

    "Airport Terminal 1": {
        lat: 25.24900,
        lon: 55.35750
    },

    "Al Garhoud": {
        lat: 25.24450,
        lon: 55.35170
    },

    "City Centre Deira": {
        lat: 25.25470,
        lon: 55.33040
    },

    "Al Rigga": {
        lat: 25.26320,
        lon: 55.33120
    },

    "Union": {
        lat: 25.26600,
        lon: 55.31360
    },

    "BurJuman": {
        lat: 25.25440,
        lon: 55.30412
    },

    "ADCB": {
        lat: 25.24440,
        lon: 55.29670
    },

    "max": {
        lat: 25.23530,
        lon: 55.29630
    },

    "World Trade Center": {
        lat: 25.22500,
        lon: 55.28950
    },

    "Emirates Towers": {
        lat: 25.21780,
        lon: 55.28210
    },

    "Financial Centre": {
        lat: 25.21140,
        lon: 55.27700
    },

    "Burj Khalifa / Dubai Mall": {
        lat: 25.19720,
        lon: 55.27400
    },

    "Business Bay": {
        lat: 25.18740,
        lon: 55.26250
    },

    "Garmin": {
        lat: 25.15565,
        lon: 55.22850
    },

    "Equiti": {
        lat: 25.12668,
        lon: 55.20792
    },

    "Mall of the Emirates": {
        lat: 25.12120,
        lon: 55.20050
    },

    "InsuranceMarket": {
        lat: 25.11477,
        lon: 55.19089
    },

    "Dubai Internet City": {
        lat: 25.10217,
        lon: 55.17390
    },

    "Al Fardan Exchange": {
        lat: 25.08892,
        lon: 55.15817
    },

    "Sobha Realty": {
        lat: 25.07995,
        lon: 55.14759
    },

    "DMCC": {
        lat: 25.06940,
        lon: 55.14030
    },

    "National Paints": {
        lat: 25.03640,
        lon: 55.11860
    },

    "Ibn Battuta": {
        lat: 25.04420,
        lon: 55.12060
    },

    "Energy": {
        lat: 25.01080,
        lon: 55.10040
    },

    "Danube": {
        lat: 24.99860,
        lon: 55.09150
    },

    "Life Pharmacy": {
        lat: 24.96090,
        lon: 55.14810
    },

    "The Gardens": {
        lat: 25.02620,
        lon: 55.13310
    },

    "Discovery Gardens": {
        lat: 25.03720,
        lon: 55.14070
    },

    "Al Furjan": {
        lat: 25.02190,
        lon: 55.14920
    },

    "Jumeirah Golf Estates": {
        lat: 25.01779,
        lon: 55.16334
    },

    "Dubai Investment Park": {
        lat: 24.98290,
        lon: 55.14500
    },

    "EXPO 2020": {
        lat: 24.96080,
        lon: 55.14890
    },


    /* =========================
       GREEN LINE
    ========================= */

    "e&": {
        lat: 25.25476,
        lon: 55.40101
    },

    "Al Qusais": {
        lat: 25.26274,
        lon: 55.38727
    },

    "Dubai Airport Free Zone": {
        lat: 25.26990,
        lon: 55.37500
    },

    "Al Nahda": {
        lat: 25.27670,
        lon: 55.36600
    },

    "Stadium": {
        lat: 25.27785,
        lon: 55.36163
    },

    "Al Qiyadah": {
        lat: 25.27590,
        lon: 55.34850
    },

    "Abu Hail": {
        lat: 25.27340,
        lon: 55.34200
    },

    "Abu Baker Al Siddique": {
        lat: 25.26980,
        lon: 55.33700
    },

    "Salah Al Din": {
        lat: 25.26920,
        lon: 55.32480
    },

    "Baniyas Square": {
        lat: 25.26950,
        lon: 55.30890
    },

    "Gold Souq": {
        lat: 25.27300,
        lon: 55.30200
    },

    "Al Ras": {
        lat: 25.26690,
        lon: 55.29700
    },

    "Al Gubaiba": {
        lat: 25.25800,
        lon: 55.28740
    },

    "Sharaf DG": {
        lat: 25.25360,
        lon: 55.28370
    },

    "Oud Metha": {
        lat: 25.24370,
        lon: 55.30900
    },

    "Dubai Healthcare City": {
        lat: 25.23580,
        lon: 55.31800
    },

    "Al Jadaf": {
        lat: 25.22400,
        lon: 55.33400
    },

    "Creek": {
        lat: 25.21090,
        lon: 55.34470
    }

};


/* =========================================================
   GET STATION COORDINATES
========================================================= */

function getStationCoordinates(
    stationName
) {

    return STATION_COORDINATES[
        stationName
    ] || null;

}


/* =========================================================
   TRACKING STATUS
========================================================= */

function setTrackingStatus(
    type,
    message
) {

    trackingStatus.classList.remove(
        "active",
        "warning"
    );


    if (type === "active") {

        trackingStatus.classList.add(
            "active"
        );

    }


    if (type === "warning") {

        trackingStatus.classList.add(
            "warning"
        );

    }


    trackingStatusText.textContent =
        message;

}


/* =========================================================
   DETECT MY LOCATION BUTTON
========================================================= */

detectLocationButton.addEventListener(
    "click",
    function() {

        detectCurrentLocation();

    }
);


function detectCurrentLocation() {

    if (
        !navigator.geolocation
    ) {

        showLocationStatus(
            "Location is not supported by this browser.",
            "error"
        );

        return;

    }


    detectLocationButton.classList.add(
        "detecting"
    );


    showLocationStatus(
        "Detecting your location...",
        ""
    );


    navigator.geolocation.getCurrentPosition(

        function(position) {

            detectLocationButton.classList.remove(
                "detecting"
            );


            const latitude =
                position.coords.latitude;


            const longitude =
                position.coords.longitude;


            const accuracy =
                Math.round(
                    position.coords.accuracy
                );


            gpsAccuracy =
                accuracy;


            gpsAvailable =
                true;


            const nearest =
                findNearestKnownStation(
                    latitude,
                    longitude
                );

            if (window.MetroMateAdvanced) {
                window.MetroMateAdvanced.gps(position, nearest ? `${nearest.name} · ${Math.round(nearest.distance)} m` : null);
            }


            if (nearest) {

                showLocationStatus(

                    `Nearest known station: ${nearest.name} (${Math.round(nearest.distance)} m away).`,

                    "success"

                );


                selectedCurrentStation =
                    nearest.name;

                currentStationText.textContent =
                    nearest.name;

            } else {

                showLocationStatus(

                    `GPS location found. Accuracy: about ${accuracy} metres. Please select your station manually.`,

                    "success"

                );

            }

        },


        function(error) {

            detectLocationButton.classList.remove(
                "detecting"
            );


            let message =
                "Unable to detect your location.";


            if (
                error.code ===
                error.PERMISSION_DENIED
            ) {

                message =
                    "Location permission denied. Please allow location access or select your station manually.";

            }


            if (
                error.code ===
                error.POSITION_UNAVAILABLE
            ) {

                message =
                    "Location is currently unavailable. Please select your station manually.";

            }


            if (
                error.code ===
                error.TIMEOUT
            ) {

                message =
                    "Location detection timed out. Please try again or select your station manually.";

            }


            showLocationStatus(
                message,
                "error"
            );

        },


        {

            enableHighAccuracy: true,

            timeout: 15000,

            maximumAge: 5000

        }

    );

}


/* =========================================================
   FIND NEAREST KNOWN STATION
========================================================= */

function findNearestKnownStation(
    latitude,
    longitude
) {

    let nearest = null;


    Object.entries(
        STATION_COORDINATES
    ).forEach(
        ([name, coordinates]) => {

            const distance =
                distanceInMeters(

                    latitude,

                    longitude,

                    coordinates.lat,

                    coordinates.lon

                );


            if (
                !nearest ||
                distance <
                nearest.distance
            ) {

                nearest = {

                    name,

                    distance

                };

            }

        }
    );


    return nearest;

}


/* =========================================================
   LOCATION MESSAGE
========================================================= */

function showLocationStatus(
    message,
    type
) {

    locationStatus.textContent =
        message;


    locationStatus.className =
        "location-status";


    if (type) {

        locationStatus.classList.add(
            type
        );

    }

}


/* =========================================================
   PAGE LOAD
========================================================= */

setTrackingStatus(
    "inactive",
    "Automatic tracking inactive"
);


/* =========================================================
   CLEANUP
========================================================= */

window.addEventListener(
    "beforeunload",
    function() {

        stopAutomaticTracking();

    }
);