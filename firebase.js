/* SMART BUSINESS - Account System (Firebase Authentication) */
import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.14.1/firebase-app.js';
import {
  getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword,
  onAuthStateChanged, signOut, updateProfile
} from 'https://www.gstatic.com/firebasejs/10.14.1/firebase-auth.js';

const firebaseConfig = {
  apiKey: 'AIzaSyDv4Avso4nJW_Ld0sCZGXgbq1uBOKLlqC',
  authDomain: 'smart-business-142fb.firebaseapp.com',
  projectId: 'smart-business-142fb',
  storageBucket: 'smart-business-142fb.firebasestorage.app',
  messagingSenderId: '556060487337',
  appId: '1:556060487337:web:65ee233a6e1730941503b8',
  measurementId: 'G-FZ40DTSJS2'
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

const css = `
#sbAuthGate{position:fixed;inset:0;z-index:99999;background:#f3f6f5;display:flex;align-items:center;justify-content:center;padding:18px;font-family:Arial,'Noto Sans Bengali',sans-serif}
#sbAuthGate .auth-card{width:100%;max-width:410px;background:#fff;border-radius:18px;padding:25px;box-shadow:0 8px 30px rgba(0,0,0,.12)}
#sbAuthGate h2{margin:0 0 7px;color:#075b45;text-align:center;font-size:24px}
#sbAuthGate .auth-sub{text-align:center;color:#718078;font-size:13px;margin-bottom:22px}
#sbAuthGate label{display:block;font-size:13px;margin:12px 0 5px;color:#34443d}
#sbAuthGate input{width:100%;padding:12px;border:1px solid #dce5df;border-radius:9px;font-size:15px;outline:none}
#sbAuthGate input:focus{border-color:#08785a}
#sbAuthGate button{width:100%;padding:13px;border:0;border-radius:9px;background:#075b45;color:white;font-weight:bold;font-size:15px;margin-top:16px;cursor:pointer}
#sbAuthGate .auth-switch{background:transparent;color:#075b45;margin-top:8px}
#sbAuthGate .auth-error{color:#c62828;font-size:13px;line-height:1.5;margin-top:12px;min-height:18px;text-align:center}
#sbAuthGate .auth-note{font-size:11px;color:#7a8780;text-align:center;margin-top:14px;line-height:1.5}
#sbAuthGate .hidden{display:none}
`;
document.head.insertAdjacentHTML('beforeend', `<style>${css}</style>`);

const gate = document.createElement('div');
gate.id = 'sbAuthGate';
gate.innerHTML = `
 <div class="auth-card">
  <h2>SMART BUSINESS</h2>
  <div class="auth-sub">আপনার ব্যবসার অ্যাকাউন্টে প্রবেশ করুন</div>
  <form id="sbLoginForm">
   <label>ইমেইল</label><input id="sbLoginEmail" type="email" autocomplete="username" required placeholder="আপনার ইমেইল">
   <label>পাসওয়ার্ড</label><input id="sbLoginPassword" type="password" autocomplete="current-password" required minlength="6" placeholder="কমপক্ষে ৬ অক্ষর">
   <button type="submit">লগইন</button>
   <button type="button" class="auth-switch" id="sbShowRegister">নতুন অ্যাকাউন্ট খুলুন</button>
  </form>
  <form id="sbRegisterForm" class="hidden">
   <label>দোকানের নাম</label><input id="sbShopName" required placeholder="দোকানের নাম">
   <label>মালিকের নাম</label><input id="sbOwnerName" required placeholder="আপনার নাম">
   <label>মোবাইল নম্বর</label><input id="sbPhone" type="tel" required placeholder="মোবাইল নম্বর">
   <label>ইমেইল</label><input id="sbRegisterEmail" type="email" autocomplete="username" required placeholder="আপনার ইমেইল">
   <label>পাসওয়ার্ড</label><input id="sbRegisterPassword" type="password" autocomplete="new-password" minlength="6" required placeholder="কমপক্ষে ৬ অক্ষর">
   <button type="submit">রেজিস্ট্রেশন</button>
   <button type="button" class="auth-switch" id="sbShowLogin">আগে অ্যাকাউন্ট আছে? লগইন</button>
  </form>
  <div class="auth-error" id="sbAuthError" role="alert"></div>
  <div class="auth-note">আপনার অ্যাকাউন্ট নিরাপদ রাখতে পাসওয়ার্ড কারও সঙ্গে শেয়ার করবেন না।</div>
 </div>`;
document.body.appendChild(gate);

const $ = id => document.getElementById(id);
const errorBox = $('sbAuthError');
function showError(message=''){ errorBox.textContent = message; }
function friendlyError(error){
 const code = error?.code || 'unknown';
 const message = error?.message || 'অজানা সমস্যা';

 const map = {
  'auth/email-already-in-use':'এই ইমেইল দিয়ে আগে থেকেই অ্যাকাউন্ট খোলা আছে।',
  'auth/invalid-email':'সঠিক ইমেইল ঠিকানা লিখুন।',
  'auth/weak-password':'পাসওয়ার্ড কমপক্ষে ৬ অক্ষরের হতে হবে।',
  'auth/invalid-credential':'ইমেইল অথবা পাসওয়ার্ড সঠিক নয়।',
  'auth/user-not-found':'এই ইমেইলে কোনো অ্যাকাউন্ট পাওয়া যায়নি।',
  'auth/wrong-password':'পাসওয়ার্ড সঠিক নয়।',
  'auth/network-request-failed':'ইন্টারনেট সংযোগ পরীক্ষা করুন।',
  'auth/operation-not-allowed':'Firebase-এ Email/Password চালু নেই।'
 };

 return (map[code] || 'সমস্যার বিস্তারিত: ' + message) + ' [Error: ' + code + ']';
}
$('sbShowRegister').onclick=()=>{ $('sbLoginForm').classList.add('hidden'); $('sbRegisterForm').classList.remove('hidden'); showError(); };
$('sbShowLogin').onclick=()=>{ $('sbRegisterForm').classList.add('hidden'); $('sbLoginForm').classList.remove('hidden'); showError(); };

$('sbLoginForm').addEventListener('submit', async e=>{
 e.preventDefault(); showError();
 const button=$('sbLoginForm').querySelector('button[type="submit"]'); button.disabled=true; button.textContent='লগইন হচ্ছে...';
 try { await signInWithEmailAndPassword(auth,$('sbLoginEmail').value.trim(),$('sbLoginPassword').value); }
 catch(err){showError(friendlyError(err));}
 finally {button.disabled=false;button.textContent='লগইন';}
});

$('sbRegisterForm').addEventListener('submit', async e=>{
 e.preventDefault(); showError();
 const button=$('sbRegisterForm').querySelector('button[type="submit"]'); button.disabled=true; button.textContent='অ্যাকাউন্ট তৈরি হচ্ছে...';
 try {
  const shopName=$('sbShopName').value.trim(), owner=$('sbOwnerName').value.trim(), phone=$('sbPhone').value.trim();
  const credential=await createUserWithEmailAndPassword(auth,$('sbRegisterEmail').value.trim(),$('sbRegisterPassword').value);
  await updateProfile(credential.user,{displayName:owner});
  // Registration is handled by Firebase Authentication in this first stage.
  // Cloud business-data sync will be connected in the next stage.
 } catch(err){showError(friendlyError(err));}
 finally {button.disabled=false;button.textContent='রেজিস্ট্রেশন';}
});

onAuthStateChanged(auth, user=>{
 if(user){
  window.SBCurrentUser=user;
  gate.remove();
  if(typeof window.startSmartBusinessApp==='function') window.startSmartBusinessApp();
 } else {
  window.SBCurrentUser=null;
  if(!document.body.contains(gate)) document.body.appendChild(gate);
 }
});

window.SBAuth={logout:()=>signOut(auth),auth};
