function Message(content,timestamp,imageUrl,user){
	this.Content = content;
	this.Timestamp = timestamp;
	this.ImageUrl = imageUrl;
	this.User = user;
}

module.exports = Message;