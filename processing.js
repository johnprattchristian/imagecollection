// Checks for Depracated database objects that only have a [url] instead of [{url:"",...}]
var UpToDate = function(db_object_to_check){ 
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
};

var processURL = function(i){

	/* for(var i = 0;i<imageDB.length;i++){ */
	var img = "";
	
	if(typeof imageDB[i] === 'string'){ // is it the depracated database style
		img = imageDB[i] ? imageDB[i] : ""; // is there something actually there at that place in the database? No? Then just put ""
	}
	else if(typeof imageDB[i] === 'object'){ // or the updated one with .properties?
		img = imageDB[i].url;
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
		return item.caption;
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