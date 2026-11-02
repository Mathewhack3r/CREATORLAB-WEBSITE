import { randomBytes, createHmac, timingSafeEqual } from 'node:crypto';
import { getStore } from '@netlify/blobs';
import { getUser } from '@netlify/identity';

const stores = {
  products: 'creatorlab-products-v1',
  orders: 'creatorlab-orders-v1',
  files: 'creatorlab-files-v1',
  sessions: 'creatorlab-sessions-v1',
  settings: 'creatorlab-settings-v1'
};
const productsStore = () => getStore(stores.products);
const ordersStore = () => getStore(stores.orders);
const filesStore = () => getStore(stores.files);
const sessionsStore = () => getStore(stores.sessions);
const settingsStore = () => getStore(stores.settings);
const SETTINGS_KEY = 'store-settings';
const MAX_IMAGE_BYTES = 1.5 * 1024 * 1024;
const MAX_FILE_BYTES = 4 * 1024 * 1024;
const MAX_REQUEST_BYTES = 5.7 * 1024 * 1024;
const DEFAULT_SETTINGS = {
  telegramCommunity: '', telegramChannel: '', whatsapp: '', instagram: '', youtube: '', supportEmail: ''
};

class HttpError extends Error {
  constructor(status, message) { super(message); this.status = status; }
}
const json = (data, status = 200, headers = {}) => Response.json(data, {
  status,
  headers: { 'Cache-Control': 'no-store', 'X-Content-Type-Options': 'nosniff', ...headers }
});
const fail = (status, message) => { throw new HttpError(status, message); };
const parseJson = async request => {
  try { return await request.json(); } catch { fail(400, 'Please send valid JSON.'); }
};
const safeEmail = value => typeof value === 'string' && value.length <= 254 && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());
const cleanText = (value, max = 500) => String(value ?? '').replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, '').trim().slice(0, max);
const bool = value => value === true || value === 'true' || value === 'on' || value === '1';
const safeUrl = value => {
  if (!value) return '';
  try { const u = new URL(String(value)); return ['https:', 'http:'].includes(u.protocol) ? u.href.slice(0, 700) : ''; } catch { return ''; }
};
const publishedPrice = product => Number(product.price || 0);
const orderKey = reference => `order-${reference}`;
const productKey = id => `product-${id}`;
const imageKey = id => `image-${id}`;
const fileKey = id => `file-${id}`;

async function loadProduct(id) {
  if (!/^[a-zA-Z0-9-]{8,80}$/.test(String(id || ''))) return null;
  const item = await productsStore().get(productKey(id), { type: 'json' });
  return item || null;
}
async function listAllProducts() {
  const listing = await productsStore().list({ prefix: 'product-' });
  const values = await Promise.all((listing.blobs || []).map(async item => {
    const stored = await productsStore().get(item.key, { type: 'json' });
    return stored || null;
  }));
  return values.filter(Boolean).sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
}
async function listAllOrders() {
  const listing = await ordersStore().list({ prefix: 'order-' });
  const values = await Promise.all((listing.blobs || []).map(async item => {
    const stored = await ordersStore().get(item.key, { type: 'json' });
    return stored || null;
  }));
  return values.filter(Boolean).sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
}
function publicProduct(product) {
  return {
    id: product.id, title: product.title, category: product.category, description: product.description,
    price: product.price, originalPrice: product.originalPrice || 0, discountEnabled: !!product.discountEnabled,
    featured: !!product.featured, published: !!product.published, preview: product.preview || '',
    whatIncluded: product.whatIncluded || [], howToUse: product.howToUse || [], tutorialUrl: product.tutorialUrl || '',
    createdAt: product.createdAt, updatedAt: product.updatedAt, sales: Number(product.sales || 0),
    hasFile: !!product.fileKey, imageUrl: product.imageKey ? `/api?action=image&productId=${encodeURIComponent(product.id)}` : ''
  };
}
function adminProduct(product) {
  return {
    ...publicProduct(product), deliveryLink: product.deliveryLink || '', fileName: product.fileName || '',
    fileMime: product.fileMime || '', imageKey: product.imageKey || '', fileKey: product.fileKey || ''
  };
}
async function currentAdmin() {
  const user = await getUser();
  if (!user) fail(401, 'Sign in with your CreatorLab admin account.');
  if (!Array.isArray(user.roles) || !user.roles.includes('admin')) fail(403, 'This account needs the admin role.');
  return user;
}
function checkSameOrigin(request) {
  const origin = request.headers.get('origin');
  if (!origin) fail(403, 'A same-site request is required.');
  let requestOrigin;
  try { requestOrigin = new URL(request.url).origin; } catch { fail(403, 'Could not verify request origin.'); }
  if (origin !== requestOrigin) fail(403, 'Cross-site requests are not allowed.');
}
function cookies(request) {
  return Object.fromEntries((request.headers.get('cookie') || '').split(';').map(part => {
    const split = part.trim().indexOf('=');
    return split < 0 ? ['', ''] : [part.slice(0, split).trim(), decodeURIComponent(part.slice(split + 1).trim())];
  }).filter(([key]) => key));
}
function sessionCookie(token, request) {
  const secure = new URL(request.url).protocol === 'https:' ? '; Secure' : '';
  return `cl_access=${token}; HttpOnly${secure}; SameSite=Strict; Path=/; Max-Age=172800`;
}
async function readSettings() {
  return await settingsStore().get(SETTINGS_KEY, { type: 'json' }) || { ...DEFAULT_SETTINGS };
}
async function writeSettings(settings) {
  await settingsStore().set(SETTINGS_KEY, JSON.stringify(settings));
}
function validateArray(text, maxItems = 16, maxLength = 200) {
  return String(text || '').split(/\r?\n/).map(v => cleanText(v, maxLength)).filter(Boolean).slice(0, maxItems);
}
function checkImage(bytes, mime) {
  if (mime === 'image/jpeg') return bytes.length > 3 && bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff;
  if (mime === 'image/png') return bytes.subarray(0, 8).equals(Buffer.from([137,80,78,71,13,10,26,10]));
  if (mime === 'image/webp') return bytes.length > 12 && bytes.toString('ascii', 0, 4) === 'RIFF' && bytes.toString('ascii', 8, 12) === 'WEBP';
  return false;
}
function checkResourceFile(bytes, mime) {
  if (mime === 'application/pdf') return bytes.toString('ascii', 0, 5) === '%PDF-';
  if (mime === 'application/zip' || mime === 'application/x-zip-compressed') return bytes.length > 3 && bytes[0] === 0x50 && bytes[1] === 0x4b;
  return mime === 'text/plain' && !bytes.subarray(0, Math.min(bytes.length, 256)).includes(0);
}
function safeFilename(value) {
  const cleaned = cleanText(value, 120).replace(/[\\/"\r\n]/g, '_').replace(/[^\p{L}\p{N} ._()\-]/gu, '').trim();
  return cleaned || 'creatorlab-resource';
}
async function incrementProductSales(id) {
  for (let attempt = 0; attempt < 5; attempt++) {
    const entry = await productsStore().getWithMetadata(productKey(id), { type: 'json' });
    if (!entry?.data) return;
    const result = await productsStore().set(productKey(id), JSON.stringify({ ...entry.data, sales: Number(entry.data.sales || 0) + 1 }), { onlyIfMatch: entry.etag });
    if (result?.modified !== false) return;
  }
}
async function upsertPaidOrder(reference, verifiedData) {
  const key = orderKey(reference);
  const current = await ordersStore().getWithMetadata(key, { type: 'json' });
  if (!current?.data) fail(404, 'No matching order was found. Please contact support.');
  if (current.data.status === 'paid') return { order: current.data, changed: false };
  const paid = {
    ...current.data, status: 'paid', paidAt: verifiedData.paid_at || new Date().toISOString(),
    gatewayTransactionId: String(verifiedData.id || ''), gatewayStatus: verifiedData.status
  };
  try {
    const result = await ordersStore().set(key, JSON.stringify(paid), { onlyIfMatch: current.etag });
    if (result?.modified === false) {
      const latest = await ordersStore().get(key, { type: 'json' });
      if (latest?.status === 'paid') return { order: latest, changed: false };
      fail(409, 'This order is being confirmed. Please wait a moment and retry.');
    }
    await incrementProductSales(current.data.productId);
    return { order: paid, changed: true };
  } catch {
    const latest = await ordersStore().get(key, { type: 'json' });
    if (latest?.status === 'paid') return { order: latest, changed: false };
    fail(409, 'This order is being confirmed. Please wait a moment and retry.');
  }
}
async function verifyAgainstPaystack(reference, expected) {
  const secret = process.env.PAYSTACK_SECRET_KEY;
  if (!secret) fail(503, 'Payments are not set up yet. Add PAYSTACK_SECRET_KEY in your Netlify site settings.');
  const response = await fetch(`https://api.paystack.co/transaction/verify/${encodeURIComponent(reference)}`, {
    headers: { Authorization: `Bearer ${secret}` }, signal: AbortSignal.timeout(12000)
  });
  let body;
  try { body = await response.json(); } catch { fail(502, 'Paystack verification returned an unreadable response.'); }
  if (!response.ok || !body.status || !body.data) fail(502, 'Paystack could not verify this transaction right now. Please try again.');
  const data = body.data;
  if (data.reference !== reference) fail(400, 'The transaction reference does not match this order.');
  if (data.amount !== expected.amountKobo) fail(400, 'The verified payment amount does not match this order.');
  if (data.currency !== 'NGN' || expected.currency !== 'NGN') fail(400, 'The transaction currency does not match this order.');
  if (String(data.customer?.email || '').toLowerCase() !== String(expected.email || '').toLowerCase()) fail(400, 'The checkout email does not match the transaction.');
  if (data.status !== 'success') fail(409, `Payment status is “${cleanText(data.status, 30) || 'unconfirmed'}”. Please retry after Paystack confirms it.`);
  return data;
}
async function validatePaidOrder(reference, email) {
  if (!/^[a-zA-Z0-9.=-]{8,100}$/.test(reference || '')) fail(400, 'That payment reference is not valid.');
  const order = await ordersStore().get(orderKey(reference), { type: 'json' });
  if (!order) fail(404, 'No order matches this reference. Check the reference or contact support.');
  if (String(order.email).toLowerCase() !== String(email).toLowerCase()) fail(400, 'That email does not match the checkout email.');
  if (order.status === 'paid') return order;
  const verifiedData = await verifyAgainstPaystack(reference, order);
  return (await upsertPaidOrder(reference, verifiedData)).order;
}
function newSessionToken() { return randomBytes(32).toString('base64url'); }
async function createSession(order, request) {
  const token = newSessionToken();
  const session = { reference: order.reference, email: order.email, expiresAt: Date.now() + 48 * 60 * 60 * 1000 };
  await sessionsStore().set(`session-${token}`, JSON.stringify(session), { onlyIfNew: true });
  return sessionCookie(token, request);
}
async function actionProducts() {
  const all = await listAllProducts();
  const publicItems = all.filter(product => product.published).map(publicProduct);
  return json({ products: publicItems, settings: await readSettings() });
}
async function actionImage(url) {
  const product = await loadProduct(url.searchParams.get('productId'));
  if (!product || !product.published || !product.imageKey) fail(404, 'Image not found.');
  const entry = await filesStore().getWithMetadata(product.imageKey, { type: 'arrayBuffer' });
  if (!entry?.data) fail(404, 'Image not found.');
  const type = ['image/jpeg','image/png','image/webp'].includes(entry.metadata?.type) ? entry.metadata.type : 'application/octet-stream';
  return new Response(entry.data, { headers: { 'Content-Type': type, 'Cache-Control': 'public, max-age=3600', 'X-Content-Type-Options': 'nosniff' } });
}
async function actionStart(request) {
  checkSameOrigin(request);
  const input = await parseJson(request);
  const product = await loadProduct(input.productId);
  if (!product || !product.published) fail(404, 'This resource is not currently available.');
  const price = publishedPrice(product);
  if (!Number.isSafeInteger(price) || price <= 0) fail(400, 'This resource does not require paid checkout.');
  if (!product.fileKey && !product.deliveryLink) fail(409, 'This resource has no delivery method configured yet.');
  const name = cleanText(input.name, 100);
  const email = String(input.email || '').trim().toLowerCase();
  if (name.length < 2 || !safeEmail(email)) fail(400, 'Enter a valid name and email address.');
  const secret = process.env.PAYSTACK_SECRET_KEY;
  if (!secret) fail(503, 'Payments are not set up yet. Add PAYSTACK_SECRET_KEY in your Netlify site settings.');
  const reference = `cl${randomBytes(20).toString('hex')}`;
  const amountKobo = price * 100;
  if (!Number.isSafeInteger(amountKobo)) fail(400, 'The listed price is too large.');
  const order = {
    reference, productId: product.id, productTitle: product.title, name, email, amountNaira: price,
    amountKobo, currency: 'NGN', status: 'pending', createdAt: new Date().toISOString(), paidAt: null
  };
  await ordersStore().set(orderKey(reference), JSON.stringify(order), { onlyIfNew: true });
  const origin = new URL(request.url).origin;
  const paystackResponse = await fetch('https://api.paystack.co/transaction/initialize', {
    method: 'POST', headers: { Authorization: `Bearer ${secret}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email, amount: String(amountKobo), currency: 'NGN', reference,
      callback_url: `${origin}/`,
      metadata: {
        productId: product.id,
        custom_fields: [
          { display_name: 'Resource', variable_name: 'resource', value: product.title },
          { display_name: 'Order reference', variable_name: 'order_reference', value: reference },
          { display_name: 'Customer name', variable_name: 'customer_name', value: name }
        ]
      }
    }), signal: AbortSignal.timeout(12000)
  });
  let body;
  try { body = await paystackResponse.json(); } catch { fail(502, 'Paystack checkout could not be started.'); }
  if (!paystackResponse.ok || !body.status || !body.data?.authorization_url) {
    await ordersStore().set(orderKey(reference), JSON.stringify({ ...order, status: 'failed' }));
    fail(502, 'Paystack could not start checkout. Please try again later.');
  }
  return json({ authorizationUrl: body.data.authorization_url, reference });
}
async function actionVerify(request) {
  checkSameOrigin(request);
  const input = await parseJson(request);
  const reference = cleanText(input.reference, 100);
  const email = String(input.email || '').trim().toLowerCase();
  if (!safeEmail(email)) fail(400, 'Enter the email you used at checkout.');
  const order = await validatePaidOrder(reference, email);
  const product = await loadProduct(order.productId);
  if (!product) fail(404, 'The purchased resource is no longer available. Contact support.');
  const cookie = await createSession(order, request);
  return json({
    verified: true, email: order.email, amountNaira: order.amountNaira,
    product: { id: product.id, title: product.title }, downloadAvailable: !!product.fileKey,
    telegramUrl: product.deliveryLink || '', tutorialUrl: product.tutorialUrl || '',
    message: 'Payment verified.'
  }, 200, { 'Set-Cookie': cookie });
}
async function actionFreeAccess(request) {
  checkSameOrigin(request);
  const input = await parseJson(request);
  const product = await loadProduct(input.productId);
  if (!product || !product.published || publishedPrice(product) !== 0) fail(404, 'This is not an available free resource.');
  return json({ downloadAvailable: !!product.fileKey, telegramUrl: product.deliveryLink || '' });
}
async function actionDownload(request, url) {
  const product = await loadProduct(url.searchParams.get('productId'));
  if (!product || !product.published || !product.fileKey) fail(404, 'The download is not available.');
  const free = publishedPrice(product) === 0;
  if (!free) {
    const token = cookies(request).cl_access;
    if (!token || !/^[A-Za-z0-9_-]{30,60}$/.test(token)) fail(401, 'Verify your payment first to unlock this download.');
    const session = await sessionsStore().get(`session-${token}`, { type: 'json' });
    if (!session || session.expiresAt < Date.now()) fail(401, 'Your download session has expired. Verify your order again.');
    const order = await ordersStore().get(orderKey(session.reference), { type: 'json' });
    if (!order || order.status !== 'paid' || order.productId !== product.id || order.email !== session.email) fail(403, 'This order does not grant access to this resource.');
  }
  const entry = await filesStore().getWithMetadata(product.fileKey, { type: 'arrayBuffer' });
  if (!entry?.data) fail(404, 'The file is no longer available. Contact support.');
  const type = ['application/pdf','text/plain','application/zip','application/x-zip-compressed'].includes(entry.metadata?.type) ? entry.metadata.type : 'application/octet-stream';
  const filename = safeFilename(entry.metadata?.filename || product.fileName || 'creatorlab-resource');
  return new Response(entry.data, { headers: {
    'Content-Type': type, 'Content-Disposition': `attachment; filename="${filename}"`,
    'Cache-Control': 'private, no-store', 'X-Content-Type-Options': 'nosniff', 'Content-Security-Policy': "default-src 'none'; sandbox"
  } });
}
async function actionAdminData() {
  await currentAdmin();
  const [allProducts, orders, settings] = await Promise.all([listAllProducts(), listAllOrders(), readSettings()]);
  return json({ products: allProducts.map(adminProduct), orders, settings });
}
async function actionSaveProduct(request) {
  checkSameOrigin(request);
  await currentAdmin();
  const length = Number(request.headers.get('content-length') || 0);
  if (length > MAX_REQUEST_BYTES) fail(413, 'The combined upload is too large. Keep the image under 1.5 MB and file under 4 MB.');
  let form;
  try { form = await request.formData(); } catch { fail(400, 'Could not read the product form.'); }
  const input = Object.fromEntries(['id','title','category','description','preview','price','originalPrice','discountEnabled','featured','published','whatIncluded','howToUse','tutorialUrl','deliveryLink'].map(key => [key, form.get(key)]));
  const idInput = cleanText(input.id, 80);
  const id = idInput ? idInput : randomBytes(16).toString('hex');
  if (!/^[a-zA-Z0-9-]{8,80}$/.test(id)) fail(400, 'The product ID is not valid.');
  const existing = idInput ? await loadProduct(id) : null;
  if (idInput && !existing) fail(404, 'This resource no longer exists. Refresh the page and try again.');
  const title = cleanText(input.title, 120);
  const category = cleanText(input.category, 80);
  const description = cleanText(input.description, 360);
  const preview = cleanText(input.preview, 900);
  const price = Number(input.price);
  const originalPrice = Number(input.originalPrice || 0);
  const discountEnabled = bool(input.discountEnabled);
  const featured = bool(input.featured);
  const published = bool(input.published);
  const tutorialUrl = safeUrl(input.tutorialUrl);
  const deliveryLink = safeUrl(input.deliveryLink);
  const validCategories = ['AI Video Prompts','Image Generation Prompts','Animation Prompts','AI Storytelling Scripts','Character Design Prompts','Content Creation Resources','PDF Guides and E-books','Templates','Other Digital Resources'];
  if (title.length < 3 || !description || !validCategories.includes(category)) fail(400, 'Enter a title, description and one of the listed categories.');
  if (!Number.isSafeInteger(price) || price < 0 || !Number.isSafeInteger(originalPrice) || originalPrice < 0) fail(400, 'Prices must be whole amounts in Nigerian Naira.');
  if (discountEnabled && (price <= 0 || originalPrice <= price)) fail(400, 'For a discount, the original price must be higher than the current price.');
  if ((input.tutorialUrl && !tutorialUrl) || (input.deliveryLink && !deliveryLink)) fail(400, 'Links must use a valid http:// or https:// address.');
  const image = form.get('image');
  const file = form.get('file');
  let imageKeyValue = existing?.imageKey || '';
  let fileKeyValue = existing?.fileKey || '';
  let fileName = existing?.fileName || '';
  let fileMime = existing?.fileMime || '';
  if (image && typeof image.arrayBuffer === 'function' && image.size > 0) {
    if (image.size > MAX_IMAGE_BYTES) fail(413, 'Cover images must be 1.5 MB or smaller.');
    const mime = image.type.toLowerCase();
    if (!['image/jpeg','image/png','image/webp'].includes(mime)) fail(400, 'Cover images must be JPG, PNG or WebP.');
    const bytes = Buffer.from(await image.arrayBuffer());
    if (!checkImage(bytes, mime)) fail(400, 'That image file could not be validated. Please choose a JPG, PNG or WebP image.');
    imageKeyValue = imageKey(id);
    await filesStore().set(imageKeyValue, new Blob([bytes], { type: mime }), { metadata: { type: mime, filename: safeFilename(image.name), size: bytes.length } });
  }
  if (file && typeof file.arrayBuffer === 'function' && file.size > 0) {
    if (file.size > MAX_FILE_BYTES) fail(413, 'Resource files must be 4 MB or smaller.');
    const mime = file.type.toLowerCase();
    if (!['application/pdf','text/plain','application/zip','application/x-zip-compressed'].includes(mime)) fail(400, 'Resource files must be PDF, TXT or ZIP.');
    const bytes = Buffer.from(await file.arrayBuffer());
    if (!checkResourceFile(bytes, mime)) fail(400, 'That file could not be validated. Please upload a valid PDF, TXT or ZIP file.');
    fileKeyValue = fileKey(id);
    fileName = safeFilename(file.name);
    fileMime = mime;
    await filesStore().set(fileKeyValue, new Blob([bytes], { type: mime }), { metadata: { type: mime, filename: fileName, size: bytes.length } });
  }
  if (published && !fileKeyValue && !deliveryLink) fail(400, 'Add a private download file or a Telegram delivery link before publishing.');
  const now = new Date().toISOString();
  const product = {
    id, title, category, description, preview, price, originalPrice,
    discountEnabled: discountEnabled && price > 0, featured, published, tutorialUrl, deliveryLink,
    whatIncluded: validateArray(input.whatIncluded), howToUse: validateArray(input.howToUse),
    imageKey: imageKeyValue, fileKey: fileKeyValue, fileName, fileMime,
    sales: Number(existing?.sales || 0), createdAt: existing?.createdAt || now, updatedAt: now
  };
  await productsStore().set(productKey(id), JSON.stringify(product));
  const allProducts = await listAllProducts();
  return json({ saved: true, product: adminProduct(product), products: allProducts.map(adminProduct) });
}
async function actionDeleteProduct(request) {
  checkSameOrigin(request);
  await currentAdmin();
  const input = await parseJson(request);
  const id = cleanText(input.id, 80);
  const product = await loadProduct(id);
  if (!product) fail(404, 'Resource not found.');
  await productsStore().delete(productKey(id));
  if (product.imageKey) await filesStore().delete(product.imageKey);
  if (product.fileKey) await filesStore().delete(product.fileKey);
  return json({ deleted: true, products: (await listAllProducts()).map(adminProduct) });
}
async function actionSettingsSave(request) {
  checkSameOrigin(request);
  await currentAdmin();
  const input = await parseJson(request);
  const allowed = {};
  for (const key of ['telegramCommunity','telegramChannel','whatsapp','instagram','youtube']) {
    const raw = cleanText(input[key], 700);
    const safe = safeUrl(raw);
    if (raw && !safe) fail(400, `${key} must be a valid http:// or https:// link.`);
    allowed[key] = safe;
  }
  const supportEmail = cleanText(input.supportEmail, 254).toLowerCase();
  if (supportEmail && !safeEmail(supportEmail)) fail(400, 'Enter a valid support email address.');
  allowed.supportEmail = supportEmail;
  await writeSettings(allowed);
  return json({ settings: allowed });
}
async function actionWebhook(request) {
  const secret = process.env.PAYSTACK_SECRET_KEY;
  if (!secret) fail(503, 'Payments are not configured.');
  const signature = request.headers.get('x-paystack-signature') || '';
  const raw = await request.text();
  const expected = createHmac('sha512', secret).update(raw).digest('hex');
  const a = Buffer.from(signature, 'hex');
  const b = Buffer.from(expected, 'hex');
  if (a.length !== b.length || !timingSafeEqual(a, b)) fail(401, 'Webhook signature is invalid.');
  let event;
  try { event = JSON.parse(raw); } catch { fail(400, 'Webhook body is not valid JSON.'); }
  if (event.event !== 'charge.success' || !event.data?.reference) return json({ received: true, processed: false });
  const reference = cleanText(event.data.reference, 100);
  if (!/^[a-zA-Z0-9.=-]{8,100}$/.test(reference)) fail(400, 'Webhook reference is invalid.');
  const order = await ordersStore().get(orderKey(reference), { type: 'json' });
  if (!order) return json({ received: true, processed: false });
  if (order.status === 'paid') return json({ received: true, processed: true, duplicate: true });
  const verifiedData = await verifyAgainstPaystack(reference, order);
  await upsertPaidOrder(reference, verifiedData);
  return json({ received: true, processed: true });
}

export default async function handler(request) {
  try {
    const url = new URL(request.url);
    const action = url.searchParams.get('action') || 'products';
    if (request.method === 'OPTIONS') return new Response(null, { status: 204, headers: { 'Allow': 'GET, POST, OPTIONS' } });
    if (action === 'webhook' && request.method === 'POST') return await actionWebhook(request);
    if (action === 'products' && request.method === 'GET') return await actionProducts();
    if (action === 'settings-public' && request.method === 'GET') return json({ settings: await readSettings() });
    if (action === 'image' && request.method === 'GET') return await actionImage(url);
    if (action === 'download' && request.method === 'GET') return await actionDownload(request, url);
    if (action === 'start' && request.method === 'POST') return await actionStart(request);
    if (action === 'verify' && request.method === 'POST') return await actionVerify(request);
    if (action === 'free-access' && request.method === 'POST') return await actionFreeAccess(request);
    if (action === 'admin-data' && request.method === 'GET') return await actionAdminData();
    if (action === 'save-product' && request.method === 'POST') return await actionSaveProduct(request);
    if (action === 'delete-product' && request.method === 'POST') return await actionDeleteProduct(request);
    if (action === 'settings-save' && request.method === 'POST') return await actionSettingsSave(request);
    fail(404, 'Unknown request.');
  } catch (error) {
    const status = Number(error.status) || 500;
    if (status >= 500) console.error('CreatorLab API error:', error?.message || error);
    const message = status >= 500 ? 'The service is temporarily unavailable. Please try again in a moment.' : error.message;
    return json({ error: message }, status);
  }
}
