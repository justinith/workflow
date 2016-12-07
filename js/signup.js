"use strict";

var signUpForm = document.getElementById("signup-form");
var emailInput = document.getElementById("email-input");
var passwordInput = document.getElementById("password-input");
var reenterPasswordInput = document.getElementById("reenter-password-input");
var displayNameInput = document.getElementById("display-name-input");

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
        .catch(function(err) {
            alert(err.message);
        });
    return false;
	}
});