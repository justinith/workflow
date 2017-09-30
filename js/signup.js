"use strict";

var signUpForm = document.getElementById("signup-form");
var emailInput = document.getElementById("email-input");
var passwordInput = document.getElementById("password-input");
var reenterPasswordInput = document.getElementById("reenter-password-input");
var displayNameInput = document.getElementById("display-name-input");
var screenSize = setInitialScreenSize();

authenticateUser();

mixpanel.track('Page Load',{'page':'landing','screenSize': screenSize});

signUpForm.addEventListener("submit", function(evt) {
    evt.preventDefault();

    if (displayNameInput.value != "") { 
    	firebase.auth().createUserWithEmailAndPassword(emailInput.value, passwordInput.value)
        .then(function(user) {
            console.log(user);
            mixpanel.identify(user.uid);
            mixpanel.people.set({
                "$email": emailInput.value, 
                "$name": displayNameInput.value,
                "$created": new Date(),
                "$last_login": new Date(),        
            });
            mixpanel.track('New Account Created',{'uid':user.uid,'name':displayNameInput.value,'email':emailInput.value});
            return user.updateProfile({
                displayName: displayNameInput.value,
            });
        })
        .then(function() {
            window.location = "index.html";
        })
        .catch(function(err) {
            alert(err.message);
        });
    return false;
	}
});

function authenticateUser(){
    firebase.auth().onAuthStateChanged(function(currUser) {
        if (currUser) {
            // User is signed in.
            window.location.href = "index.html";
        }
    });
}