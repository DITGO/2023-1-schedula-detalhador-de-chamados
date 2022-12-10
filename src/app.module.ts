import { Module } from '@nestjs/common';
import configuration from './configs/configuration';
import { ConfigModule } from '@nestjs/config';
import { AgendamentoModule } from './agendamentos/agendamento.module';
import { AppController } from './app.controlller';
import { AppService } from './app.service';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [ConfigModule.forRoot({ load: [configuration] }), TypeOrmModule.forRoot({
    type: 'postgres',
    host: 'schedula_core_db',
    port: 5432,
    username: 'postgres',
    password: 'postgres',
    database: 'schedula_core',
    entities: [__dirname + '/../**/*.entity.{js,ts}'],
    synchronize: true,
  }) ,AgendamentoModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}