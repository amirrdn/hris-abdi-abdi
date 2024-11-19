import { Column, Entity, PrimaryGeneratedColumn, BaseEntity, JoinColumn, ManyToOne } from "typeorm";
import { Roles } from "./roles";
import { Branchs } from "./brachEntity";

export type Enabled = "yes" | "no";

@Entity('dcms2.users')
export class User extends BaseEntity{
    @PrimaryGeneratedColumn()
    id!: number;

    @Column()
    name!: string;

    @Column({
        unique: true
    })
    email!: string;

    @Column()
    password!: string

    @Column()
    first_name!: string

    @Column()
    last_name!: string

    @Column()
    middle_name!: string

    @Column({
        type: 'enum',
        enum: ['yes', 'no'],
        default: ['yes']
    })
    is_enebled!: Enabled

    @Column()
    image!: string

    @Column()
    token!: string
    
    @Column()
    gender!: number

    @Column()
    last_login_ip!: string

    @Column({name: 'role_id'})
    role_id!: number

    @Column()
    last_login_at!: string

    @Column({name: 'branch_id'})
    branch_id!: any;

    @ManyToOne(() => Branchs)
    @JoinColumn({name: 'branch_id'})
    branch!: Branchs 

    @Column()
    signature!: string

    @Column({name: 'division_id'})
    division_id!: number
    
    @ManyToOne(() => Roles, r => r.division)
    @JoinColumn({name: 'division_id'})
    division!: Roles

    @ManyToOne(() => Roles)
    @JoinColumn({name: 'role_id'})
    role!: Roles

    @Column({ name: 'created_by'})
    created_by!: string;

    @Column({name: 'modify_by'})
    modify_by!: string;

    @Column({name: 'mobile_phone'})
    mobile_phone!: number;

    @Column({name: 'created_at'})
    created_at!: Date

    @Column({name: 'updated_at'})
    updated_at!: Date
}