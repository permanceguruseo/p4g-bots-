// Profile Bot — starter high-authority profile-creation list (2026). Link goes in website/bio field. Verify live.
module.exports = [
  { name:'AboutMe',   signupUrl:'https://about.me/signup',        submitUrl:'https://about.me/edit', da:92, doFollow:false, requiresCaptcha:true,  requiresEmailOTP:true,  notes:'website field' },
  { name:'Gravatar',  signupUrl:'https://gravatar.com/connect/?screen=signup', submitUrl:'https://gravatar.com/profile/edit', da:92, doFollow:true, requiresCaptcha:false, requiresEmailOTP:true, notes:'doFollow, WP login' },
  { name:'Behance',   signupUrl:'https://www.behance.net/signup', submitUrl:'https://www.behance.net/settings/profile', da:92, doFollow:false, requiresCaptcha:true, requiresEmailOTP:true, notes:'creative' },
  { name:'Crunchbase',signupUrl:'https://www.crunchbase.com/register', submitUrl:'https://www.crunchbase.com/', da:91, doFollow:false, requiresCaptcha:true, requiresEmailOTP:true, notes:'company profile' },
  { name:'Disqus',    signupUrl:'https://disqus.com/profile/signup/', submitUrl:'https://disqus.com/settings/profile/', da:90, doFollow:false, requiresCaptcha:true, requiresEmailOTP:true, notes:'website field' },
  { name:'Slides',    signupUrl:'https://slides.com/users/sign_up', submitUrl:'https://slides.com/account', da:80, doFollow:true, requiresCaptcha:false, requiresEmailOTP:true, notes:'doFollow bio' },
];
