var moment = require( 'moment' ),
    call = require( './call' ),
    config = require( '../data/config.js' );

module.exports = function( availStage, route, yesterdayOrTomorrow ){
  
  var dynamicSort = ( property )=>{
    var sortOrder = 1;
    if( property[ 0 ] === '-' ){
      sortOrder = -1;
      property = property.substr( 1 );
    }

    return ( a, b )=>{
      var result = ( a[ property ] < b[ property ]) ? -1 : ( a[ property] > b[ property ]) ? 1 : 0;
      return result * sortOrder;
    }
  },

  findWorkableStage = ( stages, availStage, when )=>{
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
        finish: stages[ stage ].finish,
        dayIndex: stages[ stage ].dayIndex
      } );
    }

    workableStages.sort( dynamicSort( 'dayIndex' ) );

    var result = false;

    for( var i = 0; i < workableStages.length; i++ ){
      if( workableStages[ i ].id.toString() === availStage ){
        
        if( when === 'tomorrow' ){
          if( availStage !== '2100' ){
            result = workableStages[ i + 1 ].id
          }

          if( result === '00R1' || result === '00R2' ){
            result = workableStages[ i + 2 ].id 
          }
        }
        else if( when === 'yesterday' ){
          if( availStage !== '0100' ){
            result = workableStages[ i - 1 ].id 
          }

          if( result === '00R1' || result === '00R2' ){
            result = workableStages[ i - 2 ].id 
          }
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