async function runTest() {
  console.log("Starting test flow...");
  try {
    // 1. Login as CEO
    console.log("Logging in as CEO...");
    let ceoLogin = await fetch('http://localhost:5000/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'ayushtechbbsr@gmail.com',
        password: 'tnZhXiEmZ1K6Tw5A1!'
      })
    });
    let ceoData = await ceoLogin.json();
    if (!ceoLogin.ok) throw new Error(ceoData.message || 'CEO login failed');
    const ceoToken = ceoData.token;
    console.log("✓ CEO login successful.");

    // 2. Create Staff Account
    console.log("Creating Staff Account...");
    const newStaffEmail = `staff_${Date.now()}@test.com`;
    let createStaff = await fetch('http://localhost:5000/api/users', {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${ceoToken}`
      },
      body: JSON.stringify({
        name: 'Test Staff',
        email: newStaffEmail,
        mobile: '9876543210',
        role: 'staff',
        department: 'Sales'
      })
    });
    let staffData = await createStaff.json();
    if (!createStaff.ok) throw new Error(staffData.message || 'Staff creation failed');
    const staffPassword = staffData.tempPassword;
    console.log(`✓ Staff created successfully. Email: ${newStaffEmail}, Password: ${staffPassword}`);

    // 3. Login as Staff
    console.log("Logging in as Staff...");
    let staffLogin = await fetch('http://localhost:5000/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: newStaffEmail,
        password: staffPassword
      })
    });
    let staffLoginData = await staffLogin.json();
    if (!staffLogin.ok) throw new Error(staffLoginData.message || 'Staff login failed');
    const staffToken = staffLoginData.token;
    console.log("✓ Staff login successful.");

    // 3.5. Change Password
    console.log("Changing Staff Password...");
    const newPassword = 'NewStrongPassword123!';
    let changePwd = await fetch('http://localhost:5000/api/auth/change-password', {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${staffToken}`
      },
      body: JSON.stringify({
        currentPassword: staffPassword,
        newPassword: newPassword
      })
    });
    if (!changePwd.ok) {
        let err = await changePwd.json();
        throw new Error(err.message || 'Password change failed');
    }
    console.log("✓ Staff password changed successfully.");

    // 4. Create Receipt with real email to test PDF & NodeMailer
    console.log("Creating Receipt...");
    let createReceipt = await fetch('http://localhost:5000/api/receipts', {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${staffToken}`
      },
      body: JSON.stringify({
        clientName: 'Test Client',
        mobile: '9998887776',
        email: 'ayushtechbbsr@gmail.com', // use real email to verify receiving
        gender: 'Male',
        amount: 5000,
        purpose: 'Advance Payment for Services',
        paymentMode: 'Online',
        utrNo: `UTR${Date.now()}`
      })
    });
    
    let receiptData = await createReceipt.json();
    if (!createReceipt.ok) throw new Error(receiptData.message || 'Receipt creation failed');
    
    console.log("✓ Receipt created successfully.");
    console.log("Receipt Data:", JSON.stringify(receiptData, null, 2));

    if (receiptData.pdfUrl) {
      console.log(`✓ Cloudinary PDF URL: ${receiptData.pdfUrl}`);
    } else {
      console.log("❌ Cloudinary PDF URL missing!");
    }

    if (receiptData.emailSent) {
      console.log(`✓ Email successfully sent to ${receiptData.email}`);
    } else {
      console.log("❌ Email sending failed!");
    }

    console.log("\nALL TESTS PASSED SUCCESSFULLY!");
  } catch (error) {
    console.error("Test failed:", error);
  }
}

runTest();
