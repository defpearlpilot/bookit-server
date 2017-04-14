import {Meetings} from '../../src/service/Meetings';
import {MeetingHelper} from '../../src/utils/data/MeetingHelper';
import * as moment from 'moment';
import {expect} from 'chai';
import {Participant} from '../../src/model/Participant';
import {MeetingsOps} from '../../src/service/MeetingsOps';
import {Moment} from 'moment';

export default function StatefulSpec(svc: Meetings, description: string) {
  description = description || '???';

  const ROMAN_ID = 'romans@myews.onmicrosoft.com';
  const nonExistentRoomId = 'find a library to create unique id';
  const existingRoomId = 'cyan-room@myews.onmicrosoft.com';
  const helper = MeetingHelper.calendarOf(ROMAN_ID, svc);
  const roomHelper = MeetingHelper.calendarOf(existingRoomId, svc);
  const ops = new MeetingsOps(svc);

  const start = moment().add(20 + Math.random() * 20, 'days').startOf('day');
  const end = start.clone().add(1, 'day');
  const subject = 'helper made!!';

  function dropEvents(helper: MeetingHelper, start: Moment, end: Moment) {
    return retry(() =>
      helper.cleanupMeetings(start.clone().subtract(10, 'minutes'), end)
        .then(() => svc.getMeetings(helper.owner.email, start, end)), val => {
      return val.length === 0; });
  }

  function cleanup(): Promise<any> {
    return Promise.all([dropEvents(helper, start, end), dropEvents(roomHelper, start, end)]);
  }

  function setup(action: any): BeforeAfter {
    return new BeforeAfter(action);
  }

  function retry(action: () => Promise<any>, check: (val: any) => boolean): Promise<any> {
    const retryFunc = (val: boolean) => {
      if (!check(val)) {
        return retry(action, check);
      } else {
        return val;
      }
    };
    return action().then(retryFunc, () => retry(action, check));
  }

// todo mocha?
  class BeforeAfter {
    constructor(private setup: any) {
    }

    test(steps: any): any {
      return () => this.setup().then(steps);
    }
  }

  describe(description, () => {

    beforeEach(() => {
      return cleanup();
    });

    it('cleanup works',
      setup(() => {
        return helper.createEvent(subject, start.clone().add(100, 'minute'), moment.duration(1, 'minute'), [{
          name: 'Joe',
          email: existingRoomId
        }])
          .then(() => retry(() => svc.getMeetings(existingRoomId, start.clone().add(100, 'minute'), start.clone().add(101, 'minute')), val => val.length > 0))
          .then(cleanup);
      }).test(() => {

        return svc.getMeetings(existingRoomId, start, end).then(meetings => {
          expect(meetings.length).to.be.eq(0);
        });
      }));

    it('returns a list of meetings for the room (room auto accepts!)',
      setup(() => {
        return helper.createEvent(subject, start.clone().add(1, 'minute'), moment.duration(1, 'minute'), [{
          name: 'Joe',
          email: existingRoomId
        }]);
      }).test(() => {
        return retry(() => svc.getMeetings(existingRoomId, start, end), val => val.length > 0).then(meetings => {
          expect(meetings.length).to.be.eq(1);
          // FIXME: unstable (sometimes it returns user name??!!)
          //expect(meetings[0].title).to.be.eq(subject);
          expect(meetings[0].owner.email).to.be.eq(ROMAN_ID);
          expect(meetings[0].participants.map((p: Participant) => p.email)).to.be
            .deep.eq([ROMAN_ID, existingRoomId]);
        });
      }));

    it('returns a list of meetings with meetings which start date is before time interval start!)',
      setup(() => {
        return helper.createEvent(subject, start.clone().subtract(1, 'minute'), moment.duration(10, 'minute'), [{
          name: 'Joe',
          email: existingRoomId
        }]);
      }).test(() => {

        return retry(() => svc.getMeetings(existingRoomId, start, end), val => val.length > 0).then(meetings => {
          console.log('HAH', meetings);
          expect(meetings.length).to.be.eq(1);
          // FIXME: unstable (sometimes it returns user name??!!)
          //expect(meetings[0].title).to.be.eq(subject);
          expect(meetings[0].owner.email).to.be.eq(ROMAN_ID);
          expect(meetings[0].participants.map((p: Participant) => p.email)).to.be
            .deep.eq([ROMAN_ID, existingRoomId]);
        });
      }));

    it('correctly handles no meetings', () => {
      return svc.getMeetings(ROMAN_ID, start, end).then(meetings => {
        expect(meetings.length).to.be.eq(0);
      });
    });

    it('returns an empty array for non-existent room', () => {
      return svc.getMeetings(nonExistentRoomId, start, end).then(meetings => {
        expect(meetings.length).to.be.eq(0);
      });
    });
    it('will not allow the creation of a meeting that overlaps with an existing meeting',
      setup(() => {
        return Promise.all([
          helper.createEvent(subject, start, moment.duration(10, 'minute'), [{
            name: 'Joe',
            email: existingRoomId
          }]),
          retry(() => svc.getMeetings(existingRoomId, start, start.clone().add(10, 'minutes')), val => val.length > 0)
        ]);
      }).test(() => {
        return ops.createEvent('double booking', start.clone().add(5, 'minutes'),
          moment.duration(10, 'minutes'), {name: 'Roman', email: ROMAN_ID}, {name: 'room', email: existingRoomId})
          .then(result => {
              throw new Error('Should not be here!!!');
            },
            err => {
              expect(err).to.be.eq('This time slot is not available.');
            });
      })
    );

    after(() => {
      return cleanup();
    });
  });
}