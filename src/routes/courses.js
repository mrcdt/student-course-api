const express = require('express');
/**
 * @swagger
 * tags:
 *   name: Autres
 *   description: Gestion des cours
 */
const {
  listCourses,
  getCourse,
  createCourse,
  deleteCourse,
  updateCourse,
} = require('../controllers/coursesController');

const router = express.Router();

router.get('/', listCourses);
router.get('/:id', getCourse);
router.post('/', createCourse);
router.delete('/:id', deleteCourse);

/**
 * @swagger
 * /{id_course}/students/{id_student}:
 *   post:
 *     summary: Ajouter un étudiant à un cours
 *     tags: [Autres]
 *     parameters:
 *       - in: path
 *         name: id_course
 *         required: true
 *         schema: { type: string }
 *         description: ID du cours
 *       - in: path
 *         name: id_student
 *         required: true
 *         schema: { type: string }
 *         description: ID de l'étudiant
 *     responses:
 *       201:
 *         description: Créé
 *       400:
 *         description: Paramètres invalides ou erreur lors de la création
 */
router.post('/:courseId/students/:studentId', (req, res) => {
  const result = require('../services/storage').enroll(
    req.params.studentId,
    req.params.courseId
  );
  if (result.error)
    return res.status(400).json({
      error: result.error,
    });
  return res.status(201).json({
    success: true,
  });
});

/**
 * @swagger
 * /{id_course}/students/{id_student}:
 *   delete:
 *     summary: Supprimer un étudiant d'un cours
 *     tags: [Autres]
 *     parameters:
 *       - in: path
 *         name: id_course
 *         required: true
 *         schema: { type: string }
 *         description: ID du cours
 *       - in: path
 *         name: id_student
 *         required: true
 *         schema: { type: string }
 *         description: ID de l'étudiant
 *     responses:
 *       204:
 *         description: étudiante désinscrit avec succès
 *       404:
 *         description: étudiant ou cours invalide
 */
router.delete('/:courseId/students/:studentId', (req, res) => {
  const result = require('../services/storage').unenroll(
    req.params.studentId,
    req.params.courseId
  );
  if (result.error)
    return res.status(404).json({
      error: result.error,
    });
  return res.status(204).send();
});

router.put('/:id', updateCourse);

module.exports = router;
