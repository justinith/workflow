"use strict"

var config = {
    apiKey: "AIzaSyDkBifE9dCgqzn4ivf5uD7RXSwfN99Na_o",
    authDomain: "workflow-462a4.firebaseapp.com",
    databaseURL: "https://workflow-462a4.firebaseio.com",
    storageBucket: "workflow-462a4.appspot.com",
    messagingSenderId: "889877406021"
};

firebase.initializeApp(config);

function setInitialScreenSize(){
    var screenWidth = window.innerWidth;
    // set as large but screen is smaller
    if(screenWidth <= 800){
        return 's';
    // set as small but screen is medium
    } else if(screenWidth > 800 && screenWidth < 1300){
        return 'm';
    // set as medium but screen is large
    } else if(screenWidth >= 1300){
        return 'l';
    }
}