var moment = require( 'moment' ),
    call = require( './call' );

module.exports = function( availStage, route ){

  var findWorkableStage = ( stages, availStage )=>{
    if( stages[ availStage ].type !== 'REP' ){
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

    var result = ''; 
    for( var i = 0; i < workableStages.length; i++ ){
      if( workableStages[ i ].id.toString() === availStage ){
        result = workableStages[ i - 1 ].id;
      }
    }

    return result;
  };

  return new Promise( ( resolve, reject )=>{
    call( `http://www.letour.fr/useradgents/2015/json/route.${route}.json`, 'applicable stage' )
      .then( ( stages )=>{
        var stage = findWorkableStage( stages, availStage );
        resolve( stage );
      } )
      .catch( ( error )=>{
        reject( error );
      } );
  } );
};