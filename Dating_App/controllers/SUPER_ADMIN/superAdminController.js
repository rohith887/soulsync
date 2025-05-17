const SuperAdmin = require('../../models/SuperAdmin');
const Admin = require('../../models/Admin');
const User = require('../../models/User');
const AppSettings = require('../../models/AppSettings');
const Report = require('../../models/Report');
const bcrypt = require('bcryptjs');
const { Auth, createToken, generateRefreshToken } = require('../../auth/jwt');


exports.superAdminSignUp = async (req, res) => {
  const { username, email, password } = req.body;

  try {
    if (await Admin.findOne({ where: { email } })) {
      return res.status(409).json({ success: false, message: 'Email already in use.' });
    }

    const superAdmin = await Admin.create({
      username,
      email,
      password,
      role: 'superadmin'
    });

    res.status(201).json({
      success: true,
      message: 'Super-admin registered.',
      data: { id: superAdmin.id, email: superAdmin.email }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: err.message });
  }
};
//
exports.loginSuperAdmin = async (req, res) => {
  const { email, password } = req.body;
//   const user = await Admin.findOne({ where: { email, role: 'superadmin' } });
 const user = await SuperAdmin.findOne({ where: { email } });
  if (!user || !(await bcrypt.compare(password, user.password))) {
    return res.status(401).json({ success: false, message: 'Invalid credentials.' });
  }

  const accessToken  = createToken(user);
  const refreshToken = generateRefreshToken(user);

  res.json({
    success: true,
    access_token:  accessToken,
    refresh_token: refreshToken,
    user: {
      id:   user.id,
      role: user.role,
      email:user.email
    }
  });
};


// Add Admin 
exports.addAdmin = async (req, res) => {
  const { username, email, password } = req.body;

  try {
    const existingAdmin = await Admin.findOne({ where: { email } });

    if (existingAdmin) {
      return res.status(409).json({ success: false, message: 'Admin with this email already exists.' });
    }

    const admin = await Admin.create({ username, email, password });
     res.status(201).json({ 
         success: true,
         message: 'Admin registered successfully.',
         data: admin
     });
  } catch (error) {
    res.status(500).json({ 
        success: false,
        message: 'Error during admin registration.',
        error: error.message 
    });
  }
} 

// 3. Update Admin
exports.updateAdmin = async (req, res) => {
  try {
    const { adminId } = req.params;
    const updates = req.body;

    const updated = await Admin.update(updates, { where: { id: adminId, role: 'admin' } });

    if (updated[0] === 0) {
      return res.status(404).json({ success: false, message: "Admin not found" });
    }

    res.json({ success: true, message: "Admin updated successfully" });
  } catch (err) {
    console.error("Update Admin Error:", err);
    res.status(500).json({ success: false, message: err.message });
  }
};

// 4. Delete Admin
exports.deleteAdmin = async (req, res) => {
  try {
    const { adminId } = req.params;

    const deleted = await Admin.destroy({ where: { id: adminId, role: 'admin' } });

    if (!deleted) {
      return res.status(404).json({ success: false, message: "Admin not found" });
    }

    res.json({ 
        success: true,
        message: "Admin deleted successfully"
    });
  } catch (err) {
    console.error("Delete Admin Error:", err);
    res.status(500).json({ 
        success: false, 
        message: err.message 
    });
  }
};

// 5. List All Admins
exports.listAdmins = async (req, res) => {
  try {
    const admins = await Admin.findAll({ where: { role: 'admin' } });
    res.json({ success: true, admins });
  } catch (err) {
    console.error("List Admins Error:", err);
    res.status(500).json({ 
        success: false,
        message: err.message
    });
  }
};


//SETTINGS

exports.getSettings = async (req, res) => {
  try {
    const settings = await AppSettings.findAll();
    res.status(200).json({
      success: true,
      settings,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,  // ✅ This now works because `err` is defined
    });
  }
};


exports.updateSettings = async(req,res)=>{
     try{
          const { key } = req.params;
          const { value } = req.body;
          
          const  [updated] = await AppSettings.update({ value },{ where: { key }});
          
          if(!updated){
              return res.status(404).json({
                  success:false,
                  message:`Settings with key "${key}" not found`,
              })
          }
          
          res.status(200).json({
              success:true,
               message: `Setting "${key}" updated successfully`,
          })
     }catch (err) {
        res.status(500).json({ success: false, message: err.message });
      }
};


// module.exports = {
//     superAdminSignUp,
//     loginSuperAdmin,
//     addAdmin,
//     updateAdmin,
//     deleteAdmin,
//     listAdmins,
//     getSettings,
//     updateSettings
// }