#!/bin/bash
#rm btdevices.txt
rm btscanresultsall.txt
pipe=/tmp/btctlpipe 
btfounddevices=$(pwd)
output_file=btscanresultsall.txt

if [[ ! -p $pipe ]]; then
  mkfifo $pipe
fi

trap terminate INT
function terminate()
{
  killall bluetoothctl &>/dev/null
  rm -f $pipe
}

function bleutoothctl_reader() 
{
  {
    while true
    do
      if read line <$pipe; then
          if [[ "$line" == 'exit' ]]; then
              break
          fi          
          echo $line
      fi
    done
  } | bluetoothctl > "$output_file"
}


function bleutoothctl_writer() 
{
  cmd=$1
  printf "$cmd\n\n" > $pipe
}

bleutoothctl_reader &
sleep 1
bleutoothctl_writer "scan on"
sleep 10
bleutoothctl_writer "scan off"
sleep 1
bleutoothctl_writer "devices"
sleep 1
bleutoothctl_writer "exit"

device_list=$(cat $output_file | grep -e '^Device.*' | sed 's/Device //g')

echo "$device_list" | tee btdevices.txt
terminate