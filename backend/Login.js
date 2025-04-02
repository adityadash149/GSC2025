// Import the functions you need from the SDKs you need
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.5.0/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/11.5.0/firebase-analytics.js";
import {getAuth, signInWithEmailAndPassword} from "https://www.gstatic.com/firebasejs/11.5.0/firebase-auth.js";
import {getFirestore, setDoc, doc} from "https://www.gstatic.com/firebasejs/11.5.0/firebase-firestore.js";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyA48GyK9yckhyauJDVEvdSYe2LBzYtIlVU",
  authDomain: "solution-challenge-455c0.firebaseapp.com",
  projectId: "solution-challenge-455c0",
  storageBucket: "solution-challenge-455c0.firebasestorage.app",
  messagingSenderId: "997273113825",
  appId: "1:997273113825:web:6dd3081684287ef11453a0",
  measurementId: "G-JQ0B75WT9C"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

function showMessage(message, divId){
    var messageDiv=document.getElementById(divId);
    messageDiv.style.display="block";
    messageDiv.innerHTML=message;
    messageDiv.style.opacity=1;
    setTimeout(function(){
        messageDiv.style.opacity=0;
    },5000);
 }

// Handle Sign Up Event
const signIn = document.getElementById('submitSignIn');
signIn.addEventListener('click', (event)=>{
    event.preventDefault();
    const email = document.getElementById('emailIn');
    const password = document.getElementById('passwordIn');
    const auth = getAuth();

    signInWithEmailAndPassword(auth, email.value, password.value) 
    .then((userCredential)=>{
        showMessage('Login is Successful', 'signInMessage');
        const user = userCredential.user;
        localStorage.setItem('loggedInUserId', user.uid);
        window.location.href = '/frontend/My Resources/Home2/Home2.html';
    })
    .catch((error)=>{
        const errorCode = error.code;
        if(errorCode === 'auth/invalid-credential'){
            showMessage('Incorrect Email or password', 'signInMessage');
        }
        else{
            showMessage('Account does not Exist', 'signInMessage');
        }
    })
})
