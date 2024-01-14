import { Inject, Injectable } from '@nestjs/common';
import { Host } from './host.service';

@Injectable()
export class ErrorService {
  constructor(@Inject('Host') private readonly host: Host) {
    this.host = host;
  }
}
