const { validationResult, body } = require('express-validator');
const Event = require('../models/eventModel');
const { cloudinary } = require('../utils/cloudinary');

// validators
exports.validateCreateOrUpdate = [
  body('title').trim().notEmpty().withMessage('กรอกชื่ออีเวนต์'),
  body('venue').trim().notEmpty().withMessage('กรอกสถานที่'),
  body('startAt').isISO8601().withMessage('วันที่ไม่ถูกต้อง'),
  body('price').isFloat({ min: 0 }).withMessage('ราคาต้องเป็นตัวเลข ≥ 0'),
  body('totalTickets').isInt({ min: 0 }).withMessage('จำนวนตั๋วต้อง ≥ 0'),
];

exports.listPublic = async (req, res, next) => {
  try {
    const { keyword, q, priceMin, priceMax, dateFrom, dateTo, sort } = req.query;
    const where = { status: 'published' };

    const kw = keyword?.trim() || q?.trim();
    if (kw) {
      // ใช้ text index
      where.$text = { $search: kw };
    }

    if (priceMin || priceMax) {
      where.price = {};
      if (priceMin) where.price.$gte = Number(priceMin);
      if (priceMax) where.price.$lte = Number(priceMax);
    }

    if (dateFrom || dateTo) {
      where.startAt = {};
      if (dateFrom) where.startAt.$gte = new Date(dateFrom);
      if (dateTo) where.startAt.$lte = new Date(dateTo);
    }

    // การเรียงลำดับ
    let sortSpec = { startAt: 1 }; // default วันเริ่มน้อย->มาก
    if (sort === 'date_desc')  sortSpec = { startAt: -1 };
    if (sort === 'price_asc')  sortSpec = { price: 1, startAt: 1 };
    if (sort === 'price_desc') sortSpec = { price: -1, startAt: 1 };

    const events = await Event.find(where).sort(sortSpec).lean();
    res.render('events/index', {
      title: 'Events',
      events,
      filters: { keyword: kw || '', priceMin: priceMin || '', priceMax: priceMax || '', dateFrom: dateFrom || '', dateTo: dateTo || '', sort: sort || 'date_asc' }
    });
  } catch (err) { next(err); }
};


exports.detail = async (req, res, next) => {
  try {
    const event = await Event.findById(req.params.id).lean();
    if (!event) return res.status(404).send('Event not found');
    res.render('events/detail', { title: event.title, event });
  } catch (err) { next(err); }
};

exports.newForm = (req, res) => {
  res.render('events/form', { title: 'สร้างอีเวนต์ใหม่', event: null });
};

exports.create = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).render('events/form', { title: 'Create Event', event: null, errors: errors.array() });
    }

    const payload = {
      organizer: req.user._id,
      title: req.body.title,
      description: req.body.description || '',
      venue: req.body.venue,
      startAt: new Date(req.body.startAt),
      endAt: req.body.endAt ? new Date(req.body.endAt) : null,
      price: Number(req.body.price),
      totalTickets: Number(req.body.totalTickets),
      status: req.body.status || 'draft',
    };

    // อัปโหลดภาพปก
    if (req.file) {
      const uploadResult = await new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream({ folder: 'events' }, (err, result) => {
          if (err) return reject(err);
          resolve(result);
        });
        stream.end(req.file.buffer);
      });
      payload.coverImage = uploadResult.secure_url;
    }

    const created = await Event.create(payload);
    res.redirect(`/api/events/${created._id}`);
  } catch (err) { next(err); }
};

exports.mine = async (req, res, next) => {
  try {
    const events = await Event.find({ organizer: req.user._id }).sort({ createdAt: -1 }).lean();
    res.render('events/mine', { title: 'My Events', events });
  } catch (err) { next(err); }
};



exports.editForm = async (req, res, next) => {
  try {
    const ev = await Event.findById(req.params.id).lean();
    if (!ev) return res.status(404).render('404', { title: 'ไม่พบอีเวนต์' });
    res.render('events/form', { title: 'แก้ไขอีเวนต์', event: ev });
  } catch (e) { next(e); }
};

exports.update = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const event = await Event.findById(req.params.id).lean();
      return res.status(400).render('events/form', { title: 'Edit Event', event, errors: errors.array() });
    }

    const update = {
      title: req.body.title,
      description: req.body.description || '',
      venue: req.body.venue,
      startAt: new Date(req.body.startAt),
      endAt: req.body.endAt ? new Date(req.body.endAt) : null,
      price: Number(req.body.price),
      totalTickets: Number(req.body.totalTickets),
      status: req.body.status || 'draft',
    };

    if (req.file) {
      const uploadResult = await new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream({ folder: 'events' }, (err, result) => {
          if (err) return reject(err);
          resolve(result);
        });
        stream.end(req.file.buffer);
      });
      update.coverImage = uploadResult.secure_url;
    }

    const updated = await Event.findOneAndUpdate(
      { _id: req.params.id, organizer: req.user._id },
      { $set: update },
      { new: true }
    );

    if (!updated) return res.status(404).send('Not found');
    res.redirect(`/api/events/${updated._id}`);
  } catch (err) { next(err); }
};

exports.remove = async (req, res, next) => {
  try {
    const del = await Event.findOneAndDelete({ _id: req.params.id, organizer: req.user._id });
    if (!del) return res.status(404).send('Not found');
    res.redirect('/api/events/mine');
  } catch (err) { next(err); }
};
