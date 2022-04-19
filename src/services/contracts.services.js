const { sequelize, Op } = require('../model');

 const {Contract} = sequelize.models;

 /**
  * 
  * @param {*} id 
  * @param {*} profileId 
  * @returns a specific contract
  */
const getContract = async (id, profileId) =>{
    try {  
    return await Contract.findOne({
      where:{
        [Op.and]:[ {id}, { [Op.or]: [{ClientId: profileId}, {ContractorId: profileId}]} ]  
      } 
    }); 
  } catch (error) {
    return error
  }
}

/**
 * 
 * @param {*} profileId 
 * @returns a single user's contracts
 */
const getContractProfile = async (profileId) =>{
  try {
  return await Contract.findAll({
    where:{
      [Op.and]:[ { status: {[Op.ne]:'terminated'} }, { [Op.or]: [ {ClientId: profileId}, {ContractorId: profileId} ] } ]  
    } 
  });
} catch (error) {
  return error
}
}

const getUserUnpaidJob = async (profileId) =>{
  try {
  return await Contract.findAll({
    where:{
      [Op.and]:[ { status: {[Op.ne]:'terminated'} }, { [Op.or]: [ {ClientId: profileId}, {ContractorId: profileId} ] } ]  
    } 
  });
} catch (error) {
  return error
}
}

 module.exports = {getContract, getContractProfile}