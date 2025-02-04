import { Injectable, Logger } from '@nestjs/common';
import axios, { AxiosError, isAxiosError } from 'axios';
import { join } from 'node:path';
import { BsSession } from './bluesky.types';

@Injectable()
export class BlueskyInterface {
  private logger: Logger = new Logger(BlueskyInterface.name);

  baseUrl = 'https://bsky.social';

  getUrl(path: string) {
    return join(this.baseUrl, path);
  }

  getHeaders(token: string) {
    return {
      Authorization: `bearer ${token}`,
    };
  }

  logErr(method: string, url: string, err: AxiosError) {
    this.logger.error(
      JSON.stringify(
        {
          method: method.toUpperCase(),
          url,
          code: err.code,
          message: err.message,
          status: err.response?.status,
          statusText: err.response?.statusText,
          header: err.response?.headers,
          body: err.response?.data,
        },
        undefined,
        2,
      ),
    );
  }

  getErrorMessage(err: unknown): string {
    if (err && typeof err === 'object' && 'message' in err) {
      return err.message as string;
    }
    if (
      err &&
      [
        'string',
        'number',
        'bigint',
        'boolean',
        'symbol',
        'object',
        'function',
      ].includes(typeof err)
    ) {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
      return (err as any).toString();
    }
    return 'unknown';
  }

  async createSession(identifier: string, password: string) {
    const url = this.getUrl('xrpc/com.atproto.server.createSession');
    try {
      const response = await axios.post<BsSession>(url, {
        identifier,
        password,
      });
      return response.data;
    } catch (error) {
      if (isAxiosError(error)) this.logErr('post', url, error);
      throw new Error(
        `An error occurred during session creation : ${this.getErrorMessage(error)}`,
      );
    }
  }

  async refreshSession(refreshJwt: string) {
    const url = this.getUrl('xrpc/com.atproto.server.refreshSession');
    const headers = this.getHeaders(refreshJwt);
    try {
      const response = await axios.post<BsSession>(url, undefined, {
        headers,
      });
      return response.data;
    } catch (error) {
      if (isAxiosError(error)) this.logErr('post', url, error);
      throw new Error(
        `An error occurred while refreshing the session : ${this.getErrorMessage(error)}`,
      );
    }
  }
}
