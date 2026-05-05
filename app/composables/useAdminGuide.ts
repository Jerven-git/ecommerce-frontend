/**
 * Admin Guide – step registry & shared state
 *
 * HOW TO ADD A NEW STEP
 * ─────────────────────
 * 1. Add a `data-guide="my-feature"` attribute to the element you want highlighted.
 * 2. Append a new entry to the `steps` array below (or insert it in the right section).
 *    Each entry needs: title, description, icon, iconBg, route, and optionally target,
 *    prefer (tooltip placement), and tips.
 * 3. That's it — the guide component picks it up automatically.
 *
 * STEP FIELDS
 * ───────────
 * title       – Bold heading shown in the tooltip
 * description – One-liner explaining the feature
 * icon        – Inline SVG string (use w-4.5 h-4.5 and a color like text-blue-600)
 * iconBg      – Tailwind bg class for the icon circle (e.g. bg-blue-50)
 * route       – The admin page path this step lives on (e.g. /admin/products)
 * target      – CSS selector for the element to spotlight (must match a data-guide attr)
 * prefer      – Preferred tooltip side: 'top' | 'bottom' | 'left' | 'right'
 * tips        – Array of short bullet-point strings
 */

export interface GuideStep {
  title: string
  description: string
  icon: string
  iconBg: string
  route: string
  target?: string
  prefer?: 'top' | 'bottom' | 'left' | 'right'
  tips?: string[]
}

// ── Icon helpers (keeps the array below more readable) ──

const icon = (svg: string, color: string) =>
  `<svg class="w-4.5 h-4.5 text-${color}" fill="none" viewBox="0 0 24 24" stroke="currentColor">${svg}</svg>`

const icons = {
  smile:    icon('<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />', 'primary-600'),
  grid:     icon('<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6z" />', 'blue-600'),
  doc:      icon('<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />', 'green-600'),
  menu:     icon('<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h7" />', 'purple-600'),
  gear:     icon('<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />', 'gray-600'),
  plus:     icon('<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />', 'primary-600'),
  search:   icon('<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />', 'indigo-600'),
  table:    icon('<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 10h18M3 14h18m-9-4v8m-7 0h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />', 'primary-600'),
  tag:      icon('<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />', 'purple-600'),
  list:     icon('<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 10h16M4 14h16M4 18h16" />', 'purple-600'),
  filter:   icon('<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />', 'green-600'),
  clock:    icon('<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />', 'amber-600'),
  gearAmb:  icon('<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35" />', 'amber-600'),
  plusPink: icon('<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />', 'pink-600'),
  tagPink:  icon('<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />', 'pink-600'),
  store:    icon('<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />', 'gray-600'),
  mail:     icon('<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />', 'blue-600'),
  check:    icon('<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />', 'green-600'),
  truck:    icon('<path d="M9 17a2 2 0 11-4 0 2 2 0 014 0zM19 17a2 2 0 11-4 0 2 2 0 014 0z" /><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1" />', 'blue-600'),
  globe:    icon('<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />', 'blue-600'),
  palette:  icon('<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />', 'purple-600'),
  home:     icon('<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0h6" />', 'green-600'),
  info:     icon('<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />', 'amber-600'),
  sliders:  icon('<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />', 'indigo-600'),
  calc:     icon('<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />', 'amber-600'),
  eye:      icon('<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />', 'amber-600'),
  card:     icon('<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />', 'green-600'),
  lock:     icon('<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />', 'red-500'),
  done:     icon('<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />', 'green-600'),
}

// ═════════════════════════════════════════════════════════════
//  GUIDE STEPS — edit this array to add, remove, or reorder
// ═════════════════════════════════════════════════════════════

export const guideSteps: GuideStep[] = [

  // ── Welcome ──────────────────────────────────────────────
  {
    title: 'Welcome to your Admin Panel!',
    description: 'Quick tour of your store. Each step highlights one feature — use Next, Back, or Skip anytime.',
    icon: icons.smile, iconBg: 'bg-primary-50',
    route: '/admin',
  },

  // ── Dashboard ────────────────────────────────────────────
  {
    title: 'Key Metrics',
    description: 'Your store at a glance — products, orders, pending items, and revenue.',
    icon: icons.grid, iconBg: 'bg-blue-50',
    route: '/admin', target: '[data-guide="stats"]', prefer: 'bottom',
    tips: ['Click any card to jump to that section'],
  },
  {
    title: 'Recent Orders',
    description: 'Your last 5 orders with live status, so you can spot what needs attention.',
    icon: icons.doc, iconBg: 'bg-green-50',
    route: '/admin', target: '[data-guide="recent-orders"]', prefer: 'left',
    tips: ['Click "View all" to see every order'],
  },

  // ── Sidebar ──────────────────────────────────────────────
  {
    title: 'Navigation',
    description: 'Your main menu — every section of the store lives here.',
    icon: icons.menu, iconBg: 'bg-purple-50',
    route: '/admin', target: '[data-guide="sidebar-nav"]', prefer: 'right',
    tips: ['Products, Categories, Blog Posts, Blog Categories, Services, Service Categories, Orders, Backorders, Discounts', 'Collapse the sidebar with the arrow for more workspace'],
  },
  {
    title: 'Settings Menu',
    description: 'Store setup lives here — appearance, pages, shipping, tax, and payments.',
    icon: icons.gear, iconBg: 'bg-gray-100',
    route: '/admin', target: '[data-guide="sidebar-settings"]', prefer: 'right',
    tips: ['Set these up before launching your store'],
  },

  // ── Products ─────────────────────────────────────────────
  {
    title: 'Add Product',
    description: 'Click to create a product — name, price, stock, images, and more.',
    icon: icons.plus, iconBg: 'bg-primary-50',
    route: '/admin/products', target: '[data-guide="add-product-btn"]', prefer: 'bottom',
    tips: ['Assign to categories', 'Toggle active/inactive and backorder'],
  },
  {
    title: 'Product Filters',
    description: 'Search by name or filter by active/inactive.',
    icon: icons.search, iconBg: 'bg-indigo-50',
    route: '/admin/products', target: '[data-guide="product-filters"]', prefer: 'bottom',
  },
  {
    title: 'Products Table',
    description: 'Your full catalogue — price, stock, category, and status in one view.',
    icon: icons.table, iconBg: 'bg-primary-50',
    route: '/admin/products', target: '[data-guide="product-table"]', prefer: 'top',
    tips: ['Edit or delete from the row', 'Use pagination for large catalogues'],
  },

  // ── Categories ───────────────────────────────────────────
  {
    title: 'Add Category',
    description: 'Type a name and press Add. You can nest categories as deep as you like.',
    icon: icons.tag, iconBg: 'bg-purple-50',
    route: '/admin/categories', target: '[data-guide="add-category"]', prefer: 'bottom',
  },
  {
    title: 'Category Tree',
    description: 'Rename, delete, or add sub-categories straight from the list.',
    icon: icons.list, iconBg: 'bg-purple-50',
    route: '/admin/categories', target: '[data-guide="category-tree"]', prefer: 'right',
    tips: ['Click the arrow to expand or collapse', 'Search at the top to find a category fast'],
  },

  // ── Blog Posts ───────────────────────────────────────────
  {
    title: 'New Blog Post',
    description: 'Write articles for the public blog. Opens a Markdown editor with live preview.',
    icon: icons.plus, iconBg: 'bg-primary-50',
    route: '/admin/posts', target: '[data-guide="add-post-btn"]', prefer: 'bottom',
    tips: ['Title, slug, excerpt, cover image, and body', 'Save as draft or publish when ready', 'Assign a category and mark featured posts'],
  },
  {
    title: 'Post Filters',
    description: 'Search posts or filter by status and category.',
    icon: icons.search, iconBg: 'bg-indigo-50',
    route: '/admin/posts', target: '[data-guide="post-filters"]', prefer: 'bottom',
    tips: ['Filter by Published or Drafts', 'Narrow down by blog category'],
  },
  {
    title: 'Posts Table',
    description: 'All your posts in one place — edit or delete any row.',
    icon: icons.table, iconBg: 'bg-primary-50',
    route: '/admin/posts', target: '[data-guide="post-table"]', prefer: 'top',
    tips: ['A star badge marks featured posts', 'Drafts stay hidden from your public blog'],
  },

  // ── Blog Categories ──────────────────────────────────────
  {
    title: 'New Blog Category',
    description: 'Group posts under topics (e.g. News, Tips, Updates) with their own color tile.',
    icon: icons.tagPink, iconBg: 'bg-pink-50',
    route: '/admin/post-categories', target: '[data-guide="add-post-category-btn"]', prefer: 'bottom',
    tips: ['Pick two colors for a gradient tile', 'Gives each post its own badge on the blog'],
  },
  {
    title: 'Blog Category List',
    description: 'Edit, recolor, or delete blog categories here. Post counts shown per category.',
    icon: icons.list, iconBg: 'bg-purple-50',
    route: '/admin/post-categories', target: '[data-guide="post-category-list"]', prefer: 'right',
  },

  // ── Services ─────────────────────────────────────────────
  {
    title: 'New Service',
    description: 'Each service gets its own detail page — content, image, pricing, and SEO.',
    icon: icons.plus, iconBg: 'bg-primary-50',
    route: '/admin/services', target: '[data-guide="add-service-btn"]', prefer: 'bottom',
    tips: ['Title, slug, summary, body, and cover image', 'Save as draft or publish when ready', 'Assign to a service category'],
  },
  {
    title: 'Service Filters',
    description: 'Search services or filter by status and category.',
    icon: icons.search, iconBg: 'bg-indigo-50',
    route: '/admin/services', target: '[data-guide="service-filters"]', prefer: 'bottom',
    tips: ['Filter by Published or Drafts', 'Narrow down by service category'],
  },
  {
    title: 'Services Table',
    description: 'All your services in one place — edit or delete any row.',
    icon: icons.table, iconBg: 'bg-primary-50',
    route: '/admin/services', target: '[data-guide="service-table"]', prefer: 'top',
    tips: ['Drafts stay hidden from the public site'],
  },

  // ── Service Categories ───────────────────────────────────
  {
    title: 'New Service Category',
    description: 'Group related services under headings (e.g. Everyday spending, Travel).',
    icon: icons.tagPink, iconBg: 'bg-pink-50',
    route: '/admin/service-categories', target: '[data-guide="add-service-category-btn"]', prefer: 'bottom',
  },
  {
    title: 'Service Category List',
    description: 'Edit or delete service categories here. Service counts shown per category.',
    icon: icons.list, iconBg: 'bg-purple-50',
    route: '/admin/service-categories', target: '[data-guide="service-category-list"]', prefer: 'right',
  },

  // ── Orders ───────────────────────────────────────────────
  {
    title: 'Order Filters',
    description: 'Filter by status to focus on what needs action now.',
    icon: icons.filter, iconBg: 'bg-green-50',
    route: '/admin/orders', target: '[data-guide="order-filters"]', prefer: 'bottom',
    tips: ['Search by customer, email, or order number', 'Status counts: pending, processing, shipped, delivered, cancelled, backorder'],
  },
  {
    title: 'Order Cards',
    description: 'Full details per order — customer, items, payment, shipping, status controls.',
    icon: icons.doc, iconBg: 'bg-green-50',
    route: '/admin/orders', target: '[data-guide="order-list"]', prefer: 'left',
    tips: ['Change status, confirm cash payments, add tracking numbers'],
  },

  // ── Backorders ───────────────────────────────────────────
  {
    title: 'Backorder Filters',
    description: 'Out-of-stock orders — filter by what needs restocking or follow-up.',
    icon: icons.clock, iconBg: 'bg-amber-50',
    route: '/admin/backorders', target: '[data-guide="backorder-filters"]', prefer: 'bottom',
    tips: ['Awaiting Stock, Notified, Expired, Paid, Cancelled'],
  },
  {
    title: 'Backorder Settings',
    description: 'Turn backorders on/off and set how long payment links stay valid.',
    icon: icons.gearAmb, iconBg: 'bg-amber-50',
    route: '/admin/backorders', target: '[data-guide="backorder-settings-btn"]', prefer: 'bottom',
    tips: ['Send payment links when stock arrives'],
  },

  // ── Discounts ────────────────────────────────────────────
  {
    title: 'Add Discount',
    description: 'Create promo codes — percentage or fixed amount.',
    icon: icons.plusPink, iconBg: 'bg-pink-50',
    route: '/admin/discounts', target: '[data-guide="add-discount-btn"]', prefer: 'bottom',
    tips: ['Optional: expiry, max uses, minimum order'],
  },
  {
    title: 'Discount Table',
    description: 'All your codes — status, usage, and expiry at a glance.',
    icon: icons.tagPink, iconBg: 'bg-pink-50',
    route: '/admin/discounts', target: '[data-guide="discount-filters"]', prefer: 'bottom',
    tips: ['Filter by Active or Inactive', 'Edit or delete from the row'],
  },

  // ── Site Settings ────────────────────────────────────────
  {
    title: 'General Settings',
    description: 'Store name, logo, favicon, and cart icon — the basics your customers see first.',
    icon: icons.store, iconBg: 'bg-gray-100',
    route: '/admin/settings?tab=general', target: '[data-guide="settings-general"]', prefer: 'right',
    tips: ['Logo: PNG, JPG, or SVG', 'Favicon: square image for the browser tab'],
  },
  {
    title: 'Theme',
    description: 'Pick colors, fonts, and a background texture to match your brand.',
    icon: icons.palette, iconBg: 'bg-purple-50',
    route: '/admin/settings?tab=appearance', target: '[data-guide="settings-theme"]', prefer: 'right',
    tips: ['Start from a preset (Ocean Blue, Forest Green, etc.)', 'Fine-tune primary, secondary, and accent colors', '8 font options for headings and body text'],
  },
  // ── Pages (sub-tabbed) ───────────────────────────────────
  {
    title: 'Page Editors',
    description: 'Edit every public page from here — Home, About, Shop, Blog, Services, Contact.',
    icon: icons.doc, iconBg: 'bg-green-50',
    route: '/admin/settings?tab=pages&sub=homepage', target: '[data-guide="settings-pages-nav"]', prefer: 'bottom',
    tips: ['Click the sub-tabs to switch pages', 'What you see is what your customers see', 'Click any text in the preview to edit it', 'Hover cards to delete, click "+" to add'],
  },
  {
    title: 'Homepage Hero',
    description: 'The big banner visitors see first — title, subtitle, and background image or video.',
    icon: icons.home, iconBg: 'bg-green-50',
    route: '/admin/settings?tab=pages&sub=homepage', target: '[data-guide="settings-homepage"]', prefer: 'right',
    tips: ['Recommended image size: 1920×600 px'],
  },
  {
    title: 'Homepage Sections',
    description: 'How It Works, Features, Stats, and Newsletter — edit each one right on the page.',
    icon: icons.grid, iconBg: 'bg-amber-50',
    route: '/admin/settings?tab=pages&sub=homepage', target: '[data-guide="settings-homepage-sections"]', prefer: 'right',
    tips: ['Click text to edit it', 'Click icons to pick from the icon library', 'Changes preview live'],
  },
  {
    title: 'About Page',
    description: 'Tell your story with a visual editor — text, image, and highlight cards.',
    icon: icons.info, iconBg: 'bg-amber-50',
    route: '/admin/settings?tab=pages&sub=about', target: '[data-guide="settings-about"]', prefer: 'right',
    tips: ['Recommended image size: 800×600 px', 'Hover a highlight to delete, click "+" to add'],
  },
  {
    title: 'Shop Page',
    description: 'Edit the shop page header and the promo banner at the bottom.',
    icon: icons.store, iconBg: 'bg-blue-50',
    route: '/admin/settings?tab=pages&sub=shop', target: '[data-guide="settings-shop"]', prefer: 'right',
    tips: ['Click any text to change it', 'Add perks as pills — hover to delete'],
  },
  {
    title: 'Blog Page',
    description: 'Cover image, hero header, and optional CTA banner for your blog landing page.',
    icon: icons.doc, iconBg: 'bg-indigo-50',
    route: '/admin/settings?tab=pages&sub=blog', target: '[data-guide="settings-blog"]', prefer: 'right',
    tips: ['"Manage posts" jumps to the Blog Posts admin page', '"Categories" jumps to Blog Categories', 'Enable the CTA to show an action card between posts', 'Use the overlay to darken the cover for readable text'],
  },
  {
    title: 'Services Page',
    description: 'Hero, service groups, optional stats and summary strips, plus a bottom CTA.',
    icon: icons.sliders, iconBg: 'bg-teal-50',
    route: '/admin/settings?tab=pages&sub=services', target: '[data-guide="settings-services"]', prefer: 'right',
    tips: ['Two hero buttons — primary and secondary', 'Group services under headings (e.g. "Everyday spending")', 'Summary strip and stats row are optional toggles', 'Each service can have its own image and CTA link'],
  },
  {
    title: 'Contact Page',
    description: 'Info card, contact entries, and support promises — all edited in place.',
    icon: icons.mail, iconBg: 'bg-blue-50',
    route: '/admin/settings?tab=pages&sub=contact', target: '[data-guide="settings-contact"]', prefer: 'right',
    tips: ['Add multiple departments (Sales, Support, etc.)', 'Support promises appear on the dark strip — click to edit text and icons'],
  },
  {
    title: 'Feature Toggles',
    description: 'Turn optional store features on or off.',
    icon: icons.sliders, iconBg: 'bg-indigo-50',
    route: '/admin/settings?tab=general', target: '[data-guide="settings-features"]', prefer: 'right',
    tips: ['Favorites: customers can heart products they love'],
  },
  {
    title: 'Welcome Popup',
    description: 'First-time visitors enter their email and get a unique one-time discount code.',
    icon: icons.tagPink, iconBg: 'bg-amber-50',
    route: '/admin/settings?tab=popup', target: '[data-guide="settings-welcome-popup"]', prefer: 'right',
    tips: ['Link it to a discount — each subscriber gets their own code', 'Shows once per visitor'],
  },
  {
    title: 'Site Modules',
    description: 'Turn entire sections on or off — Shop, Blog, Services, About, Contact.',
    icon: icons.sliders, iconBg: 'bg-indigo-50',
    route: '/admin/settings?tab=modules', target: '[data-guide="settings-modules"]', prefer: 'right',
    tips: ['Disabled pages redirect to the homepage', 'Hides nav links and related UI (e.g. cart icon when Shop is off)', 'Re-enable here anytime'],
  },
  {
    title: 'Save Changes',
    description: 'This bar pops up whenever you have unsaved edits. Click Save — or Reset to undo.',
    icon: icons.check, iconBg: 'bg-green-50',
    route: '/admin/settings?tab=general', target: '[data-guide="settings-save"]', prefer: 'top',
  },

  // ── Shipping ─────────────────────────────────────────────
  {
    title: 'Shipping Fees',
    description: 'Add-ons (express, registered, insurance) and a free-shipping threshold.',
    icon: icons.truck, iconBg: 'bg-blue-50',
    route: '/admin/shipping', target: '[data-guide="shipping-fees"]', prefer: 'right',
    tips: ['Set free-shipping threshold to $0 to disable it'],
  },
  {
    title: 'Shipping Zones',
    description: 'Set rates per region — city, state, country, international.',
    icon: icons.globe, iconBg: 'bg-blue-50',
    route: '/admin/shipping', target: '[data-guide="shipping-zones"]', prefer: 'right',
    tips: ['Toggle each zone on or off', 'Base rate + optional per-kg and per-m³ rates'],
  },

  // ── Tax ──────────────────────────────────────────────────
  {
    title: 'Tax Setup',
    description: 'Turn tax on, set the default rate, and choose inclusive or exclusive pricing.',
    icon: icons.calc, iconBg: 'bg-amber-50',
    route: '/admin/tax-settings', target: '[data-guide="tax-config"]', prefer: 'right',
    tips: ['Inclusive: tax is already baked into the price', 'Exclusive: tax is added at checkout', 'Customize the label (e.g. VAT, GST, Tax)'],
  },
  {
    title: 'Regional Tax Rules',
    description: 'Only needed if you sell across countries or states with different rates.',
    icon: icons.globe, iconBg: 'bg-blue-50',
    route: '/admin/tax-settings', target: '[data-guide="tax-regional"]', prefer: 'right',
    tips: ['Skip if you sell in one region only', 'Most specific rule wins: state > country > default'],
  },
  {
    title: 'Tax Preview',
    description: 'Enter any price to check the tax breakdown before you save.',
    icon: icons.eye, iconBg: 'bg-amber-50',
    route: '/admin/tax-settings', target: '[data-guide="tax-preview"]', prefer: 'left',
  },

  // ── Tax Report ─────────────────────────────────────────
  {
    title: 'Tax Report',
    description: 'Tax collected by region — export to CSV for your accountant.',
    icon: icons.doc, iconBg: 'bg-green-50',
    route: '/admin/tax-report', target: '[data-guide="tax-report"]', prefer: 'bottom',
    tips: ['Filter by date range and order status'],
  },

  // ── Payments ─────────────────────────────────────────────
  {
    title: 'Payment Methods',
    description: 'Choose what customers can pay with — enable at least one before going live.',
    icon: icons.card, iconBg: 'bg-green-50',
    route: '/admin/payment-settings', target: '[data-guide="payment-methods"]', prefer: 'right',
    tips: ['Cash, Stripe, PayPal, Square'],
  },
  {
    title: 'Security Notice',
    description: 'Payment keys live safely on the server. Always test in practice mode first.',
    icon: icons.lock, iconBg: 'bg-red-50',
    route: '/admin/payment-settings', target: '[data-guide="payment-security"]', prefer: 'top',
    tips: ['Never share payment keys in messages or chat', 'Your developer sets these up for you'],
  },

  // ── Finish ───────────────────────────────────────────────
  {
    title: 'You\'re All Set!',
    description: 'Your launch checklist — tick these off before going live:',
    icon: icons.done, iconBg: 'bg-green-50',
    route: '/admin',
    tips: [
      'Set your store name and logo',
      'Customize Home, About, Shop, Blog, Services, and Contact',
      'Add products and categories',
      'Write a first blog post (optional)',
      'Add your services and service categories (if applicable)',
      'Toggle off any modules you don\'t need (Modules tab)',
      'Enable at least one payment method',
      'Configure shipping zones and tax',
      'Replay this guide anytime with the "Guide" button in the header',
    ],
  },
]
