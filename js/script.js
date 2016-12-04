"use strict";
(function() {
    window.onload = function(){
        renderDateRow();
        initListeners();
    }

    function initListeners(){
        $('.dayBlock').click(function(){
            if(!$(this).hasClass('occupied')){
                attemptAddPhase($(this),'Testing Item',2);
            }
            
        });

        $("[data-toggle=popover]").popover({
        html: true, 
        content: function() {
            return $('#popover-content').html();
        }
    });
    $(document.body).on('submit','#class-add-form',function (e) {
        e.preventDefault();
        var classToAdd = document.getElementById("class-name");
        alert('Form submitted');
        console.log("length", classToAdd.value.length);
    });
    }

    function renderDateRow(){

        var dayMilli = new Date().getTime();

        var currentDayFormatted = moment(dayMilli).format('M' + '/' + 'D' + '<br>' + 'dd');

        var start = '<div class="row"><div class="col-sm-offset-1 col-sm-1">' + currentDayFormatted + '</div>';

        for(var i = 0; i <= 8; i++){
            dayMilli += 86400000;
            dayFormatted = moment(dayMilli).format('M' + '/' + 'D' + '<br>' + 'dd');
            start += '<div class="col-sm-1">' + dayFormatted + '</div>'
        }

        start += '</div>';

        $('#dateDayRow').append(start);
    }

    function checkAvailDays(startingBlock,days){
        var isValid = true;
        
        for(var i = 1; i < days; i++){
            if(!startingBlock.next('.col-sm-1').hasClass('occupied')){
                startingBlock = startingBlock.next('.col-sm-1');
            } else {
                isValid = false;
            }
        }

        return isValid;
    }

    function attemptAddPhase(startingBlock,title,days){
        // Check if there are available days
        if(checkAvailDays(startingBlock,days)){
            var newBlock = addBlock(title);
            var blankBlock = addBlock("<br>");

            // Populate the first block
            startingBlock.append(newBlock);
            startingBlock.addClass('occupied');
            startingBlock.removeClass('dayBlock');

            // if task spans one day
            if(days > 1){
                for(var i = 1; i < days; i++){
                    // if the next day has the dayBlock class
                    if(startingBlock.next('.col-sm-1').hasClass('dayBlock')){
                        startingBlock.next('.col-sm-1').append(blankBlock);

                        if(i + 1 == days){
                            startingBlock.next('.col-sm-1').css('border-right','white 1px solid')
                        }

                        startingBlock = startingBlock.next('.col-sm-1');
                        startingBlock.addClass('occupied');
                        startingBlock.removeClass('dayBlock');
                    }
                }
            }
        } else {
            alert('Invalid Number of Days');
        }
    }

    function addBlock(text){
        var projectText = '<div class="projectHolder"><div class="dayContent"><div class="dayTitle">' + text + '</div></div></div>';

        return projectText;
    }

})();
=======
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
>>>>>>> origin/fyang-branch
