const AnalyticsModel = require('../models/analyticsModel');

class AdminController {
    static async getStats(req, res) {
        try {
            if (req.user.role !== 'admin') {
                return res.status(403).json({
                    status: 'error',
                    message: 'Access denied'
                });
            }

            const overview = await AnalyticsModel.getOverview();
            const topWorkers = await AnalyticsModel.getTopRatedWorkers(6);

            res.json({
                status: 'ok',
                data: {
                    overview,
                    topWorkers
                }
            });
        } catch (error) {
            console.error('Get admin stats error:', error);
            res.status(500).json({
                status: 'error',
                message: 'Failed to get admin stats'
            });
        }
    }

    static async getRevenueTimeline(req, res) {
        try {
            if (req.user.role !== 'admin') {
                return res.status(403).json({
                    status: 'error',
                    message: 'Access denied'
                });
            }

            const { from, to } = req.query;
            const today = new Date().toISOString().split('T')[0];
            const startDate = from || today;
            const endDate = to || today;

            const revenueData = await AnalyticsModel.getRevenueByDateRange(startDate, endDate);

            res.json({
                status: 'ok',
                data: revenueData
            });
        } catch (error) {
            console.error('Get revenue timeline error:', error);
            res.status(500).json({
                status: 'error',
                message: 'Failed to get revenue timeline'
            });
        }
    }
}

module.exports = AdminController;
