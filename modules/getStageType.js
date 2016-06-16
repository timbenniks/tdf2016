module.exports = function( id ){
  var type;

  switch( id ){
    case 'PAS': type = 'prologue'; break;
    case 'EQU': type = 'time trial'; break;
    case 'REP': type = 'rest day'; break;

    case 'LGN': type = 'flat stage'; break;
    case 'HMG': type = 'mountaing race'; break;
    case 'MMG': type = 'hilly stage'; break;

    default:
      type = 'regular stage';
  }

  return type;
};