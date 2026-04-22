# Plan: Nâng cấp UI jotform-action theo MISA Design System

> **Nguồn tham chiếu:** MISA Design System v2.0 — https://mind-glyph-46433684.figma.site/
> **Mục tiêu:** Áp dụng design tokens, component patterns và nguyên tắc thiết kế MISA vào ứng dụng jotform-action

---

## Phân tích Gap — Hiện tại vs MISA Design System

### 1. Typography
| Hiện tại | MISA Standard |
|----------|---------------|
| Font mix (system-ui, Segoe UI) | **Font Inter** — duy nhất cho toàn bộ app |
| Font size không nhất quán (13px, 14px, 15px) | Font size tiêu chuẩn **13px** (Body Regular) |
| Weight tùy tiện | H1: Banner Title \| H2: App/Page Title \| H3: Form/Section Title \| Body Regular (13px) \| Body Large |

### 2. Color System
| Hiện tại | MISA Standard |
|----------|---------------|
| Purple (#2d1b69) làm primary — không theo hệ màu | **Brand** = màu chính app (customizable) |
| Orange (#ff6100) làm accent | **Accent** = màu nhấn mạnh (ít dùng) |
| Màu hardcode rải rác | **Nhóm Base**: Brand, Accent, Info, Warning, Danger, Success, Neutral |
| Không có semantic color | **Nhóm Semantic**: Text, Icon, Stroke, Bg — link sang Base |

### 3. Button
| Hiện tại | MISA Standard |
|----------|---------------|
| Radius tùy tiện (8px, 20px) | **Radius: 8px** cố định |
| Min-width không có | **Min-width: 80px** |
| Primary: nền purple | Primary: nền Brand màu chính, chữ trắng |
| Secondary: không rõ style | Secondary: rỗng có stroke, chữ đen |

### 4. Sidebar
| Hiện tại | MISA Standard |
|----------|---------------|
| Nền đen (#1e1e2e) | Sidebar **màu trắng** — sạch và hiện đại |
| Active: nền tím | Active: nền **Brand nhạt**, text & icon đổi màu Brand |
| Hover: không rõ | Hover: **nền xám nhạt** |
| Không có collapse | Hỗ trợ **mở rộng/thu gọn** |

### 5. Header Bar
| Hiện tại | MISA Standard |
|----------|---------------|
| Nền tím cứng (#2d1b69) | Header **màu Brand** của app, user có thể tùy chỉnh |
| Tab BUILD/TRAIN/PUBLISH trên header | Header chứa: logo, tên app, tìm kiếm, thông báo, avatar |

### 6. Toast/Thông báo
| Hiện tại | MISA Standard |
|----------|---------------|
| Toast đơn giản, không có icon | **4 loại**: Thành công (Success), Lỗi (Danger), Cảnh báo (Warning), Thông tin (Info) |
| Không có max-width | **Max-width: 400px**, tự động co theo nội dung |
| Thời gian không rõ | **5 giây** tự động đóng, tối đa 3 toast đồng thời |
| Vị trí không chuẩn | Hiển thị **góc phải phía dưới** header |

### 7. Dropdown/Text field
| Hiện tại | MISA Standard |
|----------|---------------|
| States chưa đủ | Đủ states: Normal, Hover, Focus, Readonly, Error, Validate, Verifying |
| Không có keyboard nav | Arrow Up/Down, Enter để select, Tab để di chuyển |
| Placeholder không chuẩn | Placeholder rõ ràng: "Chọn [tên trường]..." |

### 8. Context Menu (Kebab ⋮)
| Hiện tại | MISA Standard |
|----------|---------------|
| Basic kebab menu | Icon cho mỗi item + Line phân nhóm |
| Text: Edit/Delete thuần | Chức năng liên quan gom nhóm bằng separator |

---

## Kế hoạch thực hiện — 5 giai đoạn

---

### GIAI ĐOẠN 1: Design Tokens & Typography
**Mục tiêu:** Thiết lập CSS variables theo MISA standard, thay thế toàn bộ hardcode colors/fonts

**Thực hiện trong `css/variables.css`:**

```css
:root {
  /* ── Font (MISA: Inter only) ── */
  --font-main: 'Inter', -apple-system, 'Segoe UI', sans-serif;

  /* ── MISA Brand Colors (customizable per app) ── */
  --brand-500: #2563eb;      /* Brand chính */
  --brand-400: #3b82f6;      /* Brand hover */
  --brand-100: #dbeafe;      /* Brand nhạt — active bg */
  --brand-50:  #eff6ff;      /* Brand rất nhạt */

  /* ── Semantic Base ── */
  --color-info:    #0ea5e9;
  --color-warning: #f59e0b;
  --color-danger:  #ef4444;
  --color-success: #22c55e;

  /* ── Neutral palette ── */
  --neutral-900: #111827;   /* Text primary */
  --neutral-700: #374151;   /* Text secondary */
  --neutral-500: #6b7280;   /* Text muted */
  --neutral-400: #9ca3af;   /* Text placeholder */
  --neutral-200: #e5e7eb;   /* Border default */
  --neutral-100: #f3f4f6;   /* Bg hover */
  --neutral-50:  #f9fafb;   /* Bg subtle */

  /* ── Semantic Text ── */
  --text-primary:   var(--neutral-900);
  --text-secondary: var(--neutral-700);
  --text-muted:     var(--neutral-500);
  --text-disabled:  var(--neutral-400);

  /* ── Semantic Stroke ── */
  --stroke-default: var(--neutral-200);
  --stroke-focus:   var(--brand-500);
  --stroke-error:   var(--color-danger);

  /* ── Semantic Bg ── */
  --bg-page:    #f5f5f8;
  --bg-surface: #ffffff;
  --bg-hover:   var(--neutral-100);
  --bg-active:  var(--brand-50);

  /* ── Spacing (8px grid) ── */
  --space-1: 4px;
  --space-2: 8px;
  --space-3: 12px;
  --space-4: 16px;
  --space-5: 20px;
  --space-6: 24px;

  /* ── Radius (MISA: 8px for buttons/inputs) ── */
  --radius-sm: 4px;
  --radius-md: 8px;
  --radius-lg: 12px;

  /* ── Typography scale ── */
  --text-h1: 700 20px/1.4 var(--font-main);   /* H1 Banner */
  --text-h2: 700 16px/1.4 var(--font-main);   /* H2 App/Page title */
  --text-h3: 600 14px/1.4 var(--font-main);   /* H3 Form/Section title */
  --text-body: 400 13px/1.5 var(--font-main); /* Body Regular — chuẩn */
  --text-body-medium: 500 13px/1.5 var(--font-main); /* Button, Nav text */
  --text-body-semi: 600 13px/1.5 var(--font-main);
  --text-body-bold: 700 13px/1.5 var(--font-main);
  --text-label: 400 12px/1.4 var(--font-main);  /* Label nhỏ */
  --text-caption: 400 11px/1.4 var(--font-main);

  /* ── Shadows ── */
  --shadow-sm: 0 1px 3px rgba(0,0,0,0.08), 0 1px 2px rgba(0,0,0,0.04);
  --shadow-md: 0 4px 12px rgba(0,0,0,0.10);
  --shadow-dropdown: 0 8px 24px rgba(0,0,0,0.12);
}
```

**Checklist:**
- [ ] Thay thế toàn bộ hardcode `#2d1b69`, `#ff6100` bằng CSS variables
- [ ] Import Inter font từ Google Fonts
- [ ] Cập nhật `body { font: var(--text-body); }`

---

### GIAI ĐOẠN 2: Sidebar — White theme theo MISA

**Mục tiêu:** Đổi sidebar từ nền đen sang nền trắng/xám nhạt theo chuẩn MISA

**Thay đổi `css/components.css`:**

```css
/* Sidebar — MISA White style */
.app-sidebar {
  background: #ffffff;
  border-right: 1px solid var(--stroke-default);
  width: 240px;
}

.sidebar-item {
  display: flex; align-items: center; gap: 10px;
  padding: 8px 12px;
  border-radius: var(--radius-md);
  margin: 2px 8px;
  color: var(--text-secondary);
  font: var(--text-body-medium);
  cursor: pointer;
  transition: background 0.12s;
}

/* Hover: nền xám nhạt */
.sidebar-item:hover {
  background: var(--bg-hover);
  color: var(--text-primary);
}

/* Active: nền Brand nhạt, text & icon Brand */
.sidebar-item.active {
  background: var(--bg-active);        /* brand-50 */
  color: var(--brand-500);
  border-left: none;                    /* Bỏ border-left cũ */
}
.sidebar-item.active .sidebar-item-title { color: var(--brand-500); font-weight: 600; }
```

**Cập nhật Header bar:**
- Nền header: `var(--brand-500)` thay vì purple cứng
- Cho phép đổi màu Brand dễ dàng qua 1 biến

**Checklist:**
- [ ] Sidebar nền trắng, border phải
- [ ] Active state: bg brand-50, text brand-500
- [ ] Hover state: bg neutral-100
- [ ] Header: dùng `var(--brand-500)`

---

### GIAI ĐOẠN 3: Button & Form Controls

**Mục tiêu:** Chuẩn hóa Button theo MISA (radius 8px, min-width 80px, 3 loại)

**Button types theo MISA:**
```css
/* Primary — nền Brand, chữ trắng */
.btn-primary {
  background: var(--brand-500);
  color: #fff;
  border: none;
  border-radius: var(--radius-md); /* 8px */
  min-width: 80px;
  padding: 7px 16px;
  font: var(--text-body-medium);
}
.btn-primary:hover { background: var(--brand-400); }

/* Secondary — rỗng, stroke, chữ đen */
.btn-secondary {
  background: transparent;
  color: var(--text-primary);
  border: 1px solid var(--stroke-default);
  border-radius: var(--radius-md);
  min-width: 80px;
  padding: 7px 16px;
  font: var(--text-body-medium);
}
.btn-secondary:hover { background: var(--bg-hover); }

/* Danger — nền đỏ (cho Delete) */
.btn-danger {
  background: var(--color-danger);
  color: #fff;
  border: none;
  border-radius: var(--radius-md);
  min-width: 80px;
}
```

**Text field states theo MISA:**
```css
.input          { border: 1px solid var(--stroke-default); border-radius: var(--radius-md); font: var(--text-body); }
.input:hover    { border-color: var(--neutral-400); }
.input:focus    { border-color: var(--stroke-focus); box-shadow: 0 0 0 3px var(--brand-100); outline: none; }
.input.error    { border-color: var(--stroke-error); }
.input:disabled { background: var(--bg-hover); color: var(--text-disabled); cursor: not-allowed; }
```

**Dropdown theo MISA:**
- Placeholder: "Chọn điều kiện..." (rõ ràng, gợi ý)
- Arrow Up/Down keyboard navigation
- Min-width bằng trigger width

**Checklist:**
- [ ] Button radius = 8px nhất quán
- [ ] Button min-width = 80px
- [ ] 3 loại button: Primary, Secondary, Danger
- [ ] Input states: Normal/Hover/Focus/Error/Disabled
- [ ] Dropdown keyboard navigation

---

### GIAI ĐOẠN 4: Toast Notifications theo MISA

**Mục tiêu:** Chuẩn hóa 4 loại toast, vị trí, timing theo MISA

**Spec:**
- **Vị trí:** Góc phải, ngay dưới header bar
- **Max-width:** 400px
- **Thời gian:** 5 giây tự động đóng
- **Tối đa:** 3 toast đồng thời
- **4 loại:** Success (xanh lá), Danger/Error (đỏ), Warning (vàng), Info (xanh dương)

```css
.toast-container {
  position: fixed;
  top: 68px;       /* dưới header 60px + 8px margin */
  right: 16px;
  z-index: 9999;
  display: flex; flex-direction: column; gap: 8px;
  max-width: 400px;
}

.toast {
  display: flex; align-items: flex-start; gap: 10px;
  padding: 12px 14px;
  border-radius: var(--radius-md);
  border-left: 4px solid;
  background: #fff;
  box-shadow: var(--shadow-md);
  font: var(--text-body);
  animation: slideInRight 0.2s ease;
  width: fit-content; max-width: 400px;
}

.toast-success { border-left-color: var(--color-success); }
.toast-error   { border-left-color: var(--color-danger);  }
.toast-warning { border-left-color: var(--color-warning); }
.toast-info    { border-left-color: var(--color-info);    }
```

**Logic `showToast(message, type, duration=5000)`:**
- Tối đa 3 toast, xếp dưới nhau
- Auto dismiss sau `duration`ms
- Fade out animation trước khi remove

**Checklist:**
- [ ] 4 loại toast với màu semantic đúng
- [ ] Vị trí: top-right dưới header
- [ ] Max 3 toast đồng thời
- [ ] Auto-dismiss 5 giây
- [ ] Slide-in animation

---

### GIAI ĐOẠN 5: Context Menu & Card Polish

**Mục tiêu:** Cải thiện kebab menu (⋮) và rule cards theo chuẩn MISA

**Context Menu theo MISA:**
- Mỗi item có **icon** bên trái
- Dùng **line separator** phân nhóm
- Item Danger (Delete) màu đỏ, ở cuối cùng

```css
.kebab-dropdown {
  border-radius: var(--radius-md);
  box-shadow: var(--shadow-dropdown);
  border: 1px solid var(--stroke-default);
  overflow: hidden; min-width: 160px;
}
.kebab-item {
  display: flex; align-items: center; gap: 8px;
  padding: 8px 12px;
  font: var(--text-body);
  color: var(--text-primary);
  cursor: pointer;
}
.kebab-item:hover { background: var(--bg-hover); }
.kebab-separator  { height: 1px; background: var(--stroke-default); margin: 4px 0; }
.kebab-item.danger      { color: var(--color-danger); }
.kebab-item.danger:hover{ background: #fef2f2; }
```

**Rule card polish:**
- Sử dụng `--shadow-sm` thay shadow hardcode
- Border-radius `var(--radius-lg)` = 12px
- Typography dùng `var(--text-body)` nhất quán
- Hover: `box-shadow: var(--shadow-md)` + lift effect

**Checklist:**
- [ ] Kebab menu có icon cho mỗi item
- [ ] Separator giữa nhóm Edit/Disable vs Delete
- [ ] Rule card shadow & radius theo MISA tokens
- [ ] Card hover state mượt mà

---

## Thứ tự ưu tiên thực hiện

| # | Giai đoạn | Tác động | Effort |
|---|-----------|----------|--------|
| 1 | Design Tokens (variables.css) | 🔴 Nền tảng cho tất cả | Thấp |
| 2 | Typography — Inter font | 🔴 Ảnh hưởng toàn bộ | Thấp |
| 3 | Button chuẩn hóa | 🟠 Cao — dùng khắp nơi | Trung bình |
| 4 | Sidebar white theme | 🟠 Visual lớn nhất | Trung bình |
| 5 | Toast 4 loại | 🟡 UX feedback | Thấp |
| 6 | Input states | 🟡 Form UX | Trung bình |
| 7 | Context menu polish | 🟢 Chi tiết nhỏ | Thấp |
| 8 | Card polish | 🟢 Chi tiết nhỏ | Thấp |

## Nguyên tắc MISA áp dụng khi implement

1. **Font chỉ dùng Inter** — không mix font
2. **Font size tiêu chuẩn 13px** — không dùng 14px hay 15px cho body text
3. **Radius button = 8px** — nhất quán
4. **Min-width button = 80px**
5. **Sidebar trắng** — không dùng sidebar tối cho web app
6. **Màu hover = neutral-100 (xám nhạt)** — không dùng màu brand cho hover
7. **Màu active = brand-50 (brand rất nhạt) + text/icon đổi sang brand**
8. **Toast vị trí top-right, 5 giây, max 3**
9. **Placeholder rõ ràng**: "Chọn [tên field]..." — không để trống
10. **Feedback ngay lập tức** cho mọi interaction (hover đổi màu, click có visual)
