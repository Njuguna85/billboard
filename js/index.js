let map;
let infoWindow;
var directionsService;
var directionsRenderer;
const mapContainer = document.getElementById("map");

let legend = document.createElement('div');
legend.setAttribute('id', 'legend')
legend.innerHTML = ` <h3>Map Legend</h3>`;

infoTab = document.createElement('div');
infoTab.setAttribute('id', 'infoTab');
infoTab.innerHTML = `<h3>More Info</h3><div class="info"></div>`;

const directionsPanel = document.createElement('div');
directionsPanel.className = 'directionsPanel';
directionsPanel.innerHTML = ` <h3>Directions</h3>`;
const commD = [
    'bank', 'hospital', 'police', 'school', 'university',
    'bar', 'petrolStation', 'grocery', 'kiosk', 'pharmacy',
    'restaraunt', 'saloon', 'supermarket'
];

function initMap() {
    // set the zoom, scale, street view and full screen controls
    // also create a custom map style 
    const mapOptions = {
        zoom: 12,
        center: { lat: -1.28333, lng: 36.816667 },
        mapTypeControl: true,
        mapTypeControlOptions: {
            style: google.maps.MapTypeControlStyle.HORIZONTAL_BAR,
            position: google.maps.ControlPosition.TOP_CENTER
        },
        zoomControl: true,
        zoomControlOptions: {
            position: google.maps.ControlPosition.LEFT_TOP
        },
        scaleControl: true,
        streetViewControl: true,
        streetViewControlOptions: {
            position: google.maps.ControlPosition.LEFT_TOP
        },
        fullscreenControl: true,
        styles: [
            { "featureType": "administrative", "elementType": "labels.text.fill", "stylers": [{ "color": "#444444" }] },
            { "featureType": "landscape", "elementType": "all", "stylers": [{ "color": "#f2f2f2" }] },
            { "featureType": "poi", "elementType": "all", "stylers": [{ "visibility": "off" }] },
            { "featureType": "road", "elementType": "all", "stylers": [{ "saturation": -100 }, { "lightness": 45 }] },
            { "featureType": "road.highway", "elementType": "all", "stylers": [{ "visibility": "simplified" }] },
            { "featureType": "road.arterial", "elementType": "labels.icon", "stylers": [{ "visibility": "off" }] },
            { "featureType": "transit", "elementType": "all", "stylers": [{ "visibility": "off" }] },
            { "featureType": "water", "elementType": "all", "stylers": [{ "color": "#80DEEA" }, { "visibility": "on" }] }
        ]
    };

    map = new google.maps.Map(mapContainer, mapOptions);
    infoWindow = new google.maps.InfoWindow;
    map.controls[google.maps.ControlPosition.RIGHT_TOP].push(legend);
    map.controls[google.maps.ControlPosition.LEFT_TOP].push(infoTab);
    fetchMobileUploads();
    fetchData();
    // initialize directions service
    directionsService = new google.maps.DirectionsService();
    directionsRenderer = new google.maps.DirectionsRenderer();
    directionsRenderer.setMap(map);

    // add traffic layer
    // const trafficLayer = new google.maps.TrafficLayer();
    // trafficLayer.setMap(map);
}

async function fetchData() {
    let response = await fetch('./php/download.php');
    if (response.ok) {
        data = await response.json();
        addOverlays(data);
    } else {
        alert('Something went wrong while fetching data. Error: ' + response.status);
    }
}

async function fetchMobileUploads() {
    // we need to make a request for mobile uploads within 
    // the past one week from today(2 dates)
    const today = new Date();
    const oneWkAgo = today.setDate(today.getDate() - 7);
    const oneWkAgoDate = new Date(oneWkAgo).toLocaleDateString('en-GB').split('/').join('-');
    const todaysDate = new Date().toLocaleDateString('en-GB').split('/').join('-');
    const url = `https://bi.predictiveanalytics.co.ke/api/all-deliveries?start=${oneWkAgoDate}&end=${todaysDate}`;
    let response = await fetch(url, {
        method: "GET",
        headers: {
            'Access-Control-Allow-Methods': 'GET',
            'Access-Control-Allow-Origin': '*',
            "Access-Control-Allow-Headers": "X-Requested-With"
        }
    });
    if (response.ok) {
        mobileData = await response.json();
        getmobileMarkers(mobileData.data);
    } else {
        alert('Something went wrong while fetching Mobile Uploads. Error: ' + response.status);
    }
}

function addOverlays(data) {
    addBillboards(data.billboards);
    addAtm(data.atms);
    addNssf(data.nssf);
    addUber(data.uber);
    addSubLocations(data.subLocations);
    for (const [key, value] of Object.entries(data)) {
        if (commD.includes(key)) {
            add(key, value);
        }
    }
}

function add(key, value) {
    // create a markers array 
    const markers = value.map(el => {
        // the x and y of the marker
        latitude = JSON.parse(el.geojson).coordinates[1];
        longitude = JSON.parse(el.geojson).coordinates[0];
        let latlng = new google.maps.LatLng(latitude, longitude);
        iconUrl = `images/${key}.png`
        let contentString = '<p><strong>' + el.name + '<strong></p>' +
            '<button class="btn end" data-lat=' + latitude + ' data-long=' + longitude + ' >Go Here</button>' +
            '<button class="btn stop" data-lat=' + latitude + ' data-long=' + longitude + ' >Add Stop</button>' +
            '<button class="btn start" data-lat=' + latitude + ' data-long=' + longitude + ' >Start Here</button>';
        let marker = new google.maps.Marker({
            position: latlng,
            icon: { url: iconUrl, scaledSize: new google.maps.Size(20, 20) },
            optimized: false,
        });
        // open a popup on click
        google.maps.event.addListener(marker, 'click', ((marker, el) => {
            return () => {
                infoWindow.setContent(contentString);
                infoWindow.open(map, marker);
            }
        })(marker, el));
        return marker
    });
    const markerCluster = new MarkerClusterer(
        map, [], { imagePath: 'https://developers.google.com/maps/documentation/javascript/examples/markerclusterer/m' }
    );
    div = document.createElement('div');
    div.innerHTML = `<img src='${iconUrl}' style="height:20px;"/> ${key}<input id="${key}Checked" type="checkbox">`;
    legend.appendChild(div);
    legend.addEventListener('change', e => {
        cb = document.getElementById(`${key}Checked`)
        // if on
        if (cb.checked) {
            markerCluster.addMarkers(markers)
        }
        if (!cb.checked) {
            // if off
            markerCluster.removeMarkers(markers)
        }
    })
}

function addBillboards(data) {
    const markers = data.map(el => {
        let latlng = new google.maps.LatLng(el.latitude, el.longitude)
        let contentString =
            '<div class ="infoWindow">' +
            '<div>' + 'Name: <b>' + parseData(el.billboardi) + '</b></div>' +
            '<div>' + 'Route: <b>' + parseData(el.routename) + '</b></div>' +
            '<div>' + 'Size: <b>' + parseData(el.size) + '</b></div>' +
            '<div>' + 'Visibility: <b>' + parseData(el.visibility) + '</b> </div>' +
            '<div>' + 'Medium: <b>' + parseData(el.selectmedi) + '</b> </div>' +
            '<div>' + 'Traffic: <b>' + parseData(el.traffic) + '</b> </div>' +
            '</div>' +
            '<img class="billboardImage" alt="billboard photo" src=' + el.photo + '>' +
            '<button class="btn end" data-lat=' + el.latitude + ' data-long=' + el.longitude + ' >Go Here</button>' +
            '<button class="btn stop" data-lat=' + el.latitude + ' data-long=' + el.longitude + ' >Add Stop</button>' +
            '<button class="btn start" data-lat=' + el.latitude + ' data-long=' + el.longitude + ' >Start Here</button>';
        let marker = new google.maps.Marker({
            position: latlng,
            icon: { url: `images/marker.png`, scaledSize: new google.maps.Size(20, 20) },
            optimized: false,
        });
        google.maps.event.addListener(marker, 'click', ((marker, el) => {
            return () => {
                infoWindow.setContent(contentString);
                infoWindow.open(map, marker);
            }
        })(marker, el));
        return marker
    });
    const markerCluster = new MarkerClusterer(
        map, markers, { imagePath: 'https://developers.google.com/maps/documentation/javascript/examples/markerclusterer/m' }
    )
    div = document.createElement('div');
    div.innerHTML = `<img src='images/marker.png' style="height:20px;"/>Billboards<input id="billboardChecked" checked type="checkbox">`;
    legend.appendChild(div);
    legend.addEventListener('change', e => {
        cb = document.getElementById('billboardChecked')
        // if on
        if (cb.checked) {
            markerCluster.addMarkers(markers)
        }
        if (!cb.checked) {
            // if off
            markerCluster.removeMarkers(markers)
        }
    })
}

function addAtm(data) {
    const markers = data.map(el => {
        latitude = JSON.parse(el.geojson).coordinates[1];
        longitude = JSON.parse(el.geojson).coordinates[0];
        let latlng = new google.maps.LatLng(latitude, longitude);
        let contentString = '<p>Operator: <strong>' + el.operator + '<strong></p>' +
            '<button class="btn end" data-lat=' + latitude + ' data-long=' + longitude + ' >Go Here</button>' +
            '<button class="btn stop" data-lat=' + latitude + ' data-long=' + longitude + ' >Add Stop</button>' +
            '<button class="btn start" data-lat=' + latitude + ' data-long=' + longitude + ' >Start Here</button>';
        let marker = new google.maps.Marker({
            position: latlng,
            icon: { url: `images/atm.png`, scaledSize: new google.maps.Size(20, 20) },
            optimized: false,
        });
        google.maps.event.addListener(marker, 'click', ((marker, el) => {
            return () => {
                infoWindow.setContent(contentString);
                infoWindow.open(map, marker);
            }
        })(marker, el));
        return marker
    });
    const markerCluster = new MarkerClusterer(
        map, [], { imagePath: 'https://developers.google.com/maps/documentation/javascript/examples/markerclusterer/m' }
    )
    div = document.createElement('div');
    div.innerHTML = `<img src='images/atm.png' style="height:20px;"/>ATM<input id="atmCheck" type="checkbox">`;
    legend.appendChild(div);
    legend.addEventListener('change', e => {
        cb = document.getElementById('atmCheck')
        // if on
        if (cb.checked) {
            markerCluster.addMarkers(markers)
        }
        if (!cb.checked) {
            // if off
            markerCluster.removeMarkers(markers)
        }
    })
}

function addNssf(data) {
    const markers = data.map(el => {
        let latlng = new google.maps.LatLng(JSON.parse(el.geojson).coordinates[1], JSON.parse(el.geojson).coordinates[0]);
        let contentString = '<p><strong>' + el.name + '<strong></p>';
        let marker = new google.maps.Marker({
            position: latlng,
            icon: { url: `images/office.png`, scaledSize: new google.maps.Size(20, 20) },
            optimized: false,
        });
        google.maps.event.addListener(marker, 'click', ((marker, el) => {
            return () => {
                infoWindow.setContent(contentString);
                infoWindow.open(map, marker);
            }
        })(marker, el));
        return marker
    });
    const markerCluster = new MarkerClusterer(
        map, [], { imagePath: 'https://developers.google.com/maps/documentation/javascript/examples/markerclusterer/m' }
    )
    div = document.createElement('div');
    div.innerHTML = `<img src='images/office.png' style="height:20px;"/>NSSF Offices<input id="nssfChecked" type="checkbox">`;
    legend.appendChild(div);
    legend.addEventListener('change', e => {
        cb = document.getElementById('nssfChecked')
        // if on
        if (cb.checked) {
            markerCluster.addMarkers(markers)
        }
        if (!cb.checked) {
            // if off
            markerCluster.removeMarkers(markers)
        }


    })
}

function getmobileMarkers(deliveriesData) {
    mobileMarkersDates = new Object();
    const uploadDates = [];
    const markers = deliveriesData.map(el => {
        let latlng = new google.maps.LatLng(el.latitude, el.longitude)
        let contentString =
            'Product Name: <b>' + parseData(el.product_name) + '</b><br/>' +
            'Delivered By: <b>' + parseData(el.delivered_by) + '</b> <br/>' +
            'Description: <b>' + parseData(el.product_description) + '</b> <br/>' +
            'Quantity: <b>' + parseData(el.quantity) + '</b> <br/>' +
            '<img class="billboardImage" alt="delivery photo" src=' + el.photo + '></img>';
        let marker = new google.maps.Marker({
            position: latlng,
            icon: { url: `images/place.png`, scaledSize: new google.maps.Size(20, 20) },
            optimized: false,
        });
        google.maps.event.addListener(marker, 'click', ((marker, el) => {
            return () => {
                infoWindow.setContent(contentString);
                infoWindow.open(map, marker);
            }
        })(marker, el));
        // add list of dates
        if (el.created_at) {
            let date = el.created_at.slice(0, 10);
            if (uploadDates.length == 0) {
                uploadDates.push(date);
            } else {
                if (uploadDates.includes(date) == false) {
                    uploadDates.push(date);
                }
            }
        }
        return marker
    });
    mobileMarkersDates.dates = uploadDates;
    const markerCluster = new MarkerClusterer(
        map, [], { imagePath: 'https://developers.google.com/maps/documentation/javascript/examples/markerclusterer/m' }
    )
    div = document.createElement('div');
    div.innerHTML = `<img src='images/place.png' style="height:20px;"/>Mobile Uploads<input id="mobileCheck" type="checkbox">`;
    legend.appendChild(div);
    legend.addEventListener('change', e => {
        cb = document.getElementById('mobileCheck')
        // if on
        if (cb.checked) {
            markerCluster.addMarkers(markers)
        }
        if (!cb.checked) {
            // if off
            markerCluster.removeMarkers(markers)
        }


    })
}

function getColor(d) {
    return d > 3318 ? '#800026' :
        d > 2878 ? '#BD0026' :
            d > 2437 ? '#E31A1C' :
                d > 1997 ? '#FC4E2A' :
                    d > 1556 ? '#FD8D3C' :
                        d > 1116 ? '#FEB24C' :
                            d > 675 ? '#FED976' :
                                '#FFEDA0';
}

function addUber(uber) {
    uDMJSON = [];
    uber.forEach(el => {
        let features = {
            type: 'Feature',
            properties: {
                'movement': el.movement_i,
                'areaName': el.display_na,
                'origin': el.origin_dis,
                'destination': el.destinat_1,
                'travelTime': el.mean_trave,
                'minTime': el.range___lo,
                'maxTime': el.range___up
            },
            geometry: JSON.parse(el.geojson),
        }
        uDMJSON.push(features);
    });
    uDMGeoJSON = {
        "type": "FeatureCollection",
        "features": uDMJSON
    };

    map.data.setStyle((feature) => {
        travelTime = feature.getProperty('travelTime');
        return {
            fillColor: getColor(travelTime),
            fillOpacity: .9,
            strokeColor: '#6D4C41',
            strokeWeight: 1,
            zIndex: 1000
        }
    });
    map.data.addListener('click', function (event) {
        map.data.revertStyle();
        map.data.overrideStyle(event.feature, { fillColor: '#CFD8DC' });
    });
    div = document.createElement('div');
    div.innerHTML = `Uber Data<input id="uberCheck" type="checkbox">`;
    legend.appendChild(div);
    legend.addEventListener('change', e => {
        cb = document.getElementById('uberCheck')
        // if on
        if (cb.checked) {
            map.data.addGeoJson(uDMGeoJSON);
        }
        if (!cb.checked) {
            map.data.forEach(function (feature) {
                // if off
                map.data.remove(feature);
            })
        }
    });
}

function sublocationsColors(d) {
    return d > 78340 ? '#084081' :
        d > 68600 ? '#0868ac' :
            d > 58900 ? '#2b8cbe' :
                d > 49200 ? '#4eb3d3' :
                    d > 39500 ? '#7bccc4' :
                        d > 29800 ? '#a8ddb5' :
                            d > 20100 ? '#ccebc5' :
                                d > 10400 ? '#e0f3db' :
                                    d > 700 ? '#f7fcf0' :
                                        '#fdfdfd';
}

function addSubLocations(subLocations) {
    subLocationsJSON = [];
    subLocations.forEach(sublocation => {
        let features = {
            type: 'Feature',
            properties: {
                'name': sublocation.slname,
                'maleTotalPoulation': sublocation.male_19,
                'femaleTotalPoulation': sublocation.female_19,
                'totalPopulation': sublocation.pop_19,
                'totalHouseHold': sublocation.total_hh
            },
            geometry: JSON.parse(sublocation.geojson),
        }
        subLocationsJSON.push(features);
    });
    subLocationsGeoJSON = {
        "type": "FeatureCollection",
        "features": subLocationsJSON
    };
    map.data.setStyle((feature) => {
        totalPopulation = feature.getProperty('totalPopulation');
        return {
            fillColor: sublocationsColors(totalPopulation),
            fillOpacity: 1,
            strokeColor: '#FFF9C4',
            strokeWeight: 1,
            zIndex: 10
        }
    });
    const showDetails = (event) => {
        map.data.revertStyle();
        map.data.overrideStyle(event.feature, { strokeColor: '#880E4F', strokeWeight: 3 });
        name = event.feature.getProperty('name');
        totalPopulation = event.feature.getProperty('totalPopulation');
        totalHouseHold = event.feature.getProperty('totalHouseHold');
        maleTotalPoulation = event.feature.getProperty('maleTotalPoulation');
        femaleTotalPoulation = event.feature.getProperty('femaleTotalPoulation');
        info = infoTab.querySelector('.info')
        info.innerHTML =
            '<h4>2019 Census Data</h4>' +
            '<table>' +
            '<tr><td>Area Name: </td>' + '<b></td><td>' + name + '</td></b></tr>' +
            '<tr><td>Total Poulation: ' + '<b></td><td>' + parseValues(totalPopulation) + '</td></b></tr>' +
            '<tr><td>Male Population: ' + '<b></td><td>' + parseValues(maleTotalPoulation) + '</td><br/>' +
            '<tr><td>Female Population: ' + '<b></td><td>' + parseValues(femaleTotalPoulation) + '</td></b></tr>' +
            '<tr><td>Total HouseHolds: ' + '<b></td><td>' + parseValues(totalHouseHold) + '</td></b></tr>' +
            '</table>';

    }
    const key = () => {
        info = infoTab.querySelector('.info')
        info.innerHTML = `
        <div class="sublocLegend">
            <div>KEY</div>
            <div><span class="subColor" style="background-color: #f7fcf0;"></span> >700 </div>
            <div><span class="subColor" style="background-color: #e0f3db;"></span> >10400 </div>
            <div><span class="subColor" style="background-color:#ccebc5;"></span> >20100 </div>
            <div><span class="subColor" style="background-color: #a8ddb5;"></span> >29800 </div>
            <div><span class="subColor" style="background-color: #7bccc4;"></span> >39500 </div>
            <div><span class="subColor" style="background-color: #4eb3d3;"></span> >49200 </div>
            <div><span class="subColor" style="background-color: #2b8cbe;"></span> >58900 </div>
            <div><span class="subColor" style="background-color: #0868ac;"></span> >68600 </div>
            <div><span class="subColor" style="background-color: #084081;"></span> >78339 </div>
        </div>
        `
    }
    map.data.addListener('click', showDetails, false);
    map.data.addListener('mouseover', showDetails, false);
    map.data.addListener('mouseout', () => {
        info = infoTab.querySelector('.info').innerHTML = ''
        key();
    });

    div = document.createElement('div');
    div.innerHTML = `Nairobi Sublocations<input id="sublCheck" type="checkbox">`;
    legend.appendChild(div);
    legend.addEventListener('change', e => {
        cb = document.getElementById('sublCheck')
        // if on
        if (cb.checked) {
            map.data.addGeoJson(subLocationsGeoJSON);
            key();
        }
        if (!cb.checked) {
            // if off
            map.data.forEach(function (feature) {
                map.data.remove(feature);
            })
            infoTab.querySelector('.info').innerHTML = ''
        }
    });
}

function parseData(val) {
    if (val == null || val == undefined) {
        return ''
    }
    return val;
}

function parseValues(val) {
    if (val == null || val == undefined) {
        return ''
    }
    return val.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}
//
// create routes
const tracker = new Object();
const stopPoints = [];
mapContainer.addEventListener('click', e => {
    if (e.target.matches('.start')) {
        const lat = parseFloat(e.target.closest('.start').dataset.lat);
        const long = parseFloat(e.target.closest('.start').dataset.long);
        const LatLng = new google.maps.LatLng(lat, long);
        tracker.start = LatLng
        calcRoute(tracker);

    }
    if (e.target.matches('.end')) {
        const lat = parseFloat(e.target.closest('.end').dataset.lat);
        const long = parseFloat(e.target.closest('.end').dataset.long);
        const LatLng = new google.maps.LatLng(lat, long);
        tracker.end = LatLng;
        calcRoute(tracker);
    }
    if (e.target.matches('.stop')) {
        const lat = parseFloat(e.target.closest('.stop').dataset.lat);
        const long = parseFloat(e.target.closest('.stop').dataset.long);
        const LatLng = new google.maps.LatLng(lat, long);
        stopPoints.push({ location: LatLng, stopover: true })
        tracker.stop = stopPoints;
        calcRoute(tracker);
    }
});

function calcRoute(tracker) {
    div = document.createElement('div');
    let start, end, waypts;
    if (tracker.start) {
        start = tracker.start;
    }
    if (tracker.end) {
        end = tracker.end;
    }
    if (tracker.stop) {
        if (tracker.stop.length > 8) {
            window.alert('Please Minimize the stop points to 8')
        }
        waypts = tracker.stop
    }
    if (start != undefined && end != undefined) {
        const request = {
            origin: start,
            destination: end,
            waypoints: waypts,
            optimizeWaypoints: true,
            travelMode: 'DRIVING'
        };
        directionsService.route(request, function (response, status) {
            if (status == 'OK') {
                directionsRenderer.setDirections(response);
                directionsRenderer.setPanel(div);
                directionsPanel.appendChild(div);
                map.controls[google.maps.ControlPosition.LEFT_TOP].push(directionsPanel);
            } else {
                window.alert("Directions request failed due to " + status);
            }
        });
    }

}