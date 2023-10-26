const { createHmac, randomBytes } = require("crypto");
const {Schema, model} = require("mongoose");
const { createTokenForUser } = require("../services/authentication");

const UserSchema = new Schema({
    fullName: {
        type :String,
        required :true,
    },
    email :{
        type :String,
        required :true,
        unique: true,
    },
    salt: {
        type: String,
        // required :true,
    },
    password: {
        type: String,
        required :true,
    },
    profileImageURL :{
        type :String,
        default :"../public/images/image.png",
    },
    role: {
        type :String,
        enum : ["USER", "ADMIN"],
        default :'USER',
    },
}, {timestamps: true});


//resolve the error
function hashPassword(password, salt) {
    return createHmac("sha256", salt).update(password).digest("hex");
  }
  
   function generateSalt() {
    return randomBytes(16).toString("hex");
  }
  
  function verifyPassword(inputPassword, hashedPassword, salt) {
    const hashedInputPassword = hashPassword(inputPassword, salt);
    return hashedInputPassword === hashedPassword;
}

UserSchema.pre("save", function (next) {
    const user = this;
  
    if (!user.isModified("password")) return;
  
    user.salt = generateSalt();
    user.password = hashPassword(user.password, user.salt);
  
    next();
});

UserSchema.statics.matchPassword = async function (email, password) {
    const user = await this.findOne({ email });
  
    if (!user) throw new Error("User not found!");
  
    if (!verifyPassword(password, user.password, user.salt)) {
      throw new Error("Incorrect password");
    }

    const token = createTokenForUser(user);
    return token;
  
    // return user;
  };




// UserSchema.pre("save", function (next) {
//     const user = this;

//     if (!user.isModified("password")) return;

//     const salt = randomBytes(16).toString();
//     const hashedPassword = createHmac("sha256", salt).update(user.password).digest("hex");

//     this.salt = salt;
//     this.password = hashedPassword;

//     next();
// });

// UserSchema.static('matchPassword', async function(email, password) {
//     const user = await this.findOne({email});

//     if(!user) throw new Error("User not found!");

//     const salt = user.salt;
//     const hashedPassword = user.password;

//     const userProvidedHash = createHmac("sha256", salt)
//     .update(user.password)
//     .digest("hex");

//     if(hashedPassword !== userProvidedHash) throw new Error("Incorrect password");
    
//     return user;

// })

const User = model("user", UserSchema);
module.exports = User;