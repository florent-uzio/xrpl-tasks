import { Test, TestingModule } from '@nestjs/testing';
import { TaskEmitterController } from './task-emitter.controller';
import { TaskEmitterService } from './task-emitter.service';

describe('TaskEmitterController', () => {
  let controller: TaskEmitterController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TaskEmitterController],
      providers: [TaskEmitterService],
    }).compile();

    controller = module.get<TaskEmitterController>(TaskEmitterController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
