import { Response } from 'express';

export interface CookieOptions {
  httpOnly?: boolean;
  secure?: boolean;
  sameSite?: 'strict' | 'lax' | 'none';
  maxAge?: number;
  path?: string;
}

export const setCookie = (
  response: Response,
  name: string,
  value: string,
  options: CookieOptions = {},
): void => {
  const defaultOptions: CookieOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'none',
    maxAge: 1000 * 60 * 60,
    path: '/',
  };

  const cookieOptions = { ...defaultOptions, ...options };
  response.cookie(name, value, cookieOptions);
};
