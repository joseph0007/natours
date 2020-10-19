/* eslint-disable */

export const setMap = () => {
  if(document.getElementById('map'))
  {
    const locations = JSON.parse(document.getElementById('map').dataset.locations);

    //mapboxgl object is available to us from the script that we loaded in the head!!
    mapboxgl.accessToken =
      'pk.eyJ1Ijoiam9zZXBoam95IiwiYSI6ImNrZzIxcTRubjBkZTYycnBhOXA5c3N5bTIifQ.2CSV6snrC1vSDPT3XksxAw';
    var map = new mapboxgl.Map({
      container: 'map',
      style: 'mapbox://styles/josephjoy/ckg221l120b1t19ol3n381mmo',
      scrollZoom: false,
    });
  
    const bounds = new mapboxgl.LngLatBounds();
  
    locations.forEach((loc) => {
      //create an element
      const element = document.createElement('div');
      element.className = 'marker';
  
      //add a popup
      new mapboxgl.Popup({
        offset: 30,
      })
        .setLngLat(loc.coordinates)
        .setHTML(`<p>Day ${loc.day}: ${loc.description}  </p>`)
        .addTo(map);
  
      //add the location coordinates to the bounds object
      new mapboxgl.Marker({
        element,
        anchor: 'bottom',
      })
        .setLngLat(loc.coordinates)
        .addTo(map);
  
      bounds.extend(loc.coordinates);
    });
  
    map.fitBounds(bounds, {
      padding: {
        top: 150,
        right: 100,
        bottom: 150,
        left: 100,
      },
    });
  }
}
