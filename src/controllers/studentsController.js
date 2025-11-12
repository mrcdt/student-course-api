const s = require('../services/storage');
/**
 * @swagger
 * tags:
 *   name: Students
 *   description: Gestion des cours
 */

/**
 * @swagger
 * /students:
 *   get:
 *     summary: Lister les étudiants
 *     description: Fait la liste de tous les étudiants avec le nom et l'email sur plusieurs page avec la possibilite de filtrer en fonction du **name** ou du **email**
 *     tags: [Students]
 *     parameters:
 *       - in: query
 *         name: name
 *         schema: { type: string }
 *         description: Filtrer par nom
 *       - in: query
 *         name: email
 *         schema: { type: string }
 *         description: Filtrer par email
 *     responses:
 *       200:
 *         description: Liste des étudiants
 */
exports.listStudents = (req, res) => {
  let students = s.list('students');
  const { name, email, page = 1, limit = 10 } = req.query;
  if (name) students = students.filter((st) => st.name.includes(name));
  if (email) students = students.filter((st) => st.email.includes(email));
  const start = (page - 1) * limit;
  const paginated = students.slice(start, start + Number(limit));
  res.json({
    students: paginated,
    total: students.length,
  });
};

/**
 * @swagger
 * /students/{id}:
 *   get:
 *     summary: Récupérer un étudiant
 *     description : récupère un seul étudiant en fonction de son id ainsi que les cours auxquels il est inscrit
 *     tags: [Students]
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: OK
 *       404:
 *         description: Non trouvé
 */
exports.getStudent = (a, b) => {
  const c = s.get('students', a.params.id);
  if (!c)
    return b.status(404).json({
      error: 'Student not found',
    });
  const courses = s.getStudentCourses(a.params.id);
  return b.json({
    student: c,
    courses,
  });
};

/**
 * @swagger
 * /students:
 *   post:
 *     summary: Créer un étudiant
 *     tags: [Students]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               email:
 *                 type: string
 *             required:
 *               - name
 *               - email
 *     responses:
 *       201:
 *         description: Créé
 *       400:
 *         description: Paramètres invalides ou erreur lors de la création
 */
exports.createStudent = (req, res) => {
  const { name, email } = req.body;
  if (!name || !email)
    return res.status(400).json({
      error: 'name and email required',
    });
  const result = s.create('students', {
    name,
    email,
  });
  if (result.error)
    return res.status(400).json({
      error: result.error,
    });
  return res.status(201).json(result);
};

/**
 * @swagger
 * /students/{id}:
 *   delete:
 *     description: Supprimer un étudiant
 *     summary: Supprimer un étudiant avec son id
 *     tags: [Students]
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       204:
 *         description: Supprimé
 *       404:
 *         description: Non trouvé
 *       400:
 *         description erreur lors de la suppression
 */
exports.deleteStudent = (req, res) => {
  const result = s.remove('students', req.params.id);
  if (result === false)
    return res.status(404).json({
      error: 'Student not found',
    });
  if (result.error)
    return res.status(400).json({
      error: result.error,
    });
  return res.status(204).send();
};

/**
 * @swagger
 * /students/{id}:
 *   put:
 *     summary: Mettre à jour un cours
 *     description : mise à jour d'un étudiant en fonction de son id et en récupérant les nouvelles données (nom et email) dans le body
 *     tags: [Students]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *         description: ID de l'étudiant
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               email:
 *                 type: string
 *     responses:
 *       200:
 *         description: Etudiant mis à jour
 *       400:
 *         description: Données invalides
 *       404:
 *         description: Etudiant non trouvé
 */
exports.updateStudent = (req, res) => {
  const student = s.get('students', req.params.id);
  if (!student)
    return res.status(404).json({
      error: 'Student not found',
    });
  const { name, email } = req.body;
  if (
    email &&
    s.list('students').find((st) => st.email === email && st.id !== student.id)
  ) {
    return res.status(400).json({
      error: 'Email must be unique',
    });
  }
  if (name) student.name = name;
  if (email) student.email = email;
  return res.json(student);
};
