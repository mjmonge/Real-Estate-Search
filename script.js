'use strict';

// array of coordinates of each state to help the map focus on the right state when searched
var statesLocations = [[32.318230, -86.902298], [66.160507, -153.369141], [34.048927, -111.093735], [34.799999, -92.199997], [33.981711, -118.197939], [39.113014, -105.358887], [41.599998, -72.699997], [39.000000, -75.500000], [27.994402, -81.760254], [33.247875, -83.441162], [19.741755, -155.844437], [44.068203, -114.74204], [40.000000, -89.000000], [40.273502, -86.126976], [42.032974, -93.581543], [38.500000, -98.000000], [37.839333, -84.270020], [30.391830, -92.329102], [45.367584, -68.972168], [39.045753, -76.641273], [42.407211, -71.382439], [44.182205, -84.506836], [46.392410, -94.636230], [33.000000, -90.000000], [38.573936, -92.603760], [46.965260, -109.533691], [41.500000, -100.000000], [39.876019, -117.224121], [44.000000, -71.500000], [39.833851, -74.871826], [34.307144, -106.018066], [43.000000, -75.000000], [35.782169, -80.793457], [47.650589, -100.437012], [40.367474, -82.996216], [36.084621, -96.921387], [44.000000, -120.500000], [41.203323, -77.194527], [41.700001, -71.500000], [33.836082, -81.163727], [44.500000, -100.000000], [35.860119, -86.660156], [31.000000, -100.000000], [39.419220, -111.950684], [44.000000, -72.699997], [37.926868, -78.024902], [47.751076, -120.740135], [39.000000, -80.500000], [44.500000, -89.500000], [43.075970, -107.290283]];
// corresponding index to the current state
var stateIdx=0;

// Method to populate content in the Google Map Divs, default content in google map
function initMap() {
  // The location of West Town in Chicago
  const chicagoWestTown = { lat: 41.896, lng: -87.665 };
  
  // The map, centered at West Town in Chicago
  const chicagoWestTownMap = new google.maps.Map(document.getElementById("map1"), {
    zoom: 12,
    center: chicagoWestTown,
  });
  // The marker, positioned at West Town in Chicago
  const marker1 = new google.maps.Marker({
    position: chicagoWestTown,
    map: chicagoWestTownMap,
  });
}

// method called when the page loads, contains user input validation, searhcing functionality, and saved search functionality
function searchForm() {
  // when the focus is lost verify the input
  $('.stateSearch').focusout(function() {
    var input = $('.stateSearch').val().toLowerCase();
    var statesLong = ['alabama', 'alaska', 'arizona', 'arkansas', 'california', 'colorado', 'connecticut', 'delaware', 'florida', 'georgia', 'hawaii', 'idaho', 'illinois', 'indiana', 'iowa', 'kansas', 'kentucky', 'louisiana', 'maine', 'maryland', 'massachusetts', 'michigan', 'minnesota', 'mississippi', 'missouri', 'montana', 'nebraska', 'nevada', 'new hampshire', 'new jersey', 'new mexico', 'new york', 'north carolina', 'north dakota', 'ohio', 'oklahoma', 'oregon', 'pennsylvania', 'rhode island', 'south carolina', 'south dakota', 'tennessee', 'texas', 'utah', 'vermont', 'virginia', 'washington', 'west virginia', 'wisconsin', 'wyoming'];
    var statesShort = ['al', 'ak', 'az', 'ar', 'ca', 'co', 'ct', 'de', 'fl', 'ga', 'hi', 'id', 'il', 'in', 'ia', 'ks', 'ky', 'la', 'me', 'md', 'ma', 'mi', 'mn', 'ms', 'mo', 'mt', 'ne', 'nv', 'nh', 'nj', 'nm', 'ny', 'nc', 'nd', 'oh', 'ok', 'or', 'pa', 'ri', 'sc', 'sd', 'tn', 'tx', 'ut', 'vt', 'va', 'wa', 'wv', 'wi', 'wy'];
    var found = false;
    for (var i = 0; i < statesLong.length; i++) {
      if (input == statesLong[i]) {
        found = true;
        stateIdx = i;
        break;
      } else if (input == statesShort[i]) {
        found = true;
        stateIdx = i;
        $('.stateSearch').val(statesLong[i]);
        break;
      }
    }
    // if the input is not validated inform the user
    var warning = document.getElementById("validationMsg");
    if (!found) {
      warning.innerHTML = "Please enter a valid U.S. State or State abbrevation."
    } else {
      warning.innerHTML = "";
    }
  })
  // if the input is valid execute the search
  $('.searchForm').on('submit', function(event) {
    event.preventDefault();
    if(document.getElementById("validationMsg").innerHTML == "") {
      lookupProperties(false);
    }
  })
  // if the user clicked on the saved search then load the saved search and the reset button in the nav
  $('#searchP').on('click', function () {
    lookupProperties(true, "california");
    var nav = document.getElementById("nav").innerHTML;
    document.getElementById("nav").innerHTML = `${nav}<a href='index.html' style='color: blue;'><p id='reset'>Reset</p></a>`;
    $('#reset').on('click', function () {
      initMap();
      document.getElementById("stats").innerHTML = "";
      document.getElementById("table1").innerHTML = "";
      document.getElementById("statsDiv").style.display = "none";
      document.getElementById("mapDiv").style.display = "none";
    })
  })
}

// fucntion to lookup properties available and loading statistical data as well
function lookupProperties(filter, state) {
  // code to determine the url to fetch
  const searchState = state || $('.stateSearch').val().toLowerCase();
  const baseUrl = 'https://api.bridgedataoutput.com/api/v2/OData/test/Property?access_token='
  const stateFilter = `&$top=50&$filter=tolower(StateOrProvince) eq '${searchState}'`;
    
        
    const apiKey = '6baca547742c6f96a6ff71b138424f21';

    const url = baseUrl + apiKey + stateFilter;

    // async functionality to fetch the data from the url and parse it
    fetch(url)
    .then(response => {
      if (response.ok) {
        return response.json();
      }
        return response.text();
        throw new Error(response.statusText);
    })
    .then(responseJson => {
      var parsedData = responseJson.value.filter(entry =>
        entry.UnparsedAddress).map(entry => {
          return {
            Address: entry.UnparsedAddress,
            Longitude: entry.Longitude,
            Latitude: entry.Latitude,
            ListPrice: entry.ListPrice,
            LotSize: entry.LotSizeSquareFeet,
            Bedrooms: entry.BedroomsTotal,
            Bathrooms: entry.BathroomsTotalDecimal,
            YearBuilt: entry.YearBuilt,
            DaysOnMarket: entry.DaysOnMarket
          };
        });
      // functionality to determine the next step after the data is acquired
      if(document.getElementById('propertySearch').checked & !filter) {
        updateMap(parsedData, false);
      } else if(document.getElementById('statSearch').checked & !filter) {
        displayStats(parsedData, false);
      } else {
        updateMap(parsedData, true);
        displayStats(parsedData, true);
      }
    })
    .catch(err => {
        console.error(err);
    });
}

// function to display the stats at the bottom of the page
function displayStats(parsedData, filter) {
  // code to average the stats
  var listPriceAvg = parsedData.reduce((total, next) => total + next.ListPrice, 0) / parsedData.length;
  listPriceAvg = Math.round(listPriceAvg);
  var lotSizeAvg = parsedData.reduce((total, next) => total + next.LotSize, 0) / parsedData.length;
  lotSizeAvg = Math.round(lotSizeAvg);
  var bedroomAvg = parsedData.reduce((total, next) => total + next.Bedrooms, 0) / parsedData.length;
  bedroomAvg = Math.round(bedroomAvg);
  var bathroomAvg = parsedData.reduce((total, next) => total + next.Bathrooms, 0) / parsedData.length;
  bathroomAvg = bathroomAvg.toString();
  bathroomAvg = bathroomAvg.slice(0, (bathroomAvg.indexOf("."))+3);
  var yearBuiltAvg = parsedData.reduce((total, next) => total + next.YearBuilt, 0) / parsedData.length;
  yearBuiltAvg = Math.round(yearBuiltAvg);
  var domAvg = parsedData.reduce((total, next) => total + next.DaysOnMarket, 0) / parsedData.length;
  domAvg = Math.round(domAvg);
  var stats = `<p>The average list price of the properties is $${listPriceAvg}.</p><p>The average lot size of the properties is ${lotSizeAvg} sq ft.</p><p>The average amount of bedrooms in the properties is ${bedroomAvg}.</p><p>The average amount of bathrooms in the properties is ${bathroomAvg}.</p><p>The average year the properties were built was ${yearBuiltAvg}.</p><p>The average days on the market for all the properties is ${domAvg}.</p>`;
  // displaying stats on page
  document.getElementById("stats").innerHTML = stats;
  // code to switch between map and stats if applicable
  if(!filter) {
    document.getElementById("statsDiv").style.display = "block";
    document.getElementById("mapDiv").style.display = "none";
  } else {
    document.getElementById("statsDiv").style.display = "block";
  }
}

// Method to populate properties in the Google Map Divs and listings in the listing table
function updateMap(data, filter) {
  // test data only exists in california so california is hardcoded in
  const californiaNum = 4;
  const map1 = new google.maps.Map(document.getElementById("map1"), {
    zoom: 8,
    center: { lat: statesLocations[californiaNum][0], lng: statesLocations[californiaNum][1] }
  });
  
  var info = new google.maps.InfoWindow();
  var markers = [];
  var windowContents = [];
  var marker, i;
  // loop to populate the markers on the map from the parsed data and adding the info windows
  for (i = 0; i < data.length; i++) {  
    marker = new google.maps.Marker({
      position: {lat: data[i].Latitude, lng: data[i].Longitude},
      map: map1
    });
    markers.push(marker);

    google.maps.event.addListener(marker, 'click', (function(marker, i) {
      return function() {
        var windowContent = `<p id='info'>${data[i].Address}, Price: $${data[i].ListPrice}</p>`;
        windowContents.push(windowContent);
        info.setContent(windowContent);
        info.open(map1, marker);
      }
    })(marker, i));
  }
  // logic to determine whether or not to hide the stats
  if(!filter) {
    document.getElementById("mapDiv").style.display = "block";
    document.getElementById("statsDiv").style.display = "none";
  } else {
    document.getElementById("mapDiv").style.display = "block";
  }
  // code to generate listing table and add functionality to focus on the marker corresponding to the address if clicked on
  var listingEntries = "";
  for(var i=0; i<data.length;i++) {
    listingEntries += `<tr><td class='listingAddress'>${data[i].Address}</td><td>${data[i].ListPrice}</td></tr>`;
  }
  var listingTable = `<br><br><table id='listingTable' style='margin-left: auto; margin-right: auto;'><tr><td>Address</td><td>Listing Price</td></tr>${listingEntries}</table>`;
  document.getElementById("table1").innerHTML = listingTable;
  var idx = 0;
  document.querySelectorAll('#listingTable tr td.listingAddress')
  .forEach(e => e.addEventListener("click", function() {
    info.setContent(windowContents[idx]);
    info.open(map1, markers[idx]);
    idx++;
  }));
}

$(searchForm);