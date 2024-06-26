import { v2 as cloudinary } from "cloudinary";
import fs from "fs";
import { ApiError } from "./apiError.js";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const uploadOnCloudinary = async (localFilePath) => {
  try {
    if (!localFilePath) return null; // if localfilepath is not get then it simply returns the null

    const response = await cloudinary.uploader.upload(localFilePath, {
      resource_type: "auto",
    }); // file has been upload succesfully
    // console.log(`file is uploaded on cloudinary ${response.url}`);
    fs.unlinkSync(localFilePath);
    // console.log(response);
    // with response we get all the key and values in format of objects
    // asset_id
    // public_id
    // version
    // version_id
    // signature
    // width
    // height
    // format
    // resource_type
    // created_at
    // tags
    // bytes
    // type
    // etag
    // placeholder
    // url
    // secure_url
    // folder
    // original_filename
    // api_key
    return response;
  } catch (error) {
    fs.unlink(localFilePath); // remove the locally saved temporary as the uploaded operation gets failed
    return null;
  }
};

const deleteOnCloudinary = async (cloudinaryUrl) => {
  try {
    if (!cloudinaryUrl) return null;

    const splitSlash = cloudinaryUrl.split("/");
    const endValue = splitSlash.length - 1;
    const olderImage = splitSlash[endValue];
    const splitDot = olderImage.split(".");
    const actualOlderImageName = splitDot[0];

    const response = await cloudinary.uploader.destroy(actualOlderImageName);
    return response;
  } catch (error) {
    return null;
  }
};

const getVideoDuration = async (publicId) => {
  try {
    const result = await cloudinary.api.resource(publicId, {
      resource_type: "video",
      media_metadata: true,
    });

    return result.duration;
  } catch (error) {
    console.log("error facing while get video duration");
    throw new ApiError(400, "error while get video duration on cloudinary");
  }
};

const deleteVideoOnCloudinary = async (videoUrl) => {
  try {
    if (!videoUrl) return null;

    const splitUrl = videoUrl.split("/");
    const endValue = splitUrl.length - 1;
    const video = splitUrl[endValue];
    const dotSplit = video.split(".");
    const actualVideoName = dotSplit[0];

    const response = await cloudinary.api.delete_resources(actualVideoName, {
      resource_type: "video",
    });

    return response;
  } catch (error) {
    return null;
  }
};

export {
  uploadOnCloudinary,
  deleteOnCloudinary,
  getVideoDuration,
  deleteVideoOnCloudinary,
};
