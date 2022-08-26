#!/bin/bash
sudo mv wpa_supplicant.conf /etc/wpa_supplicant/wpa_supplicant.conf
sudo wpa_cli -i wlan0 reconfigure