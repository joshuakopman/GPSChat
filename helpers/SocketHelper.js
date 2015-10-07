var socketsIO;

function SocketHelper(sockets){
  socketsIO = sockets;
}

SocketHelper.prototype.FindExistingRoom = function(mylat,mylon,rooms){
    var existingRoomFound;

    if(rooms.length < 1)
    {
        return null;
    }

    rooms.some(function(currRoom){
        var roomKey = currRoom.Key;
        var roomCoordinates = currRoom.Name.split(" ");
        if(!isNaN(parseFloat(roomCoordinates[0])) && !isNaN(parseFloat(roomCoordinates[1])))
        { 
          var currentRadius = rooms[roomKey].Radius;
          if(Math.abs(parseFloat(roomCoordinates[0]).toFixed(2) - mylat) < currentRadius && Math.abs(parseFloat(roomCoordinates[1]).toFixed(2) - mylon) < currentRadius)
          {
            existingRoomFound = rooms[roomKey];
            return true;
          }
        }   
    });

    return existingRoomFound;

}

SocketHelper.prototype.CheckIfNameTaken = function(roomList,user){
    var isFound = false;
    roomList.forEach(function(val){
        if(val.Name == user)
        {
            isFound = true;
        }
    });
    return isFound;
}

module.exports = SocketHelper;