/*
 * This file is part of the Spludo Framework.
 * Copyright (c) 2009 DracoBlue, http://dracoblue.net/
 *
 * Licensed under the terms of MIT License. For the full copyright and license
 * information, please see the LICENSE file in the root folder.
 */

/**
 * @class Is a base application (should be extended).
 * 
 * @extends Options
 * 
 * @version 0.1
 * @author DracoBlue
 */
BaseApplication = function(options) {
    this.setOptions(options);
    if (typeof this.run !== "function") {
        throw new Error("Implement the .run method!");
    }
};

process.mixin(true, BaseApplication.prototype, Options.prototype);

/**
 * Runs the application.
 */
BaseApplication.prototype.run = function() {
    throw new Error("run method not implemented!");
};

/**
 * @class The application running and listening on a specific port.
 * 
 * @extends BaseApplication
 * 
 * @version 0.1
 * @author DracoBlue
 */
ServerApplication = function(options) {
    this.setOptions(options);

    /**
     * The Http-Server listening for new connections.
     * 
     * @private
     */
    this.server = null;
};

process.mixin(true, ServerApplication.prototype, BaseApplication.prototype);

/**
 * Runs the application.
 */
ServerApplication.prototype.run = function() {
    var http = require("http");

    this.server = http.createServer(function(req, res) {
        var context = {
            status: 200,
            headers: {
                'Content-Type': 'text/plain'
            }
        };

        var response = null;

        try {
            var controller = controller_manager.getController(req.uri.full.substr(1));
            response = controller[0].execute(controller[1], context);
            if (typeof context.view_name !== "undefined") {
                /*
                 * We need the view manager, since the view-name is set!
                 */
                var view = view_manager.getView(context.view_name);
                response = view.render(controller[1], context);
            }
        } catch (e) {
            context.status = 404;
            response = "Page not found!" + sys.inspect(e);
        }

        res.sendHeader(context.status, context.headers);
        res.sendBody(response);

        res.finish();
    });

    this.server.listen(this.options["port"]);
};

/**
 * @class Runs the application exactly one time with a given path.
 * 
 * @extends BaseApplication
 * 
 * @version 0.1
 * @author DracoBlue
 */
ConsoleApplication = function(options) {
    this.setOptions(options);
};

process.mixin(true, ConsoleApplication.prototype, BaseApplication.prototype);

/**
 * Runs the application.
 */
ConsoleApplication.prototype.run = function() {
    var sys = require("sys");
    var response = null;

    try {
        var context = {};
        var controller = controller_manager.getController(this.options["path"]);
        response = controller[0].execute(controller[1], context);
        if (typeof context.view_name !== "undefined") {
            /*
             * We need the view manager, since the view-name is set!
             */
            var view = view_manager.getView(context.view_name);
            response = view.render(controller[1], context);
        }
    } catch (e) {
        response = "Error:\n" + sys.inspect(e);
    }

    sys.puts(response);
};
