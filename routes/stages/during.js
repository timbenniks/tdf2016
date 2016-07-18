var config = require( '../../data/config' ),
    twitter = require( '../../modules/twitter' ),
    getAppState = require( '../../modules/state' ),
    getStageInfo = require( '../../modules/stageInfo' ),
    getProgress = require( '../../modules/progress' ),
    getRank = require( '../../modules/rank' ),
    getJerseys = require( '../../modules/jerseys' ),
    getLiveNews = require( '../../modules/liveNews' ),
    streamProgress = require( '../../modules/streamProgress' ),
    streamLiveNews = require( '../../modules/streamLiveNews' ),
    beforeTour = require( './beforeTour' ),

    TwitterHandler = new twitter();

module.exports = function( res, params ){
  var promises = [],
      streamStarted = false,
      pubSub = res.pubSub;

  if( params.stream && params.stream === 'twitter' ){
    config.useLiveNewsInsteadOfTwitter = false;
  }
  else if( params.stream && params.stream === 'livenews' ){
    config.useLiveNewsInsteadOfTwitter = true;
  }

  if( params.twitter_id ){
    config.twitterAccountToFollow = params.twitter_id;
  }

  getAppState().then( ( state )=>{
    
    if( params.stage ){
      state.stage = params.stage;
    }

    promises.push( getStageInfo( state ) );
    promises.push( getProgress( state ) );
    promises.push( getRank( state ) );
    promises.push( getJerseys( state ) );
    promises.push( getLiveNews( state ) );

    Promise.all( promises ).then( ( data )=>{
      var tmplData = {
        title: config.title,
        info: data[ 0 ],
        progress: data[ 1 ],
        rank: data[ 2 ],
        jerseys: data[ 3 ],
        news: data[ 4 ],
        livenews: config.useLiveNewsInsteadOfTwitter
      }

      tmplData.noprogress = ( tmplData.info.type === 'prologue' || tmplData.info.type === 'time trial' ) || !tmplData.progress.stage;

      if( !tmplData.progress.stage && !tmplData.rank.individual && !tmplData.jerseys.yellow ){
        beforeTour( res );
      }
      else {
        
        if( !tmplData.noprogress ){
          setInterval( ()=>{
            streamProgress( res.pubSub, tmplData.info );

            if( config.useLiveNewsInsteadOfTwitter ){
              streamLiveNews( res.pubSub );              
            }
          }, 20000 );
        }

        res.render( 'during', tmplData );
      }
    } )
    .catch( ( error )=>{
      res.render( 'error', { message: JSON.stringify( error ), error: error } );
    } );

  } );
};