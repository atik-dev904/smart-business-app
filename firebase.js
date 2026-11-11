/* SMART TAILORS — Firebase Authentication + Firestore Cloud Sync */
import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.14.1/firebase-app.js';
import {
  getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword,
  onAuthStateChanged, signOut, updateProfile
} from 'https://www.gstatic.com/firebasejs/10.14.1/firebase-auth.js';
import {
  getFirestore, doc, getDoc, setDoc, onSnapshot, serverTimestamp
} from 'https://www.gstatic.com/firebasejs/10.14.1/firebase-firestore.js';

const firebaseConfig = {
  apiKey: 'AIzaSyA7aL4RPZN5aaGTRyAJExYig4w5Dds61QI',
  authDomain: 'smart-business-142fb.firebaseapp.com',
  projectId: 'smart-business-142fb',
  storageBucket: 'smart-business-142fb.firebasestorage.app',
  messagingSenderId: '556060487337',
  appId: '1:556060487337:web:65ee233a6e1730941503b8',
  measurementId: 'G-FZ40DTSJS2'
};

const firebaseApp = initializeApp(firebaseConfig);
const auth = getAuth(firebaseApp);
const db = getFirestore(firebaseApp);

const css = `
#sbAuthGate{position:fixed;inset:0;z-index:99999;background:#f3f6f5;display:flex;align-items:center;justify-content:center;padding:18px;font-family:Arial,'Noto Sans Bengali',sans-serif}
#sbAuthGate .auth-card{width:100%;max-width:410px;background:#fff;border-radius:18px;padding:25px;box-shadow:0 8px 30px rgba(0,0,0,.12)}
#sbAuthGate h2{margin:0 0 7px;color:#075b45;text-align:center;font-size:24px}
#sbAuthGate .auth-sub{text-align:center;color:#718078;font-size:13px;margin-bottom:22px}
#sbAuthGate label{display:block;font-size:13px;margin:12px 0 5px;color:#34443d}
#sbAuthGate input{width:100%;box-sizing:border-box;padding:12px;border:1px solid #dce5df;border-radius:9px;font-size:15px;outline:none}
#sbAuthGate input:focus{border-color:#08785a}
#sbAuthGate button{width:100%;padding:13px;border:0;border-radius:9px;background:#075b45;color:white;font-weight:bold;font-size:15px;margin-top:16px;cursor:pointer}
#sbAuthGate button:disabled{opacity:.6}
#sbAuthGate .auth-switch{background:transparent;color:#075b45;margin-top:8px}
#sbAuthGate .auth-error{color:#c62828;font-size:13px;line-height:1.5;margin-top:12px;min-height:18px;text-align:center;overflow-wrap:anywhere}
#sbAuthGate .auth-note{font-size:11px;color:#7a8780;text-align:center;margin-top:14px;line-height:1.5}
#sbAuthGate .hidden{display:none}
`;
document.head.insertAdjacentHTML('beforeend', `<style>${css}</style>`);

const gate = document.createElement('div');
gate.id = 'sbAuthGate';
gate.innerHTML = `
 <div class="auth-card">
  <h2>SMART TAILORS</h2>
  <div class="auth-sub">মোবাইল নম্বর ও পাসওয়ার্ড দিয়ে প্রবেশ করুন</div>
  <form id="sbLoginForm">
   <label>মোবাইল নম্বর</label><input id="sbLoginPhone" type="tel" autocomplete="username" required placeholder="01XXXXXXXXX >
   <label>পাসওয়ার্ড</label><input id="sbLoginPassword" type="password" autocomplete="current-password" required minlength="6" placeholder="কমপক্ষে ৬ অক্ষর">
   <button type="submit">লগইন</button>
   <button type="button" class="auth-switch" id="sbShowRegister">নতুন অ্যাকাউন্ট খুলুন</button>
  </form>
  <form id="sbRegisterForm" class="hidden">
   <label>দোকানের নাম</label><input id="sbShopName" required placeholder="দোকানের নাম">
   <label>মালিকের নাম</label><input id="sbOwnerName" required placeholder="আপনার নাম">
   <label>মোবাইল নম্বর</label><input id="sbPhone" type="tel" required placeholder="01XXXXXXXXX">
   <label>দোকানের ঠিকানা</label><input id="sbAddress" type="text" required placeholder="দোকানের পূর্ণ ঠিকানা">
   <label>পাসওয়ার্ড</label><input id="sbRegisterPassword" type="password" autocomplete="new-password" minlength="6" required placeholder="কমপক্ষে ৬ অক্ষর">
   <button type="submit">রেজিস্ট্রেশন</button>
   <button type="button" class="auth-switch" id="sbShowLogin">আগে অ্যাকাউন্ট আছে? লগইন</button>
  </form>
  <div class="auth-error" id="sbAuthError" role="alert"></div>
  <div class="auth-note">OTP ছাড়াই মোবাইল নম্বর ও পাসওয়ার্ড দিয়ে অ্যাকাউন্ট ব্যবহার করুন। পাসওয়ার্ড কারও সঙ্গে শেয়ার করবেন না।</div>
 </div>`;
document.body.appendChild(gate);

const $ = id => document.getElementById(id);
const errorBox = $('sbAuthError');
function showError(message=''){ errorBox.textContent = message; }
function friendlyError(error){
  const code = error?.code || 'unknown';
  const message = error?.message || 'অজানা সমস্যা';
  const map = {
    'auth/email-already-in-use':'এই মোবাইল নম্বর দিয়ে আগে থেকেই অ্যাকাউন্ট খোলা আছে।',
    'auth/invalid-email':'মোবাইল নম্বর সঠিকভাবে লিখুন।',
    'auth/weak-password':'পাসওয়ার্ড কমপক্ষে ৬ অক্ষরের হতে হবে।',
    'auth/invalid-credential':'ইমেইল অথবা পাসওয়ার্ড সঠিক নয়।',
    'auth/user-not-found':'এই ইমেইলে কোনো অ্যাকাউন্ট পাওয়া যায়নি।',
    'auth/wrong-password':'পাসওয়ার্ড সঠিক নয়।',
    'auth/network-request-failed':'ইন্টারনেট সংযোগ পরীক্ষা করুন।',
    'auth/operation-not-allowed':'Firebase-এ Email/Password চালু নেই.',
    'permission-denied':'Firestore Rules অনুমতি দেয়নি। Firebase Rules পরীক্ষা করুন।'
  };
  return (map[code] || ('সমস্যার বিস্তারিত: ' + message)) + ' [Error: ' + code + ']';
}

$('sbShowRegister').onclick=()=>{ $('sbLoginForm').classList.add('hidden'); $('sbRegisterForm').classList.remove('hidden'); showError(); };
$('sbShowLogin').onclick=()=>{ $('sbRegisterForm').classList.add('hidden'); $('sbLoginForm').classList.remove('hidden'); showError(); };

// OTP is not used: map each normalized phone number to a private Firebase Auth email alias.
function normalizeBangladeshPhone(value){
  let digits=String(value||'').replace(/\D/g,'');
  if(digits.startsWith('00880')) digits=digits.slice(2);
  if(digits.startsWith('8801')&&digits.length===13)return digits;
  if(digits.startsWith('01')&&digits.length===11)return '88'+digits;
  if(digits.startsWith('1')&&digits.length===10)return '880'+digits;
  throw new Error('বাংলাদেশের সঠিক ১১ সংখ্যার মোবাইল নম্বর লিখুন।');
}
function phoneAuthEmail(value){return 'phone.'+normalizeBangladeshPhone(value)+'@smarttailors.app';}
function loginIdentifier(value){const v=String(value||'').trim();return v.includes('@')?v:phoneAuthEmail(v);}

$('sbLoginForm').addEventListener('submit', async e=>{
  e.preventDefault(); showError();
  const button=$('sbLoginForm').querySelector('button[type="submit"]');
  button.disabled=true; button.textContent='লগইন হচ্ছে...';
  try {
    const identifier=loginIdentifier($('sbLoginPhone').value);
    await signInWithEmailAndPassword(auth,identifier,$('sbLoginPassword').value);
  } catch(err){showError(err.message&&!err.code?err.message:friendlyError(err));}
  finally {button.disabled=false;button.textContent='লগইন';}
});

$('sbRegisterForm').addEventListener('submit', async e=>{
  e.preventDefault(); showError();
  const button=$('sbRegisterForm').querySelector('button[type="submit"]');
  button.disabled=true; button.textContent='অ্যাকাউন্ট তৈরি হচ্ছে...';
  try {
    const shopName=$('sbShopName').value.trim();
    const owner=$('sbOwnerName').value.trim();
    const phone=$('sbPhone').value.trim();
    const address=$('sbAddress').value.trim();
    const authEmail=phoneAuthEmail(phone);
    const credential=await createUserWithEmailAndPassword(auth,authEmail,$('sbRegisterPassword').value);
    await updateProfile(credential.user,{displayName:owner});
    const dataRef=doc(db,'users',credential.user.uid,'businessData','main');
    await setDoc(dataRef,{
      profile:{shopName,owner,phone,address},
      data:{sales:[],orders:[],notes:[],expenses:[],settings:{shopName,owner,phone,address}},
      createdAt:serverTimestamp(),updatedAt:serverTimestamp()
    });
  } catch(err){showError(friendlyError(err));}
  finally {button.disabled=false;button.textContent='রেজিস্ট্রেশন';}
});

let stopCloudListener=null;
let cloudReady=false;
let saveTimer=null;
let lastRemoteJson='';
let activeUid=null;
const emptyData=()=>({sales:[],orders:[],notes:[],expenses:[],settings:{}});

function startCloud(user){
  if(stopCloudListener) stopCloudListener();
  cloudReady=false;
  activeUid=user.uid;
  const dataRef=doc(db,'users',user.uid,'businessData','main');
  stopCloudListener=onSnapshot(dataRef, async snapshot=>{
    try{
      if(!snapshot.exists()){
        await setDoc(dataRef,{profile:{shopName:'',owner:user.displayName||'',phone:''},data:emptyData(),createdAt:serverTimestamp(),updatedAt:serverTimestamp()});
        return;
      }
      const remote=snapshot.data();
      const data=remote.data || emptyData();
      const profile=remote.profile || {};
      data.settings=data.settings || {};
      data.settings.shopName=data.settings.shopName || profile.shopName || '';
      data.settings.owner=data.settings.owner || profile.owner || user.displayName || '';
      data.settings.phone=data.settings.phone || profile.phone || '';
      data.settings.address=data.settings.address || profile.address || '';
      lastRemoteJson=JSON.stringify(data);
      if(typeof window.SBApplyCloudData==='function') window.SBApplyCloudData(data);
      cloudReady=true;
      window.SBCloudStatus='সিঙ্ক চালু';
      gate.remove();
      if(typeof window.startSmartBusinessApp==='function') window.startSmartBusinessApp();
    }catch(err){
      cloudReady=false;
      showError(friendlyError(err));
    }
  },err=>{
    cloudReady=false;
    showError(friendlyError(err));
  });
}

window.SBCloudSave = data => {
  if(!cloudReady || !activeUid) return;
  clearTimeout(saveTimer);
  saveTimer=setTimeout(async()=>{
    try{
      if(!cloudReady || !activeUid) return;
      const clean=JSON.parse(JSON.stringify(data));
      const serialized=JSON.stringify(clean);
      if(serialized===lastRemoteJson) return;
      const dataRef=doc(db,'users',activeUid,'businessData','main');
      await setDoc(dataRef,{data:clean,updatedAt:serverTimestamp()},{merge:true});
      lastRemoteJson=serialized;
      window.SBCloudStatus='সিঙ্ক সম্পন্ন';
    }catch(err){
      window.SBCloudStatus='সিঙ্ক সমস্যা';
      console.error('SMART TAILORS cloud save:',err);
      if(typeof window.showToast==='function') window.showToast('ক্লাউডে সংরক্ষণ হয়নি: '+(err.code||err.message));
    }
  },450);
};

onAuthStateChanged(auth,user=>{
  if(user){
    window.SBCurrentUser=user;
    startCloud(user);
  }else{
    if(stopCloudListener) stopCloudListener();
    stopCloudListener=null; cloudReady=false; activeUid=null;
    window.SBCurrentUser=null;
    if(!document.body.contains(gate)) document.body.appendChild(gate);
  }
});

window.SBAuth={logout:()=>signOut(auth),auth};
const logoutButton=document.getElementById('sbLogoutBtn');
if(logoutButton)logoutButton.addEventListener('click',async()=>{if(confirm('আপনি কি লগআউট করতে চান?'))await signOut(auth);});
