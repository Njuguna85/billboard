var state = {};

async function fetchData() {
    //
    // await response for the fetch call
    // since there are no options passed, it will be a GET request
    let response = await fetch('./download.php');
    //
    // check if the promises was resolved
    if (response.ok) {
        // 
        // if it was resolved, its ok is set to true which we check 
        // access the promise body
        let data = await response.json();
        state.mapData = data;

    } else {

        alert('Something went wrong while fetching data. Error: ' + response.status);

    }
};
fetchData();

function createMap(data) {

    const mapboxUrl = 'https://api.mapbox.com/styles/v1/mapbox/{id}/tiles/{z}/{x}/{y}?access_token=pk.eyJ1IjoiZGVubmlzODUiLCJhIjoiY2s5anJ4dmx3MHd2NjNxcTZjZG05ZTY3ZSJ9.5Xo8GyJuZFYHHCnWZdZvsw'

    const mapboxAttribution = 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, <a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>';

    //
    // map styles
    const streets = L.tileLayer(mapboxUrl, {
        id: 'streets-v11',
        tileSize: 512,
        zoomOffset: -1,
        attribution: mapboxAttribution
    }),
        satellite = L.tileLayer(mapboxUrl, {
            id: 'satellite-streets-v11',
            tileSize: 512,
            zoomOffset: -1,
            attribution: mapboxAttribution
        });

    // Create a new instance of the map class
    const my_map = L.map(
        'map', {
        center: [-1.28333, 36.816667],
        zoom: 12
    });

    setTimeout(function(){ my_map.invalidateSize()}, 100);


    /*           BILLBOARD DATA                      */
    const billboardsData = data.billboards;
    const popIcon = L.icon({
        iconUrl: 'images/marker.png',
        iconSize: [20, 20],
        popupAncor: [-3, -76],
    });
    const billboardJSON = [];
    billboardsData.forEach(billboard => {
        let features = {
            type: 'Feature',
            properties: {
                'name': billboard.billboardi,
                'routename': billboard.routename,
                'selectmedi': billboard.selectmedi,
                'sitelight': billboard.site_light,
                'zone': billboard.zone_,
                'size': billboard.size_,
                'orientation': billboard.orientatio,
                'condition': billboard.condition,
                'visibility': billboard.visibility,
                'traffic': billboard.traffic,
                'photo': billboard.photo,
                'road_type': billboard.road_type
            },
            geometry: {
                type: 'Point',
                coordinates: [billboard.longitude, billboard.latitude]
            }
        };
        billboardJSON.push(features);
    });
    var billboardGeoJSON = {
        type: 'FeatureCollection',
        features: billboardJSON
    };

    const billboards = L.geoJson(billboardGeoJSON, {
        pointToLayer: (feature, latlng) => {
            return L.marker(latlng, {
                icon: popIcon
            });
        },
        onEachFeature: (feature, layer) => {
            layer.bindPopup(
                'Name: <b>' + feature.properties.name + '</b><br/>' +
                'Route: <b>' + feature.properties.routename + '</b> <br/>' +
                'Size: <b>' + feature.properties.size + '</b> <br/>' +
                'Visibility: <b>' + feature.properties.visibility + '</b> <br/>' +
                'Medium: <b>' + feature.properties.selectmedi + '</b> </br>' +
                '<img class="billboardImage" alt="billboard photo" src=' + feature.properties.photo + '></img>'
            )
        }
    });

    /*           POINTS OF INTEREST DATA                      */
    const poiData = data.poi;
    const poiJSON = [];
    poiData.forEach(poi => {

        let features = {
            type: 'Feature',
            properties: {
                'title': poi.title,
                'type': poi.type,
                'subtype': poi.subtype,
                'level': poi.level,
            },
            geometry: JSON.parse(poi.geojson),
        };
        poiJSON.push(features);
    });
    var poiGeoJSON = {
        type: 'FeatureCollection',
        features: poiJSON
    };
    const poisIcon = L.icon({
        iconUrl: 'images/pmarker2.png',
        iconSize: [25, 25],
        popupAncor: [-3, -76],
    });

    const pois = L.geoJson(poiGeoJSON, {
        pointToLayer: (feature, latlng) => {
            return L.marker(latlng, {
                icon: poisIcon
            });
        },
        onEachFeature: (feature, layer) => {
            layer.bindPopup(
                'Name: <b>' + feature.properties.title + '</b><br/>' +
                'Type: <b>' + feature.properties.type + '</b> <br/>' +
                'Subtype: <b>' + feature.properties.subtype + '</b> </br>'
            )
        }
    });
    //
    // clusters for the points of interest
    const poiMarkers = new L.MarkerClusterGroup();
    poiMarkers.addLayer(pois);

    /*           SUBLOCATION DATA                      */
    const sublocationStyle = {
        "fillColor": "#FFFDE7",
        "weight": 1,
        "opacity": .7,
        "color": '#039BE5',
        'dashArray': '3',
        "fillOpacity": 0.7
    };
    const sublocations = data.sublocation;

    sublocationsJSON = [];
    sublocations.forEach(sublocation => {
        let features = {
            type: 'Feature',
            properties: {
                'id': sublocation.objectid,
                'division': sublocation.division,
                'Sublocation': sublocation.sublocation
            },
            geometry: JSON.parse(sublocation.geojson),
        }
        sublocationsJSON.push(features);
    });
    const nairobiSublocations = L.geoJson(sublocationsJSON, {
        style: sublocationStyle
    });

    /*           UBER MEAN DISTANCE DATA                      */

    const uMD = data.uber;
    uDMJSON = [];

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
    uMD.forEach(uber => {
        let features = {
            type: 'Feature',
            properties: {
                'movement': uber.movement_i,
                'areaName': uber.display_na,
                'origin': uber.origin_dis,
                'destination': uber.destinat_1,
                'travelTime': uber.mean_trave,
                'minTime': uber.range___lo,
                'maxTime': uber.range___up
            },
            geometry: JSON.parse(uber.geojson),
        }
        uDMJSON.push(features);
    });

    function style(feature) {
        return {
            fillColor: getColor(feature.properties.travelTime),
            weight: 2,
            opacity: 1,
            color: 'white',
            dashArray: '3',
            fillOpacity: 0.7
        };
    }

    function highLightUber(e) {
        const layer = e.target;

        layer.setStyle({
            weight: 5,
            color: '#666',
            dashArray: '',
            fillOpacity: 0.7
        });
        if (!L.Browser.ie && !L.Browser.opera && !L.Browser.edge) {
            layer.bringToFront();
        }
    }

    function resetHighlightUber(e) {
        uber.resetStyle(e.target);
    }

    function zoomToFeatureUber(params) {
        map.fitBounds(e.target.getBounds());
    }

    function onEachFeature(feature, layer) {
        layer.on({
            mouseover: highLightUber,
            mouseout: resetHighlightUber,
            click: zoomToFeatureUber
        });
    }

    const uber = L.geoJson(uDMJSON, {
        style: style,
        onEachFeature: onEachFeature
    });

    const baseLayers = [{
        active: true,
        name: "OpenStreetMap",
        layer: streets
    }, {
        name: "Satellite",
        layer: satellite
    }];
    const overLayers = [{
        active: true,
        name: "Billboards",
        icon: '<img src="images/marker.png" style="height:15px;"></img>',
        layer: billboards
    },
    {
        name: "POI'S",
        icon: '<img src="images/pmarker2.png" style="height:18px;"></img>',
        layer: poiMarkers
    },
    {
        name: "Uber Travel Time",
        layer: uber
    },
    {
        name: "Sublocations",
        layer: nairobiSublocations
    }
    ];
    var panelLayers = new L.Control.PanelLayers(baseLayers, overLayers)
    my_map.addControl(panelLayers);

}
// Your web app's Firebase configuration
var firebaseConfig = {
    apiKey: "AIzaSyANAkViYvvzsHNzdqeIgdZD2pnspcfjikM",
    authDomain: "billboard-sys.firebaseapp.com",
    databaseURL: "https://billboard-sys.firebaseio.com",
    projectId: "billboard-sys",
    storageBucket: "billboard-sys.appspot.com",
    messagingSenderId: "383019352632",
    appId: "1:383019352632:web:506bd1c91cbf0c1efc9ccd",
    measurementId: "G-NKLW873L8E"
};
// Initialize Firebase
firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const upload = document.querySelector('#upload');
const signUpBtn = document.querySelector('#signUp');
const signInBtn = document.querySelector('#signIn');
const signOutBtn = document.querySelector('.signOut');


if (upload) { upload.addEventListener('click', e => readFile(e), false); }
if (signUpBtn) { signUpBtn.addEventListener('click', e => signUp(e)); }
if (signInBtn) { signInBtn.addEventListener('click', e => logIn(e)); }
if (signOutBtn) { signOutBtn.addEventListener('click', signOut); }

function signUp(e) {
    e.preventDefault();
    e.stopPropagation();
    const email = document.getElementById('email');
    const password = document.getElementById('password');
    const promise = auth.createUserWithEmailAndPassword(email.value, password.value);
    promise.catch(e => {
        alert(e.message)
    });
    alert('Thank you for Signing Up');

}

function logIn(e) {
    e.preventDefault();
    e.stopPropagation();
    const email = document.getElementById('email');
    const password = document.getElementById('password');
    const promise = auth.signInWithEmailAndPassword(email.value, password.value);
    promise.catch(e => {
        alert(e.message)
    });
    alert('Welcome Back');

}

function signOut() {
    auth.signOut();
    alert('See You later');
}

auth.onAuthStateChanged(function (user) {
    if (user) {
        // User is signed in. 
        createMap(state.mapData);
        document.querySelector('#loginContainer').style.display = 'none';
        document.querySelector('#billboardDetails').style.display = 'initial';
    } else {
        // No user is signed in.
        document.querySelector('#loginContainer').style.display = 'flex';
        document.querySelector('#billboardDetails').style.display = 'none';
    }
});

function readFile() {
    
    const fileUpload = document.getElementById('xlsFile');
    //Validate whether File is valid Excel file.
    var regex = /^([a-zA-Z0-9\s_\\.\-:])+(.xls|.xlsx)$/;

    if (regex.test(fileUpload.value.toLowerCase())) {
        if (typeof (FileReader) != "undefined") {
            var reader = new FileReader();
            var files = fileUpload.files, f = files[0];
            reader.onload = function (e) {
                var data = new Uint8Array(e.target.result);
                datatoJson(data);
            };
            reader.readAsArrayBuffer(f);

        } else {
            alert("This browser does not support HTML5.");
        }
    } else {
        alert("Please upload a valid Excel file.");
    }
}

function datatoJson(data) {
    var workbook = XLSX.read(data, {
        type: 'array'
    })

    //get the name of First Sheet.
    var Sheet = workbook.SheetNames[0];

    // convert the data in the first sheet to json
    var data = XLSX.utils.sheet_to_json(workbook.Sheets[Sheet]);
    
    //
    //Create a form data object to hold the property data json and photos.
    const formData = new FormData();

    // url where the data will be posted
    const url = './upload.php';
    formData.append('billboardData', JSON.stringify(data))
    // fetch(url, {
    //     method: 'POST',
    //     body: formData,
    // })

}