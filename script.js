/* =========================================================
   FOODMATCH TAIWAN
   COMPLETE APPLICATION LOGIC
========================================================= */

"use strict";


/* =========================================================
   STORAGE
========================================================= */

const STORAGE = {

    preferences:
        "foodmatch_preferences_v4",

    favorites:
        "foodmatch_favorites_v4",

    settings:
        "foodmatch_settings_v4",

    profile:
        "foodmatch_profile_v4",

    recent:
        "foodmatch_recent_v4"

};


/* =========================================================
   DEFAULTS
========================================================= */

const DEFAULT_PREFERENCES = {

    diet:
        "none",

    restriction:
        "none",

    budget:
        "any",

    cuisine:
        "any",

    location:
        "nearby"

};


const DEFAULT_SETTINGS = {

    theme:
        "system",

    accent:
        "saffron",

    language:
        "en",

    reduceMotion:
        false,

    largeText:
        false,

    rememberPreferences:
        true

};


const CITY_COORDINATES = {

    Taipei: {
        latitude: 25.0330,
        longitude: 121.5654
    },

    "New Taipei": {
        latitude: 25.0116,
        longitude: 121.4617
    },

    Taoyuan: {
        latitude: 24.9937,
        longitude: 121.3010
    },

    Taichung: {
        latitude: 24.1477,
        longitude: 120.6736
    },

    Tainan: {
        latitude: 22.9998,
        longitude: 120.2269
    },

    Kaohsiung: {
        latitude: 22.6273,
        longitude: 120.3014
    }

};


/* =========================================================
   STATE
========================================================= */

const state = {

    activeView:
        "home",

    userLocation:
        null,

    nearbyRadius:
        3,

    liveRestaurants:
        [],

    matchedRestaurants:
        [],

    activeMatchFilter:
        "all",

    activeNearbyFilter:
        "all",

    preferences: {
        ...DEFAULT_PREFERENCES,
        ...readStorage(
            STORAGE.preferences,
            {}
        )
    },

    settings: {
        ...DEFAULT_SETTINGS,
        ...readStorage(
            STORAGE.settings,
            {}
        )
    },

    profile: {
        name:
            readStorage(
                STORAGE.profile,
                {}
            )?.name ||
            "Food Explorer"
    },

    favorites:
        {},

    recent:
        readStorage(
            STORAGE.recent,
            []
        )

};


const savedFavorites =
    readStorage(
        STORAGE.favorites,
        []
    );


if (Array.isArray(savedFavorites)) {

    savedFavorites.forEach(
        restaurant => {

            if (
                restaurant &&
                restaurant.uid
            ) {

                state.favorites[
                    restaurant.uid
                ] =
                    restaurant;

            }

        }
    );

}


/* =========================================================
   SELECTORS
========================================================= */

const $ = (
    selector,
    parent = document
) =>
    parent.querySelector(
        selector
    );


const $$ = (
    selector,
    parent = document
) =>
    [
        ...parent.querySelectorAll(
            selector
        )
    ];


/* =========================================================
   TRANSLATIONS
========================================================= */

const TRANSLATIONS = {

    en: {

        home:
            "Home",

        findFood:
            "Find Food",

        nearby:
            "Nearby",

        favorites:
            "Favorites",

        profile:
            "Profile",

        findMyFood:
            "Find My Food",

        exploreNearby:
            "Explore Nearby",

        saved:
            "Saved",

        settings:
            "Settings"

    },


    zh: {

        home:
            "首頁",

        findFood:
            "尋找美食",

        nearby:
            "附近",

        favorites:
            "收藏",

        profile:
            "個人資料",

        findMyFood:
            "尋找我的美食",

        exploreNearby:
            "探索附近",

        saved:
            "已收藏",

        settings:
            "設定"

    }

};


/* =========================================================
   INIT
========================================================= */

window.addEventListener(
    "DOMContentLoaded",
    init
);


function init() {

    applySettings();

    syncPreferenceControls();

    syncSettingsControls();

    syncProfileControls();

    bindNavigation();

    bindPreferences();

    bindLocation();

    bindFilters();

    bindFavoritesAndRestaurantActions();

    bindModals();

    bindQuickMenu();

    bindCommandPalette();

    bindKeyboardShortcuts();

    bindSettings();

    bindProfile();

    bindMiscellaneous();

    renderFavorites();

    renderProfile();

    updateFavoriteCount();

    setView(
        "home",
        {
            scroll:
                false
        }
    );

}


/* =========================================================
   STORAGE
========================================================= */

function readStorage(
    key,
    fallback
) {

    try {

        const raw =
            localStorage.getItem(
                key
            );

        if (!raw) {
            return fallback;
        }

        return JSON.parse(
            raw
        );

    }

    catch (error) {

        console.warn(
            "Storage read error:",
            error
        );

        return fallback;

    }

}


function writeStorage(
    key,
    value
) {

    try {

        localStorage.setItem(
            key,
            JSON.stringify(
                value
            )
        );

        return true;

    }

    catch (error) {

        console.warn(
            "Storage write error:",
            error
        );

        return false;

    }

}


/* =========================================================
   NAVIGATION
========================================================= */

function bindNavigation() {

    document.addEventListener(
        "click",
        event => {

            const button =
                event.target.closest(
                    "[data-view]"
                );

            if (!button) {
                return;
            }

            const view =
                button.dataset.view;

            if (!view) {
                return;
            }

            event.preventDefault();

            setView(
                view
            );

            closeQuickMenu();

            closeModal(
                "commandModal"
            );

        }
    );

}


function setView(
    view,
    options = {}
) {

    const validViews = [

        "home",

        "find",

        "nearby",

        "favorites",

        "profile",

        "settings"

    ];


    if (
        !validViews.includes(
            view
        )
    ) {

        view =
            "home";

    }


    state.activeView =
        view;


    $$(".view-section")
        .forEach(
            section => {

                section.classList.toggle(
                    "active",

                    section.dataset.viewSection ===
                    view
                );

            }
        );


    $$(
        ".nav-link, .mobile-nav-link"
    ).forEach(
        button => {

            button.classList.toggle(
                "active",

                button.dataset.view ===
                view
            );

        }
    );


    if (
        view ===
        "favorites"
    ) {

        renderFavorites();

    }


    if (
        view ===
        "profile"
    ) {

        renderProfile();

    }


    updatePageTitle(
        view
    );


    if (
        options.scroll !==
        false
    ) {

        window.scrollTo({

            top:
                0,

            behavior:
                state.settings.reduceMotion
                    ? "auto"
                    : "smooth"

        });

    }

}


function updatePageTitle(
    view
) {

    const titles = {

        home:
            "FoodMatch Taiwan",

        find:
            "Find Food — FoodMatch Taiwan",

        nearby:
            "Nearby — FoodMatch Taiwan",

        favorites:
            "Favorites — FoodMatch Taiwan",

        profile:
            "Profile — FoodMatch Taiwan",

        settings:
            "Settings — FoodMatch Taiwan"

    };


    document.title =
        titles[view] ||
        titles.home;

}


/* =========================================================
   PREFERENCES
========================================================= */

function bindPreferences() {

    [

        "#dietPreference",

        "#foodRestriction",

        "#budget",

        "#cuisine",

        "#locationPreference"

    ]
        .forEach(
            selector => {

                const element =
                    $(selector);

                if (!element) {
                    return;
                }

                element.addEventListener(
                    "change",
                    handlePreferenceChange
                );

            }
        );


    $$(".category-chip")
        .forEach(
            button => {

                button.addEventListener(
                    "click",
                    handleCategoryShortcut
                );

            }
        );


    $("#findMyMatch")?.addEventListener(
        "click",
        findFood
    );


    $("#refreshMatches")?.addEventListener(
        "click",
        findFood
    );


    $("#dishSearch")?.addEventListener(
        "keydown",
        event => {

            if (
                event.key ===
                "Enter"
            ) {

                event.preventDefault();

                findFood();

            }

        }
    );

}


function handlePreferenceChange(
    event
) {

    const id =
        event.target.id;

    const value =
        event.target.value;


    if (
        id ===
        "dietPreference"
    ) {

        state.preferences.diet =
            value;

    }


    if (
        id ===
        "foodRestriction"
    ) {

        state.preferences.restriction =
            value;

    }


    if (
        id ===
        "budget"
    ) {

        state.preferences.budget =
            value;

    }


    if (
        id ===
        "cuisine"
    ) {

        state.preferences.cuisine =
            value;

    }


    if (
        id ===
        "locationPreference"
    ) {

        state.preferences.location =
            value;

        handleLocationPreference(
            value
        );

    }


    savePreferences();

    renderProfile();

}


function handleCategoryShortcut(
    event
) {

    const button =
        event.currentTarget;

    const cuisine =
        button.dataset.cuisineShortcut;

    const diet =
        button.dataset.dietShortcut;


    if (cuisine) {

        state.preferences.cuisine =
            cuisine;

    }


    if (diet) {

        state.preferences.diet =
            diet;

    }


    syncPreferenceControls();

    savePreferences();

    setView(
        "find"
    );

    showToast(
        cuisine
            ? `${cuisine} cuisine selected.`
            : `${capitalize(diet)} selected.`
    );

}


function syncPreferenceControls() {

    const map = {

        "#dietPreference":
            state.preferences.diet,

        "#foodRestriction":
            state.preferences.restriction,

        "#budget":
            state.preferences.budget,

        "#cuisine":
            state.preferences.cuisine,

        "#locationPreference":
            state.preferences.location

    };


    Object.entries(
        map
    )
        .forEach(
            ([selector, value]) => {

                const element =
                    $(selector);

                if (
                    element &&
                    [...element.options]
                        .some(
                            option =>
                                option.value ===
                                value
                        )
                ) {

                    element.value =
                        value;

                }

            }
        );

}


function savePreferences() {

    if (
        !state.settings
            .rememberPreferences
    ) {

        localStorage.removeItem(
            STORAGE.preferences
        );

        setPreferenceStatus(
            "Preferences are temporary."
        );

        return;

    }


    writeStorage(
        STORAGE.preferences,
        state.preferences
    );

    setPreferenceStatus(
        "✓ Saved automatically"
    );

}


function setPreferenceStatus(
    text
) {

    const element =
        $("#preferenceSaveStatus");

    if (element) {
        element.textContent =
            text;
    }

}


/* =========================================================
   LOCATION
========================================================= */

function bindLocation() {

    $("#useMyLocation")
        ?.addEventListener(
            "click",
            useMyLocation
        );


    $("#nearbyUseLocation")
        ?.addEventListener(
            "click",
            useMyLocation
        );


    $("#nearbyRadius")
        ?.addEventListener(
            "change",
            async event => {

                state.nearbyRadius =
                    Number(
                        event.target.value
                    );


                if (
                    state.userLocation
                ) {

                    await loadNearbyRestaurants(
                        state.userLocation.latitude,
                        state.userLocation.longitude,
                        state.nearbyRadius
                    );

                }

            }
        );


    $("#refreshNearby")
        ?.addEventListener(
            "click",
            async () => {

                if (
                    !state.userLocation
                ) {

                    showToast(
                        "Choose a location first."
                    );

                    setView(
                        "find"
                    );

                    return;

                }


                await loadNearbyRestaurants(
                    state.userLocation.latitude,
                    state.userLocation.longitude,
                    state.nearbyRadius
                );

            }
        );

}


function handleLocationPreference(
    value
) {

    if (
        value ===
        "nearby"
    ) {

        if (
            state.userLocation
        ) {

            loadNearbyRestaurants(
                state.userLocation.latitude,
                state.userLocation.longitude,
                state.nearbyRadius
            );

        }

        else {

            setLocationStatus(
                "Use My Location to search around you."
            );

        }

        return;

    }


    if (
        value ===
        "anywhere"
    ) {

        state.userLocation =
            null;

        setLocationStatus(
            "Select a Taiwan city or use your location."
        );

        renderNearbyEmpty();

        return;

    }


    const coordinates =
        CITY_COORDINATES[value];

    if (!coordinates) {
        return;
    }


    state.userLocation = {

        latitude:
            coordinates.latitude,

        longitude:
            coordinates.longitude,

        source:
            "city",

        city:
            value

    };


    setLocationStatus(
        `Using ${value} as the search location.`
    );


    loadNearbyRestaurants(
        coordinates.latitude,
        coordinates.longitude,
        state.nearbyRadius
    );

}


function useMyLocation() {

    if (
        !navigator.geolocation
    ) {

        showToast(
            "Geolocation is not supported."
        );

        return;

    }


    setLocationStatus(
        "📍 Finding your location…"
    );


    setNearbyStatus(
        "📍 Finding your location…"
    );


    navigator.geolocation.getCurrentPosition(

        async position => {

            const latitude =
                position.coords.latitude;

            const longitude =
                position.coords.longitude;


            state.userLocation = {

                latitude,

                longitude,

                source:
                    "device"

            };


            state.preferences.location =
                "nearby";

            syncPreferenceControls();

            savePreferences();


            setLocationStatus(
                `✓ Location found. Searching within ${state.nearbyRadius} km.`
            );


            await loadNearbyRestaurants(
                latitude,
                longitude,
                state.nearbyRadius
            );


            showToast(
                "Location found."
            );

        },


        error => {

            console.warn(
                error
            );


            let message =
                "Could not access your location.";

            if (
                error.code ===
                1
            ) {

                message =
                    "Location permission was denied.";

            }

            if (
                error.code ===
                2
            ) {

                message =
                    "Location could not be determined.";

            }

            if (
                error.code ===
                3
            ) {

                message =
                    "Location request timed out.";

            }


            setLocationStatus(
                message
            );

            setNearbyStatus(
                message,
                "error"
            );

            showToast(
                message
            );

        },

        {

            enableHighAccuracy:
                true,

            timeout:
                12000,

            maximumAge:
                300000

        }

    );

}


function setLocationStatus(
    message
) {

    const element =
        $("#locationStatus");

    if (element) {
        element.textContent =
            message;
    }

}


function setNearbyStatus(
    message,
    type = ""
) {

    const element =
        $("#nearbyStatus");

    if (!element) {
        return;
    }


    element.textContent =
        message;

    element.classList.remove(
        "success",
        "error"
    );


    if (type) {
        element.classList.add(
            type
        );
    }

}


/* =========================================================
   OPENSTREETMAP
========================================================= */

async function loadNearbyRestaurants(
    latitude,
    longitude,
    radiusKm = 3
) {

    const radiusMeters =
        Math.round(
            radiusKm * 1000
        );


    setNearbyStatus(
        `Searching within ${radiusKm} km…`
    );


    renderLoading(
        $("#nearbyRestaurants")
    );


    const query = `

[out:json][timeout:25];

(
  node["amenity"="restaurant"](around:${radiusMeters},${latitude},${longitude});
  way["amenity"="restaurant"](around:${radiusMeters},${latitude},${longitude});
  relation["amenity"="restaurant"](around:${radiusMeters},${latitude},${longitude});

  node["amenity"="fast_food"](around:${radiusMeters},${latitude},${longitude});
  way["amenity"="fast_food"](around:${radiusMeters},${latitude},${longitude});
);

out center tags;

`;


    const endpoints = [

        "https://overpass-api.de/api/interpreter",

        "https://overpass.kumi.systems/api/interpreter",

        "https://overpass.private.coffee/api/interpreter"

    ];


    let data =
        null;

    let lastError =
        null;


    for (
        const endpoint
        of endpoints
    ) {

        try {

            const controller =
                new AbortController();

            const timer =
                setTimeout(
                    () =>
                        controller.abort(),
                    18000
                );


            const response =
                await fetch(
                    `${endpoint}?data=${encodeURIComponent(query)}`,
                    {
                        signal:
                            controller.signal
                    }
                );


            clearTimeout(
                timer
            );


            if (
                !response.ok
            ) {

                throw new Error(
                    `HTTP ${response.status}`
                );

            }


            data =
                await response.json();

            break;

        }

        catch (
            error
        ) {

            lastError =
                error;

        }

    }


    if (!data) {

        console.error(
            "Overpass failure:",
            lastError
        );


        state.liveRestaurants =
            [];

        state.matchedRestaurants =
            [];


        setNearbyStatus(
            "Restaurant data could not be loaded. Try Refresh again.",
            "error"
        );


        renderRestaurantError(
            $("#nearbyRestaurants")
        );


        renderMatchError();

        return false;

    }


    const restaurants =
        Array.isArray(
            data.elements
        )
            ? data.elements
                .map(
                    element =>
                        mapOsmRestaurant(
                            element,
                            latitude,
                            longitude
                        )
                )
                .filter(
                    Boolean
                )
            : [];


    state.liveRestaurants =
        removeDuplicateRestaurants(
            restaurants
        );


    state.liveRestaurants
        .sort(
            (a, b) =>
                a.distanceKm -
                b.distanceKm
        );


    setNearbyStatus(

        state.liveRestaurants.length

            ? `${state.liveRestaurants.length} restaurants found within ${radiusKm} km.`

            : "No restaurants found in this area.",

        state.liveRestaurants.length
            ? "success"
            : ""

    );


    renderNearbyRestaurants();

    renderProfile();

    return true;

}


function mapOsmRestaurant(
    element,
    originLat,
    originLon
) {

    const tags =
        element.tags ||
        {};


    const name =
        String(
            tags.name ||
            tags["name:en"] ||
            tags["name:zh"] ||
            "Unnamed restaurant"
        ).trim();


    let latitude =
        Number(
            element.lat
        );

    let longitude =
        Number(
            element.lon
        );


    if (
        !Number.isFinite(
            latitude
        ) ||
        !Number.isFinite(
            longitude
        )
    ) {

        latitude =
            Number(
                element.center?.lat
            );

        longitude =
            Number(
                element.center?.lon
            );

    }


    if (
        !Number.isFinite(
            latitude
        ) ||
        !Number.isFinite(
            longitude
        )
    ) {

        return null;

    }


    const cuisine =
        String(
            tags.cuisine ||
            ""
        ).trim();


    const image =
        safeExternalUrl(
            tags.image ||
            tags["contact:image"] ||
            ""
        );


    const website =
        safeExternalUrl(
            tags.website ||
            tags["contact:website"] ||
            ""
        );


    const menuUrl =
        safeExternalUrl(
            tags["website:menu"] ||
            tags["contact:website:menu"] ||
            ""
        );


    const distanceKm =
        calculateDistanceKm(
            originLat,
            originLon,
            latitude,
            longitude
        );


    return {

        uid:
            `${element.type}-${element.id}`,

        name,

        cuisine,

        latitude,

        longitude,

        distanceKm,

        image,

        website,

        menuUrl,

        address:
            formatAddress(
                tags
            ),

        openingHours:
            String(
                tags.opening_hours ||
                ""
            ).trim(),

        vegetarian:
            normaliseTag(
                tags["diet:vegetarian"]
            ),

        vegan:
            normaliseTag(
                tags["diet:vegan"]
            ),

        phone:
            String(
                tags.phone ||
                tags["contact:phone"] ||
                ""
            ),

        amenity:
            tags.amenity ||
            "restaurant",

        rawTags:
            tags

    };

}


function removeDuplicateRestaurants(
    restaurants
) {

    const map =
        new Map();


    restaurants.forEach(
        restaurant => {

            const key =

                normaliseSearchText(
                    restaurant.name
                ) +

                "|" +

                restaurant.latitude.toFixed(
                    4
                ) +

                "|" +

                restaurant.longitude.toFixed(
                    4
                );


            if (!map.has(key)) {

                map.set(
                    key,
                    restaurant
                );

            }

        }
    );


    return [
        ...map.values()
    ];

}


/* =========================================================
   MATCHING
========================================================= */

async function findFood() {

    const preferences =
        getPreferences();


    if (
        !state.liveRestaurants.length
    ) {

        if (
            !state.userLocation
        ) {

            if (
                preferences.location !==
                "anywhere"
            ) {

                handleLocationPreference(
                    preferences.location
                );

            }


            if (
                !state.userLocation
            ) {

                showToast(
                    "Choose a city or use your location first."
                );

                return;

            }

        }


        const success =
            await loadNearbyRestaurants(
                state.userLocation.latitude,
                state.userLocation.longitude,
                state.nearbyRadius
            );


        if (!success) {
            return;
        }

    }


    state.matchedRestaurants =
        state.liveRestaurants
            .map(
                restaurant => {

                    const ranking =
                        rankRestaurant(
                            restaurant,
                            preferences
                        );

                    return {

                        ...restaurant,

                        matchScore:
                            ranking.score,

                        matchBreakdown:
                            ranking.breakdown,

                        matchReasons:
                            ranking.reasons

                    };

                }
            );


    applyMatchFiltersAndSort();

    setView(
        "find"
    );


    const section =
        $("#matchResultsSection");


    section?.classList.remove(
        "hidden"
    );


    setTimeout(
        () => {

            section?.scrollIntoView(
                {
                    behavior:
                        state.settings.reduceMotion
                            ? "auto"
                            : "smooth",
                    block:
                        "start"
                }
            );

        },
        80
    );


    showToast(
        `${state.matchedRestaurants.length} restaurants matched.`
    );

}


function getPreferences() {

    state.preferences = {

        diet:
            $("#dietPreference")
                ?.value ||
            "none",

        restriction:
            $("#foodRestriction")
                ?.value ||
            "none",

        budget:
            $("#budget")
                ?.value ||
            "any",

        cuisine:
            $("#cuisine")
                ?.value ||
            "any",

        location:
            $("#locationPreference")
                ?.value ||
            "nearby"

    };


    savePreferences();

    return {
        ...state.preferences
    };

}


function rankRestaurant(
    restaurant,
    preferences
) {

    let score =
        40;


    const reasons =
        [];


    const breakdown = {

        distance:
            0,

        cuisine:
            0,

        diet:
            0,

        search:
            0

    };


    /* DISTANCE */

    if (
        restaurant.distanceKm <=
        .8
    ) {

        breakdown.distance =
            20;

        score +=
            20;

        reasons.push(
            "Very close to you"
        );

    }

    else if (
        restaurant.distanceKm <=
        1.5
    ) {

        breakdown.distance =
            15;

        score +=
            15;

        reasons.push(
            "Close to you"
        );

    }

    else if (
        restaurant.distanceKm <=
        3
    ) {

        breakdown.distance =
            10;

        score +=
            10;

    }

    else {

        breakdown.distance =
            5;

        score +=
            5;

    }


    /* CUISINE */

    if (
        preferences.cuisine ===
        "any"
    ) {

        breakdown.cuisine =
            10;

        score +=
            10;

    }

    else if (
        restaurantCuisineMatches(
            restaurant.cuisine,
            preferences.cuisine
        )
    ) {

        breakdown.cuisine =
            25;

        score +=
            25;

        reasons.push(
            `${preferences.cuisine} cuisine information found`
        );

    }


    /* DIET */

    if (
        preferences.diet ===
        "vegan"
    ) {

        if (
            restaurant.vegan ===
                "yes" ||
            restaurant.vegan ===
                "only"
        ) {

            breakdown.diet =
                20;

            score +=
                20;

            reasons.push(
                "Vegan information listed"
            );

        }

        else {

            breakdown.diet =
                5;

            score +=
                5;

        }

    }


    else if (
        preferences.diet ===
        "vegetarian"
    ) {

        if (
            restaurant.vegetarian ===
                "yes" ||
            restaurant.vegetarian ===
                "only"
        ) {

            breakdown.diet =
                20;

            score +=
                20;

            reasons.push(
                "Vegetarian information listed"
            );

        }

        else {

            breakdown.diet =
                5;

            score +=
                5;

        }

    }

    else {

        breakdown.diet =
            7;

        score +=
            7;

    }


    /* SEARCH */

    const dishQuery =
        $("#dishSearch")
            ?.value.trim() ||
        "";


    if (
        dishQuery
    ) {

        const text =
            normaliseSearchText(
                `${restaurant.name} ${restaurant.cuisine} ${restaurant.address}`
            );


        if (
            text.includes(
                normaliseSearchText(
                    dishQuery
                )
            )
        ) {

            breakdown.search =
                15;

            score +=
                15;

            reasons.push(
                "Search term found"
            );

        }

        else {

            breakdown.search =
                0;

        }

    }


    /*
       Restrictions and budgets are not assumed
       because OSM does not reliably provide
       ingredient-level or current-price data.
    */


    return {

        score:
            Math.min(
                98,
                Math.max(
                    1,
                    Math.round(
                        score
                    )
                )
            ),

        breakdown,

        reasons

    };

}


/* =========================================================
   MATCH FILTERS
========================================================= */

function bindFilters() {

    $("#matchSort")
        ?.addEventListener(
            "change",
            applyMatchFiltersAndSort
        );


    $$("#matchFilterRow .filter-chip")
        .forEach(
            button => {

                button.addEventListener(
                    "click",
                    () => {

                        state.activeMatchFilter =
                            button.dataset.matchFilter;


                        $$("#matchFilterRow .filter-chip")
                            .forEach(
                                item =>
                                    item.classList.toggle(
                                        "active",
                                        item === button
                                    )
                            );


                        applyMatchFiltersAndSort();

                    }
                );

            }
        );


    $("#nearbySort")
        ?.addEventListener(
            "change",
            renderNearbyRestaurants
        );


    $("#restaurantSearch")
        ?.addEventListener(
            "input",
            renderNearbyRestaurants
        );


    $("#nearbyAllFilter")
        ?.addEventListener(
            "click",
            () => {

                state.activeNearbyFilter =
                    "all";

                updateNearbyFilterButtons();

                renderNearbyRestaurants();

            }
        );


    $("#nearbyOpenFilter")
        ?.addEventListener(
            "click",
            () => {

                state.activeNearbyFilter =
                    "open";

                updateNearbyFilterButtons();

                renderNearbyRestaurants();

            }
        );


    $$(".filter-chip[data-nearby-diet]")
        .forEach(
            button => {

                button.addEventListener(
                    "click",
                    () => {

                        state.activeNearbyFilter =
                            button.dataset.nearbyDiet;

                        updateNearbyFilterButtons();

                        renderNearbyRestaurants();

                    }
                );

            }
        );

}


function updateNearbyFilterButtons() {

    const buttons = [

        $("#nearbyAllFilter"),

        $("#nearbyOpenFilter"),

        ...$$(
            ".filter-chip[data-nearby-diet]"
        )

    ];


    buttons.forEach(
        button => {

            if (!button) {
                return;
            }

            let active =
                false;


            if (
                button.id ===
                "nearbyAllFilter"
            ) {

                active =
                    state.activeNearbyFilter ===
                    "all";

            }

            else if (
                button.id ===
                "nearbyOpenFilter"
            ) {

                active =
                    state.activeNearbyFilter ===
                    "open";

            }

            else {

                active =
                    state.activeNearbyFilter ===
                    button.dataset.nearbyDiet;

            }


            button.classList.toggle(
                "active",
                active
            );

        }
    );

}


function applyMatchFiltersAndSort() {

    if (
        !state.matchedRestaurants.length
    ) {

        renderMatchResults();

        return;

    }


    let results =
        [
            ...state.matchedRestaurants
        ];


    if (
        state.activeMatchFilter ===
        "vegetarian"
    ) {

        results =
            results.filter(
                restaurant =>
                    restaurant.vegetarian ===
                        "yes" ||
                    restaurant.vegetarian ===
                        "only"
            );

    }


    if (
        state.activeMatchFilter ===
        "vegan"
    ) {

        results =
            results.filter(
                restaurant =>
                    restaurant.vegan ===
                        "yes" ||
                    restaurant.vegan ===
                        "only"
            );

    }


    if (
        state.activeMatchFilter ===
        "open"
    ) {

        results =
            results.filter(
                restaurant =>
                    getOpeningStatus(
                        restaurant.openingHours
                    ).open ===
                    true
            );

    }


    const sort =
        $("#matchSort")
            ?.value ||
        "match";


    if (
        sort ===
        "match"
    ) {

        results.sort(
            (a, b) =>
                b.matchScore -
                a.matchScore
        );

    }


    if (
        sort ===
        "distance"
    ) {

        results.sort(
            (a, b) =>
                a.distanceKm -
                b.distanceKm
        );

    }


    if (
        sort ===
        "name"
    ) {

        results.sort(
            (a, b) =>
                a.name.localeCompare(
                    b.name
                )
        );

    }


    if (
        sort ===
        "open"
    ) {

        results.sort(
            (a, b) =>
                Number(
                    getOpeningStatus(
                        b.openingHours
                    ).open
                ) -
                Number(
                    getOpeningStatus(
                        a.openingHours
                    ).open
                )
        );

    }


    renderRestaurantCards(
        results,
        $("#matchResults"),
        {
            matchMode:
                true
        }
    );


    const summary =
        $("#matchSummary");


    if (summary) {

        summary.textContent =
            `${results.length} restaurants shown.`;

    }

}


/* =========================================================
   NEARBY RENDER
========================================================= */

function renderNearbyRestaurants() {

    const container =
        $("#nearbyRestaurants");


    if (!container) {
        return;
    }


    if (
        !state.liveRestaurants.length
    ) {

        renderNearbyEmpty();

        return;

    }


    let restaurants =
        [
            ...state.liveRestaurants
        ];


    const search =
        normaliseSearchText(
            $("#restaurantSearch")
                ?.value ||
            ""
        );


    if (search) {

        restaurants =
            restaurants.filter(
                restaurant => {

                    const text =
                        normaliseSearchText(
                            `${restaurant.name} ${restaurant.cuisine} ${restaurant.address}`
                        );

                    return text.includes(
                        search
                    );

                }
            );

    }


    if (
        state.activeNearbyFilter ===
        "open"
    ) {

        restaurants =
            restaurants.filter(
                restaurant =>
                    getOpeningStatus(
                        restaurant.openingHours
                    ).open ===
                    true
            );

    }


    if (
        state.activeNearbyFilter ===
        "vegetarian"
    ) {

        restaurants =
            restaurants.filter(
                restaurant =>
                    restaurant.vegetarian ===
                        "yes" ||
                    restaurant.vegetarian ===
                        "only"
            );

    }


    if (
        state.activeNearbyFilter ===
        "vegan"
    ) {

        restaurants =
            restaurants.filter(
                restaurant =>
                    restaurant.vegan ===
                        "yes" ||
                    restaurant.vegan ===
                        "only"
            );

    }


    const sort =
        $("#nearbySort")
            ?.value ||
        "distance";


    if (
        sort ===
        "distance"
    ) {

        restaurants.sort(
            (a, b) =>
                a.distanceKm -
                b.distanceKm
        );

    }


    if (
        sort ===
        "name"
    ) {

        restaurants.sort(
            (a, b) =>
                a.name.localeCompare(
                    b.name
                )
        );

    }


    if (
        sort ===
        "open"
    ) {

        restaurants.sort(
            (a, b) =>
                Number(
                    getOpeningStatus(
                        b.openingHours
                    ).open
                ) -
                Number(
                    getOpeningStatus(
                        a.openingHours
                    ).open
                )
        );

    }


    if (!restaurants.length) {

        container.innerHTML = `

            <div class="empty-state">

                <div class="empty-icon">
                    🔎
                </div>

                <h3>
                    No restaurants match these filters
                </h3>

                <p>
                    Try changing your search or filters.
                </p>

            </div>

        `;

        return;

    }


    renderRestaurantCards(
        restaurants,
        container,
        {
            matchMode:
                false
        }
    );

}


function renderNearbyEmpty() {

    const container =
        $("#nearbyRestaurants");


    if (!container) {
        return;
    }


    container.innerHTML = `

        <div class="empty-state">

            <div class="empty-icon">
                📍
            </div>

            <h3>
                Find restaurants near you
            </h3>

            <p>
                Use your location or select a Taiwan city.
            </p>

            <button
                class="primary-button"
                data-view="find"
            >
                🔎 Choose Location
            </button>

        </div>

    `;

}


function renderMatchResults() {

    const section =
        $("#matchResultsSection");

    const container =
        $("#matchResults");


    if (
        !section ||
        !container
    ) {
        return;
    }


    section.classList.remove(
        "hidden"
    );


    if (
        !state.matchedRestaurants.length
    ) {

        renderMatchError();

        return;

    }


    applyMatchFiltersAndSort();

}


/* =========================================================
   CARD RENDER
========================================================= */

function renderRestaurantCards(
    restaurants,
    container,
    options = {}
) {

    if (!container) {
        return;
    }


    const limit =
        options.limit ||
        30;


    container.innerHTML =
        restaurants
            .slice(
                0,
                limit
            )
            .map(
                (
                    restaurant,
                    index
                ) =>
                    createRestaurantCard(
                        restaurant,
                        options.matchMode ||
                        false,
                        index
                    )
            )
            .join("");


}


function createRestaurantCard(
    restaurant,
    matchMode,
    index
) {

    const favorite =
        isFavorite(
            restaurant.uid
        );


    const status =
        getOpeningStatus(
            restaurant.openingHours
        );


    const icon =
        restaurantIcon(
            restaurant.cuisine
        );


    const mapUrl =
        createMapUrl(
            restaurant.latitude,
            restaurant.longitude
        );


    const match =
        restaurant.matchScore ||
        null;


    const photo =
        restaurant.image;


    const safeId =
        escapeHtml(
            restaurant.uid
        );


    const statusBadge =
        status.known

            ? status.open
                ? `
                    <span class="badge open-badge">
                        🟢 Open now
                    </span>
                  `
                : `
                    <span class="badge closed-badge">
                        🔴 Closed
                    </span>
                  `

            : `
                <span class="badge unknown-badge">
                    🕒 Hours unknown
                </span>
              `;


    const dietaryBadges =
        getDietaryBadges(
            restaurant
        );


    const photoMarkup =
        photo

            ? `
                <div class="restaurant-media">

                    <img
                        src="${escapeAttribute(photo)}"
                        alt="${escapeAttribute(restaurant.name)}"
                        loading="lazy"
                        onerror="this.style.display='none'; this.parentElement.querySelector('.restaurant-placeholder').style.display='grid';"
                    >

                    <div
                        class="restaurant-placeholder"
                        style="display:none;"
                    >
                        ${icon}
                    </div>

                    <button
                        class="favorite-button ${favorite ? "is-favorite" : ""}"
                        data-action="favorite"
                        data-id="${safeId}"
                    >
                        ${favorite ? "♥" : "♡"}
                    </button>

                </div>
              `

            : `
                <div class="restaurant-media">

                    <div class="restaurant-placeholder">
                        ${icon}
                    </div>

                    <button
                        class="favorite-button ${favorite ? "is-favorite" : ""}"
                        data-action="favorite"
                        data-id="${safeId}"
                    >
                        ${favorite ? "♥" : "♡"}
                    </button>

                </div>
              `;


    return `

        <article
            class="restaurant-card"
            style="animation-delay:${Math.min(
                index * 35,
                350
            )}ms"
        >

            ${photoMarkup}


            <div class="restaurant-card-body">

                <div class="restaurant-top">

                    <div>

                        <h3 class="restaurant-name">
                            ${escapeHtml(
                                restaurant.name
                            )}
                        </h3>

                        <p class="restaurant-cuisine">
                            ${
                                restaurant.cuisine
                                    ? escapeHtml(
                                        formatCuisine(
                                            restaurant.cuisine
                                        )
                                    )
                                    : "Cuisine not listed"
                            }
                        </p>

                    </div>

                </div>


                <div class="restaurant-badges">

                    ${
                        matchMode &&
                        match !== null
                            ? `
                                <span class="badge match-badge">
                                    ⭐ ${match}% Match
                                </span>
                            `
                            : ""
                    }

                    <span class="badge distance-badge">
                        📍 ${formatDistance(
                            restaurant.distanceKm
                        )}
                    </span>

                    ${statusBadge}

                    ${dietaryBadges}

                </div>


                <div class="restaurant-detail-list">

                    <div class="restaurant-detail-line">
                        <span>📍</span>
                        <span>
                            ${
                                restaurant.address
                                    ? escapeHtml(
                                        restaurant.address
                                    )
                                    : "Address not listed"
                            }
                        </span>
                    </div>


                    <div class="restaurant-detail-line">
                        <span>🕒</span>
                        <span>
                            ${
                                restaurant.openingHours
                                    ? escapeHtml(
                                        restaurant.openingHours
                                    )
                                    : "Opening hours not listed"
                            }
                        </span>
                    </div>

                </div>


                ${
                    matchMode &&
                    restaurant.matchReasons?.length
                        ? `
                            <div class="score-breakdown">

                                <div class="score-item">
                                    <strong>
                                        Match
                                    </strong>

                                    <span>
                                        ${escapeHtml(
                                            restaurant.matchReasons
                                                .slice(
                                                    0,
                                                    2
                                                )
                                                .join(
                                                    " • "
                                                )
                                        )}
                                    </span>
                                </div>

                                <div class="score-item">

                                    <strong>
                                        Data
                                    </strong>

                                    <span>
                                        Available information only
                                    </span>

                                </div>

                            </div>
                          `
                        : ""
                }


                <div class="restaurant-actions">


                    <button
                        class="card-action primary"
                        data-action="details"
                        data-id="${safeId}"
                    >
                        View Details
                    </button>


                    ${
                        restaurant.menuUrl
                            ? `
                                <a
                                    class="card-action"
                                    href="${escapeAttribute(
                                        restaurant.menuUrl
                                    )}"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                >
                                    🍽️ Menu
                                </a>
                              `
                            : ""
                    }


                    <details class="more-menu">

                        <summary>
                            ⋮
                        </summary>


                        <div class="more-menu-panel">

                            ${
                                restaurant.menuUrl
                                    ? `
                                        <a
                                            href="${escapeAttribute(
                                                restaurant.menuUrl
                                            )}"
                                            target="_blank"
                                            rel="noopener noreferrer"
                                        >
                                            🍽️ Open Menu
                                        </a>
                                      `
                                    : ""
                            }


                            ${
                                restaurant.website
                                    ? `
                                        <a
                                            href="${escapeAttribute(
                                                restaurant.website
                                            )}"
                                            target="_blank"
                                            rel="noopener noreferrer"
                                        >
                                            🌐 Website
                                        </a>
                                      `
                                    : ""
                            }


                            <a
                                href="${escapeAttribute(
                                    mapUrl
                                )}"
                                target="_blank"
                                rel="noopener noreferrer"
                            >
                                🗺️ Open Map
                            </a>


                            <button
                                data-action="share"
                                data-id="${safeId}"
                            >
                                📤 Share
                            </button>


                            <button
                                data-action="favorite"
                                data-id="${safeId}"
                            >
                                ${
                                    favorite
                                        ? "♥ Remove Favorite"
                                        : "♡ Save Favorite"
                                }
                            </button>

                        </div>

                    </details>

                </div>

            </div>

        </article>

    `;

}


/* =========================================================
   FAVORITES
========================================================= */

function bindFavoritesAndRestaurantActions() {

    document.addEventListener(
        "click",
        async event => {

            const actionButton =
                event.target.closest(
                    "[data-action]"
                );


            if (!actionButton) {
                return;
            }


            const action =
                actionButton.dataset.action;

            const id =
                actionButton.dataset.id;


            const restaurant =
                getRestaurantById(
                    id
                );


            if (!restaurant) {
                return;
            }


            if (
                action ===
                "favorite"
            ) {

                event.preventDefault();

                toggleFavorite(
                    restaurant
                );

            }


            if (
                action ===
                "details"
            ) {

                event.preventDefault();

                openRestaurantDetails(
                    restaurant
                );

            }


            if (
                action ===
                "share"
            ) {

                event.preventDefault();

                await shareRestaurant(
                    restaurant
                );

            }

        }
    );

}


function toggleFavorite(
    restaurant
) {

    if (
        isFavorite(
            restaurant.uid
        )
    ) {

        delete state.favorites[
            restaurant.uid
        ];

        showToast(
            `${restaurant.name} removed from favorites.`
        );

    }

    else {

        state.favorites[
            restaurant.uid
        ] =
            stripRestaurant(
                restaurant
            );

        showToast(
            `${restaurant.name} saved to favorites.`
        );

    }


    saveFavorites();

    updateFavoriteCount();

    renderFavorites();

    refreshVisibleLists();

}


function saveFavorites() {

    writeStorage(
        STORAGE.favorites,
        Object.values(
            state.favorites
        )
    );

}


function updateFavoriteCount() {

    const count =
        Object.keys(
            state.favorites
        ).length;


    const element =
        $("#favoriteNavCount");

    if (element) {

        element.textContent =
            String(
                count
            );

    }


    const profileElement =
        $("#profileFavoriteCount");

    if (profileElement) {

        profileElement.textContent =
            String(
                count
            );

    }

}


function isFavorite(
    uid
) {

    return Boolean(
        state.favorites[
            uid
        ]
    );

}


function renderFavorites() {

    const container =
        $("#favoritesGrid");


    if (!container) {
        return;
    }


    const favorites =
        Object.values(
            state.favorites
        );


    if (!favorites.length) {

        container.innerHTML = `

            <div class="empty-state">

                <div class="empty-icon">
                    ❤️
                </div>

                <h3>
                    No favorites yet
                </h3>

                <p>
                    Tap the heart on a restaurant to save it here.
                </p>

                <button
                    class="primary-button"
                    data-view="nearby"
                >
                    📍 Explore Nearby
                </button>

            </div>

        `;

        return;

    }


    const currentMap =
        new Map(
            state.liveRestaurants.map(
                restaurant =>
                    [
                        restaurant.uid,
                        restaurant
                    ]
            )
        );


    const merged =
        favorites.map(
            favorite =>
                currentMap.get(
                    favorite.uid
                ) || favorite
        );


    renderRestaurantCards(
        merged,
        container,
        {
            matchMode:
                false
        }
    );

}


function getRestaurantById(
    uid
) {

    return (

        state.liveRestaurants.find(
            restaurant =>
                restaurant.uid ===
                uid
        ) ||

        state.matchedRestaurants.find(
            restaurant =>
                restaurant.uid ===
                uid
        ) ||

        state.favorites[
            uid
        ] ||

        state.recent.find(
            restaurant =>
                restaurant.uid ===
                uid
        ) ||

        null

    );

}


/* =========================================================
   RESTAURANT DETAILS
========================================================= */

function openRestaurantDetails(
    restaurant
) {

    const container =
        $("#foodDetails");


    if (!container) {
        return;
    }


    rememberRecent(
        restaurant
    );


    const ranked =
        rankRestaurant(
            restaurant,
            state.preferences
        );


    const status =
        getOpeningStatus(
            restaurant.openingHours
        );


    const icon =
        restaurantIcon(
            restaurant.cuisine
        );


    const mapEmbed =
        createMapEmbed(
            restaurant.latitude,
            restaurant.longitude
        );


    const favorite =
        isFavorite(
            restaurant.uid
        );


    const imageMarkup =
        restaurant.image

            ? `
                <img
                    src="${escapeAttribute(
                        restaurant.image
                    )}"
                    alt=""
                    onerror="this.style.display='none'; this.nextElementSibling.style.display='block';"
                >

                <span
                    style="display:none;"
                >
                    ${icon}
                </span>
              `

            : `
                <span>
                    ${icon}
                </span>
              `;


    container.innerHTML = `

        <div class="restaurant-modal-header">

            <div class="restaurant-modal-art">
                ${imageMarkup}
            </div>


            <div>

                <h2>
                    ${escapeHtml(
                        restaurant.name
                    )}
                </h2>

                <div class="restaurant-modal-cuisine">
                    ${
                        restaurant.cuisine
                            ? escapeHtml(
                                formatCuisine(
                                    restaurant.cuisine
                                )
                            )
                            : "Cuisine not listed"
                    }
                </div>

                <div class="restaurant-modal-score">
                    ⭐ ${ranked.score}% Match
                </div>

            </div>

        </div>



        <div class="details-block">

            <h3>
                📊 Match breakdown
            </h3>


            <div class="score-breakdown">

                <div class="score-item">

                    <strong>
                        Distance
                    </strong>

                    <span>
                        ${ranked.breakdown.distance}
                    </span>

                </div>


                <div class="score-item">

                    <strong>
                        Cuisine
                    </strong>

                    <span>
                        ${ranked.breakdown.cuisine}
                    </span>

                </div>


                <div class="score-item">

                    <strong>
                        Dietary
                    </strong>

                    <span>
                        ${ranked.breakdown.diet}
                    </span>

                </div>


                <div class="score-item">

                    <strong>
                        Search
                    </strong>

                    <span>
                        ${ranked.breakdown.search}
                    </span>

                </div>

            </div>

        </div>



        <div class="details-block">

            <h3>
                📍 Location
            </h3>


            <div class="details-row">
                <strong>
                    Distance
                </strong>

                <span>
                    ${formatDistance(
                        restaurant.distanceKm
                    )}
                </span>
            </div>


            <div class="details-row">
                <strong>
                    Address
                </strong>

                <span>
                    ${
                        restaurant.address
                            ? escapeHtml(
                                restaurant.address
                            )
                            : "Address not listed"
                    }
                </span>
            </div>


            <iframe
                class="map-frame"
                loading="lazy"
                title="Restaurant location"
                src="${escapeAttribute(
                    mapEmbed
                )}"
            ></iframe>

        </div>



        <div class="details-block">

            <h3>
                🕒 Opening hours
            </h3>


            <div class="details-row">

                <span>
                    ${
                        status.known
                            ? (
                                status.open
                                    ? "🟢 Open now"
                                    : "🔴 Closed now"
                              )
                            : "ℹ️ Opening status unavailable"
                    }
                </span>

            </div>


            ${
                restaurant.openingHours
                    ? `
                        <div class="details-row">
                            <span>
                                ${escapeHtml(
                                    restaurant.openingHours
                                )}
                            </span>
                        </div>
                      `
                    : ""
            }

        </div>



        <div class="details-block">

            <h3>
                🥗 Dietary information
            </h3>


            <div class="details-row">

                <strong>
                    Vegetarian
                </strong>

                <span>
                    ${
                        restaurant.vegetarian
                            ? formatTag(
                                restaurant.vegetarian
                              )
                            : "Information unavailable"
                    }
                </span>

            </div>


            <div class="details-row">

                <strong>
                    Vegan
                </strong>

                <span>
                    ${
                        restaurant.vegan
                            ? formatTag(
                                restaurant.vegan
                              )
                            : "Information unavailable"
                    }
                </span>

            </div>


            <div class="details-row">

                <span>
                    ⚠ Egg, dairy and peanut information
                    requires menu-level verification.
                </span>

            </div>

        </div>



        <div class="details-block">

            <h3>
                🍽️ Menu
            </h3>


            <div class="modal-actions">

                ${
                    restaurant.menuUrl
                        ? `
                            <a
                                class="primary-button"
                                href="${escapeAttribute(
                                    restaurant.menuUrl
                                )}"
                                target="_blank"
                                rel="noopener noreferrer"
                            >
                                🍽️ Open Official Menu
                            </a>
                          `
                        : `
                            <button
                                class="secondary-button"
                                disabled
                            >
                                Menu Not Listed
                            </button>
                          `
                }


                ${
                    restaurant.website
                        ? `
                            <a
                                class="secondary-button"
                                href="${escapeAttribute(
                                    restaurant.website
                                )}"
                                target="_blank"
                                rel="noopener noreferrer"
                            >
                                🌐 Website
                            </a>
                          `
                        : ""
                }

            </div>

        </div>



        <div class="details-block">

            <h3>
                🔎 Check a menu yourself
            </h3>


            <div class="menu-check-box">

                <label for="menuTextInput">
                    Paste menu text here
                </label>


                <textarea
                    id="menuTextInput"
                    placeholder="Paste menu text and FoodMatch will look for common dietary keywords..."
                ></textarea>


                <button
                    class="primary-button"
                    id="checkMenuButton"
                    type="button"
                >
                    🧪 Check Menu
                </button>


                <div
                    class="menu-check-result"
                    id="menuCheckResult"
                >
                    No menu text checked yet.
                </div>

            </div>

        </div>



        <div class="details-block">

            <h3>
                ❤️ Save & Share
            </h3>


            <div class="modal-actions">

                <button
                    class="primary-button"
                    data-action="favorite"
                    data-id="${escapeAttribute(
                        restaurant.uid
                    )}"
                >
                    ${
                        favorite
                            ? "♥ Remove Favorite"
                            : "♡ Save Restaurant"
                    }
                </button>


                <button
                    class="secondary-button"
                    data-action="share"
                    data-id="${escapeAttribute(
                        restaurant.uid
                    )}"
                >
                    📤 Share
                </button>


                <a
                    class="secondary-button"
                    href="${escapeAttribute(
                        createMapUrl(
                            restaurant.latitude,
                            restaurant.longitude
                        )
                    )}"
                    target="_blank"
                    rel="noopener noreferrer"
                >
                    🗺️ Open Map
                </a>

            </div>

        </div>



        <div class="details-block">

            <div class="info-banner">

                <div class="info-banner-icon">
                    ℹ️
                </div>

                <div>

                    <strong>
                        Data note
                    </strong>

                    <p>
                        FoodMatch does not treat missing information
                        as proof that a restaurant meets a dietary
                        restriction or budget requirement.
                    </p>

                </div>

            </div>

        </div>

    `;


    $("#checkMenuButton")
        ?.addEventListener(
            "click",
            () =>
                checkMenuText(
                    restaurant
                )
        );


    openModal(
        "foodModal"
    );

}


function checkMenuText(
    restaurant
) {

    const input =
        $("#menuTextInput");

    const result =
        $("#menuCheckResult");


    if (
        !input ||
        !result
    ) {
        return;
    }


    const text =
        normaliseSearchText(
            input.value
        );


    if (!text) {

        result.textContent =
            "Paste some menu text first.";

        return;

    }


    const riskyTerms = {

        "no-eggs":
            [
                "egg",
                "mayonnaise",
                "mayo",
                "omelette",
                "蛋",
                "美乃滋"
            ],

        "no-dairy":
            [
                "milk",
                "cheese",
                "cream",
                "butter",
                "yogurt",
                "奶",
                "起司",
                "乳酪",
                "奶油"
            ],

        "no-peanuts":
            [
                "peanut",
                "groundnut",
                "花生"
            ]

    };


    const restriction =
        state.preferences.restriction;


    const words =
        riskyTerms[
            restriction
        ] || [];


    const found =
        words.filter(
            word =>
                text.includes(
                    normaliseSearchText(
                        word
                    )
                )
        );


    const positiveDietTerms = [

        "vegan",
        "vegetarian",
        "plant based",
        "植物性",
        "全素",
        "素食"

    ];


    const dietHits =
        positiveDietTerms.filter(
            term =>
                text.includes(
                    normaliseSearchText(
                        term
                    )
                )
        );


    let message =
        "";


    if (
        found.length
    ) {

        message +=
            `⚠ Possible terms found: ${found.join(", ")}. `;

    }

    else {

        message +=
            "✓ No matching restriction keywords were found. ";

    }


    if (
        dietHits.length
    ) {

        message +=
            `Diet-related terms also found: ${dietHits.join(", ")}.`;

    }


    message +=
        " This keyword check is not ingredient certification.";


    result.textContent =
        message;


    showToast(
        "Menu text checked."
    );

}


/* =========================================================
   RECENT
========================================================= */

function rememberRecent(
    restaurant
) {

    const cleaned =
        stripRestaurant(
            restaurant
        );


    state.recent =
        [

            cleaned,

            ...state.recent.filter(
                item =>
                    item.uid !==
                    restaurant.uid
            )

        ]
        .slice(
            0,
            8
        );


    writeStorage(
        STORAGE.recent,
        state.recent
    );


    renderProfile();

}


function renderRecent() {

    const container =
        $("#recentRestaurants");


    if (!container) {
        return;
    }


    if (
        !state.recent.length
    ) {

        container.innerHTML =
            `
                <div class="empty-state">
                    <div class="empty-icon">
                        🍜
                    </div>

                    <p>
                        Your recently viewed restaurants will appear here.
                    </p>
                </div>
            `;

        return;

    }


    container.innerHTML =
        state.recent
            .slice(
                0,
                6
            )
            .map(
                restaurant =>
                    `

                    <button
                        class="recent-item"
                        data-recent-id="${escapeAttribute(
                            restaurant.uid
                        )}"
                    >

                        <span>

                            <strong>
                                ${escapeHtml(
                                    restaurant.name
                                )}
                            </strong>

                            <small>
                                ${
                                    restaurant.cuisine
                                        ? escapeHtml(
                                            formatCuisine(
                                                restaurant.cuisine
                                            )
                                          )
                                        : "Restaurant"
                                }
                            </small>

                        </span>


                        <small>
                            →
                        </small>

                    </button>

                    `
            )
            .join("");


    $$(".recent-item")
        .forEach(
            button => {

                button.addEventListener(
                    "click",
                    () => {

                        const restaurant =
                            getRestaurantById(
                                button.dataset.recentId
                            );

                        if (restaurant) {

                            openRestaurantDetails(
                                restaurant
                            );

                        }

                        else {

                            const saved =
                                state.recent.find(
                                    item =>
                                        item.uid ===
                                        button.dataset.recentId
                                );

                            if (
                                saved
                            ) {

                                openRestaurantDetails(
                                    saved
                                );

                            }

                        }

                    }
                );

            }
        );

}


/* =========================================================
   PROFILE
========================================================= */

function bindProfile() {

    $("#saveProfileName")
        ?.addEventListener(
            "click",
            saveProfile
        );


    $("#exportData")
        ?.addEventListener(
            "click",
            exportData
        );


    $("#importDataButton")
        ?.addEventListener(
            "click",
            () =>
                $("#importDataInput")
                    ?.click()
        );


    $("#importDataInput")
        ?.addEventListener(
            "change",
            importData
        );

}


function saveProfile() {

    const input =
        $("#profileName");


    const name =
        input?.value
            .trim() ||
        "Food Explorer";


    state.profile.name =
        name;


    writeStorage(
        STORAGE.profile,
        state.profile
    );


    renderProfile();

    showToast(
        "Profile saved."
    );

}


function syncProfileControls() {

    const input =
        $("#profileName");


    if (input) {

        input.value =
            state.profile.name;

    }

}


function renderProfile() {

    const name =
        $("#profileNameDisplay");


    if (name) {

        name.textContent =
            state.profile.name;

    }


    const favorites =
        $("#profileFavoriteCount");


    if (favorites) {

        favorites.textContent =
            String(
                Object.keys(
                    state.favorites
                ).length
            );

    }


    const discovered =
        $("#profileDiscoveredCount");


    if (discovered) {

        discovered.textContent =
            String(
                state.liveRestaurants.length
            );

    }


    const recent =
        $("#profileRecentCount");


    if (recent) {

        recent.textContent =
            String(
                state.recent.length
            );

    }


    const summary =
        $("#profilePreferenceSummary");


    if (summary) {

        summary.innerHTML = `

            ${profilePreference(
                "Diet",
                preferenceLabel(
                    state.preferences.diet,
                    "diet"
                )
            )}

            ${profilePreference(
                "Restriction",
                preferenceLabel(
                    state.preferences.restriction,
                    "restriction"
                )
            )}

            ${profilePreference(
                "Budget",
                preferenceLabel(
                    state.preferences.budget,
                    "budget"
                )
            )}

            ${profilePreference(
                "Cuisine",
                preferenceLabel(
                    state.preferences.cuisine,
                    "cuisine"
                )
            )}

            ${profilePreference(
                "Location",
                preferenceLabel(
                    state.preferences.location,
                    "location"
                )
            )}

        `;

    }


    renderRecent();

}


function profilePreference(
    label,
    value
) {

    return `

        <div class="preference-summary-item">

            <span>
                ${escapeHtml(
                    label
                )}
            </span>

            <strong>
                ${escapeHtml(
                    value
                )}
            </strong>

        </div>

    `;

}


/* =========================================================
   DATA EXPORT / IMPORT
========================================================= */

function exportData() {

    const payload = {

        version:
            1,

        exportedAt:
            new Date()
                .toISOString(),

        profile:
            state.profile,

        preferences:
            state.preferences,

        settings:
            state.settings,

        favorites:
            Object.values(
                state.favorites
            ),

        recent:
            state.recent

    };


    const blob =
        new Blob(
            [
                JSON.stringify(
                    payload,
                    null,
                    2
                )
            ],
            {
                type:
                    "application/json"
            }
        );


    const url =
        URL.createObjectURL(
            blob
        );


    const link =
        document.createElement(
            "a"
        );


    link.href =
        url;

    link.download =
        "foodmatch-taiwan-backup.json";


    document.body.appendChild(
        link
    );


    link.click();

    link.remove();


    URL.revokeObjectURL(
        url
    );


    showToast(
        "FoodMatch data exported."
    );

}


function importData(
    event
) {

    const file =
        event.target.files?.[0];


    if (!file) {
        return;
    }


    const reader =
        new FileReader();


    reader.onload =
        () => {

            try {

                const data =
                    JSON.parse(
                        reader.result
                    );


                if (
                    data.profile
                ) {

                    state.profile =
                        {
                            ...state.profile,
                            ...data.profile
                        };

                    writeStorage(
                        STORAGE.profile,
                        state.profile
                    );

                }


                if (
                    data.preferences
                ) {

                    state.preferences =
                        {
                            ...DEFAULT_PREFERENCES,
                            ...data.preferences
                        };

                    savePreferences();

                }


                if (
                    data.settings
                ) {

                    state.settings =
                        {
                            ...DEFAULT_SETTINGS,
                            ...data.settings
                        };

                    writeStorage(
                        STORAGE.settings,
                        state.settings
                    );

                    applySettings();

                }


                if (
                    Array.isArray(
                        data.favorites
                    )
                ) {

                    state.favorites =
                        {};

                    data.favorites
                        .forEach(
                            restaurant => {

                                if (
                                    restaurant?.uid
                                ) {

                                    state.favorites[
                                        restaurant.uid
                                    ] =
                                        restaurant;

                                }

                            }
                        );


                    saveFavorites();

                }


                if (
                    Array.isArray(
                        data.recent
                    )
                ) {

                    state.recent =
                        data.recent;

                    writeStorage(
                        STORAGE.recent,
                        state.recent
                    );

                }


                syncPreferenceControls();

                syncSettingsControls();

                syncProfileControls();

                renderFavorites();

                renderProfile();

                updateFavoriteCount();


                showToast(
                    "FoodMatch data imported."
                );

            }

            catch (
                error
            ) {

                console.error(
                    error
                );

                showToast(
                    "That backup file could not be imported."
                );

            }

        };


    reader.readAsText(
        file
    );


    event.target.value =
        "";

}


/* =========================================================
   SETTINGS
========================================================= */

function bindSettings() {

    $$("[data-theme-choice]")
        .forEach(
            button => {

                button.addEventListener(
                    "click",
                    () => {

                        state.settings.theme =
                            button.dataset.themeChoice;

                        saveSettings();

                        applySettings();

                        showToast(
                            `Theme: ${capitalize(
                                state.settings.theme
                            )}`
                        );

                    }
                );

            }
        );


    $$("[data-accent-choice]")
        .forEach(
            button => {

                button.addEventListener(
                    "click",
                    () => {

                        state.settings.accent =
                            button.dataset.accentChoice;

                        saveSettings();

                        applySettings();

                    }
                );

            }
        );


    $$("[data-language-choice]")
        .forEach(
            button => {

                button.addEventListener(
                    "click",
                    () => {

                        state.settings.language =
                            button.dataset.languageChoice;

                        saveSettings();

                        applyLanguage();

                        syncSettingsControls();

                        showToast(
                            state.settings.language ===
                            "zh"
                                ? "已切換為繁體中文"
                                : "Language changed to English"
                        );

                    }
                );

            }
        );


    $("#headerLanguageToggle")
        ?.addEventListener(
            "click",
            cycleLanguage
        );


    $("#headerThemeToggle")
        ?.addEventListener(
            "click",
            cycleTheme
        );


    $("#quickMenuTheme")
        ?.addEventListener(
            "click",
            cycleTheme
        );


    $("#reduceMotionToggle")
        ?.addEventListener(
            "change",
            event => {

                state.settings.reduceMotion =
                    event.target.checked;

                saveSettings();

                applySettings();

            }
        );


    $("#largeTextToggle")
        ?.addEventListener(
            "change",
            event => {

                state.settings.largeText =
                    event.target.checked;

                saveSettings();

                applySettings();

            }
        );


    $("#rememberPreferencesToggle")
        ?.addEventListener(
            "change",
            event => {

                state.settings.rememberPreferences =
                    event.target.checked;

                saveSettings();

                savePreferences();

                syncSettingsControls();

            }
        );


    $("#clearSavedData")
        ?.addEventListener(
            "click",
            clearSavedData
        );

}


function saveSettings() {

    writeStorage(
        STORAGE.settings,
        state.settings
    );

}


function syncSettingsControls() {

    $$("[data-theme-choice]")
        .forEach(
            button => {

                button.classList.toggle(
                    "selected",

                    button.dataset.themeChoice ===
                    state.settings.theme
                );

            }
        );


    $$("[data-accent-choice]")
        .forEach(
            button => {

                button.classList.toggle(
                    "selected",

                    button.dataset.accentChoice ===
                    state.settings.accent
                );

            }
        );


    $$("[data-language-choice]")
        .forEach(
            button => {

                button.classList.toggle(
                    "selected",

                    button.dataset.languageChoice ===
                    state.settings.language
                );

            }
        );


    const reduce =
        $("#reduceMotionToggle");

    if (reduce) {

        reduce.checked =
            state.settings.reduceMotion;

    }


    const large =
        $("#largeTextToggle");

    if (large) {

        large.checked =
            state.settings.largeText;

    }


    const remember =
        $("#rememberPreferencesToggle");

    if (remember) {

        remember.checked =
            state.settings.rememberPreferences;

    }

}


function applySettings() {

    document.documentElement.dataset.theme =
        resolveTheme(
            state.settings.theme
        );


    document.documentElement.dataset.accent =
        state.settings.accent;


    document.body.classList.toggle(
        "large-text",
        state.settings.largeText
    );


    document.body.classList.toggle(
        "reduced-motion",
        state.settings.reduceMotion
    );


    const themeButton =
        $("#headerThemeToggle");


    if (themeButton) {

        themeButton.textContent =

            state.settings.theme ===
            "dark"

                ? "🌙"

                : state.settings.theme ===
                  "light"

                    ? "☀️"

                    : "🖥️";

    }


    syncSettingsControls();

    applyLanguage();

}


function resolveTheme(
    mode
) {

    if (
        mode ===
        "light"
    ) {

        return "light";

    }


    if (
        mode ===
        "dark"
    ) {

        return "dark";

    }


    return window.matchMedia(
        "(prefers-color-scheme: dark)"
    ).matches
        ? "dark"
        : "light";

}


function cycleTheme() {

    const next = {

        system:
            "dark",

        dark:
            "light",

        light:
            "system"

    };


    state.settings.theme =
        next[
            state.settings.theme
        ] ||
        "system";


    saveSettings();

    applySettings();

    showToast(
        `Theme: ${capitalize(
            state.settings.theme
        )}`
    );

}


function cycleLanguage() {

    state.settings.language =
        state.settings.language ===
        "en"

            ? "zh"

            : "en";


    saveSettings();

    applyLanguage();

    syncSettingsControls();

    showToast(
        state.settings.language ===
        "zh"

            ? "已切換為繁體中文"

            : "Language changed to English"
    );

}


function applyLanguage() {

    const dictionary =
        TRANSLATIONS[
            state.settings.language
        ] ||
        TRANSLATIONS.en;


    $$("[data-i18n]")
        .forEach(
            element => {

                const key =
                    element.dataset.i18n;


                if (
                    dictionary[key]
                ) {

                    element.textContent =
                        dictionary[key];

                }

            }
        );


    document.documentElement.lang =
        state.settings.language ===
        "zh"
            ? "zh-Hant"
            : "en";


    const languageButton =
        $("#headerLanguageToggle");


    if (languageButton) {

        languageButton.textContent =
            state.settings.language ===
            "zh"
                ? "EN"
                : "中";

    }

}


function clearSavedData() {

    const confirmed =
        window.confirm(
            "Clear favorites, preferences, profile and recent data?"
        );


    if (!confirmed) {
        return;
    }


    Object.values(
        STORAGE
    )
        .forEach(
            key =>
                localStorage.removeItem(
                    key
                )
        );


    state.preferences =
        {
            ...DEFAULT_PREFERENCES
        };


    state.favorites =
        {};


    state.recent =
        [];


    state.profile =
        {
            name:
                "Food Explorer"
        };


    syncPreferenceControls();

    syncProfileControls();

    renderFavorites();

    renderProfile();

    updateFavoriteCount();


    showToast(
        "Saved data cleared."
    );

}


/* =========================================================
   MODALS
========================================================= */

function bindModals() {

    $("#openHelp")
        ?.addEventListener(
            "click",
            () =>
                openModal(
                    "helpModal"
                )
        );


    $("#homeHelpCard")
        ?.addEventListener(
            "click",
            () =>
                openModal(
                    "helpModal"
                )
        );


    $("#findHelpButton")
        ?.addEventListener(
            "click",
            () =>
                openModal(
                    "helpModal"
                )
        );


    $("#nearbyHelpButton")
        ?.addEventListener(
            "click",
            () =>
                openModal(
                    "helpModal"
                )
        );


    $("#favoritesHelpButton")
        ?.addEventListener(
            "click",
            () =>
                openModal(
                    "helpModal"
                )
        );


    $("#settingsHelpButton")
        ?.addEventListener(
            "click",
            () =>
                openModal(
                    "helpModal"
                )
        );


    $("#footerHelp")
        ?.addEventListener(
            "click",
            () =>
                openModal(
                    "helpModal"
                )
        );


    $("#quickMenuHelp")
        ?.addEventListener(
            "click",
            () => {

                closeQuickMenu();

                openModal(
                    "helpModal"
                );

            }
        );


    $$("[data-close-modal]")
        .forEach(
            button => {

                button.addEventListener(
                    "click",
                    () =>
                        closeModal(
                            button.dataset.closeModal
                        )
                );

            }
        );


    $$(".modal-backdrop")
        .forEach(
            backdrop => {

                backdrop.addEventListener(
                    "click",
                    event => {

                        if (
                            event.target ===
                            backdrop
                        ) {

                            closeModal(
                                backdrop.id
                            );

                        }

                    }
                );

            }
        );

}


function openModal(
    id
) {

    const modal =
        $(`#${id}`);


    if (!modal) {
        return;
    }


    modal.classList.add(
        "open"
    );


    document.body.classList.add(
        "modal-open"
    );


    if (
        id ===
        "commandModal"
    ) {

        renderCommandResults(
            ""
        );


        setTimeout(
            () =>
                $("#commandSearch")
                    ?.focus(),
            50
        );

    }

}


function closeModal(
    id
) {

    const modal =
        $(`#${id}`);


    if (!modal) {
        return;
    }


    modal.classList.remove(
        "open"
    );


    const open =
        $$(".modal-backdrop.open")
            .length;


    if (!open) {

        document.body.classList.remove(
            "modal-open"
        );

    }

}


/* =========================================================
   QUICK MENU
========================================================= */

function bindQuickMenu() {

    const fab =
        $("#quickFab");

    const panel =
        $("#quickMenuPanel");


    if (
        !fab ||
        !panel
    ) {
        return;
    }


    fab.addEventListener(
        "click",
        event => {

            event.stopPropagation();

            panel.classList.toggle(
                "open"
            );

        }
    );


    document.addEventListener(
        "click",
        event => {

            if (
                !event.target.closest(
                    ".quick-menu-wrapper"
                )
            ) {

                closeQuickMenu();

            }

        }
    );

}


function closeQuickMenu() {

    $("#quickMenuPanel")
        ?.classList.remove(
            "open"
        );

}


/* =========================================================
   COMMAND PALETTE
========================================================= */

const COMMANDS = [

    {
        id:
            "home",

        icon:
            "🏠",

        title:
            "Home",

        description:
            "Open FoodMatch Home",

        keywords:
            "home start"

    },

    {
        id:
            "find",

        icon:
            "🔎",

        title:
            "Find Food",

        description:
            "Open food matching",

        keywords:
            "food find match search"

    },

    {
        id:
            "nearby",

        icon:
            "📍",

        title:
            "Nearby",

        description:
            "Explore nearby restaurants",

        keywords:
            "restaurants places nearby"

    },

    {
        id:
            "favorites",

        icon:
            "❤️",

        title:
            "Favorites",

        description:
            "Open saved restaurants",

        keywords:
            "saved heart"

    },

    {
        id:
            "profile",

        icon:
            "👤",

        title:
            "Profile",

        description:
            "Open your profile",

        keywords:
            "profile user"

    },

    {
        id:
            "settings",

        icon:
            "⚙️",

        title:
            "Settings",

        description:
            "Customize FoodMatch",

        keywords:
            "settings theme language"

    },

    {
        id:
            "help",

        icon:
            "❓",

        title:
            "Help",

        description:
            "Open help",

        keywords:
            "help shortcuts question"

    },

    {
        id:
            "location",

        icon:
            "📍",

        title:
            "Use My Location",

        description:
            "Search around your device",

        keywords:
            "gps location"

    },

    {
        id:
            "theme",

        icon:
            "🎨",

        title:
            "Change Theme",

        description:
            "Switch appearance",

        keywords:
            "dark light system"

    }

];


function bindCommandPalette() {

    $("#openCommand")
        ?.addEventListener(
            "click",
            () =>
                openModal(
                    "commandModal"
                )
        );


    $("#commandSearch")
        ?.addEventListener(
            "input",
            event =>
                renderCommandResults(
                    event.target.value
                )
        );


    $("#commandSearch")
        ?.addEventListener(
            "keydown",
            event => {

                if (
                    event.key ===
                    "Enter"
                ) {

                    $(".command-result")
                        ?.click();

                }

            }
        );

}


function renderCommandResults(
    query
) {

    const container =
        $("#commandResults");


    if (!container) {
        return;
    }


    const clean =
        normaliseSearchText(
            query
        );


    const commands =
        COMMANDS.filter(
            command => {

                if (!clean) {
                    return true;
                }


                return normaliseSearchText(
                    `${command.title} ${command.description} ${command.keywords}`
                )
                    .includes(
                        clean
                    );

            }
        );


    const restaurants =
        state.liveRestaurants
            .filter(
                restaurant => {

                    if (!clean) {
                        return false;
                    }


                    return normaliseSearchText(
                        `${restaurant.name} ${restaurant.cuisine} ${restaurant.address}`
                    )
                        .includes(
                            clean
                        );

                }
            )
            .slice(
                0,
                7
            );


    const items = [

        ...commands.map(
            command => ({

                type:
                    "command",

                id:
                    command.id,

                icon:
                    command.icon,

                title:
                    command.title,

                description:
                    command.description

            })
        ),

        ...restaurants.map(
            restaurant => ({

                type:
                    "restaurant",

                id:
                    restaurant.uid,

                icon:
                    restaurantIcon(
                        restaurant.cuisine
                    ),

                title:
                    restaurant.name,

                description:
                    formatDistance(
                        restaurant.distanceKm
                    )

            })
        )

    ];


    if (!items.length) {

        container.innerHTML = `

            <div class="command-empty">
                No results found.
            </div>

        `;

        return;

    }


    container.innerHTML =
        items
            .slice(
                0,
                15
            )
            .map(
                item => `

                    <button
                        class="command-result"
                        data-command-type="${item.type}"
                        data-command-id="${escapeAttribute(
                            item.id
                        )}"
                    >

                        <span class="command-result-icon">
                            ${item.icon}
                        </span>


                        <span class="command-result-main">

                            <strong>
                                ${escapeHtml(
                                    item.title
                                )}
                            </strong>

                            <small>
                                ${escapeHtml(
                                    item.description
                                )}
                            </small>

                        </span>

                    </button>

                `
            )
            .join("");


    $$(".command-result")
        .forEach(
            button => {

                button.addEventListener(
                    "click",
                    () => {

                        const type =
                            button.dataset.commandType;

                        const id =
                            button.dataset.commandId;


                        closeModal(
                            "commandModal"
                        );


                        if (
                            type ===
                            "command"
                        ) {

                            executeCommand(
                                id
                            );

                        }

                        else {

                            const restaurant =
                                getRestaurantById(
                                    id
                                );

                            if (
                                restaurant
                            ) {

                                openRestaurantDetails(
                                    restaurant
                                );

                            }

                        }

                    }
                );

            }
        );

}


function executeCommand(
    id
) {

    switch (id) {

        case "home":
            setView("home");
            break;

        case "find":
            setView("find");
            break;

        case "nearby":
            setView("nearby");
            break;

        case "favorites":
            setView("favorites");
            break;

        case "profile":
            setView("profile");
            break;

        case "settings":
            setView("settings");
            break;

        case "help":
            openModal("helpModal");
            break;

        case "location":
            useMyLocation();
            break;

        case "theme":
            cycleTheme();
            break;

        default:
            break;

    }

}


/* =========================================================
   KEYBOARD
========================================================= */

function bindKeyboardShortcuts() {

    document.addEventListener(
        "keydown",
        event => {

            const element =
                document.activeElement;


            const typing =
                element &&
                (
                    element.tagName ===
                        "INPUT" ||

                    element.tagName ===
                        "TEXTAREA" ||

                    element.tagName ===
                        "SELECT" ||

                    element.isContentEditable
                );


            if (
                (
                    event.metaKey ||
                    event.ctrlKey
                ) &&
                event.key.toLowerCase() ===
                "k"
            ) {

                event.preventDefault();

                openModal(
                    "commandModal"
                );

                return;

            }


            if (
                event.key ===
                "Escape"
            ) {

                closeQuickMenu();

                closeModal(
                    "helpModal"
                );

                closeModal(
                    "commandModal"
                );

                closeModal(
                    "foodModal"
                );

                return;

            }


            if (
                typing
            ) {

                return;

            }


            const key =
                event.key.toLowerCase();


            const actions = {

                h:
                    () =>
                        setView(
                            "home"
                        ),

                f:
                    () =>
                        setView(
                            "find"
                        ),

                n:
                    () =>
                        setView(
                            "nearby"
                        ),

                l:
                    () =>
                        setView(
                            "favorites"
                        ),

                p:
                    () =>
                        setView(
                            "profile"
                        ),

                s:
                    () =>
                        setView(
                            "settings"
                        ),

                t:
                    () =>
                        cycleTheme(),

                "?":
                    () =>
                        openModal(
                            "helpModal"
                        )

            };


            if (
                actions[key]
            ) {

                event.preventDefault();

                actions[key]();

            }

        }
    );

}


/* =========================================================
   OPENING HOURS
========================================================= */

function getOpeningStatus(
    hours
) {

    if (
        !hours
    ) {

        return {
            known:
                false,

            open:
                false

        };

    }


    const clean =
        hours
            .trim()
            .toLowerCase();


    if (
        clean.includes(
            "24/7"
        )
    ) {

        return {
            known:
                true,

            open:
                true

        };

    }


    /*
      Basic parser for common OpenStreetMap formats:
      Mo-Fr 10:00-22:00
      Mo-Su 11:00-21:00
      11:00-22:00
    */


    const now =
        new Date();


    const day =
        now.getDay();


    const dayCode =
        [
            "Su",
            "Mo",
            "Tu",
            "We",
            "Th",
            "Fr",
            "Sa"
        ][day];


    const minutes =
        now.getHours() *
            60 +
        now.getMinutes();


    const segments =
        hours
            .split(";")
            .map(
                segment =>
                    segment.trim()
            )
            .filter(
                Boolean
            );


    let foundSchedule =
        false;


    for (
        const segment
        of segments
    ) {

        const timeMatch =
            segment.match(
                /(\d{1,2}):(\d{2})\s*-\s*(\d{1,2}):(\d{2})/
            );


        if (
            !timeMatch
        ) {

            continue;

        }


        const dayMatches =
            segment.match(
                /\b(Mo|Tu|We|Th|Fr|Sa|Su)\b/g
            );


        let dayAllowed =
            true;


        if (
            dayMatches &&
            dayMatches.length
        ) {

            dayAllowed =
                dayMatches.includes(
                    dayCode
                );


            const range =
                segment.match(
                    /(Mo|Tu|We|Th|Fr|Sa|Su)\s*-\s*(Mo|Tu|We|Th|Fr|Sa|Su)/
                );


            if (
                range
            ) {

                const order = [

                    "Mo",
                    "Tu",
                    "We",
                    "Th",
                    "Fr",
                    "Sa",
                    "Su"

                ];


                const start =
                    order.indexOf(
                        range[1]
                    );

                const end =
                    order.indexOf(
                        range[2]
                    );

                const current =
                    order.indexOf(
                        dayCode
                    );


                if (
                    start <= end
                ) {

                    dayAllowed =
                        current >= start &&
                        current <= end;

                }

            }

        }


        if (
            !dayAllowed
        ) {

            continue;

        }


        foundSchedule =
            true;


        const openMinutes =
            Number(
                timeMatch[1]
            ) *
                60 +
            Number(
                timeMatch[2]
            );


        const closeMinutes =
            Number(
                timeMatch[3]
            ) *
                60 +
            Number(
                timeMatch[4]
            );


        const open =
            closeMinutes <
            openMinutes

                ? (
                    minutes >= openMinutes ||
                    minutes <= closeMinutes
                  )

                : (
                    minutes >= openMinutes &&
                    minutes <= closeMinutes
                  );


        return {

            known:
                true,

            open

        };

    }


    return {

        known:
            foundSchedule,

        open:
            false

    };

}


/* =========================================================
   UTILITIES
========================================================= */

function formatDistance(
    km
) {

    const value =
        Number(
            km
        );


    if (
        !Number.isFinite(
            value
        )
    ) {

        return "Unknown distance";

    }


    if (
        value <
        1
    ) {

        return `${Math.round(
            value * 1000
        )} m`;

    }


    return `${value.toFixed(
        1
    )} km`;

}


function calculateDistanceKm(
    lat1,
    lon1,
    lat2,
    lon2
) {

    const radius =
        6371;


    const dLat =
        radians(
            lat2 -
            lat1
        );

    const dLon =
        radians(
            lon2 -
            lon1
        );


    const a =
        Math.sin(
            dLat /
            2
        ) ** 2 +

        Math.cos(
            radians(
                lat1
            )
        ) *

        Math.cos(
            radians(
                lat2
            )
        ) *

        Math.sin(
            dLon /
            2
        ) ** 2;


    const c =
        2 *
        Math.atan2(
            Math.sqrt(
                a
            ),
            Math.sqrt(
                1 - a
            )
        );


    return radius *
        c;

}


function radians(
    degrees
) {

    return (
        degrees *
        Math.PI /
        180
    );

}


function formatAddress(
    tags
) {

    const parts = [

        tags["addr:housenumber"] || "",

        tags["addr:street"] || "",

        tags["addr:district"] || "",

        tags["addr:city"] || "",

        tags["addr:postcode"] || ""

    ];


    return parts
        .map(
            item =>
                String(
                    item
                ).trim()
        )
        .filter(
            Boolean
        )
        .join(
            " "
        );

}


function normaliseTag(
    value
) {

    return String(
        value ||
        ""
    )
        .trim()
        .toLowerCase();

}


function formatTag(
    value
) {

    return String(
        value ||
        ""
    )
        .replaceAll(
            "_",
            " "
        )
        .replaceAll(
            ";",
            ", "
        );

}


function formatCuisine(
    cuisine
) {

    return cuisine
        .split(";")
        .map(
            item =>
                item
                    .trim()
                    .replaceAll(
                        "_",
                        " "
                    )
                    .replace(
                        /\b\w/g,
                        char =>
                            char.toUpperCase()
                    )
        )
        .filter(
            Boolean
        )
        .join(
            ", "
        );

}


function restaurantCuisineMatches(
    cuisineText,
    selectedCuisine
) {

    if (
        !cuisineText ||
        !selectedCuisine ||
        selectedCuisine ===
            "any"
    ) {

        return false;

    }


    const source =
        normaliseSearchText(
            cuisineText
        );


    const target =
        normaliseSearchText(
            selectedCuisine
        );


    if (
        source.includes(
            target
        ) ||
        target.includes(
            source
        )
    ) {

        return true;

    }


    const aliases = {

        japanese:
            [
                "japanese",
                "sushi",
                "ramen",
                "udon"
            ],

        korean:
            [
                "korean",
                "bibimbap",
                "korean barbecue"
            ],

        indian:
            [
                "indian",
                "curry",
                "south indian",
                "north indian"
            ],

        italian:
            [
                "italian",
                "pizza",
                "pasta"
            ],

        chinese:
            [
                "chinese",
                "dumpling",
                "noodle"
            ],

        taiwanese:
            [
                "taiwanese",
                "taiwan"
            ]

    };


    return (
        aliases[
            selectedCuisine.toLowerCase()
        ] ||
        [
            selectedCuisine
        ]
    )
        .some(
            alias =>
                source.includes(
                    normaliseSearchText(
                        alias
                    )
                )
        );

}


function restaurantIcon(
    cuisine
) {

    const text =
        normaliseSearchText(
            cuisine
        );


    if (
        text.includes(
            "pizza"
        ) ||
        text.includes(
            "italian"
        ) ||
        text.includes(
            "pasta"
        )
    ) {

        return "🍕";

    }


    if (
        text.includes(
            "japanese"
        ) ||
        text.includes(
            "sushi"
        ) ||
        text.includes(
            "ramen"
        )
    ) {

        return "🍣";

    }


    if (
        text.includes(
            "korean"
        )
    ) {

        return "🥘";

    }


    if (
        text.includes(
            "indian"
        ) ||
        text.includes(
            "curry"
        )
    ) {

        return "🪔";

    }


    if (
        text.includes(
            "chinese"
        ) ||
        text.includes(
            "dumpling"
        )
    ) {

        return "🥟";

    }


    if (
        text.includes(
            "taiwan"
        )
    ) {

        return "🥡";

    }


    if (
        text.includes(
            "cafe"
        ) ||
        text.includes(
            "coffee"
        )
    ) {

        return "☕";

    }


    return "🍽️";

}


function getDietaryBadges(
    restaurant
) {

    const result =
        [];


    if (
        restaurant.vegetarian ===
            "yes" ||
        restaurant.vegetarian ===
            "only"
    ) {

        result.push(
            `
                <span class="badge match-badge">
                    🥗 Veg
                </span>
            `
        );

    }


    if (
        restaurant.vegan ===
            "yes" ||
        restaurant.vegan ===
            "only"
    ) {

        result.push(
            `
                <span class="badge match-badge">
                    🌱 Vegan
                </span>
            `
        );

    }


    if (
        !result.length
    ) {

        result.push(
            `
                <span class="badge unknown-badge">
                    ℹ️ Diet unknown
                </span>
            `
        );

    }


    return result.join(
        ""
    );

}


function preferenceLabel(
    value,
    type
) {

    const labels = {

        diet: {

            none:
                "No Preference",

            vegetarian:
                "🥗 Vegetarian",

            vegan:
                "🌱 Vegan"

        },


        restriction: {

            none:
                "No Restriction",

            "no-eggs":
                "🥚 No Eggs",

            "no-dairy":
                "🥛 No Dairy",

            "no-peanuts":
                "🥜 No Peanuts"

        },


        budget: {

            any:
                "Any Budget",

            under100:
                "Under NT$100",

            "100-200":
                "NT$100–200",

            "200-300":
                "NT$200–300",

            "300plus":
                "NT$300+"

        },


        cuisine: {

            any:
                "Any Cuisine",

            Taiwanese:
                "🥡 Taiwanese",

            Chinese:
                "🥟 Chinese",

            Japanese:
                "🍣 Japanese",

            Korean:
                "🍜 Korean",

            Indian:
                "🪔 Indian",

            Italian:
                "🍝 Italian"

        },


        location: {

            nearby:
                "📍 Near My Location",

            anywhere:
                "Anywhere in Taiwan",

            Taipei:
                "Taipei",

            "New Taipei":
                "New Taipei",

            Taoyuan:
                "Taoyuan",

            Taichung:
                "Taichung",

            Tainan:
                "Tainan",

            Kaohsiung:
                "Kaohsiung"

        }

    };


    return (
        labels[type]?.[value] ||
        "Not set"
    );

}


function createMapUrl(
    latitude,
    longitude
) {

    return (
        "https://www.openstreetmap.org/" +
        "?mlat=" +
        encodeURIComponent(
            latitude
        ) +
        "&mlon=" +
        encodeURIComponent(
            longitude
        ) +
        "#map=18/" +
        encodeURIComponent(
            latitude
        ) +
        "/" +
        encodeURIComponent(
            longitude
        )
    );

}


function createMapEmbed(
    latitude,
    longitude
) {

    const delta =
        0.006;


    const left =
        longitude -
        delta;

    const right =
        longitude +
        delta;

    const bottom =
        latitude -
        delta;

    const top =
        latitude +
        delta;


    return (
        "https://www.openstreetmap.org/export/embed.html" +
        "?bbox=" +
        encodeURIComponent(
            `${left},${bottom},${right},${top}`
        ) +
        "&layer=mapnik" +
        "&marker=" +
        encodeURIComponent(
            `${latitude},${longitude}`
        )
    );

}


function safeExternalUrl(
    value
) {

    if (!value) {
        return "";
    }


    try {

        const url =
            new URL(
                String(
                    value
                ).trim()
            );


        if (
            url.protocol !==
                "http:" &&
            url.protocol !==
                "https:"
        ) {

            return "";

        }


        return url.href;

    }

    catch {

        return "";

    }

}


function stripRestaurant(
    restaurant
) {

    return {

        uid:
            restaurant.uid,

        name:
            restaurant.name,

        cuisine:
            restaurant.cuisine ||
            "",

        latitude:
            restaurant.latitude,

        longitude:
            restaurant.longitude,

        distanceKm:
            restaurant.distanceKm,

        image:
            restaurant.image ||
            "",

        website:
            restaurant.website ||
            "",

        menuUrl:
            restaurant.menuUrl ||
            "",

        address:
            restaurant.address ||
            "",

        openingHours:
            restaurant.openingHours ||
            "",

        vegetarian:
            restaurant.vegetarian ||
            "",

        vegan:
            restaurant.vegan ||
            "",

        phone:
            restaurant.phone ||
            "",

        amenity:
            restaurant.amenity ||
            "restaurant"

    };

}


function shareRestaurant(
    restaurant
) {

    const map =
        createMapUrl(
            restaurant.latitude,
            restaurant.longitude
        );


    const data = {

        title:
            `FoodMatch — ${restaurant.name}`,

        text:
            `${restaurant.name} — discovered on FoodMatch Taiwan.`,

        url:
            map

    };


    if (
        navigator.share &&
        window.isSecureContext
    ) {

        navigator.share(
            data
        )
            .catch(
                error => {

                    if (
                        error.name !==
                        "AbortError"
                    ) {

                        showToast(
                            "Could not share."
                        );

                    }

                }
            );

        return;

    }


    if (
        navigator.clipboard &&
        window.isSecureContext
    ) {

        navigator.clipboard
            .writeText(
                `${restaurant.name}\n${map}`
            )
            .then(
                () =>
                    showToast(
                        "Restaurant link copied."
                    )
            )
            .catch(
                () =>
                    showToast(
                        "Copy failed."
                    )
            );

        return;

    }


    const textarea =
        document.createElement(
            "textarea"
        );

    textarea.value =
        `${restaurant.name}\n${map}`;

    textarea.style.position =
        "fixed";

    textarea.style.opacity =
        "0";

    document.body.appendChild(
        textarea
    );

    textarea.select();

    document.execCommand(
        "copy"
    );

    textarea.remove();

    showToast(
        "Restaurant link copied."
    );

}


function normaliseSearchText(
    value
) {

    return String(
        value ||
        ""
    )
        .toLowerCase()
        .normalize(
            "NFD"
        )
        .replace(
            /[\u0300-\u036f]/g,
            ""
        )
        .trim();

}


function capitalize(
    text
) {

    if (!text) {
        return "";
    }


    return (
        text.charAt(
            0
        ).toUpperCase() +
        text.slice(
            1
        )
    );

}


function escapeHtml(
    value
) {

    return String(
        value ??
        ""
    )
        .replaceAll(
            "&",
            "&amp;"
        )
        .replaceAll(
            "<",
            "&lt;"
        )
        .replaceAll(
            ">",
            "&gt;"
        )
        .replaceAll(
            '"',
            "&quot;"
        )
        .replaceAll(
            "'",
            "&#039;"
        );

}


function escapeAttribute(
    value
) {

    return escapeHtml(
        value
    );

}


/* =========================================================
   REFRESH
========================================================= */

function refreshVisibleLists() {

    if (
        state.activeView ===
        "nearby"
    ) {

        renderNearbyRestaurants();

    }


    if (
        state.activeView ===
        "find"
    ) {

        applyMatchFiltersAndSort();

    }


    if (
        state.activeView ===
        "favorites"
    ) {

        renderFavorites();

    }


    renderProfile();

}


/* =========================================================
   ERROR / LOADING
========================================================= */

function renderLoading(
    container
) {

    if (!container) {
        return;
    }


    container.innerHTML =

        Array.from(
            {
                length:
                    6
            }
        )
            .map(
                () => `

                    <article
                        class="restaurant-card"
                    >

                        <div
                            class="restaurant-media"
                        ></div>

                        <div
                            class="restaurant-card-body"
                        >

                            <div
                                style="
                                    height:17px;
                                    width:70%;
                                    border-radius:8px;
                                    background:var(--surface-3);
                                "
                            ></div>

                            <div
                                style="
                                    height:10px;
                                    width:45%;
                                    margin-top:9px;
                                    border-radius:8px;
                                    background:var(--surface-3);
                                "
                            ></div>

                            <div
                                style="
                                    height:10px;
                                    width:90%;
                                    margin-top:18px;
                                    border-radius:8px;
                                    background:var(--surface-3);
                                "
                            ></div>

                        </div>

                    </article>

                `
            )
            .join("");

}


function renderRestaurantError(
    container
) {

    if (!container) {
        return;
    }


    container.innerHTML = `

        <div class="empty-state">

            <div class="empty-icon">
                ⚠️
            </div>

            <h3>
                Restaurant data could not be loaded
            </h3>

            <p>
                The restaurant-data service may be temporarily unavailable.
            </p>

            <button
                class="primary-button"
                id="retryRestaurants"
            >
                ↻ Try Again
            </button>

        </div>

    `;


    $("#retryRestaurants")
        ?.addEventListener(
            "click",
            () => {

                if (
                    state.userLocation
                ) {

                    loadNearbyRestaurants(
                        state.userLocation.latitude,
                        state.userLocation.longitude,
                        state.nearbyRadius
                    );

                }

            }
        );

}


function renderMatchError() {

    const container =
        $("#matchResults");


    if (!container) {
        return;
    }


    container.innerHTML = `

        <div class="empty-state">

            <div class="empty-icon">
                🔎
            </div>

            <h3>
                No matches yet
            </h3>

            <p>
                Choose a location and then search for your matches.
            </p>

        </div>

    `;

}


/* =========================================================
   TOAST
========================================================= */

let toastTimer =
    null;


function showToast(
    message
) {

    const toast =
        $("#toast");

    const text =
        $("#toastMessage");


    if (
        !toast ||
        !text
    ) {
        return;
    }


    text.textContent =
        message;


    toast.classList.add(
        "show"
    );


    clearTimeout(
        toastTimer
    );


    toastTimer =
        setTimeout(
            () =>
                toast.classList.remove(
                    "show"
                ),
            2600
        );

}


/* =========================================================
   MISC
========================================================= */

function bindMiscellaneous() {

    const backToTop =
        $("#backToTop");


    window.addEventListener(
        "scroll",
        () => {

            if (!backToTop) {
                return;
            }


            backToTop.classList.toggle(
                "visible",
                window.scrollY >
                500
            );

        }
    );


    backToTop?.addEventListener(
        "click",
        () =>
            window.scrollTo(
                {
                    top:
                        0,

                    behavior:
                        state.settings.reduceMotion
                            ? "auto"
                            : "smooth"
                }
            )
    );


    window.matchMedia(
        "(prefers-color-scheme: dark)"
    )
        .addEventListener?.(
            "change",
            () => {

                if (
                    state.settings.theme ===
                    "system"
                ) {

                    applySettings();

                }

            }
        );

}