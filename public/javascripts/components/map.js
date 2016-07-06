import GoogleMapsLoader from 'google-maps';
import request from 'superagent';
import mapWindowGroupTmpl from '../../../views/includes/map-window-group.jade';
import mapWindowInterestTmpl from '../../../views/includes/map-window-interest.jade';
import moment from 'moment';

import 'babel-polyfill';
import 'moment-duration-format';

export default class Maps {
  constructor( app ){
    this.emitter = app.emitter;
    this.routePoly = false;
    this.markers = [];
    this.mapWindowHolder = document.getElementById( 'map-window-holder' );
    this.closeBtn = this.mapWindowHolder.querySelector( '.close-window' );
    this.cluster = false;

    this.bind();
  }

  bind(){
    GoogleMapsLoader.KEY = 'AIzaSyBom_Va46C1Qh66p6d4e9QWd8J7U6oMElM';
    GoogleMapsLoader.load( ( google )=> {
      google.maps.event.addDomListener( window, 'load', this.initializeMap.bind( this ) );
      google.maps.event.addDomListener( window, 'resize', this.fitBoundsToRoute.bind( this ) );
    } );

    this.emitter.on( 'marker:clicked', this.onMarkerClick.bind( this ) );
    this.closeBtn.addEventListener( 'click', this.onClosePanelClick.bind( this ) );
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

    this.markerOptions = {
      size: new google.maps.Size( 78, 98 ),
      origin: new google.maps.Point( 0, 0 ),
      anchor: new google.maps.Point( 15, 37 ),
      scaledSize: new google.maps.Size( 78/2.5, 98/2.5 )
    }

    this.markerOptionsInterest = {
      size: new google.maps.Size( 40, 40 ),
      origin: new google.maps.Point( 0, 0 ),
      anchor: new google.maps.Point( 0, 4 ),
      scaledSize: new google.maps.Size( 15, 15 )
    }

    this.map = new google.maps.Map( document.getElementById( 'map' ), this.mapOptions );
    
    // set it all in motion
    this.getRouteData().then( ( routeData )=>{
      this.plotRoute( routeData );
      this.plotPointsOfInterest();
      this.getGroups()
        .then( this.plotGroups.bind( this ) );
    } );
  }

  getRouteData(){
    return new Promise( ( resolve, reject )=>{
      request
        .get( `/map/route` )
        .accept( 'application/json' )
        .end( ( err, res )=>{
          if( err ){ reject( err ); }
          resolve( res.body );
        } );
    } );
  }

  plotRoute( data ){
    this.routePoly = new google.maps.Polyline({
      path: data.route,
      geodesic: true,
      strokeColor: '#fac018',
      strokeOpacity: 0.9,
      strokeWeight: 3
    } );

    this.routePoly.setMap( this.map );
    this.fitBoundsToRoute();

    this.pointsOfInterest = data.pointsOfInterest;
    this.start = data.route[ 0 ];
    this.finish = data.route[ data.route.length - 1 ];
  }

  plotPointsOfInterest(){
    // plot start marker
    this.plotMarker({
      latlng: { lat: this.start.lat, lng: this.start.lng },
      identifier: 'start',
      icon: '/map/start.png',
      type: 'start'
    } );
    
    // plot finish marker
    this.plotMarker({
      latlng: { lat: this.finish.lat, lng: this.finish.lng },
      identifier: 'finish',
      icon: '/map/finish.png',
      type: 'finish'
    } );

    this.pointsOfInterest.forEach( ( point )=>{
      if( point.tf === 0 ){ return; }

      this.plotMarker({
        latlng: { lat: point.lat, lng: point.lng },
        identifier: `${point.type}-${point.checkpoint_id}`,
        icon: ( point.type === 'sprint' ) ? '/map/sprint.png' : `/map/cat${point.climb_cat}.png`,
        type: 'interest'
      } );
    } );
  }

  getGroups(){
    return new Promise( ( resolve, reject )=>{
      request
        .get( `/map/groups` )
        .accept( 'application/json' )
        .end( ( err, res )=>{
          if( err ){ reject( err ); }
          resolve( res.body );
        } );
    } );
  }

  plotGroups( groups ){
    if( groups.length === 0 ){
      return;
    }

    groups.forEach( ( group )=>{
      let icon = '/map/group.png';

      if( group.key === 'Group_Back_of_the_Race' || group.key.indexOf( 'Straggler' ) !== -1 ){
        icon = '/map/grey.png';
      }

      if( group.key === 'Group_Peloton' ){
        icon = '/map/peloton.png';
      }

      this.plotMarker( {
        latlng: { lat: group.lat, lng: group.lng }, 
        identifier: group.name,
        icon: icon,
        content: group,
        type: 'group'
      } );
    } );
  }

  // utility functions
  fitBoundsToMarkers(){
    if( this.markers.length < 1 ){ return; }

    let markersToFitBoundsTo = this.markers.filter( marker => marker.type === 'group' );

    this.bounds = new google.maps.LatLngBounds();
    markersToFitBoundsTo.forEach( ( marker )=>{
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

  resetDefaultIconState(){
    this.markers.forEach( ( marker )=>{

      if( marker.type === 'group' ){
        this.setIcon( marker, '/map/group.png' );
      }

      if( marker.content && marker.content.key === 'Group_Peloton' ){
        this.setIcon( marker, '/map/peloton.png' );
      }

      if( marker.content && ( marker.content.key === 'Group_Back_of_the_Race' || marker.content.key.indexOf( 'Straggler' ) !== -1 ) ){
        this.setIcon( marker, '/map/grey.png' );
      }
    } );
  }

  plotMarker( opts ){
    let markerOpts = {
      position: opts.latlng,
      map: this.map,
      identifier: opts.identifier,
      content: ( opts.content ) ? opts.content : false,
      type: ( opts.type ) ? opts.type : false
    }

    if( opts.icon && ( opts.type === 'group' || opts.type === 'start' || opts.type === 'finish' ) ){
      markerOpts.icon = {
        url: opts.icon,
        size: this.markerOptions.size,
        origin: this.markerOptions.origin,
        anchor: this.markerOptions.anchor,
        scaledSize: this.markerOptions.scaledSize
      }
    }

    if( opts.icon && opts.type === 'interest' ){
      markerOpts.icon = {
        url: opts.icon,
        size: this.markerOptionsInterest.size,
        origin: this.markerOptionsInterest.origin,
        anchor: this.markerOptionsInterest.anchor,
        scaledSize: this.markerOptionsInterest.scaledSize
      }
    }

    let marker = new google.maps.Marker( markerOpts );
  
    if( marker.type !== 'start' || marker.type !== 'finish' ){ 
      marker.addListener( 'click', ()=>{
        this.emitter.emit( 'marker:clicked', marker );
      } );
    }    
    
    this.markers.push( marker );
  }

  onMarkerClick( marker ){
    if( marker.type === 'start' || marker.type === 'finish' ){ return; }
    
    this.closeWindow();
    this.map.setCenter( marker.getPosition() );
    this.map.setZoom( 16 );
  
    if( marker.type === 'interest' ){
      this.getCheckpoint( marker.identifier.split( '-' )[ 1 ] )
        .then( ( checkpointData )=>{
          if( checkpointData.alt > 0 ){
            this.openWindow( mapWindowInterestTmpl( { interest: checkpointData } ) );
          }
        } );
    }

    if( marker.type === 'group' ){
      this.setIcon( marker, '/map/selected.png' );
      this.openWindow( mapWindowGroupTmpl( { group: marker.content } ) );
    }
  }

  getCheckpoint( id ){
    return new Promise( ( resolve, reject )=>{
      request
        .get( `/map/checkpoint/${id}` )
        .accept( 'application/json' )
        .end( ( err, res )=>{
          if( err ){ reject( err ); }
          resolve( res.body );
        } );
    } );
  }

  setIcon( marker, icon ){
    marker.setIcon({
      url: icon,
      size: this.markerOptions.size,
      origin: this.markerOptions.origin,
      anchor: this.markerOptions.anchor,
      scaledSize: this.markerOptions.scaledSize
    } );
  }

  onClosePanelClick(){
    this.closeWindow();
    this.fitBoundsToMarkers();
  }

  closeWindow(){
    this.mapWindowHolder.classList.remove( 'active' );
    this.mapWindow = document.querySelector( '.map-window' );
    this.resetDefaultIconState();

    if( this.mapWindow ){
      this.mapWindowHolder.querySelector( '.map-window-content-wrapper' ).innerHTML = '';
    }
  }
  
  openWindow( html ){
    this.mapWindowHolder.querySelector( '.map-window-content-wrapper' ).innerHTML = html;
    this.mapWindowHolder.classList.add( 'active' );
  }
}