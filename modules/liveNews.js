var call = require( './call' ),
    config = require( '../data/config.js' );

module.exports = function( state ){
  var stage = state.stage,

  pad = function( num, size ){
    if( num.toString().length >= size ){
      return num;
    }

    return ( Math.pow( 10, size ) + Math.floor(num) ).toString().substring( 1 );
  },

  toReadableTime = function( time ){
    var h = Math.floor( time / 3600 ),
        m = Math.floor( ( time - 3600 * h ) / 60 );

    return h + ':' + pad( m, 2 );
  },

  toStatus = function( status ) {
    var st;

    switch( status ){
      case 0: st = ''; break;
      case 1: st = 'accident'; break;
      case 2: st = 'crevaison'; break;
      case 3: st = 'point-echappee'; break;
      case 4: st = 'chute'; break;
      case 5: st = ''; break;
      case 6: st = ''; break;
      case 7: st = 'classement-par-equipe'; break;
      case 8: st = 'in-between-sprint'; break;
      case 9: st = 'moyenne-speed'; break;
      case 10: st = 'sommet'; break;
      case 11: st = 'sommet'; break;
      case 12: st = 'sommet'; break;
      case 13: st = 'sommet'; break;
      case 14: st = 'sommet'; break;
      case 15: st = 'attack'; break;
      case 16: st = ''; break;
      case 17: st = 'point-sur-le-peleton'; break;
      case 18: st = 'arret-mecanique'; break;
      case 19: st = 'point-speed'; break;
      case 20: st = 'point-sur-un-ecart'; break;
      case 21: st = 'point-sur-les-derniers-kilometres'; break;
      case 22: st = 'point-sur-lhomme-de-tete'; break;
      case 23: st = 'point-sur-les-hommes-de-tete'; break;
      case 24: st = 'point-sur-les-hommes-de-tete'; break;
      case 25: st = 'ascension'; break;
      case 26: st = 'abandon'; break;
      case 27: st = ''; break;
      case 28: st = ''; break;
      case 29: st = ''; break;
      case 30: st = ''; break;
      case 31: st = 'top-5'; break;
      case 32: st = 'victoire'; break;
      case 33: st = 'prix-antargaz-de-la-combativite'; break;
      case 34: st = 'sous-la-flamme-rouge'; break;
      case 35: st = 'maillot-a-pois'; break;
      case 36: st = 'maillot-vert'; break;
      case 37: st = 'maillot-blanc'; break;
      case 38: st = 'maillot-jaune'; break;
      case 39: st = 'prix-de-la-combativite'; break;
      case 40: st = 'depart'; break;
      case 41: st = 'lu-dans-la-presse'; break;
      case 42: st = 'interview'; break;
      case 43: st = 'diverse-stats'; break;
      case 44: st = 'point-historique'; break;
      case 45: st = 'anniversaire'; break;
      case 46: st = 'changement-de-velo'; break;
      case 47: st = ''; break;
      case 48: st = ''; break;
    }

    return st;
  };

  return new Promise( ( resolve, reject )=>{
    call( `${config.baseUrl}/livenews${stage}_en.json`, 'live news' )
      .then( ( liveNews )=>{
        var news = liveNews.d.map( ( newsItem )=>{
          return {
            title: newsItem.t,
            desc: newsItem.b,
            id: newsItem.s,
            time: toReadableTime( newsItem.s ),
            status: toStatus( newsItem.e )
          }
        } );

        resolve( news.reverse() );
      } )
      .catch( ( error )=>{
        // resolve as no news when an error occurs
        resolve( [] );
        console.log( error );
      } );
  } );
};