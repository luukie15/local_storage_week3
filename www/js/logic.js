        app.initialize();

        var webSql = {};
        webSql.webdb = {};
        webSql.webdb.db = null;

        webSql.webdb.open = function () {
            var dbSize = 5 * 1024 * 1024; // 5MB
            webSql.webdb.db = openDatabase("Todo", "1", "Todo manager", dbSize);
        }

        webSql.webdb.onError = function (tx, e) {
            alert("There has been an error: " + e.message);
        }

        webSql.webdb.onSuccess = function (tx, r) {
            // re-render the data.
            webSql.webdb.getAllTodoItems(loadTodoItems);
        }

        webSql.webdb.createTable = function () {
            var db = webSql.webdb.db;
            db.transaction(function (tx) {
                tx.executeSql("CREATE TABLE IF NOT EXISTS " +
                        "todo(ID INTEGER PRIMARY KEY ASC, todo TEXT, description TEXT, added_on DATETIME)", []);
            });
        }

        webSql.webdb.addTodo = function (todoText, todoDescription) {
            var db = webSql.webdb.db;
            db.transaction(function (tx) {
                var addedOn = new Date();
                tx.executeSql("INSERT INTO todo(todo, description, added_on) VALUES (?,?,?)",
                        [todoText, todoDescription, addedOn],
                        webSql.webdb.onSuccess,
                        webSql.webdb.onError);
            });
        }

        webSql.webdb.getAllTodoItems = function (renderFunc) {
            var db = webSql.webdb.db;
            db.transaction(function (tx) {
                tx.executeSql("SELECT * FROM todo", [], renderFunc,
                        webSql.webdb.onError);
            });
        }

        function loadTodoItems(tx, rs) {
            var rowOutput = "";
            var todoItems = document.getElementById("todoItems");
            
            for (var i = 0; i < rs.rows.length; i++) {
                rowOutput += renderTodo(rs.rows.item(i));
            }

            todoItems.innerHTML = rowOutput;
            
        }
        function renderTodo(row) {
            var showTime = "";
            var showUser = "";
            if(localStorage.getItem('show_time') == "true"){
                showTime = row.added_on;
            }else{
                showTime = "";
            }
            if(localStorage.getItem('show_user') == "true"){
                showUser = row.todo;
            }else{
                showUser = "";
            }
            return "<li>" + showUser + " " + row.description + showTime +
                    " [<a href='javascript:void(0);' onclick=\'webSql.webdb.deleteTodo(" +
                    row.ID + ");\'>Delete</a>]</li>";
        }

        webSql.webdb.deleteTodo = function (id) {
            var db = webSql.webdb.db;
            db.transaction(function (tx) {
                tx.executeSql("DELETE FROM todo WHERE ID=?", [id],
                        webSql.webdb.onSuccess,
                        webSql.webdb.onError);
            });
        }

        function init() {
            webSql.webdb.open();
            webSql.webdb.createTable();
            webSql.webdb.getAllTodoItems(loadTodoItems);
        }

        function addTodo() {
            var todo = document.getElementById("name_new_todo");
            var description = document.getElementById("description_new_todo");
            webSql.webdb.addTodo(todo.value, description.value);
            todo.value = "";
            description.value = "";
      }


        $(document).bind('pageinit', function () {
            //init();
            $("#save_settings").unbind('click');
            $("#save_settings").click(function () {
                if ($("#display_time_switch").val() == "on") {
                    localStorage.setItem("show_time", "true");
                } else {
                    localStorage.setItem("show_time", "false");
                }

                if ($("#display_user_switch").val() == "on") {
                    localStorage.setItem("show_user", "true");
                } else {
                    localStorage.setItem("show_user", "false");
                }

//                console.log(localStorage.getItem('show_user') + " " + localStorage.getItem('show_time'));
                webSql.webdb.getAllTodoItems(loadTodoItems);
                init();
            });  
        });