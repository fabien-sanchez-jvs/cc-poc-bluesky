import { Injectable } from '@nestjs/common';
import { BlueskyInterface } from './bluesky.interface';

@Injectable()
export class BlueskyService {
  constructor(private readonly bsky: BlueskyInterface) {}
  async login(user: string, pass: string) {
    return await this.bsky.createSession(user, pass);
  }
}
