const customerchange=require('./customer_module/customer_change');
const customershow=require('./customer_module/customershow');
const salesmanchange=require('./salesman_module/salesman_change');
const salesmanshow=require('./salesman_module/salesmanshow');
const root=require('./root/root');
const logger=require('./security/logger/logger');
const search=require('./searchmodule/search');
const loginmodule=require('./sign_in_module/sign_up_or_log_in')
async function startbackend(){
    customerchange.startcustomer_change();
    customershow.startcustomer_show();
    salesmanchange.startsalesman_change();
    salesmanshow.startsalesman_show();
    root.startrootserver();
    search.startsearchserver();
    loginmodule.startregistserver();
    logger.info(Date.now()+'start backend server');
}
function wait(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

startbackend();

  
