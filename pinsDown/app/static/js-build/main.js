//=require "_base"
//=require "_AugTweet"
//=do_not_require "_Label"
//=require "_jquery"

var DataChart = (function() {
    var chartArea, sortedData;

    var coreData = [{
	location: 'North East',
	thefts: 5534,
	pop: 2515479,
	latLng: [54.838663612975104, -2.13134765625]
    },{
	location: 'North West',
	thefts: 10003,
	pop: 6729800,
	latLng: [54.03358633521085, -2.96630859375]
    },{
	location: 'Yorkshire & Humberside',
	thefts: 7852,
	pop: 4964838,
	latLng: [53.99485396562768, -1.4501953125]
    },{
	location: 'East Midlands',
	thefts: 9758,
	pop: 4172179,
	latLng: [53.028000167735165, -1.1865234375]
    },{
	location: 'West Midlands',
	thefts: 8742,
	pop: 5267337,
	latLng: [52.522905940278065, -2.1533203125]
    },{
	location: 'East of England',
	thefts: 11358,
	pop: 5388154,
	latLng: [52.308478623663355, 0.3955078125]
    },{
	location: 'London',
	thefts: 6757,
	pop: 7572036,
	latLng: [51.57706953722567, -0.263671875]
    },{
	location: 'South East',
	thefts: 9672,
	pop: 8000550,
	latLng: [51.358061573190916, -1.07666015625]
    },{
	location: 'South West',
	thefts: 8926,
	pop: 4928458,
	latLng: [51.01375465718821, -3.09814453125]
    },{
	location: 'Wales',
	thefts: 7633,
	pop: 3006400,
	latLng: [52.496159531097106, -3.6474609375]
    }];

    function setupData() {
	var len = coreData.length;
	while (len--) {
	    coreData[len].ratio = coreData[len].thefts / coreData[len].pop * 1000;
	}
	sortedData = uti.sortProp(coreData, 'ratio');	
    }

    function createBar(ratio, name) {
	var barEl = uti.ce('div'),
	    textEl = uti.ce('div');

	barEl.className = "bar";
	textEl.className = "bar-text";
	textEl.innerHTML = name + " (" + (Math.round(ratio * 10) / 10) + ")";

	barEl.appendChild(textEl);

	return barEl;
    }

    function setupChart() {
	var i = 0, len = sortedData.length, barW = 280 / len, maxHeight = 200 / sortedData[len - 1].ratio;

	while (i < len) {
	    var ratio = sortedData[i].ratio,
		node = createBar(ratio, sortedData[i].location);

	    uti.style(node,
		      'width:' + barW + 'px;' +
		      'height:' + Math.max(10, ratio * maxHeight) + 'px;' +
		      'left:' + (barW * i) + 'px;'
	    );
	    chartArea.appendChild(node);
	    sortedData[i].node = node;
	    i++;
	}
    }

    function haversineDistance(lat1, lon1, lat2, lon2) {
	var R = 6371; // km  
	var dLat = (lat2-lat1)*Math.PI/180;  
	var dLon = (lon2-lon1)*Math.PI/180;   
	var a = Math.sin(dLat/2) * Math.sin(dLat/2) +  
	    Math.cos(lat1*Math.PI/180) * Math.cos(lat2*Math.PI/180) *   
	    Math.sin(dLon/2) * Math.sin(dLon/2);   
	var c = 2 * Math.asin(Math.sqrt(a));   
	var d = R * c;  
	return d;
    }

    function findClosest(lat, lng) {
	var dist = 100000000000000, closest = false, cur, neuDist,
	    len = sortedData.length;

	while (len--) {
	    cur = sortedData[len];
	    neuDist = haversineDistance(lat, lng, cur.latLng[0], cur.latLng[1]);
	    if (neuDist < dist) {
		closest = cur;
		dist = neuDist;
	    }
	}

	return closest;
    }

    function setCurrent(node) {
	var len = sortedData.length;
	while (len--) {
	    jQuery(sortedData[len].node).removeClass('selected');
	}
	jQuery(node).addClass('selected');
    }

    return {
	init: function() {
	    chartArea = jQuery('#main-popup-three > .main-chart').get(0);
	    setupData();
	    setupChart();
	},
	changeLocation: function(lat, lng) {
	    var best = findClosest(lat, lng);
	    setCurrent(best.node);
	}
    };
})();

var TwitterFall = (function() {
    var area, keywords = ["phone", "stolen"];
		       
    function tweetNode(image, user, text, loc, millis) {
	var item = uti.ce('li'),
	    userEl = uti.ce('a'),
	    iconEl = uti.ce('div'),
	    textEl = uti.ce('div'),
	    timeEl = uti.ce('div'),
	    moreTextEl = uti.ce('div'),
	    locEl = uti.ce('div'),
	    clear = uti.ce('div');

	item.className = "tweet-item start";
	textEl.className = "text";
	locEl.className = "location";
	iconEl.className = "icon";
	timeEl.className = "time";
	uti.style(clear, "clear:both;");
	uti.style(iconEl, 'background-image:url(' + image + ')');

	jQuery(userEl).attr('href', 'http://twitter.com/' + user);

//	moreTextEl.innerHTML = text.replace(/(^|\s)(stolen)(\s|$)/ig, '$1<b>$2</b>$3');
	moreTextEl.innerHTML = text.replace(new RegExp("(^|\\s?)(" + keywords.join('|') + ")(\\s?|$)", "gi"), '$1<b>$2</b>$3');

	userEl.innerHTML = '@' + user;
	textEl.appendChild(userEl);
	textEl.appendChild(moreTextEl);
	if (loc) locEl.innerHTML = loc;
	if (millis) timeEl.innerHTML = uti.formatDate(millis);
	
	item.appendChild(iconEl);
	item.appendChild(textEl);
	item.appendChild(clear);
	item.appendChild(locEl);
	item.appendChild(timeEl);

	return item;
    }
    

    return {
	init: function() {
	    area = uti.gid('tweet-container');
	},
	getArea: function() { return area; },
	addTweets: function(items) {
	    if (area.children && area.children.length > 0) {
		$(area.children).fadeOut(400);
		setTimeout(function() {
		    $(area.children).remove();
		}, 400);
	    }

	    setTimeout(function() {
		$.each(items, function(idx, item) {
		    var newNode = tweetNode(item.profile_image_url, item.screen_name, item.text, item.place, item.time);
		    jQuery(newNode).hide();

		    if (area.children.length > 0) {
			area.insertBefore(newNode, area.children[0]);
		    } else {
			area.appendChild(newNode);
		    }

		    setTimeout(function() {
			jQuery(newNode).show();
			jQuery(newNode).removeClass("start");
		    }, idx * 250);

		});
	    }, 450);

	}
    };
})();

var uti = (function() {
    return {
	gid: function(el) { return document.getElementById(el);	},
	sortProp: function (array, prop) {
	    return array.sort(function(a, b) {return a[prop] - b[prop];});
	},
	ce: function(n) { return document.createElement(n); },
	log: function(a) { console.log(a); },
	style: function(el, v) { el.style.cssText = v; },
	cap: function(str) { return str.slice(0,1).toUpperCase() + str.slice(1,str.length);  },
	arr: function(obj) {
	    var out = [];
	    for (i in obj) out.push([i, obj[i]]);
	    return out;
	},
	isValidDate: function (d) {
	    if ( Object.prototype.toString.call(d) !== "[object Date]" )
		return false;
	    return !isNaN(d.getTime());
	},
	formatDate: function(millis) {
	    var a = new Date(millis);
	    return (a.getDate() + "/" + (a.getMonth() + 1) + "/" + a.getFullYear());
	}
    };
})();

var ButtonsAndPanels = (function() {
    var butTwitter,
	butHist,
	butSubmit,
	panelA,
	panelB,
	panelC,
	twitPanel,
	checkbox1;

    function cb1() { return checkbox1.prop('checked'); }

    function setupTwitterPanel(panel) {
	checkbox1 = jQuery(uti.gid('theft-input-one'));

	checkbox1.change(function() {
	    if (cb1()) {
		jQuery(twitPanel).removeClass('hidden-2');
	    } else {
		jQuery(twitPanel).addClass('hidden-2');
	    }
	});

    }

    function toggleX(panel1, panel2, icon) {
	return function() {
	    if (jQuery(panel1).hasClass('hidden')) {
		jQuery(panel1).removeClass('hidden');
		if (panel2) jQuery(panel2).removeClass('hidden');
		jQuery(icon).addClass('selected');
	    }
	    else {
		jQuery(panel1).addClass('hidden');
		if (panel2) jQuery(panel2).addClass('hidden');
		jQuery(icon).removeClass('selected');
	    }
	};
    }

    return {
	checkbox1: cb1,
	init: function() {
	    butTwitter = uti.gid('top-but-one');
	    butHist = uti.gid('top-but-two');
	    butSubmit = uti.gid('top-but-three');
	    panelA = uti.gid('main-popup-one');
	    panelB = uti.gid('main-popup-two');
	    panelC = uti.gid('main-popup-three');

	    setupTwitterPanel(panelA);

	    TwitterFall.init();
	    twitPanel = TwitterFall.getArea();
	    
	    jQuery(butTwitter).click(toggleX(panelA, twitPanel, butTwitter));
	    jQuery(butHist).click(toggleX(panelB, undefined, butHist));
	    jQuery(butSubmit).click(toggleX(panelC, undefined, butSubmit));
	},
	showTwitter: function() {
	    jQuery(butTwitter).click();
	},
	addPinPanelShowing: function() {
	    return !jQuery(panelB).hasClass('hidden');
	}
    };
})();

var MapMain = (function() {
    var locs = {
	    'london': [51.507335,-0.127683],
	    'belfast': [54.597443,-5.934068],
	    'birmingham': [52.486243,-1.890401],
	    'glasgow': [55.864237, -4.251806],
	    'edinburgh': [55.953252, -3.188267],
	    'liverpool': [53.4083714, -2.9915726],
	    'manchester': [53.479251, -2.247926],
	    'bristol': [51.454513, -2.58791],
	    'leeds': [53.801279, -1.548567],
	    'sheffield': [53.381129, -1.470085],
	    'leicester': [52.6368778, -1.1397592]
	},
	currentTwitterMarkers,
	currentUserMarkers,
	defaultZoom = 9,
	map, geocoder, currentLatLong = locs['london'],
	allGeocoded = {};

    function setOptions(select, opts, selectedOption) {
	var newOptions = opts.sort();

	if (select.prop) { var options = select.prop('options'); }
	else { var options = select.attr('options'); }

	$.each(newOptions, function(idx, name) {
	    options[options.length] = new Option(uti.cap(name), name);
	});

	select.val(selectedOption.toLowerCase());
    }

    function init() {
	var mapNode = uti.gid('map-holder'), addedPin = false;

	var myOptions = {
          center: new google.maps.LatLng(51.5171, 0.1062),
          zoom: defaultZoom,
          mapTypeId: google.maps.MapTypeId.ROADMAP,
	  mapTypeControl: false,
	  streetViewControl: false,
	  zoomControlOptions: {
	      style: google.maps.ZoomControlStyle.SMALL
	  },
	  panControl: false
        };

        map = new google.maps.Map(mapNode, myOptions);
	geocoder = new google.maps.Geocoder();

	var timeout;
	google.maps.event.addListener(map, 'dragend', function(d) {
	    clearTimeout(timeout);
	    timeout = setTimeout(function() {
		var cent = map.getCenter();
		currentLatLong = [cent.lat(), cent.lng()];
		queryNewData(currentLatLong);
	    }, 1000);
	});

	google.maps.event.addListener(map, 'click', function(d) {

	    if (ButtonsAndPanels.addPinPanelShowing() && !addedPin) {
		// if panel 2 is showing and have not yet added any
		var newLocation = new google.maps.Marker({
		    position: new google.maps.LatLng(d.latLng.lat(), d.latLng.lng()),
		    icon:  '/static/images/pin-1-orange.png',
		    animation: google.maps.Animation.DROP
		});
		newLocation.setMap(map);
		var latLong = [d.latLng.lat(), d.latLng.lng()];
		addedPin = true;
		
		jQuery('#submit-loc, #cancel-submit-loc').show();

		jQuery('#cancel-submit-loc').click(function() {
		    addedPin = false;
		    newLocation.setMap(null);
		    jQuery('#submit-loc, #cancel-submit-loc').hide();		    
		});

		jQuery('#submit-loc').click(function() {
		    jQuery.ajax('/submitTheft', {
			type: 'POST',
			contentType: "application/json",
			data:  JSON.stringify({
			    lat: latLong[0],
			    lng: latLong[1]
			}),
			success: function(dRaw) {
			    try {
				var d = JSON.parse(dRaw),
				    title = jQuery('#main-popup-two > .title').get(0);

				if (d || d ? d.error : false) {
				    title.innerHTML = "There was a problem, please try again";
				} else {
				    jQuery('#submit-loc, #cancel-submit-loc').hide();
				    if (d && d.alreadyHave) {
					title.innerHTML = "We have already recorded your recent theft";
					newLocation.setMap(null);
				    } else {
					title.innerHTML = "We have recorded your theft";
				    }
				}				
			    } catch (x) {}

			}
		    });

						
		});

	    }


	});
    }

    function doGeocode(locName, callback) {
	geocoder.geocode({}, function(results, status) {
	    var result = [];
	    if (status == google.maps.GeocoderStatus.OK) {
		var out = [results[0].geometry.location.lat(), results[0].geometry.location.lng()];
		callback(out);
	    } else {
		callback(false);
	    }
	});
    }

    var randSmall = 0.1,
	randLarge = 0.5;
    function randomiseLL(ll, radius) {
	var t = 2 * Math.PI * Math.random(),
	    r = Math.sqrt(Math.random());
		
	return [ll[0] + (Math.cos(t) * radius * r * 0.6), ll[1] + (Math.sin(t) * radius * r)];

    }

    function randomiseSmallLL(ll) { return randomiseLL(ll, randSmall); }
    function randomiseLargeLL(ll) { return randomiseLL(ll, randLarge); }

    function updateMapAndDB(data, latLong) {
	var tweets = data.results, forMap = [];
	$.each(tweets, function(a,b) {
	    var when = new Date(b.created_at);

	    forMap.push({
		id: b.id,
		ll: randomiseLargeLL(latLong),
		profile_image_url: b.profile_image_url,
		screen_name: b.from_user,
		text: b.text,
		place: b.location,
		time: uti.isValidDate(when) ? when.getTime() : false
	    });

	});

	currentTwitterMarkers = addAugTweets(forMap);

	TwitterFall.addTweets(forMap);

	Comms.giveServerTweets(tweets);
    }

    function retrieveFail() {
	alert('There was a problem getting live tweets');
    }

    function hideShowCurrentTwitterMarkers(show) {
	var which = show ? map : null;

	if (currentTwitterMarkers) {
	    var i = 0, len = currentTwitterMarkers.length;
	    while (i < len) {
		(function(marker) {
		     setTimeout(function() {
			 marker.onMap.setMap(which);
		     }, i * 50);
		})(currentTwitterMarkers[i]);
		i++;
	    }
	}	
    }

    function hideCurrentUserMarkers() {
	if (currentUserMarkers) {
	    var i = 0, len = currentUserMarkers.length;
	    while (i < len) {
		(function(marker) {
		     setTimeout(function() {
			 marker.onMap.setMap(null);
		     }, i * 50);
		})(currentUserMarkers[i]);
		i++;
	    }
	}		
    }

    function queryNewData(latLong) {
	Comms.queryTwitter(latLong, updateMapAndDB, retrieveFail);
	Comms.queryUserSubmitted(latLong, function(dRaw) {
	    try {
		var d = JSON.parse(dRaw);
		if (d.data) addUserSubmitted(d.data);
	    } catch (x) {}
	});
	hideShowCurrentTwitterMarkers(false);
	hideCurrentUserMarkers();
	DataChart.changeLocation(latLong[0], latLong[1]);
    }
    function initQuery() { queryNewData(currentLatLong); }

    function locationChanged() {
	map.panTo(new google.maps.LatLng(currentLatLong[0], currentLatLong[1]), defaultZoom);
	queryNewData(currentLatLong);
    }

    function addUserSubmitted(data) {
	var len = data.length, i = 0, out = [];
	while (i < len) {
	    var a = i, b = data[i];
	    var newLocation = new google.maps.Marker({
		position: new google.maps.LatLng(b.lat, b.lng),
		icon:  '/static/images/pin-1-orange.png'
	    });
	    out.push(data[i]);
	    out[i].onMap = newLocation;

	    (function(newLocation, i) {
		setTimeout(function() {
		    newLocation.setMap(map);
		},i * 200);
	    }(newLocation, i));

	    i++;
	}
	currentUserMarkers = data;
    }

    function addAugTweets(data) {
	if (data && data.length) {
	    for (var i = 0; i < data.length; i++) {
		var tweet = data[i];
		var augtweet = new google.maps.AugTweet(tweet, map);
		data[i].onMap = augtweet;
	    }
	}
	return data;
    }

    function setupLocationStuff() {
	var locChoice =  uti.gid('loc-options'),
	    getLoc =  uti.gid('get-my-location-but'),
	    locsFlat = (function(items) {
		var out = [];
		$.each(items, function(k) {out.push(k);});
		return out;
	    })(locs);

	setOptions(jQuery(locChoice), locsFlat, 'London');

	jQuery(locChoice).change(function(){
	    currentLatLong = locs[jQuery(locChoice).val()];
	    locationChanged();
	});

	jQuery(getLoc).click(function() {
	    requestLocation(function(d) {
		try {
		    currentLatLong = [d.coords.latitude, d.coords.longitude];
		    locationChanged();
		} catch (x) {}
	    });
	});
    
    }

    function requestLocation(callback) {
	if (navigator && navigator.geolocation && navigator.geolocation.getCurrentPosition)
	    navigator.geolocation.getCurrentPosition(callback, new Function(),
		{'enableHighAccuracy':true,'timeout':10000,'maximumAge':0}
	    );
    }

    return {
	init: init,
	requestLocation: requestLocation,
	setupLocationStuff: setupLocationStuff,
	initQuery: initQuery,
	hideShowCurrentTwitterMarkers: hideShowCurrentTwitterMarkers
    };
})();

var Comms = (function() {

    function queryUrl(latLong) {
	var url = "http://search.twitter.com/search.json?page=1&include_entities=false&geocode=" +
	    latLong[0] + "," +
	    latLong[1] +  ",40mi&rpp=26&q=stolen%20phone&callback=?";

	return url;
    }

    return {
	queryTwitter: function(latLong, callback, fail) {
	    var url = queryUrl(latLong);
	    jQuery.getJSON(url, function(d) { callback(d, latLong); }).error(fail);
	},
	queryUserSubmitted: function(latLong, callback) {
	    jQuery.ajax('/getThefts', {
		type: 'POST',
		contentType: "application/json",
		data:  JSON.stringify({
		    lat: latLong[0],
		    lng: latLong[1]
		}),
		success: callback
	    });
	},
	giveServerTweets: function(tweets) {
	    /* not implemented */
	}
    };

})();

jQuery(document).ready(function() {
    ButtonsAndPanels.init();
    MapMain.init();
    DataChart.init();

    MapMain.setupLocationStuff();
    MapMain.initQuery();

    setTimeout(function() {
	ButtonsAndPanels.showTwitter();
    }, 1500);

    //Comms.queryTwitter(Comms.locations['birmingham']);

});
