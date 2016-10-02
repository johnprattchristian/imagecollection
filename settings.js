// user settings:
var _settings;

var saveSettings = function(){
	localStorage.setItem("user_settings",JSON.stringify(_settings));
}

var forceUpdateSettings = function(){
	localStorage.setItem('user_settings','empty');
}

var initializeSettings = function(){
	var settingsString = localStorage.getItem('user_settings');
	if(settingsString.length > 1 && settingsString !== 'empty'){
		_settings = JSON.parse(settingsString);
	}
	if(settingsString.length < 1 || _settings === null || _settings === {} || typeof _settings[0].name === 'undefined'){
		_settings = [
			{name:'fullscreenCaptions',category:'slideshow',value:true,label:'Slideshow captions'},
			{name:'notificationColors',category:'notifications',value:true,label:'Notification colors'},
			{name:'quickPreview',category:'interface',value:true,label:'Quick-preview'},
				{name:'updateSettings',category:'debug',value:forceUpdateSettings,label:'Force Settings Upgrade'}
		]
		saveSettings();
	}
}

$(document).ready(function(){
	initializeSettings();
});

// Retrieve a setting object by 'item' property (the name) from the _settings arrays for use
var getSetting = function(setting){
	// retrieve the first item from an array of settings that match the given name
	return $.grep(_settings,function(e){return e.name === setting})[0];
};

var settingChanged = function(element){
	var $element = $(element);
	if($element.is(":checkbox")){
		console.log('its a checkbox');
		var setting = getSetting(element.dataset.setting);
		if($element.is(":checked")){
			// find the setting for the given checkbox and match the setting to whether or not its checked:
			setting.value = true;
			
		}
		else{
			setting.value = false;
		}
		console.log(setting.value);
	}
	
	saveSettings();
};

var settingsDialogue = function(){
	var dialog = $('#d_Settings');
	var settingsDiv = $('#d_Settings #settingsContainer');
	
	// empty the _settings dialog
	settingsDiv.html("");
	
	// loop through _settings to display them in the dialog
	var headers = [];
	// create a copy of _settings sorted by category
	/*var copy = _settings.sort(function(a,b){
		return a.category !== b.category ? 1 : 0;
	}).slice(0);*/
	for(var s in _settings){
		var setting = _settings[s]; // the current setting
		if($(settingsDiv).children('[data-category="'+setting.category+'"]').length===0){
			var newCategory = $('<div class="setting-category-container" data-category="'+setting.category+'" ></div>').append('<h2 class="setting-category-header">'+setting.category+'</h2>').appendTo(settingsDiv);
		}
		var displaySetting = '';
		switch(typeof setting.value){
			case 'boolean':
				displaySetting = $("<label><input type='checkbox' data-setting='"+setting.name+"'" +
				""+
				(setting.value === true ? 'checked' : '') + ">"+setting.label+"</label></input>");
				break;
			case 'function':
				displaySetting = $("<button onclick='"+setting.value+"'>"+setting.label+"</button>");
			default:
				console.log('could not evaluate setting ' + setting.name);
				break;
		}
		var categoryDiv = $('[data-category="'+setting.category+'"]');
		categoryDiv.append(displaySetting);
		categoryDiv.append('</br>');
	}

	
	
	/*$(_settings).each(function(i,item){
		
		var settingItem = null;
		var evalItem = item.value;
		
		switch(typeof evalItem){
			case 'boolean':
				settingItem = $("<label><input type='checkbox' data-setting='"+item.name+"'" +
				""+
				(item.value === true ? 'checked' : '') + ">"+item.name+"</label></input>");
				
				break;
			default:
				console.log('could not evaluate setting ' + item.name);
				break;
		}
		
		console.log(settingItem);
		settingsDiv.append(settingItem);
		settingsDiv.append('<br>');
	});
	*/
	$(':checkbox').change(function(){
		settingChanged(this);
	});
	
	
};