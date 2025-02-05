import { Module } from "@nestjs/common"
import { XrplModule } from "../xrpl"
import { TasksController } from "./tasks.controller"
import { TasksService } from "./tasks.service"

@Module({
  controllers: [TasksController],
  providers: [TasksService],
  imports: [XrplModule],
})
export class TasksModule {}
