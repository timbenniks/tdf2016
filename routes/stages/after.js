var config = require( '../../data/config' ),
    twitter = require( '../../modules/twitter' ),
    getAppState = require( '../../modules/state' ),
    getStageInfo = require( '../../modules/stageInfo' ),
    getRank = require( '../../modules/rank' ),
    getJerseys = require( '../../modules/jerseys' ),
    getAfterNews = require( '../../modules/afterNews' ),
    getAfterRank = require( '../../modules/afterRank' ),
    getAfterPhotos = require( '../../modules/afterPhotos' ),
    getTomorrow = require( '../../modules/tomorrow' ),

    TwitterHandler = new twitter();

module.exports = function( res, params ){
  var promises = [];

  getAppState().then( ( state )=>{

    if( params.stage ){
      state.stage = params.stage;
    }

    promises.push( getStageInfo( state ) );
    promises.push( getRank( state ) );
    promises.push( getJerseys( state ) );
    promises.push( getAfterNews( state ) );
    promises.push( getAfterRank( state ) );
    promises.push( getAfterPhotos( state ) );
    promises.push( getTomorrow( state ) );
    
    Promise.all( promises ).then( ( data )=>{
      var tmplData = {
        title: config.title,
        info: data[ 0 ],
        rank: data[ 1 ],
        jerseys: data[ 2 ],
        afternews: data[ 3 ],
        afterrank: data[ 4 ],
        afterphotos: data[ 5 ],
        tomorrow: data[ 6 ]
      }

      res.render( 'after', tmplData );
    } )
    .catch( ( error )=>{
      res.render( 'error', { message: JSON.stringify( error ), error: error } );
    } );
  } );
};