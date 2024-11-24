import { BaseEntity, Column, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { LeaveTypeModel } from "./leave_type.entity";
import { ApprovalModel } from "./approval.entity";
import { User } from "./user.entity";

@Entity('leave_attendance')
export class LeaveAttendanceModel extends BaseEntity{
    @PrimaryGeneratedColumn()
    id!: number

    @OneToMany(() => ApprovalModel, (approval) => approval.leaveAttendance)
    approvals!: ApprovalModel[];

    @Column({ name: 'start_date'})
    start_date!: Date

    @Column({name: 'end_date'})
    end_date!: Date

    @Column()
    reasson!: string

    @Column()
    files!: string

    @Column()
    assigned_to!: number;

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

    @ManyToOne(() => User)
    @JoinColumn({ name: 'user_id' })
    user!: User;

    @ManyToOne(() => User)
    @JoinColumn({ name: 'assigned_to' })
    assignedUser!: User;
}