import { Column, Entity, PrimaryGeneratedColumn, BaseEntity, ManyToOne, JoinColumn } from "typeorm";
import { RoleHasPemissions } from "./roleHasPermissions";
import { Modules } from "./module.entity";

@Entity('permissions')
export class Permissions extends BaseEntity{
    @PrimaryGeneratedColumn()
    public  id!: number

    @Column()
    name!: string

    @Column()
    guard_name!: string

    @Column({name: 'module'})
    module!: number

    @Column({name: 'created_at'})
    created_at!: Date

    @Column({name: 'updated_at'})
    updated_at!: Date

    @ManyToOne(() => RoleHasPemissions, (rls) => rls.permissions)
    @JoinColumn({name: 'id'})
    permissions!: RoleHasPemissions

    @ManyToOne(() => Modules, md => md.id)
    @JoinColumn({name: 'module'})
    pmudl!: Modules[]
}