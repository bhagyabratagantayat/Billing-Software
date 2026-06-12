const express = require('express');
const router = express.Router();
const { getTrashItems, restoreTrashItem, deleteTrashItem, emptyTrash } = require('../controllers/trashController');
const { protect, requireRole } = require('../middleware/authMiddleware');

router.get('/', protect, requireRole('admin', 'ceo'), getTrashItems);
router.delete('/empty', protect, requireRole('ceo'), emptyTrash);
router.put('/:type/:id/restore', protect, requireRole('admin', 'ceo'), restoreTrashItem);
router.delete('/:type/:id', protect, requireRole('ceo'), deleteTrashItem);

module.exports = router;
