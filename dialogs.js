// GENERIC DIALOGUE FUNCTIONS:
// generic ShowDialogue function (uses index to determine which dialogue - same as order of declaration on .html page)
var showDialogue = function(dialog_name){
	$('#dialogueParent').fadeIn(200); // this is the null parent object that creates the floating dialogues
	$('#dialogueParent').children().hide(); // hide all possible dialogues
	$('#dialogueParent').children('#'+dialog_name).show(); // show the selected dialgue inside the dialogue parent
};

// generic hide dialogue 
var hideDialogue = function(){
	$('#dialogueParent').hide();
};

$(function(){
// click outside dialogue closes it, too
	$('#dialogueParent').on('click',function(e){
		if(e.target === this){ // make sure the click is outside of the dialogue (which is on the parent)
			hideDialogue();
		}
	});
	$('.closeButton').on('click',function(){
		hideDialogue();
	});

});

// generate different types of export codes
var exportCode = function(exportType){
	var exportObject = $('<div></div>'); // initialize export object to add stuff to
	
	if(exportType == 'plain'){ // plain text 
		var current_item = false;
		for(var i = 0;i<collections.length;i++){
			exportObject.append(collections[i]+'</br>');
			for(var x = 0; x<DATABASE[i].length;x++){
				current_item = DATABASE[i][x];
				if(UpToDate(current_item)){
					exportObject.append('<p>'+current_item.url+'</p>');
				}
				else{
					exportObject.append('<p>'+current_item+'</p>');
				}
			}
		}
	}
	else if(exportType == 'html'){ // html
		$(collections).each(function(d,ditem){ // each collection
			exportObject.append('<h2>'+ditem+'</h2>'); // collection name
			$(DATABASE[d]).each(function(i,item){ // each item in the collection
				console.log((UpToDate(item) ? 'item is up to date. Item url is' + item.url : 'item is not up to date'))
				exportObject.append('<a href="' + (UpToDate(item) ? item.url : item) + '">'+ (item.caption ? item.caption : item) +'</a><p>');
			});
		});
	}
	else if(exportType == 'json'){ // json
		var jsonify = [];
		var items;
		
		$(DATABASE).each(function(i,item){
			
			items = [];
			$(item).each(function(x,xmen){
				items.push(xmen);
			});
			jsonify.push({
				name:collections[i],
				items:items
			});
		
		});
		exportObject.append(JSON.stringify(jsonify));
	}
	else if(exportType == 'Image Collection'){
		
	}
	else{
		console.log('invalid export type (internal)');
	}
	
	return exportObject;
	
};

// EXPORT Your Collections via Code copy and paste
var exportCollections = function(){
	showDialogue('d_Export');
	$('#exportCode').html(""); // wipes the 'code' textbox of the export dialogue then refills it 
	$('#exportCode').html(exportCode('plain'));
	$('#d_Export').focus(); // focus on the whole dialogue box 
};

// select an export type
$(function(){
	$('#selectExportType').bind('change',function(){
		var newExportCode = "";
		$('#exportCode').html("");
		if(this.selectedIndex === 0){
			newExportCode = exportCode('plain');
		}
		else if(this.selectedIndex === 1){
			newExportCode = exportCode('html');
		}
		else if(this.selectedIndex === 2){
			newExportCode = exportCode('json');
		}
		else if(this.selectedIndex === 3){
			newExportCode = exportCode('Image Collection');
		}
		else{
			newExportCode = "Error generating export code: invalid export type";
		}
		
		$('#exportCode').html(newExportCode);
		var html = document.getElementById("exportCode").innerHTML;
		html = html.replace(/\s{2,}/g, '')   // <-- Replace all consecutive spaces, 2+
				   .replace(/%/g, '%25')     // <-- Escape %
				   .replace(/&/g, '%26')     // <-- Escape &
				   .replace(/#/g, '%23')     // <-- Escape #
				   .replace(/"/g, '%22')     // <-- Escape "
				   .replace(/'/g, '%27');    // <-- Escape ' (to be 100% safe)
		var dataURL = 'data:text/html;charset=UTF-8,' + html;
		var openbutton = $('<button></button>');
		openbutton.html('open in full page')
		.click(function(){
			document.location = dataURL;
		});
		$('#exportCode').prepend(openbutton);
	});
});

// EDIT the CAPTION of an image
var editImageCaption = function(){
	showDialogue('d_EditCaption');
	
	var text_edit = $('#txtEditCaption');
	var thumbnail = $('#editCaptionThumbnail');
	
	thumbnail.css({height:"300px"});
	
	$('#txtEditCaption').val(''); // clear the textarea value for the caption then
	if(UpToDate(imageDB[selected_index]) === false){
		text_edit.val(imageDB[selected_index]); // supports depracated DB style with just urls 
		thumbnail.attr('src',imageDB[selected_index]); // set the thumbnail src
	}
	else{
		text_edit.val(imageDB[selected_index].caption); // uses the new database style with url: & caption:
		thumbnail.attr('src',imageDB[selected_index].url); // set thumbnail's src
	}
	text_edit.focus();
	text_edit.select();
};

// RENAME current collection
var renameCollection=function(){
	showDialogue('d_RenameCollection'); // Rename collection dialogue
	var txtbx = $('#txtRenameCollection');
	txtbx.val(collections[dbIndex]); // set the textbox to the current collection name
	txtbx.focus();
	txtbx.select();
	
};

var parseNewCollectionName = function(new_name){
	if(new_name!=null&&new_name!=""){
		collections[dbIndex]=new_name;
		localStorage.setItem("collection_names",JSON.stringify(collections));
		popDropdown();
	}
	else{
		alert("Invalid name for a collection!");
	}
};

var help_content = "";
$(function(){
	$.get('https://dl.dropboxusercontent.com/u/4138891/imagecollection/help.html',function(data){
		help_content = $('<div></div>').html(data);
		log('help content loaded:'+help_content.html());
	});
});

var selectHelpIndexItem = function(index){
	var container = $('#helpContent');
	var help_index_content = "";
	var subtitle = $('#help_subtitle');
	
	$('.helpIndexItem').removeClass('helpItemClicked');
	$('.helpIndexItem').eq(index).addClass('helpItemClicked');
	switch(index){
		case 0: // start
			help_index_content = help_content.find('#start');
			break;
		case 1: // videos
			help_index_content = help_content.find('#videos');
			break;
		case 2:
			help_index_content = help_content.find('#collections');
			break;
		case 3: // slideshow
			help_index_content = help_content.find('#slideshow');
			break;
		case 4: // slideshow
			help_index_content = help_content.find('#export');
			break;
		default: // start
			log('help index failed');
			break;
		
	}
	
	
	container.html(help_index_content.html()); // change the help content to the specific loaded index content
}

var helpDialogue = function(){
	// bind click event for all help items
	$('.helpIndexItem').click(function(){
		selectHelpIndexItem(parseInt($(this).attr('id').replace('help_index_',''))); // derive index from the id of a help item
	});
	// click the start item by default
	$('.helpIndexItem').eq(0).click();
};

$(function(){
	$('.okbutton').click(function(){
		hideDialogue();
	});
	
	$("#txtEditCaption").on("keydown",function(e){
			if(e.which === 13 && !e.shiftKey){
				$('#btnOK_Edit').click();
			}
			
	});
	
	// when you hit the OK button, save the caption
	$('#btnOK_Edit').on('click',function(){
		var new_caption = $('#txtEditCaption').val();
		var old_caption = "";
		hideDialogue();
		if(new_caption !== "" && new_caption !== null){
			if(!UpToDate(imageDB[selected_index])){
				//forces new Database style on old depracated objects:
				if(imageDB[selected_index]!== new_caption)
				{
					old_caption = imageDB[selected_index];
					if(new_caption !== ""){
						
						// updates object to new style with .caption property:
						imageDB[selected_index] = {'url':imageDB[selected_index],'caption':new_caption};
					}
					else{
						// if input was blank, set the caption to URL
						imageDB[selected_index] = {'url':imageDB[selected_index],'caption':imageDB[selected_index]};
					}
					notify("Image caption changed","neutral");
				}
			}
			else{
				if(imageDB[selected_index].caption !== new_caption)
				{
					old_caption = imageDB[selected_index].caption;
					if(new_caption !== ""){
						imageDB[selected_index].caption = new_caption; // uses the new database style with url: & caption:
						
					}
					else{
						imageDB[selected_index].caption = imageDB[selected_index].url;
					}
					notify("Image caption changed","neutral");
				}
			}
		
		// store old caption in _history:
		_history.push({restoreType:'caption',index:selected_index,caption:old_caption});
		
		applyChanges();
		List();
		}
	});
	
	
	$("#txtRenameCollection").on("keydown",function(e){
		if(e.which === 13){
			$('#btnOK_RenameCollection').click();
		}
	});
	
	$('#btnOK_RenameCollection').click(function(){
		var new_name = $('#txtRenameCollection').val();
		var old_name = collections[dbIndex];
		// change collection name only if new name is a an actual name and not the old name
		if(new_name !== "" && new_name !== null && new_name !== old_name){
			collections[dbIndex] = new_name;
			localStorage.setItem("collection_names",JSON.stringify(collections));
			popDropdown();
			changeCollection(dbIndex);
			
			//notification
			notify('Renamed "' + old_name + '" to "' + new_name + '"',"good");
			// store old collection name in _history
			_history.push({restoreType:"collection_name",collection_index:dbIndex,name:old_name});
		}
		hideDialogue();
	});
	
	// magically resize Edit Caption thumbnail img
	$('#editCaptionThumbnail').on('load',function(){
		var image = $(this);
		var maxHeight = parseInt(image.parent().css("maxHeight").replace("px",""));
		console.log("maxHeight is"+maxHeight);
		var curheight = image.height();
		
		if(curheight > maxHeight){
			/*while(curheight> maxHeight){*/
				image.css({"height":curheight-(curheight-maxHeight)});
			//}
		}
		
		var curwidth = image.width();
		var parentWidth = image.parent().parent().width() - 100;
		
		
		if(curwidth > parentWidth){
			var newwidth = curwidth - (curwidth - parentWidth)
			var ratio = (curwidth - parentWidth) / curwidth;
			console.log("The ratio is "+ratio);
			image.css({"height":image.height() - image.height() * ratio});
		
		}
	
	});
});


	