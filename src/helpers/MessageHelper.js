var ServiceController = require('../controllers/ServiceController');
var serviceController;

function MessageHelper(){
	serviceController = new ServiceController();
}

MessageHelper.prototype.HandleSpecialMessage = function(mess, callback){
	if(mess.indexOf('/img ') > -1)
	{
		var imageURL =  mess.substring(mess.indexOf('/img ') + 5,mess.length);
		var user = mess.substring(0,mess.indexOf(':'));
		serviceController.CheckImageIntegrity(imageURL, function(code){
			if(code == 200)
			{
				return callback({URL: imageURL , User : user});
			}
			else
			{
				return callback({URL: "http://maxcdn.thedesigninspiration.com/wp-content/uploads/2010/03/fail-whale/Fail-Whale-15.jpg", User : user});
			}
		});
	}
	else if(mess.indexOf('/lights ') > -1)
	{
		var lightCommand =  mess.substring(mess.indexOf('/lights ') + 8,mess.length);
		var user = mess.substring(0,mess.indexOf(':'));
		if(lightCommand.toUpperCase().trim() == "ON" || lightCommand.toUpperCase().trim() == "OFF")
		{
			serviceController.SetLightState(lightCommand);
			return callback({User : user, StateMessage: "has turned the lights " + lightCommand});
		}
	}
	else
	{
		return callback({User : user});
	}
}

module.exports = MessageHelper;