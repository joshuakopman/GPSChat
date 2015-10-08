var ClientEvents = {};

ClientEvents.OnEnterChatRoom = 'initialize';
ClientEvents.OnNotifyTyping = 'notifyTyping';
ClientEvents.OnStoppedTyping = 'stoppedTyping';
ClientEvents.OnMessageReceived = 'message';
ClientEvents.OnMessageHistoryRequested = 'getMessageHistory';
ClientEvents.OnLeave = 'leave';
ClientEvents.OnDisconnect = 'disconnect';
ClientEvents.OnBootUser = 'bootUser';
ClientEvents.OnWeatherRequested = 'getWeather';

module.exports = ClientEvents;