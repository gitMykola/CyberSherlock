const express = require('express'),
    Log = require('../lib/log'),
    xhr = require('../lib/xhr'),
    router = express.Router(),
    services = require('../assets/config').services,
    invalidRequest = {
        jsonrpc: '2.0',
        error: {
            code: -32600,
            message: 'Invalid Request'
        }
    },
    invalidMethod = {
        jsonrpc: '2.0',
        error: {
            code: -32601,
            message: 'Method not found'
        }
    },
    requestDone = {
        jsonrpc: '2.0'
    };

router.get('/', (req, res)=>{
    Log('GET request', 0);
    res.status(503).json(Object.assign(invalidRequest, {id: null}));
});
router.post('/', (req, res)=>{
    selectInterface(req.body)
        .then(result => {
            res.status(result.error ? 503 : 200)
                .json(Object.assign(requestDone, result));
        });
});

const action = {
    state: (body) => {
        return new Promise(resolve => {
            setTimeout(() => {
                resolve(Object.assign(requestDone, {
                    result: 'Cyber Sherlock RPC',
                    id: body.id
                }));
            }, 500);
        })
    },
    user: (body) => {
        return new Promise(resolve => {
            xhr({
                body: body
            })
                .then(result => resolve(result))
                .catch(err => resolve({
                    error: {
                        code: -32000,
                        message: err
                    }
                }))
        })
    },
    auth: (body) => {
        return Object.assign(requestDone, {
            result: 'Auth RPC',
            id: body.id
        });
    },
    task: (body) => {
        return Object.assign(requestDone, {
            result: 'Task RPC',
            id: body.id
        });
    },
    media: (body) => {
        return Object.assign(requestDone, {
            result: 'Media RPC',
            id: body.id
        });
    }
},
      selectInterface = async (body) => {
        if (!body ||
            !body.jsonrpc ||
            !body.method ||
            !body.params ||
            !body.id) {
            Log('Bad request body.', 0);
            return invalidRequest;
        }
        try {
            const methodPrefix = body.method.split('_')[0];
            return services
                .filter(el => el.name = body.method.split('_')[0])
                .length ? await action[methodPrefix](body)
                : Object.assign(invalidMethod, {id: body.id});
        } catch (e) {
            Log('Bad method. ' + e.message, 0);
            return invalidRequest;
        }

      };

module.exports = router;