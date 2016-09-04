// Console.log() shortcut function:
var log = function(message){
		console.log(message);
};

var generateTimestamp(){
	var dateString = "";
	var year = dateObj.getUTCFullYear();
	var month = dateObj.getUTCMonth();
	var day = dateObj.getUTCDate();
	var hour = dateObj.getHours();
	var minute = dateObj.getMinutes();
	var second = dateObj.getSeconds();
	
	dateString = year.toString()
				+(month < 10 ? "0" + month.toString() : month.toString())
				+(day < 10 ? "0" + day.toString() : day.toString());
				+(hour < 10 ? "0" + hour.toString() : hour.toString());
				+(minute < 10 ? "0" + minute.toString() : minute.toString());
				+(second < 10 ? "0" + second.toString() : second.toString());
				
	log('timestamp generated: ' + dateString);
	
	return dateString;
}

var MigrateDB = function(){
	var newDB;
	var dateObj = new Date();
	
	// get a timestamp for collections
	var timestamp = generateTimestamp();
	
	newDB.libraries = [{name:'default',collections:[]];
	
	// the new collections located in libraries:
	var newCollections = newDB.libraries[0].collections;
	
	
	// collections is a global
	$(collections).each(function(collection_index,collection_name){
		// push each collection to the new collection model
		newCollections.push(
			// the new-style object for collections
			{
				name:collection_name, // set the new collection object name = collection item (which is just the namestring)
				items:[], // items are images, videos, or albums of images and videos (expand to text entries?)
				date_created:timestamp
			}
		)
		
		$(imageDB).each(function(i,item){
			// shorthand the uptodate item function
			var uptodate = UpToDate(item);
			
			var newItem;
			
			// determine the item type:
			// item is up to date? has a url? use that. no? then the item *is* the url string.
			// determine the item type from that using getURLType
			newItem.type = uptodate ? (item.url ? getURLType(item.url) : getURLType(item)) : getURLType(item);
			newItem.url = getURL(item);
			newItem.date_added = generateTimestamp();
			
			
			// push the new style of item to the new library/collection style of database
			newCollections[newCollections.length - 1].items.push(newItem);
		});
		
	});
}

$(document).ready(function(){
	
/* INITIALIZATION */

	// Initial functions:
	// Focus on the TEXT input when the page opens
	$("#txtInput").focus();
	$("#collectionTitleSpan").html(collections[dbIndex]);
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
		showDialogue('d_RenameCollection'); // Rename collection dialogue
		var txtbx = $('#txtRenameCollection');
		txtbx.val(collections[dbIndex]); // set the textbox to the current collection name
		txtbx.focus();
		txtbx.select();
	}
	
	$("#btnRenameCollection").bind("click",function(){
		
		openDialogRenameCollection();
		
	});
	
	$('#btnEditCollection').on('click',function(){
		openDialogRenameCollection();
	});
	
	$('#collectionTitleSpan').on('click',function(){
		scrollToTop();
	});

	
	$("#btnDeleteCollection").on("click",function(){
		deleteCollection();
		
	});
	
	/* CALLED AT THE BEGINNING OF PROGRAM>>>>>>>>>>>>>>>>>>>>>>>>>>> */ 
	List(true);
	popDropdown();
	
	
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
				imageDB.push({"url":url,"caption":caption});
				applyChanges();
				List();
				_history.push({
					restoreType:"added_image",
					index:dbIndex,
				
				});
			
				notify('"'+text+'" added.','good');
				
				// changeDynamicColor
				
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
	
	var collectionsButtonClicked = false;
	var slidespeed = 50;
	
	
	
	$('#btnCollections').on('click',function(){
		toggleCollections();
	});
	
	$('#collectionsContainer').hide();
	selectCollectionItem(dbIndex);
	
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
	

	
});
