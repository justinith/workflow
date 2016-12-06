(function() {
    var config = {
            apiKey: "AIzaSyDkBifE9dCgqzn4ivf5uD7RXSwfN99Na_o",
            authDomain: "workflow-462a4.firebaseapp.com",
            databaseURL: "https://workflow-462a4.firebaseio.com",
            storageBucket: "workflow-462a4.appspot.com",
            messagingSenderId: "889877406021"
        };
    firebase.initializeApp(config);
    var user = "yangf6@uw*edu";
    window.onload = function(){
        renderDateRow();
        initListeners();
    }

    function initListeners(){
        // $('.dayBlock').click(function(){
        //     if(!$(this).hasClass('occupied')){
        //         attemptAddPhase($(this),'Testing Item',2);
        //     }
        // });
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

        //popover the add project window
         $('.dayBlock').popover({
            placement: 'bottom',
            title: 'Add Project',
            html:true,
            content:  $('#myForm').html()
        }).on('click', function(event){
            var targetDayBlock = $(this);
            var parent = $(event.target).parent();
            var className = $($(event.target).parent()).attr('id');
            //collect the info from user and send it to firebase
            $('#project-submit').click(function(){
                $('.dayBlock').popover('hide');
                var projectName = $('#project-name').val();
                var projectDuration = $('#project-duration').val();
                var projectDescr = $('#about').val();
                if(projectName.length > 0 && projectDuration.length > 0){
                    //create new instance of new project
                    var newProject = {
                        projectInfo:{
                            title: projectName.trim(),
                            duration: projectDuration.trim(),
                            course: "info 360",
                            createdOn: firebase.database.ServerValue.TIMESTAMP,
                            done: false
                        },
                        createdBy: {
                            uid: "yangf6",                   //the unique user id
                            displayName: "Fan Yang",   //the user's display name
                            email: "yangf6@uw.edu",                //the user's email address
                            photoUrl: null
                        },
                        projectTask: {}
                    }
                    console.log(newProject);
                    //send to firebase
                    var dataRef = firebase.database().ref(user + "/" + className + "/" + projectName);
                    dataRef.push(newProject);
                    //update the calendar
                    if(!targetDayBlock.hasClass('occupied')){
                    attemptAddPhase(targetDayBlock,projectName,3);
                    }
                }else{
                    alert("Project Name and Durations (Day) are required");
                }
            })
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
        var blankLane = '<div class="categoryLane"><div class="row"><div class="col-sm-1 categoryName">' + className + '</div><div class="col-sm-1 dayBlock></div><div class="col-sm-1 dayBlock"></div><div class="col-sm-1 dayBlock"></div><div class="col-sm-1 dayBlock"></div><div class="col-sm-1 dayBlock"></div><div class="col-sm-1 dayBlock"></div><div class="col-sm-1 dayBlock"></div><div class="col-sm-1 dayBlock"></div><div class="col-sm-1 dayBlock"></div><div class="col-sm-1 dayBlock"></div><div class="col-sm-1 nextWeekButton"><i class="fa fa-chevron-circle-right" aria-hidden="true"></i></div></div></div>';

        $('#allClasses').append(blankLane);

        $('.buttonTitle').css('display','inherit');
        $('#newClassName').css('display','none');
        $('#newClassName').val("");

        initListeners();
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
                console.log('more than 1 day');
                for(var i = 1; i < days; i++){
                    console.log('iteration ' + i);
                    startingBlock.next('.col-sm-1').append(blankBlock);

                    if(i + 1 == days){
                        startingBlock.next('.col-sm-1').css('border-right','white 1px solid')
                    }

                    startingBlock = startingBlock.next('.col-sm-1');
                    startingBlock.addClass('occupied');
                    startingBlock.removeClass('dayBlock');
                    // if(startingBlock.next('.col-sm-1').hasClass('dayBlock')){
                        
                    // }
                }
            }
        } else {
            // alert('Invalid Number of Days');
        }
    }

    function addBlock(text){
        var projectText = '<div class="projectHolder"><div class="dayContent" onclick=sidebar()><div class="dayTitle">' + text + '</div></div></div>';
        return projectText;
    }

})();
