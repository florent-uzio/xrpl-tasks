import { Inject, Injectable } from "@nestjs/common"
import { EventEmitter2 } from "@nestjs/event-emitter"
import { TaskModule, TaskStatus } from "./task-emitter.types"

@Injectable()
export class TaskEmitterService {
  constructor(
    private readonly eventEmitter: EventEmitter2,
    @Inject("TASK_MODULE") private readonly moduleType: TaskModule,
  ) {}

  emitTaskUpdate(task: string, status: TaskStatus) {
    this.eventEmitter.emit("task.update", { task, type: this.moduleType, status })
  }
}
