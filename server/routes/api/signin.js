const User = require("../../models/User");
const UserSession = require("../../models/UserSession");

module.exports = (app) => {
    // app.get('/api/counters', (req, res, next) => {
    //   Counter.find()
    //     .exec()
    //     .then((counter) => res.json(counter))
    //     .catch((err) => next(err));
    // });
  
    // app.post('/api/counters', function (req, res, next) {
    //   const counter = new Counter();
  
    //   counter.save()
    //     .then(() => res.json(counter))
    //     .catch((err) => next(err));
    // });

    /*
    *Sign Up
    */
   app.post('/api/account/signup', (req, res, next) => {
        const { body } = req;
        const{
            firstName,
            lastName,
            password
        } = body;
        let{
            email
        } = body;
        
        if(!firstName)
        {
            return res.send({
                success: false,
                message: "Error: First name cannot be blank."
            });
        }
        if(!lastName)
        {
            return res.send({
                success: false,
                message: "Error: Last name cannot be blank."
            });
        }
        if(!email)
        {
            return res.send({
                success: false,
                message: "Error: Email cannot be blank."
            });
        }
        if(!password)
        {
            return res.send({
                success: false,
                message: "Error: Password cannot be blank."
            });
        }

        console.log("here");
        email=email.toLowerCase();

        // 1. Verify the email's existence
        // 2. Save
        User.find({
            email: email
        }, (err, previousUsers)=>{
                if(err)
                {
                     res.end({
                        success: false,
                        message: "Error: Server Error."
                    });
                }
                else if(previousUsers.length>0)
                {
                    res.end({
                        success: false,
                        message: "Error: Account already exists."
                    });
                }
            //Save new user
            const newUser = new User()
            newUser.email=email;
            newUser.firstName=firstName;
            newUser.lastName=lastName;
            newUser.password=newUser.generateHash(password)

            newUser.save((err, user) => {
                if(err)
                {
                    return res.send({
                        success: false,
                        message: "Error: Server Error."
                     });
                }
                return res.send({
                    success: true,
                    message: "Signed up."
                 });
            });
        });
   });

    app.post('/api/account/signin', (req, res, next) => {
        const { body } = req;
        const{
            password
        } = body;
        let{
            email
        } = body;

        if(!email)
        {
            return res.send({
                success: false,
                message: "Error: Email cannot be blank."
            });
        }
        if(!password)
        {
            return res.send({
                success: false,
                message: "Error: Password cannot be blank."
            });
        }

        email=email.toLowerCase();

        User.find({
            email: email
        }, (err, users) => {
            if(err){
                return res.send({
                    success: false,
                    message: "Error: Server error."
                });
            }

            if(users.length != 1){
                return res.send({
                    success: false,
                    message: "Invalid."
                });
            }

            const user=users[0];
            if(!user.validPassword(password)){
                return res.send({
                    success: false,
                    message: "Invalid password."
                });
            }
            //Otherwise correct user
            const userSession = new UserSession();
            userSession.userId = user._id;
            userSession.save((err, doc) => {
                if(err){
                    return res.send({
                        success: false,
                        message: "Error: Server error."
                    });
                }
                 
                return res.send({
                    success: true,
                    message: "Valid sign in",
                    token: doc._id
                });

            });
        });

    });

    app.get('/api/account/verify', (req, res, next) => {
        const { query } = req;
        const { token } = query;

        UserSession.find({
           _id: token,
           isDeleted: false 
        }, (err, sessions) =>{
            if(err){
                return res.send({
                    success: false,
                    message: "Error: Server error."
                });
            }
            if(sessions.length!=1){
                return res.send({
                    success: false,
                    message: "Error: Invalid."
                });
            }
            else{
                return res.send({
                    success: true,
                    message: "Good."
                });
            }
        });

    });

    app.get('/api/account/logout', (req, res, next) => {
        const { query } = req;
        const { token } = query;

        UserSession.findOneAndUpdate({
           _id: token,
           isDeleted: false 
        },{
            $set:{isDeleted:true}
        }, null, (err, sessions) =>{
            if(err){
                return res.send({
                    success: false,
                    message: "Error: Server error."
                });
            }
            return res.send({
                    success: true,
                    message: "Good."
                });
        });

    });

};