const mapboxUrl = 'https://api.mapbox.com/styles/v1/mapbox/{id}/tiles/{z}/{x}/{y}?access_token=pk.eyJ1IjoiZGVubmlzODUiLCJhIjoiY2s5anJ4dmx3MHd2NjNxcTZjZG05ZTY3ZSJ9.5Xo8GyJuZFYHHCnWZdZvsw';
const mapboxAttribution = 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, <a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>';
//
// map styles
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
var my_map = L.map(
    'map', {
    center: [-1.28333, 36.816667],
    zoom: 11
});
// we need to make a request for mobile uploads within 
// the past one week from today(2 dates)
const today = new Date();
const oneWkAgo = today.setDate(today.getDate() - 7);
const oneWkAgoDate = new Date(oneWkAgo).toLocaleDateString('en-GB').split('/').join('-');
const todaysDate = new Date().toLocaleDateString('en-GB').split('/').join('-');
fetchMobileUploads(oneWkAgoDate, todaysDate);
fetchData();
/*
setInterval(() => {
    fetchMobileUploads(oneWkAgoDate, todaysDate);
}, 60000);
*/
async function fetchMobileUploads(oneWkAgoDate, todaysDate) {
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
        addmobile(mobileData.data);
    } else {
        alert('Something went wrong while fetching Mobile Uploads. Error: ' + response.status);
    }
}
async function fetchData() {
    let response = await fetch('./php/download.php');
    if (response.ok) {
        data = await response.json();
        addOverlays(data);
    } else {
        alert('Something went wrong while fetching data. Error: ' + response.status);
    }
};
function addOverlays(data) {
    let billboards = addBillboards(data.billboards);
    let atmMarkers = addAtm(data.atms);
    let bankMarkers = addBanks(data.banks);
    let hospitalMarkers = addHospitals(data.hospitals);
    let policeMarkers = addPolice(data.police);
    let schoolMarkers = addSchool(data.schools);
    let uniMarkers = addUni(data.universities);
    let uber = addUber(data.uber);
    let nairobiSubCounties = addSubCounties(data.subCounties);
    let nairobiSubLocations = addSubLocations(data.subLocations);
    let mathareArea = addMathare(data.mathare);
    let kiberaArea = addKibera(data.kibera);

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
            },
            {
                name: "Nairobi Sub Locations",
                layer: nairobiSubLocations
            },
            {
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
                    icon: '<img src="images/bank.png" style="height:18px;">',
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
function addmobile(deliveriesData) {
    //  console.log(deliveriesData);
    // filter the data by dates. 
    // first get all the dates 
    // create a dropdown list with the dates
    const uploadDates = [];
    const mobileData = new Object();
    const deliIcon = L.icon({
        iconUrl: 'images/delivered.png',
        iconSize: [20, 20],
        popupAncor: [-3, -76],
    });
    function getmobileMarkers(deliveriesData) {
        const deliJSON = [];
        deliveriesData.forEach(deli => {
            let features = {
                type: 'Feature',
                properties: {
                    'product_name': deli.product_name,
                    'quantity': deli.quantity,
                    'product_description': deli.product_description,
                    'delivered_by': deli.user.first_name,
                    'photo': deli.photo,
                },
                geometry: {
                    type: 'Point',
                    coordinates: [deli.longitude, deli.latitude]
                }
            };
            deliJSON.push(features);

            // add list of dates
            if (deli.created_at) {
                let date = deli.created_at.slice(0, 10);
                if (uploadDates.length == 0) {
                    uploadDates.push(date);
                } else {
                    if (uploadDates.includes(date) == false) {
                        uploadDates.push(date);
                    }
                }
            }
        });
        mobileData.dates = uploadDates;

        var delGeoJSON = {
            type: 'FeatureCollection',
            features: deliJSON
        };
        const deliveriesMarkers = L.geoJson(delGeoJSON, {
            pointToLayer: (feature, latlng) => {
                return L.marker(latlng, {
                    icon: deliIcon
                });
            },
            onEachFeature: (feature, layer) => {
                layer.bindPopup(
                    'Product Name: <b>' + parseData(feature.properties.product_name) + '</b><br/>' +
                    'Delivered By: <b>' + parseData(feature.properties.delivered_by) + '</b> <br/>' +
                    'Description: <b>' + parseData(feature.properties.product_description) + '</b> <br/>' +
                    'Quantity: <b>' + parseData(feature.properties.quantity) + '</b> <br/>' +
                    '<img class="billboardImage" alt="delivery photo" src=' + feature.properties.photo + '></img>'
                )
            }
        });
        mobileData.deliveriesMarkers = deliveriesMarkers;
        return mobileData;
    }
    let deliveries = getmobileMarkers(deliveriesData);
    const deliveryMarkers = new L.MarkerClusterGroup();
    deliveryMarkers.addLayer(deliveries.deliveriesMarkers);
    deliveryMarkers.addTo(my_map);

    // we now have all our dates now 
    // create a custom control 
    var selectDate = L.control({ position: 'topleft' });
    selectDate.onAdd = function (my_map) {
        this._div = L.DomUtil.create('div', 'filterDate')
        this.update();
        return this._div;
    };
    selectDate.update = function () {
        this._div.innerHTML = `
        <h5>Filter Mobile Uploads By Date</h5>
        <select id="uploadDate">
            <option value="">Select A Date...</option>
            ${deliveries.dates.map(date => { return `<option value="${date}">${date}</option>` })}
        </select>
        `;
    };
    selectDate.addTo(my_map);
    //
    // listen to a change in the select and capture its value
    // clear the layers and add the layers with the condition
    document.querySelector('#uploadDate').addEventListener('change', e => {
        const newDate = document.querySelector('#uploadDate').value;
        deliveryMarkers.clearLayers();
        const newMarkers = []
        deliveriesData.forEach(del => {
            let date = del.created_at.slice(0, 10);
            if (date === newDate) {
                // deliveryMarkers.addLayer(del);
                newMarkers.push(del);
            }

        })
        deliveries = getmobileMarkers(newMarkers);
        deliveryMarkers.addLayer(deliveries.deliveriesMarkers);
    });


}
function addBillboards(billboardsData) {
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
    return billboards = L.geoJson(billboardGeoJSON, {
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

}
function addAtm(atmData) {
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
                'Operator: <b>' + parseData(feature.properties.operator) + '</b><br/>'
            )
        }
    });
    const atmMarkers = new L.MarkerClusterGroup();
    return atmMarkers.addLayer(atms);
}
function addBanks(bankData) {
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
    return bankMarkers.addLayer(banks);

}
function addHospitals(hospitalData) {
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
    return hospitalMarkers.addLayer(hospitals);

}
function addPolice(policeData) {
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
    return policeMarkers.addLayer(polices);

}
function addSchool(schoolData) {
    const schoolJSON = [];
    schoolData.forEach(school => {
        let features = {
            type: 'Feature',
            properties: {
                'name': school.name
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
                'Name: <b>' + parseData(feature.properties.name) + '</b><br/>'
            )
        }
    });
    const schoolMarkers = new L.MarkerClusterGroup();
    return schoolMarkers.addLayer(schools);

}
function addUni(uniData) {
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
    return uniMarkers.addLayer(unis);
}
function addUber(uMD) {
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
    return uber = L.geoJson(uDMJSON, {
        style: style,
        onEachFeature: onEachFeature
    });
}
function addSubCounties(subCounties) {
    const subCountyStyle = {
        "fillColor": "#B3E5FC",
        "weight": 2,
    };
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
                : 'Enable the sub counties layer <br/>and Hover Over a Region');
    };
    sCountyinfo.addTo(my_map);

    return nairobiSubCounties = L.geoJson(subCountyJSON, {
        style: subCountyStyle,
        onEachFeature: onEachSubCounty
    });
}
function addSubLocations(subLocations) {
    const subLocationStyle = {
        "fillColor": "#EEEEEE",
        'color': '#78909C',
        "weight": 1.5,
    };
    sublocationJSON = [];
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
        sublocationJSON.push(features);
    });
    function highLightsubLocation(e) {
        var layer = e.target;

        layer.setStyle({
            weight: 5,
            color: '#2E7D32',
            fillColor: '#FFEB3B'
        });
        if (!L.Browser.ie && !L.Browser.opera && !L.Browser.edge) {
            layer.bringToFront();
        }
        sLocationInfo.update(layer.feature.properties);

    }
    function resetHighlightsubLocation(e) {
        nairobiSubLocations.resetStyle(e.target);
        sLocationInfo.update();
    }

    function zoomToSubLocation(e) {
        my_map.flyToBounds(e.target.getBounds());
    }
    function onEachSubLocation(feature, layer) {
        layer.on({
            mouseover: highLightsubLocation,
            mouseout: resetHighlightsubLocation,
            click: zoomToSubLocation
        });
    }
    // custom information
    var sLocationInfo = L.control({ position: 'topleft' });
    sLocationInfo.onAdd = function (my_map) {
        this._div = L.DomUtil.create('div', 'sLocationInfo') // create a div with the class of sLocationInfo
        this.update();
        return this._div;
    };
    // update the sLocationInfo control based on feature properties
    sLocationInfo.update = function (props) {
        this._div.innerHTML =
            '<h4>Sublocations Data</h4>' +
            (props ?
                '<table>' +
                '<tr><td>Area Name: </td>' + '<b></td><td>' + props.name + '</td></b></tr>' +
                '<tr><td>Total Poulation: ' + '<b></td><td>' + parseValues(props.totalPopulation) + '</td></b></tr>' +
                '<tr><td>Male Population: ' + '<b></td><td>' + parseValues(props.maleTotalPoulation) + '</td><br/>' +
                '<tr><td>Female Population: ' + '<b></td><td>' + parseValues(props.femaleTotalPoulation) + '</td></b></tr>' +
                '<tr><td>Total HouseHolds: ' + '<b></td><td>' + parseValues(props.totalHouseHold) + '</td></b></tr>' +
                '</table>'
                : 'Enable the sub locations layer <br/>and Hover Over a Region');
    };
    sLocationInfo.addTo(my_map);
    return nairobiSubLocations = L.geoJson(sublocationJSON, {
        style: subLocationStyle,
        onEachFeature: onEachSubLocation
    });
}
function addMathare(mathareData) {
    const mathareStyle = {
        "fillColor": "#FEB24C",
        "weight": 2,
        'opacity': 1,
        'color': 'white',
        'dashArray': '3',
        'fillOpacity': 0.7
    };
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
    return mathareArea = L.geoJson(mathareJSON, {
        style: mathareStyle
    });
}
function addKibera(kiberaData) {
    const kiberaStyle = {
        "fillColor": "#FEB24C",
        "weight": 2,
        'opacity': 1,
        'color': 'white',
        'dashArray': '3',
        'fillOpacity': 0.7
    };
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
    return kiberaArea = L.geoJson(kiberaJSON, {
        style: kiberaStyle
    });
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
