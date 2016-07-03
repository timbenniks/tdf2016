var moment = require( 'moment' ),
    call = require( './call' ),
    config = require( '../data/config.js' );

module.exports = function( availStage, route, yesterdayOrTomorrow ){
  
  var findWorkableStage = ( stages, availStage, when )=>{
    if( stages[ availStage ].type !== 'REP' && !when ){
      return availStage;
    }

    var workableStages = [];
    for( stage in stages ){
      workableStages.push({
        id: stage,
        distance: stages[ stage ].distance,
        type: stages[ stage ].type,
        date: stages[ stage ].date,
        start: stages[ stage ].start,
        finish: stages[ stage ].finish
      } );
    }

    var result = false; 
    for( var i = 0; i < workableStages.length; i++ ){
      if( workableStages[ i ].id.toString() === availStage ){
        if( when === 'tomorrow' ){
          result = ( availStage !== '2100' ) ? workableStages[ i + 1 ].id : false;
        }
        else if( when === 'yesterday' ){
          result = ( availStage !== '0100' ) ? workableStages[ i - 1 ].id : false;
        }
      }
    }

    return result;
  };

  return new Promise( ( resolve, reject )=>{
    var when = false;

    call( `${config.baseUrl}/route.${route}.json`, 'applicable stage' )
      .then( ( stages )=>{
        when = ( yesterdayOrTomorrow === 'tomorrow' ) ? 'tomorrow' : 'yesterday';
        stage = findWorkableStage( stages, availStage, when );
        
        resolve( stage );
      } )
      .catch( ( error )=>{
        reject( error );
      } );
  } );
};