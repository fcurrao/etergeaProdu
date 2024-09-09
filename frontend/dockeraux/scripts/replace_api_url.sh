envsubst < /usr/share/nginx/html/assets/environment/env.template.js > /usr/share/nginx/html/assets/environment/env.js && nginx -g 'daemon off;'
