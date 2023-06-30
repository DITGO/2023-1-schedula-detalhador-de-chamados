import {
  BaseEntity,
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  Relation,
} from 'typeorm';

import { ScheduleOpen } from './scheduleOpen.entity';

@Entity()
export class AlertOpen extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  date: Date;

  @ManyToOne(() => ScheduleOpen, (schedule: ScheduleOpen) => schedule.alerts, {
    onDelete: 'CASCADE',
  })
  @JoinColumn()
  schedule: Relation<ScheduleOpen>;
}
