const Enforcer = require('casbin');

class BasicAuthorizer {
    private req: any;
    private enforcer: any;

    constructor(req: any, enforcer: any) {
        this.req = req;
        this.enforcer = enforcer;
    }

    getUserRole() {
        const { user } = this.req;
        const { role } = user;
        return role;
    }

    checkPermission() {
        const { req, enforcer } = this;
        const { originalUrl: path, method } = req;
        const userRole = this.getUserRole();
        return enforcer.enforce(userRole, path, method);
    }
}

// the authorizer middleware
function authz(newEnforcer: () => Promise<typeof Enforcer>) {
    return async (req: any, res: any, next: any) => {
        try {
            const enforcer = await newEnforcer();
    
            // user sample
            req.user = {role: 'notadmin'};
    
            if(!(enforcer instanceof Enforcer)) {
                res.status(500).json({500: 'Invalid enforcer'});
                return;
            }
    
            const authorizer = new BasicAuthorizer(req, enforcer);
            if(!authorizer.checkPermission()) {
                res.status(403).json({403: 'Forbidden'});
                return;
            }

            next();
        } catch (error) {
            console.log(error); 
            res.status(400).send('Something is wrong');
            return;
        }
    }
};


module.exports.BasicAuthorizer = BasicAuthorizer;
module.exports.authz_fn = authz;

