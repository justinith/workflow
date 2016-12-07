(function() {


    // GLOBAL VARIABLES
    var USER; // the current user
    var PROJECT_ID = 'project_1';
    
    var DB = firebase.database();

    authenticateUser();

    window.onload = function(){
        renderDateRow();
        initListeners();
    }

    function authenticateUser(){
        firebase.auth().onAuthStateChanged(function(currUser) {
            if (currUser) {
                // User is signed in.
                console.log(currUser);
                USER = currUser;
            } else {
                // No user is signed in.
                window.location.href = "signup.html";
            }
        });
    }

    function initListeners(){

        $("#signout").click(function(){
            firebase.auth().signOut().then(function() {
                console.log('Signed Out');
                window.location.href = "signin.html";
            }, function(error) {
                console.error('Sign Out Error', error);
            });
        });

        $('.dayBlock').click(function(){
            if(!$(this).hasClass('occupied')){
                attemptAddPhase($(this),'Testing Item',2);
            }
        });

        $(".addCategoryButton").click(function(){
            $('.buttonTitle').css('display','none');
            $('#newClassName').css('display','inherit');
            $('#newClassName').focus();
        });

        $("#newClassName").keyup(function(event){
            if(event.keyCode == 13){
                var val = $(this).val();
                renderNewClass(val);
            }
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

    function renderNewClass(className){

        // Add Class to firebase

        // Check if class already exists

        DB.ref('users/' + USER.uid + '/classes').once('value')
        .then(function(snapshot){
            var classes = snapshot.val();
            console.log(classes);
        });

        DB.ref('users/' + USER.uid + '/classes/' + className).set({
            occupiedDates: ['blank']
        })
        .then(function(){
            // Render class

            var blankLane = '<div class="categoryLane"><div class="row"><div class="col-sm-1 categoryName">' + className + '</div><div class="col-sm-1 dayBlock"></div><div class="col-sm-1 dayBlock"></div><div class="col-sm-1 dayBlock"></div><div class="col-sm-1 dayBlock"></div><div class="col-sm-1 dayBlock"></div><div class="col-sm-1 dayBlock"></div><div class="col-sm-1 dayBlock"></div><div class="col-sm-1 dayBlock"></div><div class="col-sm-1 dayBlock"></div><div class="col-sm-1 dayBlock"></div><div class="col-sm-1 nextWeekButton"><i class="fa fa-chevron-circle-right" aria-hidden="true"></i></div></div></div>';

            var dayMilli = new Date().getTime();
            
            var newLane = '<div class="categoryLane"><div class="row"><div class="col-sm-1 categoryName">' + className + '</div>';

            for(var i = 0; i <= 9; i++){
                dayFormatted = milliToDate(dayMilli);
                newLane += '<div class="col-sm-1 dayBlock" data-class="' + className + '" data-date="' + dayFormatted + '" data-dateMilli="'+ dayMilli + '"></div>';
                dayMilli += 86400000;
            }

            newLane += '<div class="col-sm-1 nextWeekButton"><i class="fa fa-chevron-circle-right" aria-hidden="true"></i></div></div></div>';

            $('#allClasses').append(newLane);

            $('.buttonTitle').css('display','inherit');
            $('#newClassName').css('display','none');
            $('#newClassName').val("");

            initListeners();
        });
    }

    // function checkAvailDays(className, milliSeconds,days){

    //     // Get all the dates they want to put stuff in
    //     // Check if those are available dates

    //     var occupiedDates;
    //     var isValid = true;
        
    //     DB.ref('users/' + USER.uid + '/' + className + '/occupiedDates').once('value')
    //     .then(function(snapshot){
    //         occupiedDates = snapshot.val();

    //         console.log(occupiedDates);

    //         for(var i = 0; i < days; i++){
    //             var formattedDate = milliToDate(milliSeconds);
    //             if(occupiedDates.includes(formattedDate)){
    //                 isValid = false;
    //             }
    //             milliSeconds += 86400000;
    //         }

    //         console.log(isValid);

    //         return isValid;

    //     });
    // }

    function milliToDate(milli){
        console.log(milli);
        return moment(milli).format('M' + '/' + 'D' + '/' + 'YYYY');
    }

    function attemptAddPhase(startingBlock,title,days){

        var occupiedDates;
        var isValid = true;

        var firstDateMilli = parseInt(startingBlock.attr('data-dateMilli'));
        var dateMilli = firstDateMilli;
        
        var phaseClass = startingBlock.attr('data-class');
        
        // Check if dates are available with firebase
        DB.ref('users/' + USER.uid + '/classes/' + phaseClass + '/occupiedDates').once('value')
        .then(function(snapshot){
            occupiedDates = snapshot.val();

            console.log(occupiedDates);

            var desiredDates = [];

            for(var i = 0; i < days; i++){
                var formattedDate = milliToDate(dateMilli);
                if(occupiedDates.includes(formattedDate)){
                    isValid = false;
                } else {
                    desiredDates.push(formattedDate);
                }
                dateMilli += 86400000;
            }

            // If the desired dates don't exist in the occupied dates
            if(isValid){
                
                var currentTime = new Date().getTime();
                var phaseID = title + "::" + parseInt(currentTime) + "::" + days;

                // Add phases to class
                DB.ref('users/' + USER.uid + '/classes/' + phaseClass + '/projects/' + PROJECT_ID + '/' + phaseID).set({
                    projectInfo:{
                        title: title.trim(),
                        duration: days,
                        dateMilli: firstDateMilli,
                        course: phaseClass,
                        createdOn: firebase.database.ServerValue.TIMESTAMP,
                        done: false
                    },
                    createdBy: {
                        uid: USER.uid,                    //the unique user id
                        displayName: USER.displayName,    //the user's display name
                        email: USER.email,                //the user's email address
                        photoUrl: null
                    },
                    projectTask: {}
                })
                // Add dates to occupied dates
                .then(function(){

                    var newOccupiedDates = occupiedDates.concat(desiredDates);

                    DB.ref('users/' + USER.uid + '/classes/' + phaseClass + '/occupiedDates').update(newOccupiedDates)
                    .then(function(){
                        renderNewPhase(startingBlock,title,days);
                    });                    
                });
            } else {
                alert('Invalid Number of Days');
            }
        });
    }

    function renderNewPhase(startingBlock,title,days){
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
    }

    function addBlock(text){
        var projectText = '<div class="projectHolder"><div class="dayContent"><div class="dayTitle">' + text + '</div></div></div>';

        return projectText;
    }

})();