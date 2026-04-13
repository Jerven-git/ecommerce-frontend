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
    description: 'Let\'s walk through every section of your store. This interactive guide will highlight key features on each page.',
    icon: icons.smile, iconBg: 'bg-primary-50',
    route: '/admin',
  },

  // ── Dashboard ────────────────────────────────────────────
  {
    title: 'Key Metrics',
    description: 'Your store\'s vital numbers at a glance. Click any card to jump to that section.',
    icon: icons.grid, iconBg: 'bg-blue-50',
    route: '/admin', target: '[data-guide="stats"]', prefer: 'bottom',
    tips: ['Total products, orders, pending items, and revenue', 'Cards with links are clickable — jump straight to that page'],
  },
  {
    title: 'Recent Orders',
    description: 'Your latest 5 orders with live status badges. Quickly spot what needs attention.',
    icon: icons.doc, iconBg: 'bg-green-50',
    route: '/admin', target: '[data-guide="recent-orders"]', prefer: 'left',
    tips: ['Color-coded status: pending, processing, shipped, delivered', 'Click "View all" to see every order'],
  },

  // ── Sidebar ──────────────────────────────────────────────
  {
    title: 'Navigation',
    description: 'The sidebar is your main menu. Access every section of your store from here.',
    icon: icons.menu, iconBg: 'bg-purple-50',
    route: '/admin', target: '[data-guide="sidebar-nav"]', prefer: 'right',
    tips: ['Dashboard, Products, Categories, Orders, Backorders, Discounts', 'Collapse the sidebar with the arrow button for more workspace'],
  },
  {
    title: 'Settings Menu',
    description: 'Configure the core of your store — appearance, shipping, tax rules, and payment providers.',
    icon: icons.gear, iconBg: 'bg-gray-100',
    route: '/admin', target: '[data-guide="sidebar-settings"]', prefer: 'right',
    tips: ['Site Settings, Shipping, Tax, and Payments', 'Set these up before launching your store'],
  },

  // ── Products ─────────────────────────────────────────────
  {
    title: 'Add Product Button',
    description: 'Start building your catalogue. This opens a form where you set name, price, stock, images, and more.',
    icon: icons.plus, iconBg: 'bg-primary-50',
    route: '/admin/products', target: '[data-guide="add-product-btn"]', prefer: 'bottom',
    tips: ['Set product name, description, price, and stock', 'Upload images and assign categories', 'Toggle active/inactive and backorder settings'],
  },
  {
    title: 'Product Filters',
    description: 'Quickly find products by searching or filtering by status.',
    icon: icons.search, iconBg: 'bg-indigo-50',
    route: '/admin/products', target: '[data-guide="product-filters"]', prefer: 'bottom',
    tips: ['Search by product name', 'Filter by Active or Inactive status'],
  },
  {
    title: 'Products Table',
    description: 'Your full product list. See price, stock, weight, category, and status at a glance.',
    icon: icons.table, iconBg: 'bg-primary-50',
    route: '/admin/products', target: '[data-guide="product-table"]', prefer: 'top',
    tips: ['Click Edit to modify any product', 'Click Delete to remove (with confirmation)', 'Use the page navigation at the bottom to browse large catalogues'],
  },

  // ── Categories ───────────────────────────────────────────
  {
    title: 'Add Category',
    description: 'Type a name and click Add to create a root category. You can nest subcategories inside any category.',
    icon: icons.tag, iconBg: 'bg-purple-50',
    route: '/admin/categories', target: '[data-guide="add-category"]', prefer: 'bottom',
    tips: ['Type a name and press Add or Enter', 'You can place categories inside other categories, as deep as you need'],
  },
  {
    title: 'Category Tree',
    description: 'Your full category list. Expand, collapse, rename, delete, or add sub-categories right here.',
    icon: icons.list, iconBg: 'bg-purple-50',
    route: '/admin/categories', target: '[data-guide="category-tree"]', prefer: 'right',
    tips: ['Click the arrow to expand/collapse children', 'Use edit, delete, and add-child buttons on each row', 'Search bar at the top to find categories quickly'],
  },

  // ── Orders ───────────────────────────────────────────────
  {
    title: 'Order Filters',
    description: 'Filter orders by status to focus on what needs your attention right now.',
    icon: icons.filter, iconBg: 'bg-green-50',
    route: '/admin/orders', target: '[data-guide="order-filters"]', prefer: 'bottom',
    tips: ['Search by customer name, email, or order number', 'Status badges show counts for each category', 'Includes pending, processing, shipped, delivered, cancelled, and backorder'],
  },
  {
    title: 'Order Cards',
    description: 'Each order shows full details: customer info, items, shipping, payment, and status controls.',
    icon: icons.doc, iconBg: 'bg-green-50',
    route: '/admin/orders', target: '[data-guide="order-list"]', prefer: 'left',
    tips: ['Change status with the dropdown selector', 'Confirm or undo payments for cash orders', 'Ship orders and add tracking numbers', 'View full order summary with subtotal, tax, shipping, and discounts'],
  },

  // ── Backorders ───────────────────────────────────────────
  {
    title: 'Backorder Filters',
    description: 'Track out-of-stock orders. Filter by status to see what needs restocking or follow-up.',
    icon: icons.clock, iconBg: 'bg-amber-50',
    route: '/admin/backorders', target: '[data-guide="backorder-filters"]', prefer: 'bottom',
    tips: ['Filter: Awaiting Stock, Notified, Expired, Paid, Cancelled', 'Search by customer name or email'],
  },
  {
    title: 'Backorder Settings',
    description: 'Configure how backorders work — enable/disable them and set payment link expiry time.',
    icon: icons.gearAmb, iconBg: 'bg-amber-50',
    route: '/admin/backorders', target: '[data-guide="backorder-settings-btn"]', prefer: 'bottom',
    tips: ['Turn backorders on or off for your whole store', 'Set how long payment links stay valid', 'Send payment links to customers when stock arrives'],
  },

  // ── Discounts ────────────────────────────────────────────
  {
    title: 'Add Discount',
    description: 'Create promotional discount codes for your customers.',
    icon: icons.plusPink, iconBg: 'bg-pink-50',
    route: '/admin/discounts', target: '[data-guide="add-discount-btn"]', prefer: 'bottom',
    tips: ['Set a code, type (percentage or fixed), and value', 'Optionally set expiry date, max uses, and minimum order amount'],
  },
  {
    title: 'Discount Filters & Table',
    description: 'Manage all your discount codes. See usage, status, and expiry at a glance.',
    icon: icons.tagPink, iconBg: 'bg-pink-50',
    route: '/admin/discounts', target: '[data-guide="discount-filters"]', prefer: 'bottom',
    tips: ['Filter by Active or Inactive status', 'Search by code or description', 'Edit or delete codes from the table actions'],
  },

  // ── Site Settings ────────────────────────────────────────
  {
    title: 'General Settings',
    description: 'Set your store name, upload your logo, favicon, and cart icon. This is the first thing customers see.',
    icon: icons.store, iconBg: 'bg-gray-100',
    route: '/admin/settings?tab=general', target: '[data-guide="settings-general"]', prefer: 'right',
    tips: ['Store Name appears in the header and browser tab', 'Upload a logo (PNG, JPG, SVG) and a square favicon', 'Upload a custom cart icon for a personal touch'],
  },
  {
    title: 'Theme Customization',
    description: 'Choose your store\'s color scheme, fonts, and background texture to match your brand.',
    icon: icons.palette, iconBg: 'bg-purple-50',
    route: '/admin/settings?tab=appearance', target: '[data-guide="settings-theme"]', prefer: 'right',
    tips: ['Pick from 5 built-in presets (Ocean Blue, Forest Green, Warm Sunset, etc.)', 'Customize primary, secondary, and accent colors with the color pickers', 'Choose heading and body fonts from 8 options', 'Add a subtle background texture: dots, grid, diagonal lines, and more'],
  },
  // ── Pages (sub-tabbed) ───────────────────────────────────
  {
    title: 'Page Editors',
    description: 'All your store pages live here — Homepage, About, Shop, and Contact. Use these sub-tabs to switch between them.',
    icon: icons.doc, iconBg: 'bg-green-50',
    route: '/admin/settings?tab=pages&sub=homepage', target: '[data-guide="settings-pages-nav"]', prefer: 'bottom',
    tips: ['Each page has its own visual editor — what you see is what your customers see', 'Click directly on any text in the preview to edit it', 'Hover cards for delete buttons, click "+" to add items', 'All four pages: Homepage, About, Shop, Contact'],
  },
  {
    title: 'Homepage Hero',
    description: 'Customize the hero banner that greets visitors on your storefront.',
    icon: icons.home, iconBg: 'bg-green-50',
    route: '/admin/settings?tab=pages&sub=homepage', target: '[data-guide="settings-homepage"]', prefer: 'right',
    tips: ['Set a catchy hero title and subtitle', 'Upload a hero image or video (recommended 1920×600 px)', 'This is the first section visitors see on your site'],
  },
  {
    title: 'Homepage Sections',
    description: 'Edit How It Works, Features, Stats, and Newsletter sections directly in a visual display.',
    icon: icons.grid, iconBg: 'bg-amber-50',
    route: '/admin/settings?tab=pages&sub=homepage', target: '[data-guide="settings-homepage-sections"]', prefer: 'right',
    tips: ['Click any text to edit it right on the page', 'Hover and click cards to manage edits', 'Icons are clickable — pick from the icon library', 'Changes preview live as you type'],
  },
  {
    title: 'About Page',
    description: 'Tell your story with a visual editor. Edit text and highlights right inside the display cards.',
    icon: icons.info, iconBg: 'bg-amber-50',
    route: '/admin/settings?tab=pages&sub=about', target: '[data-guide="settings-about"]', prefer: 'right',
    tips: ['Upload an about image (recommended 800×600 pixels)', 'Click the story text to edit it directly', 'Highlight cards show as they appear on the page — click to edit titles and descriptions', 'Hover a highlight card to delete, or click "+" to add more'],
  },
  {
    title: 'Shop Page — Header & Promo',
    description: 'Your shop page has a visual editor too! Edit the page header and the promo banner at the bottom of the shop — just click any text to change it.',
    icon: icons.store, iconBg: 'bg-blue-50',
    route: '/admin/settings?tab=pages&sub=shop', target: '[data-guide="settings-shop"]', prefer: 'right',
    tips: ['The page header shows label, heading, and subtitle — click to edit each one', 'The promo banner uses your actual theme colors for a live preview', 'Perks appear as editable pills — hover to delete, click "+" to add', 'Click the button text to change what it says'],
  },
  {
    title: 'Contact Page — Info & Promises',
    description: 'Edit your contact page just like the others. The info card, contact entries, and support promises are all visual editors.',
    icon: icons.mail, iconBg: 'bg-blue-50',
    route: '/admin/settings?tab=pages&sub=contact', target: '[data-guide="settings-contact"]', prefer: 'right',
    tips: ['The info card header has editable title and subtitle', 'Contact entries show with email and phone icons — click to edit, hover to delete', 'Add multiple contact departments (Sales, Support, etc.)', 'Support promises appear on the dark strip — click to edit the text and choose icons'],
  },
  {
    title: 'Feature Toggles',
    description: 'Enable or disable optional store features to tailor your storefront.',
    icon: icons.sliders, iconBg: 'bg-indigo-50',
    route: '/admin/settings?tab=general', target: '[data-guide="settings-features"]', prefer: 'right',
    tips: ['Favorites: let customers heart products they love', 'More toggles coming soon — reviews, wishlists, and more'],
  },
  {
    title: 'Welcome Popup',
    description: 'Show a discount popup to first-time visitors. They enter their email and get a unique single-use discount code instantly.',
    icon: icons.tagPink, iconBg: 'bg-amber-50',
    route: '/admin/settings?tab=popup', target: '[data-guide="settings-welcome-popup"]', prefer: 'right',
    tips: ['Turn the popup on or off', 'Customize the heading and body text', 'Link a discount — each subscriber gets their own unique, one-time discount code based on it', 'The popup only shows once to each visitor'],
  },
  {
    title: 'Save Changes',
    description: 'Don\'t forget to save! The save bar sticks to the bottom of the page whenever you have unsaved changes.',
    icon: icons.check, iconBg: 'bg-green-50',
    route: '/admin/settings?tab=general', target: '[data-guide="settings-save"]', prefer: 'top',
    tips: ['Click "Save Changes" to save your edits', 'Use "Reset" to undo any unsaved changes', 'A green confirmation appears when saving is successful'],
  },

  // ── Shipping ─────────────────────────────────────────────
  {
    title: 'Shipping Fees',
    description: 'Set add-on fees for express post, registered mail, and insurance. Plus a free shipping threshold.',
    icon: icons.truck, iconBg: 'bg-blue-50',
    route: '/admin/shipping', target: '[data-guide="shipping-fees"]', prefer: 'right',
    tips: ['Express post, registered post, and insurance are add-on fees', 'Free shipping threshold: orders above this amount ship free', 'Set to $0 to disable free shipping'],
  },
  {
    title: 'Shipping Zones',
    description: 'Define rates for different regions — own city, state, country, and international.',
    icon: icons.globe, iconBg: 'bg-blue-50',
    route: '/admin/shipping', target: '[data-guide="shipping-zones"]', prefer: 'right',
    tips: ['Turn each zone on or off with the toggle', 'Set a base rate, plus optional per-kilogram and per-cubic-meter rates', 'Your store location determines how zones are calculated'],
  },

  // ── Tax ──────────────────────────────────────────────────
  {
    title: 'Tax Configuration',
    description: 'Enable tax and set your default rate. Choose whether prices include or exclude tax.',
    icon: icons.calc, iconBg: 'bg-amber-50',
    route: '/admin/tax-settings', target: '[data-guide="tax-config"]', prefer: 'right',
    tips: ['Turn tax on or off for your whole store', 'Set a percentage rate (e.g., 12% VAT, 10% GST)', 'Choose inclusive (tax already included in the price) or exclusive (added at checkout)', 'Customize the tax label shown to customers'],
  },
  {
    title: 'Regional Tax Rules',
    description: 'Selling to multiple countries? Set different tax rates per country or state.',
    icon: icons.globe, iconBg: 'bg-blue-50',
    route: '/admin/tax-settings', target: '[data-guide="tax-regional"]', prefer: 'right',
    tips: ['Optional — skip this if you only sell in one country', 'Optional — skip this if you do not sell enough in any other country or state or do not qualify for tax implications there', 'Add country rules with their own rate, name, and mode', 'Expand a country to add state-level rules', 'Most specific rule wins: state > country > all regions > global default'],
  },
  {
    title: 'Tax Preview',
    description: 'See exactly how tax affects a sample price before you save. Try different amounts to verify.',
    icon: icons.eye, iconBg: 'bg-amber-50',
    route: '/admin/tax-settings', target: '[data-guide="tax-preview"]', prefer: 'left',
    tips: ['Enter any price to preview the tax breakdown', 'Shows base price, tax amount, and total', 'Updates live as you change the rate or mode'],
  },

  // ── Tax Report ─────────────────────────────────────────
  {
    title: 'Tax Report',
    description: 'View tax collected by region and export the data for your accountant.',
    icon: icons.doc, iconBg: 'bg-green-50',
    route: '/admin/tax-report', target: '[data-guide="tax-report"]', prefer: 'bottom',
    tips: ['Filter by date range and order status', 'See orders, subtotal, tax collected, and total per region', 'Export to CSV for accounting and tax filing'],
  },

  // ── Payments ─────────────────────────────────────────────
  {
    title: 'Payment Methods',
    description: 'Toggle which payment options are available at checkout. Enable at least one before going live.',
    icon: icons.card, iconBg: 'bg-green-50',
    route: '/admin/payment-settings', target: '[data-guide="payment-methods"]', prefer: 'right',
    tips: ['Cash: accept payment on delivery or pickup', 'Stripe: credit/debit cards', 'PayPal: online payments', 'Square: alternative card processor'],
  },
  {
    title: 'Security Notice',
    description: 'Your payment provider keys are stored safely on your server, not in the database. Always test in practice mode before accepting real payments.',
    icon: icons.lock, iconBg: 'bg-red-50',
    route: '/admin/payment-settings', target: '[data-guide="payment-security"]', prefer: 'top',
    tips: ['Your developer should set up your payment keys on the server', 'Never share your payment keys publicly or in messages', 'Always test in practice mode before going live'],
  },

  // ── Finish ───────────────────────────────────────────────
  {
    title: 'You\'re All Set!',
    description: 'You\'ve seen every section of your admin panel. Here\'s your launch checklist:',
    icon: icons.done, iconBg: 'bg-green-50',
    route: '/admin',
    tips: [
      'Set your store name and logo in Site Settings',
      'Customize your Homepage, About, Shop, and Contact pages under Pages',
      'Enable at least one payment method',
      'Configure shipping zones and rates',
      'Add products and organize them into categories',
      'Replay this guide anytime with the "Guide" button in the header',
    ],
  },
]
