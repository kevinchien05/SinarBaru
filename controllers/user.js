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
    res.redirect('/');
};

const auth = (req,res,next) => {
    const data = {
        Username : req.body.username,
        Password : req.body.myPassword
    };
    User.findOne({where:{Username:data.Username}}).then((results) => {
        if(!results){
            req.session.err = "Incorrect Email Or Password";
            res.redirect('/');
        }
        else if(data.Password != results.Password){
            req.session.err = "Incorrect Password";
            res.redirect('/');
        }
        else{
            req.session.user = results;
            res.redirect("/supplier");
        }
    }).catch(err => {
        req.session.err = "Error Database Query";
        res.redirect('/');
    })
};

export default {login,logout,auth};