(function() {

// object to store all AugTweetPlace objects, can be shared among many maps
var _places = {};

/*
 * A AugTweet is a Marker extended with a Tweet model and perhaps a Place
 */
function AugTweet(_tweet, _map) {
	this._tweet = _tweet;
	
	this._position = new google.maps.LatLng(_tweet.ll[0], _tweet.ll[1]);

//	this.setOptions({animation: google.maps.Animation.DROP});
//	this.setAnimation(google.maps.Animation.DROP);

	var me = this;
	setTimeout(function() {
	    me.setMap(_map);		       
	}, Math.random() * 500);
//	this.setMap(_map);
}

AugTweet.prototype = new google.maps.OverlayView();
//AugTweet.prototype = new google.maps.Marker();

AugTweet.prototype.getPosition = function() {
	if (typeof(this._position) != 'undefined') {
		return this._position;
	}
}

AugTweet.prototype.onAdd = function() {
	var _div = document.createElement('div');
	_div.style.position = 'absolute';
	_div.style.cursor = 'pointer';

	var _inner = document.createElement('div');
	_inner.className = "inner";
	
	var _img = document.createElement('img');
	_img.src = this._tweet.profile_image_url;
	_img.id = 'tid_' + this._tweet.id;
	_img.width = 24;
	_img.height = 24;
	_img.style.width = 24;
	_img.style.height = 24;
	
	// represent approx. location with dotted border and opacity
	_div.className = 'augtweet_exact hovercardable';

	
	_div.appendChild(_img);
	_div.appendChild(_inner);
	
	// for use in hovercards
	// @anywhere sometimes passes the div, sometimes the img to the username function 
	_div.title = this._tweet.screen_name;
	_img.title = this._tweet.screen_name;
	
	if (this._tweet.location) {
		// decorate rollover with place name
		if (this._tweet.location) {
			_div.title += ' in ' + this._tweet.place.name;
			_img.title += ' in ' + this._tweet.place.name;	
		}

	}
	
	this._div = _div;
	this._img = _img;
	this.getPanes().overlayImage.appendChild(_div);
};

AugTweet.prototype.draw = function() {
	// exact point from lat/lng
	var _pixel = this.getProjection().fromLatLngToDivPixel(this._position);
	_pixel.y -= 32;
	
	this._div.style.left = (_pixel.x - 12) + 'px';
	this._div.style.top = (_pixel.y) + 'px';
};

AugTweet.prototype.onRemove = function() {
	this._div.parentNode.removeChild(this._div);
	this._div = null;
};

// polygon to show approximate location of tweets
function AugTweetPlace(_polygon_array, _AugTweet) {
	this._reset();
	
	var _opts = _AugTweet._style_out || {
		strokeColor: "#FF0000",
		strokeOpacity: 0,
		strokeWeight: 0,
		fillColor: "#FF0000",
		fillOpacity: 0
	};
	_opts.paths = _polygon_array;

	this.setOptions(_opts);
	this.setMap(_AugTweet.getMap());
}


// add AugTweet to the google.maps namespace
google.maps.AugTweet = AugTweet;

})();