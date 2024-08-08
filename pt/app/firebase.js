// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import {getFirestore} from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDGnr9zHp0kS8iLE4OqjVQN62Iy7mgFARA",
  authDomain: "pantryapp-d005d.firebaseapp.com",
  projectId: "pantryapp-d005d",
  storageBucket: "pantryapp-d005d.appspot.com",
  messagingSenderId: "213330996248",
  appId: "1:213330996248:web:fb4428a2b7a43b0505276d"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const firestore=getFirestore(app);
export {app,firestore};