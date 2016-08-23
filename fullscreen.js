var iterating = false; // decide if iterating the slideshow or just jumping into fullscreen

var ghostImageForZoom = new Image();

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

var sizeGhostImage = function(img){
	var ratio;
	if(widerThanTall(img)){
		ghostImageForZoom.width = screen.width;
		ratio = img.height / img.width;
		ghostImageForZoom.height = screen.width * ratio;
	}
	else{
		ghostImageForZoom.height = screen.height;
		ratio = img.width / img.height;
		ghostImageForZoom.width = screen.height * ratio;
	}
}

var sizeGhostImageForWidth = function(element,img){
	ghostImageForZoom.width = $(element).width();
	ratio = img.height / img.width;
	ghostImageForZoom.height = $(element).width() * ratio;
}
	
var fullscreenImage = function(img){
	currentFSElement = img; // this is for other functions to know on the first time using currentFSElement
	removeFullScreenChildren();
	var element = document.getElementById("FullScreenView");
	
	element.style.backgroundImage='url('+img.getAttribute("src")+')';
	element.style.backgroundSize = 'contain';
	element.style.backgroundPosition = 'center';
	zoomedIn = false;
	
	// simultaneously add image to ghostImageForZoom
	ghostImageForZoom = new Image();
	ghostImageForZoom.src = img.getAttribute('src');
	
	// figure out the correct aspect ratio and scale up/down the ghostImageForZoom to max screen height/width
	sizeGhostImage(img);
	
	// make Fullscreen background black
	$(element).css("background-color","black");
	if (Fullscreen() == false) { // not already fullscreen, right?
	
		goFullscreen();
		
<<<<<<< HEAD
		
=======
		$('.Notifications').hide();
>>>>>>> refs/remotes/origin/master
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
	
<<<<<<< HEAD
	var wheelEvent = function(){
		
	};
	/*
	$('#FullScreenView').on('wheel',function(e){
			var ogEvent = e.originalEvent;
			var factor = 1.05;
			
		//if($(this).has('video').length === 0){ // image not video
			if(ogEvent.deltaY < 0){ // zooming in
			
				// scale the ghostImage
				ghostImageForZoom.width *= factor;
				ghostImageForZoom.height *= factor;
				
				
				$(this).css({
					backgroundSize:String(ghostImageForZoom.width + 'px ' + ghostImageForZoom.height + 'px')
				});
				
				var newPosition = {
					x:e.clientX - bgPosition(this).x * (factor-1),
					y:0
				};
				
				$(this).css('background-position',newPosition.x + 'px ' + newPosition.y + 'px');
				
				
				zoomedIn = true;
				
			}
			else{ // zooming out 
			// don't let it get smaller than the screen
				if(widerThanTall(ghostImageForZoom) ? (ghostImageForZoom.width > $(this).width()) : (ghostImageForZoom.height > $(this).height())){ // create if statement based on whether its a wide or tall image 
					// scale the ghostImage
					ghostImageForZoom.width /= factor;
					ghostImageForZoom.height /= factor;
					
					// change backgroundImage to ghostImage size
					$(this).css({
						backgroundSize:String(ghostImageForZoom.width + 'px ' + ghostImageForZoom.height + 'px')
					});
					log($(this).css('backgroundSize'));
				}
				else if(ghostImageForZoom.height <= $(this).height()){
					
					zoomedIn = false; // not zooming anymore
				}
			}
		//}
	});
	*/
	var dragging = function(){
		// just a pointer
	}
	// variables for dragging and zooming
	var dragging = false,
		originX = 0,
		originY = 0,
		zoomedIn = false,
		zoomFactor = 0.1,
		delta = {x:0,y:0};
	
	// drag around a zoomed in image
	$('#FullScreenView').on('mousemove',function(e){
		
		if(dragging){
			
		
			if( (widerThanTall(ghostImageForZoom) ? (delta.x <= 0 && delta.x >= (screen.width - ghostImageForZoom.width)) : (delta.y <= 0 && delta.y >= (screen.height - ghostImageForZoom.height)))){
				
				// establish distance to move
				delta = {x:e.clientX - originX,y:e.clientY - ghostImageForZoom.height * originY};
				console.log(delta);
				$(this).css('backgroundPosition',String(delta.x + 'px '+(delta.y)+'px'));
			}
		}
	});

	//Fullscreen click events
	$('#FullScreenView')
		.on('mousedown',function(e){
			if(!zoomedIn && e.target !== document.getElementById('btnExitFullscreen')){
				if(e.which===1){
					IterateSlideshow(1);
				}
				else if(e.which===3){
					IterateSlideshow(-1);
				}
				else if(e.which===2){
					
					alert("middle button!");
					if(document.webkitExitFullscreen){
=======
	// is bgSize set to 'covered'?
	var covered = false;
	var dragging = false,
		originX = 0, originY = 0;
	
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
>>>>>>> refs/remotes/origin/master
						e.preventDefault();
					}
				}
				
			}
			if(zoomedIn){
				dragging = true; // only set if zoomed in
				originX = e.clientX - bgPosition(this).x;
				originY = (e.clientY - bgPosition(this).y) / ghostImageForZoom.height;
			}
<<<<<<< HEAD
			
		})
		.on('mouseup',function(e){
			dragging = false;
		})
		.on('contextmenu',function(e){ // 'contextmenu' is just right click basically
			e.preventDefault();
			//IterateSlideshow(-1);
=======
			else{
				dragging = true;
				originY = e.clientY - 
			}
		})
		.on('contextmenu',function(e){ // 'contextmenu' is just right click basically
			e.preventDefault();
		})
		.on('mouseup',function(e){
			dragging = false;
>>>>>>> refs/remotes/origin/master
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
<<<<<<< HEAD
			else if(e.which===187){ // '+'
				var fsv = $('#FullScreenView');
				ghostImageForZoom.width+=ghostImageForZoom.width*zoomFactor;
				ghostImageForZoom.height+=ghostImageForZoom.height*zoomFactor;
				
				fsv.css('background-size',ghostImageForZoom.width + 'px ' + ghostImageForZoom.height + 'px');
				fsv.css('background-position','center');
				zoomedIn = true;
			}
			else if(e.which===189){ // '-'
				if((widerThanTall(ghostImageForZoom) ? (ghostImageForZoom.width >= screen.width) : (ghostImageForZoom.	height >= screen.height))){
					var fsv = $('#FullScreenView');
					ghostImageForZoom.width-=ghostImageForZoom.width*zoomFactor;
					ghostImageForZoom.height-=ghostImageForZoom.height*zoomFactor;
					
					fsv.css('background-size',ghostImageForZoom.width + 'px ' + ghostImageForZoom.height + 'px');
					fsv.css('background-position','center');
				}
				else{
					zoomedIn = false;
=======
			else if(e.which==187){ // '+'
				if(!covered){
					$('#FullScreenView').css('backgroundSize','cover');
					covered = true;
				}
				else{
					$('#FullScreenView').css('backgroundSize','contain');
					covered = false;
>>>>>>> refs/remotes/origin/master
				}
			}

		}
		
		// works globally
			
	});
	
	$('#btnExitFullscreen').click(function(){
			exitFullScreen();
	});
});
		