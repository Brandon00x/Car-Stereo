#!/bin/bash
sudo killall -9 node
node /home/pi/carplay/server/app.js 
npm start /home/pi/carplay/client