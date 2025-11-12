const request = require('supertest');
const app = require('../../src/app');

describe('Student-Course API integration', () => {
  beforeEach(() => {
    require('../../src/services/storage').reset();
    require('../../src/services/storage').seed();
  });

  test('GET /students should return seeded students', async () => {
    const res = await request(app).get('/students');
    expect(res.statusCode).toBe(200);
    expect(res.body.students.length).toBe(3);
    expect(res.body.students[0].name).toBe('Alice');
  });

  test('POST /students should create a new student', async () => {
    const res = await request(app).post('/students').send({
      name: 'David',
      email: 'david@example.com',
    });
    expect(res.statusCode).toBe(201);
    expect(res.body.name).toBe('David');
  });

  test('POST /students should not allow duplicate email', async () => {
    const res = await request(app).post('/students').send({
      name: 'Eve',
      email: 'alice@example.com',
    });
    expect(res.statusCode).toBe(400);
  });

  test('UPDATE /students/:id should update a student', async () => {
    const res1 = await request(app).get('/students/1');
    expect(res1.statusCode).toBe(200);
    expect(res1.body.student).toHaveProperty('name');
    expect(res1.body.student).toHaveProperty('email');
    expect(res1.body.student.id).toBe(1);

    const res = await request(app).put('/students/1').send({
      name: 'Julie',
      email: 'julie@example.com',
    });
    expect(res.statusCode).toBe(200);
    expect(res.body.name).toBe('Julie');
    expect(res.body.email).toBe('julie@example.com');
  });

  test('DELETE /students/:id should delete a student', async () => {
    const students = await request(app).get('/students');
    const studentId = students.body.students[0].id;
    await request(app).post(`/students/${studentId}`);
    const res = await request(app).delete(`/students/${studentId}`);
    expect(res.statusCode).toBe(400);
  });

  test('DELETE /students/:id should return 404 if student not found', async () => {
    const res = await request(app).delete('/students/999');
    expect(res.statusCode).toBe(404);
    expect(res.body.error).toBe('Student not found');
  });


  //tests courses
  test('GET /courses/:id should return course and its students', async () => {
    const res = await request(app).get('/courses/1');
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('course');
    expect(res.body).toHaveProperty('students');

    expect(res.body.course.id).toBe(1);

    expect(Array.isArray(res.body.students)).toBe(true);
    const res1 = await request(app).get('/students');
    expect(res1.body.students.length).toBe(2);
    expect(res1.body.students[0].name).toBe('Alice');
    expect(res1.body.students[1].name).toBe('Bob');
  });

  test('GET /courses/:id should return 404 if course not found', async () => {
    const res = await request(app).get('/courses/999');
    expect(res.statusCode).toBe(404);
    expect(res.body).toHaveProperty('error', 'Course not found');
  });

  test('POST /courses should create a new course', async () => {
    const res = await request(app).post('/courses').send({
      title: 'fffff',
      teacher: 'Louis',
    });
    expect(res.statusCode).toBe(201);
    expect(res.body.teacher).toBe('Louis');
    expect(res.body.title).toBe('fffff');
  });

  test('UPDATE /courses/:id should update a course', async () => {
    const res1 = await request(app).get('/courses/1');
    expect(res1.statusCode).toBe(200);
    expect(res1.body).toHaveProperty('course');
    expect(res1.body.course.id).toBe(1);

    const res = await request(app).put('/courses/1').send({
      title: 'Updated Course',
      teacher: 'Louis',
    });
    expect(res.statusCode).toBe(200);
    expect(res.body.teacher).toBe('Louis');
    expect(res.body.title).toBe('Updated Course');
  });

  test('DELETE /courses/:id should delete a course even if students are enrolled', async () => {
    const courses = await request(app).get('/courses');
    const courseId = courses.body.courses[0].id;
    await request(app).post(`/courses/${courseId}/students/1`);
    const res = await request(app).delete(`/courses/${courseId}`);
    expect(res.statusCode).toBe(400);
  });

  test('DELETE /courses/:id should return 404 if course not found', async () => {
    const res = await request(app).delete('/courses/999');
    expect(res.statusCode).toBe(404);
    expect(res.body.error).toBe('Course not found');
  });
});
