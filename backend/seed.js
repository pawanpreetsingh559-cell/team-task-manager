/**
 * 🌱 Seed Script — TaskFlow Team Task Manager
 * Clears the DB and populates fresh demo data.
 *
 * Usage:  cd backend && node seed.js
 *
 * ⚠️  NOTE: Passwords are passed as plain text — the User model's
 *     pre('save') hook handles bcrypt hashing automatically.
 *     Do NOT pre-hash passwords here or login will break (double-hash bug).
 */

const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config();

const User = require('./models/User');
const Project = require('./models/Project');
const Task = require('./models/Task');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/teamtaskmanager';

async function seed() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Clear ALL existing data
    await Task.deleteMany({});
    await Project.deleteMany({});
    await User.deleteMany({});
    console.log('🗑️  Cleared existing data');

    // ─── USERS (plain text passwords — pre-save hook will hash them) ───
    const admin = await User.create({
      name: 'Pawanpreet Singh',
      email: 'admin@taskflow.com',
      password: 'Admin@123',      // plain text — hook hashes it
      role: 'admin',
      avatar: ''
    });

    const alice = await User.create({
      name: 'Alice Johnson',
      email: 'alice@taskflow.com',
      password: 'Alice@123',      // plain text — hook hashes it
      role: 'member',
      avatar: ''
    });

    const bob = await User.create({
      name: 'Bob Martinez',
      email: 'bob@taskflow.com',
      password: 'Bob@123',        // plain text — hook hashes it
      role: 'member',
      avatar: ''
    });

    console.log('👤 Created 3 users: 1 admin + 2 members');

    // ─── PROJECTS ───
    const project1 = await Project.create({
      name: 'Website Redesign',
      description: 'Complete redesign of the company website with new branding and improved UX.',
      owner: admin._id,
      members: [alice._id, bob._id],
      status: 'active',
      color: '#0ea5e9'
    });

    const project2 = await Project.create({
      name: 'Mobile App MVP',
      description: 'Build the MVP for our cross-platform mobile app using React Native.',
      owner: admin._id,
      members: [alice._id],
      status: 'active',
      color: '#10b981'
    });

    const project3 = await Project.create({
      name: 'API Integration',
      description: 'Integrate third-party payment and analytics APIs into the backend.',
      owner: admin._id,
      members: [bob._id],
      status: 'active',
      color: '#f59e0b'
    });

    console.log('📁 Created 3 projects');

    // ─── TASKS ───
    const now = new Date();
    const yesterday  = new Date(now - 24 * 60 * 60 * 1000);
    const twoDaysAgo = new Date(now - 2 * 24 * 60 * 60 * 1000);
    const tomorrow   = new Date(now.getTime() + 24 * 60 * 60 * 1000);
    const nextWeek   = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

    await Task.create([
      // ── Website Redesign ──
      {
        title: 'Design new homepage mockup',
        description: 'Create Figma mockups for the new homepage with updated brand colors and hero section.',
        project: project1._id, assignee: alice._id, creator: admin._id,
        status: 'done', priority: 'high', dueDate: yesterday,
        tags: ['design', 'figma']
      },
      {
        title: 'Implement responsive navbar',
        description: 'Build a mobile-first responsive navigation bar with dropdown menus.',
        project: project1._id, assignee: alice._id, creator: admin._id,
        status: 'in-review', priority: 'high', dueDate: tomorrow,
        tags: ['frontend', 'css']
      },
      {
        title: 'SEO optimization',
        description: 'Add meta tags, Open Graph data, and structured data to all pages.',
        project: project1._id, assignee: bob._id, creator: admin._id,
        status: 'in-progress', priority: 'medium', dueDate: nextWeek,
        tags: ['seo']
      },
      {
        title: 'Performance audit & fixes',
        description: 'Run Lighthouse audit and fix all issues scoring below 90.',
        project: project1._id, assignee: bob._id, creator: admin._id,
        status: 'todo', priority: 'urgent', dueDate: twoDaysAgo, // overdue
        tags: ['performance', 'lighthouse']
      },

      // ── Mobile App MVP ──
      {
        title: 'Setup React Native project',
        description: 'Initialize RN project with Expo, configure navigation and state management.',
        project: project2._id, assignee: alice._id, creator: admin._id,
        status: 'done', priority: 'high', dueDate: yesterday,
        tags: ['react-native', 'setup']
      },
      {
        title: 'Implement Auth screens',
        description: 'Build login, signup and forgot password screens with form validation.',
        project: project2._id, assignee: alice._id, creator: admin._id,
        status: 'in-progress', priority: 'high', dueDate: nextWeek,
        tags: ['auth', 'ui']
      },
      {
        title: 'Push notification integration',
        description: 'Integrate Firebase Cloud Messaging for push notifications on iOS and Android.',
        project: project2._id, assignee: admin._id, creator: admin._id,
        status: 'todo', priority: 'medium', dueDate: nextWeek,
        tags: ['firebase', 'notifications']
      },

      // ── API Integration ──
      {
        title: 'Stripe payment gateway',
        description: 'Integrate Stripe checkout for one-time and subscription payments.',
        project: project3._id, assignee: bob._id, creator: admin._id,
        status: 'in-progress', priority: 'urgent', dueDate: yesterday, // overdue
        tags: ['stripe', 'payments']
      },
      {
        title: 'Google Analytics setup',
        description: 'Add GA4 tracking with custom events for user journey analysis.',
        project: project3._id, assignee: bob._id, creator: admin._id,
        status: 'todo', priority: 'low', dueDate: nextWeek,
        tags: ['analytics', 'google']
      },
      {
        title: 'Write API documentation',
        description: 'Document all API endpoints using Swagger/OpenAPI spec.',
        project: project3._id, assignee: admin._id, creator: admin._id,
        status: 'todo', priority: 'medium', dueDate: nextWeek,
        tags: ['docs', 'swagger']
      }
    ]);

    console.log('✅ Created 10 tasks across 3 projects');
    console.log('\n🎉 Database seeded successfully!\n');
    console.log('📋 Demo Credentials:');
    console.log('   ⚡ Admin:  admin@taskflow.com  /  Admin@123');
    console.log('   👤 Member: alice@taskflow.com  /  Alice@123');
    console.log('   👤 Member: bob@taskflow.com    /  Bob@123\n');

    process.exit(0);
  } catch (error) {
    console.error('❌ Seed error:', error.message);
    process.exit(1);
  }
}

seed();
