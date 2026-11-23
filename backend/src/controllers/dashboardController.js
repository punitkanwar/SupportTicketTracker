import Ticket from '../models/Ticket.js';


export const getDashboardStats = async (req, res, next) => {
  try {

    const [statusCounts, priorityCounts, categoryCounts, recentTickets, activityData] = await Promise.all([

      Ticket.aggregate([
        {
          $group: {
            _id: '$status',
            count: { $sum: 1 },
          },
        },
      ]),


      Ticket.aggregate([
        {
          $group: {
            _id: '$priority',
            count: { $sum: 1 },
          },
        },
      ]),

      Ticket.aggregate([
        {
          $group: {
            _id: '$category',
            count: { $sum: 1 },
          },
        },
      ]),


      Ticket.find().sort({ createdAt: -1 }).limit(5).lean(),


      Ticket.aggregate([
        {
          $match: {
            createdAt: {
              $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
            },
          },
        },
        {
          $group: {
            _id: {
              $dateToString: { format: '%Y-%m-%d', date: '$createdAt' },
            },
            count: { $sum: 1 },
          },
        },
        { $sort: { _id: 1 } },
      ]),
    ]);


    const statusMap = statusCounts.reduce((acc, item) => {
      acc[item._id] = item.count;
      return acc;
    }, {});

    const total = statusCounts.reduce((sum, item) => sum + item.count, 0);


    const activityMap = activityData.reduce((acc, item) => {
      acc[item._id] = item.count;
      return acc;
    }, {});

    const dateRange = [];
    for (let i = 29; i >= 0; i--) {
      const date = new Date(Date.now() - i * 24 * 60 * 60 * 1000);
      const key = date.toISOString().split('T')[0];
      dateRange.push({ date: key, tickets: activityMap[key] || 0 });
    }

    res.json({
      success: true,
      message: 'Dashboard stats retrieved successfully',
      data: {
        stats: {
          total,
          open: statusMap['Open'] || 0,
          inProgress: statusMap['In Progress'] || 0,
          resolved: statusMap['Resolved'] || 0,
        },
        statusDistribution: ['Open', 'In Progress', 'Resolved'].map((status) => ({
          name: status,
          value: statusMap[status] || 0,
        })),
        priorityDistribution: ['Low', 'Medium', 'High', 'Urgent'].map((priority) => {
          const found = priorityCounts.find((p) => p._id === priority);
          return { name: priority, value: found ? found.count : 0 };
        }),
        categoryDistribution: ['Technical', 'Billing', 'Account', 'General', 'Other'].map((category) => {
          const found = categoryCounts.find((item) => item._id === category);
          return { name: category, value: found ? found.count : 0 };
        }),
        activityData: dateRange,
        recentTickets,
      },
    });
  } catch (error) {
    next(error);
  }
};
