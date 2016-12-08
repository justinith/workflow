(function() {

    // GLOBAL VARIABLES
    var USER; // the current user
    var PROJECT_ID = 'project_1';    
    var DB = firebase.database();
    var DAYS_AHEAD = 7;

    authenticateUser();

    window.onload = function(){
        renderDateRow();
        initListeners();
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

        $(".addCategoryButton").click(function(){
            $('.buttonTitle').css('display','none');
            $('#newClassName').css('display','inherit');
            $('#newClassName').focus();
        });

        $("#newClassName").keyup(function(event){
            if(event.keyCode == 13){
                var val = $(this).val();
                attemptNewClass(val);
            }
        });

        $("#nextWeekBut").click(function(){
            DAYS_AHEAD++;
            clearCal();
            renderDateRow();
            renderUserPlanner();
        });

        $("#prevWeekBut").click(function(){
            DAYS_AHEAD--;
            clearCal();
            renderDateRow();
            renderUserPlanner();
        });
    }

    // ============================================
    // ==                                        ==
    // ==        Page Start Functions            ==
    // ==                                        ==
    // ============================================

    function authenticateUser(){
        firebase.auth().onAuthStateChanged(function(currUser) {
            if (currUser) {
                // User is signed in.
                USER = currUser;
                renderUserPlanner();
            } else {
                // No user is signed in.
                window.location.href = "signup.html";
            }
        });
    }
    
    function renderDateRow(){

        var dayMilli = new Date().getTime();
        
        if(DAYS_AHEAD > 0){
            dayMilli = dayMilli + (86400000 * DAYS_AHEAD);
        } else if(DAYS_AHEAD < 0){
            dayMilli = dayMilli - (86400000 * DAYS_AHEAD);
        }
        
        var currentDayFormatted = moment(dayMilli).format('M' + '/' + 'D' + '<br>' + 'dd');

        var start = '<div class="row"><div class="col-sm-offset-1 col-sm-1">' + currentDayFormatted + '</div>';

        for(var i = 0; i <= 9; i++){
            dayMilli += 86400000;
            dayFormatted = moment(dayMilli).format('M' + '/' + 'D' + '<br>' + 'dd');
            start += '<div class="col-sm-1">' + dayFormatted + '</div>'
        }

        start += '</div>';

        $('#dateDayRow').append(start);
    }

    // Renders all saved classes and phases of user
    function renderUserPlanner(){

        var allClasses;

        DB.ref('users/' + USER.uid + '/classes').once('value')
        .then(function(snapshot){
            allClasses = snapshot.val();

            console.log("ALL CLASSES");
            console.log(allClasses);

            // For each class, render the phases
            for(var className in allClasses){
                // Create the lane
                renderClassRow(className);

                // Check if the lane has projects
                if('projects' in allClasses[className]){
                    var allPhases = allClasses[className].projects.project_1;

                    // Get the phases
                    // find which phases have dates within the current 10-day range
                    // render those phases into the current 10-day range

                    for(var phaseID in allPhases){

                        var phaseInfo = allPhases[phaseID].projectInfo;

                        console.log(allPhases[phaseID]);
                        // find the div on the screen that matches
                        var phaseStartDate = milliToDate(phaseInfo.startDateMilli);
                        var jquerySelector = formattedDateDivID(className,phaseStartDate);
                        var targetDayBlock = $("#" + jquerySelector);

                        console.log(targetDayBlock);
                        renderNewPhase(targetDayBlock,phaseInfo.title,phaseInfo.duration);
                    }
                }
            }
        });
    }

    // ============================================
    // ==                                        ==
    // ==            Class Functions             ==
    // ==                                        ==
    // ============================================

    function attemptNewClass(className){       

        // Check if user has made classes yet
        DB.ref('users').once('value')
        .then(function(snapshot){
            var users = snapshot.val();
            if(USER.uid in users){

                var classes = Object.keys(users[USER.uid].classes);

                // Check if class already exists                
                if(classes.includes(className)){
                    alert('You already have a class with that name! Please use a different name.');
                } else {
                    DB.ref('users/' + USER.uid + '/classes/' + className).set({
                        occupiedDates: ['blank']
                    })
                    .then(function(){
                        // Render class
                        renderClassRow(className);
                    });
                }
                
            
            // Add user's first class to DB
            } else {
                DB.ref('users/' + USER.uid + '/classes/' + className).set({
                    occupiedDates: ['blank']
                })
                .then(function(){
                    // Render class
                    renderClassRow(className);
                });
            }
        });
    }

    function renderClassRow(className){
        var blankLane = '<div class="categoryLane"><div class="row"><div class="col-sm-1 categoryName">' + className + '</div><div class="col-sm-1 dayBlock"></div><div class="col-sm-1 dayBlock"></div><div class="col-sm-1 dayBlock"></div><div class="col-sm-1 dayBlock"></div><div class="col-sm-1 dayBlock"></div><div class="col-sm-1 dayBlock"></div><div class="col-sm-1 dayBlock"></div><div class="col-sm-1 dayBlock"></div><div class="col-sm-1 dayBlock"></div><div class="col-sm-1 dayBlock"></div><div class="col-sm-1 nextWeekButton"><i class="fa fa-chevron-circle-right" aria-hidden="true"></i></div></div></div>';

        var dayMilli = new Date().getTime();

        if(DAYS_AHEAD > 0){
            dayMilli = dayMilli + (86400000 * DAYS_AHEAD);
        } else if(DAYS_AHEAD < 0){
            dayMilli = dayMilli - (86400000 * DAYS_AHEAD);
        }
        
        var newLane = '<div class="categoryLane"><div class="row"><div class="col-sm-1 categoryName">' + className + '</div>';

        for(var i = 0; i <= 10; i++){
            dayFormatted = milliToDate(dayMilli);
            newLane += '<div id="' + formattedDateDivID(className,dayFormatted) + '" class="col-sm-1 dayBlock" data-class="' + className + '" data-date="' + dayFormatted + '" data-dateMilli="'+ dayMilli + '"></div>';
            dayMilli += 86400000;
        }

        newLane += '</div></div>';

        $('#allClasses').append(newLane);

        $('.buttonTitle').css('display','inherit');
        $('#newClassName').css('display','none');
        $('#newClassName').val("");

        removeDayBlockListeners();
        addDayBlockListeners();
    }

    // ============================================
    // ==                                        ==
    // ==            Phase Functions             ==
    // ==                                        ==
    // ============================================

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
                        startDateMilli: firstDateMilli,
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
                // Add dates to occupied dates in DB
                .then(function(){

                    var newOccupiedDates = occupiedDates.concat(desiredDates);

                    DB.ref('users/' + USER.uid + '/classes/' + phaseClass + '/occupiedDates').update(newOccupiedDates)
                    // Render phase into UI
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
        
        // if task spans one day
       
        for(var i = 0; i < days; i++){

            console.log('new phase adding')

            // If this is the first day
            if(i == 0){
                startingBlock.append(newBlock);
            } else {
                startingBlock.append(blankBlock);
            }

            startingBlock.addClass('occupied');
            startingBlock.removeClass('dayBlock');
            startingBlock.popover('destroy');

            if(i + 1 == days){
                startingBlock.css('border-right','white 1px solid')
            }

            startingBlock = startingBlock.next('.col-sm-1');
        }   
    }

    function addDayBlockListeners(){
        $('.dayBlock').popover({
            placement: 'bottom',
            title: 'Add Project',
            html:true,
            content:  $('#addPhasePopup').html()
        }).on('click', function (e) {

            var targetDayBlock = $(this);

            $('.dayBlock').not(this).popover('hide');
            $('#phase-submit').on('click',function(){
                
                // Handle phase detail submission

                var projectName = $('#project-name').val();
                var projectDuration = $('#project-duration').val();
                var projectDescr = $('#about').val();

                if(projectName.length > 0 && projectDuration.length > 0){
                    attemptAddPhase(targetDayBlock,projectName,projectDuration);
                }else{
                    alert("Project Name and Duration (Days) are required");
                }

                $('.dayBlock').popover('hide');
            });
        }).on('hide.bs.popover',function(){
            $('#phase-submit').off('click');
        });
    }

    // ============================================
    // ==                                        ==
    // ==        Micro Helper Functions          ==
    // ==                                        ==
    // ============================================

    function milliToDate(milli){
        return moment(milli).format('M' + '/' + 'D' + '/' + 'YYYY');
    }

    function formattedDateDivID(className,day){
        return className.replace(' ','lol') + "lol" + day.replace('/','bb').replace('/','bb');
    }

    function addBlock(text){
        var projectText = '<div class="projectHolder"><div class="dayContent"><div class="dayTitle">' + text + '</div></div></div>';

        return projectText;
    }

    function removeDayBlockListeners(){
        // $('.dayBlock').off('click');

        $('.dayBlock').popover('destroy');
    }

    function clearCal(){
        $('#dateDayRow').html("");
        $('#allClasses').html("");
    }
    

})();