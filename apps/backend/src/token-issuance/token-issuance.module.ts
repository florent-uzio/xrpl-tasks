import { Module } from "@nestjs/common"
import { TaskEmitterModule, TaskModule } from "../task-emitter"
import { XrplModule } from "../xrpl"
import { CreateWalletsService } from "./sub-tasks"
import { TokenIssuanceController } from "./token-issuance.controller"
import { TokenIssuanceService } from "./token-issuance.service"

@Module({
  controllers: [TokenIssuanceController],
  providers: [TokenIssuanceService, CreateWalletsService],
  imports: [XrplModule, TaskEmitterModule.forFeature(TaskModule.TokenIssuance)], // Use forFeature to inject TASK_MODULE],
})
export class TokenIssuanceModule {}
