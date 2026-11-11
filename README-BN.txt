SMART BUSINESS - Cloud Sync Package

ফাইল:
1. index.html - মূল অ্যাপ
2. firebase.js - লগইন ও Firestore Cloud Sync
3. Firestore-Rules.txt - Firebase Firestore নিরাপত্তা নিয়ম

গুরুত্বপূর্ণ:
- Firebase Authentication-এ Email/Password চালু থাকতে হবে।
- Firestore Database তৈরি থাকতে হবে।
- Firestore Rules ট্যাবে Firestore-Rules.txt-এর নিয়ম Publish করতে হবে।
- অ্যাপটি শুধু index.html ফোনে খুললে সব ব্রাউজারে ES Module চলবে না। Firebase Hosting বা HTTPS ওয়েব হোস্টিংয়ে প্রকাশ করতে হবে।
- একই Firebase অ্যাকাউন্টে লগইন করা একই দোকানের ডেটা একাধিক ডিভাইসে দেখা যাবে। আলাদা UID-এর ডেটা আলাদা থাকবে।
- পুরোনো localStorage পরীক্ষামূলক ডেটা ক্লাউডে নেওয়া হবে না; নতুন ক্লাউড ডেটা ফাঁকা থেকে শুরু হবে।
- একই সময়ে দুই ফোনে একই তথ্য সম্পাদনা করলে সর্বশেষ সংরক্ষিত পরিবর্তনটি থাকবে।

এটি প্রথম ক্লাউড-সিঙ্ক পরীক্ষামূলক প্যাকেজ। প্রকাশের আগে ওয়েব হোস্টিং ও বাস্তব ডিভাইসে পরীক্ষা করুন।
