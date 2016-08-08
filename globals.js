/* INITIALIZATION */
/* GLOBALS */

var no_of_columns = 3;
var setWidth = 700; // the maxWidth of imageBox's

// _history object for Undo
var _history = []; // will be filled with previous states (delete images, delete collections, etc.)

var collections,
	dbIndex,
	DATABASE,
	imageDB,
	selected_index,
	currentFSElement,
	audio_playing_index,
	global_volume,
	helpTips = []; // an array of helpTip objects with "done already" properties
	
global_volume = 0.3;

// Function for applying changes to given current Collection 
var applyChanges=function(){
		DATABASE[dbIndex]=imageDB;
		localStorage.setItem("imageDB",JSON.stringify(DATABASE)); //save the entire database
};
	

$(document).ready(function(){
	
	// Collection names array
	 collections = JSON.parse(localStorage.getItem("collection_names")); // get the names of my collections
	if (collections === null || collections[0] === null || collections[0] === ""){
		collections = ["Default"];
	}	
	
	// Database Index
	 dbIndex = localStorage.getItem("last_visited_index"); // which image collection to fetch?
	if(dbIndex==null){
		dbIndex=0;
	}
	
	// The DATABASE array for all the collection data
	 DATABASE = localStorage.getItem("imageDB");
	DATABASE = JSON.parse(DATABASE);
	console.log('parsed');
	console.log(DATABASE);
	
	// ImageDB and DATABASE init
	 imageDB = [];
	if (DATABASE==null){
		DATABASE = [imageDB];
	}
	else{
		imageDB = DATABASE[dbIndex]; //set imageDB to a single collection in the database
	}
	//alert(imageDB);
	
	// (Other globals)
	 selected_index = -1; // the image to manipulate in the given code (for controls and the like)
	 currentFSElement = false;	//global for currently fullscreened element to extract "src" from and put inside FullScreenView img object
	 audio_playing_index = -1; // so we can keep playing audio on a video if the list is refreshed
});	