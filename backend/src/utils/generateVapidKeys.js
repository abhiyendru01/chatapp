import webPush from 'web-push';

// Generate a new set of VAPID keys
const vapidKeys = webPush.generateVAPIDKeys();

// Print the generated keys (Save these somewhere safe)
console.log("VAPID Public Key:", vapidKeys.publicKey);
console.log("VAPID Private Key:", vapidKeys.privateKey);
