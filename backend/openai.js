/**
 * Dwarkesh GPT — OpenAI API Client Integration Module
 * 
 * Configured via process.env.OPENAI_MODEL and process.env.OPENAI_API_KEY.
 * Executes multi-turn tool loops deterministically and normalizes final output.
 */

var OpenAI = require('openai');
var loader = require('../knowledge/loader');
var toolsEngine = require('./tools');

function getOpenAIClient() {
  var apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    throw new Error('OPENAI_API_KEY environment variable is not configured.');
  }
  return new OpenAI({ apiKey: apiKey });
}

async function processChatConversation(messages, conversationId) {
  var client = getOpenAIClient();
  var modelName = process.env.OPENAI_MODEL || 'gpt-4o-mini';
  var maxTokens = parseInt(process.env.MAX_RESPONSE_TOKENS || '800', 10);

  // 1. Build System Knowledge Context from Dwarkesh Brain
  var systemPromptText = loader.getSystemKnowledgePrompt();
  var fullMessages = [
    { role: 'system', content: systemPromptText }
  ];

  // Append user & assistant history (max last 10 messages)
  var recentHistory = messages.slice(-10);
  for (var i = 0; i < recentHistory.length; i++) {
    fullMessages.push({
      role: recentHistory[i].role,
      content: recentHistory[i].content
    });
  }

  var actionButtons = [];
  var maxIterations = 5;
  var iteration = 0;
  var finalReplyText = '';

  // 2. OpenAI Execution Loop with Tool Calling
  while (iteration < maxIterations) {
    iteration++;

    var response = await client.chat.completions.create({
      model: modelName,
      messages: fullMessages,
      tools: toolsEngine.toolDeclarations,
      tool_choice: 'auto',
      max_tokens: maxTokens,
      temperature: 0.3
    });

    var choice = response.choices[0];
    var responseMessage = choice.message;

    // Append response message to conversation array
    fullMessages.push(responseMessage);

    // If model returned text content
    if (responseMessage.content) {
      finalReplyText = responseMessage.content;
    }

    // Check if model requested tool calls
    if (choice.finish_reason === 'tool_calls' && responseMessage.tool_calls && responseMessage.tool_calls.length > 0) {
      for (var t = 0; t < responseMessage.tool_calls.length; t++) {
        var toolCall = responseMessage.tool_calls[t];
        var fnName = toolCall.function.name;
        var fnArgs = {};

        try {
          fnArgs = JSON.parse(toolCall.function.arguments || '{}');
        } catch (e) {
          fnArgs = {};
        }

        var toolResult = {};
        try {
          toolResult = toolsEngine.executeTool(fnName, fnArgs);
        } catch (err) {
          toolResult = { error: err.message };
        }

        // Collect action buttons if tool generated URLs
        if (toolResult.action_type === 'whatsapp' && toolResult.url) {
          actionButtons.push({
            type: 'whatsapp',
            label: toolResult.label || '📱 WhatsApp Quote',
            url: toolResult.url
          });
        }
        if (toolResult.url && toolResult.action_type !== 'whatsapp') {
          actionButtons.push({
            type: 'link',
            label: toolResult.label || toolResult.title || '🔗 View Page',
            url: toolResult.url
          });
        }

        // Feed tool result back to OpenAI
        fullMessages.push({
          tool_call_id: toolCall.id,
          role: 'tool',
          name: fnName,
          content: JSON.stringify(toolResult)
        });
      }
      // Continue loop for final synthesis
    } else {
      // Model finished without further tool calls
      break;
    }
  }

  // Deduplicate action buttons by URL
  var uniqueButtons = [];
  var seenUrls = {};
  for (var b = 0; b < actionButtons.length; b++) {
    if (!seenUrls[actionButtons[b].url]) {
      seenUrls[actionButtons[b].url] = true;
      uniqueButtons.push(actionButtons[b]);
    }
  }

  return {
    status: 'success',
    reply: finalReplyText || 'I am here to assist with Dwarkesh Polyfab products and calculations. How can I help you?',
    action_buttons: uniqueButtons,
    conversation_id: conversationId || ('sess_' + Date.now())
  };
}

module.exports = {
  processChatConversation: processChatConversation
};
