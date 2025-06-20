const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const fs = require('fs');
const path = require('path');
const jwt = require('jsonwebtoken');
const { faker } = require('@faker-js/faker');
const User = require('../models/Users');
const Listing = require('../models/PropListings');
require('dotenv').config();

const JWT_SECRET = process.env.JWT_SECRET || 'defaultsecret';

function generateIndianMobileNumber() {
  const firstDigit = faker.helpers.arrayElement(['6', '7', '8', '9']);
  const restDigits = faker.string.numeric(9);
  return firstDigit + restDigits;
}
const seedUsers = async (numUsers = 5) => {
  const users = [];
  const tokens = [];

  
  const minHosts = 1;
  let hostsCreated = 0;

  for (let i = 0; i < numUsers; i++) {
   
    const role = hostsCreated < minHosts
      ? 'host'
      : faker.helpers.arrayElement(['guest', 'admin']);

    if (role === 'host') hostsCreated++;

    const passwordHash = await bcrypt.hash('password123', 12);

    const user = {
      firstName: faker.person.firstName(),
      lastName: faker.person.lastName(),
      email: faker.internet.email(),
      password: passwordHash,
      phone: generateIndianMobileNumber(),
      role,
      isVerified: true,
    };

    if (role === 'host') {
      user.hostProfile = {
        bio: faker.lorem.sentence(),
        superhost: faker.datatype.boolean()
      };
    }

    users.push(user);
  }

  await User.deleteMany({});
  const insertedUsers = await User.insertMany(users);

 
  insertedUsers.forEach(user => {
    const token = jwt.sign(
      { id: user._id, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    tokens.push(`Email: ${user.email}\nToken: ${token}\n`);
  });

  // Save tokens to token.txt
  const filePath = path.join(__dirname, 'token.txt');
  fs.writeFileSync(filePath, tokens.join('\n'), 'utf8');

  console.log('Users seeded and tokens saved to token.txt');
  return insertedUsers;
};

const seedListings = async (hosts, numListings = 5) => {
  const listings = [];

  for (let i = 0; i < numListings; i++) {
    const coordinates = [parseFloat(faker.location.longitude()), parseFloat(faker.location.latitude())];

    listings.push({
      title: faker.lorem.words(3),
      description: faker.lorem.paragraph(),
      host: faker.helpers.arrayElement(hosts)._id,
      propertyType: faker.helpers.arrayElement(['apartment', 'cabin', 'villa', 'house']),
      roomType: faker.helpers.arrayElement(['entire-place', 'private-room', 'shared-room']),
      location: {
        address: faker.location.streetAddress(),
        city: faker.location.city(),
        country: faker.location.country(),
        coordinates: {
          type: 'Point',
          coordinates
        }
      },
      pricing: {
        basePrice: faker.number.int({ min: 50, max: 300 }),
        cleaningFee: faker.number.int({ min: 10, max: 50 }),
        weeklyDiscount: faker.number.int({ min: 5, max: 20 })
      },
      capacity: {
        guests: faker.number.int({ min: 1, max: 6 }),
        bedrooms: faker.number.int({ min: 1, max: 4 }),
        beds: faker.number.int({ min: 1, max: 4 }),
        bathrooms: faker.number.int({ min: 1, max: 3 })
      },
      amenities: faker.helpers.arrayElements(['wifi', 'kitchen', 'air-conditioning', 'tv', 'pool', 'hot-tub'], 3),
      images: [
        {
          url: faker.image.url(),
          isPrimary: true
        }
      ],
      status: 'active',
      featured: faker.datatype.boolean()
    });
  }

  await Listing.deleteMany({});
  const result = await Listing.insertMany(listings);
  console.log(`Successfully inserted ${result.length} listings`);
  return result;
};

const seedDatabase = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/stayfinder', {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });

    const users = await seedUsers(5);
    const hosts = users.filter(user => user.role === 'host');
    console.log(`Available Hosts: ${hosts.length}`); 
    if (hosts.length === 0) throw new Error('No hosts found!');
    await seedListings(hosts, 20);

    mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error('Seeding error:', error);
    process.exit(1);
  }
};

seedDatabase();
