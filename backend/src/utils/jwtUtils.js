const jwt = require('jsonwebtoken');

const {accessTokenSecret,refreshTokenSecret,accessTokenExpiry,refreshTokenExpiry}= require('../config/jwtConfig');

//generate access token

const generateAccessToken = (userId)=>{
    return jwt.sign({userId},accessTokenSecret,{expiresIn:accessTokenExpiry});
}


//generate refresh token 

const generateRefreshToken = (userId)=>{
    return jwt.sign({userId},refreshTokenSecret,{expiresIn:refreshTokenExpiry})
}

//verify access token 
const verifyAccessToken = (token)=>{
    try {
        return jwt.verify(token,accessTokenSecret)
    } catch (error) {
        return null
    }
}

//verify refrech token

const verifyRefreshToken = (token)=>{
    try {
        return jwt.verify(token,refreshTokenSecret);        
    } catch (error) {
        return null
    }
}


module.exports={
        generateAccessToken,
        generateRefreshToken,
        verifyAccessToken,
        verifyRefreshToken
}