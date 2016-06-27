var config = require( '../../data/config' ),
    twitter = require( '../../modules/twitter' ),
    getAppState = require( '../../modules/state' ),
    getStageInfo = require( '../../modules/stageInfo' ),
    getRank = require( '../../modules/rank' ),
    getJerseys = require( '../../modules/jerseys' ),

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

      res.render( 'rest', tmplData );
    } )
    .catch( ( error )=>{
      res.render( 'error', { message: JSON.stringify( error ), error: error } );
    } );
  } );
};