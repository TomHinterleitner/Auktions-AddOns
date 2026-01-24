// ==UserScript==
// @name         MyAuktion++
// @namespace    http://tampermonkey.net/
// @version      2026-01-24
// @description  Improves the MyAuktion UI a bit, e.g. by automatically filtering less interesting items
// @author       Thomas H.
// @match        https://myauktion.com/*
// @match        https://www.myauktion.com/*
// @icon         https://www.myauktion.com/favicon.ico
// @grant        none
// @downloadURL  https://raw.githubusercontent.com/TomHinterleitner/Auktions-AddOns/refs/heads/main/myAuktion-plusplus.user.js
// @updateURL    https://raw.githubusercontent.com/TomHinterleitner/Auktions-AddOns/refs/heads/main/myAuktion-plusplus.user.js
// ==/UserScript==

(function() {
    'use strict';

    // Re-Color NavBar as reminder this script is active
    let topNavBar = document.getElementById("top");
    if(topNavBar) topNavBar.style = "background-color: darkgreen;";

    let allTables = Array.from(document.getElementsByClassName("katalog"));
    if(!allTables.length) return;

    // Currently, pageSelectors is just used as filter
    const pageSelectors = allTables.filter(
      table =>
        table.tBodies[0]?.rows.length === 1 &&
        table.tBodies[0].rows[0].id === ''
    );

    const catalogues = allTables.filter(
        table => !pageSelectors.includes(table)
    );

    // TODO: Tampermonkey Script Settings UI for User-Configurable (groups of) filter terms
    let filteredTerms =
        [
            "Toothbrush", "Bürstenkopf", "Bürstenköpf", "Oral B", "Zahnbürste", "sonicare", "soni care",
            "Cellphone Case", "Handy Hülle", "Handyhülle", "Silicone Case", "Silikon Case", "Clear Case", "Fashion Case",
            "Screen Protector", "Schutzglas", "Panzerglas", "Panserglas", "Frame Cover", "Schutzhülle", "Schutzfolie", "Tempered Glass", "Camera Protector", "Grip Case", "Book type Hülle", "Case Iphone", "Hülle für Iphone", "Hülle Iphone", "Leather Case", "Ipad Hülle",
            "Trimmer", "Shaver", "Shaving", "Rasierapparat", "Haarschneider",
            "Lasertoner", "Tintenpatrone", "Druckerpatrone", "Ink Cartridge", "Ink Jet Cartridge", "Tonerkartusche", "Toner Cartridge", "Print Cartridge", "Epson Multipack", "Druckpatrone", "Canon Pixma Multipack", "Ricoh Cartridge", "Canon Cartridge", "305XL Black",
            "MagPro", "Apple TV", "iMac", "AirPods",
            "Vaptio", "Iqos", "Livington", "The Monsters Pop",
            "Set-Top-Box", "Satellitenkabel",
            "Tastaturkappen", "Baby Night Light", "Schnuller", "Baby Care", "Pampers", "Windeln", "Baby Safety", "Baby Fitness",
            "IPL Hair Remov", "Flexibrush", "Eyelash Curler", "Eyeshadow", "Eye Shadow", "Haarstyler", "Hair Dye", "Hairbrush", "Hair Styler",
            "Haarfärb", "Nagellack",
            "Wasserfilter", "Ontap Filter", "Replacement Filter", "Air Filter", "Fuel Filter", "Ersatzfilter", "Luftreiniger", "Filtration Media", "Luftfilter", "Öl-Filter", "Öl Filter", "Ölfilter", "schlauch Filter",
            "Bügeleisen", "Bügelstation", "Kontaktgrill", "Portable Electronic Scale", "Luggage Scale", "Brotbackautomat", "Screen Replacement", "Display Kit",
            "Blutzucker", "AirFit", "Hearing Aid", "Beatmungsgerät", "CPAP", "CPAT", "Accu Check", "Accu-Check", "Accu-Chek", "Massage Belt", "Massagebürste",
            "Dexcom", "orthese", "fersensohlen", "knieschiene", "One Touch Delicia", "OneTouch Delic", "Hornhaute",
            "Staubsauger", "Vacuum Cleaner", "Pure Era Microfiber Bag", "Dyson", "Roomba", "Hypoallergen", "Vacuumierbeutel", "Pet Grooming",
            "Emporia", "Fujifilm", "Siemens EQ Series", "Handheld Magnifier", "Turmventilator", "Turmventillator", "Verdampfer",
            "Motoröl", "Liqui Moly", "Liquid Moly", "Adamol", "Mannol", "Shell Helix", "Castrol Edge",
            "Bremsbelag", "Bremsbeläge", "Fußmatte", "Floor Mat", "Heckleuchte", "Mopedsitz", "Kennzeichenhalter", "Kühlerschutz",
            "Antriebskette", "Spurstange",
            "Teller", "Holzfigur", "Toilette", "WC-Sitz", "Tasse", "Servierplatte", "Holzplatte", "Alufelge", "Reifen", "Kaminuhr",
            "Matratze", "Teppich", "Schläger", "Bilderrahmen", "Champagner", "Stofftier", "Plüsch", "Katze", "Reptilien",
            "Blazer", "Pullover", "Bluse", "Kleid", "Jacke", "Oberteil", "Hoodie", "Shirt", "Gürtel", "H&M", "Jeans",
            "Leggings", "Overall", "Badeanzug", "Socken", "Einlegesohl", "Pfeifen Reiniger", "Geschirrtuch", "Fliesen",
            "Ottakringer", "Bier", "Besteck", "Wäscheständer", "Augustiner Bräu",
            "Gewürz", "Salz", "Kräuter", "Pfeffer", "Rosmarin", "Paprika", "Cumin", "Chillies",
            "Dekoration", "Dart", "Lesebrille", "Perlen", "Meditation", "Geldtasche", "Geldbeutel", "Kontaktlinse", "Pantys",
            "Perfume", "Parfüm", "Eyeliner", "Wimpern", "Lockenwickler", "Ohrringe", "Ohr ringe", "Collagen Stimulation",
            "Shower Head", "Duschkopf", "Geschenk", "Kerze", "Kalender", "Advent", "Schmuck", "Haarreif",
            "Machine Cleaning Tablets", "Tischläufer", "Tischdecke", "Garderobenhaken", "Haarklammer", "Necklace", "Drumsticks", "Unterwäsche",
            "Kissenfüllung", "Schuhabstreifer", "Shoulder Rest", "Latzschürze", "Vorbinder", "Nagelfeile", "Nagelhaut", "Dünger",
            "Picture frame", "Bilderrahmen", "Bilderahmen", "Bilder mit Rahmen", "Helm", "Curtain Rod", "Butt-Löffel", "Butt Haken", "Football", "Fußball",
            "Nachttisch", "Kappe", "Pillow", "Hobbygarden", "Schwimmflügel", "Schwimm flügel", "Schwimmweste", "Schwimm weste", "Bierpong", "Bier pong",
            "Kleister", "Vlies", "Saatmischung", "Fahrradsattel", "Schuhschrank", "Kosmetikbedarf", "Friseur", "Kosmetik",
            "Strumpfhose", "Sammelalbum", "Köder", "Erstkommunion", "Erinnerungsbuch", "CO2 Cylinder", "Topfunter",
            "Fitnessgewicht", "Makeup", "Künstliche Pflanze", "Künstliche Blume", "Windmühle", "Poker Cards", "Poker Karten", "Straßenmal",
            "Contouring Face", "Obstschale", "Fensterwischer", "Rasensamen",
            "McDonalds", "MC Donalds"
        ].map(t => t.toLowerCase());

    catalogues.forEach(table => {
        table.querySelectorAll("tbody tr")
             .forEach(row => {
            const text = row.querySelector("td h3")?.textContent.toLowerCase() ?? "";

            if (filteredTerms.some(term => text.includes(term))) {
                row.style.display = "none";
                console.log("Found [" + term + "] in \"" + text + "\"");
            }
        });
    });

    // TODO: Highlight articles with same article nr. (and ideally group them together)
    // TODO: Endless scroll
})();
