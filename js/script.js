(function() {

    // GLOBAL VARIABLES
    var USER; // the current user
    var PROJECT_ID = 'project_1';    
    var DB = firebase.database();
    var DAYS_AHEAD = 0;
    var DATES_SHOWN = [];
    var USER_CLASSES;
    var SCREEN_SIZE = 'l';

    authenticateUser();

    window.onload = function(){
        renderDateRow();
        initListeners();
    }

    function initListeners(){

        // Logs user out when the user clicks "Sign Out" button
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
                var val = $(this).val().toUpperCase();
                attemptNewClass(val);
            }
        });
        $("#addClassInputTop").keyup(function(event){
            if(event.keyCode == 13){
                var val = $(this).val().toUpperCase();
                attemptNewClass(val);
                $("#triggerAddClassTop").css('display','inherit');
                $("#addClassInputTop").val("");
                $('.addClassArea').css('display','none');
            }
        });

        $("#nextDayBut").click(function(){
            shiftDaysX(1,'next');
        });

        $("#prevDayBut").click(function(){
            shiftDaysX(1,'prev');
        });

        $("#nextWeekBut").click(function(){
            shiftDaysX(7,'next');
        });

        $("#prevWeekBut").click(function(){
            shiftDaysX(7,'prev');
        });

        $("#showTodayBut").click(function(){
            if(DAYS_AHEAD < 0){
                shiftDaysX(Math.abs(DAYS_AHEAD),'next');
            } else if(DAYS_AHEAD > 0) {
                shiftDaysX(DAYS_AHEAD,'prev');
            }
        });

        $('#triggerAddClassTop').click(function(){
            $("#triggerAddClassTop").css('display','none');
            $('.addClassArea').css('display','inherit');
            $('#addClassInputTop').focus();
        });

        $('#addClassButtonTop').click(function(){
            var val = $('#addClassInputTop').val();
            attemptNewClass(val);
            $("#triggerAddClassTop").css('display','inherit');
            $("#addClassInputTop").val("");
            $('.addClassArea').css('display','none');
        });

        $(window).resize(function(){
            resizeScreen();
        });
        

        document.onkeydown = checkKey;
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
                fetchUserClasses();
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
            dayMilli = dayMilli - (86400000 * Math.abs(DAYS_AHEAD));
        }
        
        var currentDayFormatted = moment(dayMilli).format('M' + '/' + 'D' + '<br>' + 'dd');
        DATES_SHOWN.push(milliToDate(dayMilli));

        
        var dateColCount = getPageCol('total');
        var btCol = getPageCol('btcol');
        
        var start = '<div class="row">';

        for(var i = 0; i < dateColCount; i++){
            
            currentDayFormatted = moment(dayMilli).format('M' + '/' + 'D' + '<br>' + 'dd');
            DATES_SHOWN.push(milliToDate(dayMilli));
            start += '<div class="col-xs-' + btCol + '">' + currentDayFormatted + '</div>';
            dayMilli += 86400000;
        }

        start += '</div>';

        $('#dateDayRow').append(start);
    }

    // Renders all saved classes and phases of user
    function fetchUserClasses(){
        DB.ref('users/' + USER.uid + '/classes').once('value')
        .then(function(snapshot){
            USER_CLASSES = snapshot.val();
            renderUserData(USER_CLASSES);
        });
    }

    function renderUserData(allClasses){
        for(var className in allClasses){
            // Create the lane
            renderClassRow(className);

            // Check if the lane has projects
            if('projects' in allClasses[className]){
                var allPhases = allClasses[className].projects.project_1;

                // Get the phases of the project
                // find which phases have dates within the current 10-day range
                // render those phases into the current 10-day range
                for(var phaseID in allPhases){

                    var phaseInfo = allPhases[phaseID].projectInfo;
                    var phaseStartDate = milliToDate(phaseInfo.startDateMilli);
                    var allDatesInPhase = [];
                    var earliestDateShown = DATES_SHOWN[0];

                    // check if first date in phase exists in the dates shown
                    if(DATES_SHOWN.includes(phaseStartDate)){
                        var jquerySelector = formattedDateDivID(className,phaseStartDate);
                        var targetDayBlock = $("#" + jquerySelector);

                        renderNewPhase(targetDayBlock,phaseInfo,phaseInfo.duration);
                    // If it doesn't, render the partial view of the phase
                    } else {
                        var phaseDateMilli = phaseInfo.startDateMilli;
                        for(var i = 0; i < phaseInfo.duration; i++){
                            allDatesInPhase.push(milliToDate(phaseDateMilli));
                            phaseDateMilli += 86400000;
                        }

                        for(var i = 0; i < allDatesInPhase.length; i++){
                            if(allDatesInPhase[i] == earliestDateShown){
                                var amountOfDays = allDatesInPhase.length - i;
                                var newStartDateMilli = phaseInfo.startDateMilli;

                                // get start date in milli format
                                for(var j = 0; j < i; j++){
                                    newStartDateMilli += 86400000;
                                }

                                newStartDateMilli = milliToDate(newStartDateMilli);

                                var jquerySelector = formattedDateDivID(className,newStartDateMilli);
                                var targetDayBlock = $("#" + jquerySelector);

                                renderNewPhase(targetDayBlock,phaseInfo,amountOfDays);
                            }
                        }
                    }
                }
            }
        }
    }

    // ============================================
    // ==                                        ==
    // ==            Class Functions             ==
    // ==                                        ==
    // ============================================

    function attemptNewClass(className){       

        // Check if class name is empty
        if(className == ""){
            alert('Please write name');
        // Check if value has any bad characters
        } else {
            // Check if user has made classes yet
            DB.ref('users').once('value')
            .then(function(snapshot){
                var users = snapshot.val();

                // If user has classes
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
        
    }

    function renderClassRow(className){
        var dateColCount = getPageCol('total');
        var btCol = getPageCol('btcol');

        var dayMilli = new Date().getTime();

        if(DAYS_AHEAD > 0){
            dayMilli = dayMilli + (86400000 * DAYS_AHEAD);
        } else if(DAYS_AHEAD < 0){
            dayMilli = dayMilli - (86400000 * Math.abs(DAYS_AHEAD));
        }
        
        var newLane = '<div class="categoryLane" id="' + className + '"><div class="laneInfo"><p>' + className + '</p></div><div class="row">';

        for(var i = 1; i <= dateColCount; i++){
            dayFormatted = milliToDate(dayMilli);
            newLane += '<div id="' + formattedDateDivID(className,dayFormatted) + '" class="col-xs-' + btCol + ' dayBlock" data-class="' + className + '" data-date="' + dayFormatted + '" data-dateMilli="'+ dayMilli + '"></div>';
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

    function attemptAddPhase(startingBlock,title,days,desc,group){

        var occupiedDates;
        var isValid = true;
        var result = {};
        var firstDateMilli = parseInt(startingBlock.attr('data-dateMilli'));
        var dateMilli = firstDateMilli;
        var phaseClass = startingBlock.attr('data-class');
        // Check if dates are available with firebase
        DB.ref('users/' + USER.uid + '/classes/' + phaseClass + '/occupiedDates').once('value')
        .then(function(snapshot){
            var desiredDates = [];
            occupiedDates = snapshot.val();
            result = checkDayAval(days,dateMilli,desiredDates,occupiedDates,isValid);
            isValid = result.c;
            // If the desired dates don't exist in the occupied dates
            if(isValid){
                desiredDates = result.a;
                var currentTime = new Date().getTime();
                var phaseID = title + "::" + parseInt(currentTime) + "::" + days;
                var groupArray = group.split(";");
                
                // Add phases to class
                DB.ref('users/' + USER.uid + '/classes/' + phaseClass + '/projects/' + PROJECT_ID + '/' + phaseID).set({
                    projectInfo:{
                        title: title.trim(),
                        duration: days,
                        description: desc,
                        startDateMilli: firstDateMilli,
                        course: phaseClass,
                        createdOn: firebase.database.ServerValue.TIMESTAMP,
                        groupMember: groupArray,
                        done: false,
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
                        clearCal();
                        renderDateRow();
                        fetchUserClasses();
                    });                    
                });
            } else {
                alert('Invalid Number of Days');
            }
        })
    }

    function renderNewPhase(startingBlock,title,days,desc){
        var newBlock = addBlock(title,title.title);
        var blankBlock = addBlock("<br>", title.title);
        var btCol = getPageCol('btcol');
        
        // if task spans one day
       
        for(var i = 0; i < days; i++){

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

            startingBlock = startingBlock.next('.col-xs-' + btCol);
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
                var projectDuration = parseInt($('#project-duration').val());
                var projectDescr = $('#phaseDescription').val();
                var projectGroup = $('#phaseGroup').val();

                console.log(projectDuration);

                if(projectName.length > 0){
                    if(projectDuration != NaN){
                        console.log('attempting to add class');
                        attemptAddPhase(targetDayBlock,projectName,projectDuration,projectDescr,projectGroup);
                    } else {
                        alert('Duration must be an integer - ie: 2,16,etc');
                    }
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
    // ==     Resize / Re-Render Functions       ==
    // ==                                        ==
    // ============================================

    // Checks the width of the window and rerenders the page if 
    // the width is in a different size category than current one 
    function resizeScreen(){
        var screenWidth = window.innerWidth;
        // set as large but screen is smaller
        if(SCREEN_SIZE == 'l' && screenWidth < 1300 && screenWidth > 900){
            reRenderPage('localReset');
            SCREEN_SIZE = 'm';
        // set as medium but screen is smaller
        } else if(SCREEN_SIZE == 'm' && screenWidth <= 900){
            reRenderPage('localReset');
            SCREEN_SIZE = 's';
        // set as small but screen is medium
        } else if(SCREEN_SIZE == 's' && screenWidth > 900 && screenWidth < 1300){
            reRenderPage('localReset');
            SCREEN_SIZE = 'm';
        // set as medium but screen is large
        } else if(SCREEN_SIZE == 'm' && screenWidth >= 1300){
            reRenderPage('localReset');
            SCREEN_SIZE = 'l';
        }
    }

    // Input:  Accepts the type of column length needed, either 
    //         'total' (the total columns in the page) or
    //         'btcol' (the width of each bootstrap column) 
    // Output: Returns the number value of either the total columns
    //         of the page, or the width of bootstrap columns
    function getPageCol(type){
        var pageWidth = window.innerWidth;
        if(pageWidth < 1300 && pageWidth > 900){
            if(type == 'total'){
                return 6;
            } else if(type == 'btcol'){
                return "2";
            }
        } else if(pageWidth <= 900 && pageWidth){
            if(type == 'total'){
                return 3;
            } else if(type == 'btcol'){
                return "4";
            }
        } else {
            if(type == 'total'){
                return 12;
            } else if(type == 'btcol'){
                return "1";
            }
        }
    }

    // Input:  Accepts the type of page reset 
    // Output: Resets the page by either re-fetching the user data from
    //         firebase or by using the stored data locally
    function reRenderPage(type){
        clearCal();
        renderDateRow();
        if(type == 'fetchReset'){
            fetchUserClasses();
        } else if(type == 'localReset'){
            renderUserData(USER_CLASSES);
        }
    }

        // // Populate the first block
        // startingBlock.append(newBlock);
        // startingBlock.addClass('occupied');
        // startingBlock.removeClass('freeDay');
        // startingBlock.removeClass('dayBlock');

        // // if task spans one day
        // if(days > 1){
        //     console.log('more than 1 day');
        //     for(var i = 1; i < days; i++){
        //         console.log('iteration ' + i);

        //         startingBlock.next('.col-sm-1').append(blankBlock);

        //         if(i + 1 == days){
        //             startingBlock.next('.col-sm-1').css('border-right','white 1px solid')
        //         }

        //         startingBlock = startingBlock.next('.col-sm-1');
        //         startingBlock.addClass('occupied');
        //         startingBlock.removeClass('dayBlock');
        //         // if(startingBlock.next('.col-sm-1').hasClass('dayBlock')){
                    
        //         // }
        //     }
        // }

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

    function addBlock(text,desc){
        if(text != "<br>"){
            console.log(text.groupMember[0].length);
            textDescr = (text.description.length > 0 ? text.description : "N/A");
            textGroup = (text.groupMember[0].length > 1 ? text.groupMember : "N/A");
            text = text.title;
        }
        var projectText = '<div class="projectHolder" data-description="' + desc + '"><div class="dayContent" placement="top" data-toggle="tooltip" title="<div><h4>'+desc+'</h4><br><p>Descr: <br>'+ textDescr +'</p><br><p>Group: <br>'+textGroup+'</p></div>" data-html="true"><div class="dayTitle">' + text + '</div></div></div>';
        $('div[data-toggle=tooltip]').tooltip('destroy');
        $('div[data-toggle=tooltip]').tooltip();
        return projectText;
    }

    function removeDayBlockListeners(){
        $('.dayBlock').popover('destroy');
    }

    function clearCal(){
        $('#dateDayRow').html("");
        $('#allClasses').html("");
        DATES_SHOWN = [];
    }

    function shiftDaysX(amount,direction){
        if(direction == 'next'){
            DAYS_AHEAD += amount;
        } else {
            DAYS_AHEAD -= amount;
        }

        if(USER_CLASSES == null){
            reRenderPage('fetchReset');
        } else {
            reRenderPage('localReset');
        }
    }
    
    function checkKey(e) {
        e = e || window.event;
        if (e.keyCode == '37') {
            shiftDaysX(1,'prev');
        }
        else if (e.keyCode == '39') {
            shiftDaysX(1,'next');
        }
    }

    function getPageCol(type){
        var pageWidth = window.innerWidth;
        if(pageWidth < 1300 && pageWidth > 900){
            if(type == 'total'){
                return 6;
            } else if(type == 'btcol'){
                return "2";
            }
        } else if(pageWidth <= 900 && pageWidth){
            if(type == 'total'){
                return 3;
            } else if(type == 'btcol'){
                return "4";
            }
        } else {
            if(type == 'total'){
                return 12;
            } else if(type == 'btcol'){
                return "1";
            }
        }
    }
    
    function checkDayAval(day,dateMill,desiredDate,occupiedDate){
        console.log(day,dateMill,desiredDate,occupiedDate);
        var valid = true;
        for(var i = 0; i < day; i++){
            var formattedDate = milliToDate(dateMill);
            if(occupiedDate.includes(formattedDate)){
                valid =  false;
            } else {
                desiredDate.push(formattedDate);
            }
            dateMill += 86400000;
        }
        var finalRes = new Object();
        finalRes = {a: desiredDate, c: valid};
        console.log(finalRes);
        return finalRes;
    }
    function attemptAddGroup(){
        if(findGroupMember){
            var groupResult = checkDayAval(days,dateMilli,desiredDates,occupiedDates);
            var dayAval = groupResult.c;
            if(dayAval){}
        }
    }
})();
