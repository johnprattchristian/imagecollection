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

// EXPORT Your Collections via Code copy and paste
var exportCollections = function(){
	showDialogue('d_Export');
	$('#exportCode').html(""); // wipes the 'code' textbox of the export dialogue then refills it 
	var current_item = false;
	for(var i = 0;i<collections.length;i++){
		$('#exportCode').append('<h2>'+collections[i]+'</h2>');
		for(var x = 0; x<DATABASE[i].length;x++){
			current_item = DATABASE[i][x];
			if(UpToDate(current_item)){
				$('#exportCode').append('<p>'+current_item.url+'</p>');
			}
			else{
				$('#exportCode').append('<p>'+current_item+'</p>');
			}
		}
	}
	$('#d_Export').focus(); // focus on the whole dialogue box 
};
// select an export type
$(function(){
	$('#selectExportType').bind('change',function(){
		if(this.selectedIndex===1){
			var jsonify = [];
			var items;
			$('#exportCode').html("");
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
			$('#exportCode').append(JSON.stringify(jsonify));
		}
		else{
			$('#exportCode').html("");
			for(var i = 0;i < collections.length-1;i++){
				$('#exportCode').append('<h2>'+collections[i]+'</h2>');
				for(var x = 0; x<DATABASE[i].length-1;x++){
					$('#exportCode').append('<p>'+DATABASE[i][x]+'</p>');
				}
			}
		}
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
	
	$('.helpIndexItem').removeClass('helpItemClicked');
	$('.helpIndexItem').eq(index).addClass('helpItemClicked');
	switch(index){
		case 0: // start
			help_index_content = help_content.find('#start').html();
			console.log(help_content.find('#start').html());
			break;
		case 1:
			help_index_content = help_content.find('#collections').html();
			break;
		default: // start
			log('help index failed');
			break;
		
	}
	container.html(help_index_content);
}

var helpDialogue = function(){
	$('.helpIndexItem').click(function(){
		selectHelpIndexItem(parseInt($(this).attr('id').replace('help_index_',''))); // derive index from the id of a help item
	});
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


	