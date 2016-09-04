/* INITIALIZATION */
/* GLOBALS */

var no_of_columns = 3;
var setWidth = 700; // the maxWidth of imageBox's

// _history object for Undo
var _history = []; // will be filled with previous states (delete images, delete collections, etc.)

var CURRENT_DATABASE = "database0"; // used for testing new database models

var collections,
	libraries,
	libraryIndex,
	collectionIndex,
	DATABASE,
	imageDB,
	lastVisited,
	selected_index,
	currentFSElement,
	audio_playing_index,
	global_volume,
	helpTips = []; // an array of helpTip objects with "done already" properties
	
global_volume = 0.3;

// Function for applying changes to given current Collection 
var applyChanges=function(){
		DATABASE.libraries[libraryIndex].collections[libraryIndex] = imageDB;
		localStorage.setItem(CURRENT_DATABASE,JSON.stringify(DATABASE)); //save the entire database
};

var setLastVisited = function(){
	localStorage.setItem('last_visited_index',JSON.stringify(lastVisited));
};

$(document).ready(function(){
	
	// Database Index
	lastVisited = JSON.parse(localStorage.getItem("last_visited_index"));
	// which library and collection to fetch?
	if(typeof lastIndex === 'object' && lastIndex.collection || typeof libraryIndex === 'undefined'){
		collectionIndex = lastVisited.collection;
		if(collectionIndex==null || collectionIndex == -1){
			collectionIndex = 0;
		}
		libraryIndex = lastVisited.library;
		if(libraryIndex===null || libraryIndex === -1 || typeof libraryIndex === 'undefined'){
			libraryIndex = 0;
		}
	}
	
	// The DATABASE array for all the collection data
	DATABASE = JSON.parse(localStorage.getItem(CURRENT_DATABASE));
	console.log(DATABASE);
	
	// Init the hierchy
	 libraries = [];
	 collections = [];
	 imageDB = [];
	if (DATABASE==null){
		DATABASE = new Object();
		DATABASE.id = 0;
		DATABASE.date_created = generateTimestamp();
		// generate a new clean DATABASE with 'default' library and 1 'default' empty collection
		DATABASE.libraries.push({
			name:'default',
			collections:[{
				name:'default',
				items:[],
				date_created: generateTimestamp()
			}],
			date_created: generateTimestamp()
			
		});
	}
	else{
		imageDB = DATABASE.libraries[libraryIndex].collections[collectionIndex]; //set imageDB to a single collection in the database
	}
	
	
	// Collections array for easy access
	collections = DATABASE.libraries[libraryIndex].collections;	
	
	// (Other globals)
	 selected_index = -1; // the image to manipulate in the given code (for controls and the like)
	 currentFSElement = false;	//global for currently fullscreened element to extract "src" from and put inside FullScreenView img object
	 audio_playing_index = -1; // so we can keep playing audio on a video if the list is refreshed
});	