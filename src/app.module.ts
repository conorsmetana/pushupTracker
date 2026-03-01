import { Module } from '@nestjs/common';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { PushupsModule } from './pushups/pushups.module';
import { GroupsModule } from './groups/groups.module';

@Module({
  imports: [
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'client', 'dist'),
      exclude: ['/api*'],
    }),
    PrismaModule,
    AuthModule,
    UsersModule,
    PushupsModule,
    GroupsModule,
  ],
})
export class AppModule {}
