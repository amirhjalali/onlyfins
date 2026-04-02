FROM alexxit/go2rtc:latest

COPY stream/go2rtc.yaml /config/go2rtc.yaml

EXPOSE 1984 8554 8555

ENTRYPOINT ["go2rtc", "-c", "/config/go2rtc.yaml"]
