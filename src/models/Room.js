function Room(name,neighborhood){
    this.Name = name;
    this.Neighborhood = neighborhood;
    this.Clients = [];
    this.Messages = [];
}

module.exports = Room;