// RSS Bot — starter feed-directory list (2026). Verify live; some RSS dirs churn.
module.exports = [
  { name:'Feedage',    submitUrl:'https://www.feedage.com/register.php',  signupUrl:'https://www.feedage.com/register.php', da:40, doFollow:true,  requiresCaptcha:true,  requiresEmailOTP:false, notes:'feed dir' },
  { name:'FeedShark',  submitUrl:'https://feedshark.brainbliss.com/',      signupUrl:'https://feedshark.brainbliss.com/',   da:38, doFollow:false, requiresCaptcha:false, requiresEmailOTP:false, notes:'ping+submit' },
  { name:'Feedebee',   submitUrl:'https://www.feedebee.com/rss/submit',    signupUrl:'https://www.feedebee.com/rss/submit', da:34, doFollow:true,  requiresCaptcha:false, requiresEmailOTP:false, notes:'feed dir' },
  { name:'RSSmountain',submitUrl:'http://www.rssmountain.com/submit.php',   signupUrl:'http://www.rssmountain.com/submit.php',da:30, doFollow:true,  requiresCaptcha:false, requiresEmailOTP:false, notes:'feed dir' },
  { name:'FeedmapNet', submitUrl:'https://www.feedmap.net/',               signupUrl:'https://www.feedmap.net/',            da:28, doFollow:true,  requiresCaptcha:false, requiresEmailOTP:false, notes:'confirm live' },
];
