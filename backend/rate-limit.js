/**
 * Dwarkesh GPT — Backend Rate Limiter, CORS & Input Validator
 */

var ipStore = new Map();

function checkRateLimit(req) {
  var limit = parseInt(process.env.RATE_LIMIT_REQUESTS || '20', 10);
  var windowMs = parseInt(process.env.RATE_LIMIT_WINDOW_MS || '60000', 10);

  var ip = req.headers['x-forwarded-for'] || req.headers['x-real-ip'] || req.socket.remoteAddress || '127.0.0.1';
  if (Array.isArray(ip)) ip = ip[0];
  ip = ip.split(',')[0].trim();

  var now = Date.now();
  var record = ipStore.get(ip);

  if (!record || (now - record.startTime) > windowMs) {
    record = { count: 1, startTime: now };
    ipStore.set(ip, record);
    return { allowed: true, remaining: limit - 1, resetMs: windowMs };
  }

  if (record.count >= limit) {
    return { allowed: false, remaining: 0, resetMs: windowMs - (now - record.startTime) };
  }

  record.count += 1;
  return { allowed: true, remaining: limit - record.count, resetMs: windowMs - (now - record.startTime) };
}

function handleCors(req, res) {
  var allowedOrigins = (process.env.ALLOWED_ORIGINS || 'https://www.dwarkeshpolyfab.com').split(',').map(function(s) { return s.trim(); });
  var requestOrigin = req.headers.origin || '';

  var isAllowed = allowedOrigins.some(function(allowed) {
    if (allowed === '*') return true;
    if (requestOrigin === allowed) return true;
    if (allowed.includes('localhost') && requestOrigin.includes('localhost')) return true;
    return false;
  });

  var originToSet = isAllowed ? requestOrigin : allowedOrigins[0];
  res.setHeader('Access-Control-Allow-Origin', originToSet || '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    res.statusCode = 204;
    res.end();
    return true; // Handled preflight
  }
  return false;
}

function validateChatInput(body) {
  if (!body || typeof body !== 'object') {
    return { valid: false, error: 'Invalid JSON request payload.' };
  }

  if (!body.messages || !Array.isArray(body.messages) || body.messages.length === 0) {
    return { valid: false, error: 'Request body must include a non-empty messages array.' };
  }

  if (body.messages.length > 20) {
    return { valid: false, error: 'Message history exceeds maximum allowed length of 20 messages.' };
  }

  for (var i = 0; i < body.messages.length; i++) {
    var msg = body.messages[i];
    if (!msg || typeof msg !== 'object') {
      return { valid: false, error: 'Each message must be an object.' };
    }
    if (!['user', 'assistant', 'system'].includes(msg.role)) {
      return { valid: false, error: 'Invalid role in message history: ' + msg.role };
    }
    if (typeof msg.content !== 'string') {
      return { valid: false, error: 'Message content must be a string.' };
    }
    if (msg.role === 'user' && msg.content.length > 1500) {
      return { valid: false, error: 'User message exceeds maximum length limit of 1500 characters.' };
    }
  }

  var convId = body.conversation_id;
  if (convId && (typeof convId !== 'string' || convId.length > 100)) {
    return { valid: false, error: 'Invalid conversation_id format.' };
  }

  return { valid: true };
}

module.exports = {
  checkRateLimit: checkRateLimit,
  handleCors: handleCors,
  validateChatInput: validateChatInput
};
