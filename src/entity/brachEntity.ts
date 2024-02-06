import { Column, Entity, PrimaryGeneratedColumn, BaseEntity } from "typeorm";

@Entity('hearingsolution.branch')
export class Branchs extends BaseEntity{
    @PrimaryGeneratedColumn()
    id!: number

    @Column()
    nme!: string
}