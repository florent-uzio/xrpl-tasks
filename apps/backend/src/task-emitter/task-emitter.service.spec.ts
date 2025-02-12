import { Test, TestingModule } from '@nestjs/testing';
import { TaskEmitterService } from './task-emitter.service';

describe('TaskEmitterService', () => {
  let service: TaskEmitterService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [TaskEmitterService],
    }).compile();

    service = module.get<TaskEmitterService>(TaskEmitterService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
