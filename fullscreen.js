var iterating = false; // decide if iterating the slideshow or just jumping into fullscreen

// function to test if fullscreen
var Fullscreen = function(){
	
		if($('#FullScreenView').width() === screen.width){
			return true;
		}
	
		return false;
}

// removes video and img elements in the fullscreenView parent element, so as to retain the #fullscreenNotifications
var removeFullScreenChildren = function(){
	$('#FullScreenView').css({backgroundImage:'none'});
	$('#FullScreenView video').remove();
	$('#FullScreenView img').remove();
};

var goFullscreen = function(){
	var element = document.getElementById('FullScreenView');

	
	if(element.requestFullscreen) {
		element.requestFullscreen();
	  } else if(element.mozRequestFullScreen) {
		element.mozRequestFullScreen();
	  } else if(element.webkitRequestFullscreen) {
		element.webkitRequestFullscreen();
	  } else if(element.msRequestFullscreen) {
		element.msRequestFullscreen();
	  }
	 

	$('#FullScreenView').css('visibility','visible');
};
	
var fullscreenImage = function(img){
	currentFSElement = img; // this is for other functions to know on the first time using currentFSElement
	removeFullScreenChildren();
	var element = document.getElementById("FullScreenView");
	//element.style.visibility="visible";
	element.style.backgroundImage='url('+img.getAttribute("src")+')';
	$(element).css("background-color","black");
	if (Fullscreen() == false) { // not already fullscreen, right?
	
		goFullscreen();
		
		$('.Notifications').hide();
		if(getSetting('fullscreenCaptions').value === true){
			notify(imageDB[selected_index].caption);
		}
	}
	
};

var fullscreenVideo = function(vid){
	currentFSElement = vid; // this is just to initiate the currentFSElement
	muteAll(); // mute any videos playing outside of fullscreen
	var fsParent = $('#FullScreenView');
	var vidClone = $(vid).clone(true,false);
	vidClone.off()
	.prop('currentTime',0)
	.attr('id','') // remove the duplicate id'
	.prop('muted',false)
	.prop('volume',global_volume)
	removeFullScreenChildren(); // resets FullscreenView
	vidClone.appendTo(fsParent).get(0).play(); // appends and begins playing the new Fullscreen video

	if(!iterating){ // if just jumping into fullscreen, match the playhead with the smaller version of the video
		matchVideoCurrentTimes(true);
	}

	if (Fullscreen() == false) {			  
		
		goFullscreen();
		if(getSetting('fullscreenCaptions').value){
			notify(imageDB[selected_index].caption);
		}
		
	}
	
	checkMuted();
};


var IterateSlideshow = function(direction){
		removeFullScreenChildren(); // get rid of whatever videos/images are already in the fsview
		var nextElemId = parseInt(currentFSElement.getAttribute("id"))-direction; // the id of the element to switch to
		var element = null;
		iterating = true;
		
		
		if (direction>0){
			if(nextElemId > -1){ // if not reached the end of the collection, proceed (direction increment correlates with id decrement)
				element = document.getElementById((parseInt(currentFSElement.getAttribute("id"))-1).toString());
			}
			else{ // we've reached the end of the collection:
				element = document.getElementById((imageDB.length-1).toString()); // go back to the beginning of the collection
			}
		}else{
			if(nextElemId<=imageDB.length-1){ // does not exceed the collection length
				element = document.getElementById((parseInt(currentFSElement.getAttribute("id"))+1).toString());
			}
			else{ // go back to the end of collection
				element = document.getElementById("0");
			}
		}
		// Decide what to do whether image is an IMG or a VIDEO
		currentFSElement = element;
		if($(element).is('img')){
			fullscreenImage(currentFSElement);
		}
		else if($(element).is('video')){ // video 
			fullscreenVideo(currentFSElement);
			
		}
		
		var newid = parseInt(currentFSElement.getAttribute('id'));
		if(getSetting('fullscreenCaptions')){
			notify(imageDB[newid].caption ? imageDB[newid].caption : imageDB[newid]);
		}
		
};

var currentFSfalse = function(){
		//alert("got fullscreen request")
		currentFSElement = false;
};

var exitFullScreen = function()
{
    if (document.exitFullscreen)
        document.exitFullscreen();
    else if (document.msExitFullscreen)
        document.msExitFullscreen();
    else if (document.mozCancelFullScreen)
        document.mozCancelFullScreen();
    else if (document.webkitExitFullscreen)
        document.webkitExitFullscreen();
	
	$('#FullScreenView').css('visibility','hidden');
	$('.Notifications').stop(true,true).hide();
	
};

var matchVideoCurrentTimes = function(goingFullscreen){
	if(goingFullscreen){ // from fullscreen video to smaller one
		$('#FullScreenView video').prop('currentTime',currentFSElement.currentTime);
	}
	else{ // transfer current time from fullscreen one to small one
		currentFSElement.currentTime = $('#FullScreenView video').prop('currentTime');
	}
};


$(document).ready(function(){
	$(document).bind("exitFullscreen msExitFullscreen mozCancelFullScreen webkitExitFullscreen",function(){
		currentFSfalse();
	});
	$(document).on("fullscreenchange mozfullscreenchange msfullscreenchange webkitfullscreenchange",function(){
			if(Fullscreen()===false){
				// jumps to the last slideshow-ed image outside of full screen view:
				$('#FullScreenView').css('visibility','hidden');
				notifs.hide();
				iterating = false; // reset this variable for slideshow iterating
				if('#FullScreenView video'){
					matchVideoCurrentTimes(false);
					Unmute(currentFSElement);
				}
				
				removeFullScreenChildren(); // clear the fullscreen parent				
				// jumpToElementByScroll
				jumpToElementByScrollPosition(currentFSElement,zoomOutSlideshow(currentFSElement));
				
				
			}

	});
	
	// is bgSize set to 'covered'?
	var covered = false;
	
	//Fullscreen click events
	$('#FullScreenView')
		.on('mousedown',function(e){
			if(!covered){
				if(e.target !== document.getElementById('btnExitFullscreen')){
					if(e.which===1){
						IterateSlideshow(1);
					}
					else if(e.which===3){
						IterateSlideshow(-1);
					}
					else if(e.which===2){
						e.preventDefault();
					}
				}
			}
			else{
				
			}
		})
		.on('contextmenu',function(e){ // 'contextmenu' is just right click basically
			e.preventDefault();
		});
	
	
	// SLIDESHOW ARROW KEY EVENTS
	$(window).on("keydown",function(e){
		
		// Fullscreen only
		if(Fullscreen()){
			
			//RIGHT ARROW KEY DOWN (fullscreen)
			if(e.which==39 && !e.shiftKey){
				IterateSlideshow(1);
			}
			//LEFT ARROW
			else if(e.which==37 && !e.shiftKey){
				IterateSlideshow(-1);
			}
			//ESC
			else if(e.which==27){
				
				setTimeout(function(){
					exitFullScreen();
				},100)
				
			}
			else if(e.which==187){ // '+'
				if(!covered){
					$('#FullScreenView').css('backgroundSize','cover');
					covered = true;
				}
				else{
					$('#FullScreenView').css('backgroundSize','contain');
					covered = false;
				}
			}

		}
		
		// works globally
			
	});
	
	$('#btnExitFullscreen').click(function(){
	
					exitFullScreen();
	});
});
		