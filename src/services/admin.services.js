const { sequelize, QueryTypes } = require('../model');

 const {Profile} = sequelize.models

 /**
  * 
  * @param {*} userId 
  * @param {*} amount 
  * @returns deposit money into client's account
  */
const depositFunds = async (userId, amount) =>{
  const transaction = await sequelize.transaction();
  try {

    const totalPrice = await sequelize.query(
      "SELECT *, SUM([price]) as sum_price FROM jobs j LEFT JOIN contracts c ON c.id =j.ContractId LEFT JOIN profiles p ON p.id=$1 WHERE c.ClientId=$1",
      {
      bind: [userId],
      type: QueryTypes.SELECT
    }, {transaction})
  
    const twentyFivePercentOfJob = .25 * totalPrice[0].sum_price;
    const canDeposit = amount <= twentyFivePercentOfJob;
    if(canDeposit){
      await Profile.update({
        balance: totalPrice[0].balance + amount
      }, {
        where: {
          id: userId
        }
      }, {transaction}) 
    }
  await transaction.commit();
return canDeposit;
} catch (error) {
  await transaction.rollback()
}
}

/**
 * 
 * @param {*} startDate 
 * @param {*} endDate 
 * @returns highest paying profession
 */
const highestPaidProfessionService = async (startDate, endDate) =>{
  try {

    const highestPaidProfession = await sequelize.query(
      "SELECT profession, SUM(j.price) as total_paid FROM profiles p LEFT JOIN contracts c ON c.ContractorId=p.id LEFT JOIN jobs j ON j.ContractId=c.id WHERE j.paid=true AND paymentDate BETWEEN $1 AND $2 GROUP BY profession ORDER BY total_paid DESC  LIMIT 1"
      ,{
        bind: [startDate, endDate],
        type: QueryTypes.SELECT
      });
      return highestPaidProfession;
} catch (error) {
  return error
}
}

/**
 * 
 * @param {*} startDate 
 * @param {*} endDate 
 * @param {*} setLimit 
 * @returns returns highest paying client
 */
const highestPayingClientService = async (startDate, endDate, setLimit) =>{
  try {

    const highestPayingClients = await sequelize.query(
      "SELECT p.id, firstName ||' '|| lastName as fullName, SUM(j.price) as paid FROM profiles p LEFT JOIN contracts c ON c.ClientId=p.id LEFT JOIN jobs j ON j.ContractId=c.id AND paymentDate BETWEEN $1 AND $2 GROUP BY p.id ORDER BY paid DESC  LIMIT $3"
      ,{
       bind: [startDate, endDate, setLimit],
       type: QueryTypes.SELECT
     });
      return highestPayingClients;
} catch (error) {
  return error
}
}
 module.exports = { depositFunds, highestPaidProfessionService, highestPayingClientService }