FROM nginx:1.15-alpine

ADD ./bin/react-env_linux-amd64 /usr/bin/react-env

ADD nginx.conf /etc/nginx/nginx.conf

ADD entrypoint.sh /var/entrypoint.sh

ENTRYPOINT ["/var/entrypoint.sh"]

CMD ["nginx", "-g", "daemon off;"]
