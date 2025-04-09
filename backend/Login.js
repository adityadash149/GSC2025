import { initializeApp } from "https://www.gstatic.com/firebasejs/11.5.0/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/11.5.0/firebase-analytics.js";
import {getAuth, signInWithEmailAndPassword} from "https://www.gstatic.com/firebasejs/11.5.0/firebase-auth.js";
import {getFirestore, setDoc, doc} from "https://www.gstatic.com/firebasejs/11.5.0/firebase-firestore.js";

const firebaseConfig = {
    apiKey: "AIzaSyBs6fQahozg1g3N4wkqmoT7jIMi9W3CtE0",
    authDomain: "solution-challenge-d1861.firebaseapp.com",
    projectId: "solution-challenge-d1861",
    storageBucket: "solution-challenge-d1861.firebasestorage.app",
    messagingSenderId: "553795053154",
    appId: "1:553795053154:web:ca8f542ccdac758d18933b",
    measurementId: "G-HJT2T2D1FK"
};

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
