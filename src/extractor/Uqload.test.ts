import winston from 'winston';
import { createTestContext } from '../test';
import { CountryCode } from '../types';
import { FetcherMock } from '../utils';
import { ExtractorRegistry } from './ExtractorRegistry';
import { Uqload } from './Uqload';

const logger = winston.createLogger({ transports: [new winston.transports.Console({ level: 'nope' })] });
const extractorRegistry = new ExtractorRegistry(logger, [new Uqload(new FetcherMock(`${__dirname}/__fixtures__/Uqload`))]);

const ctx = createTestContext({ mediaFlowProxyUrl: 'https://mediaflow-proxy.test', mediaFlowProxyPassword: 'asdfg' });

describe('Uqload', () => {
  test('uqload.net /embed-', async () => {
    expect(await extractorRegistry.handle(ctx, new URL('https://uqload.net/embed-z0xbr87oz637.html'), CountryCode.fr)).toMatchSnapshot();
  });

  test('uqload.net /', async () => {
    expect(await extractorRegistry.handle(ctx, new URL('https://uqload.net/z0xbr87oz637.html'), CountryCode.fr)).toMatchSnapshot();
  });
});
