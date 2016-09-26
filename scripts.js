// Console.log() shortcut function:
var log = function(message){
		console.log(message);
};

var generateTimestamp = function(){
	var dateString = "";
	var dateObj = new Date();
	var year = dateObj.getUTCFullYear();
	var month = dateObj.getUTCMonth();
	var day = dateObj.getUTCDate();
	var hour = dateObj.getUTCHours();
	var minute = dateObj.getUTCMinutes();
	var second = dateObj.getUTCSeconds();
	var milli = dateObj.getUTCMilliseconds();
	
	dateString = year.toString()
				+(month < 10 ? "0" + month.toString() : month.toString())
				+(day < 10 ? "0" + day.toString() : day.toString())
				+(hour < 10 ? "0" + hour.toString() : hour.toString())
				+(minute < 10 ? "0" + minute.toString() : minute.toString())
				+(second < 10 ? "0" + second.toString() : second.toString())
				+(milli < 100 ? (milli >= 10 ? "0" : "00") + milli.toString() : milli.toString());
				
	log('timestamp generated: ' + dateString);
	
	return dateString;
};

var updateUIColor = function(){
	var opacity = 0.6;
	if(typeof imageDB.UIColor === 'string' && imageDB.UIColor !== 'none'){
		
		var toarray = rgbStringToArray(imageDB.UIColor); // turn rgbstring into array of ints
		var averageVal = (toarray[0] + toarray[1] + toarray[2]) / 3; // average 'brightness' of all values
		var valueThresh = 150;
		// calculate a new opacity based on how bright the color is.
		// brighter gets more transparent
		//opacity = ((averageVal<40?averageVal+200:(averageVal>valueThresh?averageVal-40:averageVal)) / 255);
		var colorWithAlpha = applyOpacityToUIColor(imageDB.UIColor,opacity);
		$('#navbar-top,.collectionFooter').css('background-color',colorWithAlpha);
		
		
		if( averageVal > valueThresh){
			updateFontTheme('dark');
			var darkenedColor = darkenColorArray(rgbStringToArray(imageDB.UIColor),0.5,'string');
			$('.rounded.superButton').css('background-color',darkenedColor);
		}
		else{
			updateFontTheme();
		}
		
	}
	else{
		$('#navbar-top,.collectionFooter').css('background-color','');
		updateFontTheme();
	}
}

var updateFontTheme = function(lightOrDark = 'light'){
	if(lightOrDark === 'dark'){
		$('.collectionItem').css('color','black');
		$('.collection-title-bottom').css({color:'black',textShadow:'none',fontWeight:'bold'});
		$('.superButton').css('color','black');
		$('.collectionCounter').css('color','dimgray');
	}
	else{ // anything else
		$('.collectionItem').css('color','');
		$('.collection-title-bottom').css({color:'',textShadow:'',fontWeight:''});
		$('.rounded.superButton').css('background-color','');
		$('.superButton').css('color','');
		$('.collectionCounter').css('color','');
	}
}

// ONLY USE ON OLD DATABASES!
var MigrateDB = function(){
	
	var newDB = new Object();
	
	// basically a navbar-top database containing ALL the 
	// user's *libraries* of *collections* of *items*,
	// some of which could be *albums* of MORE *items*
	newDB.id = 0;
	newDB.libraries = [{
		name:'default',date_created:generateTimestamp(),collections:[]
	}]; // an array with 1 library to fill with all the current user collections
	newDB.date_created = generateTimestamp();
	
	// collections is a global
	$(collections).each(function(cindex,cname){
		
		var newCollection = new Object();
		newCollection.name = cname;
		newCollection.date_created = generateTimestamp();
		newCollection.items = []; // initialize an empty array to then be filled in the following loop
		
		// iterate through the all the items in all the collections and add them to
		// the newly-styled collection
		
		$(DATABASE.libraries[libraryIndex].collections[cindex]).each(function(i,item){
			// shorthand the uptodate item function
			var uptodate = UpToDate(item);
			
			var newItem = new Object();
			
			// determine the item type:
			// item is up to date? has a url? use that. no? then the item *is* the url string.
			// determine the item type from that using getURLType
			newItem.type = uptodate ? (item.url ? getURLType(item.url) : getURLType(item)) : getURLType(item);
			newItem.url = getURL(item);
			newItem.date_added = generateTimestamp();
			newItem.caption = getCaption(item);
			
			
			// push the new style of item to the new library/collection style of database
			newCollection.items.push(newItem);
		});
		
		// push new-style collection to new libraries db
		newDB.libraries[0].collections.push(newCollection);
	});
	
	localStorage.setItem('database'+newDB.id,JSON.stringify(newDB));
	alert('database successfully upgraded!');
}

$(document).ready(function(){
	
/* INITIALIZATION */

	// Initial functions:
	// Focus on the TEXT input when the page opens
	$("#txtInput").focus();
	$(".collection-title-bottom").html(DATABASE.libraries[libraryIndex].collections[collectionIndex].name);
	$('#dialogueParent').hide(); // Hide the export dialogue box
	
/* DONE INITIALIZING */
	$('#btnHelp').click(function(){
		showDialogue('d_Help');
		helpDialogue();
	});
	
	$('#btnSettings').click(function(){
		showDialogue('d_Settings');
		settingsDialogue();
	});
	
	// click on the 'Export' button runs the exportCollections function
	$('#btnExport').on('click',function(){
		exportCollections();
	});	
	
	var openDialogRenameCollection = function(){
		showDialogue('d_EditCollection'); // Rename collection dialogue
		$('#d_EditCollection #dialogue_title').html('Edit "'+imageDB.name+'"');
		var txtbx = $('#txtRenameCollection');
		txtbx.val(collections[collectionIndex].name); // set the textbox to the current collection name
		txtbx.focus();
		txtbx.select();
		
		// color options enum
		var colorPalette = [
			'000000',
			'ffffff',
			'cc3333',
			'ff6600',
			'ff9900',
			'ffcc00',
			'ffff33',
			'99ff33',
			'339933',
			'00ff66',
			'0099ff', //blue
			'0066ff', //deepblue
			'9900ff', //purple
			'cc66ff',//lightpurple
			'ff33ff',
			'ff0099',//hotpink
			'ff3333',//soft red 
		];
		// generate colors
		var container = $('.contain-color-options');
		var preview = $('.color-preview');
		if(typeof imageDB.UIColor === 'string'){
			preview.css('background-color',imageDB.UIColor);
			preview.attr('data-color',imageDB.UIColor);
		}
		else{
			preview.css('background-color','');
			preview.attr('data-color','none');
		}
	
		
		container.html('');
		for(var c in colorPalette){
			var color = colorPalette[c];
			var colorbox = $('<div></div>');
			colorbox.addClass('color-option');
			colorbox.css('background-color','#'+color);
			container.append(colorbox);
		}
		container.append('<div id="no-color" class="color-option"></div>')
		
		$('.color-option').on('click',function(){
			if($(this).is('#no-color')){
				preview.css('background-color','');
				preview.attr('data-color','none');
				return true;
			}
			preview.css('background-color',$(this).css('background-color'));
			preview.attr('data-color',$(this).css('background-color'));
		});
		
	}
	
	$("#btnRenameCollection").bind("click",function(){
		
		openDialogRenameCollection();
		
	});
	
	$('#btnEditCollection').on('click',function(){
		openDialogRenameCollection();
	});
	
	$('.collection-title-bottom').on('click',function(){
		scrollToTop();
	});

	
	$("#btnDeleteCollection").on("click",function(){
		deleteCollection();
		
	});
	
	/* CALLED AT THE BEGINNING OF PROGRAM>>>>>>>>>>>>>>>>>>>>>>>>>>> */ 
	List(true);
	popDropdown();
	popLibrariesDropdown();
	popHistoryDropdown();
	changeLibrary(lastVisited.library);
	
// MENU BAR BUTTON FUNCTIONS		
		
// ADD AN IMAGE to the current collection
	var Add = function(){
		
		var text = $("#txtInput").val(); // Only go through with it if there's text in the textbox
		
		if(text!=null&&text!=""){
			var url,
				caption; // in case a caption is included in-line
			
			// decide if there's a caption after a " " in the text
			if(text.indexOf(' ') > -1){
				url = text.slice(0,text.indexOf(' ')); // the url is the first part
				caption = text.slice(text.indexOf(' ')+1);
			}
			else{
				url = text;
				caption = text;
			}
			
			if(validImageCheck()){ // is there actually an image at this url?
				imageDB.items.push({"url":url,"caption":caption,"type":getURLType(url),"date_added":generateTimestamp()});
				//applyChanges();
				List();
				/*pushHistoryItem({
					restoreType:"added_image",
					index:collectionIndex,
				
				});*///Adding image no long a history item
			
				notify('"'+text+'" added.','good');
				
				// changeDynamicColor
				
				popDropdown();
				setTimeout(dynamicColorBars,5000);
			}
			else{
				alert("Cannot find image at that URL! :( ");
			}
		}
		
	};
		
	$("#btnSubmit").on("click",function(){
		Add();
	});
	
	$("#btnUndo").on("click",function(){
		Undo();
	});
	
	$('.toggleButton').on('click',function(){
		log('toggleButton pressed');
		if(!$(this).hasClass('pressed')){
			$(this).addClass('pressed');

		}
		else{
			$(this).removeClass('pressed');
		}
	});
	
	var collectionsButtonClicked = false;
	var slidespeed = 50;
	
	
	
	$('#btnCollections').on('click',function(){
		toggleCollections();
	});
	
	$('#collectionsContainer').hide();
	selectCollectionItem(collectionIndex);
	
	updateUIColor();
	
// KEYDOWN/PRESS Event Handlers
	// Capture "ENTER" key for textbox (alt entering method to the submit button)
	$("#txtInput").on("keydown",function(e){
		if(e.which === 13){
			Add();
			$("#txtInput").val("");
		}
		
	});
	
	//ESC key
	$(document).on('keyup',function(e){
		if(e.which===27){
			$('#dialogueParent').hide();
		}
	});
		
	// Catch CTRL+Z
	$(document).on("keydown",function(e){
		
		if( e.which === 90 && e.ctrlKey ){ // Ctrl Z // 
			Undo();
		}
	});
	

	$(window).on('resize',function(e){
		$('#collectionsContainer').width(window.innerWidth);
		$('#navbar-top').width(window.innerWidth);
	}).on('load',function(){
		$('#collectionsContainer').width(window.innerWidth);
		$('#navbar-top').width(window.innerWidth);
	});
});
