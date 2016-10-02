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

var extEnumVideo = ['gifv','webm','mp4','avi','mpeg'];
var extEnumImage = ['jpg','jpeg','bmp','tif','gif','png'];

// used for evaluating input in realtime to make a 'smart' submit type
var isURL = function(string){
	string = string.toLowerCase();
	if(string.includes('youtube.com/watch?v=')){
		return true;
	}
	for(var x in extEnumImage){
			var ext = extEnumImage[x];
			if(string.includes('.'+ext)){
				return true;
			}
	}
	for(var x in extEnumVideo){
		var ext = extEnumVideo[x];
		if(string.includes('.'+ext)){
			return true;
		}
	}
	return false;
}

var getURLType = function(url,assumeImage = true){
	var typeString = "";
	if(!url.includes('youtube.com/watch?v=')){
		for(var x in extEnumImage){
			var ext = extEnumImage[x];
			if(url.includes('.'+ext)){
				return 'image';
			}
		}
		for(var x in extEnumVideo){
			var ext = extEnumVideo[x];
			if(url.includes('.'+ext)){
				return 'video';
			}
		}
	}
	else{
		return 'youtube';
	}
}

var processURL = function(i){

	/* for(var i = 0;i<imageDB.items.length;i++){ */
	var img = "";
	var itemClass = 'class="media-item"';
	
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
	var type = getURLType(img);
	var extension = img.substr(img.lastIndexOf('.')+1);
	if(type === 'image'){
		element = "<img "+itemClass+"data-index='"+i+"' src='"+img+"'/>"; // placeholder img element with no source
	}
	else if(type === 'video'){
		element = "<video "+itemClass+" autoplay loop data-index='"+i+"' src='"+img+"'></video>";
	}
	else if(type === 'youtube'){
		var youtubeVidId = img.slice(img.lastIndexOf('=')+1);
		console.log('youtube video: ',youtubeVidId);
		element = '<iframe '+itemClass+' data-index="'+i+'" width="853" height="480" src="https://www.youtube.com/embed/'+youtubeVidId+'?rel=0&amp;controls=0&amp;showinfo=0" frameborder="0" allowfullscreen></iframe>';
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

var getItemDateGeneric = function(item){
	if(item !== null){
		var date = false;
		if(typeof item.date_created === 'string'){
			date =  item.date_created;
		}
		else if(typeof item.date_added === 'string'){
			date = item.date_added;
		}
		else if(typeof item.date === 'string'){
			date = item.date;
		}
		else{
			log('could not resolve date for ',item);
		}
	}
	return date;
	
}

var sortGeneric = function(items,sortType){
	var sortArray = [];
	var sort = sortType;
	
	// push relevant info for each item to the sort array
	for(var i in items){
		var item = items[i];
		
		// set the sortArray item if properties are applicable to what we're sorting
		// (collections, images, etc.)
		sortArray.push({
			index:i,
			name:typeof item.name === 'string'?item.name:null,
			date:getItemDateGeneric(item)!==false?getItemDateGeneric(item):generateTimestamp(),
			item_count:typeof item.items !== 'undefined'?item.items.length:null
		});
	}
	
	switch(sort){
		case 'date_oldnew':
			sortArray.sort(function(a,b){
				var date1 = a.date,
					date2 = b.date;
				return date1 < date2 ? -1 : date1 > date2 ? 1 : (a.index < b.index ? -1 : a.index > b.index? 1 : 0);
			});
			break;
		case 'date_newold':
			sortArray.sort(function(a,b){
				var date1 = a.date,
					date2 = b.date;
				return date1 > date2 ? -1 : date1 < date2 ? 1 : (a.index < b.index ? -1 : a.index > b.index? 1 :0);
			});
			break;
		case 'alpha_az':
			sortArray.sort(function(a,b){
				var name1 = a.name.toUpperCase(),
					name2 = b.name.toUpperCase();
				return name1 < name2 ? -1 : (name1 > name2 ? 1 : 0);
			});
			break;
		case 'alpha_za':
			sortArray.sort(function(a,b){
				var name1 = a.name.toUpperCase(),
					name2 = b.name.toUpperCase();
				return name1 > name2 ? -1 : name1 < name2 ? 1 : 0;
			});
			break;
		case 'itemcount_shortlong':
			sortArray.sort(function(a,b){
				var count1 = a.item_count,
					count2 = b.item_count;
				return count1 < count2 ? -1 : count1 > count2 ? 1 : 0;
			});
			break;
		case 'itemcount_longshort':
			sortArray.sort(function(a,b){
				var count1 = a.item_count,
					count2 = b.item_count;
				return count1 > count2 ? -1 : count1 < count2 ? 1 : 0;
			});
			break;
		default:
			sortArray.sort(function(a,b){
				var date1 = a.date,
					date2 = b.date;
				return date1 < date2 ? -1 : date1 > date2 ? 1 : 0;
			});
			break;
	}
	
	return sortArray;
}

var applyOpacityToUIColor = function(colorstring,opacity){
	return colorstring.replace('rgb','rgba').replace(')',','+opacity+')');
}

var rgbStringToArray = function(rgbstring){
	var array = rgbstring.replace(' ','').replace('rgb(','').replace(')','').split(',');
	for(var s in array){
		array[s] = parseInt(array[s]);
	}
	return array;
}

var darkenColorArray = function(colorArray,decimal,returnType = 'array'){
	var copy = colorArray.slice(0);
	for(var v in copy){
		copy[v] = copy[v]*decimal;
	}
	if(returnType === 'string'){
		return rgbArrayToString(copy);
	}
	else{
		return copy;
	}
}

var rgbArrayToString = function(array,alpha = false){
	if(alpha !== false){
		return 'rgba('+array[0]+','+array[1]+','+array[2]+','+alpha+')';
	}
	else{
		return 'rgb('+array[0]+','+array[1]+','+array[2]+')';
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
