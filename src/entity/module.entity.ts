import { BaseEntity, Column, Entity, JoinColumn, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { Permissions } from "./permissionsEntity";
import { RoleHasPemissions } from "./roleHasPermissions";
export type Enabled = "yes" | "no";

@Entity('dcms.module')
export class Modules extends BaseEntity{
    @PrimaryGeneratedColumn()
    id!: number
    
    @Column({name: 'module_name'})
    module_name!: string;

    @Column({
        type: 'enum',
        enum: ['yes', 'no'],
        default: ['yes']
    })
    is_enebled!: Enabled

    @OneToMany(() => Permissions, (rls) => rls.pmudl)
    @JoinColumn({name: 'module', referencedColumnName: 'module'})
    module!: Permissions[]

    @OneToMany(() => RoleHasPemissions, (p) => p.permissions)
    @JoinColumn({name: 'module', referencedColumnName: 'module'})
    pmudl!: RoleHasPemissions[]

    @Column({name: 'created_at'})
    created_at!: Date
    
    @Column({name: 'updated_at'})
    updated_at!: Date
}