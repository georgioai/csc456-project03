const Freelancer = require('../models/freelancer.model');
const Application = require('../models/application.model');

//get all freelancers 
exports.getFreelancers = async (req, res) => {
  try {
    const freelancers = await Freelancer.find();
    res.render('freelancers/index', { user: req.user, freelancers });
  } catch (err) {
    res.status(500).render('errors/500', { user: req.user });
  }
};

//return the new freelancer form (for the admin)
exports.newFreelancerForm = (req, res) => {
  res.render('freelancers/new', { user: req.user });
};

//create the freelancer (for the admin)
exports.createFreelancer = async (req, res) => {
  try {
    // If skills came as a comma-separated string from the form, split it into a clean array
    if (req.body.skills && typeof req.body.skills === 'string') {
      req.body.skills = req.body.skills.split(',').map(s => s.trim()).filter(Boolean);
    }
    await Freelancer.create(req.body);
    res.redirect('/freelancers');
  } catch (err) {
    res.render('freelancers/new', { user: req.user, error: err.message });
  }
};

//get freelancer by id
exports.showFreelancer = async (req, res) => {
  try {
    const freelancer = await Freelancer.findById(req.params.id);
    if (!freelancer) return res.status(404).render('errors/404', { user: req.user });
    if (req.user.role === 'freelancer' && freelancer._id.toString() !== req.user.refId.toString()) {
      return res.status(403).render('errors/403', { user: req.user });
    }
    const applications = await Application.find({ freelancer: freelancer._id })
      .populate({ path: 'job', populate: { path: 'client' } });
    res.render('freelancers/show', { user: req.user, freelancer, applications });
  } catch (err) {
    res.status(500).render('errors/500', { user: req.user });
  }
};

//get the edit freelancer form
exports.editFreelancerForm = async (req, res) => {
  try {
    const freelancer = await Freelancer.findById(req.params.id);
    if (!freelancer) return res.status(404).render('errors/404', { user: req.user });
    if (req.user.role === 'freelancer' && freelancer._id.toString() !== req.user.refId.toString()) {
      return res.status(403).render('errors/403', { user: req.user });
    }
    res.render('freelancers/edit', { user: req.user, freelancer });
  } catch (err) {
    res.status(500).render('errors/500', { user: req.user });
  }
};

// submit the edit form
exports.updateFreelancer = async (req, res) => {
  try {
    if (req.body.skills && typeof req.body.skills === 'string') {
      req.body.skills = req.body.skills.split(',').map(s => s.trim()).filter(Boolean);
    }
    const freelancer = await Freelancer.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!freelancer) return res.status(404).render('errors/404', { user: req.user });
    if (req.user.role === 'freelancer' && freelancer._id.toString() !== req.user.refId.toString()) {
      return res.status(403).render('errors/403', { user: req.user });
    }
    const redirect = req.user.role === 'freelancer' ? `/freelancers/show/${req.params.id}` : '/freelancers';
    res.redirect(redirect);
  } catch (err) {
    const freelancer = await Freelancer.findById(req.params.id);
    res.render('freelancers/edit', { user: req.user, freelancer, error: err.message });
  }
};

//delete the freelancer ALONG WITH his applications 
exports.deleteFreelancer = async (req, res) => {
  try {
    const freelancer = await Freelancer.findById(req.params.id);
    if (!freelancer) return res.status(404).render('errors/404', { user: req.user });

    await Application.deleteMany({ freelancer: freelancer._id });
    await Freelancer.findByIdAndDelete(req.params.id);

    res.redirect('/freelancers');
  } catch (err) {
    res.status(500).render('errors/500', { user: req.user });
  }
};



