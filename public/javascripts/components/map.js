import GoogleMapsLoader from 'google-maps';
import request from 'superagent';
import 'babel-polyfill';

export default class Maps {
  constructor( app ){
    GoogleMapsLoader.KEY = 'AIzaSyBom_Va46C1Qh66p6d4e9QWd8J7U6oMElM';
    this.mapOptions = {
      zoom: 8,
      styles: [{"featureType":"water","stylers":[{"color":"#dddddd"},{"visibility":"on"}]},{"featureType":"landscape","stylers":[{"color":"#f2f2f2"}]},{"featureType":"road","stylers":[{"saturation":-100},{"lightness":45}]},{"featureType":"road.highway","stylers":[{"visibility":"simplified"}]},{"featureType":"road.arterial","elementType":"labels.icon","stylers":[{"visibility":"off"}]},{"featureType":"administrative","elementType":"labels.text.fill","stylers":[{"color":"#444444"}]},{"featureType":"transit","stylers":[{"visibility":"off"}]},{"featureType":"poi","stylers":[{"visibility":"off"}]}],
      panControl: false,
      zoomControl: false,
      mapTypeControl: false,
      scaleControl: false,
      streetViewControl: false,
      overviewMapControl: false,
      scrollwheel: false
    };

    this.routePoly = false;
    this.markers = [];

    GoogleMapsLoader.load( ( google )=> {
      google.maps.event.addDomListener( window, 'load', this.initializeMap.bind( this ) );
      google.maps.event.addDomListener( window, 'resize', this.fitBounds.bind( this ) );
    } );
  }

  initializeMap(){
    this.mapOptions.mapTypeId = google.maps.MapTypeId.ROADMAP;
    this.mapOptions.zoomControlOptions = { style: google.maps.ZoomControlStyle.SMALL };
    this.mapOptions.center = { lat: 48.8566140, lng: 2.3522219 };
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

      getRiderForBib = ( riders, bib )=>{
        return riders.find( r => r.Id === bib );
      };

      this.groups.Groups.forEach( ( group )=>{
        mappedGroups.push({
          name: group.GroupName,
          slope: group.Slope,
          avgSpeed: group.GroupAverageSpeed,
          speed: group.GroupSpeed,
          distFromStart: group.GroupDistanceFromStart,
          distToFInish: group.GroupDistanceToFinish,
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
              firstName: getRiderForBib( this.riders, rider.Bib ).FirstName, 
              lastName: getRiderForBib( this.riders, rider.Bib ).LastName,
              team: {
                name: getRiderForBib( this.riders, rider.Bib ).TeamName,
                code: getRiderForBib( this.riders, rider.Bib ).TeamCode
              },
              nationality: getRiderForBib( this.riders, rider.Bib ).Nationality,
              countryCode: getRiderForBib( this.riders, rider.Bib ).CountryCode,
              photo: getRiderForBib( this.riders, rider.Bib ).PhotoUri,
              classification: {
                general: getRiderForBib( this.riders, rider.Bib ).GeneralClassification,
                sprint: getRiderForBib( this.riders, rider.Bib ).SprintClassification
              }
            }
          } )
        } );
      } );

      resolve( mappedGroups );
    } );
  }

  placeGroups( groups ){
    console.log( groups );
    groups.forEach( ( group )=>{
      this.plotMarker( { lat: group.lat, lng: group.lng }, group.name, group );
    } );

  }

  plotRouteOnMap( data ){
    return new Promise( ( resolve, reject )=>{
      this.routePoly = new google.maps.Polyline({
        path: data,
        geodesic: true,
        strokeColor: '#fac018',
        strokeOpacity: 1.0,
        strokeWeight: 4
      });

      this.routePoly.setMap( this.map );
      this.fitBounds();

      this.start = data[ 0 ];
      this.finish = data[ data.length - 1 ];

      resolve();
    } );
  }

  fitBounds(){
    if( !this.routePoly ){
      return;
    }

    this.bounds = new google.maps.LatLngBounds();
    this.routePoly.getPath().forEach( (e)=>{
      this.bounds.extend( e );
    } );
    this.map.fitBounds( this.bounds );
  }

  plotStartMarker(){
    this.plotMarker( { lat: this.start.lat, lng: this.start.lng }, 'start', {
      icon: {
        url: '/map/start.svg',
        size: new google.maps.Size( 40, 50 ),
        origin: new google.maps.Point( 0, 0 ),
        anchor: new google.maps.Point( 13, 32 ),
        scaledSize: new google.maps.Size( 40, 50 )
    }
    } );
  }
  
  plotFinishMarker(){
    this.plotMarker( { lat: this.finish.lat, lng: this.finish.lng }, 'finish', {
      icon: {
        url: '/map/finish.svg',
        size: new google.maps.Size( 40, 50 ),
        origin: new google.maps.Point( 0, 0 ),
        anchor: new google.maps.Point( 13, 32 ),
        scaledSize: new google.maps.Size( 40, 50 )
      }
    } );
  }

  plotMarker( latlng, identifier, data ){
    // add icon, shape etc
    let markerOpts = {
      position: latlng,
      map: this.map
    }

    if( data.icon ){
      markerOpts.icon = data.icon;
    }

    this.markers[ identifier ] = new google.maps.Marker( markerOpts );
  }
}