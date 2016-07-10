var call = require( './call' ),
    config = require( '../data/config.js' ),
    findApplicableStage = require( './findApplicableStage' ),
    getStageInfo = require( './stageInfo' );

module.exports = function( state ){
  var stage = state.stage,
      route = state.route;
      
  return new Promise( ( resolve, reject )=>{
    findApplicableStage( stage, route, 'tomorrow' ).then( ( applicableStage )=>{
      
      if( !applicableStage ){
        resolve({
          error: 'There is no tomorrow'
        } );
      }
      else {

        // if( applicableStage === '00R1' || applicableStage === '00R2' ){
        //   resolve({
        //     error: 'Tomorrow is a rest day'
        //   } )
        // }
        
        var stageForImage = ( applicableStage.charAt( 0 ) === '0' ) ? applicableStage.substring( 1 ) : applicableStage;

        var stageImg = `${config.alternativePhotosUrl.replace( '$$year$$', config.year )}/${stageForImage}/CARTE.jpg`,
            stageProfile = `${config.alternativePhotosUrl.replace( '$$year$$', config.year )}/${stageForImage}/PROFIL.jpg`;

        state.stage = applicableStage;

        getStageInfo( state ).then( ( stageInfoForTomorrow )=>{  
          stageInfoForTomorrow.route = stageImg;
          stageInfoForTomorrow.profile = stageProfile;
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