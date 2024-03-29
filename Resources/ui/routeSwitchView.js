/*
 * View displaying the route radio buttons on the main window
 */

// Constants
var METRO_DB = "metro";
var FAV_DB = "favs";
var UPDATE_INTERVAL = 3000;

// Switches
var redSwitch, blueSwitch, greenSwitch, orangeSwitch, yellowSwitch, purpleSwitch;

// Current value of the switch when favorites is disabled. 
var redSwitchV 		= "gray", 
	blueSwitchV 	= "gray", 
	greenSwitchV 	= "gray",
	orangeSwitchV 	= "gray", 
	yellowSwitchV 	= "gray", 
	purpleSwitchV 	= "gray";

// Value of the favorite switch
var isFavorites = false;

function SwitchView(width){
	// Container to hold everything
	var self = Ti.UI.createView({
		backgroundColor : 'white',
		borderColor : 'white',
		layout : 'horizontal',
		height : Ti.UI.FILL,
		width : width
	});

	// ROUTE SWITCHES **********************************
	var RouteSwitch = require('ui/routeSwitch');
	
	// Red Switch
	redSwitch = new RouteSwitch('red'); 
	redSwitch.addEventListener('click', switch_onChange);
	self.add(redSwitch);
	
	// Blue Switch Switch
	blueSwitch = new RouteSwitch('blue'); 
	blueSwitch.addEventListener('click', switch_onChange);
	self.add(blueSwitch);
	
	// Green Switch
	greenSwitch = new RouteSwitch('green'); 
	greenSwitch.addEventListener('click', switch_onChange);
	self.add(greenSwitch);
		
	// Orange Switch
	orangeSwitch = new RouteSwitch('orange');
	orangeSwitch.addEventListener('click', switch_onChange);
	self.add(orangeSwitch);
		
	// Yellow Switch
	yellowSwitch = new RouteSwitch('yellow'); 
	yellowSwitch.addEventListener('click', switch_onChange);
	self.add(yellowSwitch);
	
	// Purple Switch
	purpleSwitch = new RouteSwitch('purple'); 
	purpleSwitch.addEventListener('click', switch_onChange);
	self.add(purpleSwitch);
	
	return self;
}


function switch_onChange() {
	// Figure out which switch was changed;
	this.setEnabled(false);
	var color = this.getTitle();
	var status = this.getBackgroundColor();
	this.setTitle("loading");
	this.setBackgroundColor((status === "gray") ? color : "gray");
	status = this.getBackgroundColor();
	toggle_route(color, status);
	this.setTitle(color);
	this.setEnabled(true);
}

function toggle_route(color, status){
	if(!isFavorites){ 
		switch(color){
			case "red": 	redSwitchV = 	(status === "red") 		? "red" 	: 	"gray"; break;
			case "blue": 	blueSwitchV = 	(status === "blue") 	? "blue" 	: 	"gray"; break;
			case "green": 	greenSwitchV = 	(status === "green") 	? "green" 	: 	"gray"; break;
			case "yellow": 	yellowSwitchV = (status === "yellow")	? "yellow"	: 	"gray"; break;
			case "purple": 	purpleSwitchV = (status === "purple")	? "purple"	: 	"gray"; break;
			case "orange": 	orangeSwitchV = (status === "orange") 	? "orange" 	: 	"gray"; break;
		}
	}

	// Show or remove annotations accordingly
	var annotationtitle;
	var db = Ti.Database.open(METRO_DB);
	var query = "SELECT S.stopName, S.latitude, S.longitude FROM STOP S, ROUTE R, ROUTE_PATH RP"
								+" WHERE R.rowid=RP.routeid AND RP.stopid=S.rowid AND R.color LIKE '%"+color+"';";
	var rows = db.execute(query);
	var bus = db.execute("SELECT * FROM BUS WHERE name LIKE '%"+color.toUpperCase()+"%';");	
	if (!(status === "gray")) {
		Ti.API.info("ADDING: "+color);
		while (rows.isValidRow()) {
			annotationTitle = color.toUpperCase()+": " + rows.fieldByName("stopName");
			Ti.App.mapview.addAnnotation(Ti.Map.createAnnotation({
				title : annotationTitle,
				image : "images/pins/"+color+"_pin.png",
				latitude : rows.fieldByName("latitude"),
				longitude : rows.fieldByName("longitude")
			}))
			rows.next();
		}
		
		while (bus.isValidRow()) {
			if (bus.fieldByName("latitude") === null)
				break;
			Ti.App.mapview.addAnnotation(Ti.Map.createAnnotation({
				title : bus.fieldByName("name"),
				image : "images/buses/bus_"+color+".png",
				latitude : bus.fieldByName("latitude"),
				longitude : bus.fieldByName("longitude")
			}))
			bus.next();
		}
	} else {
		Ti.API.info("REMOVING: "+color);
		while (rows.isValidRow()) {
			annotationTitle = color.toUpperCase()+": " + rows.fieldByName("stopName");
			Ti.App.mapview.removeAnnotation(annotationTitle);
			rows.next();
		}
		while (bus.isValidRow()) {
			Ti.App.mapview.removeAnnotation(bus.fieldByName("name"));
			bus.next();
		}
	}
	db.close();
}

SwitchView.enableFavorites = function(){
	isFavorites = true;
	var favs = Ti.Database.open(FAV_DB);
	var rows = favs.execute("SELECT route, fav FROM FAVORITE;");
	var prevState;
	while(rows.isValidRow()) {
		switch(rows.fieldByName("route")){
			case 'red': 
				prevState = redSwitch.getBackgroundColor();
				redSwitch.setBackgroundColor((rows.fieldByName("fav") === "true") 		? "red" 	: "gray");
				if(prevState === "gray" || prevState !== redSwitch.getBackgroundColor()) 
					toggle_route(redSwitch.getTitle(), redSwitch.getBackgroundColor());
				break;
			case 'blue': 	
				prevState = blueSwitch.getBackgroundColor();
				blueSwitch.setBackgroundColor((rows.fieldByName("fav") === "true") 		? "blue" 	: "gray"); 
				if(prevState === "gray" || prevState !== blueSwitch.getBackgroundColor()) toggle_route(blueSwitch.getTitle(), blueSwitch.getBackgroundColor());	
				break;
  			case 'green': 
  				prevState = greenSwitch.getBackgroundColor();	
  				greenSwitch.setBackgroundColor((rows.fieldByName("fav") === "true") 	? "green" 	: "gray"); 	
  				if(prevState === "gray" || prevState !== greenSwitch.getBackgroundColor()) 
  					toggle_route(greenSwitch.getTitle(), greenSwitch.getBackgroundColor());
  				break;
  			case 'orange': 
  				prevState = orangeSwitch.getBackgroundColor();	
  				orangeSwitch.setBackgroundColor((rows.fieldByName("fav") === "true") 	? "orange" 	: "gray"); 	
  				if(prevState === "gray" || prevState !== orangeSwitch.getBackgroundColor()) 
  					toggle_route(orangeSwitch.getTitle(), orangeSwitch.getBackgroundColor());
  				break;
  			case 'yellow': 	
  				prevState = yellowSwitch.getBackgroundColor();
  				yellowSwitch.setBackgroundColor((rows.fieldByName("fav") === "true") 	? "yellow" 	: "gray");	
  				if(prevState === "gray" || prevState !== yellowSwitch.getBackgroundColor()) 
  					toggle_route(yellowSwitch.getTitle(), yellowSwitch.getBackgroundColor());
  				break;
  			case 'purple': 	
  				prevState = purpleSwitch.getBackgroundColor();
  				purpleSwitch.setBackgroundColor((rows.fieldByName("fav") === "true") 	? "purple" 	: "gray"); 	
  				if(prevState === "gray" || prevState !== purpleSwitch.getBackgroundColor()) 
  					toggle_route(purpleSwitch.getTitle(), purpleSwitch.getBackgroundColor());
  				break;
		}
		rows.next();
	}
	favs.close();
};

SwitchView.disableFavorites = function(){
	isFavorites = false;
	
	// Get previous states
	var red_prev = redSwitch.getBackgroundColor();
	var blue_prev = blueSwitch.getBackgroundColor();
	var green_prev = greenSwitch.getBackgroundColor();
	var orange_prev = orangeSwitch.getBackgroundColor();
	var yellow_prev = yellowSwitch.getBackgroundColor();
	var purple_prev = purpleSwitch.getBackgroundColor();
	
	// Revert buttons back to normal
	redSwitch.setBackgroundColor(redSwitchV);
	blueSwitch.setBackgroundColor(blueSwitchV);
	greenSwitch.setBackgroundColor(greenSwitchV);
	orangeSwitch.setBackgroundColor(orangeSwitchV);
	yellowSwitch.setBackgroundColor(yellowSwitchV);
	purpleSwitch.setBackgroundColor(purpleSwitchV);
	
	// Change annotations on map, except if a route is toggled on stayed on ( to avoid double-layer of annotations)
	if(red_prev === "gray" || red_prev !== redSwitch.getBackgroundColor())
		toggle_route(redSwitch.getTitle(), redSwitch.getBackgroundColor());
	if(blue_prev === "gray" || blue_prev !== blueSwitch.getBackgroundColor())
		toggle_route(blueSwitch.getTitle(), blueSwitch.getBackgroundColor());
	if(green_prev === "gray" || green_prev !== greenSwitch.getBackgroudnColor())
		toggle_route(greenSwitch.getTitle(), greenSwitch.getBackgroundColor());
	if(orange_prev === "gray" || orange_prev !== orangeSwitch.getBackgroundColor())
		toggle_route(orangeSwitch.getTitle(), orangeSwitch.getBackgroundColor());
	if(yellow_prev === "gray" || yellow_prev !== yellowSwitch.getBackgroundColor())
		toggle_route(yellowSwitch.getTitle(), yellowSwitch.getBackgroundColor());
	if(purple_prev === "gray" || purple_prev !== purpleSwitch.getBackgroundColor())
		toggle_route(purpleSwitch.getTitle(), purpleSwitch.getBackgroundColor());
};

SwitchView.updateBuses = function(){
	var db = Ti.Database.open(METRO_DB);
	if(!(redSwitch.getBackgroundColor() === "gray")) 			updateBus("RED");
	else if(!(blueSwitch.getBackgroundColor() === "gray")) 		updateBus("BLUE");
	else if(!(greenSwitch.getBackgroundColor() == "gray")) 		updateBus("GREEN");
	else if(!(orangeSwitch.getBackgroundColor() == "gray")) 	updateBus("ORANGE");
	else if(!(yellowSwitch.getBackgroundColor() == "gray")) 	updateBus("YELLOW");
	else if(!(purpleSwitch.getBackgroundColor() == "gray")) 	updateBus("PURPLE");
	db.close()
	
	function updateBus(color){
		var bus = db.execute("SELECT * FROM BUS WHERE name LIKE '"+color+"%';");
		while(bus.isValidRow()) {
			Ti.App.mapview.removeAnnotation(bus.fieldByName("name"));	
			//if(bus.fieldByName("latitude") === null) break;
			Ti.App.mapview.addAnnotation(Ti.Map.createAnnotation({
				title : bus.fieldByName("name"),
				image : "images/buses/bus_"+color+".png",
				pincolor : 'black',
				latitude : bus.fieldByName("latitude"),
				longitude : bus.fieldByName("longitude")
			}));
			bus.next();
		}
	}
};

SwitchView.update = function() {
	setInterval(function() {
		SwitchView.updateBusLocations();
		SwitchView.updateBuses();
	},UPDATE_INTERVAL);
};

SwitchView.updateBusLocations = function() {
	var db = Ti.Database.open(METRO_DB);
	var rows = db.execute("SELECT name FROM BUS;");
	while(rows.isValidRow()) {
		SwitchView.getBusLocations(rows.fieldByName("name"));
		rows.next();
	}
	db.close();
}
	
SwitchView.getBusLocations = function(bus) {	
	var asynch =	false;
	var baseurl = 	"http://capstone-bus-f10.csi.muohio.edu:8080/onebusaway-api-webapp/api/where/trip-details/";
	var jsonFile = 	"1_" + bus + "_1.json" ;
	var params = 	"?key=TEST&app_uid=admin&app_ver=9";
	url = baseurl+jsonFile+params;
	
	var client = Ti.Network.createHTTPClient({
		// function called when the response data is available
		onload : function(e) {
			var pois = JSON.parse(client.responseText);
			var status = pois.data.entry.status;
			//if(status != null) {
				latitude = pois.data.entry.status.position.lat;
				longitude = pois.data.entry.status.position.lon;
				var db = Ti.Database.open(METRO_DB);
				db.execute("UPDATE BUS SET latitude = " + latitude + ", longitude = " + longitude + " WHERE name = '"+bus+"';");
				db.close();
			//}
		},
		// function called when an error occurs, including a timeout
		onerror : function(e) {
			Ti.API.debug(e.error);
		},
		timeout : 5000  // in milliseconds
	});
	// Prepare the connection.
	client.open("GET", url, asynch);
	
	// Send the request.
	client.send(); 
};

module.exports = SwitchView;