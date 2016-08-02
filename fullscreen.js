// removes video and img elements in the fullscreenView parent element, so as to retain the #fullscreenNotifications
var removeFullScreenChildren = function(){
	$('#FullScreenView').css({backgroundImage:'none'});
	$('#FullScreenView video').remove();
	$('#FullScreenView img').remove();
};
	
var fullscreenImage = function(img){
	if (!window.screenTop && !window.screenY) { // not already fullscreen, right?
			currentFSElement = img;
			removeFullScreenChildren();
			var element = document.getElementById("FullScreenView");
			//element.style.visibility="visible";
			element.style.backgroundImage='url('+currentFSElement.getAttribute("src")+')';
			$(element).css("background-color","rgba(100,100,100,0.4");
			  if(element.requestFullscreen) {
				element.requestFullscreen();
			  } else if(element.mozRequestFullScreen) {
				element.mozRequestFullScreen();
			  } else if(element.webkitRequestFullscreen) {
				element.webkitRequestFullscreen();
			  } else if(element.msRequestFullscreen) {
				element.msRequestFullscreen();
			  }
		
		if(getSetting('fullscreenCaptions')){
			notify(imageDB[selected_index].caption);
		}
		
	}
};
	
var fullscreenVideo = function(vid){
	if (!window.screenTop && !window.screenY) {
			currentFSElement = this;
			var element = document.getElementById("FullScreenView");
			removeFullScreenChildren();
			//$(element).html(""); // clears the FullScreenView's html
			muteAll();
			$(element).prepend("<video style='min-width:100%;min-height:100%;width:100%;height:100%' autoplay loop unmuted src='"+$(currentFSElement).attr('src')+"#t="+vid.currentTime+"'/>");
			$('#FullScreenView video').prop('volume',0.1);
			//element.style.visibility="visible";
			  if(element.requestFullscreen) {
				element.requestFullscreen();
			  } else if(element.mozRequestFullScreen) {
				element.mozRequestFullScreen();
			  } else if(element.webkitRequestFullscreen) {
				element.webkitRequestFullscreen();
			  } else if(element.msRequestFullscreen) {
				element.msRequestFullscreen();
			  }
	
		notify(imageDB[selected_index].caption);
	}
};
	
var IterateSlideshow = function(direction){
			removeFullScreenChildren();
			var nextElemId = parseInt(currentFSElement.getAttribute("id"))-direction; // the id of the element to switch to
			var element = null;
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
				$("#FullScreenView").css("backgroundImage","url("+currentFSElement.getAttribute("src")+")");
			}
			else if($(element).is('video')){ // video 
				$("#FullScreenView").css("backgroundImage","none"); // remove residual background image 
				$("#FullScreenView").prepend("<video style='min-width:100%;min-height:100%;width:100%;height:100%' autoplay loop unmuted src='"+$(currentFSElement).attr('src')+"'></video>");
				// ^ use prepend so as not to erase the notifications
				// Lower the goddamn volume for these goddamn fullscreen videos!
				$("#FullScreenView video").prop('volume',0.1);
			}
		
		var newid = parseInt(currentFSElement.getAttribute('id'));
		if(getSetting('fullscreenCaptions')){
			notify(imageDB[newid].caption ? imageDB[newid].caption : imageDB[newid]);
		}
};

var currentFSfalse = function(){
		//alert("got fullscreen request")
		currentFSElement = false;
		$("#FullScreenView").css("visibility","hidden");
};
	
// jumps to an element on the page purely by scrolling to its position
var jumpToElementByScrollPosition = function(element_to_jump_to){
	// make the documents scroll position (scrollTop) equal to an elements position
	$(document).scrollTop($(element_to_jump_to).offset().top - 100);
};

$(document).ready(function(){
	$(document).bind("exitFullscreen msExitFullscreen mozCancelFullScreen webkitExitFullscreen",currentFSfalse());
	$(document).on("fullscreenchange mozfullscreenchange msfullscreenchange webkitfullscreenchange",function(){
			if($("#FullScreenView").css("visibility")=="visible"){
				$("#FullScreenView").css("visibility","hidden");
			 // clears everything inside the fullScreenView object
				// jumps to the last slideshow-ed image outside of full screen view:
				// jumpToElementById(currentFSElement); NO LONGER RELEVANT
				jumpToElementByScrollPosition(currentFSElement);
			
				notifs.hide()
			}
			else{
				$("#FullScreenView").css("visibility","visible");
			}

	});
});

// SLIDESHOW CLICK EVENTS
	// LEFT CLICK = Next Image, RIGHT CLICK = Previous
$(function(){
	$('#FullScreenView')
		.on('click',function(e){
			if(e.which===1){
				IterateSlideshow(1);
			}
			else if(e.which===3){
				IterateSlideshow(-1);
			}
			else if(e.which===2){
				
				alert("middle button!");
				if(document.webkitExitFullscreen){
					e.preventDefault();
					document.webkitExitFullscreen();
				}
			}
		})
		.on('contextmenu',function(e){ // 'contextmenu' is just right click basically
			e.preventDefault();
			IterateSlideshow(-1);
		});
		
	// SLIDESHOW ARROW KEY EVENTS
	$(window).on("keydown",function(e){
	//RIGHT ARROW KEY DOWN (fullscreen)
		if(e.which==39){
			IterateSlideshow(1);
		}
	//LEFT ARROW
		else if(e.which==37){
			IterateSlideshow(-1);
		}
		else if(e.which==27){
			
			setTimeout(function(){
				$("#FullScreenView").css("visibility","hidden");
			},100)
		}
	});
});
		