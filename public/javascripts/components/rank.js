export default class Rank {
  constructor( app ){
    this.bind();
  }

  bind(){
    this.switches = document.querySelectorAll( '.rank .switch' );
    this.tables = document.querySelectorAll( '.rank .switchable' );

    for( var i = 0; i < this.switches.length; i++ ){
      this.switches[ i ].addEventListener( 'click', this.onClickSwitch.bind( this ) );
    }
  }

  onClickSwitch( e ){
    e.preventDefault();

    for( var i = 0; i < this.switches.length; i++ ){
      this.switches[ i ].classList.remove( 'active' );
      this.tables[ i ].style.display = 'none';
    }

    e.target.classList.add( 'active' );
    document.querySelector( `.rank table.${ e.target.dataset.switch }` ).style.display = 'table';
  }
}