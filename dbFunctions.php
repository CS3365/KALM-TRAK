<?php

function getAccounts() {
  $accounts = ["Home"];
  return $accounts;
}

function getRooms($account) {
  $rooms = array(
    array(
      "name" => "Room 1",
      "rid"  => "1"
    ),
    array(
      "name" => "Room 2",
      "rid"  => "2"
    ),
    array(
      "name" => "Room 3",
      "rid"  => "3"
    ),
    array(
      "name" => "Room 4",
      "rid"  => "4"
    )
  );
  return $rooms;
}

function getTRAKers($roomid) {
  $trakers = array(
    array(
      "name" => "TRAKer 1",
      "tid"  => "1"
    ),
    array(
      "name" => "TRAKer 2",
      "tid"  => "2"
    ),
    array(
      "name" => "TRAKer 3",
      "tid"  => "3"
    ),
    array(
      "name" => "TRAKer 4",
      "tid"  => "4"
    )
  );
  return $trakers;
}

?>
