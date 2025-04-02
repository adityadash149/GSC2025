// Import the functions you need from the SDKs you need
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.5.0/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/11.5.0/firebase-analytics.js";
import {getAuth, createUserWithEmailAndPassword} from "https://www.gstatic.com/firebasejs/11.5.0/firebase-auth.js";
import {getFirestore, setDoc, doc} from "https://www.gstatic.com/firebasejs/11.5.0/firebase-firestore.js";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional

const firebaseConfig = {
    apiKey: "AIzaSyBs6fQahozg1g3N4wkqmoT7jIMi9W3CtE0",
    authDomain: "solution-challenge-d1861.firebaseapp.com",
    projectId: "solution-challenge-d1861",
    storageBucket: "solution-challenge-d1861.firebasestorage.app",
    messagingSenderId: "553795053154",
    appId: "1:553795053154:web:ca8f542ccdac758d18933b",
    measurementId: "G-HJT2T2D1FK"
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
const signUp = document.getElementById('submitSignUp');
signUp.addEventListener("click", (event)=>{
    event.preventDefault();
    const fname = document.getElementById('fname').value;
    const uname = document.getElementById('uname').value;
    const email = document.getElementById('emailup').value;
    const password = document.getElementById('passwordup').value;

    if (!email || !password || !fname || !uname) {
        showMessage('All the fields are required',"signUpMessage")
        return;
    }
    const auth = getAuth();
    const db = getFirestore();

    createUserWithEmailAndPassword(auth, email, password)
        .then((userCredential) => {
            const user = userCredential.user;
            const userData ={
                fname:fname,
                uname:uname,
                email:email
            };
            showMessage('Account Created Successfully', 'signUpMessage');
            const docRef = doc(db,"users",user.uid);
            setDoc(docRef,userData)
            window.location.href ='/frontend/Home/Login/Login.html';

        })
        .catch((error) => {
            const errorCode = error.code;
            if(errorCode == 'auth/email-already-in-use'){
                showMessage("Email Address already exists","signUpMessage");
            }
            else{
                showMessage("unable to create User", "signUpMessage");
            }
        });
});

