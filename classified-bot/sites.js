// Classified Bot — starter list (2026). Classifieds often require phone/email OTP. Verify live.
module.exports = [
  { name:'Locanto',      signupUrl:'https://www.locanto.com/g/my/', submitUrl:'https://www.locanto.com/g/post/', da:78, doFollow:false, requiresCaptcha:true, requiresEmailOTP:true, requiresReview:true, notes:'global' },
  { name:'ClassifiedAds',signupUrl:'https://www.classifiedads.com/', submitUrl:'https://www.classifiedads.com/post_ad.php', da:70, doFollow:true, requiresCaptcha:true, requiresEmailOTP:true, notes:'doFollow' },
  { name:'Adpost',       signupUrl:'https://www.adpost.com/', submitUrl:'https://www.adpost.com/post/', da:62, doFollow:true, requiresCaptcha:true, requiresEmailOTP:true, notes:'doFollow' },
  { name:'Storeboard',   signupUrl:'https://www.storeboard.com/register', submitUrl:'https://www.storeboard.com/classifieds', da:50, doFollow:true, requiresCaptcha:true, requiresEmailOTP:true, notes:'also directory' },
  { name:'FreeAdsTime',  signupUrl:'https://www.freeadstime.org/register', submitUrl:'https://www.freeadstime.org/post-ad', da:48, doFollow:true, requiresCaptcha:false, requiresEmailOTP:true, notes:'doFollow' },
  { name:'Khojle',       signupUrl:'https://www.khojle.in/', submitUrl:'https://www.khojle.in/post-classifieds', da:40, doFollow:true, requiresCaptcha:false, requiresEmailOTP:true, notes:'India' },
];
