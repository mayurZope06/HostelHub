import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { connectDB } from '../config/db.js';
import User from '../models/User.js';
import Student from '../models/Student.js';
import Room from '../models/Room.js';
import Allocation from '../models/Allocation.js';
import Fee from '../models/Fee.js';
import Complaint from '../models/Complaint.js';
import Notice from '../models/Notice.js';

dotenv.config();

export const seedDatabase = async () => {
  try {
    console.log('🌱 Starting database seeding with realistic demo records...');

    // Clear existing collections
    await User.deleteMany();
    await Student.deleteMany();
    await Room.deleteMany();
    await Allocation.deleteMany();
    await Fee.deleteMany();
    await Complaint.deleteMany();
    await Notice.deleteMany();

    // 1. Create Rooms
    const roomsData = [
      {
        roomNumber: 'A-101',
        block: 'Block A',
        floor: 1,
        roomType: 'Single',
        capacity: 1,
        occupiedBeds: 0,
        feePerSemester: 38000,
        amenities: ['AC', 'High-speed Wi-Fi', 'Attached Bathroom', 'Balcony', 'Study Table'],
        description: 'Deluxe single occupancy room with private balcony and air conditioning.',
      },
      {
        roomNumber: 'A-102',
        block: 'Block A',
        floor: 1,
        roomType: 'Double',
        capacity: 2,
        occupiedBeds: 0,
        feePerSemester: 28000,
        amenities: ['High-speed Wi-Fi', 'Attached Bathroom', 'Study Table', 'Ceiling Fan'],
        description: 'Standard double sharing room with ample storage and garden view.',
      },
      {
        roomNumber: 'A-201',
        block: 'Block A',
        floor: 2,
        roomType: 'Double',
        capacity: 2,
        occupiedBeds: 0,
        feePerSemester: 28000,
        amenities: ['AC', 'High-speed Wi-Fi', 'Attached Bathroom', 'Study Table'],
        description: 'Second-floor AC double room with panoramic campus view.',
      },
      {
        roomNumber: 'A-202',
        block: 'Block A',
        floor: 2,
        roomType: 'Triple',
        capacity: 3,
        occupiedBeds: 0,
        feePerSemester: 22000,
        amenities: ['High-speed Wi-Fi', 'Attached Bathroom', 'Study Table', 'Ceiling Fan'],
        description: 'Spacious triple sharing room ideal for freshers.',
      },
      {
        roomNumber: 'B-101',
        block: 'Block B',
        floor: 1,
        roomType: 'Single',
        capacity: 1,
        occupiedBeds: 0,
        feePerSemester: 36000,
        amenities: ['AC', 'High-speed Wi-Fi', 'Attached Bathroom', 'Study Table'],
        description: 'Quiet single room near the central reading lounge.',
      },
      {
        roomNumber: 'B-102',
        block: 'Block B',
        floor: 1,
        roomType: 'Double',
        capacity: 2,
        occupiedBeds: 0,
        feePerSemester: 26000,
        amenities: ['High-speed Wi-Fi', 'Attached Bathroom', 'Study Table'],
        description: 'Well-ventilated twin sharing room with attached modern bath.',
      },
      {
        roomNumber: 'B-201',
        block: 'Block B',
        floor: 2,
        roomType: 'Triple',
        capacity: 3,
        occupiedBeds: 0,
        feePerSemester: 20000,
        amenities: ['High-speed Wi-Fi', 'Attached Bathroom', 'Individual Wardrobes'],
        description: 'Comfortable triple bed accommodation with large windows.',
      },
      {
        roomNumber: 'B-202',
        block: 'Block B',
        floor: 2,
        roomType: 'Dormitory',
        capacity: 4,
        occupiedBeds: 0,
        feePerSemester: 16000,
        amenities: ['High-speed Wi-Fi', 'Shared Bathrooms', 'Lockers', 'Ceiling Fans'],
        description: 'Economic 4-bed shared dormitory with secure individual lockers.',
      },
      {
        roomNumber: 'C-101',
        block: 'Block C',
        floor: 1,
        roomType: 'Double',
        capacity: 2,
        occupiedBeds: 0,
        feePerSemester: 27000,
        amenities: ['AC', 'High-speed Wi-Fi', 'Attached Bathroom', 'Balcony'],
        description: 'Modern executive double room with scenic courtyard outlook.',
      },
      {
        roomNumber: 'C-102',
        block: 'Block C',
        floor: 1,
        roomType: 'Single',
        capacity: 1,
        occupiedBeds: 0,
        feePerSemester: 35000,
        amenities: ['High-speed Wi-Fi', 'Attached Bathroom', 'Study Table'],
        description: 'Private single room with ergonomic study desk.',
      },
      {
        roomNumber: 'C-201',
        block: 'Block C',
        floor: 2,
        roomType: 'Double',
        capacity: 2,
        occupiedBeds: 0,
        feePerSemester: 25000,
        amenities: ['High-speed Wi-Fi', 'Attached Bathroom'],
        status: 'Maintenance',
        description: 'Under periodic electrical rewiring and interior painting.',
      },
      {
        roomNumber: 'C-202',
        block: 'Block C',
        floor: 2,
        roomType: 'Triple',
        capacity: 3,
        occupiedBeds: 0,
        feePerSemester: 21000,
        amenities: ['High-speed Wi-Fi', 'Attached Bathroom', 'Study Table'],
        description: 'Corner triple room with abundant natural sunlight.',
      },
    ];

    const createdRooms = await Room.insertMany(roomsData);
    console.log(`✅ Created ${createdRooms.length} hostel rooms.`);

    // 2. Create Admin User
    const adminUser = await User.create({
      name: 'Hostel Chief Warden',
      email: 'admin@hostel.com',
      password: 'admin123',
      role: 'admin',
      phone: '+91 98765 43210',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=250&q=80',
    });

    // 3. Create Students
    const studentsData = [
      {
        registrationNumber: 'HST-2025-001',
        firstName: 'Rahul',
        lastName: 'Sharma',
        email: 'rahul@student.com',
        phone: '+91 98111 22334',
        gender: 'Male',
        dateOfBirth: new Date('2003-05-14'),
        bloodGroup: 'B+',
        course: 'B.Tech Computer Science',
        department: 'Computer Science & Engineering',
        yearOfStudy: 3,
        address: { street: '42 Blossom Heights', city: 'Jaipur', state: 'Rajasthan', postalCode: '302001' },
        emergencyContact: { name: 'Manoj Sharma', relation: 'Father', phone: '+91 98111 99887' },
        guardian: { name: 'Manoj Sharma', relation: 'Father', phone: '+91 98111 99887', email: 'manoj.sharma@example.com' },
        avatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=250&q=80',
      },
      {
        registrationNumber: 'HST-2025-002',
        firstName: 'Priya',
        lastName: 'Patel',
        email: 'priya@student.com',
        phone: '+91 98222 33445',
        gender: 'Female',
        dateOfBirth: new Date('2004-08-22'),
        bloodGroup: 'O+',
        course: 'B.Tech Information Technology',
        department: 'Information Technology',
        yearOfStudy: 2,
        address: { street: '15 Sardar Nagar', city: 'Ahmedabad', state: 'Gujarat', postalCode: '380001' },
        emergencyContact: { name: 'Kirit Patel', relation: 'Father', phone: '+91 98222 77889' },
        guardian: { name: 'Kirit Patel', relation: 'Father', phone: '+91 98222 77889', email: 'kirit.patel@example.com' },
        avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=250&q=80',
      },
      {
        registrationNumber: 'HST-2025-003',
        firstName: 'Amit',
        lastName: 'Verma',
        email: 'amit@student.com',
        phone: '+91 98333 44556',
        gender: 'Male',
        dateOfBirth: new Date('2002-11-09'),
        bloodGroup: 'A+',
        course: 'M.Tech Data Science',
        department: 'Computer Science & Engineering',
        yearOfStudy: 1,
        address: { street: '78 Civil Lines', city: 'Lucknow', state: 'Uttar Pradesh', postalCode: '226001' },
        emergencyContact: { name: 'Sunita Verma', relation: 'Mother', phone: '+91 98333 88990' },
        guardian: { name: 'Sunita Verma', relation: 'Mother', phone: '+91 98333 88990', email: 'sunita.verma@example.com' },
        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=250&q=80',
      },
      {
        registrationNumber: 'HST-2025-004',
        firstName: 'Ananya',
        lastName: 'Sen',
        email: 'ananya@student.com',
        phone: '+91 98444 55667',
        gender: 'Female',
        dateOfBirth: new Date('2003-01-30'),
        bloodGroup: 'AB+',
        course: 'B.Des Product Design',
        department: 'School of Design',
        yearOfStudy: 3,
        address: { street: '12 Ballygunge Circular Rd', city: 'Kolkata', state: 'West Bengal', postalCode: '700019' },
        emergencyContact: { name: 'Subhash Sen', relation: 'Father', phone: '+91 98444 11223' },
        guardian: { name: 'Subhash Sen', relation: 'Father', phone: '+91 98444 11223', email: 'subhash.sen@example.com' },
        avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=250&q=80',
      },
      {
        registrationNumber: 'HST-2025-005',
        firstName: 'Rohan',
        lastName: 'Mehta',
        email: 'rohan.mehta@student.com',
        phone: '+91 98555 66778',
        gender: 'Male',
        dateOfBirth: new Date('2004-03-18'),
        bloodGroup: 'O-',
        course: 'B.Tech Mechanical Engg',
        department: 'Mechanical Engineering',
        yearOfStudy: 2,
        address: { street: '92 Bandra West', city: 'Mumbai', state: 'Maharashtra', postalCode: '400050' },
        emergencyContact: { name: 'Vijay Mehta', relation: 'Father', phone: '+91 98555 22334' },
        guardian: { name: 'Vijay Mehta', relation: 'Father', phone: '+91 98555 22334', email: 'vijay.mehta@example.com' },
        avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=250&q=80',
      },
      {
        registrationNumber: 'HST-2025-006',
        firstName: 'Sneha',
        lastName: 'Rao',
        email: 'sneha.rao@student.com',
        phone: '+91 98666 77889',
        gender: 'Female',
        dateOfBirth: new Date('2003-12-05'),
        bloodGroup: 'B-',
        course: 'MBA General',
        department: 'School of Management',
        yearOfStudy: 1,
        address: { street: '34 Indiranagar 100ft Rd', city: 'Bengaluru', state: 'Karnataka', postalCode: '560038' },
        emergencyContact: { name: 'Gopal Rao', relation: 'Father', phone: '+91 98666 33445' },
        guardian: { name: 'Gopal Rao', relation: 'Father', phone: '+91 98666 33445', email: 'gopal.rao@example.com' },
        avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=250&q=80',
      },
      {
        registrationNumber: 'HST-2025-007',
        firstName: 'Karthik',
        lastName: 'Nair',
        email: 'karthik.nair@student.com',
        phone: '+91 98777 88990',
        gender: 'Male',
        dateOfBirth: new Date('2004-06-11'),
        bloodGroup: 'A-',
        course: 'B.Tech Electrical & Electronics',
        department: 'Electrical Engineering',
        yearOfStudy: 2,
        address: { street: '51 Marine Drive', city: 'Kochi', state: 'Kerala', postalCode: '682031' },
        emergencyContact: { name: 'Radha Nair', relation: 'Mother', phone: '+91 98777 44556' },
        guardian: { name: 'Radha Nair', relation: 'Mother', phone: '+91 98777 44556', email: 'radha.nair@example.com' },
        avatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=250&q=80',
      },
      {
        registrationNumber: 'HST-2025-008',
        firstName: 'Tanvi',
        lastName: 'Kulkarni',
        email: 'tanvi.k@student.com',
        phone: '+91 98888 99001',
        gender: 'Female',
        dateOfBirth: new Date('2005-02-14'),
        bloodGroup: 'O+',
        course: 'B.Tech AI & Machine Learning',
        department: 'Computer Science & Engineering',
        yearOfStudy: 1,
        address: { street: '88 Shivaji Nagar', city: 'Pune', state: 'Maharashtra', postalCode: '411005' },
        emergencyContact: { name: 'Anil Kulkarni', relation: 'Father', phone: '+91 98888 55667' },
        guardian: { name: 'Anil Kulkarni', relation: 'Father', phone: '+91 98888 55667', email: 'anil.k@example.com' },
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=250&q=80',
      },
    ];

    const createdStudents = await Student.insertMany(studentsData);
    console.log(`✅ Created ${createdStudents.length} student profiles.`);

    // 4. Create User Accounts for Students
    for (const student of createdStudents.slice(0, 4)) {
      const studentUser = await User.create({
        name: `${student.firstName} ${student.lastName}`,
        email: student.email,
        password: 'student123',
        role: 'student',
        phone: student.phone,
        studentId: student._id,
        avatar: student.avatar,
      });
      student.userAccount = studentUser._id;
      await student.save();
    }
    console.log('✅ Created linked login user accounts for students (password: student123).');

    // 5. Room Allocations
    const roomA101 = createdRooms.find((r) => r.roomNumber === 'A-101');
    const roomA102 = createdRooms.find((r) => r.roomNumber === 'A-102');
    const roomB101 = createdRooms.find((r) => r.roomNumber === 'B-101');
    const roomB102 = createdRooms.find((r) => r.roomNumber === 'B-102');
    const roomC101 = createdRooms.find((r) => r.roomNumber === 'C-101');

    const allocationsData = [
      {
        student: createdStudents[0]._id, // Rahul
        room: roomA101._id,
        bedNumber: 1,
        academicYear: '2025-2026',
        startDate: new Date('2025-08-01'),
        monthlyFee: roomA101.feePerSemester,
        allocatedBy: adminUser._id,
        status: 'Active',
        remarks: 'Allocated during first semester enrollment',
      },
      {
        student: createdStudents[1]._id, // Priya
        room: roomB101._id,
        bedNumber: 1,
        academicYear: '2025-2026',
        startDate: new Date('2025-08-01'),
        monthlyFee: roomB101.feePerSemester,
        allocatedBy: adminUser._id,
        status: 'Active',
        remarks: 'Single room allotted on academic merit',
      },
      {
        student: createdStudents[2]._id, // Amit
        room: roomA102._id,
        bedNumber: 1,
        academicYear: '2025-2026',
        startDate: new Date('2025-08-05'),
        monthlyFee: roomA102.feePerSemester,
        allocatedBy: adminUser._id,
        status: 'Active',
        remarks: 'Bed 1 in twin sharing',
      },
      {
        student: createdStudents[4]._id, // Rohan
        room: roomA102._id,
        bedNumber: 2,
        academicYear: '2025-2026',
        startDate: new Date('2025-08-05'),
        monthlyFee: roomA102.feePerSemester,
        allocatedBy: adminUser._id,
        status: 'Active',
        remarks: 'Bed 2 in twin sharing',
      },
      {
        student: createdStudents[3]._id, // Ananya
        room: roomB102._id,
        bedNumber: 1,
        academicYear: '2025-2026',
        startDate: new Date('2025-08-10'),
        monthlyFee: roomB102.feePerSemester,
        allocatedBy: adminUser._id,
        status: 'Active',
        remarks: 'Block B double occupancy',
      },
      {
        student: createdStudents[5]._id, // Sneha
        room: roomC101._id,
        bedNumber: 1,
        academicYear: '2025-2026',
        startDate: new Date('2025-08-12'),
        monthlyFee: roomC101.feePerSemester,
        allocatedBy: adminUser._id,
        status: 'Active',
        remarks: 'Courtyard view room',
      },
    ];

    await Allocation.insertMany(allocationsData);

    // Update students' current room & occupied beds
    const studentRoomMap = [
      { studentId: createdStudents[0]._id, roomId: roomA101._id },
      { studentId: createdStudents[1]._id, roomId: roomB101._id },
      { studentId: createdStudents[2]._id, roomId: roomA102._id },
      { studentId: createdStudents[4]._id, roomId: roomA102._id },
      { studentId: createdStudents[3]._id, roomId: roomB102._id },
      { studentId: createdStudents[5]._id, roomId: roomC101._id },
    ];

    for (const item of studentRoomMap) {
      await Student.findByIdAndUpdate(item.studentId, {
        currentRoom: item.roomId,
        allocationDate: new Date('2025-08-01'),
        status: 'Active',
      });
    }

    // Update room occupied beds & status
    await Room.findByIdAndUpdate(roomA101._id, { occupiedBeds: 1, status: 'Occupied' });
    await Room.findByIdAndUpdate(roomA102._id, { occupiedBeds: 2, status: 'Occupied' });
    await Room.findByIdAndUpdate(roomB101._id, { occupiedBeds: 1, status: 'Occupied' });
    await Room.findByIdAndUpdate(roomB102._id, { occupiedBeds: 1, status: 'Partially Occupied' });
    await Room.findByIdAndUpdate(roomC101._id, { occupiedBeds: 1, status: 'Partially Occupied' });

    console.log('✅ Synchronized room occupancy and student allocation links.');

    // 6. Create Fee Records
    const feesData = [
      {
        invoiceNumber: 'INV-2025-1001',
        student: createdStudents[0]._id,
        room: roomA101._id,
        title: 'Fall Semester 2025 Hostel & AC Rent',
        feeType: 'Hostel Rent',
        amount: 38000,
        paidAmount: 38000,
        dueDate: new Date('2025-08-15'),
        paidDate: new Date('2025-08-10'),
        status: 'Paid',
        paymentMethod: 'UPI / QR',
        transactionReference: 'UPI-992837461823',
        remarks: 'Paid in full via PhonePe UPI',
      },
      {
        invoiceNumber: 'INV-2025-1002',
        student: createdStudents[1]._id,
        room: roomB101._id,
        title: 'Fall Semester 2025 Hostel Single Room Rent',
        feeType: 'Hostel Rent',
        amount: 36000,
        paidAmount: 36000,
        dueDate: new Date('2025-08-15'),
        paidDate: new Date('2025-08-14'),
        status: 'Paid',
        paymentMethod: 'Net Banking',
        transactionReference: 'HDFC-882736451',
        remarks: 'Net banking transaction processed successfully',
      },
      {
        invoiceNumber: 'INV-2025-1003',
        student: createdStudents[2]._id,
        room: roomA102._id,
        title: 'Fall Semester 2025 Double Room Rent',
        feeType: 'Hostel Rent',
        amount: 28000,
        paidAmount: 14000,
        dueDate: new Date('2025-09-01'),
        paidDate: new Date('2025-08-25'),
        status: 'Partial',
        paymentMethod: 'Credit/Debit Card',
        transactionReference: 'CARD-TXN-49281',
        remarks: 'First installment of 50% paid; remaining due next month',
      },
      {
        invoiceNumber: 'INV-2025-1004',
        student: createdStudents[3]._id,
        room: roomB102._id,
        title: 'Fall Semester 2025 Hostel Room Rent',
        feeType: 'Hostel Rent',
        amount: 26000,
        paidAmount: 0,
        dueDate: new Date('2025-08-20'),
        status: 'Overdue',
        remarks: 'Fee payment overdue notice sent to guardian email',
      },
      {
        invoiceNumber: 'INV-2025-1005',
        student: createdStudents[4]._id,
        room: roomA102._id,
        title: 'Fall Semester 2025 Double Room Rent',
        feeType: 'Hostel Rent',
        amount: 28000,
        paidAmount: 0,
        dueDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000), // Due in 10 days
        status: 'Pending',
        remarks: 'Payment invoice issued for semester',
      },
      {
        invoiceNumber: 'INV-2025-1006',
        student: createdStudents[0]._id,
        room: roomA101._id,
        title: 'Annual Hostel Mess & Dining Subscription',
        feeType: 'Mess Fee',
        amount: 24000,
        paidAmount: 24000,
        dueDate: new Date('2025-08-20'),
        paidDate: new Date('2025-08-18'),
        status: 'Paid',
        paymentMethod: 'UPI / QR',
        transactionReference: 'UPI-44910293847',
        remarks: 'Special meal plan opted',
      },
      {
        invoiceNumber: 'INV-2025-1007',
        student: createdStudents[5]._id,
        room: roomC101._id,
        title: 'Hostel Security & Caution Deposit',
        feeType: 'Security Deposit',
        amount: 10000,
        paidAmount: 10000,
        dueDate: new Date('2025-08-10'),
        paidDate: new Date('2025-08-08'),
        status: 'Paid',
        paymentMethod: 'Cash',
        transactionReference: 'CASH-REC-1092',
        remarks: 'Refundable caution deposit deposited with hostel bursar',
      },
    ];

    await Fee.insertMany(feesData);
    console.log(`✅ Created ${feesData.length} fee invoice & payment records.`);

    // 7. Create Complaints
    const complaintsData = [
      {
        student: createdStudents[0]._id,
        title: 'Ceiling Fan Making Clicking Sound in Room A-101',
        category: 'Electrical',
        roomNumber: 'A-101',
        description: 'The ceiling fan regulator vibrates and emits a clicking noise when running on speed 3 or higher.',
        priority: 'Medium',
        status: 'Resolved',
        resolutionNotes: 'Electrician checked the bearing and replaced faulty capacitor. Working quietly now.',
        resolvedAt: new Date(),
      },
      {
        student: createdStudents[2]._id,
        title: 'Attached Bathroom Washbasin Tap Leakage',
        category: 'Plumbing',
        roomNumber: 'A-102',
        description: 'Cold water tap continues dripping even when tightly shut, causing water wastage and pooling.',
        priority: 'High',
        status: 'In Progress',
        resolutionNotes: 'Plumbing contractor notified; scheduled for gasket replacement this afternoon.',
      },
      {
        student: createdStudents[1]._id,
        title: 'High-speed Wi-Fi Signal Weak on Block B First Floor',
        category: 'Internet / Wi-Fi',
        roomNumber: 'B-101',
        description: 'Frequent Wi-Fi packet drops and low signal strength inside room B-101 during evening study hours.',
        priority: 'Medium',
        status: 'Pending',
      },
      {
        student: createdStudents[3]._id,
        title: 'Study Desk Drawer Lock Jammed',
        category: 'Furniture',
        roomNumber: 'B-102',
        description: 'The bottom wooden drawer lock is stuck and cannot be opened with the key.',
        priority: 'Low',
        status: 'Pending',
      },
    ];

    await Complaint.insertMany(complaintsData);
    console.log(`✅ Created ${complaintsData.length} student maintenance complaints.`);

    // 8. Create Notices
    const noticesData = [
      {
        title: 'Hostel Mess Revised Seasonal Menu & Dining Hours',
        content: 'Dear Residents, The hostel mess committee has introduced the updated autumn menu starting next Monday. Dinner will be served between 7:30 PM and 9:45 PM. Vegetarian and vegan options have been expanded.',
        category: 'Mess & Dining',
        isPinned: true,
        targetAudience: 'All Students',
        postedBy: 'Chief Warden & Mess Council',
      },
      {
        title: 'Campus High-Speed Fiber Backbone Maintenance',
        content: 'Please note that IT network infrastructure maintenance will take place this Saturday from 2:00 AM to 5:00 AM. Internet access across Blocks A, B, and C will be temporarily interrupted during this window.',
        category: 'Maintenance',
        isPinned: true,
        targetAudience: 'All Students',
        postedBy: 'Campus IT Services',
      },
      {
        title: 'Hostel Premier League (HPL) Badminton & Chess Championship',
        content: 'Registrations are now open for the Annual Inter-Block Hostel Championship. Interested students can sign up at the recreation hall notice board before Thursday 6:00 PM.',
        category: 'Events',
        isPinned: false,
        targetAudience: 'All Students',
        postedBy: 'Sports Committee',
      },
      {
        title: 'Hostel Security & Gate Curfew Reminders',
        content: 'All residents are reminded that biometric hostel gate check-in closes strictly at 10:30 PM on weekdays. Prior late-entry permission from the resident warden is mandatory.',
        category: 'Rules & Regulations',
        isPinned: false,
        targetAudience: 'All Students',
        postedBy: 'Hostel Security Office',
      },
    ];

    await Notice.insertMany(noticesData);
    console.log(`✅ Created ${noticesData.length} hostel announcements and notices.`);

    console.log('🎉 Database seeding complete successfully!');
  } catch (error) {
    console.error('❌ Seeding failed with error:', error);
  }
};

// If run directly from terminal
if (process.argv[1]?.endsWith('seedData.js')) {
  (async () => {
    await connectDB();
    await seedDatabase();
    process.exit(0);
  })();
}

export default seedDatabase;
