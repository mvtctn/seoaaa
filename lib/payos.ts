export const PAYOS_CLIENT_ID = process.env.PAYOS_CLIENT_ID || '';
export const PAYOS_API_KEY = process.env.PAYOS_API_KEY || '';
export const PAYOS_CHECKSUM_KEY = process.env.PAYOS_CHECKSUM_KEY || '';

const PayOS = require('@payos/node');

const payos = new PayOS(PAYOS_CLIENT_ID, PAYOS_API_KEY, PAYOS_CHECKSUM_KEY);

export default payos;
