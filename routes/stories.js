const express = require('express');
const router = express.Router();
const { ensureAuth } = require('../middleware/auth');

const Story = require('../models/Story');

// @desc    Show add stories page
// @route   GET /stories/add
router.get('/add', ensureAuth, (request, response) => {
	response.render('stories/add');
});

// @desc    Process add stories form
// @route   POST /stories
router.post('/', ensureAuth, async (request, response) => {
	try {
		request.body.user = request.user.id;
		await Story.create(request.body);
		response.redirect('/dashboard');
	} catch (error) {
		console.error(error);
		response.render('error/500');
	}
});

// @desc    Show all stories
// @route   GET /stories
router.get('/', ensureAuth, async (request, response) => {
	try {
		const stories = await Story.find({ status: 'public' })
			.populate('user')
			.sort({ createdAt: 'desc' })
			.lean();

		response.render('stories/index', { stories });
	} catch (error) {
		console.error(error);
		response.render('error/500');
	}
});

// @desc    Show single story
// @route   GET /stories/:id
router.get('/:id', ensureAuth, async (request, response) => {
	try {
		let story = await Story.findById(request.params.id)
			.populate('user')
			.lean();

		if (!story) {
			return response.render('error/404');
		}

		response.render('stories/show', {
			story,
		});
	} catch (error) {
		console.error(error);
		response.render('error/404');
	}
});

// @desc    Show edit stories page
// @route   GET /stories/edit/:id
router.get('/edit/:id', ensureAuth, async (request, response) => {
	try {
		const story = await Story.findOne({
			_id: request.params.id,
		}).lean();

		if (!story) {
			return response.render('error/404');
		}

		if (story.user != request.user.id) {
			response.redirect('/stories');
		} else {
			response.render('stories/edit', {
				story,
			});
		}
	} catch (error) {
		console.error(error);
		return response.render('error/500');
	}
});

// @desc    Update stories
// @route   PUT /stories/:id
router.put('/:id', ensureAuth, async (request, response) => {
	try {
		let story = await Story.findById(request.params.id).lean();

		if (!story) {
			return response.render('error/404');
		}

		if (story.user != request.user.id) {
			response.redirect('/stories');
		} else {
			story = await Story.findOneAndUpdate(
				{ _id: request.params.id },
				request.body,
				{
					new: true,
					runValidators: true,
				}
			);

			response.redirect('/dashboard');
		}
	} catch (error) {
		console.error(error);
		return response.render('error/500');
	}
});

// @desc    Delete story
// @route   DELETE /stories/:id
router.delete('/:id', ensureAuth, async (request, response) => {
	try {
		await Story.remove({ _id: request.params.id });
		response.redirect('/dashboard');
	} catch (error) {
		console.error(error);
		return response.render('error/500');
	}
});

// @desc    User stories
// @route   GET /stories/user/:userId
router.get('/user/:userId', ensureAuth, async (request, response) => {
	try {
		const stories = await Story.find({
			user: request.params.userId,
			status: 'public',
		})
			.populate('user')
			.lean();

		response.render('stories/index', {
			stories,
		});
	} catch (error) {
		console.error(error);
		response.render('error/500');
	}
});

module.exports = router;
