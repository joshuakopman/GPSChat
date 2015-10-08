var ServiceController = require('../controllers/ServiceController');
var serviceController;
var Message = require('../models/Message');
var Events = require('../constants/Events');

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
				return callback({URL : imageURL , User : user});
			}
			else
			{
				return callback({URL : "http://maxcdn.thedesigninspiration.com/wp-content/uploads/2010/03/fail-whale/Fail-Whale-15.jpg", User : user});
			}
		});
	}
	else if(mess.indexOf('/lights ') > -1)
	{
		var lightCommand =  mess.substring(mess.indexOf('/lights ') + 8,mess.length);
		var user = mess.substring(0,mess.indexOf(':'));
		if(lightCommand.toUpperCase().trim() == "ON" || lightCommand.toUpperCase().trim() == "OFF")
		{
		    var lightSwitchObj = {};
    		lightSwitchObj.state = lightCommand;
			serviceController.SetLightState(lightSwitchObj);
			return callback({StateMessage : "has turned the lights " + lightCommand, User : user});
		}
	}
	else
	{
		return callback({User : user});
	}
}

MessageHelper.prototype.EmitSpecialMessageEvent = function(socket,roomName,data,timestamp,result){
        var mess = new Message();
        var isImage;

        if(result.URL)
        {
            socket.broadcast.to(roomName).emit(Events.ImageMessage, result);
            socket.emit(Events.SelfImageMessage,result);
            mess.Content = result;
            isImage = true;
        }
        else if(result.StateMessage)
        {
            socket.broadcast.to(roomName).emit(Events.LightsMessage, result);
            socket.emit(Events.SelfLightsMessage,result);
            mess.Content = result;
            isImage = false;
        }
        else{
            socket.broadcast.to(roomName).emit(Events.Message, data);
            socket.emit(Events.SelfMessage,data);
            mess.Content = data;
            isImage = false;
        }
        mess.Timestamp = timestamp;
        mess.IsImage  = isImage;

        return mess;
}

module.exports = MessageHelper;