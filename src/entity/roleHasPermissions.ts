import { Column, Entity, PrimaryGeneratedColumn, BaseEntity, JoinColumn, ManyToOne } from "typeorm";
import { Permissions } from "./permissionsEntity";
import { Roles } from "./roles";

@Entity('role_has_permissions')

export class RoleHasPemissions extends BaseEntity{
    @PrimaryGeneratedColumn({name: 'permission_id'})
    permission_id!: number
    // @Column({name: 'permission_id'})
    // permission_id!: number

    @Column({name: 'role_id'})
    role_id!: number

    @ManyToOne((_type) => Roles, (user) => user.haspermis)
    @JoinColumn({name: 'role_id'})
    roles!: Roles

    @ManyToOne(() => Permissions, (pr) => pr.permissions)
    @JoinColumn({name: 'permission_id'})
    permissions!: Permissions[]

    // @ManyToOne(() => Roles, r => r.haspermis)
    // @JoinColumn({name: 'role_id'})
    // roles!: Roles[];
}