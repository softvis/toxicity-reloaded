#!/bin/sh

if [ $# -eq 2 ]; then
   java -jar checkstyle-8.13-all.jar -c metrics.xml -f xml -o $1 $2
else
   echo "USAGE: $0 output_xml_filename project_dir_to_check"
fi
