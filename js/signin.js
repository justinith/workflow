"use strict";

var signUpForm = document.getElementById("signin-form");
var emailInput = document.getElementById("email-input");
var passwordInput = document.getElementById("password-input");

signUpForm.addEventListener("submit", function(evt) {
    evt.preventDefault();

  	if (passwordInput.value.length > 5) {
	    firebase.auth().signInWithEmailAndPassword(emailInput.value, passwordInput.value)
	        .then(function() {
	            window.location = "index.html";
	        })
	        .catch(function(err) {
	            alert(err.message);
	        });
	    return false;
	}
});