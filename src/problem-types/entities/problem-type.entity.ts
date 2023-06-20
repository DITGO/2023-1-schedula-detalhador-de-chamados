import {
  BaseEntity,
  Column,
  DeleteDateColumn,
  Entity,
  ManyToMany,
  ManyToOne,
  PrimaryGeneratedColumn,
  Relation,
} from 'typeorm';
import { ProblemCategory } from '../../problem-category/entities/problem-category.entity';
import { Issue } from '../../issue/entities/issue.entity';

@Entity()
export class ProblemType extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column()
  visible_user_external: boolean;

  @ManyToOne(
    () => ProblemCategory,
    (problem_category: ProblemCategory) => problem_category.problem_types,
    {
      onDelete: 'CASCADE',
      nullable: true,
    },
  )
  problem_category: Relation<ProblemCategory>;

  @ManyToMany(() => Issue, (issue: Issue) => issue.problem_types, {
    nullable: true,
  })
  issues: Relation<Issue[]>;

  @DeleteDateColumn()
  deleted_at?: Date;
}
