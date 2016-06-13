var getRank = require( './rank' );

module.exports = function( state ){
      
  return new Promise( ( resolve, reject )=>{
    getRank( state )
      .then( ( rank )=>{
        resolve({
          green: rank.sprinters[ 0 ],
          yellow: rank.individual[ 0 ],
          polka_dot: rank.climbers[ 0 ],
          white: rank.white[ 0 ]
        } );
      } )
      .catch( ( error )=>{
        reject( error );
      } );
  } );
};