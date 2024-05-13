import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/apiError.js";
import { User } from "../models/user.models.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/apiResponse.js";

// algorithm for register user
// get userdetails from frontend
// validation - email etc. not empty
// check if user is already exits : username, email
// check for images and avatar
// upload images to cloudinary, avatar
// create user object and stored in DB
// remove password and refresh token field from response
// check for user creation
// return response

const registeruser = asyncHandler(async (req, res) => {
  // whenever we get data from "form" or "json" then we can access the data in backend with req.body

  const { userName, email, fullName, password } = req.body;

  // console.log(userName, email); // we get the value of userName and email in the format of string
  // console.log(req.body); // here we get the total of form data in the format of object

  if (
    [userName, email, fullName, password].some((field) => field?.trim() === "")
  ) {
    throw new ApiError(400, "all fields are required");
  }
  if (email.includes(!"@")) {
    throw new ApiError(400, "please enter a valid email");
  }

  // we can check or perform different operation on fineOne with $ sign
  // const existedUser = User.findOne({
  //   $or: [{ userName }, { email }],
  // });

  // findOne method return the boolean value on the basis of data is availabe or not
  const existedUserWithEmail = await User.findOne({ email });
  const existedUserWithUserName = await User.findOne({ userName });

  if (existedUserWithEmail) {
    throw new ApiError(409, "user with this email is already exists");
  }

  if (existedUserWithUserName) {
    throw new ApiError(409, "This User Name is already take by another one");
  }

  const localAvatarPath = req.files?.avatar[0]?.path;

  let localCoverImagePath;

  if (
    req.files &&
    Array.isArray(req.files.coverImage) &&
    req.files.coverImage.length > 0
  ) {
    localCoverImagePath = req.files.coverImage[0].path;
  }

  if (!localAvatarPath) {
    throw new ApiError(400, "Avatar is mandatory");
  }

  const avatar = await uploadOnCloudinary(localAvatarPath);
  const coverImage = await uploadOnCloudinary(localCoverImagePath);

  if (!avatar) {
    throw new ApiError(400, "Avatar is mandatory");
  }

  const user = await User.create({
    fullName,
    avatar: avatar.url,
    coverImage: coverImage?.url || "",
    email,
    password,
    userName: userName.toLowerCase(),
  });

  // console.log(user); // it shows the whole database query with the field and data in object format

  const createdUser = await User.findById(user._id).select(
    "-password -refreshTokens"
  );

  if (!createdUser) {
    throw new ApiError(500, "something went wrong");
  }

  return res
    .status(201)
    .json(new ApiResponse(200, createdUser, "User Registred succesfully"));
});

export { registeruser };
