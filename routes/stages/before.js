var config = require( '../../data/config' ),
    getAppState = require( '../../modules/state' ),
    getStageInfo = require( '../../modules/stageInfo' ),
    getStartTime = require( '../../modules/startTime' ),
    getRank = require( '../../modules/rank' ),
    getJerseys = require( '../../modules/jerseys' ),
    getCities = require( '../../modules/cities' ),
    moment = require( 'moment' );
    
module.exports = function( res, params ){
  var promises = [];

  getAppState().then( ( state )=>{

    if( params.stage ){
      state.stage = params.stage;
    }

    if( state.stage === '00R1' || state.stage === '00R2' ){
      rest( res, params );
      return false;
    }

    var stageForImage = ( state.stage.charAt( 0 ) === '0' ) ? state.stage.substring( 1 ) : state.stage;

    promises.push( getStageInfo( state ) );
    promises.push( getStartTime( state ) );
    promises.push( getRank( state ) );
    promises.push( getJerseys( state ) );
    promises.push( getCities( state ) );
    
    Promise.all( promises ).then( ( data )=>{
      var tmplData = {
        title: config.title,
        today: {
          route: `${config.alternativePhotosUrl.replace( '$$year$$', config.year )}/${stageForImage}/CARTE.jpg`,
          profile: `${config.alternativePhotosUrl.replace( '$$year$$', config.year )}/${stageForImage}/PROFIL.jpg`,
          cities: data[ 4 ]
        },
        info: data[ 0 ],
        rank: data[ 2 ],
        jerseys: data[ 3 ],
      },
      starts = data[ 1 ];

      startDateTime = new Date();
      startDateTime.setHours( starts.split( ':' )[ 0 ] - config.serverTimeOffset, starts.split( ':' )[ 1 ], 0, 0 );
      tmplData.starts = moment( startDateTime ).fromNow();
      tmplData.startTime = starts;

      res.render( 'before', tmplData );
    } )
    .catch( ( error )=>{
      res.render( 'error', { message: JSON.stringify( error ), error: error } );
    } );
  } );
};