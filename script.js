const fuelData = {
    "East Coast": 3.08, "New England": 3.308, "Central Atlantic": 3.5, "Lower Atlantic": 2.943,
    "Midwest": 2.861, "Gulf Coast": 2.669, "Rocky Mountain": 2.987, "West Coast": 3.926, "Colorado": 2.775,
    "Florida": 2.935, "New York": 3.473, "Minnesota": 2.928, "Ohio": 2.778, "Texas": 2.598,
    "Washington": 4.102, "Cleveland": 2.873, "Miami": 3.061, "Seattle": 4.339
};

const electricityRate = 0.13; // Average electricity cost per kWh
let selectedLocations = []; // Array to hold selected locations

document.addEventListener('DOMContentLoaded', function() {
    populateLocationDropdown();
    updateSliderDisplay();
    document.getElementById('electricityRateDisplay').textContent = electricityRate.toFixed(3);
});

function populateLocationDropdown() {
    const locationSelect = document.getElementById('locationSelect');
    Object.keys(fuelData).forEach(location => {
        const option = document.createElement('option');
        option.value = location;
        option.textContent = location;
        locationSelect.appendChild(option);
    });
}

function addLocation() {
    const locationSelect = document.getElementById('locationSelect');
    const location = locationSelect.value;
    if (!selectedLocations.includes(location)) {
        selectedLocations.push(location);
        updateSelectedLocationsDisplay();
        updateAverageGasPriceInfo(location);
    }
}

function updateSelectedLocationsDisplay() {
    const locationsDiv = document.getElementById('selectedLocations');
    locationsDiv.innerHTML = `<p>Selected Locations: ${selectedLocations.join(', ')}</p>`;
}

function updateAverageGasPriceInfo(location) {
    const averageGasPrice = fuelData[location];
    const gasPriceInfoDiv = document.getElementById('averageGasPriceInfo');
    gasPriceInfoDiv.innerHTML += `<p>Average Gasoline Price in ${location}: $${averageGasPrice.toFixed(3)} per gallon</p>`;
}

function updateSliderDisplay() {
    document.getElementById('annualMileageDisplay').textContent = document.getElementById('annualMileage').value;
    document.getElementById('gasCarMpgDisplay').textContent = document.getElementById('gasCarMpg').value;
    document.getElementById('teslaPriceDisplay').textContent = document.getElementById('teslaPrice').value;
    document.getElementById('gasCarPriceDisplay').textContent = document.getElementById('gasCarPrice').value;
}

function calculateAndPlotCosts() {
    if (selectedLocations.length === 0) {
        alert("Please select at least one location.");
        return;
    }
    const annualMileage = parseFloat(document.getElementById('annualMileage').value);
    const gasCarEfficiency = parseFloat(document.getElementById('gasCarMpg').value);
    const teslaPrice = parseFloat(document.getElementById('teslaPrice').value);
    const gasCarPrice = parseFloat(document.getElementById('gasCarPrice').value);

    let teslaCostData = calculateCostsForTesla(annualMileage, teslaPrice);
    let plotData = [getTeslaPlotData(teslaCostData)];
    let breakEvenPoints = [];

    selectedLocations.forEach(location => {
        const gasCarData = getGasCarPlotData(location, annualMileage, gasCarEfficiency, gasCarPrice, teslaCostData);
        plotData.push(gasCarData.plotData);

        if (gasCarData.breakEvenYear) {
            breakEvenPoints.push(`Break-even in ${location}: Year ${gasCarData.breakEvenYear}`);
        } else {
            breakEvenPoints.push(`No break-even in ${location} within 10 years`);
        }
    });

    document.getElementById('result').innerHTML = breakEvenPoints.join('<br>');
    Plotly.newPlot('plot', plotData, { title: 'Cost Comparison Over Time', xaxis: { title: 'Years' }, yaxis: { title: 'Total Cost ($)' } });
}

function calculateCostsForTesla(annualMileage, teslaPrice) {
    const teslaEfficiency = 0.3; // kWh per mile
    let teslaTotalCost = teslaPrice;
    let costData = [];

    for (let year = 1; year <= 10; year++) {
        teslaTotalCost += annualMileage * teslaEfficiency * electricityRate;
        costData.push({ x: year, y: teslaTotalCost });
    }

    return costData;
}

function getTeslaPlotData(costData) {
    return {
        x: costData.map(data => data.x),
        y: costData.map(data => data.y),
        type: 'scatter',
        mode: 'lines+markers',
        name: 'Tesla',
        line: { color: 'blue' }
    };
}

function getGasCarPlotData(location, annualMileage, gasCarEfficiency, gasCarPrice, teslaCostData) {
    const gasPrice = fuelData[location];
    let gasCarTotalCost = gasCarPrice;
    let costData = [];
    let breakEvenYear = null;

    for (let year = 1; year <= 10; year++) {
        gasCarTotalCost += (annualMileage / gasCarEfficiency) * gasPrice;
        costData.push({ x: year, y: gasCarTotalCost });

        if (!breakEvenYear && gasCarTotalCost > teslaCostData[year - 1].y) {
            breakEvenYear = year;
        }
    }

    return {
        plotData: {
            x: costData.map(data => data.x),
            y: costData.map(data => data.y),
            type: 'scatter',
            mode: 'lines+markers',
            name: `Gas Car in ${location}`,
            line: { color: getRandomColor() }
        },
        breakEvenYear: breakEvenYear
    };
}

function getRandomColor() {
    const letters = '0123456789ABCDEF';
    let color = '#';
    for (let i = 0; i < 6; i++) {
        color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
}
