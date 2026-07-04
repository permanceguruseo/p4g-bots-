// Micro-blog Bot — starter list (2026). Verify live; respect each platform's ToS.
module.exports = [
  { name:'Tumblr',   signupUrl:'https://www.tumblr.com/register',        submitUrl:'https://www.tumblr.com/new/text', da:86, doFollow:false, requiresCaptcha:true,  requiresEmailOTP:true,  notes:'strong authority' },
  { name:'Plurk',    signupUrl:'https://www.plurk.com/Users/register',   submitUrl:'https://www.plurk.com/', da:78, doFollow:false, requiresCaptcha:true,  requiresEmailOTP:true,  notes:'microblog' },
  { name:'Diigo',    signupUrl:'https://www.diigo.com/sign-up',          submitUrl:'https://www.diigo.com/', da:80, doFollow:true,  requiresCaptcha:true,  requiresEmailOTP:true,  notes:'bookmark+note, doFollow' },
  { name:'Mastodon', signupUrl:'https://mastodon.social/auth/sign_up',   submitUrl:'https://mastodon.social/', da:80, doFollow:false, requiresCaptcha:true,  requiresEmailOTP:true,  notes:'fediverse; pick instance' },
];
