import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from "typeorm";

@Entity("identity")
export class Identity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ default: null })
  phone_number: string;

  @Column({ default: null })
  email: string;

  @Column({ default: null })
  link_id: number;

  @Column()
  link_precedence: string;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @DeleteDateColumn()
  deleted_at: Date;
}
