const ServiceApplication = require('../models/ServiceApplication');

// @desc    Submit service application
// @route   POST /api/service-applications
// @access  Private
exports.submitApplication = async (req, res, next) => {
  try {
    const { applicationType, formData, images } = req.body;

    if (!applicationType || !formData) {
      return res.status(400).json({ success: false, error: 'Please provide all required fields' });
    }

    const application = await ServiceApplication.create({
      userId: req.user.id,
      applicationType,
      formData,
      images: images || {}
    });

    res.status(201).json({ success: true, data: application });
  } catch (error) {
    next(error);
  }
};

// @desc    Get user's service applications
// @route   GET /api/service-applications/my
// @access  Private
exports.getUserApplications = async (req, res, next) => {
  try {
    const applications = await ServiceApplication.find({ userId: req.user.id }).sort('-submittedAt');
    res.status(200).json({ success: true, data: applications });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all service applications
// @route   GET /api/service-applications
// @access  Private (Admin/Employee/Manager)
exports.getAllApplications = async (req, res, next) => {
  try {
    const applications = await ServiceApplication.find().populate('userId', 'fullName email phone customerId').sort('-submittedAt');
    res.status(200).json({ success: true, data: applications });
  } catch (error) {
    next(error);
  }
};

// @desc    Update application status
// @route   PUT /api/service-applications/:id/status
// @access  Private (Admin/Employee/Manager)
exports.updateApplicationStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    let application = await ServiceApplication.findById(req.params.id);

    if (!application) {
      return res.status(404).json({ success: false, error: 'Application not found' });
    }

    application.status = status;
    application.processedBy = req.user.id;
    application.processedAt = Date.now();
    await application.save();

    res.status(200).json({ success: true, data: application });
  } catch (error) {
    next(error);
  }
};
