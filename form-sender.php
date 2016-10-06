<?php
$From_Email_Adress = 'me@domain.com';
$From_Name = 'FlowAway Contact Form';

$subject = 'Online Form from Web Site';
$To_Email_Adress = 'to@domain.com';

$form = '<table cellspacing="1" cellpadding="2" border="0">'."\n";
foreach($_POST as $key => $value)
	$form .= "<tr>\n\t<td valign=\"top\">".htmlspecialchars($key)."</td>\n\t<td>".htmlspecialchars($value)."</td>\n</tr>";
$form .= '</table>';



// To send HTML mail, the Content-type header must be set
$headers  = 'MIME-Version: 1.0' . "\r\n";
$headers .= 'Content-type: text/html; charset=iso-8859-1' . "\r\n";
$headers .= 'From: '.$From_Email_Adress." <".$From_Name.">\r\n";


// Mail it
$result = mail($To_Email_Adress, $subject, $form, $headers);

if($result)
	echo '{"status":"OK", "message":"Your message has been send successfuly."}';
else
	echo '{"status":"NOK", "ERR":"Have got an error while sending e-mail."}';
die();
?>