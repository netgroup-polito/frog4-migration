$(document).ready(function() {

    var username = appConfig.username;
    var password = appConfig.password;
    var migration_orch_endpoint = appConfig.migration_orch_endpoint;
    var login_url = migration_orch_endpoint+ appConfig.login_url;
    var graph_url = migration_orch_endpoint+ appConfig.graph_url;
    var state_url = migration_orch_endpoint+ appConfig.state_url;
    var tenant_id = appConfig.tenant_id;
    var from_vnf_id = appConfig.from_vnf_id;
    var to_vnf_id = appConfig.to_vnf_id;
    var graphs_path = appConfig.graphs_path;
    var graph1 = graphs_path+"/"+appConfig.graph1;
    var graph2 = graphs_path+"/"+appConfig.graph2;
    var graph3 = graphs_path+"/"+appConfig.graph3;

    function logOnConsole(message){
        var now = new Date().toLocaleTimeString();
        console.log(now + " " + message);
    }

    function performLogin(user, pass) {
        var login_data = {"username":user, "password":pass };
        var login_data_json = JSON.stringify(login_data);
        var deferred = $.Deferred();
        $.ajax({
            url: login_url,
            type: "POST",
            data: login_data_json,
            contentType: "application/json",
            success: function(resp) {
                var token = resp.token;
                logOnConsole("[performLogin] Login performed, token: " + token);
                Cookies.set("token", token);
                logOnConsole("[performLogin] Cookie set 'token': " + Cookies.get('token'));
                deferred.resolve();
            },
            error: function(err) {
                deferred.reject("[performLogin] Login error:" + err.status + " " + err.statusText + " " + err.responseText);
            }
        });
        return deferred.promise();
    }


    function postGraphRequest(token, graph_path, id_log){
        logOnConsole("[postGraph] posting graph using token: " + token + "...");
        $.getJSON(graph_path, function(graph) {
            $.ajax({
                url: graph_url,
                type: "POST",
                data: JSON.stringify(graph),
                contentType: "application/json",
                headers: {'X-Auth-Token': token},
                success: function (resp) {
                    var graph_id = resp.id;
                    logOnConsole("[postGraph] posting graph using token: " + token + "...done! Graph_id: " + graph_id);
                    Cookies.set("graph_id", graph_id);
                    logOnConsole("[postGraph] Cookie set 'graph_id': " + Cookies.get('graph_id'));
                    $(id_log).removeClass("btn-primary").removeClass("btn-danger").addClass("btn-success");
                },
                error: function (err) {
                    if (err.status === 401) {
                        var promise = performLogin(username, password);
                        promise.done(function (data) {
                            token = Cookies.get("token");
                            postGraphRequest(token, graph, id_log);
                        });
                        promise.fail(function (err) {
                            logOnConsole("[postGraph] posting graph using token: " + token + "...failed!");
                            logOnConsole("Exception: " + err.status + " " + err.statusText + " " + err.responseText);
                            $(id_log).removeClass("btn-primary").removeClass("btn-success").addClass("btn-danger");
                        });
                    } else {
                        logOnConsole("[postGraph] posting graph using token: " + token + "...failed!");
                        logOnConsole("Exception: " + err.status + " " + err.statusText + " " + err.responseText);
                        $(id_log).removeClass("btn-primary").removeClass("btn-success").addClass("btn-danger");
                    }
                }
            });
        });
    }

    function updateGraphRequest(token, graph_id, graph_path, id_log) {
        logOnConsole("[updateGraph] updating graph with graph_id: " + graph_id + " using token: " + token + "...");
        $.getJSON(graph_path, function(graph) {
            $.ajax({
                url: graph_url + "/" + graph_id,
                type: "PUT",
                data: JSON.stringify(graph),
                contentType: "application/json",
                headers: {'X-Auth-Token': token},
                success: function (resp) {
                    var new_graph_id = resp.id;
                    logOnConsole("[updateGraph] updating graph with graph_id: " + graph_id + " using token: " + token + "...done! Graph_id: " + new_graph_id);
                    Cookies.set("graph_id", new_graph_id);
                    logOnConsole("[updateGraph] Cookie set 'graph_id': " + Cookies.get('graph_id'));
                    $(id_log).removeClass("btn-primary").removeClass("btn-danger").addClass("btn-success");
                },
                error: function (err) {
                    if (err.status === 401) {
                        var promise = performLogin(username, password);
                        promise.done(function (data) {
                            token = Cookies.get("token");
                            updateGraphRequest(token, graph_id, graph);
                        });
                        promise.fail(function (err) {
                            logOnConsole("[updateGraph] updating graph with graph_id: " + graph_id + " using token: " + token + "...failed!");
                            logOnConsole("Exception:" + err.status + " " + err.statusText + " " + err.responseText);
                            $(id_log).removeClass("btn-primary").removeClass("btn-success").addClass("btn-danger");
                        });
                    } else {
                        logOnConsole("[updateGraph] updating graph with graph_id: " + graph_id + " using token: " + token + "...failed!");
                        logOnConsole("Exception:" + err.status + " " + err.statusText + " " + err.responseText);
                        $(id_log).removeClass("btn-primary").removeClass("btn-success").addClass("btn-danger");
                    }
                }
            });
        });
    }

    function deleteGraphRequest(token, graph_id, id_log) {
        logOnConsole("[deleteGraph] deleting graph with graph_id: " + graph_id + " using token: " + token + "...");
        $.ajax({
            url: graph_url+"/"+graph_id,
            type: "DELETE",
            headers: { 'X-Auth-Token': token },
            success: function(resp) {
                logOnConsole("[deleteGraph] deleting graph with graph_id: " + graph_id + " using token: " + token + "...done! Graph_id: " + graph_id);
                logOnConsole("[deleteGraph] Cookie 'graph_id': " + Cookies.get('graph_id') + " removed");
                Cookies.remove("graph_id");
                $(id_log).removeClass("btn-primary").removeClass("btn-danger").addClass("btn-success");
            },
            error: function(err) {
                if(err.status===401){
                    var promise = performLogin(username, password);
                    promise.done(function(data){
                        token = Cookies.get("token");
                        deleteGraphRequest(token, graph_id);
                    });
                    promise.fail(function (err){
                        logOnConsole("[deleteGraph] deleting graph with graph_id: " + graph_id + " using token: " + token + "...failed!");
                        logOnConsole("Error:" + err.status + " " + err.statusText + " " + err.responseText);
                        $(id_log).removeClass("btn-primary").removeClass("btn-success").addClass("btn-danger");
                    });
                }else {
                    logOnConsole("[deleteGraph] deleting graph with graph_id: " + graph_id + " using token: " + token + "...failed!");
                    logOnConsole("Error:" + err.status + " " + err.statusText + " " + err.responseText);
                    $(id_log).removeClass("btn-primary").removeClass("btn-success").addClass("btn-danger");
                }
            }
        });
    }

    function getStateFromVnf(tenant_id, graph_id, vnf_id){
        var deferred = $.Deferred();
        logOnConsole("[getStateFromVnf] "+ tenant_id +"/" + graph_id + "/" + vnf_id);
        $.ajax({
            url: state_url,
            type: "GET",
            headers: { 'tenant_id': tenant_id, 'graph_id': graph_id, 'vnf_id': vnf_id},
            contentType: "application/json",
            cache: false,
            success: function(resp) {
                deferred.resolve(resp);
            },
            error: function(err) {
                deferred.reject("[getStateFromVnf] Error:" + err.status + " " + err.statusText + " " + err.responseText);
            }
        });
        return deferred.promise();
    }

    function pushStateIntoVnf(tenant_id, graph_id, vnf_id, status){
        var deferred = $.Deferred();
        logOnConsole("[pushStateIntoVnf] "+ tenant_id +"/" + graph_id + "/" + vnf_id);
        $.ajax({
            url: state_url,
            type: "PUT",
            data: status,
            contentType: "application/json",
            headers: { 'tenant_id': tenant_id, 'graph_id': graph_id, 'vnf_id': vnf_id},
            cache: false,
            success: function(resp) {
                deferred.resolve();
            },
            error: function(err) {
                deferred.reject("[pushStateIntoVnf] Error:" + err.status + " " + err.statusText + " " + err.responseText);
            }
        });
        return deferred.promise();
    }


    function postGraph(params) {
        var token = Cookies.get("token");
        if (token === undefined){
            logOnConsole("[postGraph] token is null, so perform the login...");
            var promise = performLogin(username, password);
            promise.done(function(data){
                    token = Cookies.get("token");
                    logOnConsole("[postGraph] token is null, so perform the login...done! Token: " + token);
                    postGraphRequest(token, params.data.graph_path, params.data.id_log);
            });
            promise.fail(function (err){
                logOnConsole("[postGraph] token is null, so perform the login...failed!");
                logOnConsole("Exception: " + err);
                $(params.data.id_log).removeClass("btn-primary").removeClass("btn-success").addClass("btn-danger");
            });
        }else{
            postGraphRequest(token, params.data.graph_path, params.data.id_log);
        }
    }

    function updateGraph(params) {
        var graph_id = Cookies.get("graph_id");
        var token = Cookies.get("token");
        if (token === undefined){
            logOnConsole("[updateGraph] token is null, so perform the login...");
            var promise = performLogin(username, password);
            promise.done(function(data){
                    token = Cookies.get("token");
                    logOnConsole("[updateGraph] token is null, so perform the login...done! Token: " + token);
                    updateGraphRequest(token, graph_id, params.data.graph_path, params.data.id_log);
            });
            promise.fail(function (err){
                logOnConsole("[updateGraph] token is null, so perform the login...failed!");
                logOnConsole("Exception: " + err);
                $(params.data.id_log).removeClass("btn-primary").removeClass("btn-success").addClass("btn-danger");
            });
        }else{
            updateGraphRequest(token, graph_id, params.data.graph_path, params.data.id_log);
        }
    }

    function deleteGraph(params) {
        var graph_id = Cookies.get("graph_id");
        var token = Cookies.get("token");
        if (token === undefined){
            logOnConsole("[deleteGraph] token is null, so perform the login...");
            var promise = performLogin(username, password);
            promise.done(function(data){
                    token = Cookies.get("token");
                    logOnConsole("[deleteGraph] token is null, so perform the login...done! Token: " + token);
                    deleteGraphRequest(token, graph_id, params.data.id_log);
            });
            promise.fail(function (err){
                logOnConsole("[deleteGraph] token is null, so perform the login...failed!");
                logOnConsole("Exception: " + err);
                $(params.data.id_log).removeClass("btn-primary").removeClass("btn-success").addClass("btn-danger");
            });
        }else{
            deleteGraphRequest(token, graph_id, params.data.id_log);
        }
    }

    function migrateState(params) {
        var graph_id = Cookies.get("graph_id");
        logOnConsole("[migrateState] "+ tenant_id +"/" + graph_id + "/" + from_vnf_id + "/" + to_vnf_id);
        logOnConsole("[migrateState] Migration started...");
        var promise = getStateFromVnf(tenant_id, graph_id, from_vnf_id);
            promise.done(function(data){
                logOnConsole("[migrateState] getStateFromVnf success!");
                status = JSON.stringify(data);
                promise = pushStateIntoVnf(tenant_id, graph_id, to_vnf_id, status);
                promise.done(function(data){
                    logOnConsole("[migrateState] pushStateIntoVnf success!");
                    logOnConsole("[migrateState] Migration completed!");
                    $(params.data.id_log).removeClass("btn-primary").removeClass("btn-danger").addClass("btn-success");
                });
                promise.fail(function(err){
                    logOnConsole("[migrateState] pushStateIntoVnf failure!");
                    logOnConsole("Exception: " + err);
                    logOnConsole("[migrateState] Migration failed!");
                    $(params.data.id_log).removeClass("btn-primary").removeClass("btn-success").addClass("btn-danger");
                });
            });
            promise.fail(function(err){
                logOnConsole("[migrateState] getStateFromVnf failure!");
                logOnConsole("Exception: " + err);
                logOnConsole("[migrateState] Migration failed!");
                $(params.data.id_log).removeClass("btn-primary").removeClass("btn-success").addClass("btn-danger");
            });
    }


    $("#btn-deploy_initial_graph").click({ graph_path: graph1, id_log: "#btn-deploy_initial_graph" }, postGraph);
    $("#btn-deploy_second_nat").click({ graph_path: graph2, id_log: "#btn-deploy_second_nat" }, updateGraph);
    $("#btn-migrate_state").click({id_log: "#btn-migrate_state"}, migrateState);
    $("#btn-delete_old_nat").click({ graph_path: graph3, id_log: "#btn-delete_old_nat" }, updateGraph);
    $("#btn-undeploy_everything").click({id_log: "#btn-undeploy_everything"}, deleteGraph);

});
