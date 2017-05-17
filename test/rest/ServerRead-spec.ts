import {expect} from 'chai';
import * as express from 'express';
import * as request from 'supertest';

import {configureRoutes} from '../../src/rest/server';

import {Runtime} from '../../src/config/runtime/configuration';
import {MockMeetings} from '../service/MockMeetings';

const roomService = Runtime.roomService;
const meetingService = new MockMeetings();
const app = configureRoutes(express(), roomService, meetingService);

it('Room list is available on /rooms/nyc', (done) => {
  request(app).get('/rooms/nyc')
              .expect(200)
              .then((res) => {
                expect(res.body).to.deep.equal(roomService.getRooms('nyc'));
                done();
              });
});

describe('Meeting routes read operations', () => {
  it('Valid response contains a list of rooms', () => {
    const expectedResponse = {
      title: 'meeting 0',
      start: '2013-02-08 09',
      end: '2013-02-10 09',
      location: 'location 0',
      participants: [{name: 'part 0', email: 'part-0@designit.com'}]
    };

    request(app).get('/rooms/nyc/meetings?start=2013-02-08 09&end=2013-02-10 09')
                .expect(200)
                .then((res) => {
                  const firstMeeting = res.body[0];
                  expect(firstMeeting).to.deep.equal(expectedResponse);
                });
  });

  it('start or end must be set in the request', (done) => {
    request(app).get('/rooms/nyc/meetings')
                .expect(400, done);
  });
});

