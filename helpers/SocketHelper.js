var socketsIO;

function SocketHelper(sockets){
  socketsIO = sockets;
}

SocketHelper.prototype.FindRoomInRange = function(mylat,mylon,rooms){
    var existingRooms = socketsIO.adapter.rooms;
    var roomNameFound;

    if(rooms.length < 1)
    {
        return roomNameFound;
    }
    
    Object.keys(existingRooms).forEach(function(roomName){
        var roomTokens = roomName.split(" ");
        if(!isNaN(parseFloat(roomTokens[0])) && !isNaN(parseFloat(roomTokens[1])))
        { 
          var currentRadius = rooms[roomName.replace(/[\s\-\.]/g, '')].Radius;
          if(Math.abs(parseFloat(roomTokens[0]).toFixed(2) - mylat) < currentRadius && Math.abs(parseFloat(roomTokens[1]).toFixed(2) - mylon) < currentRadius)
          {
            roomNameFound = roomName;
          }
        }
    });

    return roomNameFound;
}

SocketHelper.prototype.CheckIfNameTaken = function(roomList,user){
    var isFound =false;
    roomList.forEach(function(val){
        if(val.Name == user)
        {
            isFound = true;
        }
    });
    return isFound;
}

module.exports = SocketHelper;