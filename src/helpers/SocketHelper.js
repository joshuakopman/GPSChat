var socketsIO;

function SocketHelper(sockets){
  socketsIO = sockets;
}

SocketHelper.prototype.FindRoomInRange = function(mylat,mylon)
{
    var existingRooms = socketsIO.adapter.rooms;
    var roomNameFound='';

    if(existingRooms.length < 1)
    {
        return roomNameFound;
    }

   Object.keys(existingRooms).forEach(function(roomName){

       var roomTokens = roomName.split(" ");

        if(!isNaN(parseFloat(roomTokens[0])) && !isNaN(parseFloat(roomTokens[1])))
        { 
          if(Math.abs(parseFloat(roomTokens[0]).toFixed(2) - mylat) < .03 && Math.abs(parseFloat(roomTokens[1]).toFixed(2) - mylon) < .03)
          {
            roomNameFound = roomName;
          }
        }
    });

    return roomNameFound;
}

module.exports = SocketHelper;