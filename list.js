//DELETE AN IMAGE
var Delete = function(){
	
	//alert(selected_index);
		//alert($(this).attr("id"));
		
		//FOR UNDO add item to list of deleted items FOR UNDO:
			var new_deleted = {
					restoreType:"deleted_image",
					index:dbIndex,
					indexOfImage:selected_index,
					imageURL:imageDB[selected_index]
				// value:[which collection,the index of the image in the collection,the src url of the image]
			};
			_history.push(new_deleted);
		//
		if(audio_playing_index>=0){
			if(selected_index<audio_playing_index){
				audio_playing_index-=1;
			}
			else if(selected_index===audio_playing_index){
				audio_playing_index=-1;
			}
		}
		//remove the item
		imageDB.splice(selected_index,1);
		
		applyChanges();
		List();
		
		notify("Image deleted","warning");
};

//POPULATE the Dropdown of Collections
var popDropdown = function(){
	

		$("#dropdown").html("");
		for(var c in collections){
				$("#dropdown").append("<option>"+collections[c]+"</option>");
			
		}
		$("#dropdown").append("<option>new collection...</option>");
		
		document.getElementById("dropdown").selectedIndex=dbIndex;
};

var List = function(){
	// Populate images

	$("#imageList").html("");
	
	// generate the columns for laying out the images
	for(var i=0;i < no_of_columns;i++){
			$('#imageList').append('<div class="column" id="col'+i+'"></div>');
	}
	
	var current_column = 0; // the column to populate. iterate through the four
	for(var i = imageDB.length - 1;i > -1;i--){			
		
		var element = processURL(i);
		// Finally, LAYOUT the images and videos in the view // 
		// Give image and corresponding controls the same id for easy access:
		$("#imageList").children().eq(current_column).append("<div class='imageBox' id='box"+i+"'>"
				+ element // the image or video
			
				+ /*mute/unmute button*/(element.indexOf("<video")>=0 && element.indexOf(".gifv")===-1 ? "<button class='btnUnmute' id='unmute"+i+"'>&#128266;</button>" : "") 
				+ /*delete button*/ "<button class='btnDelete' id='delete"+i+"'>x</button>"
				+"<div class='caption'><span class='captionText'>" + processCaption(imageDB[i])+"</span>"
				+"<button class='rounded btnEditCaption'>edit</button></div>" // add edit button to image caption
				+"</div>"); // end the imageBox div
		
		//alert($('.column').attr('id'));
		// iterate to the next column
		if(current_column < no_of_columns - 1){
			current_column++;
		}
		else{
			current_column = 0;
		}
	}
	
	// Put bindings on all elements after calling List():
	
	// unmute the previously unmuted video if any
	if(audio_playing_index>=0){
		var unmuteVideo = document.getElementById(audio_playing_index);
		$(unmuteVideo).prop('muted',false);
	}
		
	// mouseenter / mouseleave imageBox binds for fading captions
	$('.imageBox').bind('mouseenter',function(e){
		console.log("mouseenter");
			$(this).children('.caption').show();
	});
	
	$('.imageBox').bind('mouseleave',function(e){
		$(this).children('.caption').fadeOut(100);
	});

	// bind delete buttons events
	$(".btnDelete").bind("click",function(){
		selected_index = parseInt($(this).attr("id").replace("delete",""));
		Delete();
	});
	
	// Unmute button click binds
	$(".btnUnmute").bind("click",function(){
		var index = parseInt($(this).attr("id").replace("unmute",""));
		var video = document.getElementById(index);
		if(video.muted){
			muteAll();
			video.muted=false;
			$(this).addClass("soundOn");
			audio_playing_index=index;
		}
		else{
			
			video.muted=true;
			$(this).removeClass("soundOn");
			audio_playing_index=-1;
		}
	});
	
	// Edit caption button binds
	$(".btnEditCaption").bind("click",function(){
		console.log($(this).parent());
		selected_index = parseInt($(this).closest('.imageBox').attr("id").replace("box","")); // gets the image's index for editing
		editImageCaption();
	});
	
	//DOUBLE CLICK IMAGE binds -- fullscreen 
	$("img").bind("dblclick",function(){
		selected_index = parseInt($(this).attr("id")); // this is so we can display a notification
		fullscreenImage(this);
	});
	$("video").bind("dblclick",function(){
		selected_index = parseInt($(this).attr("id"));
		fullscreenVideo(this);			
	});
	
	$('video').bind('click',function(e){
		if(e.button===0){
			if(!this.paused){
				this.pause();
			}
			else{
				this.play();
			}
		}
	});
};