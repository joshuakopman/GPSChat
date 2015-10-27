var ServiceController = require('../controllers/ServiceController');
var serviceController;
var Message = require('../models/Message');
var Events = require('../constants/Events');

function MessageHelper(){
	serviceController = new ServiceController();
}

MessageHelper.prototype.HandleSpecialMessage = function(messageFromClient, timestamp, callback){
    var createdMessage = new Message();
		createdMessage.User = messageFromClient.substring(0,messageFromClient.indexOf(':'));
		createdMessage.Timestamp = timestamp;
		createdMessage.Content = messageFromClient.substring(messageFromClient.indexOf(':'),messageFromClient.length);

		if(messageFromClient.indexOf('/img ') > -1)
		{
			var imageURL =  messageFromClient.substring(messageFromClient.indexOf('/img ') + 5,messageFromClient.length);
			serviceController.CheckImageIntegrity(imageURL, function(code){
				if(code == 200)
				{
					createdMessage.ImageUrl = imageURL;
				}
				else
				{
					createdMessage.ImageUrl = "http://maxcdn.thedesigninspiration.com/wp-content/uploads/2010/03/fail-whale/Fail-Whale-15.jpg";
				}
				return callback(createdMessage);
			});
		}
		else if(messageFromClient.indexOf('/lights ') > -1)
		{
			var lightCommand =  messageFromClient.substring(messageFromClient.indexOf('/lights ') + 8,messageFromClient.length);
			if(lightCommand.toUpperCase().trim() == "ON" || lightCommand.toUpperCase().trim() == "OFF")
			{
			    var lightSwitchObj = {};
	    		lightSwitchObj.state = lightCommand;
				serviceController.SetLightState(lightCommand);
				createdMessage.Content = "has turned the lights " + lightCommand;

				return callback(createdMessage);
			}
		}
		else
		{
			return callback(createdMessage);
		}
}


module.exports = MessageHelper;
