var config = require( '../../data/config' ),
    twitter = require( '../../modules/twitter' ),
    getAppState = require( '../../modules/state' ),
    getStageInfo = require( '../../modules/stageInfo' ),
    getProgress = require( '../../modules/progress' ),
    getRank = require( '../../modules/rank' ),
    getJerseys = require( '../../modules/jerseys' ),
    getLiveNews = require( '../../modules/liveNews' ),
    setupTweetStream = require( '../../modules/setupTweetStream' ),
    streamProgress = require( '../../modules/streamProgress' ),
    streamLiveNews = require( '../../modules/streamLiveNews' ),

    beforeTour = require( './beforeTour' ),
    rest = require( './rest' ),

    TwitterHandler = new twitter();

module.exports = function( res ){
  var promises = [];

  getAppState().then( ( state )=>{
    
    if( state.stage === '00R1' || state.stage === '00R2' ){
      rest( res );
      return false;
    }

    promises.push( TwitterHandler.get( 'statuses/user_timeline', { screen_name: 'letour', count: 10, trim_user: true, exclude_replies: true } ) )
    promises.push( getStageInfo( state ) );
    promises.push( getProgress( state ) );
    promises.push( getRank( state ) );
    promises.push( getJerseys( state, false ) );
    promises.push( getLiveNews( state ) );

    Promise.all( promises ).then( ( data )=>{
      var tmplData = {
        title: config.title,
        tweets: data[ 0 ],
        info: data[ 1 ],
        progress: data[ 2 ],
        rank: data[ 3 ],
        jerseys: data[ 4 ],
        news: data[ 5 ],
        livenews: config.useLiveNewsInsteadOfTwitter
      }

      tmplData.noprogress = ( tmplData.info.type === 'prologue' || tmplData.info.type === 'time trial' ) || !tmplData.progress.stage;

      if( !tmplData.progress.stage && !tmplData.rank.individual && !tmplData.jerseys.yellow ){
        beforeTour( res );
      }
      else {
        
        if( !config.useLiveNewsInsteadOfTwitter ){
          setupTweetStream( res.io, { follow: 153403071,  with: 'user' } );
        }

        if( !tmplData.noprogress ){
          setInterval( ()=>{
            streamProgress( res.io, tmplData.info );

            if( config.useLiveNewsInsteadOfTwitter ){
              streamLiveNews( res.io );              
            }
          }, 2000 );
        }

        res.render( 'during', tmplData );
      }
    } )
    .catch( ( error )=>{
      res.render( 'error', { message: JSON.stringify( error ), error: error } );
    } );

  } );
};