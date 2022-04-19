const { sequelize, Op } = require('../model');

 const {Job, Contract, Profile} = sequelize.models;

 /**
  * 
  * @param {*} profileId 
  * @returns user's unpaid jobs
  */
const getUserUnpaidJob = async (profileId) =>{
  try {
  return await Job.findAll({
    where:{
      paid: {[Op.not]:true}
    },
    include: [{
      model: Contract ,
            where: {
              [Op.and]:[ { status: {[Op.eq]:'in_progress'} }, { [Op.or]: [ {ClientId: profileId}, {ContractorId: profileId} ] } ]
          }
    }] 
  })
} catch (error) {
  return error
}
}

/**
 * 
 * @param {*} profile 
 * @param {*} job_id 
 * @returns boolean stating if a job has been paid for
 */
const payForJob = async (profile, job_id) =>{
  const transaction = await sequelize.transaction();
  try {

  const job = await Job.findOne({
    where: {id: job_id},
    include: [{
      model: Contract,
        where: {
          ClientId: profile.id
        },
        include: [
          {
            model: Profile,
            as: 'Contractor'
          }
        ]
    }]
  }, {transaction})
  if(job.paid) return ({message:'already paid'})

  const canPay = profile.balance >= job.price; 
  if(canPay) {
  await Profile.update({
    balance: job.Contract.Contractor.balance + job.price
  }, {
    where: {
      id: job.Contract.ContractorId
    }
  }, {transaction});

  await Profile.update({
    balance: profile.balance - job.price
  }, {
    where: {
      id: profile.id
    }
  }, {transaction})

  await Job.update({
    paid: true,
    paymentDate: Date.now()
  }, {
    where: {
      id: job.id
    }
  }, {transaction})

  }

await transaction.commit();
return canPay;
} catch (error) {
  await transaction.rollback()
}
}
 module.exports = {getUserUnpaidJob, payForJob}