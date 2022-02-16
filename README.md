Docker container that provides an HTTP service to generate either a preview video (mp4) or an image (png) from an HLS stream.

A NodeJS service based on [ffmpeg](https://ffmpeg.org/) for video processing and [fastify](https://fastify.io) to provide the HTTP API.

## Usage

```
docker run --rm -p 8000:8000 eyevinntechnology/hlspreview:<version>
```

Then make an HTTP GET request either to:

```
http://localhost:8000/video?u=http%3A%2F%2Fmaitv-vod.lab.eyevinn.technology%2FVINN.mp4%2Fmaster.m3u8
```

to generate a video/mp4. Or:

```
http://localhost:8000/image?u=http%3A%2F%2Fmaitv-vod.lab.eyevinn.technology%2FVINN.mp4%2Fmaster.m3u8
```

to generate an image/png.

The `u` parameter is the urlencoded URL to the HLS.

If you want to choose another position in the HLS you provide the query param `pos` where you specify a position in seconds.

# About Eyevinn Technology

Eyevinn Technology is an independent consultant firm specialized in video and streaming. Independent in a way that we are not commercially tied to any platform or technology vendor.

At Eyevinn, every software developer consultant has a dedicated budget reserved for open source development and contribution to the open source community. This give us room for innovation, team building and personal competence development. And also gives us as a company a way to contribute back to the open source community.

Want to know more about Eyevinn and how it is to work here. Contact us at work@eyevinn.se!