<?php

include 'functions.php';

if(isset($_POST['action'])) {
  $action = $_POST['action'];
  switch($action) {
    //{{{ login
  case 'login':
    $isValid =
      isValidLogin($_POST['user'], $_POST['pass']) ?
      'true' :
      'false';
    echo "{".
      '"result":'.$isValid.','.
      '"sessionid":"bla"'.
      '}';
    break;
    //}}}
    //{{{1 get functions
    //{{{2 getAreas
  case 'getAreas':
    $result = getAreas($_POST['user']);
    echo json_encode($result);
    break;
    //}}}2
    //{{{2 getTrakersInArea
  case 'getTrakersInArea':
    echo json_encode(
      getTrakersInArea($_POST['areaid']));
    break;
    //}}}2
    //}}}1 end get functions
  }
}

?>

