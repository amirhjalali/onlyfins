FROM alexxit/go2rtc:latest

# Install envsubst (part of gettext)
RUN apk add --no-cache gettext

COPY stream/go2rtc.yaml /config/go2rtc.yaml.template
COPY stream/entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

EXPOSE 1984 8554 8555

ENTRYPOINT ["/entrypoint.sh"]
