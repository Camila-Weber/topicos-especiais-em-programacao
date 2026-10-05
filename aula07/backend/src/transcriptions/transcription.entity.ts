import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { User } from '../users/user.entity';

@Entity('transcriptions')
export class Transcription {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column('uuid')
  userId!: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user!: User;

  @Column({ length: 255 })
  originalFileName!: string;

  @Column({ length: 255, select: false })
  storedFileName!: string;

  @Column({ length: 100 })
  mimeType!: string;

  @Column({ length: 20 })
  fileExtension!: string;

  @Column('bigint')
  fileSize!: number;

  @Column({ length: 10 })
  language!: string;

  @Column('text')
  text!: string;

  @CreateDateColumn()
  createdAt!: Date;
}
