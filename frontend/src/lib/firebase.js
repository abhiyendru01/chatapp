// src/lib/firebase.js
import firebase from "firebase/app";
import "firebase/messaging";

const firebaseConfig = {
    apiKey: "AIzaSyDDL8n-cfyXtocY1deAuFY2LBsVVkLn1uw",
  authDomain: "chatapp-678e2.firebaseapp.com",
  databaseURL: "https://chatapp-678e2-default-rtdb.firebaseio.com",
  projectId: "chatapp-678e2",
  storageBucket: "chatapp-678e2.firebasestorage.app",
  messagingSenderId: "806602114681",
  appId: "1:806602114681:web:c8e427920ff3425d1f76a8",
   measurementId: "G-EM3WZ8NRDG"
};

firebase.initializeApp(firebaseConfig);

const messaging = firebase.messaging();

// Request permission to send notifications and get the token
export const requestPermission = async () => {
  try {
    await messaging.requestPermission();
    const token = await messaging.getToken();
    console.log("FCM Token:", token);

    // Optionally, send the token to your backend to store it for push notifications
  } catch (err) {
    console.log("Error getting permission:", err);
  }
};

// Handle background and foreground messages
messaging.onMessage((payload) => {
  console.log("Message received. ", payload);
  new Notification(payload.notification.title, {
    body: payload.notification.body,
  });
});

export { messaging };
