const { validateToken } = require("../services/authentication");


function checkForAuthanticationCookie(cookieName) {
    return (req, res, next) =>{
        const tokenCookiesValue = req.cookies[cookieName];
        if(!tokenCookiesValue){
           return next();
        }
        try {
            const userPayload = validateToken(tokenCookiesValue);
            req.user = userPayload;
        } catch (error) {}
       return next();
    };
}

module.exports = {
    checkForAuthanticationCookie,
}