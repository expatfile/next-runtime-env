FROM golang:alpine AS build

WORKDIR $GOPATH/src

RUN apk update && apk add --no-cache git

ADD react-env.go .

ADD ./scripts/build-matrix.sh .

ADD ./scripts/build.sh .

RUN go get -d -v

CMD ./build-matrix.sh