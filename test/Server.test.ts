import * as request from 'supertest';
import { TestServer, GetRoute } from './TestServer';

describe('Get request', () => {
  it('Creates a route for get requests', async () => {
    const server = TestServer.create(3000, [GetRoute]);

    const req = await request(server.app).get('/get');

    expect(req.body.data).toHaveProperty('getRequest', 'success');
    expect(req.status).toBe(200);
  });
});
