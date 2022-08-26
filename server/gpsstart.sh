#!/bin/bash
x="hostname -I"
ip=$(eval "$x")
sudo systemctl stop gpsd
sudo systemctl stop gpsd.socket
gpsd -N udp://${ip/ /}:8091