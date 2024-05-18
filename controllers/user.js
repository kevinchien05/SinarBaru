import User from '../models/user.js';

const login = (req,res,next) => {
    //message
    let msg = req.session.err || "";
    let i_user = req.session.user || "";
    //Reset
    req.session.err = "";
    res.render('login', {i_user, msg});
};

const logout = (req,res,next) => {
    req.session.destroy();
    res.redirect('/login');
};

const auth = (req,res,next) => {
    const data = {
        Username : req.body.Username,
        Password : req.body.Password
    };
    User.findOne({where:{Username:data.Username}}).then((results) => {
        if(!results){
            req.session.err = "Incorrect Email Or Password";
            res.redirect('/login');
        }
        else if(data.Password != results.Password){
            req.session.err = "Incorrect Password";
            res.redirect('/login');
        }
        else{
            req.session.user = results;
            res.redirect("/");
        }
    }).catch(err => {
        req.session.err = "Error Database Query";
        res.redirect('/login');
    })
};

export default {login,logout,auth};