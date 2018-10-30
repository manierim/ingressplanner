sed -i "s/define('DEBUG', true);/define('DEBUG', false);/" $IP_basepath/basics.php
COMMIT=$(git log -n 1 --pretty=format:%h -- files/ingressplanner.user.js)
sed -i "s/@@PLUGINBUILD@@/$COMMIT/" $IP_basepath/index.php

sed -i "s/@@DATETIMEVERSION@@/$COMMIT $(date +%d\\/%m\\/%Y)/" $IP_basepath/files/ingressplanner.user.js
sed -i "s/@@IPBASEURL@@/$IP_baseurl" $IP_basepath/files/ingressplanner.user.js
sed -i "s/@@PLUGINBUILD@@/$COMMIT/" $IP_basepath/files/ingressplanner.user.js

awk '/\/\/ ==UserScript==/,/\/\/ ==\/UserScript==/' $IP_basepath/files/ingressplanner.user.js > $IP_basepath/files/ingressplanner.user-meta.js

COMMIT=$(git log -n 1 --pretty=format:%h)
sed -i "s/@@BUILD@@/$COMMIT/" $IP_basepath/index.php
sed -i "s/@@BUILDDATE@@/$(date +%d\\/%m\\/%Y)/" $IP_basepath/index.php