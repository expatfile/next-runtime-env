FROM nginx:1.15-alpine

RUN apk add --no-cache nodejs

ADD nginx.conf /etc/nginx/nginx.conf

ADD entrypoint.sh /var/entrypoint.sh

ENTRYPOINT ["/var/entrypoint.sh"]

CMD ["nginx", "-g", "daemon off;"]
