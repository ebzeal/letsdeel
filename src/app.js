const express = require('express');
const bodyParser = require('body-parser');

const {getProfile} = require('./middleware/getProfile')
const {getContract, getContractProfile} = require('./services/contracts.services');
const { getUserUnpaidJob, payForJob } = require('./services/jobs.services');
const { depositFunds, highestPaidProfessionService, highestPayingClientService } = require('./services/admin.services');

const app = express();
app.use(bodyParser.json());

/**
 *
 * @description contract by id.
 * @param {*} req Express Request object
 * @param {*} res Express Response object
 * @returns contract by id
 */
app.get('/contracts/:id',getProfile ,async (req, res) =>{
    const {id} = req.params
    const profileId = req.profile.id;
    const contract = await getContract(id, profileId)
    if(!contract) return res.status(404).end()
    res.json(contract)
})

/**
 *
 * @description contract by id.
 * @param {*} req Express Request object
 * @param {*} res Express Response object
 * @returns a user's contracts
 */
app.get('/contracts',getProfile ,async (req, res) =>{
  const profileId = req.profile.id;
  const contracts = await getContractProfile(profileId);
  if(!contracts) return res.status(404).end()
  res.json(contracts)
})

/**
 * @returns a user's unpaid job
 */
 app.get('/jobs/unpaid',getProfile ,async (req, res) =>{
  const profileId = req.profile.id;
  const unpaidJobs = await getUserUnpaidJob(profileId);
  if(!unpaidJobs) return res.status(404).end()
  res.json(unpaidJobs)
})

/**
 * @returns a client can pay for job
 */
 app.post('/jobs/:job_id/pay',getProfile ,async (req, res) =>{
   try {
    const {job_id} = req.params
    const profile = req.profile;

const paid = await payForJob(profile, job_id)
  
  if(paid.message==='already paid') return res.status(409).json({message: "Job is not owed payment"}).end()
  if(!paid) return res.status(404).json({message: "Payment not successful"}).end()
  res.json({message: "Job has been fully paid for"})
    
} catch (error) {
  return error;
}
})


/**
 * @returns a client can deposit money into their account
 */
 app.post('/balances/deposit/:userId',getProfile ,async (req, res) =>{
   // should this have authorization, to ensure a user can only deposit into their account?
  try {
   const {userId} = req.params;
   const {amount} = req.body;
  
const canDeposit = await depositFunds(userId, amount)

 if(!canDeposit) return res.status(404).json({message: "Deposit not successful"}).end()
 res.json({message: "Deposit made"})
   
} catch (error) {
    return error;
}
})

/**
 * @returns the profession that earned the most money
 */
 app.get('/admin/best-profession',getProfile ,async (req, res) =>{
   const {start, end} = req.query
   const startDate = start || 0000-00-00;
   const endDate = end || new Date().toISOString().slice(0, 10);
  
  const highestPaidProfession = await highestPaidProfessionService(startDate, endDate)

  if(!highestPaidProfession) return res.status(404).end()
  res.json(highestPaidProfession)
})

/**
 * @returns highest paying client
 */
 app.get('/admin/best-clients',getProfile ,async (req, res) =>{
  const {start, end, limit} = req.query
  const startDate = start || 0000-00-00;
  const endDate = end || new Date().toISOString().slice(0, 10);
  const setLimit = limit || 2;
 
 const highestPayingClients = await highestPayingClientService(startDate, endDate, setLimit)

 if(!highestPayingClients) return res.status(404).end()
 res.json(highestPayingClients)
})

module.exports = app;
