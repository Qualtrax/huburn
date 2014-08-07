FROM ubuntu:14.04
ENV DEBIAN_FRONTEND noninteractive

RUN apt-get -y update
RUN apt-get -y install software-properties-common

RUN add-apt-repository -y ppa:chris-lea/node.js
RUN apt-get -y update

RUN apt-get install -y git nodejs supervisor

RUN git clone -b master https://github.com/qualtrax/huburn /var/www/huburn
RUN cd /var/www/huburn && npm install
ADD config.js /var/www/huburn/config.js
ADD server.ca-bundle /var/www/huburn/server.ca-bundle
ADD server.key /var/www/huburn/server.key
ADD server.crt /var/www/huburn/server.crt

ADD supervisord.conf /etc/supervisor/conf.d/supervisord.conf

EXPOSE 8080
EXPOSE 8443

CMD ["/usr/bin/supervisord", "-n", "-c", "/etc/supervisor/conf.d/supervisord.conf"]
