var Events = {};

Events.Loaded = 'chatLoaded';
Events.SendRoomTitle = 'title';
Events.SendWeather = 'weather';
Events.SendUpdatedMemberList = 'usersInRoomUpdate';
Events.UserError = 'userError';
Events.StartedTyping = 'typing';
Events.StoppedTyping = 'stopTyping';
Events.BlockedJavascript = 'injectMessage';
Events.SendMessageHistory = 'messageHistory';
Events.BootedUser = 'userBooted';
Events.NewUserJoined = 'joined';
Events.UserLeft = 'left';
Events.SelfJoined = 'selfjoined';
Events.SelfLeft = 'selfLeft';

Events.Message = 'message';
Events.SelfMessage = 'selfMessage';

module.exports = Events;