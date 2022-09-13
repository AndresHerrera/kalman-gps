let trackGPS;
const ui = {
    mapId: "map",
    map:null,
    polylines:[],
    setup: function() {
        let outputHeader = "DateTime|Lat|Long|Accuracy|Distance|KMLat|KMLong|Sum|KMSum|<br/>\n";
        ui.content = document.getElementById("clipboardContent");
        ui.content.innerHTML += outputHeader;
        trackGPS = new TrackGPS();
        
        this.controlButton = document.getElementById("control");
        this.controlButton.addEventListener("click", ui.pressStop);

        this.content = document.getElementById("clipboardContent");
        this.table = document.getElementById("resultTable");

        this.kalmanCheckbox = document.getElementById("displayKalman");
        this.kalmanCheckbox.addEventListener("click", ui.toggleKalman);

        this.copyButton = document.getElementById("copy");
        this.copyButton.addEventListener("click", ui.copyText);

        this.accuracy = document.getElementById("accuracy");
        this.accuracy.value = trackGPS.config.maxAllowAccuracy;
        this.accuracy.addEventListener("change", ui.changeAccuracy);

        this.interval = document.getElementById("interval");
        this.interval.value = trackGPS.config.timePeriod;
        this.interval.addEventListener("change", ui.changeInterval);

		initMap();
    },
    reCenter: true,
    pressStop: function() {
        trackGPS.runtime.continueCollect = !trackGPS.runtime.continueCollect;
        ui.controlButton.innerText = trackGPS.runtime.continueCollect ? "Stop" : "Resume";
    },
    toggleKalman: function() {
        trackGPS.config.showKalman = ui.kalmanCheckbox.checked;
    },
    copyText: function(){
        navigator.clipboard.writeText(ui.content.textContent);

    },
    changeAccuracy: function(){
        trackGPS.config.maxAllowAccuracy = ui.accuracy.value;
    },
    changeInterval: function(){
        trackGPS.config.timePeriod = ui.interval.value;
    },
    writeResult: function(strs) {
        let html = "";
        let clipboardString = "";
        strs.forEach((e,i) => {
            let text = i === 0 ?
                e.getUTCHours() + ":" + e.getUTCMinutes() + ":" + e.getUTCSeconds()
                : e;

            html += "<td>" + text + "</td>";
            clipboardString += text + "|";
        });
        ui.table.insertRow(1).innerHTML = html;
        ui.content.innerHTML += clipboardString + "\n";
    }
};


function getLocation() {
    const options = {
        enableHighAccuracy: true,
        timeout: trackGPS.config.timeOutGPS,
        maximumAge: 0
    };

    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(geoSuccess, geoError, options);
    } else {
        alert("Geolocation is not supported by this browser.");
    }
}

function geoSuccess(position) {
    
    setTimeout(getLocation, trackGPS.config.timePeriod);
    if (ui.reCenter) {
        ui.reCenter = false;
        console.log('re-centered');
        //ui.map.setCenter(new google.maps.LatLng(position.coords.latitude, position.coords.longitude));
		console.log(position.coords.latitude + " , " +  position.coords.longitude);
    }

    if (!trackGPS.runtime.continueCollect)
        return;
    trackGPS.processPosition(position);
}


function geoError(e) {
    console.log(e.code + " " + e.message);
}

function initMap() {
    getLocation();
}

window.addEventListener('load', function() {
    ui.setup();
});