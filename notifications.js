var notifs,ntimeout;
var fadeoutDelay = 3000; // how long before notifications fade out
// sets the timeout so that clearTimeout will recognize the variable later

var notifQue = [];

$(document).ready(function(){
	ntimeout = setTimeout(function(){notifs.fadeOut()},fadeoutDelay);	
	notifs = $('.Notifications');
	notifs.hide();
});

var show = function(element){
	$(element).css('display','block');
}

var pushNotification = function(message,type){
	notifQue.push({
		message:message,
		type:type
	});
}

var alreadyNotifying = false;
var displayNotification = function(message,type){
	// if the only notification is the one we just pushed from notify()
	// then start a new cycle

	ntype = type;
	var wait = 0;
	
	// if there's already a notification, then wait half a second
	if(!Fullscreen() && alreadyNotifying){
		wait = 500;
	}
	setTimeout(function(){
		alreadyNotifying = true;
		$('.Notifications').stop(true,true);
		$('.Notifications').hide();
		notifs = $('.Notifications');
		clearTimeout(ntimeout); // in case another notification was already there
		if(Fullscreen()){
			if(getSetting('fullscreenCaptions').value === true){
				notifs = $('#fullscreenNotifs');
				fadeoutDelay = 1500;
				notifs.stop(true,true); // stops the fadeOut and resets
				
				show(notifs.get(0));
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
		
		if(notifQue.length > 1){
			fadeoutDelay = 100;
		}

		notifs.css({backgroundColor:'rgba(0,0,0,0.7)'}); // default coloring
		// are notification colors turned on in settings? if not, just default color
		if(getSetting('notificationColors').value === true){
			// set different colors for different types of messages
			if(typeof ntype !== 'undefined' && typeof ntype !== null && ntype !== ''){ // was a notification ntype inputted?
				switch(ntype){
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

		notifs.children().text(message); // sets the notification message
		notifs.children('span').html(message);

		var reg = $('#regularNotifications');
		var regwidth = Math.round(reg.width());
		reg.css('left',Math.round((window.innerWidth / 2) - regwidth /2 - 40)+'px');

		ntimeout = setTimeout(function(){
			alreadyNotifying = false; // notification has ended
			notifs.fadeOut(400);
			/*notifQue.splice(0,1);
			if(notifQue.length > 0){ // if there's more notifications, display them
				displayNotification();
			};*/
		},fadeoutDelay);
		
	},wait);
}

var notify = function(text,type){
		// push notif to list
		
		//pushNotification(text,type);
		// only force display if none are on the que
		displayNotification(text,type);
};
