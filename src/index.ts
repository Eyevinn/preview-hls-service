import Debug from "debug";
const debug = Debug("preview-hls");
import { ALBHandler, ALBEvent, ALBResult } from "aws-lambda";

import { normalizeParameters, generateErrorResponse } from "./lambda-util";
import { fetchAndParseHLS, findSegmentAtPosition } from "./m3u8-util";
import { renderMp4FromTS, renderPngFromTS } from "./video-util";

export const handler: ALBHandler = async (event: ALBEvent): Promise<ALBResult> => {
  event.queryStringParameters = normalizeParameters(event);
  let response: ALBResult;
  try {
    if (event.httpMethod === "GET") {
      if (event.path.match(/\/video$/) && event.queryStringParameters["u"]) {
        response = await handlePreviewVideoRequest(event);
      } else if (event.path.match(/\/image$/) && event.queryStringParameters["u"]) {
        response = await handlePreviewImageRequest(event);
      } else {
        response = generateErrorResponse({
          code: 404,
          message: "Invalid resource requested",
        });
      }
    }
  } catch(error) {
    console.error(error);
    response = generateErrorResponse({
      code: 500,
      message: error.message ? error.message : error,
    });
  }
  return response;
}

const handlePreviewVideoRequest = async (event: ALBEvent): Promise<ALBResult> => {
  const searchParams = new URLSearchParams(event.queryStringParameters);
  try {
    const m3u = await fetchAndParseHLS(searchParams.get("u"));
    const pos = searchParams.get("pos") || 0;
    if (pos < 0) {
      throw new Error("invalid position requested");
    }
    const segmentUrl = findSegmentAtPosition(m3u, pos).get("uri");
    const data = await renderMp4FromTS(segmentUrl);
    const buffer = Buffer.from(data);
    return {
      statusCode: 200,
      headers: {
        "Content-Type": "video/mp4",
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "Content-Type, Origin",
        "Cache-Control": "max-age=3600",
      },
      isBase64Encoded: true,
      body: buffer.toString("base64"),
    }
  } catch (error) {
    console.error(error);
    return generateErrorResponse({
      code: error.code || 500,
      message: error.message ? error.message : error,
    });
  }
}

const handlePreviewImageRequest = async (event: ALBEvent): Promise<ALBResult> => {
  const searchParams = new URLSearchParams(event.queryStringParameters);
  try {
    const m3u = await fetchAndParseHLS(searchParams.get("u"));
    const pos = searchParams.get("pos") || 0;
    if (pos < 0) {
      throw new Error("invalid position requested");
    }
    const segmentUrl = findSegmentAtPosition(m3u, pos).get("uri");
    const data = await renderPngFromTS(segmentUrl);
    const buffer = Buffer.from(data);
    return {
      statusCode: 200,
      headers: {
        "Content-Type": "image/png",
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "Content-Type, Origin",
        "Cache-Control": "max-age=3600",
      },
      isBase64Encoded: true,
      body: buffer.toString("base64"),
    }
  } catch (error) {
    console.error(error);
    return generateErrorResponse({
      code: error.code || 500,
      message: error.message ? error.message : error,
    });
  }
}