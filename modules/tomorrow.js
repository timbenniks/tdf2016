var call = require( './call' ),
    config = require( '../data/config.js' ),
    findApplicableStage = require( './findApplicableStage' ),
    getStageInfo = require( './stageInfo' );

module.exports = function( state ){
  var stage = state.stage,
      route = state.route,
      useTomorrow = true;

  return new Promise( ( resolve, reject )=>{
    findApplicableStage( stage, route, useTomorrow ).then( ( applicableStage )=>{
      
      if( !applicableStage ){
        resolve({
          error: 'There is no tomorrow'
        })
      }
      else {
        
        var stageImg = `${config.alternativePhotosUrl}/${applicableStage}/CARTE.jpg`;

        state.stage = applicableStage;

        getStageInfo( state ).then( ( stageInfoForTomorrow )=>{  
          stageInfoForTomorrow.route = stageImg;
          resolve( stageInfoForTomorrow );
        } )
        .catch( ( error )=>{
          reject( error ); 
        } );
      }

    } )
    .catch( ( error )=>{
      reject( error );
    } );
  } );
};