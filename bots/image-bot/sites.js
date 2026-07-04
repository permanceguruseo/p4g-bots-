// Image Bot — starter image-sharing list (2026). Needs client.imagePath. Verify live.
module.exports = [
  { name:'Flickr',    signupUrl:'https://identity.flickr.com/sign-up', submitUrl:'https://www.flickr.com/photos/upload/', da:92, doFollow:false, requiresCaptcha:true,  requiresEmailOTP:true,  notes:'desc link' },
  { name:'Pinterest', signupUrl:'https://www.pinterest.com/',          submitUrl:'https://www.pinterest.com/pin-builder/', da:94, doFollow:false, requiresCaptcha:true, requiresEmailOTP:true, notes:'pin dest URL' },
  { name:'Imgur',     signupUrl:'https://imgur.com/register',          submitUrl:'https://imgur.com/upload', da:93, doFollow:false, requiresCaptcha:true,  requiresEmailOTP:true,  notes:'desc link' },
  { name:'Ipernity',  signupUrl:'https://www.ipernity.com/register',   submitUrl:'https://www.ipernity.com/upload', da:66, doFollow:true,  requiresCaptcha:false, requiresEmailOTP:true,  notes:'doFollow' },
  { name:'500px',     signupUrl:'https://500px.com/signup',            submitUrl:'https://500px.com/upload', da:88, doFollow:false, requiresCaptcha:true,  requiresEmailOTP:true,  notes:'photo community' },
];
