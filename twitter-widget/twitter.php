<?php
require_once("twitteroauth/twitteroauth/twitteroauth.php"); 

// You shuld change parameters below accrording your twitter developer account
$twitteruser = "username";
$notweets = 10; // how many last tweets do you want
$consumerkey = ""; // from twitter dev page
$consumersecret = ""; // from twitter dev page
$accesstoken = ""; // from twitter dev page
$accesstokensecret = ""; // from twitter dev page


	 
	
	 
function getConnectionWithAccessToken($cons_key, $cons_secret, $oauth_token, $oauth_token_secret) {
  $connection = new TwitterOAuth($cons_key, $cons_secret, $oauth_token, $oauth_token_secret);
  return $connection;
}

function humanTiming ($time)
{
	$time = time() - $time; // to get the time since that moment
	$tokens = array (
		31536000 => 'year',
		2592000 => 'month',
		604800 => 'week',
		86400 => 'day',
		3600 => 'hour',
		60 => 'minute',
		1 => 'second'
	);
	foreach ($tokens as $unit => $text) {
		if ($time < $unit) continue;
		$numberOfUnits = floor($time / $unit);
		return $numberOfUnits.' '.$text.(($numberOfUnits>1)?'s':'').' ago';
	}
}
 
$connection = getConnectionWithAccessToken($consumerkey, $consumersecret, $accesstoken, $accesstokensecret);
 
$tweets = $connection->get("https://api.twitter.com/1.1/statuses/user_timeline.json?screen_name=".$twitteruser."&count=".$notweets);
$tweetsArr = json_decode(json_encode($tweets), true);

$re = '';
if(sizeof($tweetsArr)>0){
	$re .= "<ul>\n";
	for($t=0; $t<sizeof($tweetsArr); $t++){
	
		//$tweetTimestamp = strtotime($tweetsArr[$t]['created_at']);
		$datetime = new DateTime($tweetsArr[$t]['created_at']);
		$datetime->setTimezone(new DateTimeZone('Europe/Istanbul'));

		$tweetText = $tweetsArr[$t]['text'];
		$tweetText = preg_replace('/http:\/\/([a-z0-9_\.\-\+\&\!\#\~\/\,]+)/i', '<a href="http://$1" class="tweet-link" target="_blank">http://$1</a>', $tweetText);
		$tweetText = preg_replace('/@([a-z0-9_]+)/i', '<a href="http://twitter.com/$1" class="tweet-user" target="_blank">@$1</a>', $tweetText);
		$re .= "\t<li>".$tweetText.' <span class="tweet-created"> '.humanTiming($datetime->format('U'))." </span></li>\n";
	}
	$re .= "</ul>\n";
}else{
	$re .= 'NOK';
}


echo $re;

?>