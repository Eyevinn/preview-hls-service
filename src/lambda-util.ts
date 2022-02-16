import { ALBEvent, ALBResult } from "aws-lambda";

export const normalizeParameters = (event: ALBEvent) => {
  // This is needed because Internet is a bit broken...
  const searchParams = new URLSearchParams(
    Object.keys(event.queryStringParameters)
      .map((k) => `${k}=${event.queryStringParameters[k]}`)
      .join("&")
  );
  let queryParams = {};
  for (let k of searchParams.keys()) {
    queryParams[k] = searchParams.get(k);
  }
  return queryParams;
}

export const generateErrorResponse = ({ code: code, message: message }): ALBResult => {
  let response: ALBResult = {
    statusCode: code,
    headers: {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Headers": "Content-Type, Origin",
      "Cache-Control": "no-cache",
    },
  };
  if (message) {
    response.body = JSON.stringify({ reason: message });
  }
  return response;
};