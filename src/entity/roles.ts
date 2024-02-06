import { Column, Entity, PrimaryGeneratedColumn, BaseEntity,OneToMany, JoinColumn } from "typeorm";
import { RoleHasPemissions } from "./roleHasPermissions";
import { User } from "./user.entity";

@Entity('dcms.roles')
export class Roles extends BaseEntity{
    @PrimaryGeneratedColumn()
    id!: number;

    @Column()
    name!: string;

    @Column({name: 'guard_name'})
    guard_name!: string;

    @Column()
    parent!: number

    @Column({name: 'is_menu'})
    is_menu!: number

    @Column({name: 'is_enebled'})
    is_enebled!: string

    @Column({ name: 'division'})
    division!: number;

    @OneToMany(() => User, rl => rl.division_id)
    @JoinColumn({name: 'division'})
    division_id!:User;

    @OneToMany(() => RoleHasPemissions, rl => rl.roles)
    haspermis!:RoleHasPemissions[]
}