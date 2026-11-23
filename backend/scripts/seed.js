import 'dotenv/config';
import mongoose from 'mongoose';
import Ticket from '../src/models/Ticket.js';
import connectDB from '../src/config/db.js';

const sampleTickets = [
  {
    subject: 'Password reset email is not arriving',
    description:
      'I requested a password reset email over 30 minutes ago and it still has not arrived. I have checked my spam folder and there is nothing there. My email address is correct in the system. This is blocking me from logging in.',
    category: 'Account',
    priority: 'High',
    status: 'Open',
    statusHistory: [{ previousStatus: null, newStatus: 'Open', changedAt: new Date('2026-11-20T09:00:00Z') }],
  },
  {
    subject: 'Unable to access my account after email change',
    description:
      'I changed my email address two days ago and now I cannot log in. The system says my credentials are invalid. I never received a confirmation email for the change either.',
    category: 'Account',
    priority: 'Urgent',
    status: 'In Progress',
    statusHistory: [
      { previousStatus: null, newStatus: 'Open', changedAt: new Date('2026-11-18T10:30:00Z') },
      { previousStatus: 'Open', newStatus: 'In Progress', changedAt: new Date('2026-11-19T08:15:00Z') },
    ],
  },
  {
    subject: 'Payment was charged twice for the same subscription',
    description:
      'My credit card was charged twice on November 15th for my monthly subscription renewal. Both charges are for the same amount of $49.99. I need a refund for the duplicate charge as soon as possible.',
    category: 'Billing',
    priority: 'Urgent',
    status: 'In Progress',
    statusHistory: [
      { previousStatus: null, newStatus: 'Open', changedAt: new Date('2026-11-16T14:00:00Z') },
      { previousStatus: 'Open', newStatus: 'In Progress', changedAt: new Date('2026-11-17T09:00:00Z') },
    ],
  },
  {
    subject: 'Dashboard page keeps loading indefinitely',
    description:
      'The main dashboard page shows a loading spinner but never actually loads. I have tried clearing my cache, using different browsers (Chrome, Firefox, Edge), and disabling extensions. The issue started yesterday afternoon.',
    category: 'Technical',
    priority: 'High',
    status: 'Open',
    statusHistory: [{ previousStatus: null, newStatus: 'Open', changedAt: new Date('2026-11-21T11:00:00Z') }],
  },
  {
    subject: 'Invoice download is failing with a 500 error',
    description:
      'When I try to download any invoice from the billing section, I get a "500 Internal Server Error" message. This is happening for all my past invoices. I need these for my accounting records urgently.',
    category: 'Billing',
    priority: 'High',
    status: 'Resolved',
    statusHistory: [
      { previousStatus: null, newStatus: 'Open', changedAt: new Date('2026-11-10T09:30:00Z') },
      { previousStatus: 'Open', newStatus: 'In Progress', changedAt: new Date('2026-11-11T10:00:00Z') },
      { previousStatus: 'In Progress', newStatus: 'Resolved', changedAt: new Date('2026-11-12T16:00:00Z') },
    ],
  },
  {
    subject: 'Email verification link has expired',
    description:
      'I created a new account yesterday and clicked the verification link in the email, but it says the link has expired. I requested a new verification email but I am still seeing the same expired error when I click the new link.',
    category: 'Account',
    priority: 'Medium',
    status: 'Resolved',
    statusHistory: [
      { previousStatus: null, newStatus: 'Open', changedAt: new Date('2026-11-15T13:00:00Z') },
      { previousStatus: 'Open', newStatus: 'In Progress', changedAt: new Date('2026-11-15T15:30:00Z') },
      { previousStatus: 'In Progress', newStatus: 'Resolved', changedAt: new Date('2026-11-16T10:00:00Z') },
    ],
  },
  {
    subject: 'Unable to update billing information',
    description:
      'I need to update my credit card before my renewal on the 25th. When I go to the billing section and try to add a new payment method, the form submits but nothing saves. The old card remains and I see no error message.',
    category: 'Billing',
    priority: 'High',
    status: 'Open',
    statusHistory: [{ previousStatus: null, newStatus: 'Open', changedAt: new Date('2026-11-21T16:00:00Z') }],
  },
  {
    subject: 'Export report returns a corrupted file',
    description:
      'When I export my monthly usage report to CSV, the downloaded file is corrupted and cannot be opened in Excel or Google Sheets. This was working fine last month. I need this data for a client presentation.',
    category: 'Technical',
    priority: 'Medium',
    status: 'In Progress',
    statusHistory: [
      { previousStatus: null, newStatus: 'Open', changedAt: new Date('2026-11-19T10:00:00Z') },
      { previousStatus: 'Open', newStatus: 'In Progress', changedAt: new Date('2026-11-20T11:00:00Z') },
    ],
  },
  {
    subject: 'Account activation has been pending for 3 days',
    description:
      'I signed up for the business plan three days ago and completed the payment, but my account is still showing as "Pending Activation". I have received the payment confirmation email but no activation email.',
    category: 'Account',
    priority: 'High',
    status: 'Resolved',
    statusHistory: [
      { previousStatus: null, newStatus: 'Open', changedAt: new Date('2026-11-14T09:00:00Z') },
      { previousStatus: 'Open', newStatus: 'In Progress', changedAt: new Date('2026-11-14T14:00:00Z') },
      { previousStatus: 'In Progress', newStatus: 'Resolved', changedAt: new Date('2026-11-15T09:00:00Z') },
    ],
  },
  {
    subject: 'Mobile layout is broken on iPhone 14',
    description:
      'The navigation menu on mobile overlaps with the content area. Buttons in forms are partially hidden behind the bottom navigation bar. This makes the app nearly unusable on mobile. Tested on iOS 17.4.',
    category: 'Technical',
    priority: 'Medium',
    status: 'Open',
    statusHistory: [{ previousStatus: null, newStatus: 'Open', changedAt: new Date('2026-11-20T14:00:00Z') }],
  },
  {
    subject: 'Unable to change profile display name',
    description:
      'I go to Profile Settings and update my display name, then click Save. The page shows a success message but after refreshing the page, the name reverts to the old value. This has happened consistently over the past week.',
    category: 'Technical',
    priority: 'Low',
    status: 'Open',
    statusHistory: [{ previousStatus: null, newStatus: 'Open', changedAt: new Date('2026-11-18T16:30:00Z') }],
  },
  {
    subject: 'Support response notification emails are missing',
    description:
      'I am not receiving email notifications when the support team replies to my tickets. I have to manually log in to check for responses. I have verified my notification settings are enabled and my email address is correct.',
    category: 'General',
    priority: 'Low',
    status: 'Resolved',
    statusHistory: [
      { previousStatus: null, newStatus: 'Open', changedAt: new Date('2026-11-08T10:00:00Z') },
      { previousStatus: 'Open', newStatus: 'Resolved', changedAt: new Date('2026-11-09T14:00:00Z') },
    ],
  },
  {
    subject: 'Request to cancel annual subscription',
    description:
      'I would like to cancel my annual subscription. My renewal date is December 1st and I need the cancellation processed before then to receive a pro-rated refund as per your cancellation policy.',
    category: 'Billing',
    priority: 'Medium',
    status: 'In Progress',
    statusHistory: [
      { previousStatus: null, newStatus: 'Open', changedAt: new Date('2026-11-21T09:00:00Z') },
      { previousStatus: 'Open', newStatus: 'In Progress', changedAt: new Date('2026-11-21T13:00:00Z') },
    ],
  },
  {
    subject: 'API requests returning 401 Unauthorized error',
    description:
      'All API requests from our integration are returning 401 Unauthorized since yesterday at 6 PM. Our API key has not changed and worked fine until then. This is blocking our production integration entirely.',
    category: 'Technical',
    priority: 'Urgent',
    status: 'In Progress',
    statusHistory: [
      { previousStatus: null, newStatus: 'Open', changedAt: new Date('2026-11-21T18:30:00Z') },
      { previousStatus: 'Open', newStatus: 'In Progress', changedAt: new Date('2026-11-21T19:00:00Z') },
    ],
  },
  {
    subject: 'File upload failing for files larger than 5MB',
    description:
      'File uploads succeed for small files but consistently fail for anything over 5MB. The upload progress bar reaches 100% and then shows a generic error. We need to upload design assets up to 50MB for our workflow.',
    category: 'Technical',
    priority: 'Medium',
    status: 'Open',
    statusHistory: [{ previousStatus: null, newStatus: 'Open', changedAt: new Date('2026-11-22T08:00:00Z') }],
  },
];

const seed = async () => {
  try {
    await connectDB();

    const existingCount = await Ticket.countDocuments();
    if (existingCount > 0 && process.env.SEED_CLEAR_EXISTING !== 'true') {
      throw new Error(
        `Refusing to replace ${existingCount} existing ticket(s). Set SEED_CLEAR_EXISTING=true to explicitly reset them.`
      );
    }

    if (existingCount > 0) {
      const { deletedCount } = await Ticket.deleteMany({});
      console.log(`Cleared ${deletedCount} existing ticket(s).`);
    }

    console.log('Inserting 15 sample tickets...');
    const inserted = await Ticket.insertMany(sampleTickets);
    console.log(`Successfully inserted ${inserted.length} tickets.`);
  } catch (error) {
    console.error(`Seed failed: ${error.message}`);
    process.exitCode = 1;
  } finally {
    if (mongoose.connection.readyState !== 0) {
      await mongoose.connection.close();
    }
    console.log('Seed process finished. Database connection closed.');
  }
};

seed();
