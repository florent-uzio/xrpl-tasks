import { Module } from "@nestjs/common"
import { ScheduleModule } from "@nestjs/schedule"
import { ServeStaticModule } from "@nestjs/serve-static"
import { join } from "path"
import { AppController } from "./app.controller"
import { AppService } from "./app.service"
import { TasksModule } from "./tasks/tasks.module"
import { XrplModule } from "./xrpl/xrpl.module"

@Module({
  imports: [
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, "../..", "frontend", "dist"),
    }),
    ScheduleModule.forRoot(),
    XrplModule,
    TasksModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
