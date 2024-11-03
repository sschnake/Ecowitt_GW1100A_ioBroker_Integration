
# Ecowitt GW1100A ioBroker Integration

This repository contains a JavaScript script for integrating the Ecowitt GW1100A weather station with ioBroker.
The script fetches JSON data from the weather station, processes it, and stores the values as ioBroker variables.

## Features

- Automatically fetches data from the Ecowitt GW1100A via its local API.
- Extracts numeric values from the JSON data and maps them to readable variable names.
- Supports automatic creation and updating of ioBroker variables.
- Adds human-readable wind direction as a text variable.

## Requirements

- ioBroker installed with the `http` adapter.
- IP address of your Ecowitt GW1100A gateway accessible from the ioBroker server.

## Installation

1. Download the `Ecowitt_GW1100A_ioBroker_Integration.js` script from this repository.
2. Place it in your ioBroker scripts directory.
3. Update the IP address in the script with your Ecowitt gateway's IP address.
4. Run the script in ioBroker JavaScript instance.

## Usage

The script will periodically fetch data from the GW1100A gateway and update the relevant ioBroker variables.

## Example JSON Structure from GW1100A

Below is a sample JSON response from the GW1100A gateway, for reference.

```json
{
    "common_list": [
        { "id": "0x02", "val": "17.8", "unit": "C" },
        { "id": "0x07", "val": "53%" },
        { "id": "3", "val": "17.8", "unit": "C" },
        { "id": "0x0B", "val": "0.0 km/h" },
        { "id": "0x15", "val": "32.64 W/m2" },
        { "id": "0x0A", "val": "336" }
    ],
    "rain": [
        { "id": "0x0D", "val": "0.0 mm" },
        { "id": "0x10", "val": "0.8 mm" }
    ],
    "wh25": [
        { "intemp": "2.7", "unit": "C", "inhumi": "75%", "abs": "1022.4 hPa", "rel": "1022.4 hPa" }
    ]
}
```

## License

This project is licensed under the MIT License.
