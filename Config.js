var Config = {};

Config.RoomCapacity = 20;

// Coarse-to-fine geographic buckets used when a room is at capacity.
// Level 0 is broad (city/neighborhood), higher levels become more specific.
Config.RoomBucketSizes = [0.05, 0.02, 0.01, 0.005];

// Reverse-geocode zoom levels aligned with bucket granularity.
Config.ReverseGeocodeZoomLevels = [10, 12, 14, 16];

module.exports = Config;
