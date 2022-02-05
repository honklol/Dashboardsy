#!/usr/bin/env bash
currentDir=$(pwd)
if [[ "$currentDir" != *"Dashboardsy" && "$currentDir" != *"dashboardsy" ]]; then
  echo "Please run this script from the main Dashboardsy directory."
  exit 1
fi
mv config.json config.json.backup
mv next.config.js next.config.js.backup

git pull
lastCmtMessage=$(git log -1 --pretty=%B)
if [[ "$lastCmtMessage" != *"config"* ]]; then
  echo "You will have to merge your config.json and next.config.js files manually. They have been backed up as next.config.js.backup and config.json.backup"
  echo -e "\nAfter you have done that, run the following commands."
  echo "npm run build"
  echo "pm2 restart dashboardsy"
  exit 1
fi

mv config.json.backup config.json
mv next.config.js.backup next.config.js
npm run build
pm2 restart dashboardsy
echo "You're all done and ready to go!"

