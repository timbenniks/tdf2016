export default class Share {
  constructor( app ){
    this.bind();
  }

  bind(){
    this.btns = document.querySelectorAll( 'button.share' );

    for( var i = 0; i < this.btns.length; i++ ){
      this.btns[ i ].addEventListener( 'click', this.onClickShare.bind( this ) );
    }
  }

  rebind(){
    this.btns = document.querySelectorAll( 'button.share' );

    for( var i = 0; i < this.btns.length; i++ ){
      this.btns[ i ].addEventListener( 'click', this.onClickShare.bind( this ) );
    }

    this.bind();
  }

  onClickShare( e ){
    e.preventDefault();

    let blockQuote = e.target.parentNode,
        title = blockQuote.querySelector( '.title' ).innerText,
        desc = blockQuote.querySelector( '.desc' ).innerText;

    FB.ui({
      method: 'share',
      hashtag: 'tdf2016',
      quote: `${title} ${desc}`,
      href: window.location.href,
    }, function(response){});
  }
}