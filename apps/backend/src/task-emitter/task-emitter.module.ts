import { DynamicModule } from "@nestjs/common"
import { TaskEmitterService } from "./task-emitter.service"

// @Module({
//   controllers: [TaskEmitterController],
//   providers: [TaskEmitterService],
//   exports: [TaskEmitterService],
// })
export class TaskEmitterModule {
  static forFeature(moduleType: string): DynamicModule {
    return {
      module: TaskEmitterModule,
      providers: [
        { provide: "TASK_MODULE", useValue: moduleType }, // Dynamically inject the module type
        TaskEmitterService,
      ],
      exports: [TaskEmitterService],
    }
  }
}
