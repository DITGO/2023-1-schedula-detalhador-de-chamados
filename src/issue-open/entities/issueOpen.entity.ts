import {
  BaseEntity,
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  ManyToMany,
  Relation,
  OneToOne,
  JoinTable,
} from 'typeorm';
import { ProblemCategory } from '../../problem-category/entities/problem-category.entity';
import { ProblemType } from '../../problem-types/entities/problem-type.entity';
import { ScheduleOpen } from '../../schedules-open/entities/scheduleOpen.entity';

@Entity()
export class IssueOpen extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  requester: string;

  @Column()
  phone: string;

  @Column()
  city_id: string;

  @Column()
  workstation_id: string;

  @Column()
  email: string;

  @Column()
  date: Date;

  @Column()
  description: string;

  @Column()
  cellphone: string;

  @ManyToOne(
    () => ProblemCategory,
    (problem_category: ProblemCategory) => problem_category.issues,
  )
  @JoinColumn()
  problem_category: Relation<ProblemCategory>;

  @ManyToMany(
    () => ProblemType,
    (problem_type: ProblemType) => problem_type.issues,
  )
  @JoinTable()
  problem_types: Relation<ProblemType[]>;

  @OneToOne(() => ScheduleOpen, (schedule: ScheduleOpen) => schedule.issue)
  schedule: Relation<ScheduleOpen>;
}
