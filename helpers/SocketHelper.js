var SocketHelper = function(sockets){
    return {
        getBucketDecimals : function(bucketSize){
            var asString = bucketSize.toString();
            return asString.indexOf('.') > -1 ? asString.split('.')[1].length : 0;
        },
        getBucketedCoordinate : function(value, bucketSize){
            var decimals = this.getBucketDecimals(bucketSize);
            var numericValue = parseFloat(value);
            var bucketed = Math.floor(numericValue / bucketSize) * bucketSize;
            return parseFloat(bucketed.toFixed(decimals));
        },
        getRoomPlacement : function(lat,lon,level,bucketSizes){
            var maxLevelIndex = bucketSizes.length - 1;
            var boundedLevel = (level > maxLevelIndex) ? maxLevelIndex : level;
            var bucketSize = bucketSizes[boundedLevel];
            var bucketLat = this.getBucketedCoordinate(lat, bucketSize);
            var bucketLon = this.getBucketedCoordinate(lon, bucketSize);
            var roomName = bucketLat.toFixed(this.getBucketDecimals(bucketSize)) + " " + bucketLon.toFixed(this.getBucketDecimals(bucketSize));
            var key = "L" + boundedLevel + "_" + roomName.replace(/[\s\-\.]/g, '');
            return {
                Level: boundedLevel,
                BucketSize: bucketSize,
                BucketLat: bucketLat,
                BucketLon: bucketLon,
                RoomName: roomName,
                Key: key
            };
        },
        findRoomByPlacement : function(rooms,placement){
            return rooms[placement.Key] || null;
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
