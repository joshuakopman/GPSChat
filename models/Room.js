function Room(name,neighborhood,clients,radius){
    this.Name = name;
    this.Key = name.replace(/[\s\-\.]/g, '').toString();
    this.Neighborhood = neighborhood;
    this.Clients = (clients)?clients:[];
    this.Messages = [];
    this.Radius = (radius) ? radius : 0.9;
}

module.exports = Room;