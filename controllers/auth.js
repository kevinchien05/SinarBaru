let permit = (...permitRoles) => {
    return (req,res,next)=> {
        let user = req.session.user;
        let userRole = req.session.user.Status;
        if(user && permitRoles.includes(userRole)){
            next();
        }else{
            console.log(req.session.user.Status);
        }
    }
}
export default permit;