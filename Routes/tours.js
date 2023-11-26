const express=require('express');
const router=express.Router();
const tourController=require('../controllers/tourController');

router.post('/',tourController.createTour);
router.get('/tour-stats',tourController.getTourStats);
router.get('/montly-plan/:year',tourController.getMontlyPlan);


router.get('/',tourController.getAllTours);
router.get('/:id',tourController.getTour);
router.patch('/:id',tourController.updateTour);
router.delete('/:id',tourController.deleteTour);



module.exports=router;
