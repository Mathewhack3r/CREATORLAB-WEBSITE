# CreatorLab AI — Learn. Create. Grow.

A lightweight digital-resource storefront built with HTML, CSS and vanilla JavaScript. The project has **eight files** and uses one Netlify Function for protected backend operations. It is designed for phones, tablets and desktop screens.

## What is included

- Homepage collections for Featured, Latest, Popular and Free resources; category browsing, search, free/paid filters, sorting and product previews.
- A mobile-friendly admin workspace at `/?admin` for managing resources, verified orders and store contact links.
- Product cover images, private PDF/TXT/ZIP downloads, related tutorials, per-product Telegram delivery links, discounts and publishing controls.
- Paystack checkout in NGN. The server calculates the price and verifies the reference, amount, currency, customer email and payment status before granting access.
- Netlify Identity role checks for every admin read and write. No Paystack secret or admin password is included in public JavaScript.

## Project files

```text
index.html
style.css
script.js
package.json
netlify.toml
.gitignore
README.md
netlify/functions/api.mjs
```

Product records, orders, settings and files are stored in separate private Netlify Blobs stores. Only published, non-sensitive product details are returned to visitors. Published cover images are served through an image endpoint; resource files remain private and are streamed only after a verified order is tied to a short-lived, HttpOnly access cookie. Nothing is uploaded to the public GitHub repository. Netlify Blobs are provisioned by the platform when used by the Function.

Uploads are kept small for a single synchronous function: **up to 1.5 MB per cover image and 4 MB per resource file**, with a combined request-size limit. Covers may be JPG/PNG/WebP; downloadable files may be PDF/TXT/ZIP. File types and signatures are checked server-side. The purchase-success page provides access in the browser; this starter does not send a separate custom delivery email. Paystack may send a receipt according to your Paystack settings.

## Deploy on GitHub and Netlify

1. Create a GitHub repository and upload the eight project files, preserving the `netlify/functions/api.mjs` path.
2. In Netlify, choose **Add new site → Import an existing project**, connect the repository and deploy. The provided `netlify.toml` sets the publish and functions directories; there is no frontend build command.
3. In the Netlify project settings, enable **Identity**, disable public/open sign-ups, and invite or create your private admin account. In Identity's user management, assign your account the `admin` role. After deploy, sign in at `https://YOUR-SITE.netlify.app/?admin`. The Function checks this role server-side on every protected admin request.
4. Add the Paystack **test secret key** as the Netlify environment variable `PAYSTACK_SECRET_KEY`. Never paste it into `script.js`, HTML or GitHub. Redeploy after changing environment variables. Run a test purchase and verify the callback and download before replacing it with the Paystack **live secret key**.
5. Open `/?admin`, sign in, add a product, upload its file and optional image, write a short safe preview, set its price/category, and publish it. Add community, channel, WhatsApp, social and support-email links under **Store settings**.
6. Test a free download and paid checkout end-to-end before sharing the store. After changing Netlify environment variables, trigger a fresh deploy so the Functions receive the new values.

Optional: configure the Paystack webhook URL as `https://YOUR-SITE.netlify.app/api?action=webhook`. The Function checks Paystack's request signature and verifies a successful event with Paystack before marking an order paid. The buyer's callback also verifies directly. Conditional writes make fulfillment idempotent, so a repeated notification does not create a second paid order record.

## Configuration and security notes

- Required for paid checkout: `PAYSTACK_SECRET_KEY`, set only in Netlify's environment-variable settings. Without it, the catalogue and free browsing can still load, but checkout reports that payment setup is incomplete.
- Required for admin: Netlify Identity enabled, public signup disabled and the owner's Identity role set to `admin`. Do not use a password stored in frontend code or localStorage.
- Netlify Blobs is a simple persistent store, not a relational database. It suits a small catalogue and modest order volume; consider a purpose-built database if the store outgrows that use.
- Access sessions last 48 hours and are tied to a verified order and product. Customers can verify the order again with the checkout email if needed. Downloaded files or Telegram invites can still be shared; digital files cannot be made impossible to redistribute.
- This starter does not include a custom email-delivery service, automated refunds, tax handling or a CDN. Review applicable business, privacy and tax obligations before accepting live payments. No site can be guaranteed unhackable.
- Deleting a resource also deletes its file and image. Prefer **unpublish** if existing buyers should retain access.

## Local preview

Open `index.html` directly or run `python3 -m http.server 8000`, then visit `http://localhost:8000`. Demo product cards and artwork appear only when the Netlify API is unavailable; they are not saved catalogue records and cannot be purchased or downloaded. The live product manager and secure storage need Netlify Functions, Identity and Blobs.

## Reference docs

- [Netlify Functions](https://docs.netlify.com/build/functions/overview/)
- [Netlify Blobs](https://docs.netlify.com/build/data-and-storage/netlify-blobs/)
- [Use Identity in Functions](https://docs.netlify.com/manage/security/secure-access-to-sites/identity/use-identity-in-functions/)
- [Paystack Transaction API](https://paystack.com/docs/api/transaction/)
- [Paystack payment verification](https://paystack.com/docs/payments/verify-payments/)
