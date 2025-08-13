/* eslint-disable prettier/prettier */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { CreateSignalDto } from './../src/signals/dto/create-signal.dto';
import { UpdateSignalDto } from './../src/signals/dto/update-signal.dto';

describe('SignalsController (e2e)', () => {
  let app: INestApplication;
  let createdSignalId: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe());
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('/signals (POST)', () => {
    it('should create a new signal', () => {
      const createDto: CreateSignalDto = {
        deviceId: 'e2e-test-device',
        time: new Date(),
        dataLength: 50,
        dataVolume: 4096,
        averageSpeed: 5.5,
        durationMs: 3000,
        maxSpeed: 8.0,
      };

      return request(app.getHttpServer())
        .post('/signals')
        .send(createDto)
        .expect(201)
        .then((response) => {
          expect(response.body).toBeDefined();
          expect(response.body.deviceId).toEqual(createDto.deviceId);
          // Store the ID for subsequent tests
          createdSignalId = response.body._id;
        });
    });

    it('should return a 400 error for invalid data', () => {
      const invalidDto = { deviceId: 'bad-data' }; // Missing required fields
      return request(app.getHttpServer())
        .post('/signals')
        .send(invalidDto)
        .expect(400);
    });
  });

  describe('/signals (GET)', () => {
    it('should get all signals', () => {
      return request(app.getHttpServer())
        .get('/signals')
        .expect(200)
        .then((response) => {
          expect(Array.isArray(response.body)).toBe(true);
          expect(response.body.length).toBeGreaterThan(0);
        });
    });
  });

  describe('/signals/:id (GET)', () => {
    it('should get a single signal by its ID', () => {
      return request(app.getHttpServer())
        .get(`/signals/${createdSignalId}`)
        .expect(200)
        .then((response) => {
          expect(response.body._id).toEqual(createdSignalId);
        });
    });
  });

  describe('/signals/:id (PATCH)', () => {
    it('should update a signal', () => {
      const updateDto: UpdateSignalDto = {
        dataLength: 55,
      };

      return request(app.getHttpServer())
        .patch(`/signals/${createdSignalId}`)
        .send(updateDto)
        .expect(200)
        .then((response) => {
          expect(response.body.dataLength).toEqual(55);
        });
    });
  });

  describe('/signals/:id (DELETE)', () => {
    it('should delete a signal', () => {
      return request(app.getHttpServer())
        .delete(`/signals/${createdSignalId}`)
        .expect(204); // Expect 204 No Content for successful deletion
    });

    it('should return 404 after deleting the signal', () => {
      return request(app.getHttpServer())
        .get(`/signals/${createdSignalId}`)
        .expect(404);
    });
  });
});
