var SocketHelper = function(sockets){
    return {
        findExistingRoom : function(mylat,mylon,rooms){
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

        },
        checkIfNameTaken : function(roomList,user){
            var isFound = false;
            roomList.forEach(function(val){
                if(val.Name == user)
                {
                    isFound = true;
                }
            });
            return isFound;
        },
        getRoomTitle : function(neighborhood, name){
            return neighborhood + ' (' + name + ')';
        }
    }
}

module.exports = SocketHelper;