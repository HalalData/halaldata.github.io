let mainMap;
let ajaxRequest;
let plotlist;
let plotlayers=[];

function stateChanged() {
	// if AJAX returned a list of markers, add them to the map
	if (ajaxRequest.readyState==4) {
		//use the info here that was returned
		if (ajaxRequest.status==200) {
			plotlist=eval("(" + ajaxRequest.responseText + ")");
			removeMarkers();
			for (i=0;i<plotlist.elements.length;i++) {
				let plotll = new L.LatLng(plotlist.elements[i].lat,plotlist.elements[i].lon, true);
				let plotmark = new L.Marker(plotll);
				plotmark.data=plotlist.elements[i];
				mainMap.addLayer(plotmark);
				plotmark.bindPopup("<h3>"+plotlist.elements[i].tags.name+"</h3>"+plotlist.elements[i].tags.amenity);
				plotlayers.push(plotmark);
			}
		}
	}
}

function removeMarkers() {
	for (i=0;i<plotlayers.length;i++) {
		mainMap.removeLayer(plotlayers[i]);
	}
	plotlayers=[];
}

function askForPlots() {
	// request the marker info with AJAX for the current bounds
	let bounds = mainMap.getBounds();
	let minll = bounds.getSouthWest();
	let maxll = bounds.getNorthEast();
	let msg = `https://lz4.overpass-api.de/api/interpreter?data=[out:json];node%20[diet=halal](${minll.lat},${minll.lng},${maxll.lat},${maxll.lng});out;`
	ajaxRequest.onreadystatechange = stateChanged;
	ajaxRequest.open('GET', msg, true);
	ajaxRequest.send(null);
}

function getXmlHttpObject() {
	if (window.XMLHttpRequest) { return new XMLHttpRequest(); }
	if (window.ActiveXObject)  { return new ActiveXObject("Microsoft.XMLHTTP"); }
	return null;
}

function onMapMove(e) { 
    askForPlots(); 
}

function main() {
    // set up AJAX request
    ajaxRequest = getXmlHttpObject();
    if (ajaxRequest == null) {
        alert ("This browser does not support HTTP Request");
        return;
    }
    
    mainMap = new L.map('map');

    // create the tile layer with correct attribution
	let osmUrl='https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
	let osmAttrib='Map data © <a href="https://openstreetmap.org">OpenStreetMap</a> contributors';
	let osm = new L.TileLayer(osmUrl, {attribution: osmAttrib});		

	// start the map in South-East England
	mainMap.setView(new L.LatLng(51.3, 0.7),6);
    mainMap.addLayer(osm);
	
	// adding search layer
	let searchLayer = L.layerGroup().addTo(mainMap);
	mainMap.addControl( new L.Control.Search({layer: searchLayer}) );

    askForPlots();
	mainMap.on('moveend', onMapMove);
}

main();