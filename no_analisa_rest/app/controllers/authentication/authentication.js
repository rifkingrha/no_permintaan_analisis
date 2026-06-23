const db = require('../../models');
const bcrypt = require('bcrypt');
//const { signAccessToken, signRefreshToken } = require('../../../lib/jwt_helper');
const { insertTrails } = require('../audit_trails/audit_trails.js')

module.exports = {
  async login(req, res) {
    try {
      const { username, password } = req.body;
      const userAccount = await db.user_account.findOne({ 
        where: { username },
        include: [
          { model: db.access_level },
          { model: db.mst_department,
            as: 'department',
            attributes: ['id', 'code', 'name']
          }
        ]
      });
      
      if (!userAccount) return res.status(401).send({ success: false, message: 'Invalid credentials' });

      const isMatch = await bcrypt.compare(password, userAccount.password);
      if (!isMatch) return res.status(401).send({ success: false, message: 'Invalid credentials' });

      // 3. Prepare Permissions (e.g., ['admin', 'view_reports'])
      const permissions = userAccount.access_level ? [userAccount.access_level.role] : ['userAccount'];

      // const accessToken = await signAccessToken(userAccount.id.toString(), permissions);
      // const refreshToken = await signRefreshToken(userAccount.id.toString());
      console.log({user : userAccount})
      // 5. Response
      res.success({
        // accessToken,
        // refreshToken,
        userAccount: {
          id: userAccount.id,
          username: userAccount.username,
          email: userAccount.email,
          role: userAccount.access_level?.role,
          user: userAccount.user,
          dept: userAccount.dept_code,
          deptname:userAccount.department?.name
        }
      }, 'Login successful');
      
      insertTrails(req, res,{
        date: new Date(),
        menu: 'Login',
        action: 'User logged in',
        start_value: null,
        final_value: null,
        changes: null,
        user: userAccount.username
      })
      
    } catch (err) {
      res.error(err.message);
    }
  }
};