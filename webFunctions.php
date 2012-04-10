<?php

if(isset($_POST['action'])) {
  include 'dbFunctions.php';

  switch($_POST['action']) {
  case 'getAccounts':
    echo json_encode(getAccounts());
    break;
  case 'getRooms':
    echo json_encode(getRooms($_POST['acctid']));
    break;
  case 'getTrakers':
    echo json_encode(getTRAKers($_POST['roomid']));
    break;
  }
}

?>
