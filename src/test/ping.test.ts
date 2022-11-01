import 'should';
import supertest from 'supertest';
import App from '../app';

const request = supertest(App.instance.app);

describe('express api test', () => {
  describe('GET /ping', () => {
    it('GET /ping', done => {
      request
        .get('/ping')
        .expect(200)
        .end(function (error, res) {
          res.body.should.equal('OK');
          if (error) throw error;
          done();
        });
    });
  });
});
