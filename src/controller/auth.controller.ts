import express, { Request, RequestHandler, Response } from "express";
import { User } from "../entity/user.entity";
import bcryptjs from "bcryptjs";
import { createToken } from "../utils/jwt";
import dbDCMS from "../config/crm";
import { Roles } from "../entity/roles";
import { RoleHasPemissions } from "../entity/roleHasPermissions";
import { Permissions } from "../entity/permissionsEntity";
import jwt, { JwtPayload } from 'jsonwebtoken';

const app = express();
app.use(express.json());

interface Query {
    name?:string;
    email:string;
    password: string;
    ingatSaya: boolean,
    id: number,
    role_id: number,
};

interface AuthRequest extends Request {
    user?: { id: number };
}

export const Login: RequestHandler = async (req: Request, res: Response): Promise<void> => {
  const { email, password, ingatSaya } = req.body as Query;

  const usersexitst = await dbDCMS.getRepository(User).findOne({
      where: { email },
      relations: ['role', 'division', 'branch'],
  });
  if (!usersexitst) {
      return res.status(400).json({ message: "Invalid credentials" }) as unknown as void;
  }

  const isValidPassword = await bcryptjs.compare(password, usersexitst.password.toString());
  console.log(isValidPassword);
  if (!isValidPassword) {
      return res.status(401).json({
          success: false,
          errors: "Periksa kembali data anda",
      }) as unknown as void;
  }

  const permissions = await dbDCMS.getRepository(Roles)
      .createQueryBuilder('r')
      .select(['permissions.name as name'])
      .innerJoin(RoleHasPemissions, 'roles', '`roles`.`role_id` = `r`.`id`')
      .innerJoin(Permissions, 'permissions', '`permissions`.`id` = `roles`.`permission_id`')
      .where('r.id = :roleid', { roleid: usersexitst.role_id })
      .getRawMany();

  const accessToken = createToken(usersexitst, ingatSaya);
  usersexitst.token = accessToken.token;
  await usersexitst.save();

  res.cookie('accessToken', accessToken, {
      httpOnly: true,
      maxAge: 24 * 60 * 60 * 1000, // 1 day
  });

  return res.status(200).json({
      success: true,
      accessToken,
      user: usersexitst,
      permission: permissions.map(item => item.name),
  }) as unknown as void;
};

export const SetPassword: RequestHandler = async (req: AuthRequest, res: Response): Promise<void> => {
  const { password, id } = req.body as Query;

  // Fetch user based on the user ID from the request
  const user = await dbDCMS.getRepository(User).findOne({
      where: { id: id },
  });
  // Check if the user exists
  if (!user) {
      return res.status(400).json({ message: "Invalid credentials" }) as unknown as void;
  }

  // Hash the new password
  const hashedPassword = await bcryptjs.hash(password, 10);

  // Update the user's password
  user.password = hashedPassword;

  // Save the updated user
  await dbDCMS.getRepository(User).save(user);

  // Send success response
  return res.status(200).json({
      success: true,
  }) as unknown as void;
}

export const checkRoles: RequestHandler = async (req: Request, res: Response): Promise<void> => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if(token){
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET!) as JwtPayload;
    } catch (error) {
      return res.sendStatus(401) as unknown as void;
    }
      const userid = decoded.id;
      const roleid = decoded.role_id;
      const branch = decoded.branch_id;
      const usersroles    = await dbDCMS.getRepository(User)
                          .createQueryBuilder('u')
                          .select([
                              'u.first_name as first_name',
                              'r.id as id',
                              'r.parent as parent',
                              'r.is_menu as is_menu',
                              'u.email as email'
                          ])
                          .innerJoin(Roles, 'r', '`r`.`id` = `u`.`role_id`')
                          .where('r.id = :roleid', {roleid: roleid})
                          .andWhere('u.id = :userid', {userid: userid})
                          .andWhere('u.branch_id IN(:branchs)', {branchs: branch.id})
                          .getRawMany();
      const isparentid = Object.assign({}, usersroles);

      const toproles      = await dbDCMS.getRepository(Roles)
                          .createQueryBuilder('r')
                          .select([
                              'r.id as id',
                              'r.parent as parent',
                              'r.name as name',
                              'r.is_menu as is_menu',
                              "( SELECT r1.id FROM roles r1 WHERE r1.id = r.parent  ) as parents "
                          ])
                          .where('r.id = :parent', {parent: isparentid[0].parent})
                          .getRawMany();
      const lastparent = Object.assign({}, toproles);
      let lastassigned;
      if(lastparent[0].is_menu !== null){
          lastassigned    = await dbDCMS.getRepository(User)
                          .createQueryBuilder('u')
                          .select([
                              "CONCAT(u.first_name,' ', u.last_name) as fullname",
                              "u.email as email",
                              "u.id as id",
                              "r.name as role_name"
                          ])
                          .innerJoin(Roles, 'r', '`r`.`id` = `u`.`role_id`')
                          .where('u.role_id = :parent', {parent: lastparent[0].parent})
                          .getRawOne();
      }else{
          lastassigned    = await dbDCMS.getRepository(User)
                          .createQueryBuilder('u')
                          .select([
                              "CONCAT(u.first_name,' ', u.last_name) as fullname",
                              "u.email as email",
                              "u.id as id",
                              "r.name as role_name"
                          ])
                          .innerJoin(Roles, 'r', '`r`.`id` = `u`.`role_id`')
                          .where('u.role_id = :parent', {parent: lastparent[0].id})
                          .andWhere('u.branch_id = :branchid', {branchid: branch.id})
                          .getRawOne();
      }
      res.json({
        'data': lastassigned
      });
  }else{
      res.json({
          message: 404
      });
  }
  return;
}