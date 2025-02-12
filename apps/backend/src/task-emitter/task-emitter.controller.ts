import { Controller } from '@nestjs/common';
import { TaskEmitterService } from './task-emitter.service';

@Controller('task-emitter')
export class TaskEmitterController {
  constructor(private readonly taskEmitterService: TaskEmitterService) {}
}
