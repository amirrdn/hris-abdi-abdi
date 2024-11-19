import { BaseEntity, Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { User } from "./user.entity";

@Entity('presence')
export class PresenceModel extends BaseEntity{
    @PrimaryGeneratedColumn()
    id!: number

    @Column({ type: 'date' })
    dates!: Date

    @Column()
    times!: string
    
    @Column('geometry', {
        spatialFeatureType: 'Point',
        srid: 4326,
      })
      coordinate!: string;
    // @Column("geometry")
    // coordinate!: Point

    @Column({ name: 'type_absen'})
    type_absen!: string

    @Column()
    description!: string
    
    @Column({ name: 'user_id'})
    user_id!: number

    @Column({name: 'user_agent'})
    user_agent!: string

    @Column({name: 'ip_address'})
    ip_address!: string
    
    @Column({name: 'created_at'})
    created_at!: Date

    @Column({name: 'updated_at'})
    updated_at!: Date

    @ManyToOne(() => User)
    @JoinColumn({name: 'user_id'})
    user!: User
}