import { BaseEntity, Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { LeaveTypeModel } from "./leave_type.entity";

@Entity('leave_attendance')
export class LeaveAttendanceModel extends BaseEntity{
    @PrimaryGeneratedColumn()
    id!: number

    @Column({ name: 'start_date'})
    start_date!: Date

    @Column({name: 'end_date'})
    end_date!: Date

    @Column()
    reasson!: string

    @Column()
    files!: string

    @Column({ name: 'user_id'})
    user_id!: number

    @Column({name: 'created_at'})
    created_at!: Date

    @Column({name: 'updated_at'})
    updated_at!: Date

    @Column({ name: 'cuty_type'})
    cuty_type!: number

    @ManyToOne(() => LeaveTypeModel)
    @JoinColumn({ name: 'cuty_type'})
    cutytype!: LeaveTypeModel
}