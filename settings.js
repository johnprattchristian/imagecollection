// user settings:
var _settings;
var Settings = {
	UI:{
		fullscreenCaptions:false,
		notificationColors:true,
		quickPreview:true,
		roundedCorners:true,
		collectionThemes:true
	},
	updateSettings:forceUpdateSettings
};

var saveSettings = function(){
	localStorage.setItem("user_settings",JSON.stringify(Settings));
}

var forceUpdateSettings = function(){
	localStorage.setItem('user_settings',null);
}

var initializeSettings = function(){
	var saved = JSON.parse(localStorage.getItem('user_settings'));
	for(var x in Settings){
		if(Settings.hasOwnProperty(x)){
			if(typeof saved[x] !== 'undefined'){
				var savedX = savedX;
				if(typeof x === 'object'){
					var SettingsX = Settings[x];
					for(var y in x){
						if(typeof savedX[y] !== 'undefined'){
							SettingsX[y] = savedX[y];
							log('updated Settings.',x+'.'+y);
						}
					}
				}
				else{
					Settings[x] = saved[x];
					log('Updated setting:',x);
				}
			}
			else{
				Settings[x] = saved[x];
				log('Added new prop to settings:',x);
			}
		}
	}
}

$(document).ready(function(){
	initializeSettings();
});

// Retrieve a setting object by 'item' property (the name) from the _settings arrays for use
var getSetting = function(setting){
	return propInObjRecursive(Settings,setting);
};

var propInObjRecursive = function(obj,prop){
	for(var p in obj){
		if(obj.hasOwnProperty(p)){
			if(typeof obj[p] === 'object'){
				var recurse = propInObjRecursive(obj[p],prop);
				if(recurse !== null){
					return recurse;
				}
			}
			else{
				if(p === prop){
					return obj[p];
				}
			}
		}
	}
	return null;
}

// a recursive method for finding the first setting
// of a given name, no matter how deep, and setting its value to
// the given value
var setSetting = function(name,newValue,object=Settings){
	for(var p in object){
		if(object.hasOwnProperty(p)){
			// if setting is actually an object of sub-settings, then recurse
			if(typeof object[p] === 'object'){
				setSetting(name,newValue,object[p]);
			}
			// if its just a setting, then set it
			else{
				if(p === name && typeof newValue === typeof object[p]){
					object[p] = newValue;
					return true;
				}
			}
		}
	}
	return false;
};

var settingChanged = function(element){
	var $element = $(element);
	var setting = element.dataset.setting;
	if($element.is(":checkbox")){
		console.log('its a checkbox');
		if($element.is(":checked")){
			// find the setting for the given checkbox and match the setting to whether or not its checked:
			setSetting(setting,true);
			
		}
		else{
			setSetting(setting,false);
		}
		// Reflect settings changes:
		List();
		updateUIColor();
		console.log(setting,":",getSetting(setting));
	}
	
	saveSettings();
};

var returnElementForSetting = function(setting,s){
	var displaySetting = '';
	switch(typeof setting){
		case 'boolean':
			displaySetting = $("<label><input type='checkbox' data-setting='"+s+"'" +
			""+
			(setting === true ? 'checked' : '') + ">"+s.split(/(?=[A-Z])/).join(" ").replace(/\b./g, function(m){ return m.toUpperCase(); })+"</label></input>");
			break;
		case 'function':
			displaySetting = $("<button onclick='"+setting+"'>"+s+"</button>");
			break;
		case 'object':
			displaySetting = $('<div class="setting-category-container"><div class="setting-category-header">'+s+'</div></div>');
			for(var prop in setting){
				displaySetting.append(returnElementForSetting(setting[prop],prop));
				displaySetting.append('</br>');
			}
			break;
		default:
			console.log('could not evaluate setting ' + s);
			break;
	}
	return displaySetting;
}

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
	for(var s in Settings){
		var setting = Settings[s]; // the current setting
		settingsDiv.append(returnElementForSetting(setting,s));
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