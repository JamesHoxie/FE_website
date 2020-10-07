
const signup_get = function(req, res) {
    res.render('signup');
}

const signup_post = function(req, res) {
    res.render('login');
}

const login_get = function(req, res) {
    res.send('new signup');
}

const login_post = function (req, res) {
    res.send('user login');
}


module.exports = {
    signup_get,
    signup_post,
    login_get,
    login_post
}