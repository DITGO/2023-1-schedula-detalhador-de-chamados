import { IssueOpen } from '../../issue-open/entities/issueOpen.entity';
import {
  BaseEntity,
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToMany,
  JoinColumn,
  Relation,
  OneToOne,
} from 'typeorm';

import { AlertOpen } from './alertOpen.entity';

@Entity()
export class ScheduleOpen extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ nullable: true })
  dateTime: Date;

  @Column({ nullable: true })
  description: string;

  @Column()
  status: string;

  @OneToOne(() => IssueOpen, (issue: IssueOpen) => issue.schedule)
  @JoinColumn()
  issue: IssueOpen;

  @OneToMany(() => AlertOpen, (alertOpen: AlertOpen) => alertOpen.schedule, {
    cascade: true,
  })
  @JoinColumn()
  alerts: Relation<AlertOpen[]>;
}
