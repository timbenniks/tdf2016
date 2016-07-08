import 'babel-polyfill';
import 'moment-duration-format';

import moment from 'moment';
import DataHandler from './mapData';
import PopupsHandler from './mapPopups';
import MapsHandler from './mapMaps';
import MapsNews from './mapNews';

import mapBannerTmpl from '../../../views/includes/map-banner.jade';

export default class Maps {
  constructor( app ){
    this.emitter = app.emitter;
    this.interestMarkers = [];
    this.groupMarkers = [];
    this.starts = document.querySelector( '[data-start]' ).dataset.start;
    this.startsAt = new Date().setHours( this.starts.split( ':' )[ 0 ], this.starts.split( ':' )[ 1 ], 0, 0 );

    this.dataHandler = new DataHandler( this );
    this.popupHandler = new PopupsHandler( this );
    this.mapHandler = new MapsHandler( this );
    this.newsHandler = new MapsNews( this );

    this.emitter.on( 'map:ready', ()=>{
      this.dataHandler.call( 'route' ).then( ( routeData )=>{
        this.mapHandler.plotRoute( routeData.route );
        this.plotPointsOfInterest( routeData.pointsOfInterest );
        this.renderInterestPopups( routeData.pointsOfInterest );
      } );

      if( new Date().getTime() > this.startsAt ){
        this.renderGroups();
      }
    } );

    this.mapHandler.loadMap();
  }

  renderGroups(){
    this.dataHandler.call( 'groups' ).then( ( groups )=>{
      if( groups.length > 0 ){
        this.plotGroups( groups );
        this.updateStats( groups[ 0 ] );
        this.renderGroupPopups();
      }

      //setTimeout( this.renderGroups.bind( this ), 10000 );
    } )
    .catch( ( error )=>{
      console.log( error );
      setTimeout( this.renderGroups.bind( this ), 10000 );
    } );
  }

  plotPointsOfInterest( pointsOfInterest ){
    pointsOfInterest.forEach( ( point )=>{
      let markerOpts = {
        latlng: { lat: point.lat, lng: point.lng },
        identifier: `${point.type}-${point.checkpoint_id}`,
        type: point.type,
        climb_cat: point.climb_cat
      }

      let marker = this.mapHandler.plotMarker( markerOpts );

      if( [ 'start', 'finish' ].indexOf( marker.type ) === -1 ){
        marker.addListener( 'click', ()=>{
          this.onMarkerClick( marker );
        } );
      }

      this.interestMarkers.push( marker );
    } );
  }

  plotGroups( groups ){
    if( this.groupMarkers.length ){
      this.groupMarkers.forEach( ( marker )=>{
        marker.setMap( null );
      } );

      this.groupMarkers = [];
    }

    groups.forEach( ( group )=>{
      let type = 'group';

      group.key = group.name.toLowerCase().replace( / /g, '_' );

      if( group.key === 'back_of_the_race' || group.key.indexOf( 'straggler' ) !== -1 ){
        type = 'group-straggler';
      }

      if( group.key === 'peloton' ){
        type = 'group-peloton';
      }

      let markerOpts = {
        latlng: { lat: group.lat, lng: group.lng },
        identifier: `${type}-${group.key}`,
        type: type,
        content: group
      }

      let marker = this.mapHandler.plotMarker( markerOpts );

      marker.addListener( 'click', ()=>{
        this.onMarkerClick( marker );
      } );
      
      this.groupMarkers.push( marker );
    } );
  }

  renderInterestPopups(){
    let markersToRenderFor = this.interestMarkers.filter( m => m.type !== 'start' && m.type !== 'finish' ),
        promises = [];
    
    markersToRenderFor.forEach( ( marker )=>{
      this.dataHandler.call( 'checkpoint', marker.identifier.split( '-' )[ 1 ] )
        .then( ( checkpointData )=>{
          this.popupHandler.renderInterest( checkpointData );
        } )
        .catch( ( error )=>{
          console.log( error );
        } );
    } );
  }

  renderGroupPopups(){
    this.popupHandler.cleanGroups();
    this.popupHandler.renderGroups( this.groupMarkers );
  }

  onMarkerClick( marker ){
    this.popupHandler.show( marker.identifier );
  }

  updateStats( data ){
    let banner = document.querySelector( '.map-banner' ),
        tmplData = {
          avgSpeed: data.avgSpeed || data.speed,
          toGo: data.distToFinish,
          steepness: data.slope
        },

        startTime = document.querySelector( '[ data-start ]' ).dataset.start,
        start = moment( new Date().setHours( startTime.split( ':' )[ 0 ], startTime.split( ':' )[ 1 ], 0, 0 ) ),
        now = moment(),
        diff = moment.duration( now.diff( start ) ).asMilliseconds(),
        riddenFor = moment.duration( diff, 'milliseconds' ).format( 'hh:mm:ss' );
    
    tmplData.riddenFor = riddenFor;
    banner.innerHTML = mapBannerTmpl( tmplData );
    banner.classList.add( 'active' );
  }
}