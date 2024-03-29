const request = require('supertest');
const app = require('../app'); 
const { conn } = require('../Dbconnection/connection');

test('not authorized SessionsPerEV test', async ()=>{
    const res = await request(app)
                    .get("/evcharge/api/SessionsPerEV/HOS-9576/20210104/20210106");
                    

    expect(res.statusCode).toEqual(401);
    expect(res.text).toEqual('token required');
});

test('valid SessionsPerEV test', async ()=>{
    const login_res = await request(app)
                .post("/evcharge/api/login")
                .send({
                    username: 'Stef',
                    password: 'yolaria123'
                });

    const token = login_res.body.token;

    const res = await request(app)
                    .get("/evcharge/api/SessionsPerEV/HOS-9576/20210101/20210105")
                    .set('X-OBSERVATORY-AUTH', token)
                   
    
    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty('VehicleID')
    //expect(res.body.VehicleID).toEqual('HOS-9576');
    expect(res.body).toHaveProperty('PeriodFrom')
    //expect(res.body.PeriodFrom).toEqual('2021-01-01');
    expect(res.body).toHaveProperty('PeriodTo')
    //expect(res.body.PeriodTo).toEqual('2021-01-05');
    expect(res.body).toHaveProperty('VehicleChargingSessionsList')
    expect(res.body).toHaveProperty('TotalEnergyConsumed')
    expect(res.body).toHaveProperty('NumberOfVisitedPoints')
    expect(res.body).toHaveProperty('NumberOfVehicleChargingSessions')
    //expect(res.body.VehicleChargingSessionsList.length).toEqual(1);
    if(res.body.VehicleChargingSessionsList.length>0){
        expect(res.body.VehicleChargingSessionsList[0]).toHaveProperty('SessionIndex')
        expect(res.body.VehicleChargingSessionsList[0]).toHaveProperty('SessionID')
        expect(res.body.VehicleChargingSessionsList[0]).toHaveProperty('EnergyProvider')
        expect(res.body.VehicleChargingSessionsList[0]).toHaveProperty('StartedOn')
        //expect(res.body.VehicleChargingSessionsList[0].SessionID).toEqual(188);
    }

//logout
    const logout_res = await request(app)
    .post("/evcharge/api/logout")
    .set('X-OBSERVATORY-AUTH', token)

    expect(logout_res.statusCode).toEqual(200);
    expect(logout_res.text).toEqual('Token removed');
});


/*
    "VehicleID": "HOS-9576",
    "RequestTimestamp": "2021-03-12 17:16:18",
    "PeriodFrom": "2021-01-01",
    "PeriodTo": "2021-01-05",
    "TotalEnergyConsumed": 13.5,
    "NumberOfVisitedPoints": 1,
    "NumberOfVehicleChargingSessions": 1,
    "VehicleChargingSessionsList": [
        {
            "SessionIndex": 1,
            "SessionID": 188,
            "EnergyProvider": "Supplier-5",
            "StartedOn": "2021-01-04 17:34:00",
            "FinishedOn": "2021-01-04 17:53:35",
            "ΕnergyDelivered": 13.5,
            "PricePolicyRef": "unknown",
            "CostPerKWh": 0.26,
            "SessionCost": 3.51

*/