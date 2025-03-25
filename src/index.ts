import express from "express";
import mongoose from "mongoose";
import jwt from "jsonwebtoken";
import { userModel , tagModel , linkModel , contentModel} from "./db"
import { JWT_PASSWORD } from "./config";
import { auth } from "./middleware";
import { random } from "./utils";
import cors from "cors"
import dotenv from "dotenv";
dotenv.config()
const app = express();

app.use(express.json());
app.use(cors()); 


declare global {
    namespace Express {
      export interface Request {
          userId?: string;
      }
    }
}

app.post("/api/v1/signup" , async (req , res) => {
    const username = req.body.username;
    const password = req.body.password;

    await userModel.create({
        username : username,
        password : password
    })
    
    res.json({
        message: "signup successful"
    })
})

app.post("/api/v1/signin" , async (req , res) => {
    const username = req.body.username;
    const password = req.body.password;

    const user = await userModel.findOne({
        username , password
    });

    if(user) {
        const token = jwt.sign({
            id: user._id
        }, JWT_PASSWORD);
        res.json({
            token : token
        })
    }
    else{
        res.status(403).json({
            message : "user not found"
    })
    }
})

app.get("/api/v1/content" ,auth, async (req , res) => {
    //@ts-ignore
    const userId = req.userId;
    const content = await contentModel.find({
        userId: userId
    }).populate("userId" , "username")

    res.json({
        content
    })
})

app.post("/api/v1/content" ,auth , async (req, res) => {
    const {link , title , type} = req.body;
    await contentModel.create({
        link,
        type,
        title,
        //@ts-ignore
        userId: req.userId, // userId is added by the middleware.
        tags: [] // Initialize tags as an empty array.
    });

    res.json({ message: "Content added" }); // Send success response.
})

app.delete("/api/v1/content" ,auth , async (req , res) => {
    const {contentId} = req.body;

    // Delete content based on contentId and userId.
    //@ts-ignore
    await contentModel.deleteOne({ _id: contentId, userId: req.userId });
    res.json({ message: "Deleted" }); // Send success response.
})

app.post("/api/v1/brain/share" , auth ,async (req , res) => {
    const {share} = req.body;
    if(share) {
        const existinglink = await linkModel.findOne({
            userId : req.userId
        })
        if(existinglink) {
            res.json({
                link : existinglink.hash
            })
        }
        else{
            const hash = random(10);
            await linkModel.create({
                userId: req.userId,
                hash: hash
            })
            res.json({
                hash: hash
            })
        }

    }
    else{
        await linkModel.deleteOne({
            userId: req.userId
        })
    }
    res.json({
        message : "Updated shareable link"
    })
})

app.get("/api/v1/brain/:shareLink" , async (req , res) => {
    const hash = req.params.shareLink;
    const link = await linkModel.findOne({
        hash: hash
    })
    if(!link){
        res.json({
            message : "not found user"
        })
        return;
    }
    const user = await userModel.findOne({
        _id : link.userId
    })

    const content = await contentModel.find({
        userId : link.userId
    })

    if (!user) {
        res.status(411).json({
            message: "user not found, error should ideally not happen"
        })
        return;
    }

    res.json({
        content  : content, 
        user: user
    })
})


async function main() {
    const dbUrl = process.env.DATABASE_URL;
    if (!dbUrl) {
        throw new Error("DATABASE_URL is not defined in the environment variables.");
    }
    await mongoose.connect(dbUrl);
    app.listen(3000);
    console.log("listening on port 3000")
}
main()