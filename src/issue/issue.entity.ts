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
import { ProblemCategory } from '../problem-category/entities/problem-category.entity';
import { ProblemType } from '../problem-types/entities/problem-type.entity';
import { Schedule } from '../schedules/schedule.entity';

@Entity()
export class Issue extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  requester: string;

  @Column()
  phone: string;

  @Column()
  city: string;

  @Column()
  workstation_id: string;

  @Column()
  email: string;

  @Column()
  date: Date;

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

  @OneToOne(() => Schedule, (schedule: Schedule) => schedule.issue)
  schedule: Relation<Schedule>;
}
