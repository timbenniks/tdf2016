var moment = require( 'moment' ),
    call = require( './call' ),
    config = require( '../data/config.js' );

module.exports = function( state ){
  var starters = state.starters;

  const getTeamForRider = ( teams, rider )=>{
   
    var result;

    teams.forEach( ( team )=>{
      team.r.forEach( ( riderInTeam )=>{
        if( riderInTeam === rider ){
          result = team.d;
        }
      } );
    } );

    return result;
  }

  return new Promise( ( resolve, reject )=>{
    call( `${config.baseUrl}/starters.${starters}.json`, 'riders' )
      .then( ( data )=>{

        var riders = data.r.map( ( rider )=>{
          return {
            name: rider.s,
            lastName: rider.l,
            lang: rider.c.toLowerCase(),
            no: rider.n,
            team: getTeamForRider( data.t, rider.n )
          }
        } );

        resolve( riders );
      } )
      .catch( ( error )=>{
        reject( error );
      } );
  } );
};