import { ProblemCategoryModule } from './problem-category/problem-category.module';
import { IssueModule } from './issue/issue.module';
import { IssueOpenModule } from './issue-open/issueOpen.module';
import { AppService } from './app.service';
import { AppController } from './app.controller';
import { Module, CacheModule } from '@nestjs/common';
import configuration from './configs/configuration';
import { ConfigModule } from '@nestjs/config';
import { ScheduleModule } from './schedules/schedules.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProblemTypesModule } from './problem-types/problem-types.module';

const configService = configuration();

@Module({
  imports: [
    ConfigModule.forRoot({ load: [configuration], isGlobal: true }),
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: configService.database.host,
      port: configService.database.port,
      username: configService.database.user,
      password: configService.database.pass,
      database: configService.database.db,
      autoLoadEntities: true,
      entities: [__dirname + '/../**/*.entity.{js,ts}'],
      synchronize: true,
      ...(process.env.ENVIRONMENT === 'PRODUCTION' && {
        extra: {
          ssl: {
            rejectUnauthorized: false,
          },
        },
      }),
    }),
    CacheModule.register({ isGlobal: true }),
    ProblemCategoryModule,
    ProblemTypesModule,
    IssueModule,
    IssueOpenModule,
    ScheduleModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
