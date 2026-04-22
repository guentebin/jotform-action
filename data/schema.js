/**
 * Jotform Agent Builder - Global Schema Definitions
 */

window.SIDEBAR_ITEMS = [
  { id: 'persona', title: 'AI Persona', desc: 'Name, bio and behavior', icon: 'user' },
  { id: 'knowledge', title: 'Knowledge Base', desc: 'Feed your agent data', icon: 'book' },
  { id: 'actions', title: 'Actions', desc: 'WHEN / DO logic rules', icon: 'zap' },
  { id: 'tools', title: 'Tools', desc: 'Calculator, Search, etc', icon: 'wrench' },
  { id: 'forms', title: 'Forms', desc: 'Connect Jotform data', icon: 'file-text' },
  { id: 'teach', title: 'Teach Your Agent', desc: 'Fine-tune responses', icon: 'graduation-cap' }
];

window.CHANNELS = [
  { id: 'all', label: 'All Channels', icon: '🌐' },
  { id: 'standalone', label: 'Standalone', icon: '🖥️' },
  { id: 'chatbot', label: 'Chatbot', icon: '💬' },
  { id: 'phone', label: 'Phone', icon: '📞' },
  { id: 'voice', label: 'Voice', icon: '🎙️' },
  { id: 'gmail', label: 'Gmail', icon: '📧' },
  { id: 'messenger', label: 'Messenger', icon: 'Ⓜ️' },
  { id: 'sms', label: 'SMS', icon: '📱' },
  { id: 'whatsapp', label: 'WhatsApp', icon: '💹' },
  { id: 'instagram', label: 'Instagram', icon: '📸' },
  { id: 'canva', label: 'Canva AI Chatbot', icon: '🎨' }
];

window.WHEN_CONDITIONS = [
  { 
    id: 'conv_starts', 
    label: 'Conversation starts', 
    icon: '🚀',
    description: 'Triggers when a new chat begins',
    params: [] 
  },
  { 
    id: 'user_wants', 
    label: 'User wants to', 
    icon: '🎯',
    description: 'Triggers based on user intent',
    params: [{ key: 'intent', label: 'Intent', placeholder: 'e.g. book a flight', type: 'text' }] 
  },
  { 
    id: 'user_talks', 
    label: 'User talks about', 
    icon: '🗣️',
    description: 'Triggers when user mentions a topic',
    params: [{ key: 'topic', label: 'Topic', placeholder: 'e.g. pricing', type: 'text' }] 
  },
  { 
    id: 'user_asks', 
    label: 'User asks about', 
    icon: '❔',
    description: 'Triggers when user asks a specific question',
    params: [{ key: 'subject', label: 'Subject', placeholder: 'e.g. refund policy', type: 'text' }] 
  },
  { 
    id: 'user_sentiment', 
    label: 'User sentiment is', 
    icon: '🎭',
    description: 'Triggers based on emotional state',
    params: [{ key: 'sentiment', label: 'Sentiment state', placeholder: 'e.g. angry, happy', type: 'text' }] 
  },
  { 
    id: 'user_provides', 
    label: 'User provides', 
    icon: '📥',
    description: 'Triggers when specific info is shared',
    params: [{ key: 'info_type', label: 'Type of information', placeholder: 'e.g. email address', type: 'text' }] 
  },
  { 
    id: 'sentence_contains', 
    label: 'The sentence contains', 
    icon: '🔡',
    description: 'Keyword matching',
    params: [{ key: 'keyword', label: 'Keyword/phrase', placeholder: 'e.g. help', type: 'text' }] 
  },
  { 
    id: 'date_is', 
    label: 'The date is', 
    icon: '📅',
    description: 'Temporal triggers',
    params: [{ key: 'date_desc', label: 'Date/time description', placeholder: 'e.g. next Monday', type: 'text' }] 
  },
  { 
    id: 'url_contains', 
    label: 'The page URL contains', 
    icon: '🔗',
    description: 'Browser context matching',
    params: [{ key: 'url_pattern', label: 'URL pattern', placeholder: 'e.g. /checkout', type: 'text' }] 
  }
];

window.DO_ACTIONS = [
  { 
    id: 'say_msg', 
    label: 'Say exact message', 
    icon: '💬',
    params: [{ key: 'message', label: 'Message', placeholder: 'Type your response...', type: 'textarea' }] 
  },
  { 
    id: 'ask_info', 
    label: 'Ask for information', 
    icon: '❓',
    params: [{ key: 'what', label: 'What to ask', placeholder: 'e.g. What is your name?', type: 'text' }] 
  },
  { 
    id: 'show_btn', 
    label: 'Show button', 
    icon: '🔘',
    params: [{ key: 'buttons', label: 'Button labels', placeholder: 'e.g. Yes, No, Maybe (comma separated)', type: 'text' }] 
  },
  { 
    id: 'always_include', 
    label: 'Always include', 
    icon: '📎',
    params: [{ key: 'content', label: 'Content to append', placeholder: 'Text to add at the end of response...', type: 'textarea' }] 
  },
  { 
    id: 'talk_about', 
    label: 'Talk about/mention', 
    icon: '📢',
    params: [{ key: 'topic', label: 'Topic', placeholder: 'e.g. our summer sale', type: 'text' }] 
  },
  { 
    id: 'dont_talk', 
    label: "Don't talk about/mention", 
    icon: '🚫',
    params: [{ key: 'topic', label: 'Topic to avoid', placeholder: 'e.g. competitors', type: 'text' }] 
  },
  { 
    id: 'send_email', 
    label: 'Send email', 
    icon: '📧',
    params: [
      { key: 'to', label: 'Recipient', placeholder: 'email@example.com', type: 'text' },
      { key: 'subject', label: 'Subject', placeholder: 'Subject line...', type: 'text' },
      { key: 'body', label: 'Body', placeholder: 'Message body...', type: 'textarea' }
    ] 
  },
  { 
    id: 'api_request', 
    label: 'Send API request', 
    icon: '🔗',
    params: [
      { key: 'method', label: 'Method', type: 'select', options: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'] },
      { key: 'endpoint', label: 'Endpoint (URL)', placeholder: 'https://api.example.com/data', type: 'text' },
      { key: 'body', label: 'Body (JSON)', placeholder: '{"key": "value"}', type: 'textarea' },
      { key: 'success_msg', label: 'Success message', placeholder: 'Request sent successfully!', type: 'text' }
    ] 
  },
  { 
    id: 'appointment', 
    label: 'Make an appointment', 
    icon: '📅',
    params: [{ key: 'url', label: 'Booking URL', placeholder: 'https://calendly.com/...', type: 'text' }] 
  },
  { 
    id: 'show_video', 
    label: 'Show video', 
    icon: '🎥',
    params: [{ key: 'url', label: 'Video URL', placeholder: 'https://youtube.com/watch?v=...', type: 'text' }] 
  },
  { 
    id: 'list_items', 
    label: 'List of Items', 
    icon: '📋',
    params: [{ key: 'items', label: 'Items (title | description)', placeholder: 'Item 1 | Description 1\nItem 2 | Description 2', type: 'textarea' }] 
  },
  { 
    id: 'kb_answer', 
    label: 'Answer Using Knowledge Base', 
    icon: '🧠',
    badge: 'New',
    params: [] 
  },
  { 
    id: 'push_notify', 
    label: 'Send Push Notification', 
    icon: '🔔',
    badge: 'New',
    params: [
      { key: 'title', label: 'Title', placeholder: 'Notification title...', type: 'text' },
      { key: 'message', label: 'Message', placeholder: 'Notification body...', type: 'text' }
    ] 
  }
];
