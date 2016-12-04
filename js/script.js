(function() {

    window.onload = function(){

        renderDateRow();

    	$('.dayBlock').click(function(){
            var newBlock = addBlock("Testing");
            $(this).append(newBlock);
        });

        var day = moment(new Date().getTime()).format('M' + '/' + 'D' + '<br>' + 'dd');

        console.log(day);
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

    function addBlock(text){
        var projectText = '<div class="projectHolder"><div class="dayContent"><div class="dayTitle">' + text + '</div></div></div>';

        return projectText;
    }

})();