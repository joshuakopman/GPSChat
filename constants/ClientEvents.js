var ClientEvents = {};

ClientEvents.OnEnterChatRoom = 'enterChatRoom';
ClientEvents.OnNotifyTyping = 'notifyTyping';
ClientEvents.OnStoppedTyping = 'stoppedTyping';
ClientEvents.OnMessageReceived = 'message';
ClientEvents.OnLeave = 'leave';
ClientEvents.OnDisconnect = 'disconnect';
ClientEvents.OnBootUser = 'bootUser';
ClientEvents.OnWeatherRequested = 'getWeather';

module.exports = ClientEvents;