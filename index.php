<?php

include("Mobile_Detect.php");
$detect = new Mobile_Detect();

if($detect->isMobile()) {
  include("index.mobile.php");
} else {
  include("index.desktop.php");
}

?>
