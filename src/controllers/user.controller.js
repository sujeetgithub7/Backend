import {asyncHandler} from '../utils/asyncHandler.js'
import {ApiError} from '../utils/ApiError.js'
import {User} from '../models/user.model.js'
import {uploadOnCloudinary} from '../utils/cloudinary.js'
import { ApiResponse } from '../utils/ApiResponse.js'

//method for access and refresh token (login user ka steps h usi ka method h baar baar use hoga isliye method)
const generateAccessAndRefreshToken = async(userId) => {
    try {
        const user = await User.findById(userId)
        const accessToken = user.generateAccessToken()
        const refreshToken = user.generateRefreshToken()

        user.refreshToken = refreshToken
        await user.save({validateBeforeSave: false})//validateBeforeSave:false because=> //jab save karne jaoge to password and aur detail jo model me required h mangega but for token saving we don't want that
        
        return {accessToken, refreshToken}


    } catch (error) {
        throw new ApiError(500, "something went wrong while generating token")
    }
}


//register User
const registerUser = asyncHandler( async (req,res) => {
    //refer user model
    //get user deatils from frontend/postman
    //validation - not empty
    //check if user already exists: use username or email
    //check for images, check for avatar
    //upload them to cloudinary, avatar
    //create user object - create entry in db
    //remove password and refresh token field from response
    //check for user creation
    //return res


    const {fullName, email, username, password} = req.body
    //console.log("email: ", email); 

    //validation
    // if(fullName === ""){
    //     throw new ApiError(400, "fullName is required")
    // }//one by one check kar sakte h sab field but thoda sikhte h 

    if(
        [fullName, email, username, password].some((field) =>
        field?.trim() === "")
    ){
        throw new ApiError(400, "All fields are required")
    }

    //user exist ?
    const existedUser = await User.findOne({
        $or: [{username},{email}]
    })

    if(existedUser){
        throw new ApiError(409, "User with email or username already exists")
    }

    // console.log(req.files);
    //check for avatar
    //middleware by multer used in user.routes.js
    const avatarLocalPath = req.files?.avatar[0]?.path;
    //const coverImageLocalPath = req.files?.coverImage[0]?.path;
    //coverImage nhi dene pe error aa rha h so classicif else check kar lo above line ka code nhi chal rha h 
    //coverimage me dikaat h but avatar ko to ham check kar hi le rhe h alag se

    let coverImageLocalPath;
    if(req.files && Array.isArray(req.files.coverImage)
        && req.files.coverImage.length > 0){
            coverImageLocalPath = req.files.coverImage[0].path
        }

    if(!avatarLocalPath){
        throw new ApiError(400, "avatar is required")
    }

    //now upload on cloudinary
    const avatar = await uploadOnCloudinary(avatarLocalPath)
    const coverImage = await uploadOnCloudinary(coverImageLocalPath)

    if(!avatar){
        throw new ApiError(400,"Avatar file is required")
    }

    //database entry
    const user = await User.create({
        fullName,
        avatar: avatar.url,
        coverImage: coverImage?.url || "",
        email,
        password,
        username: username.toLowerCase()
    })
    //check created or not
    //and also select feature you want to remove 
    const createdUser = await User.findById(user._id).select(
        "-password -refreshToken"
    )

    if(!createdUser){
        throw new ApiError(500,"Something went wrong while registering the user")
    }

    //return res
    return res.status(201).json(
        new ApiResponse(200,createdUser,"User registered successfully")
    )


})

//login User
const loginUser = asyncHandler( async (req,res) =>{
    //req body -> data
    //username or email
    //find the user
    //password check
    //access and refresh token
    //send cookie me token

    const {email,username,password} = req.body
    //console.log(email);

    if (!username && !email) {//agar dono nhi h tab if block execute
        throw new ApiError(400, "username or email is required")
    }
    
    // Here is an alternative of above code based on logic discussed in video:
    // if (!(username || email)) {
    //     throw new ApiError(400, "username or email is required")
        
    // }

    const user = await User.findOne({
        $or: [{username}, {email}]
    })

    if (!user) {
        throw new ApiError(404, "User does not exist")
    }
//  isPasswordCorrect is internal method so be careful
//  not mongoose ka method so user(lowercase) wala jo aap define kiye h na ki User(capital wala use karo jo save h db me)
   const isPasswordValid = await user.isPasswordCorrect(password)

   if (!isPasswordValid) {
    throw new ApiError(401, "Invalid user credentials")
    }

    const {accessToken,refreshToken} = await
     generateAccessAndRefreshToken(user._id)

    //sent in cookies
    const loggedInUser = await User.findOne(user._id).
    select("-password -refreshToken")

    const options = {
        httpOnly: true,
        secure: true
    }

    return res
    .status(200)
    .cookie("accessToken", accessToken,options)
    .cookie("refreshToken", refreshToken,options)
    .json(
        new ApiResponse(
            200,
            {
                user: loggedInUser, accessToken, refreshToken
            },
            "User logged in successfully"
        )
    )

})

//logout user
//cookies hatao httpOnly h server se hi manage and referesh token ko bhi hatao server se 
const logoutUser = asyncHandler(async (req,res,next) => {
    //ab is method me user kha se aayega
    //logout karte time to user se email,username mangenge nhi wo kisi ka bhi de sakta h 
    //use middleware => jaane se pahle milkar jaiyega 
    //auth middleware me verifyJWT then user route me logout se pahle verifyJWT method call as a middleware
    //verifyJWT method me req.user = user now use this here

    await User.findByIdAndUpdate(
        req.user._id,
        {
            $set: {
                refreshToken : undefined
            }
        },
        {
            new: true
        }
    )

    const options = {
        httpOnly: true,
        secure: true
    }

    return res
    .status(200)
    .clearCookie("accessToken",options)
    .clearCookie("refreshToken",options)
    .json(new ApiResponse(200,{}, "User logged out"))
})



export {
    registerUser,
    loginUser,
    logoutUser
} 