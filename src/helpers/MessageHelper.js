var ServiceHandler = require('../handlers/ServiceHandler');

function MessageHelper(){
}

MessageHelper.prototype.HandleImageMessage = function(mess, callback){
	if(mess.indexOf('/img ') > -1)
	{
		var imageURL =  mess.substring(mess.indexOf('/img ') + 5,mess.length);imageURL
		new ServiceHandler().CheckImageIntegrity(imageURL, function(code){
			if(code == 200)
			{
				return callback(imageURL);
			}
			else
			{
				return callback("http://maxcdn.thedesigninspiration.com/wp-content/uploads/2010/03/fail-whale/Fail-Whale-15.jpg");
			}
		});
	}
	else
	{
		return callback();
	}
}

module.exports = MessageHelper;