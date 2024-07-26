Hosted on ec2 insance:
instance name: it-jira-discord
If automatization stop working regularly(after it worked for day or two) - reload instance and restart automation

for the first time hosting:

cd crm.inhale.tech
npm install

------
for the owner tranfership:

cd crm.inhale.tech/changePermission/server

npm install

cd crm.inhale.tech/changePermission/client

npm install

----------
in case needed list of all dependancies

npm install express

npm install node-fetch@2

npm install discord.js

npm install jira.js

npm install axios

npm install dotnet

npm install google-auth-library

npm install googleapis

npm install node-fetch

npm install readline

npm install -g forever

----------

how to start automatization in cmd:

1.Check: 

sudo systemctl status nginx

if not started or inactive: 

sudo systemctl reload nginx

for YT:

cd crm.inhale.tech

forever start app.js

for transfer ownership:

cd crm.inhale.tech/changePermission/server

forever start app.js

cd crm.inhale.tech/changePermission/client

PORT=5173 forever start -c "npm run dev" ./

----------

how to stop app:

forever stopall

or

for YT:

cd crm.inhale.tech

forever stop app.js

for transfer ownership:

cd /home/ec2-user/crm.inhale.tech/changePermission/server

forever stop app.js

cd /home/ec2-user/crm.inhale.tech/changePermission/client

PORT=5173 forever stop -c "npm run dev" ./

Auth page for rights transfer is on the

https://crm.inhale.tech/

----------
certificates renewal

To work with the certificates for the domain 

sudo certbot certonly --nginx --preferred-challenges http -d crm.inhale.tech

NOTE:
Your certificate will expire on 2024-09-15. Renew before then

----------
To work with nginx:

sudo nano /etc/nginx/nginx.conf

change what is needed 

then 
sudo nginx -t

sudo systemctl start nginx

----------
General support

To see the logs of the process and check for errors:

forever list

Take the path to the log file and then: cat path-to-logs

--------------------------------------
Working with forever extension:

To check the list of all processes started

forever list

To stop all process

Forever stopall

--------------

ec2 deploy tutorial

https://www.youtube.com/watch?v=bmz0D_d4_cY&t=677s
