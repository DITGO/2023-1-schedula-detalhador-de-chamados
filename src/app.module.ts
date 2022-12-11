import { Module } from '@nestjs/common';
import configuration from './configs/configuration';
import { ConfigModule } from '@nestjs/config';
import { SchedulingModule } from './schedulings/scheduling.module';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [
    ConfigModule.forRoot({ load: [configuration] }),
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: 'schedula_core_db',
      port: 5432,
      username: 'postgres',
      password: 'postgres',
      database: 'schedula_core',
      entities: [__dirname + '/../**/*.entity.{js,ts}'],
      synchronize: true,
    }),
    SchedulingModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
