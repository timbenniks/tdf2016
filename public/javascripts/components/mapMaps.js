import GoogleMapsLoader from 'google-maps';
import 'babel-polyfill';

export default class MapsHandler {
  constructor( mapHandler ){
    this.emitter = mapHandler.emitter;
    this.routePoly = false;
  }

  loadMap(){
    GoogleMapsLoader.KEY = 'AIzaSyBom_Va46C1Qh66p6d4e9QWd8J7U6oMElM';
    GoogleMapsLoader.load( ( google )=> {
      google.maps.event.addDomListener( window, 'load', this.initializeMap.bind( this ) );
      google.maps.event.addDomListener( window, 'resize', this.fitBoundsToRoute.bind( this ) );
    } );
  }

  initializeMap(){
    this.mapOptions = {
      zoom: 15,
      styles: [{"featureType":"water","stylers":[{"color":"#dddddd"},{"visibility":"on"}]},{"featureType":"landscape","stylers":[{"color":"#f2f2f2"}]},{"featureType":"road","stylers":[{"saturation":-100},{"lightness":45}]},{"featureType":"road.highway","stylers":[{"visibility":"simplified"}]},{"featureType":"road.arterial","elementType":"labels.icon","stylers":[{"visibility":"off"}]},{"featureType":"administrative","elementType":"labels.text.fill","stylers":[{"color":"#444444"}]},{"featureType":"transit","stylers":[{"visibility":"off"}]},{"featureType":"poi","stylers":[{"visibility":"off"}]}],
      panControl: false,
      zoomControl: true,
      zoomControlOptions: {
        position: google.maps.ControlPosition.LEFT_TOP,
        style: google.maps.ZoomControlStyle.SMALL
      },
      mapTypeControl: false,
      scaleControl: false,
      streetViewControl: false,
      overviewMapControl: false,
      scrollwheel: true,
      mapTypeId: google.maps.MapTypeId.TERRAIN,
      center: { lat: 48.8566140, lng: 2.3522219 }
    };

    //this.map = new google.maps.Map( document.getElementById( 'map' ), this.mapOptions );

    this.emitter.emit( 'map:ready' );
  }

  plotRoute( route ){
    this.routePoly = new google.maps.Polyline({
      path: route,
      geodesic: true,
      strokeColor: '#fac018',
      strokeOpacity: 0.9,
      strokeWeight: 3
    } );

    this.routePoly.setMap( this.map );
    this.fitBoundsToRoute();
  }

  fitBoundsToMarkers(){
    if( this.groupMarkers.length < 1 ){ return; }

    this.bounds = new google.maps.LatLngBounds();
    this.groupMarkers.forEach( ( marker )=>{
      this.bounds.extend( marker.getPosition() );
    } );

    this.map.fitBounds( this.bounds );
  }

  fitBoundsToRoute(){
    if( !this.routePoly ){ return; }

    this.bounds = new google.maps.LatLngBounds();
    this.routePoly.getPath().forEach( (e)=>{
      this.bounds.extend( e );
    } );

    this.map.fitBounds( this.bounds );
  }

  getIcon( type, climb_cat ){
    const iconBaseUrl = '/map';
    const iconExt = 'png';
    const markerOptions = {
      group: {
        size: new google.maps.Size( 78, 98 ),
        origin: new google.maps.Point( 0, 0 ),
        anchor: new google.maps.Point( 15, 37 ),
        scaledSize: new google.maps.Size( 78/2.5, 98/2.5 )
      },
      interest: {
        size: new google.maps.Size( 40, 40 ),
        origin: new google.maps.Point( 0, 0 ),
        anchor: new google.maps.Point( 0, 4 ),
        scaledSize: new google.maps.Size( 15, 15 )
      }
    };

    let icon = {};

    if( [ 'group', 'group-peloton', 'group-straggler', 'start', 'finish' ].indexOf( type ) !== -1 ){
      icon = markerOptions.group;
    }
    else {
      icon = markerOptions.interest;
    }

    icon.url = `${iconBaseUrl}/${ ( type === 'climb' ) ? `cat${climb_cat}` : type }.${iconExt}`;
    return icon;
  }

  plotMarker( opts ){
    let markerOpts = {
      position: opts.latlng,
      map: this.map,
      identifier: opts.identifier,
      content: ( opts.content ) ? opts.content : false,
      type: opts.type,
      icon: this.getIcon( opts.type, opts.climb_cat )
    }

    // if( opts.content && opts.content.size ) {
    //   markerOpts.label = opts.content.size.toString();
    // }

    return new google.maps.Marker( markerOpts );
  }

  setIcon( marker, type ){
    marker.setIcon( this.getIcon( type ) );
  }
}