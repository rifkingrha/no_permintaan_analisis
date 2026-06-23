const {generateBasicAccount} = require('../../../lib/basic_token')
const db = require('../../models')

module.exports = async(req, res) => {
    const result = await db.basicAuthAccount.count()
    if (result) return res.send({success: false, code: 400, error:'There is a basic account already generated. please use that instead.'})
    const basicAccount = await generateBasicAccount()
    console.log(basicAccount)
    res.send({data: basicAccount, success:true})
}