var Message = function(content,timestamp,imageUrl,user){
	return{
		Content : content,
		Timestamp : timestamp,
		ImageUrl : imageUrl,
		User : user
	}
}

module.exports = Message;