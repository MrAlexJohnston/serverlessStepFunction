'use strict';

const AWS = require('aws-sdk');
const stepfunctions = new AWS.StepFunctions();

module.exports.executeStepFunction = (event, context, callback) => {
    console.log('executeStepFunction was called');

    const number = event.queryStringParameters.number;
    console.log(number);

    callStepFunction(number).then(result  => {
        let message = 'Step function is executing';
        if (!result) {
            message = 'Step function is not executing';
        }

        const response = {
            statusCode: 200,
            body: JSON.stringify({ message })
        };

        callback(null, response);
    });

};

module.exports.isNumberInteger = (event, context, callback) => {
    console.log(`isNumberInteger was called - event.number: ${event.number}`);
    console.log(typeof event.number);

    let integer,
        number = Number(event.number);

    if (Number.isInteger(number)) {
        integer = true;
    } else {
        integer = false;
    }

    callback(null, {integer, number});
};

module.exports.roundNumber = (event, context, callback) => {
    console.log(`roundDown was called - event.number: ${event.number}`);
    console.log(typeof event.number);

    let integer,
        number = Number(Math.round(event.number));

    if (Number.isInteger(number)) {
        integer = true;
    } else {
        integer = false;
    }

    callback(null, {integer, number});
};

module.exports.calculateRandomNumber = (event, context, callback) => {
    console.log(`calculateRandomNumber was called - event.number: ${event.number}`);

    let random = Math.floor(Math.random() * event.number) + 1;
    console.log(random);

    callback(null, random);
};

module.exports.numberOddOrEven = (event, context, callback) => {
    console.log('moreCalculations was called');
    console.log(JSON.stringify(event));

    let number = event,
        numberType;
    if (number % 2 !== 0) {
        numberType = 'odd';
    } else {
        numberType = 'even'
    }
    callback(null, { numberType });
};

module.exports.lessOrMoreThan5 = (event, context, callback) => {
    console.log('finalCalculations was called');
    let outcome;
    if (event < 5) {
        outcome = `less than 5 - ${event}`;
    } else {
        outcome = `more or equal to 5 - ${event}`;
    }
    callback(null, { outcome });
};

module.exports.finalState = (event, context, callback) => {
    let message = `The number is ${event[0].numberType} and is ${event[1].outcome} `;
    callback(null, message);
};

function callStepFunction(number) {
    console.log('callStepFUnction');

    const stateMachineName = 'testingStateMachineAJ';
    console.log('Fetching the list of available workflows');

    return stepfunctions.listStateMachines({}).promise().then(listStateMachines => {
        console.log(`Searching for the step function ${JSON.stringify(listStateMachines)}`);

        for (let i = 0; i < listStateMachines.stateMachines.length; i ++) {
            const item = listStateMachines.stateMachines[i];

            if (item.name.indexOf(stateMachineName) >= 0) {
                console.log(`Found the step function ${JSON.stringify(item)}`);

                let params = {
                    stateMachineArn: item.stateMachineArn,
                    input: JSON.stringify({number: number})
                };

                console.log('Start execution');

                return stepfunctions.startExecution(params).promise().then(() => {
                    return true;
                });
            }
        }
    }). catch(error => {
        console.log(error);
        return false;
    });
}