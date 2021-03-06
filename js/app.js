var accessToken, currentUser;
$( ".js-login" ).on( "click", function( e ){
  e.preventDefault();
  if(currentUser){
    localStorage.setItem("currentUser",null)
    init()
  } else {
    window.open( "http://auth.wdidc.org" );
  }
})
window.addEventListener( "message", function( e ){
  e.preventDefault();
  accessToken = e.data;
  getUser( accessToken );
})

function getUser( token ){
  $.getJSON( "https://api.github.com/user?access_token=" + token, function( response ){
    response.access_token = token;
    localStorage.setItem( "currentUser", JSON.stringify(response) );
    init()
  })
}

function init(){
  currentUser = JSON.parse( localStorage.getItem( "currentUser" ) ) ;
  console.log( currentUser );
  if (currentUser) {
    // Attendance
    $(".js-login").html("logout "+ currentUser.login)
    $(".showIfCurrentUser").show()
    var urlAttendance = "http://api.wdidc.org/attendance/students/" + currentUser.id + "?callback=?";
    var urlAttendanceSummary = "http://api.wdidc.org/attendance/summary/" + currentUser.id;
    $.ajax({
      url: urlAttendanceSummary,
      dataType: "jsonp",
      type: "GET",
      jsonpCallback: "callback"
    }).done( function( response ){
      $(".tardies").append("<h3>Tardies</h3>")
    	$(".absences").append("<h3>Absences</h3>")
      $( "#num-tardy" ).html( response.tardy );
      $( "#num-absent" ).html( response.absent );
      if( response.tardy + (response.absent * 2) >= 8 ){
        $( ".attendance-graph" ).addClass( "red" );
      }
    }).done( function( response ){
      $.getJSON( urlAttendance, function( response ){
        console.log( response )
        for( var i=0; i<response.length; i++){
          if(response[i].status === "tardy"){
            $(".tardies").append("<p><small>" + moment(response[i].weekday,"YYYY-MM-DD").format("MMMM Do") + "</small></p>")
          }
          if(response[i].status === "absent"){


          	$(".absences").append("<p><small>" + moment(response[i].weekday,"YYYY-MM-DD").format("MMMM Do") + "</small></p>")
          }
        }
      })
    })

    // Homework
    var urlAssignments = "http://assignments.wdidc.org/students/" + currentUser.id + "/submissions.json?access_token=" + currentUser.access_token ;
    var urlAssignmentsSummary = "http://assignments.wdidc.org/students/" + currentUser.id + "/summary?access_token=" + currentUser.access_token ;

    $.getJSON( urlAssignments, function( response ){
      // Loops through each assignment
      for( var i=0; i < response.length; i++ ){
	       var assignment = response[i];
         if(assignment.assignment_type == "homework"){
        	  if( !assignment.status ){
        	    var incompleteAssignment = $( "<li></li>" ).html( "<a href='"+assignment.assignment_repo_url+"'>"+assignment.assignment_title+"</a>" );
        	    $( "#list-incomplete" ).append( incompleteAssignment );
        	  }
        	}//if homework
         if(assignment.assignment_type == "project"){
        	  var project = $("<div class='project js-project'></div>")
            project.append("<h3>"+assignment.assignment_title+"</h3>")
            if(assignment.status){
        	    project.append("<div>"+markdown.toHTML(assignment.status)+"</div>")
        	    $(".js-projects").append(project)
        	  }
        	}
        }
      });

      $.getJSON( urlAssignmentsSummary, function( response ){
        percentComplete = response.percent_complete;
        if( percentComplete < 80 ){
          $( ".percent-complete" ).css( "background-color", "#ff3f2c" );
        }
        else{
          $( ".percent-complete" ).css( "background-color", "#1fce35" );
        }
        $( ".percent-complete" ).css( "width", percentComplete + "%" );
        $( ".percent-complete" ).html( percentComplete + "% complete" );
        percentIncomplete = 100 - percentComplete;
        $( "#percent-incomplete" ).html( percentIncomplete + "%" );
      });

    } else {
      $(".js-login").html("Log In with GitHub")
      $(".showIfCurrentUser").hide()
    }
}

init()

function test(id){
  var u = JSON.parse(localStorage.getItem("currentUser"))
  u.id = id
  localStorage.setItem("currentUser", JSON.stringify(u))
  init()
}
