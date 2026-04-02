FROM alexxit/go2rtc:latest

COPY stream/entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

EXPOSE 1984 8554 8555

ENTRYPOINT ["/entrypoint.sh"]
