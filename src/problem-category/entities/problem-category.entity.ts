import {
  BaseEntity,
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToMany,
  Relation,
  JoinColumn,
  DeleteDateColumn,
} from 'typeorm';

import { ProblemType } from '../../problem-types/entities/problem-type.entity';
import { Issue } from '../../issue/entities/issue.entity';
@Entity()
export class ProblemCategory extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column({ nullable: true })
  description: string;

  @Column()
  visible_user_external: boolean;

  @OneToMany(
    () => ProblemType,
    (problem_type: ProblemType) => problem_type.problem_category,
    { nullable: true, onDelete: 'CASCADE', cascade: true },
  )
  @JoinColumn()
  problem_types: Relation<ProblemType[]>;

  @OneToMany(() => Issue, (issue: Issue) => issue.problem_category, {
    nullable: true,
  })
  issues: Relation<Issue[]>;

  @DeleteDateColumn()
  deleted_at?: Date;
}
