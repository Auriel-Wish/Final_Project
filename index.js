var http = require('http');
var url = require('url');
var fs = require('fs');
var mongo = require('mongodb');
var MongoClient = require('mongodb').MongoClient;
var uri = 'mongodb+srv://aurielwish:awish01@cluster0.f00pkos.mongodb.net/?retryWrites=true&w=majority';
var day_map = {
    0:'Sun',
    1:'Mon',
    2:'Tue',
    3:'Wed',
    4:'Thu',
    5:'Fri',
    6:'Sat'
}

var port = process.env.PORT || 3000;
client = new MongoClient(uri, {useUnifiedTopology: true});
http.createServer(async function (req, res) {
    res.writeHead(200, {'Content-Type': 'text/html'});
    var random_num = Math.floor(Math.random() * 1000000);
    path_name = url.parse(req.url, true).pathname;
    if (path_name == '/') {
        var file = fs.readFileSync('./header.html');
        res.write(file);
    }
    else if (path_name.includes('user')) {
        if (path_name.includes('#filter')) {
            path_name = path_name.split('#filter')[0];
        }
        
        var user_id = path_name.split('_')[1];
        await client.connect();
        var dbo = client.db('pickup_sports');
        var users_coll = dbo.collection('users');

        try {
            var mongo_id = new mongo.ObjectID(user_id);
        }
        catch (error) {
            var mongo_id = '-1';
        }
        var result = await users_coll.findOne({_id:mongo_id});
        if (result == null) {
            var x = await users_coll.findOne({});
            var file = fs.readFileSync('./invalid_user.html');
            res.write(file);
        }
        else {
            await client.connect();
            var dbo = client.db('pickup_sports');

            var file = fs.readFileSync('./body1.html');
            res.write(file);

            res.write('<a href="./my_groups_' + user_id + '"><div class="hover_orange user_links" id="groups"><p>View My Groups</p></div></a><a href="./create_group_' + user_id + '"><div class="hover_orange user_links" id="create"><p>Create Group</p></div></a><a href="./change_plan-' + user_id + '"><div class="hover_orange user_links" id="plan"><p>Change Plan</p></div></a>');

            file = fs.readFileSync('./body2.html');
            res.write(file);

            var sports_coll = dbo.collection('sports_list');
            var sports_list = await sports_coll.find({}).toArray();
            res.write('<option value="All Sports">All Sports</option>');
            for (var i = 0; i < sports_list.length; i++) {
                res.write('<option value="' + sports_list[i].name + '">' + sports_list[i].name + '</option>');
            }
            res.write('</select>')

            file = fs.readFileSync('./body3.html');
            res.write(file);

            var groups_coll = dbo.collection('groups');
            var all_groups = await groups_coll.find({}).toArray();
            var total_str = '';
            for (var i = 0; i < all_groups.length; i++) {
                total_str = '<table class="group" cellspacing="0" cellpadding="0" data-university="' + all_groups[i].university + '" data-sport="' + all_groups[i].sport + '" data-days=\'[';
                for (var j = 0; j < all_groups[i].days.length; j++) {
                    if (all_groups[i].days[j] != '-1') {
                        total_str += '"' + day_map[j] + '",';
                    }
                }
                total_str = total_str.slice(0, -1);
                total_str += ']\'';

                total_str += '><tr><td class="sport_description"><h2 class="group_name">' + all_groups[i].name + '</h2><p class="about_group">' + all_groups[i].about + '</p><div class="more_info">More Information</div></td><td class="sport_pic"><img src="images/intro.jpg"></td></tr></table><div class="popup"><div class="popup-content"><div class="close"><i class="fa-solid fa-x"></i></div><h2 class="group_name">' + all_groups[i].name + '</h2><p class="about_group">' + all_groups[i].about + '</p><p class="group_university"><strong>University:</strong> ' + all_groups[i].university + '</p><p class="meeting_location"><strong>Location:</strong> ' + all_groups[i].location + '</p><p class="meeting_times"><strong>Time:</strong> '
                for (var j = 0; j < all_groups[i].days.length; j++) {
                    if (all_groups[i].days[j] != '-1') {
                        total_str += all_groups[i].days[j] + ' ' + day_map[j] + ', ';
                    }
                }
                total_str = total_str.slice(0, -2);
                total_str += '</p><p class="num_members"><strong>Members:</strong> ' + all_groups[i].members.length + '</p><p class="skill_level"><strong>Skill level:</strong> ' + all_groups[i].skill + '</p>';
                
                var in_group = false;
                user_id = String(user_id);
                for (var j = 0; j < all_groups[i].members.length; j++) {
                    var member_id = String(all_groups[i].members[j]);
                    if (member_id == user_id) {
                        in_group = true;
                        break;
                    }
                }
                
                if (in_group) {
                    total_str += '<a href="./leave_group-' + i + '-' + user_id + '?rand=' + random_num + '" class="leave_group">Leave Group</a>';
                }
                else {
                    total_str += '<a href="./join_group-' + i + '-' + user_id + '?rand=' + random_num + '" class="join_group hover_orange">Join Group</a>';
                }
                
                total_str += '</div></div>';
                
                res.write(total_str);
            }

            file = fs.readFileSync('./body4.html');
            res.write(file);
            res.write('</body></html>');
        }

        client.close();
    }
    else if (path_name.includes('create_group')) {
        await client.connect();
        var dbo = client.db('pickup_sports');
        var users_coll = dbo.collection('users');
        var user_id = path_name.split('_')[2];
        var mongo_id = new mongo.ObjectID(user_id);
        
        var curr_user = await users_coll.findOne({_id:mongo_id});
        var num_plans = (curr_user.groups).length
        var plan = curr_user.plan
        var max_plans = 0

        if (plan == 'standard') {
            max_plans = 3;
        }
        else if (plan == 'silver') {
            max_plans = 5;
        }
        else if (plan == 'platinum') {
            max_plans = -1;
        }
        
        if (max_plans == -1 || (num_plans < max_plans && max_plans >= 0)) {
            var file = fs.readFileSync('./new_group_top.html');
            res.write(file);

            res.write('<div style="text-align: center"><a id="return" href="./user_' + user_id + '">Return Home</a></div><div id="form_holder"><div id="error_div">Please fill out all fields</div><form method="get" action="./group_created_' + user_id + '_" onsubmit="return validate()">');
            
            file = fs.readFileSync('./new_group_middle.html');
            res.write(file);
            var sports_coll = dbo.collection('sports_list');
            var sports_list = await sports_coll.find({}).toArray();
            res.write('<label for="sport">Sport: </label><select name="sport" id="sport"><option value="Select Sport">Select Sport</option>');
            for (var i = 0; i < sports_list.length; i++) {
                res.write('<option value="' + sports_list[i].name + '">' + sports_list[i].name + '</option>');
            }
            res.write('</select>')

            file = fs.readFileSync('./new_group_bottom.html');
            res.write(file);
            res.write('</body></html>')
        }
        else {
            var redirect = ('./exceeded_group_limit-' + user_id);
            res.writeHead(301, {
                Location: redirect
            }).end();
        }

        client.close();
    }
    else if (path_name.includes('group_created')) {
        var user_id = path_name.split('_')[2];
        var mongo_id = new mongo.ObjectID(user_id);
        var qobj = url.parse(req.url, true).query;
        var name = qobj.name;
        var location = qobj.location;
        var about = qobj.description;
        var skill = qobj.skill;
        var sun = qobj.sun;
        if (sun == '') {
            sun = '-1';
        }
        var mon = qobj.mon;
        if (mon == '') {
            mon = '-1';
        }
        var tue = qobj.tue;
        if (tue == '') {
            tue = '-1';
        }
        var wed = qobj.wed;
        if (wed == '') {
            wed = '-1';
        }
        var thu = qobj.thu;
        if (thu == '') {
            thu = '-1';
        }
        var fri = qobj.fri;
        if (fri == '') {
            fri = '-1';
        }
        var sat = qobj.sat;
        if (sat == '') {
            sat = '-1';
        }
        var university = qobj.university;
        var sport = qobj.sport;

        var new_group = {name:name, about:about, location:location, skill:skill, university:university, sport:sport, members:[mongo_id], days:[sun, mon, tue, wed, thu, fri, sat]};
        await client.connect();
        var dbo = client.db('pickup_sports');
        var groups_coll = dbo.collection('groups');
        var users_coll = dbo.collection('users');

        await groups_coll.insertOne(new_group);
        var result = await groups_coll.findOne({name:name, about:about, location:location, skill:skill, university:university, sport:sport, members:[mongo_id], days:[sun, mon, tue, wed, thu, fri, sat]});
        var group_id = result._id;
        group_id = new mongo.ObjectID(group_id);
        await users_coll.updateOne({_id:mongo_id}, {$push: {groups:group_id}});

        var redirect = ('./user_' + user_id);
        res.writeHead(301, {
            Location: redirect
        }).end();
        client.close();
    }
    else if (path_name == '/add_sport') {
        var file = fs.readFileSync('./add_sport.html');
        res.write(file);
    }
    else if (path_name == '/new_sport') {
        var qobj = url.parse(req.url, true).query;
        var new_sport = qobj.new_sport;

        await client.connect();
        var dbo = client.db('pickup_sports');
        var sports_coll = dbo.collection('sports_list');

        var result = await sports_coll.findOne({name:new_sport});
        if (result == null) {
            await sports_coll.insertOne({name:new_sport});
        }

        res.write('<script>window.close();</script>')
        client.close();
    }
    else if (path_name.includes('my_groups')) {
        var file = fs.readFileSync('./my_groups_header.html');
        res.write(file);

        var user_id = path_name.split('_')[2];
        var mongo_id = new mongo.ObjectID(user_id);

        res.write('<div class="group_links" style="text-align: center;"><div class="group_links" style="display: inline-block;"><a href="./user_' + user_id + '">Find More Groups</a></div><div class="group_links" style="margin-left: 50px; display: inline-block"><a href="./create_group_' + user_id + '">Create Group</a></div></div>');

        await client.connect();
        var dbo = client.db('pickup_sports');
        var groups_coll = dbo.collection('groups');
        var users_coll = dbo.collection('users');

        var user = await users_coll.findOne({_id:mongo_id});
        var user_group_ids = user.groups;
        var all_groups = [];
        
        // MAKE BETTER
        for (var i = 0; i < user_group_ids.length; i++) {
            var curr_group = await groups_coll.findOne({_id:user_group_ids[i]});
            all_groups.push(curr_group);
        }

        var total_str = '';
        for (var i = 0; i < all_groups.length; i++) {
            total_str = '<table class="group" cellspacing="0" cellpadding="0" data-university="' + all_groups[i].university + '" data-sport="' + all_groups[i].sport + '" data-days=\'[';
            for (var j = 0; j < all_groups[i].days.length; j++) {
                if (all_groups[i].days[j] != '-1') {
                    total_str += '"' + day_map[j] + '",';
                }
            }
            total_str = total_str.slice(0, -1);
            total_str += ']\'';

            total_str += '><tr><td class="sport_description"><h2 class="group_name">' + all_groups[i].name + '</h2><p class="about_group">' + all_groups[i].about + '</p><div class="more_info">More Information</div></td><td class="sport_pic"><img src="images/intro.jpg"></td></tr></table><div class="popup"><div class="popup-content"><div class="close"><i class="fa-solid fa-x"></i></div><h2 class="group_name">' + all_groups[i].name + '</h2><p class="about_group">' + all_groups[i].about + '</p><p class="group_university"><strong>University:</strong> ' + all_groups[i].university + '</p><p class="meeting_location"><strong>Location:</strong> ' + all_groups[i].location + '</p><p class="meeting_times"><strong>Time:</strong> '
            for (var j = 0; j < all_groups[i].days.length; j++) {
                if (all_groups[i].days[j] != '-1') {
                    total_str += all_groups[i].days[j] + ' ' + day_map[j] + ', ';
                }
            }
            total_str = total_str.slice(0, -2);
            total_str += '</p><p class="num_members"><strong>Members:</strong> ' + all_groups[i].members.length + '</p><p class="skill_level"><strong>Skill level:</strong> ' + all_groups[i].skill + '</p>';
            
            var in_group = false;
            user_id = String(user_id);
            for (var j = 0; j < all_groups[i].members.length; j++) {
                var member_id = String(all_groups[i].members[j]);
                if (member_id == user_id) {
                    in_group = true;
                    break;
                }
            }
            
            total_str += '<a href="./leave_group-' + i + '-' + user_id + '?rand=' + random_num + '" class="leave_group">Leave Group</a>';
            
            total_str += '</div></div>';
            
            res.write(total_str);
        }
        file = fs.readFileSync('./my_groups_footer.html');
        res.write(file);
        res.write('</body></html>');
        client.close();
    }
    else if (path_name.includes('join_group')) {
        await client.connect();
        var dbo = client.db('pickup_sports');
        var groups_coll = dbo.collection('groups');
        var users_coll = dbo.collection('users');

        var group_num = parseInt(path_name.split('-')[1]);
        var user_id = path_name.split('-')[2];
        var mongo_id = new mongo.ObjectID(user_id);
        var curr_user = await users_coll.findOne({_id:mongo_id});
        var num_plans = (curr_user.groups).length
        var plan = curr_user.plan
        var max_plans = 0

        if (plan == 'standard') {
            max_plans = 3;
        }
        else if (plan == 'silver') {
            max_plans = 5;
        }
        else if (plan == 'platinum') {
            max_plans = -1;
        }

        if (max_plans == -1 || (num_plans < max_plans && max_plans >= 0)) {
            var all_groups = await groups_coll.find({}).toArray();
            var group_id = all_groups[group_num]._id;
            group_id = new mongo.ObjectID(group_id);
            await groups_coll.updateOne({_id:group_id}, {$push: {members:mongo_id}});
            await users_coll.updateOne({_id:mongo_id}, {$push: {groups:group_id}});

            var redirect = ('./user_' + user_id);
            res.writeHead(301, {
                Location: redirect
            }).end();
        }
        else {
            var redirect = ('./exceeded_group_limit-' + user_id);
            res.writeHead(301, {
                Location: redirect
            }).end();
        }
        client.close();
    }
    else if (path_name.includes('exceeded_group_limit')) {
        var user_id = path_name.split('-')[1];

        var file = fs.readFileSync('./exceeded_group_limit.html');
        res.write(file);

        res.write('<h2>Your plan does not allow you to sign up for another group: <a href="./change_plan-' + user_id + '">Upgrade Plan</a> OR <a href="./user_' + user_id + '">Return Home</a></h2></body></html>')
    }
    else if (path_name.includes('leave_group')) {
        await client.connect();
        var dbo = client.db('pickup_sports');
        var groups_coll = dbo.collection('groups');
        var users_coll = dbo.collection('users');

        var group_num = parseInt(path_name.split('-')[1]);
        var user_id = path_name.split('-')[2];
        var mongo_id = new mongo.ObjectID(user_id);

        var all_groups = await groups_coll.find({}).toArray();
        var group_id = all_groups[group_num]._id;
        group_id = new mongo.ObjectID(group_id);
        await groups_coll.updateOne({_id:group_id}, {$pull: {members:mongo_id}});
        await users_coll.updateOne({_id:mongo_id}, {$pull: {groups:group_id}});

        var redirect = ('./user_' + user_id);
        res.writeHead(301, {
            Location: redirect
        }).end();
        client.close();
    }
    else if (path_name == '/sign-up') {
        var file = fs.readFileSync('./sign-up.html');
        res.write(file);
    }
    else if (path_name.includes('change_plan')) {
        var file = fs.readFileSync('./change_plan_top.html');
        res.write(file);
        
        var user_id = path_name.split('-')[1];

        await client.connect();
        var dbo = client.db('pickup_sports');
        var users_coll = dbo.collection('users');

        var user_str = '<input type="hidden" name="user_id" id="user_id" value="' + user_id + '">';

        file = fs.readFileSync('./plan1.html');
        res.write(file);
        res.write(user_str);

        file = fs.readFileSync('./plan2.html');
        res.write(file);
        res.write(user_str);

        file = fs.readFileSync('./plan3.html');
        res.write(file);
        res.write(user_str);

        file = fs.readFileSync('./new_account_success_bottom.html');
        res.write(file);
    }
    else if (path_name == '/new_account') {
        var qobj = url.parse(req.url, true).query;
        var user = qobj.username;
        var password = qobj.password1;

        await client.connect();
        var dbo = client.db('pickup_sports');
        var users_coll = dbo.collection('users');

        var result = await users_coll.findOne({username:user});
        if (result == null) {
            await users_coll.insertOne({username:user, password:password, plan:'none', groups:[]});
            var user_id = await users_coll.findOne({username:user});
            user_id = user_id._id;
            var file = fs.readFileSync('./new_account_success_top.html');
            res.write(file);
            user_str = '<input type="hidden" name="user_id" id="user_id" value="' + user_id + '">';

            file = fs.readFileSync('./plan1.html');
            res.write(file);
            res.write(user_str);

            file = fs.readFileSync('./plan2.html');
            res.write(file);
            res.write(user_str);

            file = fs.readFileSync('./plan3.html');
            res.write(file);
            res.write(user_str);

            file = fs.readFileSync('./new_account_success_bottom.html');
            res.write(file);
        }
        else {
            var file = fs.readFileSync('./new_account_fail.html');
            res.write(file);
        }
        client.close();
    }
    else if (path_name == '/new_plan') {
        var qobj = url.parse(req.url, true).query;
        var user_id = qobj.user_id;
        var mongo_id = new mongo.ObjectID(user_id);
        var plan = qobj.plan;
        
        await client.connect();
        var dbo = client.db('pickup_sports');
        var users_coll = dbo.collection('users');

        await users_coll.updateOne({_id:mongo_id}, {$set: {plan: plan}});

        var redirect = ('./user_' + user_id);
        res.writeHead(301, {
            Location: redirect
        }).end();
        client.close();
    }
    else if (path_name == '/login') {
        var file = fs.readFileSync('./login.html');
        res.write(file);
    }
    else if (path_name.includes('check_login')) {
        var qobj = url.parse(req.url, true).query;
        var user = qobj.username;
        var password = qobj.password;

        await client.connect();
        var dbo = client.db('pickup_sports');
        var users_coll = dbo.collection('users');

        const result = await users_coll.findOne({username:user, password:password});
        if (result == null) {
            console.log('In')
            var file = fs.readFileSync('./login_fail.html');
            res.write(file);
        }
        else {
            var user_id = result._id;
            var redirect = ('./user_' + user_id);

            res.writeHead(301, {
                Location: redirect
            }).end();
        }
        client.close();
    }
    else {
        var file = fs.readFileSync('./error.html');
        res.write(file);
    }
    res.end();
}).listen(port);