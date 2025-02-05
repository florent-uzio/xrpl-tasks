import { Module } from "@nestjs/common"
import { XrplController } from "./xrpl.controller"
import { XrplService } from "./xrpl.service"

@Module({
  controllers: [XrplController],
  providers: [XrplService],
  exports: [XrplService],
})
export class XrplModule {}
