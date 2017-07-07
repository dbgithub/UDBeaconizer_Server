#!/bin/bash
echo "hola"
echo "Starting restart script to relaunch the database and server services" > /home/aitor/starting.txt

nohup sudo pouchdb-server -o 0.0.0.0 --port 5984 > /dev/null 2>"/home/aitor/UDBeaconizer_Server/nohup_errors_log.txt" &
nohup node /home/aitor/UDBeaconizer_Server/index.js > /dev/null 2>"/home/aitor/UDBeaconizer_Server/nohup_errors_log.txt" &

echo "Everything seems to be working fine. Are the processes or services launched yet?" > "/home/aitor/conclusion.txt"
