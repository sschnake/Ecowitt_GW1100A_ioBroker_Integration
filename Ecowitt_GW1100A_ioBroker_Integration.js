const request = require('request'); // Modul für HTTP-Anfragen
const url = "http://IP_DES_GATEWAYS/get_livedata_info"; // Ersetzen Sie IP_DES_GATEWAYS durch die IP-Adresse des Gateways

// Mapping der IDs zu lesbaren Namen
const idMap = {
    "0x02": "Außentemperatur",
    "0x07": "Außenluftfeuchtigkeit",
    "3": "Innentemperatur",
    "0x03": "Bodentemperatur",
    "0x0B": "Windgeschwindigkeit_aktuell",
    "0x0C": "Windboeen",
    "0x19": "Windgeschwindigkeit_Durchschnitt",
    "0x15": "SolareStrahlung",
    "0x17": "UVIndex",
    "0x0A": "Windrichtung",  // Gradwert für die Windrichtung
    "0x0D": "Regen_last_hour",
    "0x0E": "Regenrate",
    "0x10": "Regen_last_24h",
    "0x11": "Regen_last_week",
    "0x12": "Regen_last_month",
    "0x13": "Regen_total"
};

// Funktion zum Erstellen und Setzen der Variablen, bereinigt die Einheiten aus dem Wert
function createOrUpdateVariable(name, value, unit = "", type = "number") {
    const id = `javascript.0.weather.${name}`;
    if (typeof value === "string") {
        // Entferne Einheiten aus dem Wert, behalte nur die Zahl
        value = parseFloat(value.replace(/[^\d.-]/g, ""));
    }
    if (!existsState(id)) {
        createState(id, {name: name, unit: unit, type: type, def: value});
    }
    setState(id, value);
}

// Funktion zum Erzwingen von Text für Windrichtung_Text
function createOrUpdateTextVariable(name, textValue) {
    const id = `javascript.0.weather.${name}`;
    if (!existsState(id)) {
        createState(id, {name: name, type: "string", def: textValue});
    }
    setState(id, textValue.toString());
}

// Funktion, um den Gradwert in eine Windrichtung als Text umzuwandeln
function windDirectionToText(degrees) {
    if (degrees >= 337.5 || degrees < 22.5) return "Nord";
    else if (degrees >= 22.5 && degrees < 67.5) return "Nordost";
    else if (degrees >= 67.5 && degrees < 112.5) return "Ost";
    else if (degrees >= 112.5 && degrees < 157.5) return "Südost";
    else if (degrees >= 157.5 && degrees < 202.5) return "Süd";
    else if (degrees >= 202.5 && degrees < 247.5) return "Südwest";
    else if (degrees >= 247.5 && degrees < 292.5) return "West";
    else return "Nordwest";
}

// Hauptfunktion zur Aktualisierung der Wetterdaten
function updateWeatherData() {
    request(url, (error, response, body) => {
        if (!error && response.statusCode === 200) {
            try {
                const data = JSON.parse(body);
                
                // Daten aus common_list verarbeiten
                data.common_list.forEach(item => {
                    const name = idMap[item.id] || item.id;
                    const value = item.val;
                    const unit = item.unit || "";

                    if (name === "Windrichtung") {
                        createOrUpdateVariable(name, parseFloat(value), "°", "number");
                        // Erstelle die Textvariable für die Windrichtung
                        const directionText = windDirectionToText(parseFloat(value));
                        createOrUpdateTextVariable("Windrichtung_Text", directionText); // Erzwinge Text
                    } else {
                        createOrUpdateVariable(name, value, unit);
                    }
                });

                // Daten aus rain verarbeiten
                data.rain.forEach(item => {
                    const name = idMap[item.id] || item.id;
                    const value = item.val;
                    createOrUpdateVariable(name, value, "mm");
                });

                // Daten aus wh25 (Innenumgebung) verarbeiten
                const wh25Data = data.wh25[0];
                createOrUpdateVariable("Innen_Temperatur", wh25Data.intemp, "C");
                createOrUpdateVariable("Innen_Luftfeuchtigkeit", parseInt(wh25Data.inhumi), "%");
                createOrUpdateVariable("Luftdruck_absolut", wh25Data.abs, "hPa");
                createOrUpdateVariable("Luftdruck_relativ", wh25Data.rel, "hPa");

                console.log("Wetterdaten erfolgreich aktualisiert.");
            } catch (error) {
                console.error("Fehler beim Verarbeiten der Daten: ", error);
            }
        } else {
            console.error("Fehler beim Abrufen der Daten: ", error || `Status: ${response.statusCode}`);
        }
    });
}

// Erster Aufruf und Intervall starten
updateWeatherData();
setInterval(updateWeatherData, 60000); // Aktualisierung alle 60 Sekunden
