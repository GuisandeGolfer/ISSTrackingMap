//Map Creation ===============

const api_url = "https://api.wheretheiss.at/v1/satellites/25544";
const attribution =
  'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, <a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>';
const URL_Template = "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png?{foo}";

let isFirst = true;

let button = {
  clicked: false,
  city: null
};

const map = L.map("ISSmap", {
  center: [0, 0],
  zoom: 1
});
const tiles = L.tileLayer(URL_Template, {
  foo: "bar",
  attribution: attribution
}).addTo(map);

//Button EventListeners ============

document.addEventListener("DOMContentLoaded", () => {
  const buttons = document.querySelectorAll(".citybutton");
  buttons.forEach(button => {
    button.addEventListener("click", function() {
      snapToCity(button.innerHTML);
    });
  });
  const worldView = document.querySelector("#world");
  worldView.addEventListener("click", () => map.fitWorld().zoomIn(2));

  const ISS = document.querySelector("#ISS");
  ISS.addEventListener("click", () => {
    if (map.getZoom() > 6) {
      map.setZoom(4);
      grabISSCoordinates();
    }
    grabISSCoordinates();
  });
});

let snapToCity = city => {
  switch (city) {
    case "London":
      const geoLondon = [51.5074, 0.1278];
      map.setView(geoLondon, 6, {
        animate: true,
        pan: {
          duration: 0.8
        }
      });
      break;
    case "Paris":
      const geoParis = [48.8566, 2.3522];
      map.setView(geoParis, 6, {
        animate: true,
        pan: {
          duration: 0.8
        }
      });
      break;
    case "Dubai":
      const geoDubai = [25.2048, 55.2708];
      map.setView(geoDubai, 4, {
        animate: true,
        pan: {
          duration: 0.3
        }
      });
      break;
    case "San Francisco":
      const geoSF = [37.7749, -122.4194];
      map.setView(geoSF, 7, {
        animate: true,
        pan: {
          duration: 0.2
        }
      });
      break;

    default:
      alert("Sorry Something is wrong with our buttons");
      break;
  }
};

//creation of the ISSIcon
const ISSIcon = L.icon({
  iconUrl: "assets/ISS.svg",
  iconSize: [50, 32],
  iconAnchor: [25, 16],
  shadowURL: "assets/shadow.jpg",
  shadowSize: [68, 95],
  shadowAnchor: [22, 94]
});

//addition of the icon to the map
const marker = L.marker([0, 0], {
  icon: ISSIcon
}).addTo(map);

// ISS Map Updater ================
async function grabISSCoordinates() {
  const response = await fetch(api_url);
  const data = await response.json();
  //object deconstructing.
  const { latitude, longitude } = data;

  map.setView([latitude, longitude]);
}

async function grabISS() {
  const response = await fetch(api_url);
  const data = await response.json();
  //object deconstructing.
  const { latitude, longitude, altitude } = data;

  //visual settings for Leaflet
  const aspect = 1.5625;
  const w = (altitude * aspect) / 10;
  const h = altitude / 10;
  ISSIcon.options.iconSize = [w, h];
  ISSIcon.options.iconAnchor = [w / 2, h / 2];

  // L.marker([latitude, longitude]).addTo(map);
  marker.setLatLng([latitude, longitude]);
  if (isFirst) {
    map.setView([latitude, longitude]);
    isFirst = false;
  }

  //addition of a ~kinda tracking line for the ISS
  let lat = new L.LatLng(latitude, longitude); //these two lines don't really make sense but it works
  let long = new L.LatLng(latitude, longitude);
  let coordinates = [lat, long];
  let thePolyline = new L.Polyline(coordinates, {
    color: "red",
    weight: 2,
    smoothFactor: 1
  });
  thePolyline.addTo(map);

  document.getElementById("lat").textContent = latitude.toFixed(2);
  document.getElementById("long").textContent = longitude.toFixed(2);
  document.getElementById("altitude").textContent = altitude.toFixed(2);
}
grabISS();

setInterval(grabISS, 2000);
