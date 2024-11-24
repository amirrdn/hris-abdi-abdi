import { BaseEntity, Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { LeaveAttendanceModel } from './leaveattendance.entity';
import { User } from "./user.entity";

@Entity('approval')
export class ApprovalModel extends BaseEntity {
    @PrimaryGeneratedColumn()
    id!: number;

    @ManyToOne(() => LeaveAttendanceModel, (leaveAttendance) => leaveAttendance.approvals)
    @JoinColumn({ name: 'leave_attendance_id' })
    leaveAttendance!: LeaveAttendanceModel;

    @Column()
    assigned_to!: number;

    @Column({ type: 'varchar', length: 50 })
    approval_status!: string;

    @ManyToOne(() => User)
    @JoinColumn({ name: 'approved_by' }) // Foreign key linking to the User entity
    approvedBy!: User;
    @Column()
    approved_by!: number;

    @Column({ type: 'timestamp', nullable: true })
    approved_at!: Date | null;

    @Column({ type: 'text', nullable: true })
    comments!: string | null;

    @CreateDateColumn()
    created_at!: Date;

    @UpdateDateColumn()
    updated_at!: Date;

   
}