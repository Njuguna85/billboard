const mapContainer = document.getElementById("map");
let infoWindow;
let map, heatmap;

let legend = document.createElement('div');
legend.setAttribute('id', 'legend');
legend.innerHTML = `<h3>Map Legend</h3>`;

essentialLayers = document.createElement('div');
essentialLayers.className = 'essentialLayers';
legend.appendChild(essentialLayers);

eablpoiLayer = document.createElement('div');
eablpoiLayer.innerHTML = '<h5>Points of Interest</h5>';
eablpoiLayer.className = 'eablpoiLayer';
legend.appendChild(eablpoiLayer);

const directionsPanel = document.createElement('div');
directionsPanel.className = 'directionsPanel';
directionsPanel.innerHTML = ` 
            <h3>Directions</h3>
            <span class="closeBtn closeDirPanel">&times;</span>
            `;

const infoTab = document.createElement('div');
infoTab.setAttribute('id', 'infoTab');
infoTab.innerHTML = `<h3>More Info</h3><div class="info"></div>`;

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
    let response = await fetch('./php/eabl.php');
    if (response.ok) {
        data = await response.json();
        addOverlays(data)
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

function addOverlays(data) {
    commD = ['university', 'police'];
    eablCat = ['bar', 'casino', 'pub', 'restaraunt', 'nightClub']
    for (const [key, value] of Object.entries(data)) {
        if (commD.includes(key)) {
            add(key, value);
        }
    }
    addBillboards(data.billboard);
    addTrafficLayer();
    nairobiSublWMS();

    const clusterMkGen = (cat) => {
            const markers = data.eabl.filter(el =>
                el.type == cat).map(val => {
                latitude = JSON.parse(val.geojson).coordinates[1];
                longitude = JSON.parse(val.geojson).coordinates[0];
                let latlng = new google.maps.LatLng(latitude, longitude);
                let iconUrl = `images/${val.type}.png`;
                let markerString =
                    '<p><strong>' + val.name + '<strong></p>' +
                    '<button class="btn end" data-lat=' + latitude + ' data-long=' + longitude + ' >Go Here</button>' +
                    '<button class="btn stop" data-lat=' + latitude + ' data-long=' + longitude + ' >Add Stop</button>' +
                    '<button class="btn start" data-lat=' + latitude + ' data-long=' + longitude + ' >Start Here</button>';
                let marker = new google.maps.Marker({
                    position: latlng,
                    icon: { url: iconUrl, scaledSize: new google.maps.Size(20, 20) },
                    optimized: false,
                });
                google.maps.event.addListener(marker, 'click', ((marker, val) => {
                    return () => {
                        infoWindow.setContent(markerString);
                        infoWindow.open(map, marker);
                    }
                })(marker, val));

                return marker;
            })
            return markers;
        }
        // add the cluster to the map
    const markerCluster = new MarkerClusterer(
        map, [], { imagePath: 'https://developers.google.com/maps/documentation/javascript/examples/markerclusterer/m' }
    );
    //'
    // add the eabl types to the legend
    // and listen to click events to the dom
    eablCat.forEach((el, i) => {
        div = document.createElement('div');
        div.innerHTML =
            `<img src='images/${el}.png' alt='${el}'/> ${el}<input id="${el}Checked" type="checkbox" /> `;
        eablpoiLayer.appendChild(div);
        const markers = clusterMkGen(el)
        legend.addEventListener('change', e => {
            if (e.target.matches(`#${el}Checked`)) {
                cb = document.getElementById(`${el}Checked`)
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
    eablpoiLayer.appendChild(div);
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

function addTrafficLayer() {
    const trafficLayer = new google.maps.TrafficLayer();

    div = document.createElement('div');
    div.innerHTML = `Traffic Layer <input id="trafficChecked" type="checkbox" />`;

    essentialLayers.appendChild(div);
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

function nairobiSublWMS() {
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
    const key = () => {
        info = infoTab.querySelector('.info')
        info.innerHTML = `
        <div class="sublocLegend">
            <div>KEY</div>
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
    const nrbtile = getTiles('Predictive:nairobisublocations');

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
    essentialLayers.appendChild(div);
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
        directionsService.route(request, function(response, status) {
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

// Your web app's Firebase configuration
var firebaseConfig = {
    apiKey: "AIzaSyD-ntSGTmrq1JSf9a80bLiUMLWOPGI8As8",
    authDomain: "gis-preductive-analytics.firebaseapp.com",
    databaseURL: "https://gis-preductive-analytics.firebaseio.com",
    projectId: "gis-preductive-analytics",
    storageBucket: "gis-preductive-analytics.appspot.com",
    messagingSenderId: "21440633703",
    appId: "1:21440633703:web:fbf8da3a993579c3fc6dc2",
    measurementId: "G-GJGHDHNJHD"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();

const signInBtn = document.querySelector('#signIn');

if (signInBtn) { signInBtn.addEventListener('click', e => logIn(e)); }

function logIn(e) {
    e.preventDefault();
    e.stopPropagation();
    const email = document.getElementById('email');
    const password = document.getElementById('password');
    const promise = auth.signInWithEmailAndPassword(email.value, password.value);
    promise.catch(e => {
        window.alert(e.message)
    });
    window.alert('Welcome Back');

}
auth.onAuthStateChanged(function(user) {
        if (user) {
            // User is signed in. 
            document.querySelector('#loginContainer').style.display = 'none';
            document.querySelector('#billboardDetails').style.display = 'block';
        } else {
            // No user is signed in.
            document.querySelector('#loginContainer').style.display = 'flex';
            document.querySelector('#billboardDetails').style.display = 'none';
        }
    })
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