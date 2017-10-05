"use strict";

var signUpForm = document.getElementById("signup-form");
var emailInput = document.getElementById("email-input");
var passwordInput = document.getElementById("password-input");
var reenterPasswordInput = document.getElementById("reenter-password-input");
var displayNameInput = document.getElementById("display-name-input");
var screenSize = setInitialScreenSize();

authenticateUser();

var videoWidth = window.innerWidth - 30;
if(videoWidth > 560){
    videoWidth = 560;
}
document.getElementById('howtovideo').setAttribute('width', videoWidth);

mixpanel.track('Page Load',{'page':'landing','screenSize': screenSize});

signUpForm.addEventListener("submit", function(evt) {
    evt.preventDefault();

    document.getElementById('signupbutton').innerHTML = '<i class="fa fa-spinner fa-spin fa-fw"></i> Sign Up';

    if (displayNameInput.value != "") { 
    	firebase.auth().createUserWithEmailAndPassword(emailInput.value, passwordInput.value).then(function() {
            
            
        }).catch(function(err) {
            alert(err.message);
        });
    return false;
	}
});

function authenticateUser(){
    firebase.auth().onAuthStateChanged(function(currUser) {
        if (currUser) {
            if(currUser.displayName == null){
                mixpanel.identify(currUser.uid);
                mixpanel.people.set({
                    "$email": emailInput.value, 
                    "$name": displayNameInput.value,
                    "$created": new Date(),
                    "$last_login": new Date(),        
                },function(){
                    mixpanel.track('New Account Created',{'uid':currUser.uid,'name':displayNameInput.value,'email':emailInput.value}, function(){
                        currUser.updateProfile({
                            displayName: displayNameInput.value,
                        }).then(function() {
                            window.location = "index.html";
                        }).catch(function(err) {
                            alert(err.message);
                        });
                    });                
                });
                // currUser.updateProfile({
                //     displayName: displayNameInput.value
                // }).then(function(){
                //     window.location.href = "index.html";
                // });
            } else {
                // User is signed in.
                window.location.href = "index.html";
            }
        }
    });
}