#!/bin/bash

cd /home/aitor/UDBeaconizer_Server/
nohup pouchdb-server -o 0.0.0.0 --port 5984 > /dev/null 2>"/home/aitor/UDBeaconizer_Server/nohup_errors_log.txt" &
sleep 10 # we wait 10 seconds because the following command (2nd service to launch) depends in the previous one.  
nohup node /home/aitor/UDBeaconizer_Server/index.js > /dev/null 2>"/home/aitor/UDBeaconizer_Server/nohup_errors_log.txt" &

echo "(Current pwd: " $(pwd) ") Everything seems to be working fine. Are the processes or services launched yet?" > "/home/aitor/conclusion.txt"
