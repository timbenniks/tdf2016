import GoogleMapsLoader from 'google-maps';
import request from 'superagent';
//import MarkerClusterer from '../vendor/markerclusterer';
import mapWindowTmpl from '../../../views/includes/map-window.jade';
import moment from 'moment';

import 'babel-polyfill';
import 'moment-duration-format';

export default class Maps {
  constructor( app ){
    this.emitter = app.emitter;
    this.routePoly = false;
    this.markers = [];
    this.allGroups = [];
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

    this.emitter.on( 'marker:clicked', ( marker )=>{
      this.onMarkerClick( marker );
    });
    
    this.emitter.on( 'markers:update', ( data )=>{
      // clear markers, add new markers
    });

    this.closeBtn.addEventListener( 'click', ()=>{
      this.closeWindow().then( ()=>{
        this.fitBoundsToMarkers();
      } ); 
    }, false );
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

    this.map = new google.maps.Map( document.getElementById( 'map' ), this.mapOptions );
    this.getRouteData()
      .then( this.plotRouteOnMap.bind( this ) )
      .then( ()=>{
        this.plotStartMarker();
        this.plotFinishMarker();
        this.getGroups()
          .then( this.mapGroupData.bind( this ) )
          .then( this.placeGroups.bind( this ) );
      } );
  }

  getRouteData(){
    return new Promise( ( resolve, reject )=>{
      request
        .get( `/map/route` )
        .accept( 'application/json' )
        .end( ( err, res )=>{
          if( err ){
            reject( err );
          }

          resolve( res.body );
        } );
    } );
  }

  getGroups(){
    return new Promise( ( resolve, reject )=>{
      request
        .get( `/map/groups` )
        .accept( 'application/json' )
        .end( ( err, res )=>{
          if( err ){
            reject( err );
          }

          resolve( res.body );
        } );
    } );
  }

  mapGroupData( groupData ){
    return new Promise( ( resolve, reject )=>{
      this.riders = groupData.riders;
      this.groups = groupData.groups;
      let mappedGroups = [],

      getRiderForBib = ( bib )=>{
        return this.riders.find( r => r.Id === bib );
      },

      capitalize = function( str ){
        var s = str.toLowerCase(); 
        return s.charAt( 0 ).toUpperCase() + s.slice( 1 );
      };

      this.groups.Groups.forEach( ( group )=>{
        mappedGroups.push({
          name: group.GroupName,
          key: group.GroupNameKey,
          slope: group.Slope,
          avgSpeed: group.GroupAverageSpeed.toFixed( 1 ),
          speed: group.GroupSpeed.toFixed( 1 ),
          distFromStart: group.GroupDistanceFromStart.toFixed( 1 ),
          distToFinish: group.GroupDistanceToFinish.toFixed( 1 ),
          gapPrevGroupDist: ( group.GapPreviousGroupD ) ? group.GapPreviousGroupD.toFixed( 1 ) : false,
          gapNextGroupDist: ( group.GapFromNextGroupD ) ? group.GapFromNextGroupD .toFixed( 1 ): false,
          gapLeadingGroupTime: ( group.GapToLeadingGroupT ) ? moment.duration( group.GapToLeadingGroupT, 'seconds' ).format( 'mm:ss', { trim: false } ) : false,
          gapNextGroupTime: ( group.GapToPreviousGroupT ) ? moment.duration( group.GapToPreviousGroupT, 'seconds' ).format( 'mm:ss', { trim: false } ) : false,
          id: group.GroupId,
          lat: group.GroupLatitude,
          lng: group.GroupLongitude,
          size: group.GroupSize,
          jerseys: {
            yellow: group.HasGeneralClassificationJersey,
            polka_dot: group.HasMountainJersey,
            green: group.HasSprintJersey,
            white: group.HasYouthJersey
          },
          riders: group.Riders.map( ( rider )=>{
            return {
              speed: ( rider.CurrentSpeed ) ? rider.CurrentSpeed : false,
              bib: rider.Bib,
              posInGroup: ( rider.PositionInTheGroup ) ? rider.PositionInTheGroup : false,
              firstName: getRiderForBib( rider.Bib ).FirstName, 
              lastName: capitalize( getRiderForBib( rider.Bib ).LastName ),
              team: {
                name: getRiderForBib( rider.Bib ).TeamName,
                code: getRiderForBib( rider.Bib ).TeamCode
              },
              nationality: getRiderForBib( rider.Bib ).Nationality,
              countryCode: getRiderForBib( rider.Bib ).CountryCode,
              photo: getRiderForBib( rider.Bib ).PhotoUri,
              classification: {
                general: getRiderForBib( rider.Bib ).GeneralClassification,
                sprint: getRiderForBib( rider.Bib ).SprintClassification
              }
            }
          } )
        } );
      } );

      this.allGroups = mappedGroups;

      resolve( mappedGroups );
    } );
  }

  placeGroups( groups ){
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

    // if( this.cluster ){
    //   this.cluserMarkerStyle = {
    //     url: '/map/m1.png',
    //     width: 78/2.5,
    //     height: 98/2.5,
    //     lineHeight: 30,
    //     anchor: [ 0, 0 ],
    //     textColor: "#fff",
    //     textSize: 10,
    //     backgroundSize: `${78/2.5}px ${98/2.5}px`
    //   }

    //   this.cluserOptions = {
    //     imagePath: '/map/m',
    //     gridSize: 8,
    //     maxZoom: 15,
    //     zoomOnClick: true,
    //     averageCenter: true,
    //     minimumClusterSize: 2,
    //     styles: [ this.cluserMarkerStyle, this.cluserMarkerStyle, this.cluserMarkerStyle ]
    //   }

    //   this.clusterer = new MarkerClusterer( this.map, this.markers, this.cluserOptions );
    // }
  }

  plotRouteOnMap( data ){
    return new Promise( ( resolve, reject )=>{
      this.routePoly = new google.maps.Polyline({
        path: data,
        geodesic: true,
        strokeColor: '#fac018',
        strokeOpacity: 1.0,
        strokeWeight: 4
      } );

      this.routePoly.setMap( this.map );
      this.fitBoundsToRoute();

      this.start = data[ 0 ];
      this.finish = data[ data.length - 1 ];

      resolve();
    } );
  }

  fitBoundsToMarkers(){
    if( this.markers.length < 1 ){
      return;
    }

    let markersToFitBoundsTo = this.markers.filter( marker => marker.type === 'group' );

    this.bounds = new google.maps.LatLngBounds();
    markersToFitBoundsTo.forEach( ( marker )=>{
      this.bounds.extend( marker.getPosition() );
    } );

    this.map.fitBounds( this.bounds );
  }

  fitBoundsToRoute(){
    if( !this.routePoly ){
      return;
    }

    this.bounds = new google.maps.LatLngBounds();
    this.routePoly.getPath().forEach( (e)=>{
      this.bounds.extend( e );
    } );

    this.map.fitBounds( this.bounds );
  }

  defaultIconState(){
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

  plotStartMarker(){
    this.plotMarker({
      latlng: { lat: this.start.lat, lng: this.start.lng },
      identifier: 'start',
      icon: '/map/start.png',
      type: 'start'
    } );
  }
  
  plotFinishMarker(){
    this.plotMarker({
      latlng: { lat: this.finish.lat, lng: this.finish.lng },
      identifier: 'finish',
      icon: '/map/finish.png',
      type: 'finish'
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

    if( opts.icon ){
      markerOpts.icon = {
        url: opts.icon,
        size: this.markerOptions.size,
        origin: this.markerOptions.origin,
        anchor: this.markerOptions.anchor,
        scaledSize: this.markerOptions.scaledSize
      }
    }

    let marker = new google.maps.Marker( markerOpts );
    marker.addListener( 'click', ()=>{
      this.emitter.emit( 'marker:clicked', marker );
    } );
    
    this.markers.push( marker );
  }

  onMarkerClick( marker ){
    if( marker.type === 'start' || marker.type === 'finish' ){ return; }

    this.fitBoundsToMarkers();
    //this.map.setCenter( marker.getPosition() );
    
    this.closeWindow().then( ()=>{
      this.setIcon( marker, '/map/selected.png' );
      this.openWindow( mapWindowTmpl( { group: marker.content } ) );  
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

  closeWindow(){
    return new Promise( ( resolve, reject )=>{
      this.mapWindowHolder.classList.remove( 'active' );
      this.mapWindow = document.querySelector( '.map-window' );
      this.defaultIconState();

      if( this.mapWindow ){
        this.mapWindowHolder.removeChild( document.querySelector( '.map-window' ) );
      }
      resolve();
    } );
  }
  
  openWindow( html ){
    this.mapWindowHolder.insertAdjacentHTML( 'beforeend', html );
    this.mapWindowHolder.classList.add( 'active' );
  }
}