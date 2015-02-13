GPSChat
===========

A location-based chat client and server application. Rooms are based on radius around the user's GPS coordinates. If a room doesn't exist when a user access the app, it is created for their neighborhood so future users can join.

Instructions:

Deployment via docker:

1) docker build -t gpschat .
2) docker run -p 80:3000 -p 3000:3000 gpschat

Otherwise, run as standard MEAN stack app.

npm install
node ./app.js