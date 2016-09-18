// Checks for Depracated database objects that only have a [url] instead of [{url:"",...}]
var UpToDate = function(db_object_to_check){
	if(db_object_to_check !== null){
		if(typeof db_object_to_check === 'string'){ // NOT up to date 
			return false;
		}
		else if(typeof db_object_to_check === 'object'){ // YES up to date
			if(typeof db_object_to_check.url !== 'undefined' && typeof db_object_to_check.caption !== 'undefined'){
				return true;
			}
			else{
				return false;
			}
		}
		else{
			return false;
		}
	}
	else{
		return false;
	}
};

var widerThanTall = function(img){
	if(img.width > img.height){
		return true;
	}
	else{
		return false;
	}
}

var getURL = function(item){
	if(UpToDate(item)){
		return item.url;
	}
	else{
		return item;
	}
}

var getURLType = function(url,assumeImage = true){
	var typeString = "";
	var extension = url.substr(url.lastIndexOf('.')+1);
	switch(extension){ // if its an image file
		case 'jpg':
		case 'jpeg':
		case 'bmp':
		case 'tif':
		case 'gif':
			typeString = 'image';
			break;
		case 'gifv': // if its an html5 video file
		case 'webm':
		case 'mp4':
		case 'mov':
		case 'avi':
		case 'mpeg':
			typeString = 'video';
			break;
		default:
			// assume url is an image to simplify things
			if(assumeImage){
				typeString = 'image';
			}
			else{
				typeString = 'generic';
			}
			
			$(['mp4','webm','gifv']).each(function(x,item){
				if(url.indexOf(item)>=0){ // does the url contain a video extension?
					typeString = 'video'
				}
			});
			break;
	}
	
	return typeString;
}

var processURL = function(i){

	/* for(var i = 0;i<imageDB.items.length;i++){ */
	var img = "";
	
	if(typeof imageDB.items[i] === 'string'){ // is it the depracated database style
		img = imageDB.items[i] ? imageDB.items[i] : ""; // is there something actually there at that place in the database? No? Then just put ""
	}
	else if(typeof imageDB.items[i] === 'object'){ // or the updated one with .properties?
		if(imageDB.items[i] == null){
			return "<div>Error</div>";
		}
		img = imageDB.items[i].url;
	}
	// determine whether image or html5 video by its END extension
	var element = "";
	var extension = img.substr(img.lastIndexOf('.')+1);
	switch(extension){ // if its an image file
		case 'jpg':
		case 'jpeg':
		case 'bmp':
		case 'tif':
		case 'gif':
			element = "<img id='"+i+"' src='"+img+"'/>"; // placeholder img element with no source 
			
			console.log("pushed item");
			break;
		case 'gifv': // if its an html5 video file
		case 'webm':
		case 'mp4':
		case 'mov':
		case 'avi':
		case 'mpeg':
			element = "<video autoplay loop id='"+i+"' src='"+img+"'></video>";
			break;
		default:
			element = "<img id='"+i+"' src='"+img+"'/>"; // put in placeholder image object with no source
			// But if there's a video extension anywhere in the url, then go back to being a video:
			
			$(['mp4','webm','gifv']).each(function(x,item){
				if(img.indexOf(item)>=0){ // does the url contain a video extension?
					element = "<video autoplay loop id='"+i+"' src='"+img+"'></video>"
				}
			});
			break;
	}
	
	return element;
};

// used for getting rid of embedded HTML in captions that are being displayed
var processCaption = function(image){
	
	var caption = "";
	var outputhtml = "";
	
	if(UpToDate(image)){
		caption = image.caption;
		if(/<[a-z][\s\S]*>/i.test(caption)){
			caption = caption.replace("<","&#60;").replace(">","&#62;");
		}
	}
	else{
		caption = image;
	}
	
	return caption;
	
};

var getCaption = function(item){
	if(UpToDate(item)){
		if(item.caption){
			return item.caption;
		}
		else{
			return undefined;
		}
	}
	else{
		return item;
	}
}

var validImageCheck = function(src){
	var valid = true;
	var img = new Image(src);
	img.onerror = function(){
		valid = false;
	};
	return valid;
};

var bgPosition = function(element){
	var position = $(element).css('background-position').replace('px','').replace('px','').replace('%','').replace('%','').split(' ');
	
	return {x:parseInt(position[0]),y:parseInt(position[1])};
}

var bgSize = function(element){
	var size = $(element).css('background-size').replace('px','').replace('px','').replace('%');
}

// Last Index of ... functions (used for History functions)

var lastIndexOfObjProp = function(array,propname){
	var counter = 0;
	
	//iterate through array looking for an object with that property name
	for(var i = 0;i < array.length - 1;i++){
		if(typeof array[i][propname] !== 'undefined'){
			counter = i;
		}
	}
	
	// if no object with that property is found, return index of -1.
	if(counter == 0){
		return -1;
	}
	else{
		return counter; // return the last index in the array of an object with the given property
	}
};

var lastIndexOfRestoreType = function(array,type){
	var counter = -1; // init as a non-index number
	for(var i = 0;i < array.length;i++){
		if(typeof array[i].restoreType !== 'undefined' && array[i].restoreType === type){
			counter = i;
		}
	}

	// if found none of object.type that matched, return -1

	return counter;
};

// Resolving a date even if there isn't one on the db item:
// (useful for sorting without errors?)
var getDateAdded = function(item,assignIfNone = false){
	if(typeof item.date_added !== 'undefined' && item.date_added !== null){
		if(typeof item.date_added === 'string'){
			return parseInt(item.date_added);
		}
		else{
			var date = '';
			try{
				date = parseInt(item.date_added);
				return date;
			}
			catch(ex){
				log(ex);
			}
			finally{
				
			}
		}
	}
	else{
		// search for a reference item that DOES have a date
		if(searchForItemWithDate(imageDB.indexOf(item)) !== false){ // if the search succeeded:
			// copy the date of that item as a reference date for this unknown-date item
			var thatDate = parseInt(thatItem.date_added)+1;
			//assign thatDate to parameter item
			if(assignIfNone){
				item.date_added = thatDate;
			}
			return thatDate;
		}
		else{
			// if even the search for a reference item failed, just return a brand new time signature and, if desired, write it to the database item
			var newDateAdded = generateTimestamp();
			if(assignIfNone){
				item.date_added = newDateAdded;
			}
			return parseInt(newDateAdded);
			
		}
	}
}


// search for a db item that has a date and return that item
/*var searchForItemWithDate = function(startIndex){
	var found = false;
	for(var i = startIndex;found === false;i++){
		var thatItem = imageDB[i];
		if(thatItem.hasOwnProperty('date_added'){
			found = true;
			return thatItem;
		}
	}
	return false;
}*/
