(function( https, events, fs ){
	'use strict';

	var twitter = https.get( 'https://cheedear:$&twitterCASKET$&@stream.twitter.com/1.1/statuses/sample.json' );
	var tweeter = new events.EventEmitter();

	var counter = 0;

	var because = '';

	var scanners = {
		hue: {
			'give':
				'rainbow|rough|ring|wing|wash|trust|live|lust|coldhead'.split( '|' ),
			'take':
				'blood|wizard|twist|flap|crash|whizz|palace|parse|angus'.split( '|' )
		},
		saturation: {
			'give':
				'hemingway|love|color|colour|smile|i love you|i love|chee|javascript|hooray|lol'.split( '|' ),
			'take':
				'bieber|grey|dull|work|cunt|fuck|shit'.split( '|' )
		},
		luminance: {
			'give':
				'angel|love|light|thanks|christ|ecmascript|wish|have|yay'.split( '|' ),
			'take':
				'devil|hate|dark|nothing|oh my god|n\'t'.split( '|' )
		}
	};

	function scan ( tweet ) {
		Object.keys( scanners ).forEach(function ( type ) {
			scanners[ type ].give.forEach(function ( term ) {
				if ( !!~tweet.indexOf( term ) ) {
					because = type + ' + ' + term;
					feel[ type ]++;
					counter++;
				}
			});
			scanners[ type ].take.forEach(function ( term ) {
				if ( !!~tweet.indexOf( term ) ) {
					because = type + ' - ' + term;
					feel[ type ]--;
					counter++;
				}
			});
		});
	}

	function send() {
		fs.readFile( 'public/index.html', function ( error, data ) {
			if ( error ) {
				console.error( error );
			} else {
				fs.writeFile( 'public/index.html',
					String( data )
					.replace( /background-color: .*;/, 'background-color: ' + feel.print() + ';' )
					.replace( /because: .*/, 'because: ' + because ) );
			}
		});

	}

	var feel = (function () {
		var hue = 180;
		var saturation = 50;
		var luminance = 50;
		return {
			get hue () {
				return hue;
			},
			set hue ( value ) {
				hue = Math.abs( value % 360 );
			},

			get saturation () {
				return saturation;
			},
			set saturation ( value ) {
				saturation = Math.max( 0, Math.min( value, 100 ) );
			},

			get luminance () {
				return luminance;
			},
			set luminance ( value ) {
				luminance = Math.max( 0, Math.min( value, 100 ) );
			},

			print: function () {
				return 'hsl( ' + this.hue + ', ' + this.saturation + '%, ' + this.luminance + '% )';
			}
		};
	})();

	twitter.on( 'response', function ( response ) {
		response.setEncoding( 'utf8' );
		if ( response.statusCode === 200 ) {
			var tweets = '';
			response.on( 'data', function ( chunk ) {
				try {
					tweeter.emit( 'tweet', JSON.parse( chunk ) );
					tweets = '';
				} catch ( error ) {
					//console.log( error );
				}
			});
		} else {
			console.error( response.statusCode );
		}

		twitter.end();
		return tweeter;
	});

	twitter.on( 'error', function ( error ) {
		console.error( error );
	});

	tweeter.abort = function () {
		twitter.abort();
	};

	tweeter.on( 'abort', function () {
		tweeter.abort();
	});

	tweeter.on( 'tweet', function ( tweet ) {
		scan( tweet.text.toLowerCase() );
		if ( counter > 100 ) {
			send();
			counter = 0;
		}
	});

})( require( 'https' ), require( 'events' ), require( 'fs' ) );