// Guest Post Bot — starter list (2026). Guest posting is niche-specific + semi-manual;
// replace these with YOUR vetted "write for us" targets per client niche. Verify live.
module.exports = [
  { name:'Medium',    signupUrl:'https://medium.com/m/signin', submitUrl:'https://medium.com/new-story', da:96, doFollow:false, requiresCaptcha:false, requiresEmailOTP:true,  notes:'open publish' },
  { name:'HubPages',  signupUrl:'https://hubpages.com/signin/signup', submitUrl:'https://hubpages.com/mycenter/hub/new', da:92, doFollow:true, requiresCaptcha:true, requiresEmailOTP:true, notes:'open publish' },
  { name:'DevTo',     signupUrl:'https://dev.to/enter', submitUrl:'https://dev.to/new', da:90, doFollow:false, requiresCaptcha:false, requiresEmailOTP:true, notes:'tech niche' },
  // Add niche "write for us" pages here, e.g.:
  // { name:'YourNicheBlog', signupUrl:'https://site.com/write-for-us', submitUrl:'', da:50, doFollow:true, requiresCaptcha:false, requiresEmailOTP:false, notes:'email-only → bot drafts pitch, you send' },
];
