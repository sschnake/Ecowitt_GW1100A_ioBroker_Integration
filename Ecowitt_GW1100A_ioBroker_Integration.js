
const request = require('request'); // Module for HTTP requests
const url = "http://IP_DES_GATEWAYS/get_livedata_info"; // Replace IP_DES_GATEWAYS with the IP address of the gateway

// Mapping of IDs to readable names
const idMap = {
    "0x02": "Outside Temperature",
    "0x07": "Outside Humidity",
    "3": "Inside Temperature",
    "0x03": "Soil Temperature",
    "0x0B": "Wind Speed Current",
    "0x0C": "Wind Gust",
    "0x19": "Average Wind Speed",
    "0x15": "Solar Radiation",
    "0x17": "UV Index",
    "0x0A": "Wind Direction",  // Degree value for wind direction
    "0x0D": "Rain Last Hour",
    "0x0E": "Rain Rate",
    "0x10": "Rain Last 24h",
    "0x11": "Rain Last Week",
    "0x12": "Rain Last Month",
    "0x13": "Total Rain"
};

// Function to create and update variables, cleans units from the value
function createOrUpdateVariable(name, value, unit = "", type = "number") {
    const id = `javascript.0.weather.${name}`;
    if (typeof value === "string") {
        // Remove units from value, keeping only the number
        value = parseFloat(value.replace(/[^\d.-]/g, ""));
    }
    if (!existsState(id)) {
        createState(id, {name: name, unit: unit, type: type, def: value});
    }
    setState(id, value);
}

// Function to convert degree value to wind direction as text
function windDirectionToText(degrees) {
    if (degrees >= 337.5 || degrees < 22.5) return "North";
    else if (degrees >= 22.5 && degrees < 67.5) return "Northeast";
    else if (degrees >= 67.5 && degrees < 112.5) return "East";
    else if (degrees >= 112.5 && degrees < 157.5) return "Southeast";
    else if (degrees >= 157.5 && degrees < 202.5) return "South";
    else if (degrees >= 202.5 && degrees < 247.5) return "Southwest";
    else if (degrees >= 247.5 && degrees < 292.5) return "West";
    else return "Northwest";
}

// Main function to update weather data
function updateWeatherData() {
    request(url, (error, response, body) => {
        if (!error && response.statusCode === 200) {
            try {
                const data = JSON.parse(body);
                
                // Process data from common_list
                data.common_list.forEach(item => {
                    const name = idMap[item.id] || item.id;
                    const value = item.val;
                    const unit = item.unit || "";

                    if (name === "Wind Direction") {
                        createOrUpdateVariable(name, parseFloat(value), "°", "number");
                        // Create text variable for wind direction
                        const directionText = windDirectionToText(parseFloat(value));
                        createOrUpdateVariable("Wind Direction Text", directionText, "", "string");
                    } else {
                        createOrUpdateVariable(name, value, unit);
                    }
                });

                // Process data from rain
                data.rain.forEach(item => {
                    const name = idMap[item.id] || item.id;
                    const value = item.val;
                    createOrUpdateVariable(name, value, "mm");
                });

                // Process data from wh25 (indoor environment)
                const wh25Data = data.wh25[0];
                createOrUpdateVariable("Indoor Temperature", wh25Data.intemp, "C");
                createOrUpdateVariable("Indoor Humidity", parseInt(wh25Data.inhumi), "%");
                createOrUpdateVariable("Absolute Pressure", wh25Data.abs, "hPa");
                createOrUpdateVariable("Relative Pressure", wh25Data.rel, "hPa");

                console.log("Weather data updated successfully.");
            } catch (error) {
                console.error("Error processing data: ", error);
            }
        } else {
            console.error("Error fetching data: ", error || `Status: ${response.statusCode}`);
        }
    });
}

// Initial call and start interval
updateWeatherData();
setInterval(updateWeatherData, 60000); // Update every 60 seconds
