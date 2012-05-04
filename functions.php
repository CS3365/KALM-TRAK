<?php

$db_server = mysql_connect('localhost','kt','kt');
$db = mysql_select_db('kt');

//{{{1 is functions
function isValidLogin($user, $pass) {
  return getRows(
    "SELECT * ".
    "FROM users ".
    "WHERE user='$user' AND pass='$pass'") > 0;
}
//}}}1
//{{{1 get functions
function getAreas($user) {
  return getAssoc(
    "SELECT * ".
    "FROM areas");
}
function getTrakersInArea($areaid) {
  return getAssoc(
    "SELECT * ".
    "FROM trakers JOIN areas ".
    "WHERE aid=$areaid");
}
//}}}1
//{{{1 set functions
//}}}1
//{{{1 mysql funtions
function query($q) {
  return mysql_query($q);
}
function getAssoc($q) {
  $r = query($q);
  return mysql_fetch_assoc($r);
}
function getRows($q) {
  $r = query($q);
  return mysql_num_rows($r);
}
//}}}1

?>
