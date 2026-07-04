// PPT/PDF Bot — starter document-sharing list (2026). Verify live; some need login/OTP.
// Optional per-site: uploadTrigger (button to reveal file input), dropZone (drag area).
module.exports = [
  { name:'SlideShare', signupUrl:'https://www.slideshare.net/login', submitUrl:'https://www.slideshare.net/upload', da:95, doFollow:false, requiresCaptcha:false, requiresEmailOTP:true,  uploadTrigger:'', notes:'LinkedIn login common' },
  { name:'Issuu',      signupUrl:'https://issuu.com/signup',         submitUrl:'https://issuu.com/home/publish', da:93, doFollow:false, requiresCaptcha:true,  requiresEmailOTP:true,  notes:'flipbook' },
  { name:'Scribd',     signupUrl:'https://www.scribd.com/signup',    submitUrl:'https://www.scribd.com/upload-document', da:92, doFollow:false, requiresCaptcha:true, requiresEmailOTP:true, notes:'doc host' },
  { name:'Calameo',    signupUrl:'https://www.calameo.com/account/create', submitUrl:'https://www.calameo.com/account/books', da:88, doFollow:true, requiresCaptcha:false, requiresEmailOTP:true, notes:'doFollow' },
  { name:'edocr',      signupUrl:'https://www.edocr.com/user/register', submitUrl:'https://www.edocr.com/upload', da:70, doFollow:true, requiresCaptcha:false, requiresEmailOTP:true, notes:'doFollow docs' },
  { name:'Yumpu',      signupUrl:'https://www.yumpu.com/en/login/register', submitUrl:'https://www.yumpu.com/en/document/upload', da:84, doFollow:false, requiresCaptcha:true, requiresEmailOTP:true, notes:'flipbook' },
];
