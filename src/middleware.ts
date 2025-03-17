import { Request , Response , NextFunction } from "express";
import { JWT_PASSWORD } from "./config";
import jwt from "jsonwebtoken"

function auth (req: Request , res : Response, next : NextFunction){
    const token = req.headers.authorization;
    const decoded = jwt.verify(token as string, JWT_PASSWORD);
   
    if (decoded) {
        // @ts-ignore
        req.userId = decoded.id; // Store the decoded user ID for later use in request handling.
        next(); // Call the next middleware or route handler.
    } else {
        // If the token is invalid, send a 401 Unauthorized response.
        res.status(401).json({ message: "Unauthorized User" });
    }
}
export {auth}