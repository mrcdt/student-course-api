const request = require('supertest');
const app = require('../../src/app');

describe('Student-Course API integration', () => {
  beforeEach(() => {
    require('../../src/services/storage').reset();
    require('../../src/services/storage').seed();
  });

  test('GET /students doit renvoyer les étudiants', async () => {
    const res = await request(app).get('/students');
    expect(res.statusCode).toBe(200);
    expect(res.body.students.length).toBe(3);
    expect(res.body.students[0].name).toBe('Alice');
  });

  test('GET /students/:id should return 404 if student not found', async () => {
    const res = await request(app).get('/students/999');
    expect(res.statusCode).toBe(404);
    expect(res.body).toHaveProperty('error', 'Student not found');
  });

  test('PUT /students/:id retourne 404 si l’étudiant n’existe pas', async () => {
    const res = await request(app).put('/students/999').send({
      name: 'boby',
      email: 'boby@example.com',
    });
    expect(res.statusCode).toBe(404);
    expect(res.body.error).toBe('Student not found');
  });

  test('PUT /students/:id retourne 400 si l’email est déjà utilisé par un autre étudiant', async () => {
    const res = await request(app).put('/students/2').send({
      email: 'alice@example.com',
    });

    expect(res.statusCode).toBe(400);
    expect(res.body.error).toBe('Email must be unique');
  });

  test('PUT /students/:id met à jour le name seulement', async () => {
    const res = await request(app).put('/students/1').send({
      name: 'Alice 2',
    });

    expect(res.statusCode).toBe(200);
    expect(res.body.name).toBe('Alice 2');
    expect(res.body.email).toBeDefined();
  });

  test('PUT /students/:id met à jour l’email seulement', async () => {
    const res = await request(app).put('/students/1').send({
      email: 'alice2@example.com',
    });

    expect(res.statusCode).toBe(200);
    expect(res.body.email).toBe('alice2@example.com');
    expect(res.body.name).toBeDefined();
  });

  test('POST /students retourne 400 si body vide', async () => {
    const res = await request(app).post('/students').send({});
    expect(res.statusCode).toBe(400);
    expect(res.body.error).toBeDefined();
  });

  test(`POST /:courseId/students/:studentId retourne 400 si l'étudiant est inexistant`, async () => {
    const res = await request(app).post('/courses/1/students/999'); // studentId 999 n’existe pas
    expect(res.status).toBe(400);
    expect(res.body.error).toBe('Student not found');
  });

  test(`POST /:courseId/students/:studentId retourne 400 si le cours est inexistant`, async () => {
    const res = await request(app).post('/courses/999/students/1'); // courseId 999 n’existe pas
    expect(res.status).toBe(400);
    expect(res.body.error).toBe('Course not found');
  });

  test('POST /students peut créer un nouvel étudient', async () => {
    const res = await request(app).post('/students').send({
      name: 'David',
      email: 'david@example.com',
    });
    expect(res.statusCode).toBe(201);
    expect(res.body.name).toBe('David');
  });

  test(`POST /students peut pas autoriser la duplication d'email`, async () => {
    const res = await request(app).post('/students').send({
      name: 'Eve',
      email: 'alice@example.com',
    });
    expect(res.statusCode).toBe(400);
  });

  test('UPDATE /students/:id peut mettre à jour un étudiant', async () => {
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

  test('DELETE /students/:id peut supprimer un étudiant', async () => {
    const students = await request(app).get('/students');
    const studentId = students.body.students[0].id;
    await request(app).post(`/students/${studentId}`);
    const res = await request(app).delete(`/students/${studentId}`);
    expect(res.statusCode).toBe(204);
  });

  test('DELETE /students/:id peut pas supprimer un étudiant inexistant', async () => {
    const res = await request(app).delete('/students/999');
    expect(res.statusCode).toBe(404);
    expect(res.body.error).toBe('Student not found');
  });

  test('DELETE /students/:id retourne 400 si l’étudiant est inscrit à un cours', async () => {
    await request(app).post('/students').send({
      name: 'a',
      email: 'a@example.com',
    });
    await request(app).post('/courses').send({
      title: 'nouveau cours',
      teacher: 'prof a',
    });
    await request(app).post('/courses/1/students/4'); // On inscrit l’étudiant au cours

    const res = await request(app).delete('/students/4');
    expect(res.statusCode).toBe(400);
    expect(res.body.error).toBe('Cannot delete student: enrolled in a course');
  });

  test(`DELETE /:courseId/students/:studentId retourne 404 si l'étudiant est inexistant`, async () => {
    const res = await request(app).delete('/courses/1/students/999'); // studentId 999 n’existe pas
    expect(res.status).toBe(404);
    expect(res.body.error).toBe('Enrollment not found');
  });

  test(`DELETE /:courseId/students/:studentId retourne 404 si le cours est inexistant`, async () => {
    const res = await request(app).delete('/courses/999/students/1'); // courseId 999 n’existe pas
    expect(res.status).toBe(404);
    expect(res.body.error).toBe('Enrollment not found');
  });

  //tests courses
  test('GET /courses/:id peut retourner une course et ses étudiants', async () => {
    const res = await request(app).get('/courses/1');
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('course');
    expect(res.body).toHaveProperty('students');

    expect(res.body.course.id).toBe(1);

    expect(Array.isArray(res.body.students)).toBe(true);
    const res1 = await request(app).get('/students');
    expect(res1.body.students.length).toBe(3);
    expect(res1.body.students[0].name).toBe('Alice');
    expect(res1.body.students[1].name).toBe('Bob');
  });

  test('GET /courses/:id should return 404 if course not found', async () => {
    const res = await request(app).get('/courses/999');
    expect(res.statusCode).toBe(404);
    expect(res.body).toHaveProperty('error', 'Course not found');
  });

  test('POST /courses peut créer une nouvelle course', async () => {
    const res = await request(app).post('/courses').send({
      title: 'fffff',
      teacher: 'Louis',
    });
    expect(res.statusCode).toBe(201);
    expect(res.body.teacher).toBe('Louis');
    expect(res.body.title).toBe('fffff');
  });

  test('POST /courses retourne 400 si title manquant', async () => {
    const res = await request(app).post('/courses').send({
      teacher: 'madame b',
    });
    expect(res.statusCode).toBe(400);
    expect(res.body.error).toBe('title and teacher required');
  });

  test('POST /courses retourne 400 si teacher manquant', async () => {
    const res = await request(app).post('/courses').send({
      title: 'Math',
    });
    expect(res.statusCode).toBe(400);
    expect(res.body.error).toBe('title and teacher required');
  });

  test('PUT /courses/:id retourne 404 si le cours n’existe pas', async () => {
    const res = await request(app).put('/courses/999').send({
      title: 'physique',
    });
    expect(res.statusCode).toBe(404);
    expect(res.body.error).toBe('Course not found');
  });

  test('PUT /courses/:id retourne 400 si le titre existe déjà', async () => {
    await request(app).post('/courses').send({
      title: 'svt',
      teacher: 'madame cellule',
    });

    const res = await request(app).put('/courses/1').send({
      title: 'svt',
    });
    expect(res.statusCode).toBe(400);
    expect(res.body.error).toBe('Course title must be unique');
  });

  test('PUT /courses/:id met à jour seulement le titre', async () => {
    const res = await request(app).put('/courses/1').send({
      title: 'chimie',
    });
    expect(res.statusCode).toBe(200);
    expect(res.body.title).toBe('chimie');
    expect(res.body.teacher).toBeDefined();
  });

  test('PUT /courses/:id met à jour seulement le teacher', async () => {
    const res = await request(app).put('/courses/1').send({
      teacher: 'lulu',
    });
    expect(res.statusCode).toBe(200);
    expect(res.body.teacher).toBe('lulu');
    expect(res.body.title).toBeDefined();
  });

  test('PUT /courses/:id met à jour titre et teacher', async () => {
    const res = await request(app).put('/courses/1').send({
      title: 'sport',
      teacher: 'mr foot',
    });
    expect(res.statusCode).toBe(200);
    expect(res.body.title).toBe('sport');
    expect(res.body.teacher).toBe('mr foot');
  });

  test('UPDATE /courses/:id peut mettre à jour une nouvelle course', async () => {
    const res1 = await request(app).get('/courses/1');
    expect(res1.statusCode).toBe(200);
    expect(res1.body).toHaveProperty('course');
    expect(res1.body.course.id).toBe(1);

    const res = await request(app).put('/courses/1').send({
      title: 'dance',
      teacher: 'Louis',
    });
    expect(res.statusCode).toBe(200);
    expect(res.body.teacher).toBe('Louis');
    expect(res.body.title).toBe('dance');
  });

  test(`DELETE /courses/:id peut supprimer un cours même s'il ya des étudiants`, async () => {
    const courses = await request(app).get('/courses');
    const courseId = courses.body.courses[0].id;
    await request(app).post(`/courses/${courseId}/students/1`);
    const res = await request(app).delete(`/courses/${courseId}`);
    expect(res.statusCode).toBe(400);
  });

  test('DELETE /courses/:id ne peut pas supprimer un cours inexistant', async () => {
    const res = await request(app).delete('/courses/999');
    expect(res.statusCode).toBe(404);
    expect(res.body.error).toBe('Course not found');
  });

  test('DELETE /courses/:id retourne 204 si le cours est supprimé avec succès', async () => {
    const newCourse = await request(app).post('/courses').send({
      title: 'cours',
      teacher: 'prof',
    });

    const res = await request(app).delete(`/courses/${newCourse.body.id}`);

    expect(res.statusCode).toBe(204);
  });

  test('DELETE /courses/:courseId/students/:studentId supprime l’inscription avec succès', async () => {
    await request(app).post('/courses/1/students/1');

    const res = await request(app).delete('/courses/1/students/1');

    expect(res.statusCode).toBe(204);
  });
});
