/**
 * Dwarkesh GPT — Vercel Serverless API Endpoint
 * Path: POST /api/chat
 */

var rateLimit = require('../backend/rate-limit');
var openAiBackend = require('../backend/openai');

module.exports = async function handler(req, res) {
  // 1. Handle CORS Preflight & Headers
  if (rateLimit.handleCors(req, res)) {
    return;
  }

  // 2. HTTP Method Validation
  if (req.method !== 'POST') {
    res.statusCode = 455; // Method Not Allowed
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({
      status: 'error',
      error_code: 'METHOD_NOT_ALLOWED',
      message: 'Only POST requests are supported at /api/chat.'
    }));
    return;
  }

  var convId = (req.body && req.body.conversation_id) || ('sess_' + Date.now());

  try {
    // 3. Rate Limit Check
    var limitResult = rateLimit.checkRateLimit(req);
    if (!limitResult.allowed) {
      res.statusCode = 429;
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify({
        status: 'error',
        error_code: 'RATE_LIMIT_EXCEEDED',
        message: 'Rate limit exceeded. Please wait a moment or connect directly with our sales desk on WhatsApp (+91 8320525550).',
        conversation_id: convId
      }));
      return;
    }

    // 4. Input Payload Validation
    var validation = rateLimit.validateChatInput(req.body);
    if (!validation.valid) {
      res.statusCode = 400;
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify({
        status: 'error',
        error_code: 'INVALID_REQUEST',
        message: validation.error,
        conversation_id: convId
      }));
      return;
    }

    // 5. Execute OpenAI Conversation & Tool Loop
    var result = await openAiBackend.processChatConversation(req.body.messages, convId);

    res.statusCode = 200;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify(result));

  } catch (err) {
    console.error('Dwarkesh GPT API Error:', err.message);

    res.statusCode = 500;
    res.setHeader('Content-Type', 'application/json');

    var userErrorMessage = 'Our AI service encountered a temporary error. For immediate assistance, please contact our team directly at +91 8320525550 or on WhatsApp.';
    if (err.message && err.message.includes('OPENAI_API_KEY')) {
      userErrorMessage = 'Server API configuration pending. Please contact factory sales directly at +91 8320525550.';
    }

    res.end(JSON.stringify({
      status: 'error',
      error_code: 'INTERNAL_SERVER_ERROR',
      message: userErrorMessage,
      conversation_id: convId
    }));
  }
};
