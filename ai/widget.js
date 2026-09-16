/**
 * Dwarkesh GPT Floating Chat Widget
 * Embeddable on any page — add ONE line to any page:
 * <script src="/ai/widget.js" defer></script>
 * 
 * Branding: Dwarkesh GPT — "Talk to know more"
 * Ultra-Luxury Midnight & Gold Design
 */

(function () {
  'use strict';

  var ENGINE_URL = 'chat-engine.js';

  // Inject luxury dark & gold widget styles
  var style = document.createElement('style');
  style.textContent = `
    /* Floating FAB */
    #dp-chat-fab {
      position: fixed;
      bottom: 28px;
      right: 24px;
      z-index: 99999;
      display: flex;
      flex-direction: column;
      align-items: flex-end;
      gap: 10px;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
    }

    #dp-chat-bubble-hint {
      background: linear-gradient(135deg, #0f172a 0%, #152238 100%);
      color: #fff;
      border: 1px solid rgba(212, 175, 55, 0.4);
      border-radius: 14px 14px 2px 14px;
      padding: 10px 15px;
      font-size: 13px;
      font-weight: 600;
      max-width: 220px;
      box-shadow: 0 8px 24px rgba(0,0,0,0.4), 0 0 16px rgba(212, 175, 55, 0.15);
      position: relative;
      cursor: pointer;
      animation: dp-bounce-in 0.4s cubic-bezier(.34,1.56,.64,1) forwards;
      line-height: 1.4;
    }
    #dp-chat-bubble-hint strong { color: #f3e5ab; }
    #dp-chat-bubble-hint .dp-hint-close {
      position: absolute;
      top: 5px; right: 8px;
      font-size: 15px;
      cursor: pointer;
      opacity: 0.6;
    }
    #dp-chat-bubble-hint .dp-hint-close:hover { opacity: 1; }

    #dp-chat-btn {
      width: 60px;
      height: 60px;
      border-radius: 50%;
      background: linear-gradient(135deg, #09101f 0%, #16243d 100%);
      border: 2px solid #d4af37;
      box-shadow: 0 8px 30px rgba(0,0,0,0.5), 0 0 20px rgba(212, 175, 55, 0.25);
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: transform 0.2s, box-shadow 0.2s;
      position: relative;
    }
    #dp-chat-btn:hover { transform: scale(1.08); box-shadow: 0 10px 36px rgba(212, 175, 55, 0.35); }
    #dp-chat-btn svg { width: 28px; height: 28px; }
    #dp-chat-btn .dp-notif-dot {
      position: absolute;
      top: 2px; right: 2px;
      width: 12px; height: 12px;
      background: #2ecc71;
      border: 2px solid #09101f;
      border-radius: 50%;
      animation: dp-pulse 2s infinite;
    }

    @keyframes dp-bounce-in {
      from { opacity: 0; transform: scale(0.7) translateY(10px); }
      to { opacity: 1; transform: scale(1) translateY(0); }
    }
    @keyframes dp-pulse {
      0%, 100% { transform: scale(1); }
      50% { transform: scale(1.25); }
    }

    /* Popup Container */
    #dp-chat-popup {
      position: fixed;
      bottom: 100px;
      right: 24px;
      width: 380px;
      max-width: calc(100vw - 32px);
      height: 560px;
      max-height: calc(100vh - 120px);
      background: #0e1526;
      border: 1px solid rgba(212, 175, 55, 0.35);
      border-radius: 20px;
      box-shadow: 0 16px 50px rgba(0,0,0,0.6), 0 0 30px rgba(212, 175, 55, 0.1);
      z-index: 99998;
      display: none;
      flex-direction: column;
      overflow: hidden;
      animation: dp-popup-in 0.3s cubic-bezier(.34,1.56,.64,1) forwards;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
    }
    #dp-chat-popup.open { display: flex; }

    @keyframes dp-popup-in {
      from { opacity: 0; transform: scale(0.92) translateY(16px); transform-origin: bottom right; }
      to { opacity: 1; transform: scale(1) translateY(0); }
    }

    /* Header */
    .dp-chat-header {
      background: linear-gradient(135deg, #09101f 0%, #152238 100%);
      padding: 14px 16px;
      display: flex;
      align-items: center;
      gap: 12px;
      flex-shrink: 0;
      border-bottom: 1px solid rgba(212, 175, 55, 0.3);
    }
    .dp-chat-header-avatar {
      width: 38px; height: 38px;
      background: linear-gradient(135deg, #d4af37, #9a7b20);
      border-radius: 50%;
      display: flex; align-items: center; justify-content: center;
      font-size: 20px;
      flex-shrink: 0;
      box-shadow: 0 0 12px rgba(212, 175, 55, 0.3);
    }
    .dp-chat-header-info { flex: 1; }
    .dp-chat-header-name { color: #fff; font-weight: 800; font-size: 15px; line-height: 1.2; }
    .dp-chat-header-sub { color: #f3e5ab; font-size: 11px; font-style: italic; margin-top: 2px; }
    .dp-chat-close {
      background: rgba(255,255,255,0.08);
      border: none; color: #fff;
      width: 30px; height: 30px;
      border-radius: 50%;
      font-size: 18px;
      cursor: pointer;
      display: flex; align-items: center; justify-content: center;
    }
    .dp-chat-close:hover { background: rgba(255,255,255,0.18); }

    /* Top Link Bar */
    .dp-chat-toplink {
      background: rgba(19, 29, 51, 0.9);
      border-bottom: 1px solid rgba(255,255,255,0.05);
      padding: 8px 14px;
      font-size: 11.5px;
      color: #f3e5ab;
      font-weight: 600;
      flex-shrink: 0;
      display: flex;
      align-items: center;
      gap: 8px;
    }
    .dp-chat-toplink a { color: #ffffff; text-decoration: none; font-weight: 700; }
    .dp-chat-toplink a:hover { text-decoration: underline; color: #d4af37; }

    /* Messages */
    .dp-chat-messages {
      flex: 1;
      overflow-y: auto;
      padding: 14px;
      display: flex;
      flex-direction: column;
      gap: 10px;
      background: #0b1120;
      scroll-behavior: smooth;
    }
    .dp-chat-messages::-webkit-scrollbar { width: 4px; }
    .dp-chat-messages::-webkit-scrollbar-thumb { background: rgba(212, 175, 55, 0.2); border-radius: 4px; }

    .dp-msg {
      display: flex;
      gap: 8px;
      align-items: flex-end;
      max-width: 92%;
    }
    .dp-msg.user { flex-direction: row-reverse; align-self: flex-end; }
    .dp-msg.bot { align-self: flex-start; }

    .dp-msg-avatar {
      width: 28px; height: 28px;
      border-radius: 50%;
      font-size: 13px;
      display: flex; align-items: center; justify-content: center;
      flex-shrink: 0;
    }
    .dp-msg.bot .dp-msg-avatar { background: linear-gradient(135deg, #d4af37, #826615); color: #000; }
    .dp-msg.user .dp-msg-avatar { background: rgba(255,255,255,0.1); color: #fff; }

    .dp-msg-bubble {
      padding: 10px 13px;
      border-radius: 14px;
      font-size: 13.5px;
      line-height: 1.55;
      word-break: break-word;
    }
    .dp-msg.bot .dp-msg-bubble {
      background: #121c30;
      color: #f1f5f9;
      border: 1px solid rgba(212, 175, 55, 0.25);
      border-bottom-left-radius: 4px;
    }
    .dp-msg.user .dp-msg-bubble {
      background: linear-gradient(135deg, #d4af37 0%, #b89228 100%);
      color: #080c14;
      font-weight: 600;
      border-bottom-right-radius: 4px;
    }
    .dp-msg-bubble strong { color: #fff; }
    .dp-msg.user .dp-msg-bubble strong { color: #000; }

    .dp-wa-btn {
      display: inline-flex;
      align-items: center;
      gap: 7px;
      background: #25d366;
      color: #fff !important;
      text-decoration: none !important;
      border-radius: 8px;
      padding: 8px 13px;
      font-size: 12px;
      font-weight: 800;
      margin-top: 10px;
    }

    .dp-calc-btn {
      display: inline-flex;
      align-items: center;
      gap: 7px;
      background: linear-gradient(135deg, #d4af37, #9a7b20);
      color: #000 !important;
      text-decoration: none !important;
      border-radius: 8px;
      padding: 8px 13px;
      font-size: 12px;
      font-weight: 800;
      margin-top: 10px;
    }

    .dp-quick-replies {
      display: flex;
      flex-wrap: wrap;
      gap: 6px;
      padding: 4px 0;
    }
    .dp-qr-btn {
      background: rgba(255,255,255,0.05);
      border: 1px solid rgba(212, 175, 55, 0.35);
      color: #f3e5ab;
      border-radius: 20px;
      padding: 5px 11px;
      font-size: 11.5px;
      font-weight: 700;
      cursor: pointer;
    }
    .dp-qr-btn:hover { background: #d4af37; color: #000; }

    .dp-typing {
      display: flex;
      gap: 5px;
      align-items: center;
      padding: 10px 14px;
      background: #121c30;
      border: 1px solid rgba(212, 175, 55, 0.25);
      border-radius: 14px;
      border-bottom-left-radius: 4px;
      width: 58px;
    }
    .dp-typing span {
      width: 7px; height: 7px;
      background: #d4af37;
      border-radius: 50%;
      animation: dp-typing 1.2s infinite;
    }
    .dp-typing span:nth-child(2) { animation-delay: 0.2s; }
    .dp-typing span:nth-child(3) { animation-delay: 0.4s; }
    @keyframes dp-typing {
      0%, 60%, 100% { transform: translateY(0); opacity: 0.3; }
      30% { transform: translateY(-5px); opacity: 1; }
    }

    /* Input Area */
    .dp-chat-input-area {
      padding: 10px 12px;
      background: #0e172a;
      border-top: 1px solid rgba(255,255,255,0.08);
      display: flex;
      gap: 8px;
      align-items: flex-end;
      flex-shrink: 0;
    }
    .dp-chat-input {
      flex: 1;
      border: 1px solid rgba(212, 175, 55, 0.35);
      border-radius: 10px;
      padding: 10px 12px;
      font-size: 13.5px;
      font-family: inherit;
      resize: none;
      min-height: 42px;
      max-height: 100px;
      outline: none;
      color: #fff;
      background: #131d33;
    }
    .dp-chat-input:focus { border-color: #d4af37; }
    .dp-chat-send {
      width: 42px; height: 42px;
      background: linear-gradient(135deg, #d4af37, #9a7b20);
      border: none;
      border-radius: 10px;
      cursor: pointer;
      display: flex; align-items: center; justify-content: center;
      flex-shrink: 0;
    }
    .dp-chat-send svg { width: 18px; height: 18px; }

    /* Footer */
    .dp-chat-footer {
      text-align: center;
      font-size: 10px;
      color: #94a3b8;
      padding: 5px 0 8px;
      background: #0e172a;
      flex-shrink: 0;
      border-top: 1px solid rgba(255,255,255,0.04);
    }
    .dp-chat-footer a { color: #f3e5ab; text-decoration: none; font-weight: 700; }

    @media (max-width: 480px) {
      #dp-chat-popup { right: 0; bottom: 0; width: 100vw; height: 100vh; max-height: 100vh; border-radius: 0; }
      #dp-chat-fab { bottom: 18px; right: 16px; }
    }
  `;
  document.head.appendChild(style);

  // Build FAB element
  var fab = document.createElement('div');
  fab.id = 'dp-chat-fab';
  fab.innerHTML = `
    <div id="dp-chat-bubble-hint">
      <span class="dp-hint-close" id="dp-hint-close">×</span>
      <strong>🤖 Dwarkesh GPT</strong><br>
      <em>"Talk to know more"</em>
    </div>
    <button id="dp-chat-btn" aria-label="Open Dwarkesh GPT AI">
      <div class="dp-notif-dot"></div>
      <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M12 2C6.48 2 2 6.02 2 11C2 13.03 2.74 14.92 4 16.41V21L8.13 18.87C9.36 19.27 10.66 19.5 12 19.5C17.52 19.5 22 15.48 22 10.5C22 5.52 17.52 2 12 2Z" fill="#d4af37"/>
        <circle cx="8" cy="11" r="1.2" fill="#09101f"/>
        <circle cx="12" cy="11" r="1.2" fill="#09101f"/>
        <circle cx="16" cy="11" r="1.2" fill="#09101f"/>
      </svg>
    </button>
  `;

  // Build Popup element
  var popup = document.createElement('div');
  popup.id = 'dp-chat-popup';
  popup.innerHTML = `
    <div class="dp-chat-header">
      <div class="dp-chat-header-avatar">🤖</div>
      <div class="dp-chat-header-info">
        <div class="dp-chat-header-name">Dwarkesh GPT</div>
        <div class="dp-chat-header-sub">"Talk to know more"</div>
      </div>
      <button class="dp-chat-close" id="dp-chat-close-btn">×</button>
    </div>
    <div class="dp-chat-toplink">
      ✨ <a href="/ai/" target="_blank">Full Dwarkesh GPT Page</a> &nbsp;•&nbsp; 
      <a href="/calculators/index.html">PP Calculator</a>
    </div>
    <div class="dp-chat-messages" id="dp-chat-messages"></div>
    <div class="dp-chat-input-area">
      <textarea class="dp-chat-input" id="dp-chat-input" 
        placeholder="Ask about bag specs, Morbi plant, PP granules, or size..." 
        rows="1" aria-label="Chat message"></textarea>
      <button class="dp-chat-send" id="dp-chat-send" aria-label="Send message">
        <svg viewBox="0 0 24 24" fill="none">
          <path d="M22 2L11 13" stroke="#000" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
          <path d="M22 2L15 22L11 13L2 9L22 2Z" stroke="#000" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
      </button>
    </div>
    <div class="dp-chat-footer">Powered by <a href="/ai/" target="_blank">Dwarkesh GPT</a> • dwarkeshpolyfab.com</div>
  `;

  document.body.appendChild(fab);
  document.body.appendChild(popup);

  var isOpen = false;
  var chatState = {};

  function loadEngine(cb) {
    if (window.DPChatEngine) { cb(); return; }
    var s = document.createElement('script');
    s.src = ENGINE_URL;
    s.onload = function () { cb(); };
    document.head.appendChild(s);
  }

  function getEl(id) { return document.getElementById(id); }

  function scrollBottom() {
    var msgs = getEl('dp-chat-messages');
    if (msgs) msgs.scrollTop = msgs.scrollHeight;
  }

  function appendMessage(role, html, quickReplies) {
    var msgs = getEl('dp-chat-messages');
    if (!msgs) return;

    var msgDiv = document.createElement('div');
    msgDiv.className = 'dp-msg ' + role;

    var avatar = role === 'bot' ? '🤖' : '👤';
    msgDiv.innerHTML = '<div class="dp-msg-avatar">' + avatar + '</div><div class="dp-msg-bubble">' + html + '</div>';
    msgs.appendChild(msgDiv);

    if (quickReplies && quickReplies.length > 0) {
      var qrDiv = document.createElement('div');
      qrDiv.className = 'dp-quick-replies';
      quickReplies.forEach(function (qr) {
        var btn = document.createElement('button');
        btn.className = 'dp-qr-btn';
        btn.textContent = qr.label;
        btn.onclick = function () {
          qrDiv.remove();
          sendMessage(qr.msg);
        };
        qrDiv.appendChild(btn);
      });
      msgs.appendChild(qrDiv);
    }
    scrollBottom();
  }

  function showTyping() {
    var msgs = getEl('dp-chat-messages');
    if (!msgs) return null;
    var typing = document.createElement('div');
    typing.className = 'dp-msg bot';
    typing.id = 'dp-typing-indicator';
    typing.innerHTML = '<div class="dp-msg-avatar">🤖</div><div class="dp-typing"><span></span><span></span><span></span></div>';
    msgs.appendChild(typing);
    scrollBottom();
    return typing;
  }

  function removeTyping() {
    var t = getEl('dp-typing-indicator');
    if (t) t.remove();
  }

  function sendMessage(text) {
    if (!text || !text.trim()) return;
    appendMessage('user', text);
    showTyping();

    loadEngine(function () {
      setTimeout(function () {
        removeTyping();
        var result = window.DPChatEngine.getResponse(text, chatState);
        chatState = result.newState || {};
        appendMessage('bot', result.html, result.quickReplies);
      }, 400 + Math.random() * 300);
    });
  }

  function openChat() {
    isOpen = true;
    popup.classList.add('open');
    var hint = getEl('dp-chat-bubble-hint');
    if (hint) hint.style.display = 'none';

    var msgs = getEl('dp-chat-messages');
    if (msgs && msgs.children.length === 0) {
      loadEngine(function () {
        var result = window.DPChatEngine.getResponse('hello', {});
        chatState = result.newState || {};
        appendMessage('bot', result.html, result.quickReplies);
      });
    }

    setTimeout(function () {
      var input = getEl('dp-chat-input');
      if (input) input.focus();
    }, 300);
  }

  function closeChat() {
    isOpen = false;
    popup.classList.remove('open');
  }

  getEl('dp-chat-btn').onclick = function () {
    if (isOpen) closeChat(); else openChat();
  };

  getEl('dp-chat-close-btn').onclick = closeChat;

  getEl('dp-hint-close').onclick = function (e) {
    e.stopPropagation();
    getEl('dp-chat-bubble-hint').style.display = 'none';
  };

  getEl('dp-chat-bubble-hint').onclick = openChat;

  getEl('dp-chat-send').onclick = function () {
    var input = getEl('dp-chat-input');
    var text = input.value.trim();
    if (!text) return;
    input.value = '';
    input.style.height = 'auto';
    sendMessage(text);
  };

  var inputEl = getEl('dp-chat-input');
  inputEl.onkeydown = function (e) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      getEl('dp-chat-send').click();
    }
  };
  inputEl.oninput = function () {
    this.style.height = 'auto';
    this.style.height = Math.min(this.scrollHeight, 100) + 'px';
  };

  setTimeout(function () {
    var hint = getEl('dp-chat-bubble-hint');
    if (hint && !isOpen) hint.style.display = 'none';
  }, 7000);

  setTimeout(function () { loadEngine(function () {}); }, 2000);

})();
