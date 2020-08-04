const mapContainer = document.getElementById("map");
let infoWindow;
let map, heatmap;

let legend = document.createElement('div');
legend.setAttribute('id', 'legend');
legend.innerHTML = `<h3>Map Legend</h3>`;

aqLayers = document.createElement('div');
aqLayers.innerHTML = '<h5>African Queen</h5>';
aqLayers.className = 'aqLayers';
legend.appendChild(aqLayers);

essentialLayers = document.createElement('div');
essentialLayers.className = 'essentialLayers';
legend.appendChild(essentialLayers);

const directionsPanel = document.createElement('div');
directionsPanel.className = 'directionsPanel';
directionsPanel.innerHTML = ` <h3>Directions</h3>`;

function initMap() {
    // set the zoom, scale, street view and full screen controls
    // also create a custom map style 
    const mapOptions = {
        zoom: 8,
        center: { lat: 0.31628, lng: 32.58219 },
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
    fetchMobileUploads();
    fetchData();
    // initialize directions service
    directionsService = new google.maps.DirectionsService();
    directionsRenderer = new google.maps.DirectionsRenderer();
    directionsRenderer.setMap(map);

}

async function fetchData() {
    let response = await fetch('./php/aq.php');
    if (response.ok) {
        data = await response.json();
        localStorage.setItem('aq', JSON.stringify(data.aq))
        addAQ(data.aq)
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

function addAQ(data) {
    //
    // the pre-existing cusomer types
    const aQCustCat = ['Airline', 'Bar', 'Beauty shop', 'Bookshop', 'Border Duty Free Shop', 'Canteen', 'Cash', 'Clinic/ Surgery', 'College', 'Convenience store', 'Cosmetics', 'Dairy shop', 'Drug store', 'Foods', 'General Merchandiser', 'Hospital', 'Hotel', 'Hypermarket', 'Inn/ Motel', 'Key Account', 'Kiosk', 'Mini supermarket', 'Office', 'Other', 'Petrol station', 'Pharmacy', 'Primary School', 'Recreational', 'Restaurant', 'Sales Rep', 'Saloon', 'Secondary School', 'Spa', 'Staff', 'Stationary', 'Supermarket', 'University', 'Washing bay', 'Wholesaler'];
    //
    // create a new array of the same customers types with no spaces and special characters
    const newaQCustCat = aQCustCat.map(el => {
        newEl = el.split('/').join(' ').split(' ');
        return newEl.join('');
    });
    const clustMkGen = (customerCategory) => {

        const markers = data.filter(x => x.customer_t == customerCategory).map(value => {
            let latlng = new google.maps.LatLng(value.latitude, value.longitude);
            iconUrl = `images/pMarker.png`;
            let markerStringDet =
                '<div>' + 'Customer Name: <b>' + parseData(value.customer_n) + '</b></div>' +
                '<div>' + 'Customer Type: <b>' + parseData(value.customer_t) + '</b></div>' +
                '<div>' + 'Address: <b>' + parseData(value.address_1) + '</b></div>' +
                '<div>' + 'BT Territory: <b>' + parseData(value.bt_territo) + '</b></div>' +
                '<div>' + 'BT Area: <b>' + parseData(value.bt_area) + '</b></div>' +
                '<div>' + 'BT Town: <b>' + parseData(value.bt_town) + '</b></div>' +
                '<div>' + 'CS Channel: <b>' + parseData(value.cs_chanel) + '</b></div>' +
                '<button class="btn end" data-lat=' + value.latitude + ' data-long=' + value.longitude + ' >Go Here</button>' +
                '<button class="btn stop" data-lat=' + value.latitude + ' data-long=' + value.longitude + ' >Add Stop</button>' +
                '<button class="btn start" data-lat=' + value.latitude + ' data-long=' + value.longitude + ' >Start Here</button>';

            let marker = new google.maps.Marker({
                position: latlng,
                icon: { url: iconUrl, scaledSize: new google.maps.Size(20, 20) },
                optimized: false,
            });
            google.maps.event.addListener(marker, 'click', ((marker, value) => {
                return () => {
                    infoWindow.setContent(markerStringDet);
                    infoWindow.open(map, marker);
                }
            })(marker, value));

            return marker;
        });
        return markers;
    }

    // add the cluster to the map
    const markerCluster = new MarkerClusterer(
        map, [], { imagePath: 'https://developers.google.com/maps/documentation/javascript/examples/markerclusterer/m' }
    );
    //'
    // add the customer types to the legend
    // and listen to click events to add the customers to the dom
    newaQCustCat.forEach((el, i) => {
        div = document.createElement('div');
        div.innerHTML =
            `
            <img src='images/pMarker.png' alt='${aQCustCat[i]}'/> ${aQCustCat[i]}<input id="${el}Checked" type="checkbox" />
        `;
        aqLayers.appendChild(div);
        const markers = clustMkGen(aQCustCat[i])
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
auth.onAuthStateChanged(function (user) {
    if (user) {
        // User is signed in. 
        document.querySelector('#loginContainer').style.display = 'none';
        document.querySelector('#map').style.display = 'block';
    } else {
        // No user is signed in.
        document.querySelector('#loginContainer').style.display = 'flex';
        document.querySelector('#map').style.display = 'none';
    }
})