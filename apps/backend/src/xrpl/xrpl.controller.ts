import { Controller } from '@nestjs/common';
import { XrplService } from './xrpl.service';

@Controller('xrpl')
export class XrplController {
  constructor(private readonly xrplService: XrplService) {}
}
