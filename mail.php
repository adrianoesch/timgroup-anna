<?php
//SMTP needs accurate times, and the PHP time zone MUST be set
//This should be done in your php.ini, but this is how to do it if you don't have access to that
date_default_timezone_set('Etc/UTC');
require './PHPMailer/PHPMailerAutoload.php';

$openshift_data_dir = $_ENV["OPENSHIFT_DATA_DIR"];
$mailFolder = $openshift_data_dir.'mails/'

function sendNotification($to){
  //Create a new PHPMailer instance
  $mail = new PHPMailer;
  $mail->isSMTP();
  $mail->SMTPDebug = 2;
  $mail->Debugoutput = 'html';
  $mail->Host = 'mail.ethz.ch';
  $mail->Port = 587;
  $mail->SMTPSecure = 'tls';
  $mail->SMTPAuth = true;
  $mail->Username = "oescha";
  $mail->Password = $_ENV["aomail"];
  $mail->setFrom('adereky@ethz.ch', 'Timgroup Experiment');
  $mail->addAddress($to, '');
  $mail->Subject = 'Online Experiment Notification';
  $mail->msgHTML("<p>Dear participant,<br><br>Your next session of the online experiment is now ready!<br><br>Best regards,<br>The Timgroup notification bot");
}
