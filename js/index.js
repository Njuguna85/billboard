var state = {};

async function fetchData() {
    //
    // await response for the fetch call
    // since there are no options passed, it will be a GET request
    let response = await fetch('./php/download.php');
    //
    // check if the promises was resolved
    if (response.ok) {
        // 
        // if it was resolved, its ok is set to true which we check 
        // access the promise body
        data = await response.json();
        // console.log(data);

        createMap(data);

    } else {
        alert('Something went wrong while fetching data. Error: ' + response.status);
    }
};
var my_map;

function createMap(data) {
    const mapboxUrl = 'https://api.mapbox.com/styles/v1/mapbox/{id}/tiles/{z}/{x}/{y}?access_token=pk.eyJ1IjoiZGVubmlzODUiLCJhIjoiY2s5anJ4dmx3MHd2NjNxcTZjZG05ZTY3ZSJ9.5Xo8GyJuZFYHHCnWZdZvsw'

    const mapboxAttribution = 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, <a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>';
    //
    // map styles
    //'streets-v11'
    //'light-v10'
    const streets = L.tileLayer(mapboxUrl, {
        id: 'light-v10',
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
    my_map = L.map(
        'map', {
        center: [-1.28333, 36.816667],
        zoom: 12
    });

    setTimeout(function () { my_map.invalidateSize() }, 100);


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
                'Name: <b>' + parseData(feature.properties.name) + '</b><br/>' +
                'Route: <b>' + parseData(feature.properties.routename) + '</b> <br/>' +
                'Size: <b>' + parseData(feature.properties.size) + '</b> <br/>' +
                'Visibility: <b>' + parseData(feature.properties.visibility) + '</b> <br/>' +
                'Medium: <b>' + parseData(feature.properties.selectmedi) + '</b> </br>' +
                '<img class="billboardImage" alt="billboard photo" src=' + feature.properties.photo + '></img>'
            )
        }
    });

    /*          ATM             */
    const atmData = data.atms;
    const atmJSON = [];
    atmData.forEach(atm => {
        let features = {
            type: 'Feature',
            properties: {
                'operator': atm.operator,
            },
            geometry: JSON.parse(atm.geojson),
        };
        atmJSON.push(features);
    });
    var atmGeoJSON = {
        type: 'FeatureCollection',
        features: atmJSON
    };
    const atmIcon = L.icon({
        iconUrl: 'images/atm.png',
        iconSize: [25, 25],
        popupAncor: [-3, -76],
    });
    const atms = L.geoJson(atmGeoJSON, {
        pointToLayer: (feature, latlng) => {
            return L.marker(latlng, {
                icon: atmIcon
            });
        },
        onEachFeature: (feature, layer) => {
            layer.bindPopup(
                'Operator: <b>' + parseData(feature.properties.operator)+ '</b><br/>'
            )
        }
    });
    const atmMarkers = new L.MarkerClusterGroup();
    atmMarkers.addLayer(atms);

    /*          banKS             */
    const bankData = data.banks;
    const bankJSON = [];
    bankData.forEach(bank => {
        let features = {
            type: 'Feature',
            properties: {
                'name': bank.name,
            },
            geometry: JSON.parse(bank.geojson),
        };
        bankJSON.push(features);
    });
    var bankGeoJSON = {
        type: 'FeatureCollection',
        features: bankJSON
    };
    const bankIcon = L.icon({
        iconUrl: 'images/bank.png',
        iconSize: [25, 25],
        popupAncor: [-3, -76],
    });
    const banks = L.geoJson(bankGeoJSON, {
        pointToLayer: (feature, latlng) => {
            return L.marker(latlng, {
                icon: bankIcon
            });
        },
        onEachFeature: (feature, layer) => {
            layer.bindPopup(
                'Name: <b>' + parseData(feature.properties.name) + '</b><br/>'
            )
        }
    });
    const bankMarkers = new L.MarkerClusterGroup();
    bankMarkers.addLayer(banks);

    /*          HOSPITALS             */
    const hospitalData = data.hospitals;
    const hospitalJSON = [];
    hospitalData.forEach(hospital => {
        let features = {
            type: 'Feature',
            properties: {
                'name': hospital.name,
            },
            geometry: JSON.parse(hospital.geojson),
        };
        hospitalJSON.push(features);
    });
    var hospitalGeoJSON = {
        type: 'FeatureCollection',
        features: hospitalJSON
    };
    const hospitalIcon = L.icon({
        iconUrl: 'images/hospital.png',
        iconSize: [25, 25],
        popupAncor: [-3, -76],
    });
    const hospitals = L.geoJson(hospitalGeoJSON, {
        pointToLayer: (feature, latlng) => {
            return L.marker(latlng, {
                icon: hospitalIcon
            });
        },
        onEachFeature: (feature, layer) => {
            layer.bindPopup(
                'Name: <b>' + parseData(feature.properties.name) + '</b><br/>'
            )
        }
    });
    //
    // clusters for the hospitals
    const hospitalMarkers = new L.MarkerClusterGroup();
    hospitalMarkers.addLayer(hospitals);

    /*          HOSPITALS             */
    const policeData = data.police;
    const policeJSON = [];
    policeData.forEach(police => {
        let features = {
            type: 'Feature',
            properties: {
                'name': police.name,
            },
            geometry: JSON.parse(police.geojson),
        };
        policeJSON.push(features);
    });
    var policeGeoJSON = {
        type: 'FeatureCollection',
        features: policeJSON
    };
    const policeIcon = L.icon({
        iconUrl: 'images/police.png',
        iconSize: [25, 25],
        popupAncor: [-3, -76],
    });
    const polices = L.geoJson(policeGeoJSON, {
        pointToLayer: (feature, latlng) => {
            return L.marker(latlng, {
                icon: policeIcon
            });
        },
        onEachFeature: (feature, layer) => {
            layer.bindPopup(
                'Name: <b>' + parseData(feature.properties.name) + '</b><br/>'
            )
        }
    });
    const policeMarkers = new L.MarkerClusterGroup();
    policeMarkers.addLayer(polices);

    /*          School             */
    const schoolData = data.schools;
    const schoolJSON = [];
    schoolData.forEach(school => {
        let features = {
            type: 'Feature',
            properties: {
                'name': school.name,
                'accessibility': school.accessibil
            },
            geometry: JSON.parse(school.geojson),
        };
        schoolJSON.push(features);
    });
    var schoolGeoJSON = {
        type: 'FeatureCollection',
        features: schoolJSON
    };
    const schoolIcon = L.icon({
        iconUrl: 'images/school.png',
        iconSize: [25, 25],
        popupAncor: [-3, -76],
    });
    const schools = L.geoJson(schoolGeoJSON, {
        pointToLayer: (feature, latlng) => {
            return L.marker(latlng, {
                icon: schoolIcon
            });
        },
        onEachFeature: (feature, layer) => {
            layer.bindPopup(
                'Name: <b>' + parseData(feature.properties.name) + '</b><br/>' +
                'Accessibility: ' + parseData(feature.properties.accessibility) + '</b><br/>'
            )
        }
    });
    const schoolMarkers = new L.MarkerClusterGroup();
    schoolMarkers.addLayer(schools);

    /*          UNIVERSITIES             */
    const uniData = data.universities;
    const uniJSON = [];
    uniData.forEach(uni => {

        let features = {
            type: 'Feature',
            properties: {
                'name': uni.name,
            },
            geometry: JSON.parse(uni.geojson),
        };
        uniJSON.push(features);
    });
    var uniGeoJSON = {
        type: 'FeatureCollection',
        features: uniJSON
    };
    const uniIcon = L.icon({
        iconUrl: 'images/university.png',
        iconSize: [25, 25],
        popupAncor: [-3, -76],
    });
    const unis = L.geoJson(uniGeoJSON, {
        pointToLayer: (feature, latlng) => {
            return L.marker(latlng, {
                icon: uniIcon
            });
        },
        onEachFeature: (feature, layer) => {
            layer.bindPopup(
                'Name: <b>' + parseData(feature.properties.name) + '</b><br/>'
            )
        }
    });
    const uniMarkers = new L.MarkerClusterGroup();
    uniMarkers.addLayer(unis);

    /*           UBER MEAN DISTANCE DATA                      */
    const uMD = data.uber;
    uDMJSON = [];
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
        var layer = e.target;

        layer.setStyle({
            weight: 5,
            color: '#666',
            dashArray: '',
            fillOpacity: 0
        });
        if (!L.Browser.ie && !L.Browser.opera && !L.Browser.edge) {
            layer.bringToFront();
        }
        info.update(layer.feature.properties);

    }
    function resetHighlightUber(e) {
        uber.resetStyle(e.target);
        info.update();
    }
    function zoomToFeatureUber(e) {
        my_map.flyToBounds(e.target.getBounds());
    }
    function onEachFeature(feature, layer) {
        layer.on({
            mouseover: highLightUber,
            mouseout: resetHighlightUber,
            click: zoomToFeatureUber
        });
    }
    var uber = L.geoJson(uDMJSON, {
        style: style,
        onEachFeature: onEachFeature
    });

    /*          custom information control              */
    var info = L.control({ position: 'topleft' });
    info.onAdd = function (my_map) {
        this._div = L.DomUtil.create('div', 'info') // create a div with the class of info
        this.update();
        return this._div;
    };
    // update the info control based on feature properties
    info.update = function (props) {
        this._div.innerHTML =
            '<h4>Uber Travel Data</h4>' +
            (props ?
                'Area Name: ' + '<b>' + props.areaName + '</b><br/>' +
                'Travel Time: ' + '<b>' + parseValues(props.travelTime) + '</b><br/>'
                : 'Enable the uber layer <br/>and Hover Over a region');
    };
    info.addTo(my_map);

    /*           SUBCOUNTIES  DATA                      */
    const subCountyStyle = {
        "fillColor": "#B3E5FC",
        "weight": 2,
    };
    const subCounties = data.subCounties;
    subCountyJSON = [];
    subCounties.forEach(subCounty => {
        let features = {
            type: 'Feature',
            properties: {
                'name': subCounty.subcontnam,
                'maleTotalPoulation': subCounty.malepopula,
                'femaleTotalPoulation': subCounty.femalepopu,
                'totalPopulation': subCounty.totalpopul,
                'totalAbove5Years': subCounty.total5abov,
                'totaldisabled': subCounty.totaldisab
            },
            geometry: JSON.parse(subCounty.geojson),
        }
        subCountyJSON.push(features);
    });
    function highLightsubCounty(e) {
        var layer = e.target;

        layer.setStyle({
            weight: 5,
            color: '#BA68C8',
            // fillOpacity: 0
            fillColor: '#42A5F5'
        });
        if (!L.Browser.ie && !L.Browser.opera && !L.Browser.edge) {
            layer.bringToFront();
        }
        sCountyinfo.update(layer.feature.properties);

    }
    function resetHighlightsubCounty(e) {
        nairobiSubCounties.resetStyle(e.target);
        sCountyinfo.update();
    }

    function zoomToSubCounty(e) {
        my_map.flyToBounds(e.target.getBounds());
    }
    function onEachSubCounty(feature, layer) {
        layer.on({
            mouseover: highLightsubCounty,
            mouseout: resetHighlightsubCounty,
            click: zoomToSubCounty
        });
    }
    const nairobiSubCounties = L.geoJson(subCountyJSON, {
        style: subCountyStyle,
        onEachFeature: onEachSubCounty
    });
    // custom information
    var sCountyinfo = L.control({ position: 'topleft' });
    sCountyinfo.onAdd = function (my_map) {
        this._div = L.DomUtil.create('div', 'sCountyinfo') // create a div with the class of sCountyinfo
        this.update();
        return this._div;
    };
    // update the sCountyinfo control based on feature properties
    sCountyinfo.update = function (props) {
        this._div.innerHTML =
            '<h4>2019 Census Data</h4>' +
            (props ?
                '<table>' +
                '<tr><td>Area Name: </td>' + '<b></td><td>' + props.name + '</td></b></tr>' +
                '<tr><td>Total Poulation: ' + '<b></td><td>' + parseValues(props.totalPopulation) + '</td></b></tr>' +
                '<tr><td>Male Population: ' + '<b></td><td>' + parseValues(props.maleTotalPoulation) + '</td><br/>' +
                '<tr><td>Female Population: ' + '<b></td><td>' + parseValues(props.femaleTotalPoulation) + '</td></b></tr>' +
                '<tr><td>Total Population Above 5 Years: ' + '<b></td><td>' + parseValues(props.totalAbove5Years) + '</td></b></tr>' +
                '<tr><td>Total Population Living with Disability: ' + '<b></td><td>' + parseValues(props.totaldisabled) + '</td></b></tr>' +
                '</table>'
                : 'Enable the sub counties layer <br/>and Hover Over a County');
    };
    sCountyinfo.addTo(my_map);

    /* Mathare */
    const mathareStyle = {
        "fillColor": "#FEB24C",
        "weight": 2,
        'opacity': 1,
        'color': 'white',
        'dashArray': '3',
        'fillOpacity': 0.7
    };
    const mathareData = data.mathare;
    mathareJSON = [];
    mathareData.forEach(area => {
        let features = {
            type: 'Feature',
            properties: {
                'Name': area.name,

            },
            geometry: JSON.parse(area.geojson),
        }
        mathareJSON.push(features);
    });
    const mathareArea = L.geoJson(mathareJSON, {
        style: mathareStyle
    });

    /* kibera area */
    const kiberaStyle = {
        "fillColor": "#FEB24C",
        "weight": 2,
        'opacity': 1,
        'color': 'white',
        'dashArray': '3',
        'fillOpacity': 0.7
    };
    const kiberaData = data.kibera;
    kiberaJSON = [];
    kiberaData.forEach(area => {
        let features = {
            type: 'Feature',
            properties: {
                'Name': area.name,

            },
            geometry: JSON.parse(area.geojson),
        }
        kiberaJSON.push(features);
    });
    const kiberaArea = L.geoJson(kiberaJSON, {
        style: kiberaStyle
    });
    /* add layers */
    const baseLayers = [{
        active: true,
        name: "Streets",
        layer: streets
    }, {
        name: "Satellite",
        layer: satellite
    }];
    const overLayers = [
        {
            active: true,
            name: "Billboards",
            icon: '<img src="images/marker.png" style="height:15px;"></img>',
            layer: billboards
        },
        {
            group: 'Maps',
            collapsed: true,
            layers: [{
                name: "Uber Travel Time From CBD",
                layer: uber
            },
            {
                name: "Nairobi Sub Counties",
                layer: nairobiSubCounties
            }, {
                name: 'Mathare Area',
                layer: mathareArea
            }, {
                name: 'Kibera Village',
                layer: kiberaArea
            }
            ]
        },
        {
            group: 'Points of Interest',
            collapsed: true,
            layers: [
                {
                    name: "ATM",
                    icon: '<img src="images/atm.png" style="height:18px;"></img>',
                    layer: atmMarkers
                },
                {
                    name: "Bank",
                    icon: '<img src="images/bank.png" style="height:18px;"></img>',
                    layer: bankMarkers
                },
                {
                    name: "Hospital",
                    icon: '<img src="images/hospital.png" style="height:18px;"></img>',
                    layer: hospitalMarkers
                },
                {
                    name: "Police Post",
                    icon: '<img src="images/police.png" style="height:18px;"></img>',
                    layer: policeMarkers
                },
                {
                    name: "Schools",
                    icon: '<img src="images/school.png" style="height:18px;"></img>',
                    layer: schoolMarkers
                },
                {
                    name: "Universities",
                    icon: '<img src="images/university.png" style="height:18px;"></img>',
                    layer: uniMarkers
                }
            ]
        }];
    var panelLayers = new L.Control.PanelLayers(baseLayers, overLayers, {
        title: 'LEGEND ',
        className: 'legend',
        compact: true,
    })
    my_map.addControl(panelLayers);
}
function parseValues(val) {
    if (val == null || val == undefined) {
        return ''
    }
    return val.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}
function parseData(val) {
    if (val == null || val == undefined) {
        return ''
    }
    return val;
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
        fetchData();
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
    const regex = /^([a-zA-Z0-9\s_\\.\-:])+(.xls|.xlsx)$/;

    const expectedrows = ['angle', 'billboard_empty', 'billboard_id', 'condition', 'constituency', 'date', 'direction_from_cbd', 'height', 'lat', 'long', 'orientation', 'photo', 'photo_longrange', 'road_type', 'route_name', 'scout_name', 'select_medium', 'site_lighting_illumination', 'site_run_up', 'size', 'traffic', 'visibility', 'zone'];

    if (regex.test(fileUpload.value.toLowerCase())) {
        if (typeof (FileReader) != "undefined") {
            const reader = new FileReader();
            const files = fileUpload.files, f = files[0];
            reader.onload = function (e) {

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
