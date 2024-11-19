// import "../lib/env";
// import jwt from "jsonwebtoken";
// import { NextFunction, Request, Response } from "express";

// export const verifyToken = (req: Request, res: Response, next: NextFunction) => {
//     const authHeader = req.headers['authorization'];
//     const token = authHeader && authHeader.split(' ')[1];
//     if(token == null) return res.sendStatus(401);
//     jwt.verify(token, process.env.JWT_SECRET!, (err) => {
//         if(err) return res.sendStatus(403);
//         next();
//     })
// }

import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

interface User {
  email?: string;
  id?: string;
}

interface CustomRequest extends Request {
  user?: User;
}

export const verifyToken = (
  req: CustomRequest,
  res: Response,
  next: NextFunction
): void => {
  const token = req.headers.authorization?.split(" ")[1];

  if (!token) {
    res.status(403).json({ error: "Token tidak disediakan." });
    return;
  }

  jwt.verify(
    token,
    process.env.JWT_SECRET as string,
    (err: jwt.VerifyErrors | null, decoded: any) => {
      if (err) {
        return res.status(403).json({ error: "Token tidak valid." });
      }
      req.user = decoded as User;
      next();
    }
  );
};