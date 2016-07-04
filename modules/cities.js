var call = require( './call' ),
    config = require( '../data/config.js' );

module.exports = function( state ){
      
  return new Promise( ( resolve, reject )=>{
    call( `${config.baseUrl}/cities_en.${state.cities}.json`, 'cities' )
      .then( ( cities )=>{
        var start = {
              desc: cities[ `${state.stage}D` ],
              img: `${config.citiesUrl.replace( '$$year$$', config.year )}/${state.stage}_DEP.jpg`
            },
            finish = {
              desc: cities[ `${state.stage}A` ],
              img: `${config.citiesUrl.replace( '$$year$$', config.year )}/${state.stage}_ARR.jpg`
            }
        
        resolve({
          start: start,
          finish: finish
        } );
      } )
      .catch( ( error )=>{
        reject( error ); 
      } );
  } );
};