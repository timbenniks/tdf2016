var moment = require( 'moment' ),
    call = require( './call' ),
    config = require( '../data/config.js' );

module.exports = function( availStage, route, useTomorrow ){
  
  var findWorkableStage = ( stages, availStage, tomorrow )=>{
    if( stages[ availStage ].type !== 'REP' && !tomorrow ){
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
        if( tomorrow ){
          result = ( availStage !== '2100' ) ? workableStages[ i + 1 ].id : false;
        }
        else {
          result = ( availStage !== '0100' ) ? workableStages[ i - 1 ].id : false;
        }
      }
    }

    return result;
  };

  return new Promise( ( resolve, reject )=>{
    call( `${config.baseUrl}/route.${route}.json`, 'applicable stage' )
      .then( ( stages )=>{
        var tomorrow = !!useTomorrow,
            stage = findWorkableStage( stages, availStage, tomorrow );
        
        resolve( stage );
      } )
      .catch( ( error )=>{
        reject( error );
      } );
  } );
};