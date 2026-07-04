// ─────────────────────────────────────────────────────────────
// sites.js — Article Bot's verified target list (checked 2026).
// requiresReview:true → platform has editorial approval; the bot
// submits, then it publishes after their review (mark pending).
// doFollow noted where known; recheck periodically as policies change.
// ─────────────────────────────────────────────────────────────
module.exports = [
  { name:'HubPages',      signupUrl:'https://hubpages.com/signin/signup', submitUrl:'https://hubpages.com/mycenter/hub/new',
    da:92, doFollow:true,  requiresCaptcha:true,  requiresEmailOTP:true,  requiresReview:false, notes:'DA 92, doFollow from author bio' },
  { name:'EzineArticles', signupUrl:'https://ezinearticles.com/submit/',   submitUrl:'https://my.ezinearticles.com/',
    da:85, doFollow:false, requiresCaptcha:true,  requiresEmailOTP:true,  requiresReview:true,  notes:'editorial review before publish' },
  { name:'ArticleBiz',    signupUrl:'https://articlebiz.com/register',      submitUrl:'https://articlebiz.com/submit',
    da:44, doFollow:true,  requiresCaptcha:false, requiresEmailOTP:true,  requiresReview:true,  notes:'free, doFollow' },
  { name:'SooperArticles',signupUrl:'https://www.sooperarticles.com/register.html', submitUrl:'https://www.sooperarticles.com/submit-articles.html',
    da:53, doFollow:true,  requiresCaptcha:true,  requiresEmailOTP:true,  requiresReview:true,  notes:'India-friendly, doFollow' },
  { name:'SelfGrowth',    signupUrl:'https://www.selfgrowth.com/user/register', submitUrl:'https://www.selfgrowth.com/node/add/article',
    da:78, doFollow:true,  requiresCaptcha:true,  requiresEmailOTP:false, requiresReview:true,  notes:'self-help niche' },
  { name:'ApSense',       signupUrl:'https://www.apsense.com/register',      submitUrl:'https://www.apsense.com/article/new',
    da:70, doFollow:true,  requiresCaptcha:true,  requiresEmailOTP:true,  requiresReview:false, notes:'business network, doFollow' },
  { name:'Medium',        signupUrl:'https://medium.com/m/signin',           submitUrl:'https://medium.com/new-story',
    da:96, doFollow:false, requiresCaptcha:false, requiresEmailOTP:true,  requiresReview:false, notes:'DA 96, noFollow but strong authority' },
  { name:'Hashnode',      signupUrl:'https://hashnode.com/onboard',          submitUrl:'https://hashnode.com/create/story',
    da:78, doFollow:false, requiresCaptcha:false, requiresEmailOTP:true,  requiresReview:false, notes:'tech niche' },
  { name:'Bloglovin',     signupUrl:'https://www.bloglovin.com/signup',      submitUrl:'',
    da:83, doFollow:false, requiresCaptcha:false, requiresEmailOTP:true,  requiresReview:false, notes:'blog network' },
];
