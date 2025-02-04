import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import jwt from "jsonwebtoken"
import { User } from "../models/user.model.js";

//agar res ka use nhi h to _(underscore) bhi bhej sakte h
export const verifyJWT = asyncHandler( async(req, _ ,
    next) => {
        try {
            const token = req.cookies?.accessToken || req.header
            ("Authorization")?.replace("Bearer ", "")
        
            if(!token){
                throw new ApiError(401,"unauthorized request")
            }
    //This means decodedToken contains the user information that was encoded in the JWT during login.
        const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET)
    
        const user = await User.findById(decodedToken?._id).
        select("-password -refreshToken")
    
        if(!user) {
            //Todo:discuss about frontend
            throw new ApiError(401, "Invalid Access Token")
        }
    
        req.user = user;
        next();
        } catch (error) {
            throw new ApiError(401, error?.message || 
                "Invalid access token")
        }

}) 