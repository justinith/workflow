"use strict";
// $(function(){
//     $("[data-toggle=popover]").popover({
//         html: true, 
//         content: $('#popover-content').html()
//     }).on('click',function () {
//         $("#class-submit").click(function(){
//             alert("Value: " + $("#class-name").val());
//             console.log("length", classToAdd.length);
//         })
//     })
// })
$(function(){
    $('#login').popover({
       
        placement: 'bottom',
        title: 'Add Project',
        html:true,
        content:  $('#myForm').html()
    }).on('click', function(){
      // had to put it within the on click action so it grabs the correct info on submit
      $('.btn-primary').click(function(){
       $('#result').after("form submitted by " + $('#email').val())
        // $.post('/echo/html/',  {
        //     email: $('#email').val(),
        //     name: $('#name').val(),
        //     gender: $('#gender').val()
        // }, function(r){
        //   $('#pops').popover('hide')
        //   $('#result').html('resonse from server could be here' )
        // })
      })
  })
})


