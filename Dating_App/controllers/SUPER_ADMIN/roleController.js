const Role = require('../../models/Role');
const User = require('../../models/User');
const { Auth } = require('../../auth/jwt');

exports.createRole = async (req, res) => {
  try {
    const { name, permissions } = req.body;
    const role = await Role.create({ name, permissions });
    res.status(201).json(role);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getAllRoles = async (req, res) => {
  try {
    const roles = await Role.findAll();
    res.json(roles);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.updateRole = async (req, res) => {
  try {
    const { roleId } = req.params;
    const { name, permissions } = req.body;

    const [updated] = await Role.update({ name, permissions }, { where: { id: roleId } });
    if (!updated) return res.status(404).json({ message: 'Role not found' });

    const updatedRole = await Role.findByPk(roleId);
    res.json(updatedRole);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.deleteRole = async (req, res) => {
  try {
    const { roleId } = req.params;
    const deleted = await Role.destroy({ where: { id: roleId } });
    if (!deleted) return res.status(404).json({ message: 'Role not found' });

    res.json({ message: 'Role deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.assignUserRole = async (req, res) => {
  try {
    const { roleId } = req.params;
    const { userId } = req.body;

    const user = await User.findByPk(userId);
    if (!user) return res.status(404).json({ error: 'User not found' });

    user.roleId = roleId;
    await user.save();

    res.json({ message: 'Role assigned successfully', user });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
