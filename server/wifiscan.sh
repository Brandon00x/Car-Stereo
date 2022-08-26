#!/bin/bash
x="sudo iwlist wlan0 scanning | grep ESSID | xargs"
wifiList=$(eval "$x")
echo "$wifiList" | tee list.txt
