import {
    BaseEntity,
    Entity,
    PrimaryGeneratedColumn,
    Column,
    ManyToOne,
    JoinColumn,
    Relation,
  } from 'typeorm';
  
  import { IssueOpen } from './issueOpen.entity';
  
  @Entity()
  export class AlertIssueOpen extends BaseEntity {
    @PrimaryGeneratedColumn('uuid')
    id: string;
  
    @Column()
    date: Date;
  
    @ManyToOne(() => IssueOpen, (issueOpen: IssueOpen) => issueOpen.alerts, {
      onDelete: 'CASCADE',
    })
    @JoinColumn()
    issueOpen: Relation<IssueOpen>;
  }
  