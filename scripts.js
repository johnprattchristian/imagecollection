// Console.log() shortcut function:
var log = function(message){
		console.log(message);
};

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
			if(validImageCheck()){ // is there actually an image at this url?
				imageDB.push({"url":text,"caption":text});
				applyChanges();
				List();
				_history.push({
					restoreType:"added_image",
					index:dbIndex,
				
				});
			
				notify('"'+text+'" added.','good');
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
