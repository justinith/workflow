"use strict";
$(document).ready(function(){
    $("[data-toggle=popover]").popover({
        html: true, 
        content: function() {
            return $('#popover-content').html();
        }
    })
    $(document.body).on('submit','#class-add-form',function (e) {
        e.preventDefault();
        var classToAdd = document.getElementById("class-name");
        alert('Form submitted');
        console.log("length", classToAdd.value.length);
    })
})

function myFunction() {
    var classAdd = document.getElementById("class-name");
       console.log(classAdd.value);
}
// var addClass = document.getElementById("class-add-form");
//         addClass.addEventListener("submit", function(){
//         var classToAdd = addClass.querySelector(".class-name");
//         console.log(classToAdd.value);
//         });
// });
