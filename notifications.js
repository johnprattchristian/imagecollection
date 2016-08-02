var notifs,ntimeout;
var fadeoutDelay = 3000; // how long before notifications fade out
// sets the timeout so that clearTimeout will recognize the variable later

$(document).ready(function(){
	ntimeout = setTimeout(function(){notifs.fadeOut()},fadeoutDelay);	
	notifs = $('.Notifications');
	notifs.hide();
});

var notify = function(text,type){
	notifs = $('.Notifications');
	notifs.stop(true,true);
	notifs.hide();
	clearTimeout(ntimeout); // in case another notification was already there
	if($('#FullScreenView').css('visibility')==='visible'){
		if(getSetting('fullscreenCaptions').value === true){
			notifs = $('#fullscreenNotifs');
			fadeoutDelay = 1500;
			notifs.stop(true,true); // stops the fadeOut and resets
			
			notifs.show();
		}
		else{
			return false; // exit the function. no notification
		}
	}
	else{
		fadeoutDelay = 3000;
		notifs.hide();
		notifs.slideDown(200);
		
	}
	
	notifs.css({backgroundColor:'rgba(0,0,0,0.7)'}); // default coloring
	// are notification colors turned on in settings? if not, just default color
	if(getSetting('notificationColors').value === true){
		// set different colors for different types of messages
		if(typeof type !== 'undefined' && typeof type !== null && type !== ''){ // was a notification type inputted?
			switch(type){
				case 'good':
					notifs.css({backgroundColor:'rgba(0,100,0,0.7)'});
					break;
				case 'neutral':
					notifs.css({backgroundColor:'rgba(100,100,0,0.7)'});
					break;
				case 'warning':
					notifs.css({backgroundColor:'rgba(100,0,0,0.7)'});
					break;
				default:
					notifs.css({backgroundColor:'rgba(0,0,0,0.7)'});
					break;
			}	
		}
	}
	
	notifs.children().text(text); // sets the notification text
	
	ntimeout = setTimeout(function(){
		notifs.fadeOut(400);
	},fadeoutDelay);
};
