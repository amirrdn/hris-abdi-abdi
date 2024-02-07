import { Column, Entity, PrimaryGeneratedColumn, BaseEntity } from "typeorm";

@Entity('time_dimension')
export class Timedimensions extends BaseEntity{
    @PrimaryGeneratedColumn()
    id!: number

    @Column({name: 'db_date'})
    db_date!: Date

    @Column({type: 'int'})
    year!: any

    @Column({type: 'int'})
    month!: any

    @Column({type: 'int'})
    day!: any

    @Column({type: 'int'})
    quarter!: any

    @Column({type: 'int'})
    week!: any

    @Column({ name: 'day_name'})
    day_name!: string

    @Column({name: 'month_name'})
    month_name!: string

    @Column({name: 'holiday_flag', nullable: true})
    holiday_flag!: string

    @Column({name: 'weekend_flag', nullable: true})
    weekend_flag!: string

    @Column({type: 'text', nullable: true})
    event!: any

    @Column({name: 'national_holiday', type: 'int', nullable: true})
    national_holiday!: any
}