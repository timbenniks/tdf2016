var config = require( '../../data/config' ),
    twitter = require( '../../modules/twitter' ),
    getAppState = require( '../../modules/state' ),
    getStageInfo = require( '../../modules/stageInfo' ),
    getRank = require( '../../modules/rank' ),
    getJerseys = require( '../../modules/jerseys' ),
    setupTweetStream = require( '../../modules/setupTweetStream' ),

    TwitterHandler = new twitter();

module.exports = function( res ){
  var promises = [];

  getAppState().then( ( state )=>{
    promises.push( getStageInfo( state ) );
    promises.push( TwitterHandler.get( 'search/tweets', { q: '#tdf2016', result_type: 'popular' } ) );
    promises.push( getRank( state ) );
    promises.push( getJerseys( state ) );

    Promise.all( promises ).then( ( data )=>{
      var tmplData = {
        title: config.title,
        info: data[ 0 ],
        tweets: data[ 1 ],
        rank: data[ 2 ],
        jerseys: data[ 3 ]
      }

      setupTweetStream( res.io, { track: 'tdf2016', filter_level: 'none', language: 'en,fr,nl' } );

      res.render( 'rest', tmplData );
    } )
    .catch( ( error )=>{
      res.render( 'error', { message: JSON.stringify( error ), error: error } );
    } );
  } );
};