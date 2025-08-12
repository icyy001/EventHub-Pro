const { PrismaClient } = require('@prisma/client');
const { faker } = require('@faker-js/faker');

const prisma = new PrismaClient();
const COUNT = 25;
const TOPICS = [
  'Coding Meetup','Hack Night','AI Workshop','Cybersec 101','Web Dev Study Group',
  'Data Science Talk','CTF Practice','Open Source Sprint','Algorithms Club','Startup Tech Talk'
];

function makeEvent(i) {
  const topic = TOPICS[i % TOPICS.length];
  const n = Math.floor(i / TOPICS.length) + 1;
  const title = `${topic} #${n}`;
  const description = faker.lorem.sentence();
  const location = 'Durham, UK';

  const start = new Date(Date.now() + faker.number.int({ min: 1, max: 30 }) * 864e5);
  start.setHours(18, 0, 0, 0);
  const end = new Date(start.getTime() + 2 * 3600 * 1000);

  return {
    title, description, location,
    startsAt: start, endsAt: end, price: 0,
    searchIndex: `${title} ${description} ${location}`.toLowerCase()
  };
}

async function main() {
  const count = await prisma.event.count();
  if (count === 0) {
    await prisma.event.createMany({ data: Array.from({ length: COUNT }, (_, i) => makeEvent(i)) });
  }
}

main().then(() => prisma.$disconnect()).catch(async (e) => {
  console.error(e);
  await prisma.$disconnect();
  process.exit(1);
});
