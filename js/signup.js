"use strict";

var signUpForm = document.getElementById("signup-form");
var emailInput = document.getElementById("email-input");
var passwordInput = document.getElementById("password-input");
var reenterPasswordInput = document.getElementById("reenter-password-input");
var displayNameInput = document.getElementById("display-name-input");
var DB = firebase.database();

authenticateUser();

signUpForm.addEventListener("submit", function(evt) {
    evt.preventDefault();


if (displayNameInput.value != "" && passwordInput.value == reenterPasswordInput.value) { 
    	firebase.auth().createUserWithEmailAndPassword(emailInput.value, passwordInput.value)
        .then(function(user) {
            return user.updateProfile({
                displayName: displayNameInput.value,
            });
        })
        .then(function() {
            window.location = "index.html";
        })
        .then(function(){
            var user = firebase.auth().currentUser;
            DB.ref('users/' + user.uid + '/userInfo').set({
                UserInfo :{
                    userEmail: user.email,
                    userDisplayName: displayNameInput.value
                }
            })
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
            // window.location.href = "index.html";
        }
    });
}