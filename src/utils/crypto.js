export const generateId = () => crypto.randomUUID();

export const hashPassword = async (password) => {
  const msgUint8 = new TextEncoder().encode(password);
  const hashBuffer = await crypto.subtle.digest('SHA-256', msgUint8);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  return hashHex;
};

// Simple HMAC-like signature for client-side integrity (not for production security against experts, 
// but prevents casual tampering of localStorage roles)
const getSecret = () => {
  let secret = localStorage.getItem('float_system_secret');
  if (!secret) {
    secret = generateId();
    localStorage.setItem('float_system_secret', secret);
  }
  return secret;
};

export const createSessionToken = async (user) => {
  const header = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
  const payload = btoa(JSON.stringify({ 
    ...user, 
    iat: Date.now(),
    exp: Date.now() + (24 * 60 * 60 * 1000) // 24h expiry
  }));
  
  const secret = getSecret();
  const signature = await hashPassword(`${header}.${payload}.${secret}`);
  
  return `${header}.${payload}.${signature}`;
};

export const verifySessionToken = async (token) => {
  if (!token) return null;
  const parts = token.split('.');
  if (parts.length !== 3) return null;

  const [header, payload, signature] = parts;
  const secret = getSecret();
  const expectedSignature = await hashPassword(`${header}.${payload}.${secret}`);

  if (signature !== expectedSignature) {
    console.error('Session token tampered');
    return null;
  }

  const decodedPayload = JSON.parse(atob(payload));
  if (decodedPayload.exp < Date.now()) {
    console.warn('Session expired');
    return null;
  }

  return decodedPayload;
};
