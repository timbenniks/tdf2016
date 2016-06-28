"use strict";

var config = require( '../data/config' ),
    express = require( 'express' ),
    router = express.Router();
    
router.get( '/', ( req, res, next )=>{
 res.render( 'about', { title: `About ${config.title}` } );
} );

module.exports = router;