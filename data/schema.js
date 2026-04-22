/**
 * Jotform Agent Builder - Global Schema Definitions
 */

window.SIDEBAR_ITEMS = [
  { id: 'persona', title: 'NHÂN CÁCH', desc: 'Tên, tiểu sử và hành vi', icon: 'user' },
  { id: 'knowledge', title: 'CƠ SỞ KIẾN THỨC', desc: 'Cung cấp dữ liệu cho agent', icon: 'book' },
  { id: 'actions', title: 'HÀNH ĐỘNG', desc: 'Quy tắc logic KHI / THỰC HIỆN', icon: 'zap' },
  { id: 'tools', title: 'CÔNG CỤ', desc: 'Máy tính, Tìm kiếm, v.v.', icon: 'wrench' },
  { id: 'forms', title: 'BIỂU MẪU', desc: 'Kết nối dữ liệu Jotform', icon: 'file-text' },
  { id: 'teach', title: 'HUẤN LUYỆN', desc: 'Tinh chỉnh câu trả lời', icon: 'graduation-cap' }
];

window.CHANNELS = [
  { id: 'all', label: 'Tất cả kênh', icon: '🌐' },
  { id: 'standalone', label: 'Độc lập', icon: '🖥️' },
  { id: 'chatbot', label: 'Chatbot', icon: '💬' },
  { id: 'phone', label: 'Điện thoại', icon: '📞' },
  { id: 'voice', label: 'Giọng nói', icon: '🎙️' },
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
    label: 'Cuộc trò chuyện bắt đầu', 
    icon: '🚀',
    description: 'Kích hoạt khi một cuộc trò chuyện mới được khởi tạo',
    params: [] 
  },
  { 
    id: 'user_wants', 
    label: 'Người dùng muốn', 
    icon: '🎯',
    description: 'Kích hoạt dựa trên ý định của người dùng',
    params: [{ key: 'intent', label: 'Ý định', placeholder: 'ví dụ: đặt vé máy bay', type: 'text' }] 
  },
  { 
    id: 'user_talks', 
    label: 'Người dùng nói về', 
    icon: '🗣️',
    description: 'Kích hoạt khi người dùng nhắc đến một chủ đề',
    params: [{ key: 'topic', label: 'Chủ đề', placeholder: 'ví dụ: giá cả', type: 'text' }] 
  },
  { 
    id: 'user_asks', 
    label: 'Người dùng hỏi về', 
    icon: '❔',
    description: 'Kích hoạt khi người dùng đặt một câu hỏi cụ thể',
    params: [{ key: 'subject', label: 'Vấn đề', placeholder: 'ví dụ: chính sách hoàn tiền', type: 'text' }] 
  },
  { 
    id: 'user_sentiment', 
    label: 'Cảm xúc người dùng là', 
    icon: '🎭',
    description: 'Kích hoạt dựa trên trạng thái cảm xúc',
    params: [{ key: 'sentiment', label: 'Trạng thái cảm xúc', placeholder: 'ví dụ: giận dữ, hạnh phúc', type: 'text' }] 
  },
  { 
    id: 'user_provides', 
    label: 'Người dùng cung cấp', 
    icon: '📥',
    description: 'Kích hoạt khi thông tin cụ thể được chia sẻ',
    params: [{ key: 'info_type', label: 'Loại thông tin', placeholder: 'ví dụ: địa chỉ email', type: 'text' }] 
  },
  { 
    id: 'sentence_contains', 
    label: 'Câu chứa từ khóa', 
    icon: '🔡',
    description: 'Khớp từ khóa/cụm từ',
    params: [{ key: 'keyword', label: 'Từ khóa/cụm từ', placeholder: 'ví dụ: trợ giúp', type: 'text' }] 
  },
  { 
    id: 'date_is', 
    label: 'Ngày/thời gian là', 
    icon: '📅',
    description: 'Kích hoạt theo thời gian',
    params: [{ key: 'date_desc', label: 'Mô tả ngày/giờ', placeholder: 'ví dụ: thứ Hai tới', type: 'text' }] 
  },
  { 
    id: 'url_contains', 
    label: 'URL trang chứa', 
    icon: '🔗',
    description: 'Khớp ngữ cảnh trình duyệt',
    params: [{ key: 'url_pattern', label: 'Mẫu URL', placeholder: 'ví dụ: /checkout', type: 'text' }] 
  }
];

window.DO_ACTIONS = [
  { 
    id: 'say_msg', 
    label: 'Nói đúng nội dung', 
    icon: '💬',
    description: 'Trả lời bằng một tin nhắn cố định, đã viết sẵn — không dùng AI',
    params: [{ key: 'message', label: 'Tin nhắn', placeholder: 'Nhập nội dung phản hồi...', type: 'textarea' }] 
  },
  { 
    id: 'ask_info', 
    label: 'Hỏi thêm thông tin', 
    icon: '❓',
    description: 'Chủ động yêu cầu người dùng cung cấp các chi tiết cụ thể',
    params: [{ key: 'what', label: 'Cần hỏi gì', placeholder: 'ví dụ: Tên bạn là gì?', type: 'text' }] 
  },
  { 
    id: 'show_btn', 
    label: 'Hiển thị nút bấm', 
    icon: '🔘',
    description: 'Hiển thị các nút CTA có thể nhấp vào bên trong cuộc trò chuyện',
    params: [{ key: 'buttons', label: 'Nhãn nút', placeholder: 'ví dụ: Có, Không, Có lẽ (phân cách bằng dấu phẩy)', type: 'text' }] 
  },
  { 
    id: 'always_include', 
    label: 'Luôn đính kèm', 
    icon: '📎',
    description: 'Thêm một ghi chú vào mọi câu trả lời của agent trong điều kiện này',
    params: [{ key: 'content', label: 'Nội dung đính kèm', placeholder: 'Văn bản thêm vào cuối câu trả lời...', type: 'textarea' }] 
  },
  { 
    id: 'talk_about', 
    label: 'Đề cập chủ đề', 
    icon: '📢',
    description: 'Chủ động giới thiệu một chủ đề một lần trong cuộc trò chuyện',
    params: [{ key: 'topic', label: 'Chủ đề', placeholder: 'ví dụ: chương trình giảm giá mùa hè', type: 'text' }] 
  },
  { 
    id: 'dont_talk', 
    label: 'Không được đề cập', 
    icon: '🚫',
    description: 'Ngăn agent nhắc đến chủ đề này',
    params: [{ key: 'topic', label: 'Chủ đề cần tránh', placeholder: 'ví dụ: đối thủ cạnh tranh', type: 'text' }] 
  },
  { 
    id: 'send_email', 
    label: 'Gửi email', 
    icon: '📧',
    description: 'Gửi email tự động đến người nhận khi được kích hoạt',
    params: [
      { key: 'to', label: 'Người nhận', placeholder: 'email@example.com', type: 'text' },
      { key: 'subject', label: 'Tiêu đề', placeholder: 'Tiêu đề email...', type: 'text' },
      { key: 'body', label: 'Nội dung', placeholder: 'Nội dung tin nhắn...', type: 'textarea' }
    ] 
  },
  { 
    id: 'api_request', 
    label: 'Gọi API', 
    icon: '🔗',
    description: 'Gọi một endpoint HTTP bên ngoài với dữ liệu tùy chỉnh',
    params: [
      { key: 'method', label: 'Phương thức', type: 'select', options: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'] },
      { key: 'endpoint', label: 'Endpoint (URL)', placeholder: 'https://api.example.com/data', type: 'text' },
      { key: 'body', label: 'Dữ liệu (JSON)', placeholder: '{"key": "value"}', type: 'textarea' },
      { key: 'success_msg', label: 'Thông báo thành công', placeholder: 'Yêu cầu đã được gửi thành công!', type: 'text' }
    ] 
  },
  { 
    id: 'appointment', 
    label: 'Đặt lịch hẹn', 
    icon: '📅',
    description: 'Hiển thị liên kết lịch đặt chỗ trong cuộc trò chuyện',
    params: [{ key: 'url', label: 'URL đặt chỗ', placeholder: 'https://calendly.com/...', type: 'text' }] 
  },
  { 
    id: 'show_video', 
    label: 'Hiển thị video', 
    icon: '🎥',
    description: 'Nhúng và phát video ngay trong cuộc trò chuyện',
    params: [{ key: 'url', label: 'URL video', placeholder: 'https://youtube.com/watch?v=...', type: 'text' }] 
  },
  { 
    id: 'list_items', 
    label: 'Danh sách mục', 
    icon: '📋',
    description: 'Hiển thị các thẻ thông tin sản phẩm/dịch vụ có cấu trúc',
    params: [{ key: 'items', label: 'Các mục (tiêu đề | mô tả)', placeholder: 'Mục 1 | Mô tả 1\nMục 2 | Mô tả 2', type: 'textarea' }] 
  },
  { 
    id: 'kb_answer', 
    label: 'Trả lời từ Knowledge Base', 
    icon: '🧠',
    description: 'Buộc agent chỉ trả lời dựa trên Cơ sở Kiến thức đã được huấn luyện',
    badge: 'Mới',
    params: [] 
  },
  { 
    id: 'push_notify', 
    label: 'Gửi thông báo đẩy', 
    icon: '🔔',
    description: 'Gửi thông báo đẩy trình duyệt cho người dùng',
    badge: 'Mới',
    params: [
      { key: 'title', label: 'Tiêu đề', placeholder: 'Tiêu đề thông báo...', type: 'text' },
      { key: 'message', label: 'Tin nhắn', placeholder: 'Nội dung thông báo...', type: 'text' }
    ] 
  }
];
