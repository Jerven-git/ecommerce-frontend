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
  brush:    icon('<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.53 16.122a3 3 0 00-5.78 1.128 2.25 2.25 0 01-2.4 2.245 4.5 4.5 0 008.4-2.245c0-.399-.078-.78-.22-1.128zm0 0a15.998 15.998 0 003.388-1.62m-5.043-.025a15.994 15.994 0 011.622-3.395m3.42 3.42a15.995 15.995 0 004.764-4.648l3.876-5.814a1.151 1.151 0 00-1.597-1.597L14.146 6.32a15.996 15.996 0 00-4.649 4.763m3.42 3.42a6.776 6.776 0 00-3.42-3.42" />', 'fuchsia-600'),
  video:    icon('<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />', 'rose-600'),
  star:     icon('<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118L2.05 10.1c-.783-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />', 'amber-600'),
  trophy:   icon('<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16.5 18.75h-9m9 0a3 3 0 013 3h-15a3 3 0 013-3m9 0v-3.375c0-.621-.503-1.125-1.125-1.125h-.871M7.5 18.75v-3.375c0-.621.504-1.125 1.125-1.125h.872m5.007 0H9.497m5.007 0a7.454 7.454 0 01-.982-3.172M9.497 14.25a7.454 7.454 0 00.981-3.172M5.25 4.236c-.982.143-1.954.317-2.916.52A6.003 6.003 0 007.73 9.728M5.25 4.236V4.5c0 2.108.966 3.99 2.48 5.228M5.25 4.236V2.721C7.456 2.41 9.71 2.25 12 2.25c2.291 0 4.545.16 6.75.47v1.516M7.73 9.728a6.726 6.726 0 002.748 1.35m8.272-6.842V4.5c0 2.108-.966 3.99-2.48 5.228m2.48-5.492a46.32 46.32 0 012.916.52 6.003 6.003 0 01-5.395 4.972m0 0a6.726 6.726 0 01-2.749 1.35m0 0a6.772 6.772 0 01-3.044 0" />', 'amber-600'),
  seo:      icon('<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v6m-3-3h6" />', 'indigo-600'),
}

// ═════════════════════════════════════════════════════════════
//  GUIDE STEPS — edit this array to add, remove, or reorder
// ═════════════════════════════════════════════════════════════

export const guideSteps: GuideStep[] = [

  // ── Welcome ──────────────────────────────────────────────
  {
    title: 'Welcome — let\'s walk through your shop',
    description: 'A short tour of everything you can do here. Each stop highlights one feature. Use Next, Back, or Skip — you can replay the tour anytime from the Guide button up top.',
    icon: icons.smile, iconBg: 'bg-primary-50',
    route: '/admin',
  },

  // ── Dashboard ────────────────────────────────────────────
  {
    title: 'Your shop at a glance',
    description: 'These cards show how things are going today — total products, orders coming in, what needs attention, and revenue.',
    icon: icons.grid, iconBg: 'bg-blue-50',
    route: '/admin', target: '[data-guide="stats"]', prefer: 'bottom',
    tips: ['Click any card to jump straight to that section'],
  },
  {
    title: 'Recent orders',
    description: 'Your 5 most recent orders with live status — handy for spotting anything that needs your attention.',
    icon: icons.doc, iconBg: 'bg-green-50',
    route: '/admin', target: '[data-guide="recent-orders"]', prefer: 'left',
    tips: ['"View all" opens the full order list'],
  },

  // ── Sidebar ──────────────────────────────────────────────
  {
    title: 'Main menu',
    description: 'Everything you manage day-to-day lives in this sidebar — products, content, orders, customer requests, and more.',
    icon: icons.menu, iconBg: 'bg-purple-50',
    route: '/admin', target: '[data-guide="sidebar-nav"]', prefer: 'right',
    tips: [
      'Products & Categories — your catalogue',
      'Blog Posts & Blog Categories — your articles',
      'Services & Service Categories — what you offer',
      'Orders & Backorders — sales and out-of-stock follow-ups',
      'Discounts — promo codes',
      'Commissions — custom artwork requests from customers',
      'Tap the arrow to collapse the sidebar for more space',
    ],
  },
  {
    title: 'Settings menu',
    description: 'Everything you set up once and rarely touch — branding, page content, shipping, tax, and payments.',
    icon: icons.gear, iconBg: 'bg-gray-100',
    route: '/admin', target: '[data-guide="sidebar-settings"]', prefer: 'right',
    tips: ['Worth a 10-minute pass through these before you go live'],
  },

  // ── Products ─────────────────────────────────────────────
  {
    title: 'Add a product',
    description: 'Click here to add something to your shop — name it, set a price and stock count, upload photos, and you\'re done.',
    icon: icons.plus, iconBg: 'bg-primary-50',
    route: '/admin/products', target: '[data-guide="add-product-btn"]', prefer: 'bottom',
    tips: [
      'Assign categories so customers can find it',
      'Hide it from the shop anytime with the active/inactive toggle',
      'Let customers backorder when stock runs out',
    ],
  },
  {
    title: 'Search and filter',
    description: 'Find a product fast by typing its name, or narrow the list to just active or inactive items.',
    icon: icons.search, iconBg: 'bg-indigo-50',
    route: '/admin/products', target: '[data-guide="product-filters"]', prefer: 'bottom',
  },
  {
    title: 'Your full catalogue',
    description: 'Every product you sell, with price, stock, category, and status all in one view.',
    icon: icons.table, iconBg: 'bg-primary-50',
    route: '/admin/products', target: '[data-guide="product-table"]', prefer: 'top',
    tips: ['Hit Edit on any row to change details', 'Pages appear at the bottom once you have a few products'],
  },

  // ── Categories ───────────────────────────────────────────
  {
    title: 'Add a category',
    description: 'Categories help customers browse — type a name, press Add, and it\'s ready. You can also nest them (e.g. Watches → Vintage → 1960s).',
    icon: icons.tag, iconBg: 'bg-purple-50',
    route: '/admin/categories', target: '[data-guide="add-category"]', prefer: 'bottom',
  },
  {
    title: 'Your category tree',
    description: 'Rename, delete, or tuck sub-categories under existing ones — all from this list.',
    icon: icons.list, iconBg: 'bg-purple-50',
    route: '/admin/categories', target: '[data-guide="category-tree"]', prefer: 'right',
    tips: ['Click the arrow next to a name to expand or collapse', 'Use the search box up top to jump to one quickly'],
  },

  // ── Blog Posts ───────────────────────────────────────────
  {
    title: 'Write a blog post',
    description: 'Share news, tips, or behind-the-scenes stories. Opens a clean editor with a live preview so you see how it\'ll look.',
    icon: icons.plus, iconBg: 'bg-primary-50',
    route: '/admin/posts', target: '[data-guide="add-post-btn"]', prefer: 'bottom',
    tips: [
      'Title, short summary, cover image, and your story',
      'Save it as a draft and come back to it — only Published posts show on the site',
      'Pick a category and star your favourites so they get featured',
    ],
  },
  {
    title: 'Search your posts',
    description: 'Look up a post by name, or filter to see only drafts or published articles.',
    icon: icons.search, iconBg: 'bg-indigo-50',
    route: '/admin/posts', target: '[data-guide="post-filters"]', prefer: 'bottom',
    tips: ['Show just drafts when you\'re catching up on unfinished work', 'Filter by category to focus on one topic'],
  },
  {
    title: 'All your posts',
    description: 'Every article in one place. Edit or remove any row whenever you like.',
    icon: icons.table, iconBg: 'bg-primary-50',
    route: '/admin/posts', target: '[data-guide="post-table"]', prefer: 'top',
    tips: ['A gold star means a post is featured', 'Drafts stay private — only you can see them'],
  },

  // ── Blog Categories ──────────────────────────────────────
  {
    title: 'New blog topic',
    description: 'Group your posts by topic (e.g. News, Tips, Stories). Each topic gets its own colour tile on the blog.',
    icon: icons.tagPink, iconBg: 'bg-pink-50',
    route: '/admin/post-categories', target: '[data-guide="add-post-category-btn"]', prefer: 'bottom',
    tips: ['Pick two colours to make a smooth gradient tile', 'Each post then shows a coloured badge matching its topic'],
  },
  {
    title: 'Your blog topics',
    description: 'Rename, recolour, or remove topics here — and see how many posts are in each.',
    icon: icons.list, iconBg: 'bg-purple-50',
    route: '/admin/post-categories', target: '[data-guide="post-category-list"]', prefer: 'right',
  },

  // ── Services ─────────────────────────────────────────────
  {
    title: 'Add a service',
    description: 'For everything you do beyond products — repairs, custom work, consultations. Each service gets its own page.',
    icon: icons.plus, iconBg: 'bg-primary-50',
    route: '/admin/services', target: '[data-guide="add-service-btn"]', prefer: 'bottom',
    tips: [
      'Title, summary, full description, and a cover image',
      'Save as a draft until you\'re ready to publish',
      'Group it under a service category to keep things tidy',
    ],
  },
  {
    title: 'Find a service',
    description: 'Search by name or narrow by status and category.',
    icon: icons.search, iconBg: 'bg-indigo-50',
    route: '/admin/services', target: '[data-guide="service-filters"]', prefer: 'bottom',
    tips: ['Drafts stay hidden until you publish them'],
  },
  {
    title: 'All your services',
    description: 'Your full list of services — edit or delete any of them right from the row.',
    icon: icons.table, iconBg: 'bg-primary-50',
    route: '/admin/services', target: '[data-guide="service-table"]', prefer: 'top',
    tips: ['Drafts won\'t appear on your website'],
  },

  // ── Service Categories ───────────────────────────────────
  {
    title: 'New service group',
    description: 'Group related services under a heading like "Everyday spending" or "Travel" so customers can scan them quickly.',
    icon: icons.tagPink, iconBg: 'bg-pink-50',
    route: '/admin/service-categories', target: '[data-guide="add-service-category-btn"]', prefer: 'bottom',
  },
  {
    title: 'Your service groups',
    description: 'Edit or remove groups here. You\'ll also see how many services are in each one.',
    icon: icons.list, iconBg: 'bg-purple-50',
    route: '/admin/service-categories', target: '[data-guide="service-category-list"]', prefer: 'right',
  },

  // ── Orders ───────────────────────────────────────────────
  {
    title: 'Filter your orders',
    description: 'Jump straight to what needs you — pending payments, ones to ship, or anything customers are waiting on.',
    icon: icons.filter, iconBg: 'bg-green-50',
    route: '/admin/orders', target: '[data-guide="order-filters"]', prefer: 'bottom',
    tips: [
      'Look up an order by customer, email, or order number',
      'Tabs show counts: pending, processing, shipped, delivered, cancelled, and backorder',
    ],
  },
  {
    title: 'Order details',
    description: 'Each card shows everything about one order — customer info, what they bought, how they paid, shipping details, and status.',
    icon: icons.doc, iconBg: 'bg-green-50',
    route: '/admin/orders', target: '[data-guide="order-list"]', prefer: 'left',
    tips: ['Move it through statuses as you go', 'Confirm cash payments and paste in tracking numbers from here'],
  },

  // ── Backorders ───────────────────────────────────────────
  {
    title: 'Backorders',
    description: 'When customers want something that\'s out of stock, it lands here. Filter to see who\'s waiting and who you\'ve already invoiced.',
    icon: icons.clock, iconBg: 'bg-amber-50',
    route: '/admin/backorders', target: '[data-guide="backorder-filters"]', prefer: 'bottom',
    tips: ['Tabs: Awaiting Stock, Notified, Expired, Paid, Cancelled'],
  },
  {
    title: 'Backorder settings',
    description: 'Decide whether to accept backorders at all, and how long a payment link should stay valid once stock arrives.',
    icon: icons.gearAmb, iconBg: 'bg-amber-50',
    route: '/admin/backorders', target: '[data-guide="backorder-settings-btn"]', prefer: 'bottom',
    tips: ['Customers get an email with a payment link the moment the item is back'],
  },

  // ── Discounts ────────────────────────────────────────────
  {
    title: 'Create a discount code',
    description: 'Spin up a promo code in seconds — a percentage off or a flat amount, your choice.',
    icon: icons.plusPink, iconBg: 'bg-pink-50',
    route: '/admin/discounts', target: '[data-guide="add-discount-btn"]', prefer: 'bottom',
    tips: ['Add limits if you like: expiry date, max uses, or a minimum cart amount'],
  },
  {
    title: 'Your discount codes',
    description: 'Every code in one place — see which are active, how many times each has been used, and when they expire.',
    icon: icons.tagPink, iconBg: 'bg-pink-50',
    route: '/admin/discounts', target: '[data-guide="discount-filters"]', prefer: 'bottom',
    tips: ['Show only active or inactive codes', 'Edit or delete a code straight from the row'],
  },

  // ── Commissions ──────────────────────────────────────────
  {
    title: 'Commission requests',
    description: 'When a customer fills in the commission form on your site, their request appears here — title, description, budget, and contact info, all in one place.',
    icon: icons.brush, iconBg: 'bg-fuchsia-50',
    route: '/admin/commissions', target: '[data-guide="commission-filters"]', prefer: 'bottom',
    tips: [
      'Filter by status to focus on what\'s new or in progress',
      'Statuses follow the request lifecycle (new → reviewing → quoted → accepted → done)',
    ],
  },
  {
    title: 'Open a request',
    description: 'Click View to see the full brief and update the status as you work through it.',
    icon: icons.doc, iconBg: 'bg-fuchsia-50',
    route: '/admin/commissions', target: '[data-guide="commission-table"]', prefer: 'top',
    tips: ['Don\'t need this feature? Turn it off in Settings → Modules'],
  },

  // ── Site Settings ────────────────────────────────────────
  {
    title: 'General settings',
    description: 'The basics every visitor sees — your store name, logo, favicon (the little browser-tab icon), and the cart icon up top.',
    icon: icons.store, iconBg: 'bg-gray-100',
    route: '/admin/settings?tab=general', target: '[data-guide="settings-general"]', prefer: 'right',
    tips: ['Logo and cart icon work as PNG, JPG, or SVG', 'Favicon should be a small square image — 32×32 or 64×64 is perfect'],
  },
  {
    title: 'Theme — make it yours',
    description: 'Match your brand in a minute. Pick colours, fonts, and a subtle background texture.',
    icon: icons.palette, iconBg: 'bg-purple-50',
    route: '/admin/settings?tab=appearance', target: '[data-guide="settings-theme"]', prefer: 'right',
    tips: [
      'Start from a preset (Ocean Blue, Forest Green, Sunset…) and tweak from there',
      'Set your primary, secondary, and accent colours separately',
      'Eight font pairings to choose from for headings and body text',
    ],
  },
  // ── Pages (sub-tabbed) ───────────────────────────────────
  {
    title: 'Edit your pages',
    description: 'A visual editor for every public page — Home, About, Shop, Blog, Services, and Contact. What you see here is exactly what your customers see.',
    icon: icons.doc, iconBg: 'bg-green-50',
    route: '/admin/settings?tab=pages&sub=homepage', target: '[data-guide="settings-pages-nav"]', prefer: 'bottom',
    tips: [
      'Use the pill tabs to switch between pages',
      'Click any piece of text in the preview to edit it',
      'Hover a card or item to reveal delete, drag to reorder, click "+" to add',
    ],
  },
  {
    title: 'Homepage hero',
    description: 'The big banner visitors meet first — set a title, subtitle, and a background image or short video.',
    icon: icons.home, iconBg: 'bg-green-50',
    route: '/admin/settings?tab=pages&sub=homepage', target: '[data-guide="settings-homepage"]', prefer: 'right',
    tips: [
      'Looks best at 1920×600 px',
      'Use the overlay slider to darken the image so your text stays readable',
      'Drag the focal point to keep the important part in frame on mobile',
    ],
  },
  {
    title: 'Featured showcase',
    description: 'A promo block under your featured products — one big video on the left and four eye-catching category tiles on the right.',
    icon: icons.video, iconBg: 'bg-fuchsia-50',
    route: '/admin/settings?tab=pages&sub=homepage', target: '[data-guide="settings-showcase"]', prefer: 'right',
    tips: [
      'Toggle the whole block off if you don\'t want it',
      'Upload a short looping video — it autoplays muted',
      'Each tile links to a category and has its own image',
    ],
  },
  {
    title: 'Watch & Shop',
    description: 'A carousel of short product videos so customers can see your items in action before they buy.',
    icon: icons.video, iconBg: 'bg-rose-50',
    route: '/admin/settings?tab=pages&sub=homepage', target: '[data-guide="settings-watchshop"]', prefer: 'right',
    tips: ['Hide it anytime with the visibility toggle', 'Each card links to a product page'],
  },
  {
    title: 'Best Sellers',
    description: 'Automatically shows your top-selling products based on real orders — no curation needed.',
    icon: icons.trophy, iconBg: 'bg-amber-50',
    route: '/admin/settings?tab=pages&sub=homepage', target: '[data-guide="settings-bestsellers"]', prefer: 'right',
    tips: [
      'Brand new store? A fallback list shows until enough sales come in',
      'Updates on its own as orders roll in',
    ],
  },
  {
    title: 'Homepage sections',
    description: 'The supporting blocks below the hero — How It Works, Features, Stats, and the Newsletter signup. Edit them right in place.',
    icon: icons.grid, iconBg: 'bg-amber-50',
    route: '/admin/settings?tab=pages&sub=homepage', target: '[data-guide="settings-homepage-sections"]', prefer: 'right',
    tips: [
      'Click any heading or paragraph to rewrite it',
      'Click an icon to pick a different one from the library',
      'Every change previews live as you type',
    ],
  },
  {
    title: 'SEO for this page',
    description: 'How this page looks in Google results and link previews on social media. Override the default title, description, and share image.',
    icon: icons.seo, iconBg: 'bg-indigo-50',
    route: '/admin/settings?tab=pages&sub=homepage', target: '[data-guide="seo-fields"]', prefer: 'top',
    tips: [
      'Aim for a title under 60 characters — counters show as you type',
      'Description sits well around 120–160 characters',
      'Cover image alt text helps screen readers and image search',
      'Every page has its own SEO panel under its tab',
    ],
  },
  {
    title: 'About page',
    description: 'Tell your story — words, photos, and a row of highlight cards that show what makes you, you.',
    icon: icons.info, iconBg: 'bg-amber-50',
    route: '/admin/settings?tab=pages&sub=about', target: '[data-guide="settings-about"]', prefer: 'right',
    tips: ['Cover image looks best around 800×600 px', 'Hover a highlight to remove it, or click "+" to add another'],
  },
  {
    title: 'Shop page',
    description: 'The header at the top of your shop and the promo banner at the bottom — both editable in place.',
    icon: icons.store, iconBg: 'bg-blue-50',
    route: '/admin/settings?tab=pages&sub=shop', target: '[data-guide="settings-shop"]', prefer: 'right',
    tips: ['Click any text to rewrite it', 'Add perks as little pills (free shipping, returns, etc.) — hover to remove'],
  },
  {
    title: 'Blog page',
    description: 'The cover image, header, and optional call-to-action banner for your blog landing page.',
    icon: icons.doc, iconBg: 'bg-indigo-50',
    route: '/admin/settings?tab=pages&sub=blog', target: '[data-guide="settings-blog"]', prefer: 'right',
    tips: [
      '"Manage posts" jumps over to the Blog Posts admin',
      '"Categories" jumps to Blog Categories',
      'Turn on the CTA to slip an action card in between posts',
      'Bump up the overlay if your cover image makes text hard to read',
    ],
  },
  {
    title: 'Services page',
    description: 'A hero up top, service groups in the middle, optional stats and summary strips, and a closing call-to-action at the bottom.',
    icon: icons.sliders, iconBg: 'bg-teal-50',
    route: '/admin/settings?tab=pages&sub=services', target: '[data-guide="settings-services"]', prefer: 'right',
    tips: [
      'Two buttons on the hero — a primary one and a softer secondary',
      'Group your services under friendly headings like "Everyday spending"',
      'Stats row and summary strip are optional — toggle them on if you need them',
      'Each service can have its own image and a link to learn more',
    ],
  },
  {
    title: 'Contact page',
    description: 'Your info card, contact methods, and the strip of support promises — all editable right on the page.',
    icon: icons.mail, iconBg: 'bg-blue-50',
    route: '/admin/settings?tab=pages&sub=contact', target: '[data-guide="settings-contact"]', prefer: 'right',
    tips: ['Add multiple departments — Sales, Support, Press, whatever fits', 'Click any promise on the dark strip to change the icon and text'],
  },
  {
    title: 'Feature toggles',
    description: 'Optional features you can switch on or off depending on what your shop needs.',
    icon: icons.sliders, iconBg: 'bg-indigo-50',
    route: '/admin/settings?tab=general', target: '[data-guide="settings-features"]', prefer: 'right',
    tips: ['Favourites: lets customers heart products they want to come back to'],
  },
  {
    title: 'Welcome popup',
    description: 'A friendly popup for first-time visitors — they drop their email, you send back a unique discount code. Great for building your list.',
    icon: icons.tagPink, iconBg: 'bg-amber-50',
    route: '/admin/settings?tab=popup', target: '[data-guide="settings-welcome-popup"]', prefer: 'right',
    tips: ['Link it to a discount and each subscriber gets their own one-time code', 'Shows once per visitor — won\'t annoy returning customers'],
  },
  {
    title: 'Site modules',
    description: 'Turn entire areas of your site on or off — Shop, Blog, Services, Commissions, About, and Contact. Hide what you don\'t need.',
    icon: icons.sliders, iconBg: 'bg-indigo-50',
    route: '/admin/settings?tab=modules', target: '[data-guide="settings-modules"]', prefer: 'right',
    tips: [
      'Disabled pages redirect to your homepage',
      'Related UI hides automatically too (e.g. the cart icon disappears when Shop is off)',
      'Flip anything back on later — nothing is permanent',
    ],
  },
  {
    title: 'Save your changes',
    description: 'This bar slides up whenever you have unsaved edits. Click Save to publish, or Reset to undo everything since the last save.',
    icon: icons.check, iconBg: 'bg-green-50',
    route: '/admin/settings?tab=general', target: '[data-guide="settings-save"]', prefer: 'top',
  },

  // ── Shipping ─────────────────────────────────────────────
  {
    title: 'Shipping fees',
    description: 'Optional add-ons customers can pick at checkout — express, registered, insurance — plus a free-shipping threshold to nudge bigger carts.',
    icon: icons.truck, iconBg: 'bg-blue-50',
    route: '/admin/shipping', target: '[data-guide="shipping-fees"]', prefer: 'right',
    tips: ['Set the free-shipping threshold to $0 if you don\'t want to offer free shipping'],
  },
  {
    title: 'Shipping zones',
    description: 'Charge different rates depending on where your customer is — city, state, country, or anywhere overseas.',
    icon: icons.globe, iconBg: 'bg-blue-50',
    route: '/admin/shipping', target: '[data-guide="shipping-zones"]', prefer: 'right',
    tips: ['Switch any zone off if you don\'t ship there', 'Set a base rate, plus optional weight (kg) and volume (m³) rates for bigger items'],
  },

  // ── Tax ──────────────────────────────────────────────────
  {
    title: 'Tax setup',
    description: 'Turn tax on or off, set your default rate, and decide whether prices on your site already include tax or have it added at checkout.',
    icon: icons.calc, iconBg: 'bg-amber-50',
    route: '/admin/tax-settings', target: '[data-guide="tax-config"]', prefer: 'right',
    tips: [
      'Inclusive — tax is baked into the displayed price (common in AU, UK, EU)',
      'Exclusive — tax is added on at checkout (common in the US)',
      'Rename the label to match your country (VAT, GST, Sales Tax…)',
    ],
  },
  {
    title: 'Regional tax rules',
    description: 'Only worry about this if you sell across regions with different tax rates. Otherwise the default rate is enough.',
    icon: icons.globe, iconBg: 'bg-blue-50',
    route: '/admin/tax-settings', target: '[data-guide="tax-regional"]', prefer: 'right',
    tips: ['Skip if you sell in just one country', 'The most specific rule wins: state beats country, country beats default'],
  },
  {
    title: 'Quick tax preview',
    description: 'Type in any price and see the exact tax breakdown before you save — a fast sanity check.',
    icon: icons.eye, iconBg: 'bg-amber-50',
    route: '/admin/tax-settings', target: '[data-guide="tax-preview"]', prefer: 'left',
  },

  // ── Tax Report ─────────────────────────────────────────
  {
    title: 'Tax report',
    description: 'A clean view of tax collected by region — export to CSV when your accountant needs the numbers.',
    icon: icons.doc, iconBg: 'bg-green-50',
    route: '/admin/tax-report', target: '[data-guide="tax-report"]', prefer: 'bottom',
    tips: ['Filter by date range and order status to match your reporting period'],
  },

  // ── Payments ─────────────────────────────────────────────
  {
    title: 'Payment methods',
    description: 'Pick how customers pay. Enable at least one before you open up shop.',
    icon: icons.card, iconBg: 'bg-green-50',
    route: '/admin/payment-settings', target: '[data-guide="payment-methods"]', prefer: 'right',
    tips: ['Cash on collection/delivery, Stripe, PayPal, or Square — turn on what suits you'],
  },
  {
    title: 'A note on payment security',
    description: 'Your payment keys are stored safely on the server, never in the browser. Always run a few test orders in practice mode before going live.',
    icon: icons.lock, iconBg: 'bg-red-50',
    route: '/admin/payment-settings', target: '[data-guide="payment-security"]', prefer: 'top',
    tips: ['Never share keys over email or chat', 'Your developer can set these up for you if you\'re unsure'],
  },

  // ── Finish ───────────────────────────────────────────────
  {
    title: 'You\'re all set!',
    description: 'A short checklist to run through before you flip the sign to "open":',
    icon: icons.done, iconBg: 'bg-green-50',
    route: '/admin',
    tips: [
      'Add your store name, logo, and favicon under General',
      'Pick your theme colours and fonts under Appearance',
      'Edit Home, About, Shop, Blog, Services, and Contact under Pages',
      'Add your products and organise them into categories',
      'Write a first blog post (optional, but great for SEO)',
      'Add services and service groups if you offer them',
      'Turn off any modules you don\'t need (Settings → Modules)',
      'Enable at least one payment method',
      'Set up your shipping zones and tax rates',
      'Fill in SEO titles and descriptions on each page',
      'Need to revisit? Hit "Guide" in the header to replay this tour anytime',
    ],
  },
]
