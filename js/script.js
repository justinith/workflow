(function() {
    var config = {
        apiKey: "AIzaSyDkBifE9dCgqzn4ivf5uD7RXSwfN99Na_o",
        authDomain: "workflow-462a4.firebaseapp.com",
        databaseURL: "https://workflow-462a4.firebaseio.com",
        storageBucket: "workflow-462a4.appspot.com",
        messagingSenderId: "889877406021"
    };

    firebase.initializeApp(config);

    // GLOBAL VARIABLES
    var USER; // the current user
    
    authenticateUser();

    window.onload = function(){
        renderDateRow();
        initListeners();
    }

    // Checks whether there is a currently saved user.
    // If there is, page continue to load. Otherwise, redirect to Sign Up page
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
                var val = $(this).val();
                renderNewClass(val);
            }
        });

        $('.freeDay').popover({
            placement: 'bottom',
            title: 'Add Project',
            html:true,
            content:  $('#myForm').html()
        }).on('click', function(event){
            var targetDayBlock = $(this);
            var parent = $(event.target).parent();
            var className = $($(event.target).parent()).attr('id');
            //check if the current date is occupied by other project
            if(!targetDayBlock.hasClass('occupied')){  
                // User clicked to add phase
                $('#project-submit').click(function(){
                    var parent = $(event.target).parent();
                    var className = $($(event.target).parent()).attr('id');
                    var projectName = $('#project-name').val();
                    var projectDuration = $('#project-duration').val();
                    var projectDescr = $('#about').val();
                    if(projectName.length > 0 && projectDuration.length > 0){
                        if(checkAvailDays(targetDayBlock,projectDuration)){
                            var ref = firebase.database().ref(USER.uid + "/" + className);
                            console.log(USER.uid, ref);
                            ref.once("value")
                            .then(function(snapshot) {
                                if(snapshot.child(projectName).exists()){
                                    alert("duplicated");
                                }else{
                                    $('.dayBlock').popover('hide');
                                    var newProject = {
                                        projectInfo:{
                                            title: projectName.trim(),
                                            duration: projectDuration.trim(),
                                            course: "info 360",
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
                                    }
                                    ref.push(newProject);
                                    attemptAddPhase(targetDayBlock,projectName,projectDuration);
                                    ref.on("value", render);
                                }
                            });
                        }else{
                            alert("No room to add this many days. Please adjust the number of days.");
                        }
                    }else{
                        alert("Project Name and Durations (Day) are required");
                    }
                });
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
        var blankLane = '<div class="categoryLane"><div class="row"><div class="col-sm-1 categoryName">' + className + '</div><div class="col-sm-1 dayBlock freeDay></div><div class="col-sm-1 dayBlock freeDay"></div><div class="col-sm-1 dayBlock freeDay"></div><div class="col-sm-1 dayBlock freeDay"></div><div class="col-sm-1 dayBlock freeDay"></div><div class="col-sm-1 dayBlock freeDay"></div><div class="col-sm-1 dayBlock freeDay"></div><div class="col-sm-1 dayBlock freeDay"></div><div class="col-sm-1 dayBlock freeDay"></div><div class="col-sm-1 dayBlock freeDay"></div><div class="col-sm-1 nextWeekButton"><i class="fa fa-chevron-circle-right" aria-hidden="true"></i></div></div></div>';

        $('#allClasses').append(blankLane);

        $('.buttonTitle').css('display','inherit');
        $('#newClassName').css('display','none');
        $('#newClassName').val("");

        initListeners();
    }

    function checkAvailDays(startingBlock,days){

        var isValid = true;
        
        for(var i = 0; i < days; i++){

            // see if this block has the free class class
            // if so, move to next block
            // if not, return false

            console.log(startingBlock);
            console.log(startingBlock.attr('class'));
            

            if(startingBlock.hasClass('freeDay')){
                startingBlock = startingBlock.next('.col-sm-1');
                console.log('checked one div');
            } else {
                console.log('found occupied day');
                return false;
            }
        }

        return true;
    }

    // Creates new phase UI on a target day block
    function attemptAddPhase(startingBlock,title,days){

        console.log(title + " " + days);

        var newBlock = addBlock(title);
        var blankBlock = addBlock("<br>");

        for(var i = 0; i < days; i++){
            // Check if first day
            if(i == 0){
                startingBlock.append(newBlock);
            } else {
                startingBlock.append(blankBlock);
            }

            startingBlock.addClass('occupied');
            startingBlock.removeClass('freeDay');
            startingBlock.removeClass('dayBlock');

            startingBlock = startingBlock.next('.col-sm-1');
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
    }

    function addBlock(text){
        var projectText = '<div class="projectHolder"><div class="dayContent"><div class="dayTitle">' + text + '</div></div></div>';

        return projectText;
    }

    function render(snapshot){
        snapshot.forEach(renderTask);
    }

    function renderTask(snapshot){
        var task = snapshot.val();
        console.log(task);
    }

})();
