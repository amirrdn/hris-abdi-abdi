import { BaseEntity, Column, Entity, PrimaryGeneratedColumn } from "typeorm";

export type TypeStatus = "0" | "1";

@Entity('leave_type')
export class LeaveTypeModel extends BaseEntity{
    @PrimaryGeneratedColumn()
    id!: number

    @Column()
    type_name!: string

    @Column({
        type: 'enum',
        enum: ['0', '1'],
        default: ['1']
    })
    status: TypeStatus

    @Column({name: 'created_at'})
    created_at!: Date

    @Column({name: 'updated_at'})
    updated_at!: Date
    
}