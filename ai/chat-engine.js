const chatContainer = document.getElementById('chat-container');
const heroSection = document.getElementById('hero-section');
const chatInput = document.getElementById('chat-input');
const sendBtn = document.getElementById('send-btn');
const qaBtns = document.querySelectorAll('.qa-btn');

let conversationHistory = [];
let conversationId = null;
let isFirstMessage = true;
let isProcessing = false;

// Initialize
function init() {
  sendBtn.addEventListener('click', handleSend);
  chatInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  });

  qaBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const prompt = btn.getAttribute('data-prompt');
      if (prompt) {
        chatInput.value = prompt;
        handleSend();
      }
    });
  });
  
  chatInput.addEventListener('input', () => {
    chatInput.style.height = 'auto';
    chatInput.style.height = Math.min(chatInput.scrollHeight, 120) + 'px';
  });
}

async function handleSend() {
  const text = chatInput.value.trim();
  if (!text || isProcessing) return;

  if (isFirstMessage) {
    heroSection.classList.add('hidden');
    chatContainer.classList.remove('hidden');
    isFirstMessage = false;
  }

  appendMessage('user', text);
  chatInput.value = '';
  chatInput.style.height = 'auto';
  isProcessing = true;
  sendBtn.disabled = true;

  const typingId = showTypingIndicator();
  conversationHistory.push({ role: "user", content: text });

  try {
    const response = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        messages: conversationHistory,
        conversation_id: conversationId
      })
    });

    let responseData = null;
    try {
      responseData = await response.json();
    } catch(e) {}

    removeTypingIndicator(typingId);

    if (!response.ok) {
      if (responseData && responseData.message) {
        throw new Error(responseData.message);
      }
      throw new Error(`Server error: ${response.status}`);
    }

    const data = responseData;
    
    if (data.conversation_id) conversationId = data.conversation_id;
    if (data.reply) {
      conversationHistory.push({ role: "assistant", content: data.reply });
      appendMessage('bot', data.reply, data.action_buttons);
    } else {
      throw new Error("Invalid response format");
    }

  } catch (err) {
    console.error("Chat Error:", err);
    removeTypingIndicator(typingId);
    showErrorState(err.message);
  } finally {
    isProcessing = false;
    sendBtn.disabled = false;
    chatInput.focus();
  }
}

function appendMessage(sender, text, actions = []) {
  const row = document.createElement('div');
  row.className = `msg-row ${sender}`;
  
  const avatar = document.createElement('div');
  avatar.className = 'msg-avatar';
  if (sender === 'user') avatar.textContent = 'U';

  const bubble = document.createElement('div');
  bubble.className = 'msg-bubble';
  bubble.innerHTML = renderMarkdown(escapeHTML(text));

  if (actions && actions.length > 0) {
    const actionsContainer = document.createElement('div');
    actionsContainer.className = 'msg-actions';
    
    actions.forEach(action => {
      if (!action.url || (!action.url.startsWith('/') && !action.url.startsWith('https://wa.me/'))) {
        return;
      }

      const btn = document.createElement('a');
      btn.href = escapeHTML(action.url);
      btn.textContent = action.label;
      
      if (action.type === 'whatsapp') {
        btn.className = 'action-btn action-whatsapp';
        btn.target = '_blank';
        btn.rel = 'noopener noreferrer';
        btn.innerHTML = `<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" style="margin-right:6px; margin-bottom: -3px;"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 0 0-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z"/></svg>` + action.label;
      } else {
        btn.className = 'action-btn action-link';
        if (action.url.startsWith('/')) {
          btn.target = '_self';
        }
      }
      actionsContainer.appendChild(btn);
    });
    
    if (actionsContainer.children.length > 0) {
      bubble.appendChild(actionsContainer);
    }
  }

  row.appendChild(avatar);
  row.appendChild(bubble);
  chatContainer.appendChild(row);
  scrollToBottom();
}

function showTypingIndicator() {
  const id = 'typing-' + Date.now();
  const row = document.createElement('div');
  row.className = 'msg-row bot';
  row.id = id;
  
  const avatar = document.createElement('div');
  avatar.className = 'msg-avatar';
  
  const bubble = document.createElement('div');
  bubble.className = 'msg-bubble';
  bubble.innerHTML = `
    <div class="typing-indicator">
      Dwarkesh GPT is thinking
      <div class="dots"><div class="dot"></div><div class="dot"></div><div class="dot"></div></div>
    </div>
  `;
  
  row.appendChild(avatar);
  row.appendChild(bubble);
  chatContainer.appendChild(row);
  scrollToBottom();
  
  return id;
}

function removeTypingIndicator(id) {
  const el = document.getElementById(id);
  if (el) el.remove();
}

function showErrorState(message) {
  const text = message || "We're having trouble connecting right now. You can continue through WhatsApp for immediate assistance.";
  const fallbackAction = [{
    type: "whatsapp",
    label: "WhatsApp Assistance",
    url: "https://wa.me/918320525550?text=Hi%2C%20I%20need%20packaging%20assistance."
  }];
  appendMessage('bot', text, fallbackAction);
}

function scrollToBottom() {
  chatContainer.scrollTop = chatContainer.scrollHeight;
}

function escapeHTML(str) {
  return str.replace(/[&<>'"]/g, 
    tag => ({
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      "'": '&#39;',
      '"': '&quot;'
    }[tag] || tag)
  );
}

function renderMarkdown(text) {
  let html = text;
  
  // Bold
  html = html.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
  
  // Inline code (just safe escaping)
  html = html.replace(/`(.*?)`/g, '<code style="background:#e5e7eb;padding:2px 4px;border-radius:3px;font-family:monospace;">$1</code>');
  
  // Links: [text](url) - only allow safe URLs
  html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, (match, title, url) => {
    const safeUrl = url.replace(/javascript:/gi, '');
    return `<a href="${safeUrl}" target="_blank" style="color:var(--dwarkesh-navy);text-decoration:underline;">${title}</a>`;
  });

  // Basic table parsing
  if (html.includes('|')) {
    const rows = html.split('\n');
    let inTable = false;
    let tableHtml = '<div class="table-wrapper"><table>';
    let newHtml = [];
    
    for (let i = 0; i < rows.length; i++) {
      const line = rows[i].trim();
      if (line.startsWith('|') && line.endsWith('|')) {
        if (!inTable) inTable = true;
        if (line.replace(/[\s|:\-]/g, '').length === 0) continue;
        
        const cells = line.split('|').slice(1, -1);
        const isHeader = (newHtml.length === 0 || !inTable) && !rows[i+1]?.includes('---');
        const actualTag = isHeader || (i+1 < rows.length && rows[i+1].includes('---')) ? 'th' : 'td';
        
        tableHtml += '<tr>' + cells.map(c => `<${actualTag}>${c.trim()}</${actualTag}>`).join('') + '</tr>';
      } else {
        if (inTable) {
          tableHtml += '</table></div>';
          newHtml.push(tableHtml);
          inTable = false;
          tableHtml = '<div class="table-wrapper"><table>';
        }
        newHtml.push(line);
      }
    }
    if (inTable) {
      tableHtml += '</table></div>';
      newHtml.push(tableHtml);
    }
    html = newHtml.join('\n');
  }

  // Lists (bullets)
  html = html.replace(/^- (.*)$/gm, '<li>$1</li>');
  html = html.replace(/(<li>.*<\/li>)\n/g, '$1'); 
  html = html.replace(/(<li>.*<\/li>)/g, '<ul>$1</ul>');
  html = html.replace(/<\/ul><ul>/g, '');
  
  // Paragraphs
  html = html.split('\n\n').map(p => {
    const pt = p.trim();
    if (!pt) return '';
    if (pt.startsWith('<') && pt.endsWith('>')) return pt;
    return `<p>${pt.replace(/\n/g, '<br>')}</p>`;
  }).join('');

  return html;
}

document.addEventListener('DOMContentLoaded', init);
