// Console.log() shortcut function:
var log = function(message){
		console.log(message);
};

$(document).ready(function(){
	
/* INITIALIZATION */

	// Initial functions:
	// Focus on the TEXT input when the page opens
	$("#txtInput").focus();
	$("#collectionFooter").text(collections[dbIndex]);
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
	
// SELECT CHANGED from the collections dropdown 
	$("#dropdown").bind("change",function(){
		if(this.selectedIndex==this.length-1){
			newCollection(); // create a new one
			
		}
		else{
			// Select an already-made collection
			//alert(this.selectedIndex);
			changeCollection(this.selectedIndex);
			
		}
		
	});
	
	$("#btnRenameCollection").bind("click",function(){
		
		renameCollection();
		
	});
		

// DELETE a collection
	var deleteCollection=function(){
		var really = confirm("Are you sure you want to delete '"+collections[dbIndex]+"'?");
			if (collections.length>1&&dbIndex!=0){
				if(really){
					var new_deleted = {
						restoreType:"deleted_collection",
						index:dbIndex,
						collectionName:collections[dbIndex],
						collectionContent:imageDB
					};
					_history.push(new_deleted); // push the new _history state for undo
					DATABASE.splice(dbIndex,1); //delete the collection from DATABASE
					collections.splice(dbIndex,1); // remove its name from collection_names
					localStorage.setItem("collection_names",JSON.stringify(collections));
					localStorage.setItem("imageDB",JSON.stringify(DATABASE));
					changeCollection(dbIndex-1); // Now that this doesn't exist, go back 1 collection 
					popDropdown(); // refresh the dropdown of collections
					
					setTimeout(notify('"' + new_deleted.collectionName + '" deleted',"warning"),100);
					return;
					
					
				}
				else{
					return;
				}
			}
			else{
				alert("Cannot delete the Default collection!"); // this is to preserve the indexing of collections
			}
	};
	
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
	var slidespeed = 100;
	
	$('#btnCollections').on('click',function(){
		if(collectionsButtonClicked==false){
			$(this).css({backgroundColor:'gray'});
			$('#collectionsContainer').slideDown(slidespeed);
			collectionsButtonClicked = true;
		}
		else{
			$(this).css({backgroundColor:'black'});
			$('#collectionsContainer').slideUp(slidespeed);
			collectionsButtonClicked = false;
		}
	});
	
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

