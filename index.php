<?php
require 'dbase.php';
$db = new database();
// $db->getUberMeanTime();
?>
<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">

    <!-- Leaflet css cdn link -->
    <link rel="stylesheet" href="https://unpkg.com/leaflet@1.6.0/dist/leaflet.css" integrity="sha512-xwE/Az9zrjBIphAcBb3F6JVqxf46+CDLwfLMHloNu6KEQCAWi6HcDUbeOfBIptF7tcCzusKFjFw2yuvEpDL9wQ==" crossorigin="" />

    <!-- Leaflet from a CDN -->
    <script src="https://unpkg.com/leaflet@1.6.0/dist/leaflet.js" integrity="sha512-gZwIG9x3wUXg2hdXF6+rVkLF/0Vi9U8D2Ntg4Ga5I5BZpVkVxlJWbSQtXPSiUTtC0TjtGOmxa1AJPuV0CPthew==" crossorigin=""></script>

    <!-- Cluster Plugin -->
    <link rel="stylesheet" href="plugins/Leaflet.markercluster-1.4.1/dist/MarkerCluster.css">
    <link rel="stylesheet" href="plugins/Leaflet.markercluster-1.4.1/dist/MarkerCluster.Default.css">
    <script src="plugins/Leaflet.markercluster-1.4.1/dist/leaflet.markercluster.js"></script>

    <style>
        html,
        body {
            padding: 0;
            margin: 0;
            height: 100%;
            width: 100%;
        }

        #map {
            width: 80%;
            height: 70%;
            margin: 0 auto;
        }

        h3 {
            text-align: center;
        }

        .mycluster {
            width: 40px;
            height: 40px;
            background-color: greenyellow;
            text-align: center;
            font-size: 24px;
        }
    </style>

    <title>Consumer Billboard System</title>
</head>

<body>
    <h3>Consumer Billboard System</h3>
    <div id="map"></div>
    <script>
        const mapboxUrl = 'https://api.mapbox.com/styles/v1/mapbox/{id}/tiles/{z}/{x}/{y}?access_token=pk.eyJ1IjoiZGVubmlzODUiLCJhIjoiY2s5anJ4dmx3MHd2NjNxcTZjZG05ZTY3ZSJ9.5Xo8GyJuZFYHHCnWZdZvsw'

        const mapboxAttribution = 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, <a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="https://www.mapbox.com/">Mapbox</a> | <a href="http://mutall.co.ke">Mutall</a>';

        const billboardsData = <?php $db->getBillboardLocations(); ?>;
        //
        // map styles
        const Streets = L.tileLayer(mapboxUrl, {
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
                zoom: 12,
                layers: [satellite, Streets]
            });
        /*           BILLBOARD DATA                      */
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
                    'name: <b>' + feature.properties.name + '</b><br/>' +
                    'routename: <b>' + feature.properties.routename + '</b> <br/>' +
                    'selectmedi: <b>' + feature.properties.selectmedi + '</b> </br>'
                )
            }
        });

        /*           POINTS OF INTEREST DATA                      */
        const poiData = <?php $db->getPointsOfInterest(); ?>;
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
            iconUrl: 'images/pMarker.png',
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
                    'title: <b>' + feature.properties.title + '</b><br/>' +
                    'type: <b>' + feature.properties.type + '</b> <br/>' +
                    'subtype: <b>' + feature.properties.subtype + '</b> </br>'
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
        const sublocations = <?php $db->getNairobiSublocations() ?>;
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
    
        const uMD = <?php $db->getUberMeanTime(); ?>;
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
            onEachFeature:onEachFeature
        });

        const baseMaps = {
            "Satellite": satellite,
            "Street": Streets
        };
        const overlayMaps = {
            "Billboards": billboards,
            "POI'S": poiMarkers,
            'Uber Travel Time': uber,
            'Sublocations': nairobiSublocations,
        };
        //
        // add them as control layers ie you can switch them on an off 
        L.control.layers(baseMaps, overlayMaps).addTo(my_map);
    </script>
</body>

</html>