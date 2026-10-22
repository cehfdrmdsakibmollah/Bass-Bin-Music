export const configuredUrl=process.env.NEXT_PUBLIC_SITE_URL?.trim()||'';
export const validUrl=/^https:\/\/[^/]+\.[^/]+/.test(configuredUrl);
export const SITE_URL=validUrl?configuredUrl.replace(/\/$/,''):'http://localhost:3000';
export const BRAND='BASS BIN MUSIC';
