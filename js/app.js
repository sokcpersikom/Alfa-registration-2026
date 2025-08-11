// js/app.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-app.js";
import { getFirestore, collection, addDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-firestore.js";
import { getStorage, ref as storageRef, uploadBytes, getDownloadURL } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-storage.js";

   const firebaseConfig = {
  apiKey: "AIzaSyCEmitc3nw7vIEiFsNc5KV1rJLGRRqFwsw",
  authDomain: "alfa-registration-2026-5f644.firebaseapp.com",
  projectId: "alfa-registration-2026-5f644",
  storageBucket: "alfa-registration-2026-5f644.firebasestorage.app",
  messagingSenderId: "875792440983",
  appId: "1:875792440983:web:3da85128308039dae313d2"
};

if (!firebaseConfig || !firebaseConfig.apiKey) {
  console.warn('Firebase config отсутствует. Добавьте firebaseConfig в js/app.js');
}

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const storage = getStorage(app);

const form = document.getElementById('regForm');
const status = document.getElementById('status');

form.addEventListener('submit', async (e) => {
  e.preventDefault();
  status.textContent = '';
  const btn = form.querySelector('button[type="submit"]');
  btn.disabled = true;
  btn.textContent = 'Отправка...';

  const data = {
    childName: form.childName.value.trim(),
    dob: form.dob.value,
    parentName: form.parentName.value.trim(),
    phone: form.phone.value.trim(),
    email: form.email.value.trim(),
    notes: form.notes.value.trim(),
    createdAt: serverTimestamp()
  };

  try {
    // 1) загрузка файлов (если есть)
    const files = {};
    const photoFile = form.photo.files[0];
    const consentFile = form.consent.files[0];
    const prefix = `registrations/${Date.now()}`;

    if (photoFile) {
      const safeName = photoFile.name.replace(/\s/g,'_');
      const ref = storageRef(storage, `${prefix}_photo_${safeName}`);
      const snap = await uploadBytes(ref, photoFile);
      files.photoUrl = await getDownloadURL(snap.ref);
    }

    if (consentFile) {
      const safeName = consentFile.name.replace(/\s/g,'_');
      const ref = storageRef(storage, `${prefix}_consent_${safeName}`);
      const snap = await uploadBytes(ref, consentFile);
      files.consentUrl = await getDownloadURL(snap.ref);
    }

    // 2) запись заявки в Firestore
    const doc = await addDoc(collection(db, 'registrations'), {
      ...data,
      files
    });

    status.textContent = 'Готово — заявка принята. ID: ' + doc.id;
    form.reset();
  } catch (err) {
    console.error(err);
    status.textContent = 'Ошибка при отправке: ' + (err.message || err);
  } finally {
    btn.disabled = false;
    btn.textContent = 'Отправить заявку';
  }
});

