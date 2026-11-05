import { Router } from "express";
import { dailyExpanses, mobileDashboard, expanseDetail, addInc, updExpanse, mobileUpdInc } from "../Validations/expanses.validation.js";
import { addEvent, updEvent, eventId, resetEvent } from "../Validations/event.validation.js";
import validation from "../Middlewares/validation.middleware.js";
import tokenValidation from "../Middlewares/auth.middleware.js";
import * as MobileController from "../Controllers/Expanses/mobile.controller.js";
import * as EventController from "../Controllers/Event/event.controller.js";

const router = Router();

// ============================================================
// Expanses & Income
// ============================================================
router.get('/date-range', [tokenValidation, validation(dailyExpanses, 'query')], MobileController.dateRangeExpanses)
router.get('/dashboard', [tokenValidation], MobileController.dashboard)
router.get('/transactions', [tokenValidation, validation(mobileDashboard, 'query')], MobileController.transactions)
router.get('/monthly-report', [tokenValidation, validation(mobileDashboard, 'query')], MobileController.monthlyReport)
router.get('/expanse-detail', [tokenValidation, validation(expanseDetail, 'query')], MobileController.expanseDetail)
router.get('/income-list', [tokenValidation], MobileController.incomeList)
router.post('/add-income', [tokenValidation, validation(addInc, 'body')], MobileController.addIncome)
router.put('/update-expanse', [tokenValidation, validation(updExpanse, 'body')], MobileController.updateExpanse)
router.delete('/expanse', [tokenValidation, validation(expanseDetail, 'query')], MobileController.deleteExpanse)
router.get('/analysis', [tokenValidation], MobileController.analysis)
router.put('/update-income', [tokenValidation, validation(mobileUpdInc, 'body')], MobileController.updateIncome)

// ============================================================
// Event Tracker (passive reminder)
// Stores when an event happened (e.g. "changed outer tire");
// the client shows a running timer from startedAt.
// ============================================================
router.post('/event', [tokenValidation, validation(addEvent, 'body')], EventController.addEvent)
router.get('/events', [tokenValidation], EventController.eventList)
router.get('/event', [tokenValidation, validation(eventId, 'query')], EventController.eventDetail)
router.put('/event', [tokenValidation, validation(updEvent, 'body')], EventController.updateEvent)
router.put('/event/reset', [tokenValidation, validation(resetEvent, 'body')], EventController.resetEvent)
router.delete('/event', [tokenValidation, validation(eventId, 'query')], EventController.deleteEvent)

export default router
