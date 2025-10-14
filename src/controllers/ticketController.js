const Ticket = require('../models/ticketModel');

exports.myTickets = async (req, res, next) => {
  try {
    const tickets = await Ticket.find({ owner: req.user._id })
      .populate('event')
      .sort({ createdAt: -1 })
      .lean();

    res.render('tickets/my_tickets', { title: 'My Tickets', tickets });
  } catch (err) { next(err); }
};

exports.verify = async (req, res, next) => {
  try {
    const { code, mark } = req.query;
    if (!code) return res.status(400).send('ต้องมี code');

    const ticket = await Ticket.findOne({ code }).populate('event owner').exec();
    if (!ticket) return res.status(404).send('ไม่พบตั๋ว');

    if (mark === '1') {
      if (ticket.status === 'used') {
        return res.status(200).send('ตั๋วนี้ถูกใช้ไปแล้ว');
      }
      ticket.status = 'used';
      ticket.scannedAt = new Date();
      await ticket.save();
      return res.status(200).send('สแกนสำเร็จ: ตั๋วใช้ได้และถูก mark เป็น used แล้ว');
    }

    // ตรวจสอบสถานะ
    return res.status(200).json({
      code: ticket.code,
      status: ticket.status,
      event: { id: ticket.event._id, title: ticket.event.title, startAt: ticket.event.startAt },
      owner: { id: ticket.owner._id, username: ticket.owner.username, email: ticket.owner.email },
    });
  } catch (err) { next(err); }
};
