"use strict";

function gsuiAudioBlock() {
	var root = this._clone();

	root.querySelectorAll( "*" ).forEach( function( el ) {
		el.gsuiAudioBlock = this;
	}, this );
	this.rootElement = root;
	this._elName = root.querySelector( ".gsui-name" );
	this._elCnt = root.querySelector( ".gsui-content" );
	this._elCropA = root.querySelector( ".gsui-crop.gsui-a" );
	this._elCropB = root.querySelector( ".gsui-crop.gsui-b" );
	this._elCropA.onmousedown =
	this._elCropB.onmousedown = this._evmdCrop.bind( this );
	root.onmousedown = this._evmdRoot.bind( this );
	this.selected = false;
}

gsuiAudioBlock.typeToCmp = {
	buffer: "gsuiWaveform",
	keys: "gsuiRectMatrix"
};

gsuiAudioBlock.prototype = {
	setResolution( w, h ) {
		this.resW = w;
		this.resH = h;
		if ( this._uiContentCmp ) {
			this._uiContentCmp.setResolution( w, h );
		}
	},
	name( n ) {
		this._elName.textContent = n;
	},
	select( b ) {
		this.rootElement.classList.toggle( "gsui-selected",
			this.selected = !!b );
	},
	when( em ) {
		this.rootElement.style.left = em + "em";
	},
	duration( em ) {
		this.rootElement.style.width = em + "em";
	},
	datatype( type ) {
		if ( type !== this._datatype ) {
			this._datatype =
			this.rootElement.dataset.type = type;
			if ( this._uiContentCmp ) {
				this._uiContentCmp.remove();
				delete this._uiContentCmp;
			}
		}
	},
	updateData( dat, off, dur ) {
		var cmp = this._uiContentCmp;

		if ( !cmp ) {
			this._uiContentCmp =
			cmp = new window[ gsuiAudioBlock.typeToCmp[ this._datatype ] ];
			this._elCnt.append( cmp.rootElement );
			if ( this.resW ) {
				this.setResolution( this.resW, this.resH );
			} else {
				this.setResolution( cmp.rootElement.clientWidth, 32 );
			}
		}
		cmp.render( dat, off, dur );
	},

	// private:
	_clone() {
		var div = document.createElement( "div" );

		gsuiAudioBlock.template = gsuiAudioBlock.template || this._init();
		div.appendChild( document.importNode( gsuiAudioBlock.template.content, true ) );
		return div.removeChild( div.querySelector( "*" ) );
	},
	_init() {
		document.body.addEventListener( "mousemove", function( e ) {
			gsuiAudioBlock._focused && gsuiAudioBlock._focused._evmmBody( e );
		} );
		document.body.addEventListener( "mouseup", function( e ) {
			gsuiAudioBlock._focused && gsuiAudioBlock._focused._evmuBody( e );
		} );
		return document.getElementById( "gsuiAudioBlock" );
	},

	// events:
	_evmdRoot( e ) {
		this._isDragging = true;
		this.ondrag( this, "down", e );
		gsuiAudioBlock._focused = this;
	},
	_evmmBody( e ) {
		if ( gsuiAudioBlock._focused ) {
			if ( this._elCropping ) {
				this.oncrop( this, "move", +this._cropSide, e );
			} else if ( this._isDragging ) {
				this.ondrag( this, "move", e );
			}
		}
	},
	_evmuBody( e ) {
		if ( gsuiAudioBlock._focused ) {
			if ( this._elCropping ) {
				this._elCropping.classList.remove( "gsui-hover" );
				this.oncrop( this, "up", +this._cropSide, e );
				delete this._elCropping;
			} else if ( this._isDragging ) {
				this.ondrag( this, "up", e );
				delete this._isDragging;
			}
			delete gsuiAudioBlock._focused;
		}
	},
	_evmdCrop( e ) {
		e.stopPropagation();
		this._elCropping = e.target;
		this._cropSide = e.target === this._elCropB;
		e.target.classList.add( "gsui-hover" );
		this.oncrop( this, "down", +this._cropSide, e );
		gsuiAudioBlock._focused = this;
	}
};