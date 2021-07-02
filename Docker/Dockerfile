FROM alpine:latest

WORKDIR /app/lightmelon/

RUN apk update && apk add --no-cache nmap && \
    echo @edge http://nl.alpinelinux.org/alpine/edge/community >> /etc/apk/repositories && \
    echo @edge http://nl.alpinelinux.org/alpine/edge/main >> /etc/apk/repositories && \
    apk update && \
    apk add --no-cache \
      chromium \
      harfbuzz \
      "freetype>2.8" \
      ttf-freefont \
      nss \
      nodejs \
      yarn \
      git

RUN git clone https://github.com/whati001/lightmelon.git ./

RUN yarn && \
    yarn lint && \
    yarn build

WORKDIR /app/lightmelon/

CMD ["/usr/bin/node", "./build/app.js"]