import { Request } from 'express';

export interface ParsedCookies {
  [key: string]: string;
}

export const parseCookieString = (cookieString: string): ParsedCookies => {
  const cookies: ParsedCookies = {};

  if (!cookieString) return cookies;

  cookieString.split(';').forEach((cookie) => {
    const trimmedCookie = cookie.trim();
    const [name, ...valueParts] = trimmedCookie.split('=');

    if (name && valueParts.length > 0) {
      const value = valueParts.join('=');

      try {
        cookies[name.trim()] = decodeURIComponent(value);
      } catch (error) {
        cookies[name.trim()] = value;
      }
    }
  });

  return cookies;
};

export const parseCookies = (request: Request): ParsedCookies => {
  const cookieHeader = request.headers.cookie;

  if (!cookieHeader) return {};

  return parseCookieString(cookieHeader);
};

export const getCookie = (
  request: Request,
  cookieName: string
): string | undefined => {
  const cookies = parseCookies(request);
  return cookies[cookieName];
};
