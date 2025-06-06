import * as webpush from 'web-push';
const vapidKeys = {
    publicKey: process.env.VAPID_PUBLIC_KEY,
    privateKey: process.env.VAPID_PRIVATE_KEY,
};
webpush.setVapidDetails(
    "mailto:test@example.com",
    vapidKeys.publicKey,
    vapidKeys.privateKey
);


export default webpush