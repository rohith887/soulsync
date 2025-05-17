//const { SupportTicket, Faq } = require('../models');
const SupportTicket = require('../../models/SupportTicket');
const Faq = require('../../models/Faq');

module.exports = {
  getTickets: async (req, res) => {
    try {
      const tickets = await SupportTicket.findAll({ order: [['createdAt', 'DESC']] });
      res.json({ success: true, tickets });
    } catch (err) {
      res.status(500).json({ success: false, message: err.message });
    }
  },

  resolveTicket: async (req, res) => {
    const { ticketId } = req.params;
    try {
      await SupportTicket.update({ status: 'resolved' }, { where: { id: ticketId } });
      res.json({ success: true, message: 'Ticket resolved' });
    } catch (err) {
      res.status(500).json({ success: false, message: err.message });
    }
  },

  manageFaq: async (req, res) => {
    const { question, answer } = req.body;
    try {
      const faq = await Faq.create({ question, answer });
      res.json({ success: true, faq });
    } catch (err) {
      res.status(500).json({ success: false, message: err.message });
    }
  }
};

