# Dashboardsy

A modern client panel for pterodactyl, made by Wrible Development.   
Support Discord: [https://discord.gg/zVcDkSZNu7](https://discord.gg/zVcDkSZNu7)

## Setting up
This guide is only for debian-based distributions of GNU/Linux.   
This is fairly easy to install, first install NodeJS 16 via the following commands (run them as root):   
```sh
apt-get install curl git nginx software-properties-common 
curl -sL https://deb.nodesource.com/setup_16.x | bash - 
```   
Then we need to install mysql, here's a guide to installing mariadb (skip the admin account step): [https://www.digitalocean.com/community/tutorials/how-to-install-mariadb-on-ubuntu-20-04](https://www.digitalocean.com/community/tutorials/how-to-install-mariadb-on-ubuntu-20-04)   
Now create a new user and a database in mariadb using the following commands: First run `mariadb -u root` as the root user to open mariadb. Then enter the following, make sure to change the password to something secure and note it down somewhere.   
```sql
CREATE DATABASE dashboardsy;
CREATE USER 'dashboardsy'@'localhost' IDENTIFIED BY 'thisispassword-changeit';
GRANT ALL PRIVILEGES ON dashboardsy.* TO 'dashboardsy'@'localhost';
FLUSH PRIVILEGES;
```   
Then clone this repository locally using git: `git clone https://github.com/Wrible-Development/Dashboardsy`   
Then cd to the directory where you cloned the repo   
Run `mv .env.example .env`   
Edit next.config.js (only edit the stuff in the env in next.config.js), .env and config.json according to your needs (don't change NEXTAUTH_URL_INTERNAL, only change NEXTAUTH_URL to the website url of your dashboard).   
Go to [discord.dev](https://discord.com/developers/applications) and create a new application, copy the client secret and client ID and put them in next.config.js   
Now select the application on discord.dev and go to the Oauth2 tab and add a redirect url with the value `https://dash.example.com/api/auth/callback/discord` (make sure to change the domain from the example one)   
Now set public/favicon.png to your logo.   
Install the dependencies using npm and install pm2 and build the dashboard:   
```sh
npm install
npm install -g pm2
npm run build
```
Finally to start the dashboard, run the following command `pm2 start --name=dashboardsy npm -- start`   

Now do the following to configure nginx.
`systemctl start nginx`  
`certbot certonly --nginx -d your.domain.com`  
`cd /etc/nginx/conf.d`  
`touch dashboardsy.conf`  
`nano dashboardsy.conf`  
Now paste the following:  
```nginx
server {
    listen 80;
    server_name <domain>;
    return 301 https://$server_name$request_uri;
}
server {
    listen 443 ssl http2;    
    server_name <domain>;
ssl_certificate /etc/letsencrypt/live/<domain>/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/<domain>/privkey.pem;
    ssl_session_cache shared:SSL:10m;
    ssl_protocols SSLv3 TLSv1 TLSv1.1 TLSv1.2;
    ssl_ciphers  HIGH:!aNULL:!MD5;
    ssl_prefer_server_ciphers on;
location / {
      proxy_pass http://localhost:3000/;
      proxy_buffering off;
      proxy_set_header X-Real-IP $remote_addr;
  }
}
```  
Make sure to replace `<domain>` with the domain.  
Now run `systemctl restart nginx` and you should be good to go.

## File Structure
```
.
├── components
│   ├── Card.js
│   ├── Layout.js
│   └── Table.js
├── lib
│   ├── cache.js
│   └── useIsTouchDevice.js
├── pages
│   ├── api
│   │   ├── admin
│   │   │   ├── addCoins.js
│   │   │   └── _middleware.js
│   │   ├── auth
│   │   │   └── [...nextauth].js
│   │   └── user
│   │       ├── createServer.js
│   │       ├── deleteServer.js
│   │       ├── editServer.js
│   │       ├── fixUser.js
│   │       ├── regenPass.js
│   │       └── shop.js
│   ├── _app.js
│   ├── index.js
│   └── _middleware.js
├── public
│   └── favicon.png
├── config.json
├── db.js
├── LICENSE
├── next.config.js
├── package.json
├── package-lock.json
├── README.md
└── theme.js

8 directories, 26 files
```