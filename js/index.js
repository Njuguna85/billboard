// import { config } from './config.js';
const isDev = true;
const config = isDev ? {
    url: 'http://localhost/billboard_api/public/index.php'
} : {
    url: 'predictiveanalytics.co.ke/billboard_api/public/index.php'
}

let map;
let infoWindow;
var directionsService;
var directionsRenderer;
const mapContainer = document.getElementById("map");

let legend = document.createElement('div');
legend.setAttribute('id', 'legend');
legend.innerHTML = `<h3>Map Legend</h3>`;

const essentialLayers = document.createElement('div');
essentialLayers.className = 'essentialLayers';
legend.appendChild(essentialLayers);

const mapLayers = document.createElement('div');
mapLayers.innerHTML = '<h5 class="accordion">Map Layers</h5>';
mapLayers.className = 'mapLayers';
legend.appendChild(mapLayers);

const mapLayersAccordion = document.createElement('div');
mapLayersAccordion.className = 'accordion-content';
mapLayers.append(mapLayersAccordion);

const poiLayers = document.createElement('div');
poiLayers.innerHTML = '<h5 class="accordion">POIs</h5>';
poiLayers.className = 'poiLayers';
legend.appendChild(poiLayers);
const poiLayersAccordion = document.createElement('div');
poiLayersAccordion.className = 'accordion-content';
poiLayers.appendChild(poiLayersAccordion);

const infoTab = document.createElement('div');
infoTab.setAttribute('id', 'infoTab');
infoTab.innerHTML = `<h3>More Info</h3><div class="info"></div>`;

const directionsPanel = document.createElement('div');
directionsPanel.className = 'directionsPanel';
directionsPanel.innerHTML = ` 
            <h3>Directions</h3>
            <span class="closeBtn closeDirPanel">&times;</span>
            `;

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
}

async function fetchData() {
    let response = await fetch(`./php/download.php`);
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
    addBillboards(data.billboard);
    addAtm(data.atm);
    addTrafficLayer();
    addNssf(data.nssf);
    addMetalWorks(data.metalworks)
    nairobiSublWMS();
    addNairobiUberSpeeds()
    addugPopProj();
    addGhanaPopulation();
    for (const [key, value] of Object.entries(data)) {
        if (commD.includes(key)) {
            add(key, value);
        }
    }
    setTimeout(loader, 100);
}

const getTiles = (lyr) => {
    const fullURl = (coord, zoom) => {
        // get map projection
        const proj = map.getProjection();
        const zfactor = Math.pow(2, zoom);
        const top = proj.fromPointToLatLng(new google.maps.Point(coord.x * 256 / zfactor, coord.y * 256 / zfactor));
        const bot = proj.fromPointToLatLng(new google.maps.Point((coord.x + 1) * 256 / zfactor, (coord.y + 1) * 256 / zfactor));
        // corrections for the slight shift of the map server
        const deltaX = 0.0013;
        const deltaY = 0.00058;

        // create bounding box string
        const bbox = (top.lng() + deltaX) + "," +
            (bot.lat() + deltaY) + "," +
            (bot.lng() + deltaX) + "," +
            (top.lat() + deltaY);
        const url =
            'http://play.predictiveanalytics.co.ke:8080/geoserver/Predictive/wms?' +
            '&service=WMS' +
            '&version=1.1.0' +
            '&request=GetMap' +
            `&layers=${lyr}` +
            `&bbox=${bbox}` +
            '&bgcolor=0xFFFFFF' +
            '&transparent=true' +
            '&width=256' +
            '&height=256' +
            '&srs=EPSG:4326' +
            '&format=image%2Fpng';
        return url

    }
    return fullURl;
}

const latLonToXY = (lat, lon, zoom) => {
    // Convert to radians
    lat = lat * Math.PI / 180;
    lon = lon * Math.PI / 180;

    var circumference = 256 * Math.pow(2, zoom);
    var falseEasting = circumference / 2.0;
    var falseNorthing = circumference / 2.0;
    var radius = circumference / (2 * Math.PI);

    var point = {
        y: radius / 2.0 * Math.log((1.0 + Math.sin(lat)) / (1.0 - Math.sin(lat))),
        x: radius * lon
    };

    point.x = falseEasting + point.x;
    point.y = falseNorthing - point.y;

    return point;
}

const getTileCoordinates = (lat, lon, zoom) => {
    const point = latLonToXY(lat, lon, zoom);
    const tileXY = {
        x: Math.floor(point.x / 256),
        y: Math.floor(point.y / 256)
    };
    return tileXY;
}

const getTileBoundingBox = (map, tileCoords) => {
    const projection = map.getProjection();
    const zpow = Math.pow(2, map.getZoom());

    const ul = new google.maps.Point(tileCoords.x * 256.0 / zpow, (tileCoords.y + 1) * 256.0 / zpow);
    const lr = new google.maps.Point((tileCoords.x + 1) * 256.0 / zpow, (tileCoords.y) * 256.0 / zpow);
    const ulw = projection.fromPointToLatLng(ul);
    const lrw = projection.fromPointToLatLng(lr);
    // const bbox = ulw.lat() + "," + ulw.lng() + "," + lrw.lat() + "," + lrw.lng();

    const bbox = {
        latMin: ulw.lat(),
        latMax: lrw.lat(),
        lonMin: ulw.lng(),
        lonMax: lrw.lng()
    };

    return bbox;
}

const latLonToTileXYOffset = (lat, lon, zoom) => {
    point = latLonToXY(lat, lon, zoom);

    const tileOffset = {
        x: point.x % 256,
        y: point.y % 256
    };

    return tileOffset;
}

function nairobiSublWMS() {
    const wmsLayer = 'Predictive:nairobisublocations';
    const key = () => {
        info = infoTab.querySelector('.info')
        info.innerHTML = `
        <div class="sublocLegend">
            <div>Census Population 2019</div>
            <div><span class="subColor" style="background-color:#fcfbfd;"></span>743 - 6783</div>
            <div><span class="subColor" style="background-color:#f1eff7;"></span>6783 - 9882</div>
            <div><span class="subColor" style="background-color:#e0e0ee;"></span>9882 - 13901</div>
            <div><span class="subColor" style="background-color:#c9cae3;"></span>13901 - 19082</div>
            <div><span class="subColor" style="background-color:#b0afd4;"></span>19082 - 23712</div>
            <div><span class="subColor" style="background-color:#9692c4;"></span>23712 - 28932</div>
            <div><span class="subColor" style="background-color:#7c76b6;"></span>28932 - 31603</div>
            <div><span class="subColor" style="background-color:#66499f;"></span>31603 - 40523</div>
            <div><span class="subColor" style="background-color:#552a91;"></span>40523 - 60613</div>
            <div><span class="subColor" style="background-color:#3f007d;"></span>60613 - 88039</div>
        </div>
        `
    }
    const nrbtile = getTiles(wmsLayer);

    const nairobisublocations = new google.maps.ImageMapType({
        getTileUrl: nrbtile,
        minZoom: 0,
        maxZoom: 19,
        opacity: 1.0,
        alt: 'Nairobi County Sublocations Population 2019',
        name: 'nrbtile',
        isPng: true,
        tileSize: new google.maps.Size(256, 256)
    });

    div = document.createElement('div');
    div.innerHTML = `Nairobi Sublocations<input id="sublCheck" type="checkbox" />`;
    mapLayersAccordion.appendChild(div);
    legend.addEventListener('change', e => {
        if (e.target.matches('#sublCheck')) {
            cb = document.getElementById('sublCheck')
                // if on
            if (cb.checked) {
                map.overlayMapTypes.setAt(0, nairobisublocations);
                key();
            }
            if (!cb.checked) {
                // if off
                map.overlayMapTypes.removeAt(0);
                infoTab.querySelector('.info').innerHTML = '';
            }
        }
    });
    /*
        map.addListener('click', async(e) => {
            const tileCoords = getTileCoordinates(e.latLng.lat(), e.latLng.lng(), map.getZoom())
            const tileBounds = getTileBoundingBox(map, tileCoords);
            const tileXYOffset = latLonToTileXYOffset(e.latLng.lat(), e.latLng.lng(), map.getZoom());

            let getFeatureInfoUrl =
                `http://play.predictiveanalytics.co.ke:8080/geoserver/Predictive/wms?REQUEST=GetFeatureInfo&SERVICE=WMS&VERSION=1.1.1&SRS=EPSG:4326&LAYERS=${wmsLayer}&QUERY_LAYERS=${wmsLayer}&STYLES=&INFO_FORMAT=application/json`;
            getFeatureInfoUrl +=
                "&BBOX=" + tileBounds.lonMin + "," + tileBounds.latMin + "," + tileBounds.lonMax + "," + tileBounds.latMax;
            getFeatureInfoUrl += "&X=50" + "&Y=50" + "&WIDTH=256&HEIGHT=256&exceptions=application%2Fvnd.ogc.se_xml";

            let response = await fetch(getFeatureInfoUrl, {
                method: "GET",
                headers: {
                    'Access-Control-Allow-Methods': '*',
                    'Access-Control-Allow-Origin': '*',
                    "Access-Control-Allow-Headers": "Origin, X-Requested-With, Content-Type, Accept",
                    'Content-Type': 'application/json'
                }
            });

            console.log(response)
                // if (response.ok) {
                //     info = await response.json()
                //     console.log(info);
                // }

            // infoWindow.setContent(getFeatureInfoUrl);
            // infoWindow.open(map);
            // window.open(getFeatureInfoUrl);
        });
    */
}

function addNairobiUberSpeeds() {
    const wmsLayer = '	Predictive:nairobi roads travel speeds February';
    const key = () => {
        info = infoTab.querySelector('.info')
        info.innerHTML = `
        <div class="sublocLegend">
            <div>February 2020 Speeds in Kph</div>
            <div><span class="rdspeed" style="background-color:#9e0142;"></span>2 - 11.8</div>
            <div><span class="rdspeed" style="background-color:#d53e4f;"></span>11.8 - 21.6</div>
            <div><span class="rdspeed" style="background-color:#f46d43;"></span>21.6 - 31.4</div>
            <div><span class="rdspeed" style="background-color:#fdae61;"></span>31.4 - 41.2</div>
            <div><span class="rdspeed" style="background-color:#fee08b;"></span>41.2 - 51</div>
            <div><span class="rdspeed" style="background-color:#e6f598;"></span>51 - 60.8</div>
            <div><span class="rdspeed" style="background-color:#abdda4;"></span>60.8 - 70.6</div>
            <div><span class="rdspeed" style="background-color:#66c2a5;"></span>70.6 - 80.4</div>
            <div><span class="rdspeed" style="background-color:#3288bd;"></span>80.4 - 90.2</div>
            <div><span class="rdspeed" style="background-color:#5e4fa2;"></span>90.2 - 100</div>
        </div>
        `
    }
    const uberspeedstile = getTiles(wmsLayer);

    const uberspeeds = new google.maps.ImageMapType({
        getTileUrl: uberspeedstile,
        minZoom: 0,
        maxZoom: 19,
        opacity: 1.0,
        alt: 'Nairobi roads travel speeds February',
        name: 'uberspeedstile',
        isPng: true,
        tileSize: new google.maps.Size(256, 256)
    });

    div = document.createElement('div');
    div.innerHTML = `Nairobi Travel Speeds<input id="uberCheck" type="checkbox" />`;
    mapLayersAccordion.appendChild(div);
    legend.addEventListener('change', e => {
        if (e.target.matches('#uberCheck')) {
            cb = document.getElementById('uberCheck')
                // if on
            if (cb.checked) {
                map.overlayMapTypes.setAt(3, uberspeeds);
                key();
            }
            if (!cb.checked) {
                // if off
                map.overlayMapTypes.removeAt(3);
                infoTab.querySelector('.info').innerHTML = '';
            }
        }
    });
}

function addTrafficLayer() {
    const trafficLayer = new google.maps.TrafficLayer();

    div = document.createElement('div');
    div.innerHTML = `Traffic Layer <input id="trafficChecked" type="checkbox" />`;

    mapLayersAccordion.appendChild(div);
    legend.addEventListener('change', e => {
        if (e.target.matches('#trafficChecked')) {
            cb = document.getElementById(`trafficChecked`)
                // if on
            if (cb.checked) {
                trafficLayer.setMap(map);
            }
            if (!cb.checked) {
                // if off
                trafficLayer.setMap(null);
            }
        }
    })
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
    div.innerHTML = `<img src='${iconUrl}' alt="${key}"/> ${key}<input id="${key}Checked" type="checkbox" />`;
    poiLayersAccordion.appendChild(div);
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
    div.innerHTML = `<img src='images/marker.png' alt='billboard'/>Billboards<input id="billboardChecked" checked type="checkbox" />`;
    essentialLayers.appendChild(div);
    legend.addEventListener('change', e => {
        if (e.target.matches('#billboardChecked')) {
            cb = document.getElementById('billboardChecked')
                // if on
            if (cb.checked) {
                markerCluster.addMarkers(markers)
            }
            if (!cb.checked) {
                // if off
                markerCluster.removeMarkers(markers)
            }
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
    div.innerHTML = `<img src='images/atm.png' alt="atm" />ATM<input id="atmCheck" type="checkbox">`;
    poiLayersAccordion.appendChild(div);
    legend.addEventListener('change', e => {
        if (e.target.matches('#atmCheck')) {
            cb = document.getElementById('atmCheck')
                // if on
            if (cb.checked) {
                markerCluster.addMarkers(markers)
            }
            if (!cb.checked) {
                // if off
                markerCluster.removeMarkers(markers)
            }
        }
    })
}

function addNssf(data) {
    const markers = data.map(el => {
        latitude = JSON.parse(el.geojson).coordinates[1];
        longitude = JSON.parse(el.geojson).coordinates[0];
        let latlng = new google.maps.LatLng(latitude, longitude);

        let contentString =
            '<p><strong>' + el.name + '<strong></p>' +
            '<button class="btn end" data-lat=' + latitude + ' data-long=' + longitude + ' >Go Here</button>' +
            '<button class="btn stop" data-lat=' + latitude + ' data-long=' + longitude + ' >Add Stop</button>' +
            '<button class="btn start" data-lat=' + latitude + ' data-long=' + longitude + ' >Start Here</button>';

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
    div.innerHTML = `<img src='images/office.png' alt="nssf Offices" />NSSF Offices<input id="nssfChecked" type="checkbox">`;
    poiLayersAccordion.appendChild(div);
    legend.addEventListener('change', e => {
        if (e.target.matches('#nssfChecked')) {
            cb = document.getElementById('nssfChecked')
                // if on
            if (cb.checked) {
                markerCluster.addMarkers(markers)
            }
            if (!cb.checked) {
                // if off
                markerCluster.removeMarkers(markers)
            }
        }

    })
}

function addMetalWorks(data) {
    const markers = data.map(el => {
        latitude = JSON.parse(el.geojson).coordinates[1];
        longitude = JSON.parse(el.geojson).coordinates[0];
        let latlng = new google.maps.LatLng(latitude, longitude);

        let contentString =
            '<p><strong>' + parseData(el.name) + '<strong></p>' +
            '<button class="btn end" data-lat=' + latitude + ' data-long=' + longitude + ' >Go Here</button>' +
            '<button class="btn stop" data-lat=' + latitude + ' data-long=' + longitude + ' >Add Stop</button>' +
            '<button class="btn start" data-lat=' + latitude + ' data-long=' + longitude + ' >Start Here</button>';

        let marker = new google.maps.Marker({
            position: latlng,
            icon: { url: `images/hammer.png`, scaledSize: new google.maps.Size(20, 20) },
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
    div.innerHTML = `<img src='images/hammer.png' alt="Hardware" />Hardware BlackSmiths<input id="hardwareChecked" type="checkbox">`;
    poiLayersAccordion.appendChild(div);
    legend.addEventListener('change', e => {
        if (e.target.matches('#hardwareChecked')) {
            cb = document.getElementById('hardwareChecked')
                // if on
            if (cb.checked) {
                markerCluster.addMarkers(markers)
            }
            if (!cb.checked) {
                // if off
                markerCluster.removeMarkers(markers)
            }
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
    div.innerHTML = `<img src='images/place.png'/>Mobile Uploads<input id="mobileCheck" type="checkbox">`;
    essentialLayers.appendChild(div);
    legend.addEventListener('change', e => {
        if (e.target.matches('#mobileCheck')) {
            cb = document.getElementById('mobileCheck')
                // if on
            if (cb.checked) {
                markerCluster.addMarkers(markers)
            }
            if (!cb.checked) {
                // if off
                markerCluster.removeMarkers(markers)
            }
        }

    })
}

function addugPopProj() {
    const key = () => {
        info = infoTab.querySelector('.info')
        info.innerHTML = `
        <div class="sublocLegend">
            <div>SubCounty Population Projection 2020</div>
            <div><span class="subColor" style="background-color:#f7fbff;"></span>1600 - 9200</div>
            <div><span class="subColor" style="background-color:#e2eef9;"></span>9200 - 12600</div>
            <div><span class="subColor" style="background-color:#cde0f2;"></span>12600 - 15530</div>
            <div><span class="subColor" style="background-color:#b0d2e8;"></span>15530 - 18640</div>
            <div><span class="subColor" style="background-color:#89bfdd;"></span>18640 - 21900</div>
            <div><span class="subColor" style="background-color:#60a6d2;"></span>21900 - 25200</div>
            <div><span class="subColor" style="background-color:#3e8ec4;"></span>25200 - 30400</div>
            <div><span class="subColor" style="background-color:#2172b6;"></span>30400 - 36400</div>
            <div><span class="subColor" style="background-color:#0a549e;"></span>36400 - 47880</div>
            <div><span class="subColor" style="background-color:#08306b;"></span>47880 - 445900</div>
        </div>`;
    }

    const ugtile = getTiles('Predictive:ugsubcountiesprojection')

    const ugPopProj = new google.maps.ImageMapType({
        getTileUrl: ugtile,
        minZoom: 0,
        maxZoom: 19,
        opacity: 1.0,
        alt: 'Uganda Population Projection 2020',
        name: 'ugPopProj',
        isPng: true,
        tileSize: new google.maps.Size(256, 256)
    });

    div = document.createElement('div');
    div.innerHTML = `Uganda Population Projection 2020 <input id="ugPopProjCheck" type="checkbox" />`;
    mapLayersAccordion.appendChild(div);

    legend.addEventListener('change', e => {
        if (e.target.matches('#ugPopProjCheck')) {
            cb = document.getElementById('ugPopProjCheck')
                // if on
            if (cb.checked) {
                map.overlayMapTypes.setAt(1, ugPopProj);
                key();
            }
            if (!cb.checked) {
                // if off
                map.overlayMapTypes.removeAt(1)
                    //   
                infoTab.querySelector('.info').innerHTML = '';
            }
        }
    });
}

function addGhanaPopulation() {
    const key = () => {
        info = infoTab.querySelector('.info');
        info.innerHTML =
            ` <div class="sublocLegend">
                <div> Ghana Districts Population </div> 
                <div><span class="subColor" style="background-color:#ffffcc;"></span>241 - 99580</div>
                <div><span class="subColor" style="background-color:#e4f4b6;"></span>99580 - 113844</div>
                <div><span class="subColor" style="background-color:#c9e99f;"></span>113844 - 128037</div>
                <div><span class="subColor" style="background-color:#a9dc8e;"></span>128037 - 142836</div>
                <div><span class="subColor" style="background-color:#88cd80;"></span>142836 - 158718</div>
                <div><span class="subColor" style="background-color:#68be71;"></span>158718 - 175951</div>
                <div><span class="subColor" style="background-color:#48af60;"></span>175951 - 199264</div>
                <div><span class="subColor" style="background-color:#2b9d51;"></span>199264 - 242204</div>
                <div><span class="subColor" style="background-color:#158244;"></span>242204 - 304658</div>
                <div><span class="subColor" style="background-color:#006837;"></span>304658 - 2578715</div>
            </div>
            `
    }
    const ghtile = getTiles('Predictive:ghanapopulation')

    const ghanaDist = new google.maps.ImageMapType({
        getTileUrl: ghtile,
        minZoom: 0,
        maxZoom: 19,
        opacity: 1.0,
        alt: 'Ghana Districts Population',
        name: 'Ghana Districts',
        isPng: true,
        tileSize: new google.maps.Size(256, 256)
    });

    div = document.createElement('div');
    div.innerHTML = `Ghana Districts <input id="ghCheck" type = "checkbox" />`;
    mapLayersAccordion.appendChild(div);
    legend.addEventListener('change', e => {
        if (e.target.matches('#ghCheck')) {
            cb = document.getElementById('ghCheck')
                // if on
            if (cb.checked) {
                map.overlayMapTypes.setAt(2, ghanaDist);
                key();
            }
            if (!cb.checked) {
                // if off
                map.overlayMapTypes.removeAt(2);
                infoTab.querySelector('.info').innerHTML = '';
            }
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
    if (e.target.matches('.accordion')) {
        // console.log(e);
        e.target.classList.toggle('is-open');
        const content = e.target.nextElementSibling;
        if (content.style.maxHeight) {
            // accordion is currently open, so close it
            content.style.maxHeight = null;
        } else {
            // accordion is currently cloed so open it
            content.style.maxHeight = content.scrollHeight + 'px';
        }
    }
    if (e.target.matches('.closeDirPanel')) {
        directionsRenderer.setMap(null);
        directionsRenderer = null;
        directionsPanel.parentElement.removeChild(directionsPanel);
    }
    if (e.target.matches('#annon')) {
        //Anno website tour
        const anno1 = new anno1([{
            target: '#legend',
            position: 'center-left',
            content: 'This is a legend'
        }])
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
        directionsService.route(request, function(response, status) {
            if (status == 'OK') {
                directionsRenderer.setDirections(response);
                directionsRenderer.setPanel(div);
                directionsPanel.appendChild(div);
                map.controls[google.maps.ControlPosition.LEFT_BOTTOM].push(directionsPanel);
            } else {
                window.alert("Directions request failed due to " + status);
            }
        });
    }

}

function loader() {
    document.getElementById("loader").style.display = "none";
    document.getElementById("billboardDetails").style.display = "block";
}
// create a modal
// get modal elements
const modal = document.querySelector('.modal');
// open modal btn
const modalBtn = document.querySelector('.modalBtn');
//close btn
const closeBtn = document.querySelector('.closeModal');
// listen for open click
modalBtn.addEventListener('click', openModal);
// listen for close click
closeBtn.addEventListener('click', closeModal);
// listen for outside click
window.addEventListener('click', clickOutside)

function openModal(e) {
    modal.style.display = 'block';
}

function closeModal(e) {
    modal.style.display = 'none';
}

function clickOutside(e) {
    if (e.target == modal) {
        modal.style.display = 'none';
    }

}

function readFile() {
    const fileUpload = document.getElementById('xlsFile');
    //Validate whether File is valid Excel file.
    const regex = /^([a-zA-Z0-9\s_\\.\-:])+(.xls|.xlsx)$/;

    const expectedrows = ['angle', 'billboard_empty', 'billboard_id', 'condition', 'constituency', 'date', 'direction_from_cbd', 'height', 'lat', 'long', 'orientation', 'photo', 'photo_longrange', 'road_type', 'route_name', 'scout_name', 'select_medium', 'site_lighting_illumination', 'site_run_up', 'size', 'traffic', 'visibility', 'zone'];

    if (regex.test(fileUpload.value.toLowerCase())) {
        if (typeof(FileReader) != "undefined") {
            const reader = new FileReader();
            const files = fileUpload.files,
                f = files[0];
            reader.onload = function(e) {

                const data = e.target.result;

                const workbook = XLSX.read(data, { type: 'binary' });

                //get the name of First Sheet.
                const Sheet = workbook.SheetNames[0];
                const workSheet = workbook.Sheets[Sheet];

                // convert the data in the first sheet to json
                const jsonData = XLSX.utils.sheet_to_row_object_array(workSheet);

                // check if the sheet has the expected columns
                let hasexpectedColumn;

                expectedrows.forEach(expRow => {
                    if (jsonData[0].hasOwnProperty(expRow)) {
                        hasexpectedColumn = true;
                    } else {
                        hasexpectedColumn = false;
                    }
                });
                if (hasexpectedColumn) { saveSheet(jsonData) } else { alert('The Excel file does not have the necessary columns. Please check it.') }
            };
            reader.readAsBinaryString(f);

        } else {
            alert("This browser does not support HTML5.");
        }
    } else {
        alert("Please upload a valid Excel file.");
    }

}
async function saveSheet(data) {
    //
    //Create a form data object to hold the property data json and photos.
    const formData = new FormData();

    // url where the data will be posted
    const url = './upload.php';

    console.log(data)
    formData.append('billboardData', JSON.stringify(data));

    const response = await fetch(url, {
        method: 'POST',
        body: formData,
    });
    if (response.status == 201) {
        alert('File saved successfully');
        my_map.remove();
        fetchData();
    } else if (response.status == 500) {
        alert('The file could not be saved. There is something wrong its format');
    }

}