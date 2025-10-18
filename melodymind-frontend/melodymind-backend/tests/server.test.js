const request = require('supertest');
const app = require('../server'); // Adjust path if needed
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');

let mongoServer;
let server;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create(); // Use in-memory MongoDB
  const uri = mongoServer.getUri();
  await mongoose.connect(uri);

  // Create a test server instance
  server = app.listen(0, () => console.log('Test server running'));
}, 10000); // 10-second timeout

afterAll(async () => {
  await mongoose.connection.close();
  await mongoServer.stop();
  server.close(); // Close the test server
});

// Mock data
const mockUser = { name: 'TestUser', email: 'test@example.com', password: 'password123' };
const mockSong = { songId: '21', title: 'Test Song', artist: 'Test Artist', mood: 'happy', genre: 'Pop' };

describe('Server Unit Tests', () => {
  it('should create a new user', async () => {
    const res = await request(server) // Use the test server instance
      .post('/api/signup')
      .send(mockUser);
    expect(res.statusCode).toBe(201);
    expect(res.body.user).toHaveProperty('id');
    expect(res.body.user.name).toBe(mockUser.name);
    expect(res.body.user.email).toBe(mockUser.email);
  }, 5000);

  it('should login with valid credentials', async () => {
    const res = await request(server)
      .post('/api/login')
      .send({ email: mockUser.email, password: 'password123' });
    expect(res.statusCode).toBe(200);
    expect(res.body.user).toHaveProperty('id');
    expect(res.body.user.email).toBe(mockUser.email);
  }, 5000);

  it('should return songs for a valid mood', async () => {
    const Song = mongoose.model('Song');
    await Song.create(mockSong);
    const res = await request(server)
      .get('/api/songs/mood/happy');
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body[0].mood).toBe('happy');
  }, 5000);
});

describe('Server Integration Tests', () => {
  it('should signup, login, and log a song listen', async () => {
    let res = await request(server)
      .post('/api/signup')
      .send(mockUser);
    expect(res.statusCode).toBe(201);

    res = await request(server)
      .post('/api/login')
      .send({ email: mockUser.email, password: 'password123' });
    expect(res.statusCode).toBe(200);
    const userId = res.body.user.id;

    const Song = mongoose.model('Song');
    await Song.create(mockSong);
    res = await request(server)
      .post('/api/log-song')
      .send({ userId, songId: mockSong.songId });
    expect(res.statusCode).toBe(201);
    expect(res.body.message).toBe('Song listen logged');

    const UserHistory = mongoose.model('UserHistory');
    const history = await UserHistory.findOne({ userId, songId: mockSong.songId });
    expect(history).not.toBeNull();
    expect(history.title).toBe(mockSong.title);
  }, 10000);
});