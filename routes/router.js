const express = require('express'),
    Log = require('../lib/log'),
    xhr = require('../lib/xhr'),
    router = express.Router(),
    invalidRequest = {
        jsonrpc: '2.0',
        error: {
            code: 32600,
            message: 'Invalid Request'
        }
    },
    invalidMethod = {
        jsonrpc: '2.0',
        error: {
            code: 32601,
            message: 'Method not found'
        }
    },
    invalidAuth = {
        jsonrpc: '2.0',
        error: {
            code: 32602
        }
    },
    invalidServiceAuth = {
        jsonrpc: '2.0',
        error: {
            code: 32603,
            message: 'Service auth not found'
        }
    };

router.get('/', (req, res)=>{
    Log('GET request', 0);
    res.json(Object.assign(invalidRequest, {id: null}));
});
router.post('/', (req, res)=>{
    selectInterface(req)
        .then(result => {
            res.json(result);
        });
});

const action = (service, req) => {
        return new Promise(resolve => {
            const methodPrefix = req.body.method.split('_')[0],
                authPrefix = req.body.method.split('_')[1];
            if (authPrefix === 'auth') {
                const auth = req.services.filter(el => el.name === authPrefix);
                if (auth.length) {
                    xhr({
                        url: auth[0].host + ':' + auth[0].port,
                        body: {
                            method: 'auth_authenticate',
                            params: [req.headers['a-token'] || '', req.body.id],
                            id: req.body.id
                        }
                    })
                        .then(resp => {
                            const response = resp.result.auth
                                ? xhr({
                                    url: service.host + ':' + service.port,
                                    body: req.body
                                })
                                : Object
                                    .assign(invalidAuth, {
                                        error: {
                                            message: resp.result.message
                                        }});
                            resolve(response);
                        })
                        .catch(e => {
                            resolve(Object
                                .assign(invalidAuth, {error: {message: e}}))
                        })
                } else {
                    resolve(invalidServiceAuth);
                }
            } else resolve(xhr({
                url: service.host + ':' + service.port,
                body: req.body
            }));
        })
},
      selectInterface = async (req) => {
        if (!req.body ||
            !req.body.jsonrpc ||
            !req.body.method ||
            !req.body.params ||
            !req.body.id) {
            Log('Bad request body.', 0);
            return invalidRequest;
        }
        try {
            const methodPrefix = req.body.method.split('_')[0],
                  srv = req.services
                      .filter(el => el.name === methodPrefix);
            return srv.length ? await action(srv[0], req)
                : Object.assign(invalidMethod, {id: req.body.id});
        } catch (e) {
            Log('Bad method. ' + e, 0);
            return invalidRequest;
        }

      };

module.exports = router;