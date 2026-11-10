# M.R GAME ZONE — Starter Website

## Included
- Customer storefront: home, product listing/details, cart, checkout, order tracking, contact.
- Separate `admin/` folder with a demo login and order dashboard.
- Responsive dark/neon gaming design.
- Sample products in `products.js`.

## Run
Open `index.html` in a browser, or upload the whole folder to a GitHub repository and enable GitHub Pages.

## Demo admin
- URL: `/admin/login.html`
- Username: `admin`
- Password: `change-this-demo-password`

**Important security warning:** This is a front-end starter/demo. The admin password check is client-side and is NOT secure for a public shop. Orders and cart are stored in the visitor's browser Local Storage, so the admin dashboard only sees orders made in the same browser/device. Do not accept real customer payments or publish this demo as a production store.

## Before going live
1. Replace sample product names, prices, images and contact details.
2. Add a real backend/database (e.g. Firebase Firestore) and Firebase Authentication.
3. Protect all admin actions with server/database security rules; never rely on hidden pages or client-side passwords.
4. Integrate official bKash/Nagad merchant payment gateway APIs through a trusted server-side backend. Do not ask customers to send PIN/OTP.
5. Test orders, delivery charges, privacy and refund policy.

`firebase.js` is a configuration placeholder only; no live Firebase project is connected.
