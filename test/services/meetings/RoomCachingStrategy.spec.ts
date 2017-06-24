import {expect} from 'chai';
import {filterOutMeetingById, filterOutMeetingByOwner, Meeting} from '../../../src/model/Meeting';
import {Participant} from '../../../src/model/Participant';
import * as moment from 'moment';
import {IdCachingStrategy} from '../../../src/services/meetings/IdCachingStrategy';
import {OwnerCachingStrategy} from '../../../src/services/meetings/OwnerCachingStrategy';
import {RoomCachingStrategy} from '../../../src/services/meetings/RoomCachingStrategy';

/*
 export class Meeting {
 id: string;
 title: string;
 location?: string;
 owner: Participant;
 participants: Participant[];
 start: moment.Moment;
 end: moment.Moment;
 }

 */

const andrew = new Participant('andrew@wipro.com');
const paul = new Participant('paul@wipro.com');
const alex = new Participant('alex@wipro.com');

const redRoom = {displayName: 'Red'};
const blueRoom = {displayName: 'Blue'};

const first: Meeting = {
  id: '1',
  title: 'My first meeting',
  owner: andrew,
  location: blueRoom,
  participants: [],
  start: moment(),
  end: moment(),
};

const second: Meeting = {
  id: '2',
  title: 'My second meeting',
  owner: alex,
  location: redRoom,
  participants: [],
  start: moment(),
  end: moment(),
};

const third: Meeting = {
  id: '3',
  title: 'My third meeting',
  owner: paul,
  location: blueRoom,
  participants: [],
  start: moment(),
  end: moment(),
};

const fourth: Meeting = {
  id: '4',
  title: 'My fourth meeting',
  owner: alex,
  location: blueRoom,
  participants: [],
  start: moment(),
  end: moment(),
};


describe('room caching suite', function filterSuite() {
  it('caches by room', function testFilterById() {

    const cache = new Map<string, Meeting[]>();
    const roomCacher = new RoomCachingStrategy();

    [first, second, third, fourth].forEach(meeting => roomCacher.put(cache, meeting));

    const redRoomList = roomCacher.get(cache, 'Red');
    expect(redRoomList.length).to.be.equal(1);
    const redRoomSet = new Set(redRoomList.map(m => m.id));
    expect(redRoomSet.has('2')).to.be.true;

    // expect(andrewList[0].title).to.be.equal('My first meeting');

    const blueRoomList = roomCacher.get(cache, 'Blue');
    expect(blueRoomList.length).to.be.equal(3);
    const blueRoomSet = new Set(blueRoomList.map(m => m.id));
    expect(blueRoomSet.has('1')).to.be.true;
    expect(blueRoomSet.has('3')).to.be.true;
    expect(blueRoomSet.has('4')).to.be.true;
  });

});