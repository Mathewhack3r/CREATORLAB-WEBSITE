(() => {
  'use strict';

  const API = '/api';
  const categories = [
    { id: 'AI Video Prompts', label: 'AI Video Prompts', short: 'Video prompts', icon: 'video' },
    { id: 'Image Generation Prompts', label: 'Image Generation Prompts', short: 'Image prompts', icon: 'image' },
    { id: 'Animation Prompts', label: 'Animation Prompts', short: 'Animation', icon: 'motion' },
    { id: 'AI Storytelling Scripts', label: 'AI Storytelling Scripts', short: 'Storytelling', icon: 'story' },
    { id: 'Character Design Prompts', label: 'Character Design Prompts', short: 'Character design', icon: 'character' },
    { id: 'Content Creation Resources', label: 'Content Creation Resources', short: 'Content creation', icon: 'spark' },
    { id: 'PDF Guides and E-books', label: 'PDF Guides and E-books', short: 'PDF guides', icon: 'book' },
    { id: 'Templates', label: 'Templates', short: 'Templates', icon: 'template' },
    { id: 'Other Digital Resources', label: 'Other Digital Resources', short: 'Other resources', icon: 'grid' }
  ];

  // Local preview examples only. They are used only when the Netlify API is not available.
  // Real products and private files are stored in Netlify Blobs through the server function.
  const previewProducts = [
    { id: 'demo-cinematic-video', title: 'Cinematic AI Video Prompt Kit', category: 'AI Video Prompts', description: 'Build polished, story-led video scenes with a reusable prompt framework and camera direction cues.', price: 4500, originalPrice: 6500, discountEnabled: true, featured: true, published: true, sales: 82, createdAt: '2026-10-30T10:00:00.000Z', art: 'blue', icon: 'video', preview: 'A short sample: Set a clear subject, a single visual action, lens character, camera movement and a consistent lighting mood. The full prompt kit is kept private until purchase.', whatIncluded: ['12 adaptable cinematic scene prompts', 'Camera and lighting prompt guide', 'Quick-start PDF'], howToUse: ['Choose a scene and subject.', 'Replace the bracketed details with your own.', 'Generate a short draft, then refine one visual element at a time.'], hasFile: true },
    { id: 'demo-image-prompt-recipes', title: 'Image Prompt Recipe Cards', category: 'Image Generation Prompts', description: 'A tidy set of visual prompt recipes for more intentional, consistent image generations.', price: 3200, originalPrice: 0, discountEnabled: false, featured: true, published: true, sales: 64, createdAt: '2026-10-26T10:00:00.000Z', art: 'violet', icon: 'image', preview: 'Sample: Subject + setting + light source + lens or composition + texture + mood. Use the recipe as a starting point, not a rigid formula.', whatIncluded: ['20 prompt structures', 'Style variation checklist', 'Editable prompt worksheet'], howToUse: ['Pick a visual goal.', 'Select one recipe card.', 'Swap the subject and style details to fit your project.'], hasFile: true },
    { id: 'demo-storytelling', title: 'Short-Form Storytelling Script Builder', category: 'AI Storytelling Scripts', description: 'Shape a clear hook, a useful middle and a satisfying close for your next short video.', price: 3900, originalPrice: 0, discountEnabled: false, featured: true, published: true, sales: 71, createdAt: '2026-10-22T10:00:00.000Z', art: 'rose', icon: 'story', preview: 'Preview: 1. Open with a surprising observation. 2. Promise one specific takeaway. 3. Show the transformation. 4. End with a natural next step.', whatIncluded: ['Script structure', 'Hook prompt variations', 'Reusable editing checklist'], howToUse: ['Describe the viewer and their goal.', 'Draft one point per beat.', 'Read the result aloud and trim anything that sounds unnatural.'], hasFile: true },
    { id: 'demo-creator-starter', title: 'The Creator Workflow Starter', category: 'Content Creation Resources', description: 'A simple planning toolkit to move from a loose idea to a finished piece of content.', price: 0, originalPrice: 0, discountEnabled: false, featured: false, published: true, sales: 103, createdAt: '2026-10-31T10:00:00.000Z', art: 'teal', icon: 'spark', preview: 'Free preview: Write your idea in one sentence. Decide who it helps. Choose one format. List the three steps it takes to make it real.', whatIncluded: ['Idea-to-publish checklist', 'Weekly planning template', 'Quick review prompts'], howToUse: ['Start with one idea, not a full calendar.', 'Choose the smallest useful format.', 'Use the checklist to finish and reflect.'], hasFile: true },
    { id: 'demo-animation-cues', title: 'Motion & Animation Prompt Cues', category: 'Animation Prompts', description: 'Add purposeful movement, timing and energy to AI animation prompts without overloading the scene.', price: 2800, originalPrice: 0, discountEnabled: false, featured: false, published: true, sales: 42, createdAt: '2026-10-18T10:00:00.000Z', art: 'amber', icon: 'motion', preview: 'Sample cue: Describe the starting pose, the primary movement, the pace, the camera behavior and the exact moment the motion settles.', whatIncluded: ['Motion cue library', 'Timing language examples', 'Continuity checklist'], howToUse: ['Keep one primary action per clip.', 'State the beginning and end clearly.', 'Test short segments before extending a sequence.'], hasFile: true },
    { id: 'demo-character-sheet', title: 'Consistent Character Design Sheet', category: 'Character Design Prompts', description: 'Build a reusable character profile to help keep visual traits aligned across scenes.', price: 0, originalPrice: 0, discountEnabled: false, featured: false, published: true, sales: 59, createdAt: '2026-10-15T10:00:00.000Z', art: 'cyan', icon: 'character', preview: 'Free preview: Note the silhouette, face shape, hair, wardrobe, signature colors and one unmistakable detail before writing a scene prompt.', whatIncluded: ['Character profile worksheet', 'Consistency notes', 'Free text prompt starter'], howToUse: ['Describe stable traits first.', 'Keep outfit details specific.', 'Reuse the same character notes in each new scene.'], hasFile: true },
    { id: 'demo-pdf-guide', title: 'A Practical Guide to Better AI Prompts', category: 'PDF Guides and E-books', description: 'A friendly, hands-on guide to giving creative AI tools clearer instructions.', price: 5200, originalPrice: 0, discountEnabled: false, featured: false, published: true, sales: 33, createdAt: '2026-10-12T10:00:00.000Z', art: 'ink', icon: 'book', preview: 'A strong prompt gives useful context, an observable goal, the details that matter and a format for the answer. This guide walks through the process with examples.', whatIncluded: ['Plain-language PDF guide', 'Prompt improvement exercises', 'Project-ready checklist'], howToUse: ['Start with a real task.', 'Add the context the tool needs.', 'Review and iterate based on the output.'], hasFile: true },
    { id: 'demo-video-planner', title: 'Video Idea-to-Upload Template', category: 'Templates', description: 'Keep your research, script, shots and publishing details together in one repeatable workflow.', price: 2400, originalPrice: 0, discountEnabled: false, featured: false, published: true, sales: 24, createdAt: '2026-10-08T10:00:00.000Z', art: 'blue', icon: 'template', preview: 'The template begins with one clear audience question, then connects the answer to a hook, a short outline and a practical call to action.', whatIncluded: ['Planning template', 'Shot list', 'Publish-ready checklist'], howToUse: ['Duplicate the template for a new video.', 'Complete the brief before writing.', 'Keep the finished plan alongside your project files.'], hasFile: true }
  ];

  const icons = {
    video: '<rect x="3" y="5" width="13" height="14" rx="2"></rect><path d="m16 10 5-3v10l-5-3"></path><path d="M7 9h5M7 12h4"></path>',
    image: '<rect x="3" y="4" width="18" height="16" rx="2"></rect><circle cx="9" cy="10" r="2"></circle><path d="m21 15-5-5L5 20"></path>',
    motion: '<path d="M5 19c6 0 13-5 13-13"></path><path d="m14 6 4-1 1 4"></path><circle cx="5" cy="19" r="2"></circle><path d="M7 7h4M7 11h2"></path>',
    story: '<path d="M5 4h11a3 3 0 0 1 3 3v13H8a3 3 0 0 1-3-3z"></path><path d="M8 8h7M8 12h7M8 16h4"></path><path d="M5 17a3 3 0 0 1 3-3"></path>',
    character: '<circle cx="12" cy="8" r="4"></circle><path d="M5 20a7 7 0 0 1 14 0M5 8l-2 2 2 2M19 8l2 2-2 2"></path>',
    spark: '<path d="m12 3 1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8z"></path><path d="m19 15 .8 2.2L22 18l-2.2.8L19 21l-.8-2.2L16 18l2.2-.8z"></path>',
    book: '<path d="M4 5.5A2.5 2.5 0 0 1 6.5 3H20v16H6.5A2.5 2.5 0 0 0 4 21z"></path><path d="M4 5.5v13A2.5 2.5 0 0 1 6.5 16H20M8 7h8M8 10h8"></path>',
    template: '<rect x="3" y="4" width="18" height="16" rx="2"></rect><path d="M8 4v16M8 9h13M12 13h5M12 16h6"></path>',
    grid: '<rect x="4" y="4" width="6" height="6" rx="1"></rect><rect x="14" y="4" width="6" height="6" rx="1"></rect><rect x="4" y="14" width="6" height="6" rx="1"></rect><rect x="14" y="14" width="6" height="6" rx="1"></rect>'
  };
  const artClasses = ['art-blue', 'art-violet', 'art-cyan', 'art-rose', 'art-amber', 'art-teal', 'art-ink'];
  const categoryArts = {
    'AI Video Prompts': ['blue', 'video'], 'Image Generation Prompts': ['violet', 'image'], 'Animation Prompts': ['amber', 'motion'],
    'AI Storytelling Scripts': ['rose', 'story'], 'Character Design Prompts': ['cyan', 'character'], 'Content Creation Resources': ['teal', 'spark'],
    'PDF Guides and E-books': ['ink', 'book'], 'Templates': ['blue', 'template'], 'Other Digital Resources': ['violet', 'grid']
  };
  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];
  const esc = value => String(value ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const iconSvg = name => `<svg viewBox="0 0 24 24" aria-hidden="true">${icons[name] || icons.spark}</svg>`;
  const dateLabel = value => {
    const date = new Date(value || Date.now());
    return Number.isNaN(date.getTime()) ? 'Recently added' : new Intl.DateTimeFormat('en-NG', { day: 'numeric', month: 'short', year: 'numeric' }).format(date);
  };
  const money = value => new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN', maximumFractionDigits: 0 }).format(Number(value || 0));
  const isFree = product => currentPrice(product) <= 0;
  const currentPrice = product => product.discountEnabled && Number(product.price) > 0 ? Number(product.price) : Number(product.price || 0);
  const categoryName = id => categories.find(category => category.id === id)?.label || id || 'Digital resource';
  const validLink = link => {
    try { const parsed = new URL(link); return ['https:', 'http:', 'mailto:'].includes(parsed.protocol) ? parsed.href : ''; } catch { return ''; }
  };
  const artClass = product => {
    if (product.art && ['blue','violet','cyan','rose','amber','teal','ink'].includes(product.art)) return `art-${product.art}`;
    const found = categoryArts[product.category];
    return found ? `art-${found[0]}` : artClasses[Math.abs(String(product.id || '').length % artClasses.length)];
  };
  const productIcon = product => product.icon || categoryArts[product.category]?.[1] || 'spark';
  const artHtml = (product, dialog = false) => `<div class="product-art ${artClass(product)}${product.imageUrl ? ' has-image' : ''}${dialog ? ' dialog-product-art' : ''}">${product.imageUrl ? `<img class="product-cover" src="${esc(product.imageUrl)}" alt="" loading="lazy">` : ''}<div class="art-card-glow"></div><div class="art-ring"></div><div class="art-articon">${iconSvg(productIcon(product))}</div><span class="art-spark a">✦</span><span class="art-spark b">✧</span></div>`;

  let products = [...previewProducts];
  let settings = {};
  let apiAvailable = false;
  let activePriceFilter = 'all';
  let activeCategory = 'all';
  let visibleCount = 6;
  let searchTerm = '';
  let sortMode = 'recent';
  let openProduct = null;
  let identityUser = null;
  let adminToken = '';
  let adminProducts = [];
  let adminOrders = [];
  let currentAdminPanel = 'overview';
  let adminEditId = null;

  async function api(action, options = {}, token = '') {
    const headers = new Headers(options.headers || {});
    if (token) headers.set('Authorization', `Bearer ${token}`);
    const response = await fetch(`${API}?action=${encodeURIComponent(action)}`, { ...options, headers, credentials: 'same-origin' });
    const contentType = response.headers.get('content-type') || '';
    const result = contentType.includes('application/json') ? await response.json() : await response.text();
    if (!response.ok) throw new Error(result?.error || result?.message || (typeof result === 'string' ? result : 'Something went wrong.'));
    return result;
  }

  function toast(message, type = '') {
    const region = $('#toast-region');
    const item = document.createElement('div');
    item.className = `toast ${type}`;
    item.textContent = message;
    region.append(item);
    setTimeout(() => item.remove(), 3800);
  }

  function priceMarkup(product) {
    const free = isFree(product);
    const price = free ? '<span class="free-price">Free</span>' : `<span>${money(currentPrice(product))}</span>${product.discountEnabled && Number(product.originalPrice) > Number(product.price) ? `<del>${money(product.originalPrice)}</del>` : ''}`;
    const label = free ? '<span class="badge badge-free">Free</span>' : '<span class="badge badge-paid">Paid</span>';
    return { price, label };
  }

  function cardMarkup(product, index = 0) {
    const pricing = priceMarkup(product);
    const featured = product.featured ? '<span class="badge badge-featured">✦ Featured</span>' : '<span></span>';
    const discount = product.discountEnabled && Number(product.originalPrice) > Number(product.price) ? '<span class="badge badge-discount">On offer</span>' : pricing.label;
    const badges = `<div class="product-labels">${featured}${discount}</div>`;
    return `<article class="product-card" style="animation-delay:${Math.min(index * 45, 300)}ms">${artHtml(product)}${badges}<div class="product-card-body"><div class="product-category">${esc(categoryName(product.category))}</div><h3>${esc(product.title)}</h3><p>${esc(product.description || 'A practical resource to support your next creative project.')}</p><div class="product-meta"><div class="price-block"><span class="price-label">${isFree(product) ? 'No cost' : 'One-time price'}</span><span class="price-value">${pricing.price}</span></div><button class="button button-outline card-view" type="button" data-view-product="${esc(product.id)}">View details <span aria-hidden="true">↗</span></button></div></div></article>`;
  }

  function publishedProducts(list = products) { return list.filter(product => product.published !== false); }
  function sortProducts(list, mode = 'recent') {
    const copy = [...list];
    if (mode === 'popular') return copy.sort((a, b) => Number(b.sales || 0) - Number(a.sales || 0));
    if (mode === 'az') return copy.sort((a, b) => String(a.title).localeCompare(String(b.title)));
    return copy.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
  }
  function renderHomeGrids() {
    const live = publishedProducts();
    const featured = live.filter(item => item.featured).slice(0, 3);
    $('#featured-grid').innerHTML = (featured.length ? featured : live.slice(0, 3)).map(cardMarkup).join('') || '<p class="muted-small">New featured resources are on the way.</p>';
    const latest = sortProducts(live, 'recent').slice(0, 3);
    const popular = sortProducts(live, 'popular').slice(0, 3);
    const freeItems = sortProducts(live.filter(isFree), 'recent').slice(0, 3);
    $('#latest-grid').innerHTML = latest.map(cardMarkup).join('') || '<p class="muted-small">New resources will appear here when published.</p>';
    $('#popular-grid').innerHTML = popular.map(cardMarkup).join('') || '<p class="muted-small">Popular picks will appear as your library grows.</p>';
    $('#free-grid').innerHTML = freeItems.map(cardMarkup).join('');
    $('#free-empty-state').hidden = freeItems.length > 0;
    renderCategoryChips();
    renderCategoryTiles();
    renderLibrary();
  }
  function renderCategoryChips() {
    const options = ['all', ...categories.map(category => category.id)];
    $('#category-chips').innerHTML = options.map(id => `<button class="category-chip ${activeCategory === id ? 'active' : ''}" type="button" data-category-filter="${esc(id)}">${id === 'all' ? 'All categories' : esc(categoryName(id))}</button>`).join('');
  }
  function renderCategoryTiles() {
    $('#category-grid').innerHTML = categories.map(category => `<button class="category-tile" type="button" data-category-tile="${esc(category.id)}"><span class="category-icon">${iconSvg(category.icon)}</span><span><strong>${esc(category.label)}</strong><small>${products.filter(p => p.published !== false && p.category === category.id).length} resources</small></span><span class="category-arrow" aria-hidden="true">→</span></button>`).join('');
  }
  function renderLibrary() {
    let result = publishedProducts();
    if (searchTerm) result = result.filter(p => `${p.title} ${p.description} ${p.category}`.toLowerCase().includes(searchTerm));
    if (activePriceFilter === 'free') result = result.filter(isFree);
    if (activePriceFilter === 'paid') result = result.filter(p => !isFree(p));
    if (activeCategory !== 'all') result = result.filter(p => p.category === activeCategory);
    result = sortProducts(result, sortMode);
    $('#results-heading').textContent = activePriceFilter === 'free' ? 'Free resources' : activePriceFilter === 'paid' ? 'Paid resources' : activeCategory !== 'all' ? categoryName(activeCategory) : searchTerm ? 'Search results' : sortMode === 'popular' ? 'Popular resources' : 'All resources';
    $('#resource-grid').innerHTML = result.slice(0, visibleCount).map(cardMarkup).join('');
    $('#empty-state').hidden = result.length !== 0;
    $('#show-more').hidden = result.length <= visibleCount;
  }

  function openDialog(dialog) { if (!dialog.open) dialog.showModal(); document.body.classList.add('modal-open'); }
  function closeDialog(dialog) { if (dialog.open) dialog.close(); if (!$('dialog[open]')) document.body.classList.remove('modal-open'); }
  function closeButton() { return '<button class="dialog-close" type="button" data-close-dialog aria-label="Close">×</button>'; }
  function lines(items, ordered = false) {
    const values = (Array.isArray(items) ? items : []).filter(Boolean);
    if (!values.length) return '<p class="muted-small">Details will be added soon.</p>';
    const tag = ordered ? 'ol' : 'ul';
    return `<${tag}>${values.map(item => `<li>${esc(item)}</li>`).join('')}</${tag}>`;
  }
  function showProduct(id) {
    const product = publishedProducts().find(item => item.id === id);
    if (!product) return;
    openProduct = product;
    const tutorial = validLink(product.tutorialUrl);
    const free = isFree(product);
    const pricing = free ? 'Free' : money(currentPrice(product));
    const oldPrice = product.discountEnabled && Number(product.originalPrice) > Number(product.price) ? `<del>${money(product.originalPrice)}</del>` : '';
    const preview = product.preview ? `<div class="preview-box"><strong>${free ? 'Resource preview' : 'A taste of what’s inside'}</strong><p>${esc(product.preview)}</p></div>` : '';
    const access = free ? `<button class="button button-primary" type="button" data-download="${esc(product.id)}">Get this free resource <span aria-hidden="true">↓</span></button>` : `<button class="button button-primary" type="button" data-buy="${esc(product.id)}">Buy now <span aria-hidden="true">→</span></button>`;
    $('#product-dialog-content').innerHTML = `${closeButton()}${artHtml(product, true)}<div class="dialog-head"><span class="section-kicker">${esc(categoryName(product.category))}</span><h2 id="product-dialog-title">${esc(product.title)}</h2><p class="dialog-description">${esc(product.description || '')}</p></div><div class="dialog-product-meta"><span class="dialog-product-price">${pricing}${oldPrice}</span><span class="badge ${free ? 'badge-free' : 'badge-paid'}">${free ? 'Free resource' : 'Instant digital access'}</span></div><div class="dialog-sections"><div><h3>What’s included</h3>${lines(product.whatIncluded)}</div><div><h3>How to use it</h3>${lines(product.howToUse, true)}</div></div>${preview}<div class="dialog-actions">${access}${tutorial ? `<a class="tutorial-link" href="${esc(tutorial)}" target="_blank" rel="noopener noreferrer">Watch related tutorial ↗</a>` : ''}</div>`;
    openDialog($('#product-dialog'));
  }

  function showCheckout(product) {
    const p = product || openProduct;
    if (!p || isFree(p)) return;
    closeDialog($('#product-dialog'));
    $('#checkout-content').innerHTML = `${closeButton()}<div class="checkout-icon">✦</div><span class="section-kicker">SECURE CHECKOUT</span><h2 id="checkout-title">${esc(p.title)}</h2><p>Enter your details to continue to secure Paystack checkout. Your download stays private until payment is verified.</p><div class="order-summary"><span>One-time payment</span><strong>${money(currentPrice(p))} NGN</strong></div><form class="checkout-form" id="checkout-form"><label>Your name<input name="name" type="text" autocomplete="name" maxlength="100" placeholder="Your full name" required></label><label>Email for your order<input name="email" type="email" autocomplete="email" maxlength="254" placeholder="you@example.com" required></label><p class="checkout-note">Payments are processed by Paystack. We never ask for your card details on this site.</p><button class="button button-primary" type="submit">Continue to Paystack <span aria-hidden="true">→</span></button><span class="form-status" id="checkout-status" role="status"></span></form>`;
    $('#checkout-form').addEventListener('submit', async event => {
      event.preventDefault();
      const form = event.currentTarget;
      const button = $('button[type="submit"]', form);
      const status = $('#checkout-status', form);
      const data = new FormData(form);
      const name = String(data.get('name') || '').trim();
      const email = String(data.get('email') || '').trim().toLowerCase();
      if (!name || !email) return;
      button.disabled = true; button.textContent = 'Preparing secure checkout…'; status.textContent = '';
      try {
        const result = await api('start', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ productId: p.id, name, email }) });
        if (!result.authorizationUrl) throw new Error('Paystack did not return a checkout link. Please try again.');
        sessionStorage.setItem('creatorlab_email', email);
        window.location.assign(result.authorizationUrl);
      } catch (error) {
        status.textContent = error.message;
        status.className = 'form-status error';
        button.disabled = false; button.innerHTML = 'Continue to Paystack <span aria-hidden="true">→</span>';
      }
    });
    openDialog($('#checkout-dialog'));
  }

  function showPaymentResult(reference) {
    if (!reference) return;
    const savedEmail = sessionStorage.getItem('creatorlab_email') || '';
    $('#success-content').innerHTML = `${closeButton()}<div class="success-icon">✓</div><span class="section-kicker">ORDER CHECK</span><h2 id="success-title">Confirm your purchase</h2><p>Paystack has returned you to CreatorLab AI. Confirm the email used at checkout so we can verify the payment and unlock your resource.</p><div class="success-details"><div><span>Payment reference</span><strong>${esc(reference)}</strong></div><div><span>Status</span><strong>Checking securely</strong></div></div><form class="verify-form" id="verify-form"><label>Email used for checkout<input name="email" type="email" autocomplete="email" required maxlength="254" value="${esc(savedEmail)}" placeholder="you@example.com"></label><button class="button button-primary" type="submit">Verify payment &amp; get access <span aria-hidden="true">→</span></button><span class="form-status" id="verify-status" role="status"></span></form><p class="checkout-note">We verify the reference, amount, currency and customer email directly with Paystack. This may take a moment.</p>`;
    openDialog($('#success-dialog'));
    $('#verify-form').addEventListener('submit', async event => {
      event.preventDefault();
      const form = event.currentTarget;
      const button = $('button[type="submit"]', form);
      const status = $('#verify-status', form);
      const email = String(new FormData(form).get('email') || '').trim().toLowerCase();
      button.disabled = true; button.textContent = 'Verifying with Paystack…'; status.textContent = '';
      try {
        const result = await api('verify', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ reference, email }) });
        sessionStorage.removeItem('creatorlab_email');
        const tutorial = validLink(result.tutorialUrl);
        const support = settings.supportEmail ? `<a class="tutorial-link" href="mailto:${esc(settings.supportEmail)}">Need help? Contact support ↗</a>` : '<span class="tutorial-link">Keep this page open while you download your resource.</span>';
        const accessParts = [];
        if (result.downloadAvailable) accessParts.push(`<a class="button button-primary" href="${API}?action=download&amp;productId=${encodeURIComponent(result.product.id)}">Download your resource <span aria-hidden="true">↓</span></a>`);
        if (result.telegramUrl) accessParts.push(`<a class="button button-outline" href="${esc(validLink(result.telegramUrl))}" target="_blank" rel="noopener noreferrer">Open your Telegram delivery link ↗</a>`);
        if (!accessParts.length) accessParts.push('<p>Payment confirmed. Please contact support so we can help with your delivery.</p>');
        $('#success-content').innerHTML = `${closeButton()}<div class="success-icon">✓</div><span class="success-badge">✓ Payment verified</span><h2 id="success-title">You’re all set.</h2><p>Your payment is confirmed. Your resource is ready whenever you are.</p><div class="success-details"><div><span>Resource</span><strong>${esc(result.product.title)}</strong></div><div><span>Paid</span><strong>${money(result.amountNaira)} NGN</strong></div><div><span>Confirmation sent to</span><strong>${esc(result.email)}</strong></div></div><div class="success-access"><h3>Your access</h3><p>Your paid file is available only after server-side payment confirmation.</p>${accessParts.join('')}</div><div class="dialog-actions">${tutorial ? `<a class="tutorial-link" href="${esc(tutorial)}" target="_blank" rel="noopener noreferrer">Watch the related tutorial ↗</a>` : ''}${support}</div>`;
        history.replaceState({}, '', location.pathname + location.hash);
        renderHomeGrids();
      } catch (error) {
        status.textContent = error.message || 'We could not confirm the payment yet. Please check the email and try again.';
        status.className = 'form-status error';
        button.disabled = false; button.innerHTML = 'Verify payment &amp; get access <span aria-hidden="true">→</span>';
      }
    });
  }

  async function downloadFree(id, trigger) {
    const product = publishedProducts().find(item => item.id === id);
    if (!product) return;
    if (product.demo) { toast('Downloads become available after you connect the Netlify site.', ''); return; }
    if (trigger) { trigger.disabled = true; trigger.textContent = 'Preparing download…'; }
    try {
      const result = await api('free-access', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ productId: id }) });
      if (result.telegramUrl) window.open(validLink(result.telegramUrl), '_blank', 'noopener,noreferrer');
      if (result.downloadAvailable) window.location.assign(`${API}?action=download&productId=${encodeURIComponent(id)}`);
      if (!result.telegramUrl && !result.downloadAvailable) toast('This resource is being prepared. Please check back soon.');
      closeDialog($('#product-dialog'));
    } catch (error) { toast(error.message, 'error'); }
    finally { if (trigger) { trigger.disabled = false; trigger.innerHTML = 'Get this free resource <span aria-hidden="true">↓</span>'; } }
  }

  function settingsMarkup() {
    const actions = [];
    if (validLink(settings.telegramCommunity)) actions.push(`<a class="button button-light" href="${esc(validLink(settings.telegramCommunity))}" target="_blank" rel="noopener noreferrer">Join Telegram community ↗</a>`);
    if (validLink(settings.telegramChannel)) actions.push(`<a class="button button-ghost" href="${esc(validLink(settings.telegramChannel))}" target="_blank" rel="noopener noreferrer">Visit Telegram channel ↗</a>`);
    if (validLink(settings.whatsapp)) actions.push(`<a class="button button-ghost" href="${esc(validLink(settings.whatsapp))}" target="_blank" rel="noopener noreferrer">WhatsApp us ↗</a>`);
    if (!actions.length) actions.push('<span class="community-small">Community links are being set up. Check back soon.</span>');
    $('#community-actions').innerHTML = actions.join('');
    const social = [];
    if (validLink(settings.instagram)) social.push(`<a class="button button-outline" href="${esc(validLink(settings.instagram))}" target="_blank" rel="noopener noreferrer">Instagram ↗</a>`);
    if (validLink(settings.youtube)) social.push(`<a class="button button-outline" href="${esc(validLink(settings.youtube))}" target="_blank" rel="noopener noreferrer">YouTube ↗</a>`);
    if (settings.supportEmail && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(settings.supportEmail)) social.push(`<a class="button button-primary" href="mailto:${esc(settings.supportEmail)}">Email CreatorLab <span aria-hidden="true">↗</span></a>`);
    $('#contact-action').innerHTML = social.length ? `<div class="contact-links">${social.join('')}</div>` : '<span class="muted-small">Contact details will appear here once configured.</span>';
  }

  async function loadStoreData() {
    try {
      const result = await api('products');
      if (Array.isArray(result.products)) { products = result.products; apiAvailable = true; }
      if (result.settings) settings = result.settings;
    } catch { apiAvailable = false; }
    try { const result = await api('settings-public'); settings = result.settings || settings; } catch { /* local preview */ }
    renderHomeGrids(); settingsMarkup();
  }

  function showStorefront() {
    $('#storefront-view').hidden = false;
    $('#admin-view').hidden = true;
    $('#footer').hidden = false;
    document.title = 'CreatorLab AI — Learn. Create. Grow.';
  }
  function showAdmin() {
    $('#storefront-view').hidden = true;
    $('#admin-view').hidden = false;
    $('#footer').hidden = true;
    document.title = 'Admin — CreatorLab AI';
    loadIdentity();
  }
  function loadIdentity() {
    if (window.netlifyIdentity) { initIdentity(); return; }
    if ($('#identity-widget-loader')) return;
    const script = document.createElement('script');
    script.id = 'identity-widget-loader';
    script.src = 'https://identity.netlify.com/v1/netlify-identity-widget.js';
    script.async = true;
    script.onload = initIdentity;
    script.onerror = () => { $('#admin-login-hint').textContent = 'Could not load the Netlify Identity sign-in widget. Deploy to Netlify and confirm Identity is enabled.'; };
    document.head.append(script);
  }
  function userAccessToken(user) {
    if (!user) return '';
    if (typeof user.jwt === 'function') return user.jwt();
    if (user.token && typeof user.token === 'object') return user.token.access_token || user.token.accessToken || '';
    return typeof user.token === 'string' ? user.token : '';
  }
  function initIdentity() {
    if (!window.netlifyIdentity) return;
    try { window.netlifyIdentity.init(); } catch { /* widget may already be initialized */ }
    const current = window.netlifyIdentity.currentUser();
    if (current) onIdentityUser(current);
    window.netlifyIdentity.on('init', user => { if (user) onIdentityUser(user); });
    window.netlifyIdentity.on('login', user => { onIdentityUser(user); window.netlifyIdentity.close(); });
    window.netlifyIdentity.on('logout', () => { identityUser = null; adminToken = ''; showAdminLogin(); });
    $('#admin-login').onclick = () => window.netlifyIdentity.open('login');
  }
  async function onIdentityUser(user) {
    identityUser = user;
    try {
      adminToken = await userAccessToken(user);
      if (!adminToken) throw new Error('No active login token. Please sign in again.');
      const payload = await api('admin-data', {}, adminToken);
      $('#admin-login-card').hidden = true;
      $('#admin-content').hidden = false;
      $('#admin-user-area').innerHTML = `<button class="mini-action" id="admin-logout">${esc(user.email || 'Admin')} · Sign out</button>`;
      $('#admin-logout').onclick = () => window.netlifyIdentity.logout();
      adminProducts = payload.products || [];
      adminOrders = payload.orders || [];
      renderAdmin(payload);
    } catch (error) {
      showAdminLogin();
      $('#admin-login-hint').textContent = error.message.includes('403') || error.message.toLowerCase().includes('admin') ? 'This account does not have the admin role yet. Add “admin” to its Netlify Identity roles, then sign in again.' : error.message;
      toast(error.message, 'error');
    }
  }
  function showAdminLogin() {
    $('#admin-login-card').hidden = false;
    $('#admin-content').hidden = true;
    $('#admin-user-area').innerHTML = '';
  }
  function renderAdmin(data = {}) {
    const paid = adminProducts.filter(p => Number(p.price) > 0).length;
    const free = adminProducts.length - paid;
    const paidOrders = adminOrders.filter(o => o.status === 'paid');
    const revenue = paidOrders.reduce((sum, order) => sum + Number(order.amountNaira || 0), 0);
    const stats = [
      ['Total resources', adminProducts.length], ['Paid resources', paid], ['Free resources', free], ['Verified orders', paidOrders.length]
    ];
    $('#admin-stats').innerHTML = stats.map(([label, value]) => `<div class="stat-card"><small>${esc(label)}</small><strong>${esc(value)}</strong></div>`).join('');
    $('#admin-product-count').textContent = `${adminProducts.length} resource${adminProducts.length === 1 ? '' : 's'}`;
    renderAdminProductList();
    renderOrderTables();
    const settingsForm = $('#settings-form');
    if (settingsForm && data.settings) for (const [key, value] of Object.entries(data.settings)) { const input = settingsForm.elements.namedItem(key); if (input) input.value = value || ''; }
    const revenueMetric = $('#admin-revenue');
    if (revenueMetric) revenueMetric.textContent = money(revenue);
  }
  function renderAdminProductList() {
    const term = ($('#admin-product-search')?.value || '').trim().toLowerCase();
    const list = adminProducts.filter(item => `${item.title} ${item.category}`.toLowerCase().includes(term));
    $('#admin-product-count').textContent = `${list.length} resource${list.length === 1 ? '' : 's'}`;
    $('#admin-product-list').innerHTML = list.length ? list.map(p => `<article class="admin-product-row"><div class="admin-product-thumb">${p.imageUrl ? `<img src="${esc(p.imageUrl)}" alt="" loading="lazy">` : '✦'}</div><div class="admin-product-info"><strong>${esc(p.title)}</strong><small>${esc(categoryName(p.category))} · ${isFree(p) ? 'Free' : money(currentPrice(p))}</small></div><div class="admin-product-status"><span class="${p.published ? '' : 'unpublished'}">${p.published ? 'Published' : 'Unpublished'}</span><small>${p.featured ? '✦ Featured' : p.hasFile ? 'File ready' : 'No file'}</small></div><div class="admin-product-actions"><button type="button" class="mini-action" data-edit-product="${esc(p.id)}">Edit</button><button type="button" class="mini-action delete" data-delete-product="${esc(p.id)}">Delete</button></div></article>`).join('') : '<p class="muted-small">No resources yet. Add your first resource to populate the library.</p>';
  }
  function renderOrderTables() {
    const recent = adminOrders.slice(0, 6);
    const rows = list => list.map(order => `<tr><td><strong>${esc(order.name || 'Customer')}</strong><small>${esc(order.email || '')}</small></td><td>${esc(order.productTitle || 'Resource')}</td><td>${esc(dateLabel(order.createdAt))}</td><td>${money(order.amountNaira || 0)}</td><td><span class="order-status ${order.status === 'paid' ? 'paid' : order.status === 'failed' ? 'failed' : ''}">${esc(order.status || 'pending')}</span></td></tr>`).join('');
    $('#recent-orders-body').innerHTML = rows(recent) || '<tr><td colspan="5">No orders yet.</td></tr>';
    $('#orders-body').innerHTML = adminOrders.map(order => `<tr><td><strong>${esc(order.name || 'Customer')}</strong><small>${esc(order.email || '')}</small></td><td>${esc(order.productTitle || 'Resource')}</td><td><small>${esc(order.reference || '')}</small></td><td>${esc(dateLabel(order.createdAt))}</td><td>${money(order.amountNaira || 0)}</td><td><span class="order-status ${order.status === 'paid' ? 'paid' : order.status === 'failed' ? 'failed' : ''}">${esc(order.status || 'pending')}</span></td></tr>`).join('') || '<tr><td colspan="6">No orders yet.</td></tr>';
  }
  function switchAdminTab(name) {
    currentAdminPanel = name;
    $$('.admin-tab').forEach(button => button.classList.toggle('active', button.dataset.adminTab === name));
    $$('.admin-panel').forEach(panel => panel.classList.toggle('active', panel.dataset.adminPanel === name));
    if (name === 'products') $('#admin-form-wrap')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  function editorMarkup(product = null) {
    const p = product || {};
    const categoryOptions = categories.map(c => `<option value="${esc(c.id)}" ${p.category === c.id ? 'selected' : ''}>${esc(c.label)}</option>`).join('');
    const formWrap = document.createElement('div');
    formWrap.id = 'admin-form-wrap';
    formWrap.innerHTML = `<form class="admin-form" id="product-form" enctype="multipart/form-data"><div class="admin-form-top"><div><h3>${p.id ? 'Edit resource' : 'Add a new resource'}</h3><p>Product details are public when published. Paid files and Telegram delivery links remain private.</p></div><button class="mini-action" type="button" id="cancel-product-form">Close</button></div><input type="hidden" name="id" value="${esc(p.id || '')}"><div class="form-grid"><label>Resource title<input name="title" required maxlength="120" value="${esc(p.title || '')}" placeholder="e.g. Cinematic AI video prompts"></label><label>Category<select name="category" required><option value="">Choose a category</option>${categoryOptions}</select></label><label class="full">Short description<textarea name="description" required maxlength="360" placeholder="What will this resource help someone create?">${esc(p.description || '')}</textarea></label><label class="full">Preview for visitors<textarea name="preview" maxlength="900" placeholder="Share a short sample or a safe overview. Never paste the full paid resource here.">${esc(p.preview || '')}</textarea></label><label>Price in Naira<input name="price" type="number" min="0" step="1" value="${esc(p.price ?? 0)}" placeholder="0"></label><label>Original price (optional)<input name="originalPrice" type="number" min="0" step="1" value="${esc(p.originalPrice || 0)}" placeholder="e.g. 6000"></label><div class="checkbox-row full"><label><input name="isFree" type="checkbox" ${Number(p.price || 0) === 0 ? 'checked' : ''}> Free resource</label><label><input name="discountEnabled" type="checkbox" ${p.discountEnabled ? 'checked' : ''}> Enable discount</label><label><input name="featured" type="checkbox" ${p.featured ? 'checked' : ''}> Feature on homepage</label><label><input name="published" type="checkbox" ${p.published !== false ? 'checked' : ''}> Publish resource</label></div><label>What’s included <span class="hint">One item per line</span><textarea name="whatIncluded" placeholder="Prompt collection\nQuick-start guide">${esc((p.whatIncluded || []).join('\n'))}</textarea></label><label>How to use it <span class="hint">One step per line</span><textarea name="howToUse" placeholder="Choose a prompt\nReplace the details">${esc((p.howToUse || []).join('\n'))}</textarea></label><label>Related tutorial URL<input name="tutorialUrl" type="url" value="${esc(p.tutorialUrl || '')}" placeholder="https://t.me/... or video link"></label><label>Private Telegram delivery URL<input name="deliveryLink" type="url" value="${esc(p.deliveryLink || '')}" placeholder="https://t.me/..."><span class="hint">Only shown after purchase or free-resource request.</span></label><label>Product cover image<input name="image" type="file" accept="image/jpeg,image/png,image/webp"><span class="hint">JPG, PNG or WebP; up to 1.5 MB. Leave empty to keep current.</span></label><label>Download file<input name="file" type="file" accept="application/pdf,text/plain,application/zip"><span class="hint">PDF, TXT or ZIP; up to 4 MB. Leave empty to keep current.${p.fileName ? ` Current file: ${esc(p.fileName)}` : ''}</span></label></div><div class="form-actions"><button class="button button-primary" type="submit">${p.id ? 'Save changes' : 'Add resource'}</button><span class="form-status" id="product-form-status" role="status"></span></div></form>`;
    return formWrap;
  }
  function openProductEditor(id = null) {
    adminEditId = id;
    const product = id ? adminProducts.find(item => item.id === id) : null;
    const old = $('#admin-form-wrap');
    old?.remove();
    const wrapper = editorMarkup(product);
    $('#panel-products').prepend(wrapper);
    wrapper.scrollIntoView({ behavior: 'smooth', block: 'start' });
    $('#cancel-product-form').onclick = () => wrapper.remove();
    $('#product-form').addEventListener('submit', async event => {
      event.preventDefault();
      const form = event.currentTarget;
      const status = $('#product-form-status');
      const button = $('button[type="submit"]', form);
      const formData = new FormData(form);
      if (formData.get('isFree') === 'on') formData.set('price', '0');
      for (const key of ['isFree', 'discountEnabled', 'featured', 'published']) formData.set(key, formData.get(key) === 'on' ? 'true' : 'false');
      button.disabled = true; button.textContent = 'Saving resource…'; status.textContent = '';
      try {
        const saved = await api('save-product', { method: 'POST', body: formData }, adminToken);
        adminProducts = saved.products || adminProducts;
        renderAdmin({ products: adminProducts, orders: adminOrders });
        wrapper.remove();
        toast('Resource saved.', 'success');
        loadStoreData();
      } catch (error) { status.textContent = error.message; status.className = 'form-status error'; button.disabled = false; button.textContent = id ? 'Save changes' : 'Add resource'; }
    });
  }

  async function saveSettings(event) {
    event.preventDefault();
    const form = event.currentTarget;
    const status = $('#settings-status');
    const button = $('button[type="submit"]', form);
    const settingsData = Object.fromEntries(new FormData(form).entries());
    button.disabled = true; status.textContent = 'Saving…'; status.className = 'form-status';
    try {
      const result = await api('settings-save', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(settingsData) }, adminToken);
      settings = result.settings || settingsData;
      settingsMarkup();
      status.textContent = 'Store settings saved.';
      toast('Store settings updated.', 'success');
    } catch (error) { status.textContent = error.message; status.className = 'form-status error'; }
    finally { button.disabled = false; }
  }

  function installEvents() {
    document.addEventListener('click', event => {
      const view = event.target.closest('[data-view-product]');
      if (view) return showProduct(view.dataset.viewProduct);
      const buy = event.target.closest('[data-buy]');
      if (buy) return showCheckout(products.find(p => p.id === buy.dataset.buy));
      const free = event.target.closest('[data-download]');
      if (free) return downloadFree(free.dataset.download, free);
      const close = event.target.closest('[data-close-dialog]');
      if (close) { const dialog = close.closest('dialog'); return closeDialog(dialog); }
      const priceFilter = event.target.closest('[data-price-filter]');
      if (priceFilter) {
        activePriceFilter = priceFilter.dataset.priceFilter;
        $$('.filter-pill').forEach(btn => btn.classList.toggle('active', btn === priceFilter));
        visibleCount = 6; renderLibrary();
      }
      const categoryFilter = event.target.closest('[data-category-filter], [data-category-tile]');
      if (categoryFilter) {
        activeCategory = categoryFilter.dataset.categoryFilter || categoryFilter.dataset.categoryTile;
        renderCategoryChips(); renderLibrary();
        $('#resources').scrollIntoView({ behavior: 'smooth' });
      }
      const tab = event.target.closest('[data-admin-tab]');
      if (tab) switchAdminTab(tab.dataset.adminTab);
      const jump = event.target.closest('[data-jump-tab]');
      if (jump) switchAdminTab(jump.dataset.jumpTab);
      const edit = event.target.closest('[data-edit-product]');
      if (edit) { switchAdminTab('products'); openProductEditor(edit.dataset.editProduct); }
      const remove = event.target.closest('[data-delete-product]');
      if (remove) deleteProduct(remove.dataset.deleteProduct);
    });
    $$('dialog').forEach(dialog => {
      dialog.addEventListener('click', event => { if (event.target === dialog) closeDialog(dialog); });
      dialog.addEventListener('close', () => { if (!$('dialog[open]')) document.body.classList.remove('modal-open'); });
    });
    $('#resource-search').addEventListener('input', event => { searchTerm = event.target.value.trim().toLowerCase(); visibleCount = 6; renderLibrary(); });
    $('#sort-select').addEventListener('change', event => { sortMode = event.target.value; renderLibrary(); });
    $('#show-more').addEventListener('click', () => { visibleCount += 6; renderLibrary(); });
    $('#clear-filters').addEventListener('click', () => { searchTerm = ''; activeCategory = 'all'; activePriceFilter = 'all'; $('#resource-search').value = ''; $$('.filter-pill').forEach(btn => btn.classList.toggle('active', btn.dataset.priceFilter === 'all')); renderCategoryChips(); renderLibrary(); });
    $('#search-shortcut').addEventListener('click', () => { $('#resource-search').focus(); $('#resources').scrollIntoView({ behavior: 'smooth' }); });
    $('#resource-search').addEventListener('keydown', event => { if (event.key === 'Escape') { event.currentTarget.value = ''; searchTerm = ''; renderLibrary(); } });
    document.addEventListener('keydown', event => { if (event.key === '/' && !['INPUT','TEXTAREA'].includes(document.activeElement.tagName)) { event.preventDefault(); $('#resource-search').focus(); } });
    $('#menu-toggle').addEventListener('click', event => { const button = event.currentTarget; const isOpen = $('#main-nav').classList.toggle('open'); button.setAttribute('aria-expanded', String(isOpen)); button.setAttribute('aria-label', isOpen ? 'Close navigation' : 'Open navigation'); });
    $$('#main-nav a').forEach(link => link.addEventListener('click', () => { $('#main-nav').classList.remove('open'); $('#menu-toggle').setAttribute('aria-expanded', 'false'); }));
    $('#admin-product-search').addEventListener('input', renderAdminProductList);
    $('#new-product-button').addEventListener('click', () => openProductEditor());
    $('#settings-form').addEventListener('submit', saveSettings);
    $$('[data-free-link]').forEach(link => link.addEventListener('click', () => {
      activePriceFilter = 'free'; activeCategory = 'all'; searchTerm = ''; visibleCount = 6;
      $('#resource-search').value = '';
      $$('.filter-pill').forEach(btn => btn.classList.toggle('active', btn.dataset.priceFilter === 'free'));
      renderCategoryChips(); renderLibrary();
    }));
    $$('[data-popular-link]').forEach(link => link.addEventListener('click', () => {
      activePriceFilter = 'all'; activeCategory = 'all'; searchTerm = ''; sortMode = 'popular'; visibleCount = 6;
      $('#resource-search').value = ''; $('#sort-select').value = 'popular';
      $$('.filter-pill').forEach(btn => btn.classList.toggle('active', btn.dataset.priceFilter === 'all'));
      renderCategoryChips(); renderLibrary();
    }));
    $('#admin-link').addEventListener('click', event => { event.preventDefault(); history.pushState({}, '', '?admin'); showAdmin(); window.scrollTo(0,0); });
    $('#back-to-store').addEventListener('click', event => { event.preventDefault(); history.pushState({}, '', location.pathname); showStorefront(); window.scrollTo(0,0); });
    window.addEventListener('popstate', route);
  }

  async function deleteProduct(id) {
    const product = adminProducts.find(p => p.id === id);
    if (!product) return;
    if (!window.confirm(`Delete “${product.title}” and its stored image/file? Past buyers may lose future download access. Unpublish instead if you want to keep the files.`)) return;
    try {
      const result = await api('delete-product', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id }) }, adminToken);
      adminProducts = result.products || adminProducts.filter(p => p.id !== id);
      renderAdmin({ products: adminProducts, orders: adminOrders });
      toast('Resource deleted.', 'success');
      loadStoreData();
    } catch (error) { toast(error.message, 'error'); }
  }

  function route() {
    if (new URLSearchParams(location.search).has('admin')) showAdmin();
    else showStorefront();
  }
  function init() {
    $('#copyright-year').textContent = new Date().getFullYear();
    installEvents();
    loadStoreData();
    route();
    const params = new URLSearchParams(location.search);
    const reference = params.get('reference') || params.get('trxref');
    if (reference && /^[a-zA-Z0-9.=-]{8,100}$/.test(reference)) setTimeout(() => showPaymentResult(reference), 250);
  }
  init();
})();
