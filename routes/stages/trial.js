var config = require( '../../data/config' ),
    getAppState = require( '../../modules/state' ),
    getStageInfo = require( '../../modules/stageInfo' ),
    getLiveNews = require( '../../modules/liveNews' ),
    getDimensionDataTrial = require( '../../modules/dimensionDataTrial' ),
    getDimensionDataRiders = require( '../../modules/dimensionDataRiders' ),
    streamLiveNews = require( '../../modules/streamLiveNews' );
    
module.exports = function( res, params ){
  var promises = [];

  getAppState().then( ( state )=>{
    
    promises.push( getStageInfo( state ) );
    promises.push( getLiveNews( state ) );
    promises.push( getDimensionDataTrial() );
    promises.push( getDimensionDataRiders() );

    Promise.all( promises ).then( ( data )=>{
      var tmplData = {
        title: config.title,
        info: data[ 0 ],
        news: data[ 1 ],
        trial: data[ 2 ],
        livenews: true
      }

      tmplData.riders = data[ 3 ].map( ( rider )=>{
        return {
          id: rider.Id,
          name: rider.FirstName + ' ' + rider.LastName, 
          lastName: rider.LastName, 
          team: rider.TeamName,
          teamCode: rider.TeamCode,
          countryCode: rider.CountryCode.toLowerCase(),
          photo: rider.PhotoUri.replace( 'http://', '//' ),
          withdrawn: rider.IsWithdrawn,
          classificationGeneral: ( rider.GeneralClassification ) ? rider.GeneralClassification : false,
          classfication:{
            yellow: rider.GeneralClassificationRank,
            green: rider.SprintClassificationRank,
            white: rider.YouthClassificationRank,
            polka_dot: rider.MountainClassificationRank
          }
        }
      } );

      setInterval( ()=>{
        streamLiveNews( res.pubSub );              
      }, 20000 );

      res.render( 'trial', tmplData );
    } )
    .catch( ( error )=>{
      res.render( 'error', { message: JSON.stringify( error ), error: error } );
    } );

  } );
};