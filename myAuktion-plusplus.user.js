// ==UserScript==
// @name         MyAuktion++
// @namespace    http://tampermonkey.net/
// @version      2026-06-17
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
    
    if(topNavBar) {
        topNavBar.style = "background-color: darkgreen;";

        let configBtn = document.createElement("button");
        configBtn.textContent = "⚙️ Config Bidders";
        configBtn.style.cssText = "margin-left: 15px; padding: 2px 8px; cursor: pointer; color: black; background: white; border-radius: 4px; border: 1px solid #ccc;";
        configBtn.onclick = function(e) {
            e.preventDefault();
            let currentList = JSON.parse(localStorage.getItem("myAuktion_hoechstbieter_list") || "[]");
            let input = prompt("Enter a comma-separated list of strings to check against 'hoechstbieter':", currentList.join(", "));
            if (input !== null) {
                let newList = input.split(",").map(s => s.trim()).filter(s => s.length > 0);
                localStorage.setItem("myAuktion_hoechstbieter_list", JSON.stringify(newList));
                alert("List saved! Reloading page...");
                location.reload();
            }
        };
        topNavBar.appendChild(configBtn);
    }

    let hoechstbieterElement = document.getElementById("hoechstbieter");
    if (hoechstbieterElement && hoechstbieterElement.children.length > 0) {
        let hoechstbieterText = hoechstbieterElement.children[0].innerHTML;
        let checkList = JSON.parse(localStorage.getItem("myAuktion_hoechstbieter_list") || "[]");

        let matched = checkList.some(item => hoechstbieterText.includes(item));
        if (matched) {
            hoechstbieterElement.style.backgroundColor = "yellow";
            hoechstbieterElement.style.color = "red";
            hoechstbieterElement.style.fontWeight = "bold";
            hoechstbieterElement.style.padding = "2px";
            console.log("MyAuktion++: Hoechstbieter check matched -> " + hoechstbieterText);
        }
    }

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
            "Cellphone Case", "Handy Hülle", "Handyhülle", "Silicone Case", "Silikon Case", "Clear Case", "Fashion Case", "Protective Case", "Cover Soft", "Cover MagSafe", "Book Elegance", "Wallet Case",
            "Screen Protector", "Schutzglas", "Panzerglas", "Panserglas", "Frame Cover", "Schutzhülle", "Schutzfolie", "Tempered Glass", "Camera Protector", "Grip Case", "Book type Hülle", "Case Iphone", "Case für Iphone", "Case for Iphone", "Hülle für Iphone", "Hülle Iphone", "Leather Case", "Ipad Hülle", "Watch Case", "Camera Lens Protector", "S Pen Case",
            "Trimmer", "Shaver", "Shaving", "Rasierapparat", "Haarschneider",
            "Lasertoner", "Tintenpatrone", "Druckerpatrone", "Ink Cartridge", "Ink Jet Cartridge", "Tonerkartusche", "Toner Cartridge", "Print Cartridge", "Epson Multipack", "Druckpatrone", "Druckerpatrone", "Canon Pixma", "Ricoh Cartridge", "Canon Cartridge", "305XL Black", "HP Laserjet",
            "MagPro", "Apple TV", "iMac", "AirPods", "Apple Watch", "Pencil für I",
            "Vaptio", "Iqos", "Livington", "The Monsters Pop", "Mediashop",
            "Set-Top-Box", "Satellitenkabel", "Telefonkabel", "Sky Rec",
            "Tastaturkappen", "Baby Night Light", "Schnuller", "Baby Care", "Pampers", "Windeln", "Baby Safety", "Baby Fitness",
            "IPL Hair Remov", "Flexibrush", "Eyelash Curler", "Eyeshadow", "Eye Shadow", "Haarstyler", "Hair Dye", "Hairbrush", "Hair Styler", "Lockenstab", "Haartrockner",
            "Haarfärb", "Nagellack",
            "Wasserfilter", "Ontap Filter", "Replacement Filter", "Air Filter", "Fuel Filter", "Ersatzfilter", "Luftreiniger", "Filtration Media", "Luftfilter", "Öl-Filter", "Öl Filter", "Ölfilter", "schlauch Filter", "Duschfilter",
            "Bügeleisen", "Bügelstation", "Kontaktgrill", "Portable Electronic Scale", "Luggage Scale", "Brotbackautomat", "Screen Replacement", "Display Kit", "Fritteuse", "Air fry", "plastic apparatus",
            "Blutzucker", "AirFit", "Hearing Aid", "Beatmungsgerät", "CPAP", "CPAT", "Accu Check", "Accu-Check", "Accu-Chek", "Massage Belt", "Massagebürste",
            "Telemat Sensormatte",
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
            "McDonalds", "MC Donalds",
            "Diverse Schrauben", "Scharnier", "Schanier", "Einstemmtürschloss", "Spül Kasten", "Spülkasten", "Farbroller", "Kärcher Bodendüse", "Druckregler",
            "Kugelhahn", "Leichtzuschlagstoff", "Forstmarkier", "Kerbl Forst", "Forwtmarkier", "Ventilheizkörper", "Urinal", "Bodenwachs", "Spachtelmasse", "Acryldichtstoff",
            "Stein Versiegelung", "Platten Versiegelung", "Stelzlager", "Diverse Metall Halterung", "Lochsägenbohrer", "Fächerschleifscheibe",
            "Sägekette", "Einfachhaken", "TechniSat Montageplatte", "3D Printing Resin", "Unterboden", "Rohrverbinder", "Stahlzargen", "Abgas", "Stichsägenbl",
            "Nagelrolle", "Farbwalze", "Rubber Roller", "Gummi Roller", "Mähmesser", "Holzseife", "Carver Deterol", "Wood Stain", "Wippschalter", "Stahlkette",
            "Sechskantschraub", "Gas Heater", "Lochband", "Klemmring", "Mörtel", "Sockelfuss", "Diverse Türschlösser", "Zugfeder", "Handbrause", "Bau Eimer",
            "Bau Kasten", "Bau Kübel", "Nietzange", "Wickelfalzrohr", "Gewindeverschraub", "Spannzange", "Ladewagenmesser", "Tragrolle", "Infusionsstativ",
            "Spezialschnalle", "Zylinderkopf", "Objektträger", "Tapered Roller Bearing", "Lagerbolzen", "Hydraulileitung", "Hydraulikleitung", "Hydraulisches Verbindungsteil",
            "Schwaderzinken", "Ersatzteile für BMW", "Swagelok", "Atemgerät", "Rückschlag Ventil", "Rückschlagventil", "Sprossenschuh", "Reibahle", "Erodierfilter",
            "Rillenkugellager", "Flange Bolts", "Kraftstofffilter", "Softstarter", "Sofstarter", "Kupplungsdose", "Ölfilter", "A1 Hybrid Box", "Stihl Ladegerät",
            "Tragbarer CD Player", "Toner Collection", "Resin Cartridge", "Cooler Evaporative", "Hot Air Styler", "Controller Stand", "Headphone Stand", "Breast Pump",
            "Espresso Maker", "Toaster", "Espresso Machine", "Oilfree Radiator", "Steam Generator Iron", "Magenta home Box", "Magenta Speedport", "Reiskocher", "Necklight",
            "Wasserkocher", "Vibroshaper", "Case for iPad", "Fluorescent Lamp", "TV Wandhalterung", "Magenta Home Box", "Glätteisen", "Glühlampe", "Phone Video Amplifier",
            "Vorwerk Kobold", "Wassersprudler", "Toner Kartusche", "Drum Unit", "Hörgeräte", "MF Phonak", "Raclette", "Miele Unterkorb", "LED-Unterflur"
        ].map(t => t.toLowerCase());

    catalogues.forEach(table => {
        table.querySelectorAll("tbody tr")
             .forEach(row => {
            const text = row.querySelector("td h3")?.textContent.toLowerCase() ?? "";

            for (let i = 0; i < filteredTerms.length; i++) {
                const term = filteredTerms[i];

                if (text.includes(term)) {
                    row.style.display = "none";
                    console.log(`Found [${term}] in "${text}"`);
                    break;
                }
            }
        });
    });

    // TODO: Highlight articles with same article nr. (and ideally group them together)
    // TODO: Endless scroll
})();
