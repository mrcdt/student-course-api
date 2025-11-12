const storage = require('../../src/services/storage');

beforeEach(() => {
  storage.reset();
  storage.seed();
});

test('peut pas autoriser 2 fois le même nom de cours', () => {
  const result = storage.create('courses', {
    title: 'Math',
    teacher: 'Someone',
  });
  expect(result.error).toBe('Course title must be unique');
});

test('peut lister les étudiants', () => {
  const students = storage.list('students');
  expect(students.length).toBe(3);
  expect(students[0].name).toBe('Alice');
});

test(`création d'un nouvel étudiant`, () => {
  const result = storage.create('students', {
    name: 'David',
    email: 'david@example.com',
  });
  expect(result.name).toBe('David');
  expect(storage.list('students').length).toBe(4);
});

test(`peut pas autoriser 2 fois l'email d'un même etudiant`, () => {
  const result = storage.create('students', {
    name: 'Eve',
    email: 'alice@example.com',
  });
  expect(result.error).toBe('Email must be unique');
});

test('peut supprimer un étudiant', () => {
  const students = storage.list('students');
  const result = storage.remove('students', students[0].id);
  expect(result).toBe(true);
});

test('ne peut pas ajouter plus de 3 étudiants à une course', () => {
  const students = storage.list('students');
  const course = storage.list('courses')[0];

  storage.create('students', {
    name: 'Extra',
    email: 'extra@example.com',
  });
  storage.create('students', {
    name: 'Extra2',
    email: 'extra2@example.com',
  });

  storage.enroll(students[0].id, course.id);
  storage.enroll(students[1].id, course.id);
  storage.enroll(students[2].id, course.id);
  const result = storage.enroll(students[3].id, course.id);
  expect(result.error).toBe('Course is full');
});

test('peut créer un nouveau cours', () => {
  const result = storage.create('courses', {
    title: 'Chemistry',
    teacher: 'Dr. White',
  });
  expect(result.title).toBe('Chemistry');
  expect(storage.list('courses').length).toBe(4);
});

test(`peut inscrire un étudiant à un cours`, () => {
  const student = storage.list('students')[0];
  const course = storage.list('courses')[1];
  const result = storage.enroll(student.id, course.id);
  expect(result.success).toBe(true);
  const studentsInCourse = storage.getCourseStudents(course.id);
  expect(studentsInCourse.map((s) => s.id)).toContain(student.id);
});

test(`peut désinscrire un étudiant à un cours`, () => {
  const student = storage.list('students')[0];
  const course = storage.list('courses')[0];
  storage.enroll(student.id, course.id);
  const result = storage.unenroll(student.id, course.id);
  expect(result.success).toBe(true);
  const studentsInCourse = storage.getCourseStudents(course.id);
  expect(studentsInCourse.map((s) => s.id)).not.toContain(student.id);
});

test(`peut récupérer des cours d'un étudiant`, () => {
  const student = storage.list('students')[1];
  const courses = storage.list('courses');
  storage.enroll(student.id, courses[0].id);
  storage.enroll(student.id, courses[1].id);
  const studentCourses = storage.getStudentCourses(student.id);
  expect(studentCourses.length).toBe(2);
  expect(studentCourses.map((c) => c.id)).toEqual([
    courses[0].id,
    courses[1].id,
  ]);
});

test('ne peut pas inscrire 2 fois un étudiant au même cours', () => {
  const student = storage.list('students')[0];
  const course = storage.list('courses')[0];

  // Première inscription
  const firstEnroll = storage.enroll(student.id, course.id);
  expect(firstEnroll.success).toBe(true);

  // Deuxième inscription (devrait échouer)
  const secondEnroll = storage.enroll(student.id, course.id);
  expect(secondEnroll.error).toBe('Student already enrolled in this course');
});
