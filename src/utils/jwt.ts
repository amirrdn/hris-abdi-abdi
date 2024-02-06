import "../lib/env";
import jwt, { JwtPayload } from "jsonwebtoken";

import { User } from "../entity/user.entity";

import { Request } from "express";
export interface CustomRequest extends Request {
  token: string | JwtPayload;
 }
interface TokenData {
  token: string;
  expiresIn: number | string;
}

export interface DataStoredInToken {
  id: number;
  email: string;
  name: string;
  branch_id: any;
  role_id: any;
  division_id: number;
  first_name: string;
  last_name: string;
}

export const createToken = (user: User, ingatSaya: boolean): TokenData => {
  let expiresIn = null;
  ingatSaya ? (expiresIn = '10h') : (expiresIn = '10h');

  const secret = process.env.JWT_SECRET!;

  const data: DataStoredInToken = {
    id: user.id,
    name: user.name,
    email: user.email,
    branch_id: user.branch,
    role_id: user.role_id,
    division_id: user.division_id,
    first_name: user.first_name,
    last_name: user.last_name
  };
  return {
    expiresIn,
    token: jwt.sign(data, secret, { expiresIn }),
  };
};

export const getUsers = (stringtoken: string) => {
  const secrets = process.env.JWT_SECRET!;  
  const decoded = jwt.verify(stringtoken, secrets) as JwtPayload;
  return decoded
}


export const decodeToken = (req: Request) => {
  const bearer = req.headers.authorization;
  const token = bearer!.split(" ")[1];
  const parsedToken = jwt.decode(token) as DataStoredInToken;
  return parsedToken;
};
