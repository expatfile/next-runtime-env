FROM golang:alpine AS build

WORKDIR $GOPATH/src

RUN apk update && apk add --no-cache git

ADD create-react-env.go .

RUN go get -d -v

RUN go build -o /go/bin/create-react-env

#############################

FROM nginx:1.15-alpine

COPY --from=build /go/bin/create-react-env /usr/bin/create-react-env

RUN chmod +x /usr/bin/create-react-env

ADD ./docker/nginx.conf /etc/nginx/nginx.conf

ADD ./docker/entrypoint.sh /var/entrypoint.sh

ENTRYPOINT ["/var/entrypoint.sh"]

CMD ["nginx", "-g", "daemon off;"]
