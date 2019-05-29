FROM nginx:1.15-alpine

ADD ./golang/bin/react-env_linux-amd64 /usr/bin/react-env

ADD ./docker/nginx.conf /etc/nginx/nginx.conf

ADD ./docker/entrypoint.sh /var/entrypoint.sh

ENTRYPOINT ["/var/entrypoint.sh"]

CMD ["nginx", "-g", "daemon off;"]
