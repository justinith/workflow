(function() {

    // GLOBAL VARIABLES
    var USER; // the current user
    var PROJECT_ID = 'project_1';    
    var DB = firebase.database();
    var DAYS_AHEAD = 0;
    var DATES_SHOWN = [];
    var USER_CLASSES = null;
    var CLASS_ORDER;
    var SCREEN_SIZE = setInitialScreenSize();
    var CURRENT_TODO_LIST_DATE = milliToDate(new Date().getTime());
    var NEW_CLASS_ADDED = false;

    authenticateUser();

    window.onload = function(){
        renderDateRow();
        initListeners();
    }

    function initListeners(){

        $("#signout").click(function(){
            mixpanel.track('User Sign Out',{'uid':USER.uid});
            firebase.auth().signOut().then(function() {
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

        $('#addClassButtonModal').click(function(){
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
        mixpanel.track('Page Load',{'page':'dashboard','screenSize':SCREEN_SIZE});
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
                mixpanel.identify(USER.uid);
                $('#userFirstName').html(USER.displayName);
                fetchUserClasses();
            } else {
                // No user is signed in.
                window.location.href = "signup.html";
            }
        });
    }
    
    // Renders the calender row of dates & days
    function renderDateRow(){
        
        // Gets the current times
        var theCurrentTime = new Date().getTime();
        var dayMilli = new Date().getTime();

        // goal: change current time to the monday of the current week
        
        // Adjusts the day based on the number of days ahead or behind the current view is
        if(DAYS_AHEAD > 0){
            dayMilli = dayMilli + (86400000 * DAYS_AHEAD);
        } else if(DAYS_AHEAD < 0){
            dayMilli = dayMilli - (86400000 * Math.abs(DAYS_AHEAD));
        }
        
        var currentDayFormatted = moment(dayMilli).format('M' + '/' + 'D' + '<br>' + 'dd');
        DATES_SHOWN.push(milliToDate(dayMilli));
        
        var dateColCount = getPageCol('total');
        var btCol = getPageCol('btcol');

        // If the page is mobile on initial start, hide to do list sidebar
        if(btCol == '4'){
            hideToDoList();
        }
        
        var start = '<div class="row">';

        for(var i = 0; i < dateColCount; i++){
            currentDayFormatted = moment(dayMilli).format('M' + '/' + 'D');
            var dayOfWeek = moment(dayMilli).format('ddd');
            var completeDate = milliToDate(dayMilli);
            DATES_SHOWN.push(milliToDate(dayMilli));

            start += '<div data-completeDate="' + completeDate + '" class="specificDateButton col-xs-' + btCol;
            if(dayOfWeek == 'Sun' | dayOfWeek == 'Sat'){
                start += ' weekendDay';
            // Check if this date is the current day
            } else if(milliToDate(theCurrentTime) == milliToDate(dayMilli)){
                start += ' todaysDate';
            }
            start += '"><span class="numDayFormat">' + currentDayFormatted + '</span><br>' + dayOfWeek + '</div>';
            dayMilli += 86400000;
        }

        start += '</div>';

        $('#dateDayRow').append(start);
        $('.specificDateButton').click(function(){
            CURRENT_TODO_LIST_DATE = $(this).attr('data-completedate');
            populateToDoList($(this).attr('data-completedate'),true);
        });
    }

    // Fetches the user's classes from Firebase
    function fetchUserClasses(){
        DB.ref('users/' + USER.uid).once('value')
        .then(function(snapshot){
            var userInfo = snapshot.val();
            if(userInfo != null){
                CLASS_ORDER = userInfo.format['classOrder'];
                USER_CLASSES = userInfo.classes;
                renderUserData(USER_CLASSES,CLASS_ORDER);
                populateToDoList(CURRENT_TODO_LIST_DATE,true);
            }
        });
    }

    // Input: Accepts object of user's classes 
    // Renders all saved classes and phases of the user
    function renderUserData(allClasses,classOrder){
        // Goes through each class and creates a lane

        for(var classIndex = 0; classIndex < classOrder.length; classIndex++){
            var className = classOrder[classIndex];

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
                    var earliestDateShown = DATES_SHOWN[0];

                    // check if first date in phase exists in the dates shown
                    if(DATES_SHOWN.includes(phaseStartDate)){
                        var jquerySelector = formattedDateDivID(className,phaseStartDate);
                        var targetDayBlock = $("#" + jquerySelector);

                        renderNewPhase(targetDayBlock,phaseInfo.title,phaseInfo.duration,phaseInfo.description,phaseID,phaseInfo.projectType);
                    // If it doesn't, render the partial view of the phase
                    } else {
                        var allDatesInPhase = getAllDatesInPhase(phaseInfo.startDateMilli,phaseInfo.duration);

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

                                renderNewPhase(targetDayBlock,phaseInfo.title,amountOfDays,phaseInfo.description,phaseID,phaseInfo.projectType);
                            }
                        }
                    }
                }
            }
        }
        populateToDoList(CURRENT_TODO_LIST_DATE,false);
        addActivePhaseListeners();
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
                            mixpanel.track('Added Class',{'className':className});
                            NEW_CLASS_ADDED = true;
                            $('#addClassModal').modal('hide');
                            addClassToOrder(className,false);
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
                        mixpanel.track('Added Class',{'className':className});
                        NEW_CLASS_ADDED = true;
                        $('#addClassModal').modal('hide');
                        addClassToOrder(className,true);
                        renderClassRow(className);
                    });
                }
            });
        }
    }

    function renderClassRow(className){
        console.log('rendering row');
        var dateColCount = getPageCol('total');
        var btCol = getPageCol('btcol');

        var dayMilli = new Date().getTime();

        if(DAYS_AHEAD > 0){
            dayMilli = dayMilli + (86400000 * DAYS_AHEAD);
        } else if(DAYS_AHEAD < 0){
            dayMilli = dayMilli - (86400000 * Math.abs(DAYS_AHEAD));
        }
        
        var newLane = '<div class="categoryLane"><div class="laneInfo"><p>' + className + '</p></div><div class="row">';

        for(var i = 1; i <= dateColCount; i++){
            dayFormatted = milliToDate(dayMilli);

            newLane += '<div id="' + formattedDateDivID(className,dayFormatted) + '" class="col-xs-' + btCol + ' dayBlock';

            if(getDayOfWeek(dayMilli) == 'Su' | getDayOfWeek(dayMilli) == 'Sa'){
                newLane += ' weekendDay';
            }

            newLane += '" data-class="' + className + '" data-date="' + dayFormatted + '" data-dateMilli="'+ dayMilli + '"></div>';
            dayMilli += 86400000;
        }

        newLane += '</div></div>';

        $('#allClasses').append(newLane);

        $('.buttonTitle').css('display','inherit');
        $('#newClassName').css('display','none');
        $('#newClassName').val("");

        removeDayBlockListeners();
        addDayBlockListeners();
        addActivePhaseListeners();
    }

    function addClassToOrder(className,isFirstClass){
        // 1 - Get the current order of classes
        // 2 - Add the new class to the order

        var classOrder = [className];

        if(!isFirstClass){
            DB.ref('users/' + USER.uid + '/format').once('value')
            .then(function(snapshot){
                var userFormat = snapshot.val();
                classOrder = userFormat['classOrder'];
                classOrder.push(className);
                setClassOrder(classOrder);
            });
        } else {
            setClassOrder(classOrder);
        }
    }

    function setClassOrder(classOrder){
        DB.ref('users/' + USER.uid + '/format').set({
            classOrder
        })
        .then(function(){
            console.log('Updated class order!');
        });
    }

    // ============================================
    // ==                                        ==
    // ==            Phase Functions             ==
    // ==                                        ==
    // ============================================

    function attemptAddPhase(startingBlock,title,days,desc,pType){
        if(pType == 'duedate'){
            days = "1";
        }

        var occupiedDates;
        var isValid = true;

        var firstDateMilli = parseInt(startingBlock.attr('data-dateMilli'));
        var dateMilli = firstDateMilli;
        
        var phaseClass = startingBlock.attr('data-class');
        
        // Check if dates are available with firebase
        DB.ref('users/' + USER.uid + '/classes/' + phaseClass + '/occupiedDates').once('value')
        .then(function(snapshot){
            occupiedDates = snapshot.val();

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

                if(title.includes("/")){
                    title = title.replace("/","SPECIALCHARslashslashslash");
                }
                
                var phaseID = title + "::" + parseInt(currentTime) + "::" + days;

                // Add phases to class
                DB.ref('users/' + USER.uid + '/classes/' + phaseClass + '/projects/' + PROJECT_ID + '/' + phaseID).set({
                    projectInfo:{
                        title: title.trim(),
                        duration: days,
                        description: desc,
                        startDateMilli: firstDateMilli,
                        course: phaseClass,
                        createdOn: firebase.database.ServerValue.TIMESTAMP,
                        done: false,
                        projectType: pType
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
                    mixpanel.track('Added Task',{
                        title: title.trim(),
                        duration: days,
                        description: desc,
                        startDateMilli: firstDateMilli,
                        course: phaseClass,
                        projectType: pType
                    });
                    var newOccupiedDates = occupiedDates.concat(desiredDates);
                    updateOccupiedDates(phaseClass,newOccupiedDates);                    
                });
            } else {
                alert('Invalid Number of Days');
            }
        });
    }


    function renderNewPhase(startingBlock,title,days,desc,phaseID,pType){
        var newBlock = addBlock("phaseHead",title,desc,phaseID,pType);
        var blankBlock = addBlock("phaseBody",title,desc,"nonID",pType);
        var btCol = getPageCol('btcol');
        
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

    function addActivePhaseListeners(){
        $('.phaseHead').popover('destroy');
        $('.phaseHead').popover({
            placement: 'bottom',
            title: 'Edit Project',
            html:true,
            content:  $('#editPhasePopup').html()
        }).on('click', function (e) {
            console.log('clicked phase head');
            var targetDayBlock = $(this);
            var phaseID = $(this).attr('data-phaseid');
            var phaseClass = $(this).parent().attr('data-class');
            var phaseDesc = $(this).attr('data-description');

            // If there is no description of the phase, tell user
            if(phaseDesc == ''){
                phaseDesc = '<i>No notes added</i>';
            }

            $('#detailed_phase_desc').html(phaseDesc);

            // Hides any currently showing modal
            $('.dayBlock').popover('hide');
            $('.phaseHead').not(this).popover('hide');

            // If user tries to delete phase
            $('#phase-delete').on('click',function(){
                if(attemptPhaseDelete(phaseClass,phaseID)){
                    $('.phaseHead').popover('hide');
                }
            });
        }).on('hide.bs.popover',function(){
            $('#phase-delete').off('click');
        });
    }

    function addDayBlockListeners(){
        $('.dayBlock').popover({
            placement: 'bottom',
            title: 'Add Task',
            html:true,
            content:  $('#addPhasePopup').html()
        }).on('click', function (e) {

            var targetDayBlock = $(this);

            // Hides any currently showing modal
            $('.dayBlock').not(this).popover('hide');

            if($(this).hasClass('occupied') == false){
                $('.phaseHead').popover('hide');
            }

            $('#phase-submit').on('click',function(){
                
                // Handle phase detail submission

                var projectName = $('#project-name').val();
                var projectDuration = $('#project-duration').val();
                var projectDescr = $('#phaseDescription').val();
                var projectType = $('#project-type').val();

                if(projectName.length > 0){
                    if(!isNaN(parseFloat(projectDuration)) && isFinite(projectDuration)){
                        attemptAddPhase(targetDayBlock,projectName,projectDuration,projectDescr,projectType);
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

    // Input: String - Takes the id of the phase to be deleted
    // Output: Boolean - Returns if the phase was successfully deleted
    // Attempts to delete a phase from the database and the page
    function attemptPhaseDelete(phaseClass,phaseID){
        // Get phase info from DB

        DB.ref('users/' + USER.uid + '/classes/' + phaseClass).once('value')
            .then(function(snapshot){
                var classData = snapshot.val();
                var occupiedDates = classData['occupiedDates'];

                var phaseInfo = classData['projects']['project_1'][phaseID]['projectInfo'];
                console.log(phaseInfo);

                DB.ref('users/' + USER.uid + '/classes/' + phaseClass + '/projects/' + PROJECT_ID + '/' + phaseID).remove()
                .then(function(){
                    // Delete the occupied dates that the phase occupied
                    // (1) Iterate over each date that the phase occupied
                    // (2) check if that date exists in the current occupiedDates array
                    // (3) If it does, delete it from the occupiedDates array
                    // (4) Reassign FB occupiedDates to the newly updated one
                    var phaseDatesArr = getAllDatesInPhase(phaseInfo.startDateMilli,phaseInfo.duration);
                    console.log(phaseDatesArr);

                    for(var i = 0; i < phaseDatesArr.length; i++){
                        var currDateIndex = occupiedDates.indexOf(phaseDatesArr[i]);
                        if(currDateIndex > -1){
                            occupiedDates.splice(currDateIndex,1);
                        }
                    }

                    console.log('NEW OCC DATES');
                    console.log(occupiedDates);

                    mixpanel.track('Delete Task');

                    updateOccupiedDates(phaseClass,occupiedDates); 
                });
            });
        return true;
    }

    // ============================================
    // ==                                        ==
    // ==        To-Do List Functions            ==
    // ==                                        ==
    // ============================================

    function populateToDoList(date,clear){
        // Update date in sidebar
        $("#toDoListSection .currentDateTitle").html(date.slice(0,date.length - 5) + " Tasks");
        // Clear current To Do List
        if(clear){
            $("#toDoList").html("");
            console.log("Redrawing to do list...",date);
            var datesToDoList = getToDoItems(date);
            // Check if there are items on this date
            if(Object.keys(datesToDoList).length > 0){
                for(var itemClass in datesToDoList){
                    // var newItemHTML = "<p>" + itemClass +":</p><ul><li>" + datesToDoList[itemClass].taskTitle + "</li><li>" + datesToDoList[itemClass].taskDescription + "</li></ul>";
                    $("#toDoList").append(renderItem(itemClass,datesToDoList[itemClass].taskTitle,datesToDoList[itemClass].taskDescription));
                }
            } else {
                $("#toDoList").append('<p style="text-align: center;"><i>No tasks on this date</i></p>');
            }
        }
    }

    function getToDoItems(date){
        // Find every day matching this date
        // Get the task on that day and the class
        var items = {};
        $("div[data-date*='" + date + "']").each(function(index){
            var item = {};
            var itemClass = $(this).attr('data-class');
            var itemTitle = $(this).find(".dayTitle").attr("data-itemtitle");
            var itemDesc = $(this).find(".projectHolder").attr('data-description');
            if(itemTitle != undefined){
                item["taskTitle"] = itemTitle;
                if(itemDesc != ""){
                    item["taskDescription"] = itemDesc;
                }
                items[itemClass] = item;
            }
        });
        return items;
    }

    function renderItem(itemClass,title,desc){
        var newItemHTML = '<div class="itemClass"><p class="itemClassTitle">' + itemClass + '</p><h3><input type="checkbox">&nbsp;&nbsp;' + title + '</h3>';
        if(desc != undefined){
            newItemHTML += '<p class="notesTitle">' + desc + '</p>';
        }
        newItemHTML += '</div>';
        return newItemHTML;
    }

    // ============================================
    // ==                                        ==
    // ==     Resize / Re-Render Functions       ==
    // ==                                        ==
    // ============================================

    // Checks the width of the window and rerenders the page if 
    // the width is in a different size category than current one 
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
    
    function resizeScreen(){
        var screenWidth = window.innerWidth;
        // set as large but screen is smaller
        if(SCREEN_SIZE == 'l' && screenWidth < 1300 && screenWidth > 800){
            reRenderPage('localReset');
            SCREEN_SIZE = 'm';
        // set as medium but screen is smaller
        } else if(SCREEN_SIZE == 'm' && screenWidth <= 800){
            hideToDoList();
            reRenderPage('localReset');
            SCREEN_SIZE = 's';
        // set as small but screen is medium
        } else if(SCREEN_SIZE == 's' && screenWidth > 800 && screenWidth < 1300){
            showToDoList();
            reRenderPage('localReset');
            SCREEN_SIZE = 'm';
        // set as medium but screen is large
        } else if(SCREEN_SIZE == 'm' && screenWidth >= 1300){
            showToDoList();
            reRenderPage('localReset');
            SCREEN_SIZE = 'l';
        }
        console.log(SCREEN_SIZE);
    }

    function hideToDoList(){
        $('#sideBar').css('display','none');
        $('#calInfo').removeClass('col-xs-9');
        $('#calInfo').addClass('col-xs-12');
    }

    function showToDoList(){
        $('#sideBar').css('display','initial');
        $('#calInfo').addClass('col-xs-9');
        $('#calInfo').removeClass('col-xs-12');
    }

     // Input:  Accepts the type of column length needed, either 
    //         'total' (the total columns in the page) or
    //         'btcol' (the width of each bootstrap column) 
    // Output: Returns the number value of either the total columns
    //         of the page, or the width of bootstrap columns
    function getPageCol(type){
        var pageWidth = window.innerWidth;
        if(pageWidth < 1300 && pageWidth > 800){
            if(type == 'total'){
                return 6;
            } else if(type == 'btcol'){
                return "2";
            }
        } else if(pageWidth <= 800 && pageWidth){
            if(type == 'total'){
                return 3;
            } else if(type == 'btcol'){
                return "4";
            }
        } else {
            if(type == 'total'){
                return 7;
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
            if(USER_CLASSES != null){
                renderUserData(USER_CLASSES,CLASS_ORDER);
            }
        }
    }

    // ============================================
    // ==                                        ==
    // ==        Micro Helper Functions          ==
    // ==                                        ==
    // ============================================

    function milliToDate(milli){
        return moment(milli).format('M' + '/' + 'D' + '/' + 'YYYY');
    }

    function getDayOfWeek(milli){
        return moment(milli).format('dd');
    }

    function formattedDateDivID(className,day){
        return className.replace(' ','lol') + "lol" + day.replace('/','bb').replace('/','bb');
    }

    function addBlock(blockType,text,desc,phaseID,pType){
        var projectText;
        text = text.replace("SPECIALCHARslashslashslash","/");
        if(blockType == "phaseBody"){
            projectText = '<div class="projectHolder ' + pType + '" data-itemType="' + pType + '" data-phaseid="' + phaseID + '" data-description="' + desc + '"><div class="dayContent"><div class="dayTitle" data-itemTitle="' + text + '"><br></div></div></div>';
        } else {
            projectText = '<div class="projectHolder ' + pType + ' phaseHead" data-itemType="' + pType + '" data-phaseid="' + phaseID + '" data-description="' + desc + '"><div class="dayContent"><div class="dayTitle" data-itemTitle="' + text + '">' + text + '</div></div></div>';
        }
        return projectText;
    }

    function removeDayBlockListeners(){
        $('.dayBlock').popover('destroy');
    }

    function getAllDatesInPhase(startMilli,duration){
        var allDatesInPhase = [];
        for(var i = 0; i < duration; i++){
            allDatesInPhase.push(milliToDate(startMilli));
            startMilli += 86400000;
        }
        return allDatesInPhase;
    }

    function updateOccupiedDates(phaseClass,newOccupiedDates){
        DB.ref('users/' + USER.uid + '/classes/' + phaseClass + '/occupiedDates').set(newOccupiedDates)
        // Render phase into UI
        .then(function(){
            clearCal();
            renderDateRow();
            fetchUserClasses();
        });  
    }

    function clearCal(){
        $('#dateDayRow').html("");
        $('#allClasses').html("");
        DATES_SHOWN = [];
    }

    function shiftDaysX(amount,direction){

        mixpanel.track('Shift Days',{'days':amount,'direction':direction});

        if(direction == 'next'){
            DAYS_AHEAD += amount;
        } else {
            DAYS_AHEAD -= amount;
        }

        if(USER_CLASSES == null || NEW_CLASS_ADDED){
            NEW_CLASS_ADDED = false;
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

})();
