var config = require( '../../data/config' ),
    getAppState = require( '../../modules/state' ),
    getStageInfo = require( '../../modules/stageInfo' ),
    getStartTime = require( '../../modules/startTime' ),
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

    promises.push( getStageInfo( state ) );
    promises.push( getStartTime( state ) );
    
    Promise.all( promises ).then( ( data )=>{
      var tmplData = {
        title: config.title,
        info: data[ 0 ],
      },
      starts = data[ 1 ];

      startDateTime = new Date();
      // heroku server time fix
      startDateTime.setHours( starts.split( ':' )[ 0 ] - 2, starts.split( ':' )[ 1 ], 0, 0 );
      tmplData.starts = moment( startDateTime ).fromNow();
      tmplData.startTime = starts;

      res.render( 'before', tmplData );
    } )
    .catch( ( error )=>{
      res.render( 'error', { message: JSON.stringify( error ), error: error } );
    } );
  } );
};