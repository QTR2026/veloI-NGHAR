// =============================================================
// VELORA — إعدادات Firebase
// =============================================================
// عدّل القيم التالية بمعلومات مشروعك في Firebase Console:
// Project settings > General > Your apps > SDK setup and configuration
//
// كذلك يجب تفعيل:
//  1) Firestore Database  (Build > Firestore Database > Create database)
//  2) Authentication > Sign-in method > Email/Password (Enable)
//  3) إنشاء مستخدم إدارة واحد يدويًا من Authentication > Users > Add user
// =============================================================

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.13.0/firebase-app.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.13.0/firebase-firestore.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.13.0/firebase-auth.js";

const firebaseConfig = {
  apiKey: "ضع-API-KEY-هنا",
  authDomain: "your-project.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-project.appspot.com",
  messagingSenderId: "000000000000",
  appId: "1:000000000000:web:xxxxxxxxxxxxxxxxxxxxxx"
};

export const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);

// رقم واتساب المتجر (بالصيغة الدولية بدون + أو أصفار البداية)
// مثال: رقم سعودي 05xxxxxxxx يصبح 9665xxxxxxxx
export const WHATSAPP_NUMBER = "966500000000";
