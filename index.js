// Filter methods

$('#none_exist').hide();
$('#search').click(search);
$('#clear').click(clear);

function clear() {
    $('select[name="university"]').val('All Universities');
    $('select[name="sport"]').val('All Sports');
    all_days = $('input[type="checkbox"]');
    for (var i = 0; i < all_days.length; i++) {
        $(all_days[i]).prop('checked', false);
    }

    search();
}

function search() {
    any_exist = false;
    
    university = $('select[name="university"]').val();
    sport = $('select[name="sport"]').val();
    all_days = $('input[type="checkbox"]');
    days = [];
    for (var i = 0; i < all_days.length; i++) {
        if ($(all_days[i]).is(':checked')) {
            days.push($(all_days[i]).val());
        }
    }

    all_groups =$('.group');
    for (var i = 0; i < all_groups.length; i++) {
        uni_2 = $(all_groups[i]).data('university');
        sport_2 = $(all_groups[i]).data('sport');
        group_days = $(all_groups[i]).data('days');
        
        if (check_all(university, uni_2, sport, sport_2, days, group_days)) {
            $(all_groups[i]).show();
            any_exist = true;
        }
        else {
            $(all_groups[i]).hide();
        }
    }

    if (!any_exist) {
        $('#none_exist').show();
    }
    else {
        $('#none_exist').hide();
    }

    document.getElementById('search').scrollIntoView();
}

function check_university(uni_1, uni_2) {
    return (uni_1 == uni_2) || (uni_1 == 'All Universities');
}

function check_sport(sport_1, sport_2) {
    return (sport_1 == sport_2) || (sport_1 == 'All Sports');
}

function check_days(desired_days, group_days) {
    if (desired_days.length == 0) {
        return true;
    }

    for (var i = 0; i < desired_days.length; i++) {
        for (var j = 0; j < group_days.length; j++) {
            if (desired_days[i] == group_days[j]) {
                return true;
            }
        }
    }
    return false;
}

function check_all(uni_1, uni_2, sport_1, sport_2, desired_days, group_days) {
    return check_university(uni_1, uni_2) && check_sport(sport_1, sport_2) && check_days(desired_days, group_days);
}

var all_popups = $('.popup');
var open_btns = $('.more_info');
var close_btns = $('.close');
var open_btns_array = $(open_btns).toArray();
var close_btns_array = $(close_btns).toArray();

open_btns_array.forEach(element => {
    $(element).click(function() {
        index = open_btns_array.indexOf(element);
        $(all_popups[index]).show();
    });
});

close_btns_array.forEach(element => {
    $(element).click(function() {
        index = close_btns_array.indexOf(element);
        $(all_popups[index]).hide();
    });
});



// Sports database

sports_list = ['All Sports', 'Boxing', 'Spikeball', 'Soccer', 'Basketball', 'Football', 'Ultimate Frisbee', 'Field Hockey', 'Baseball', 'Tennis', 'Volleyball', 'Lacrosse', 'Sky Diving', 'Ice Hockey'];
sports_list.sort();
sports_select_tag = document.getElementsByName('sport')[0];
for (var i = 0; i < sports_list.length; i++) {
    sports_select_tag.innerHTML += '<option value="' + sports_list[i] + '">' + sports_list[i] + '</option>';
}


// API for college list

class University {
    constructor(name, state) {
        this.name = name;
        this.state = state;
    }
}

(async () => {
    const response = await fetch(
      'https://parseapi.back4app.com/classes/Usuniversitieslist_University?limit=5000&order=name&include=state&keys=name,state,state.name',
      {
        headers: {
          'X-Parse-Application-Id': 'PQQ672Bk0DKOxG7xTNoLTZAtauhjqhIHX2Dvjx9H', // This is your app's application id
          'X-Parse-REST-API-Key': 'm2swkLXtU7vUOybDwJUEnl3HsgY6mX0783t4EWCG', // This is your app's REST API key
        }
      }
    );
    data = await response.json();
    data = data['results'];
    universities = []
    new_uni = new University('All Universities', 'Everywhere');
    universities.push(new_uni);
    for (var i = 0; i < data.length; i++) {
        if (check_state(data[i].state.name)) {
            new_uni = new University(data[i].name, data[i].state.name);
            universities.push(new_uni);
        }
    }

    uni_select_tag = document.getElementsByName('university')[0];
    for (var i = 0; i < universities.length; i++) {
        uni_select_tag.innerHTML += '<option value="' + universities[i].name + '">' + universities[i].name + '</option>';
    }
})();

var state_list = ['New York', 'New Jersey', 'Connecticut', 'Massachusetts']
function check_state(state_name) {
    for (var i = 0; i < state_list.length; i++) {
        if (state_name == state_list[i]) {
            return true;
        }
    }
    return false;
}