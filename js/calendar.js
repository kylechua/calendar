(function($){

var data;
var defaultData;
var selectedDates = [];
var shownDates = [];
var currentSelection = false;
var monthSelect = false;

// Create the calendar
$.fn.Calendar = function(myData, defaults){

    // set data
    data = myData;
    defaultData = defaults

    options = {
        // months
        MONTHS: ["January","February","March","April","May","June","July","August","September","October","November","December"],
        WEEKDAYSLONG: ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"],
        WEEKDAY2: ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"],
        WEEKDAYS: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]
    };

    $.fn.generateCalendar = function(month, year){
        $(this).empty();

        // Month header with prev/next buttons
        var myMonth = options.MONTHS[month];
        $(this).append('<tr class="monthHeader" data-month='+month+' data-year='+year+'>'+
                             '<th><button class="prevMonth"><span class="btnTxt">'+'<'+'</span></button></th>'+
                             '<th class="month" colspan="5"><span class="month">'+myMonth+'</span> <span class="yearHeader">' + year + '</span></th>'+
                             '<th><button class="nextMonth"><span class="btnTxt">'+'>'+'</span></button></th>'+
                        '</tr>'
                        );
        // Divider for styling
        $(this).append('<tr class="divider"></tr>')
        // Days of the Week Header
        $(this).append('<tr class="weekHeader">');
        var w = $(this).find('.weekHeader');
        for (var i=0; i<options.WEEKDAYS.length; i++){
            $(w).append('<th class="weekday" data-day='+i+'><span class="weekday">'+options.WEEKDAYS[i]+'</span></th>');
        }
        $(this).append('</tr>');
        $(this).addDays(month, year);
    };

    // Populate calendar days
    $.fn.addDays = function(month, year){

        shownDates = [];

        // Get num of days in the current month and the last day of the month
        var myDay = new Date(year, month+1, 0);
        var numDays = myDay.getDate();
        var leftoverDays = 6 - myDay.getDay();

        // Get starting day
        myDay = new Date(year, month);
        var startingDay = myDay.getDay();
        myDay.setDate(myDay.getDate() - startingDay);

        // How many days and weeks are in this calendar?
        var totalDays = startingDay + numDays + leftoverDays;
        var numWeeks = totalDays/7;

        noSelections = true;

        // for dynamic weeks, change to i<numWeeks
        for (var i=0; i<6; i++){
            $(this).append('<tr class="week">');
            var currWeek = $(this).children('tr').eq(i+3);
            
            for (var j=0; j<7; j++){

                // HTML
                $(currWeek).append('<td class="day"></td>');

                var currDay = $(currWeek).children('td').eq(j);

                var weekday = options.WEEKDAYS[j].toLowerCase();
                $(currDay).addClass(weekday)

                var d, m, y;
                d = myDay.getDate();
                m = myDay.getMonth() + 1; // indexing
                y = myDay.getFullYear();

                var dv, mv;
                if (d < 10)
                    dv = '0' + d;
                else dv = d;
                if (m < 10)
                    mv = '0' + m;
                else mv = m;

                var myISO = y + '-' + mv + '-' + dv;

                // if this is in the past
                if (isPast(myISO)){
                    $(currDay).addClass('datePassed');
                }

                // is this in the current month, prev, or next?
                if (myDay.getMonth() != month){
                    $(currDay).addClass('otherMonth');
                } else {
                    $(currDay).addClass('currentMonth');
                }

                $(currDay).addCalendarClasses(myISO);
                $(currDay).addCalendarAttrs(myISO);
                $(currDay).addCustomDisplay(myISO);
                
                // append HTML, advance to the next day
                shownDates.push(myISO);
                myDay.setDate(myDay.getDate() + 1);


            }// day loop
        }//week loop

    };

// custom display -- gets the HTML to be displayed in the cell
    $.fn.addCustomDisplay = function(myDate){
        var text = '<div class="dateInfo">'
        var d = parseInt(myDate.substring(8));

        text += '<div class="date"><p>' + d + '</p></div>'

        // add price
        var myData = data.get(myDate);

        text += '<div class="price"><p>' + $(this).getPrice(myDate) + '</p></div>'

        text += '</div>'

        $(this).append(text);
    }

    // retreives date data. if date does not exist in data, sets it w undefined values
    $.fn.addCalendarAttrs = function(myDate){

        var myData = data.get(myDate);
        if (myData == undefined){
            $(this).attr("data-date", myDate);
        } else {
            $(this).attr("data-date", myDate);
            $(this).attr("data-price", myData.price);
            $(this).attr("data-blocked", myData.blocked);
            $(this).attr("data-locked", myData.locked);
            $(this).attr("data-booked", myData.booked);
            $(this).attr("data-available", myData.available);
        }

    }

    $.fn.addCalendarClasses = function(myDate){

        if (selectedDates.includes(myDate)){
            $(this).addClass('selected');
        }

        var myData = data.get(myDate);
        if (myData == undefined){
            return;
        }

        if (myData.booked == true){
            $(this).addClass('booked');
        } else if (myData.available == true){
            $(this).addClass('available');
        } else {
            $(this).addClass('unavailable');
        }
        if (myData.blocked == true){
            $(this).addClass('blocked');
        }
        if (myData.locked == true){
            $(this).addClass('locked');
        }
        if ($(this).getAdminNotes(myDate).length > 0 || $(this).getMemberNotes(myDate).length > 0){
            $(this).addClass('notes');
        }

        return;
    }

// EVENT HANDLERS
    // scroll through different months
    $(this).on('click', 'button', function(e){

        var myCalendar = $(this).closest('.calendarWrapper').find('.calendar');

        var month = $(myCalendar).getCalMonth();
        var year = $(myCalendar).getCalYear();

        if ($(this).hasClass('prevMonth') || $(this).hasClass('nextMonth')){ // prev month
            if ($(this).hasClass('prevMonth')){
                if (month == 0){
                    month = 11;
                    year--;
                } else month--;
            } else if ($(this).hasClass('nextMonth')){ // next month
                if (month == 11){
                    month = 0;
                    year++;
                } else month++;
            }
            if (monthSelect){
                monthSelect = false;
            }
            $(myCalendar).generateCalendar(month, year);

/*
            if (selectedWeekday != false){
                selectedDates = [];
                $(myCalendar).selectWeekday(selectedWeekday);
            } else {
                // select from previous month
                var first = false;
                var second = false;
                for (var i=0; i<selectedDates.length; i++){
                    if (shownDates.includes(selectedDates[i]) && !first){
                        first = selectedDates[i];
                    } else if (shownDates.includes(selectedDates[i]) && first){
                        second = selectedDates[i];
                    }
                }
                $(this).removeSelected();
                if (first && second){
                    currentSelection = [selectedDates[0], selectedDates[selectedDates.length-1]];
                    $(this).liveSelect(getDateFromISO(first), getDateFromISO(second));
                } else {
                    currentSelection = false;
                    selectedDates = [];
                    $(this).removeSelected();
                }
            }
*/
            currentSelection = false;
            selectedDates = [];
            $(this).removeSelected();
            $(myCalendar).updatePanel();
        }

        return false;
    });

// SELECTION

    // select dates
    var startDate, endDate;
    var singleSelected;
    var isDown = false;
    var down, up;

    $(this).on('mousedown', 'td', function(e){
        down = e.target.closest('td');
        // start selection
        var today = $(down).attr('data-date');
        if (!isDown)
            startDate = getDateFromISO(today);
        isDown = true;
        selectedDates = [];
        $(this).removeSelected();
        selectedDates.push(today);
        $(down).addClass('selected');
        $(this).closest('.calendar').addClass('selected');
    }).on('mouseup', 'td', function(e){
        up = e.target.closest('td');
        if (down == up){ // same dates
            var today = $(up).attr('data-date');
            if (singleSelected == today){ // singly selected, remove
                selectedDates = [];
                $(this).removeSelected();
                singleSelected = false;
            } else { // not singly selected, clear selection and singly select this
                selectedDates = [];
                $(this).removeSelected();
                selectedDates.push(today)
                $(this).addClass('selected');
                $(this).closest('.calendar').addClass('selected');
                singleSelected = today;
                currentSelection = today;
            }
        } else if (isDown){
            var today = $(this).attr('data-date');
            startDate = getDateFromISO(selectedDates[0]);
            endDate = getDateFromISO(today);
            singleSelected = false;
            $(this).liveSelect(startDate, endDate);
        } else {
            singleSelect = false;
        }
        isDown = false;
        monthSelect = false;
        selectedWeekday = false;
        $(this).updatePanel();
        e.stopPropagation();
    }).on('mouseover', 'td', function(e){
        if (isDown){
            var today = $(this).attr('data-date');
            startDate = getDateFromISO(selectedDates[0]);
            endDate = getDateFromISO(today);
            $(this).liveSelect(startDate, endDate);
        }
        e.stopPropagation();
    });

    $(this).on('mouseleave', 'table', function(){
        isDown = false;
        singleSelected = false;
    }).on('mouseup', 'table', function(){
        isDown = false;
        sngleSelected = false;
    });

    // select by day of the week or month
    $(this).on('click', 'th', function(e){
        var what = e.target.closest('th');
        if ($(what).hasClass('weekday')){
            var myDay = $(what).attr('data-day');
            monthSelect = false;
            singleSelected = false;
            selectedWeekday = false;
            if ($(what).hasClass('selected')){
                selectedDates = [];
                $(this).removeSelected();
                $(what).removeClass('selected');
            } else {
                selectedDates = [];
                $(this).removeSelected();
                $(this).selectWeekday(myDay);
                selectedWeekday = myDay;
            }
            $(this).updatePanel();
        } else if ($(what).hasClass('month')){
            var myMonth = parseInt($(what).closest('tr').attr('data-month'));
            var myYear = parseInt($(what).closest('tr').attr('data-year'));
            startDate = new Date(myYear, myMonth);
            endDate = new Date(myYear, myMonth+1, 0);
            singleSelected = false;
            selectedWeekday = false;
            if (monthSelect){
                selectedDates = [];
                $(this).removeSelected();
                monthSelect = false;
            } else {
                $(this).liveSelect(startDate, endDate);
                monthSelect = true;
                currentSelection = '' + options.MONTHS[myMonth] + ' ' + myYear;
            }
            $(this).updatePanel();
        }
    }).on('mouseover', 'th', function(){
        isDown = false;
    });


// CONSTRUCTOR -- BUILD THE CALENDAR STARTING FROM CURRENT MONTH

    var today = new Date();

    var currMonth = today.getMonth();
    var currYear = today.getFullYear();

    $(this).append('<div class="calendarWrapper"></div>');
    var myWrapper = $(this).find('.calendarWrapper');

    $(myWrapper).append('<table class="calendar" style="width:100%"></table>');
    var myCalendar = $(myWrapper).find('.calendar');
    
    $(myCalendar).generateCalendar(currMonth, currYear);

    // initialize control panel

    $(myWrapper).calendarPanel();
};

$.fn.calendarPanel = function(){
    $(this).append('<div class="calendarPanel"><div class="optionsPanel"></div><div class="notesPanel"></div></div>')

    var optionsPanel = $(this).find('.optionsPanel');
    var notesPanel= $(this).find('.notesPanel');

    $(optionsPanel).createOptionsDisplay();
    $(notesPanel).createNoteDisplay();

    $(this).updatePanel();

    // Button handlers
    $(this).on('click', 'button', function(e){

        var myCal = $(this).closest('.calendarWrapper').find('.calendar');
        var myPanel = $(this).closest('.calendarWrapper').find('.calendarPanel');

        switch($(e.target).getButtonType()) {

            case "btnSetAvailable":
                $(myCal).setAvailable(selectedDates, true);
                $(myCal).removeSelected();
                $(myCal).refreshCalendar(); 
                $(myCal).updatePanel();

                break;

            case "btnSetUnavailable":
                $(myCal).setAvailable(selectedDates, false);
                $(myCal).removeSelected();
                $(myCal).refreshCalendar();
                $(myCal).updatePanel();

                break;

            case "btnSelectAll":
                var toSelect = shownDates;
                var start = getDateFromISO(toSelect[0]);
                var end = getDateFromISO(toSelect[toSelect.length-1]);
                $(myCal).liveSelect(start, end);
                $(myCal).updatePanel();

                break;

            case "btnSelectNone":
                $(myCal).removeSelected();
                $(myCal).updatePanel();

                break;

            case "btnEditNote":
                var myNote = $(e.target).closest('li');
                var index = $(myNote).attr('data-index');
                var date = $(myNote).closest('div').attr('data-date');
                $(myNote).editNote();
                
                break;

            case "btnSaveNote":
                var myNote = $(e.target).closest('li');
                var newNote = $(myNote).find('.editNoteField').val();
                var index = $(myNote).attr('data-index');
                var date = $(myNote).closest('div').attr('data-date');
                $(myCal).setMemberNote(date, index, newNote);
                $(myCal).updatePanel();

                break;

            case "btnDeleteNote":
                var myNote = $(e.target).closest('li');
                var index = $(myNote).attr('data-index');
                var date = $(myNote).closest('div').attr('data-date');
                $(myCal).deleteMemberNote(date, index);
                $(myCal).updatePanel();

                break;

            case "btnAddNote":
                var textInput = $(e.target).closest('div').find('textarea');
                var noteText = $(textInput).val();
                $(textInput).val(""); // empty add note field
                if (noteText.length > 0){
                    $(myCal).addMemberNote(selectedDates, noteText);
                    $(myCal).updatePanel();
                }
                break;

            default:
                // do nothing
        }

    });
}

$.fn.updatePanel = function(){
    var myPanel = $(this).closest('.calendarWrapper').find('.calendarPanel');
    $(myPanel).updateOptionsDisplay();
    $(myPanel).updateNoteDisplay();
}

$.fn.createOptionsDisplay = function(){
    var text = '';
    text += '<div class="btnWrapper">'
    text += '<button class="btnSetAvailable">Set Available</button>'
    text += '<button class="btnSetUnavailable">Set Unavailable</button>'
    text += '<br>'
    text += '<button class="btnSelectAll">Select All</button>'
    text += '<button class="btnSelectNone">Select None</button>'
    text += '</div>'
    text += '<h3>Selected: <span class="selectedWhat">default</span></h3>'
    $(this).append(text);
}



$.fn.updateOptionsDisplay = function(){
    var currSelect = $(this).getCurrSelection();
    $(this).find('span.selectedWhat').html(currSelect);
}

$.fn.createNoteDisplay = function(){
    var text = '';
    text += '<h3>Notes:</h3>'
    text += '<div class="notes"></div><br>'
    text += '<div class="addNote">'
    text += '<textarea class="addNoteField" maxlength="150" placeholder="Add note"></textarea><br>'
    text += '<button class="btnAddNote">Add Note</button>'
    text += '</div>'
    $(this).append(text);
}

$.fn.updateNoteDisplay = function(){

    var noteContainer = $(this).find('.notes');

    noteContainer.html('');

    var dates = selectedDates;
    if (selectedDates.length == 0){
        dates = shownDates;
    }

    var noNotes = true;

        for (var i=0; i<dates.length; i++){
            var today = dates[i];
            if (data.get(today) == undefined){ // no notes
                continue;
            }

            var adNotes = $(this).getAdminNotes(today);
            var memNotes = $(this).getMemberNotes(today);
            if (adNotes.length <= 0 && memNotes.length <= 0){
                continue;
            } else {
                noNotes = false;
            }
            
            $(noteContainer).append('<div class="noteHeader"></div>')
            var noteHeader = $(noteContainer).find('.noteHeader:last-child');
            $(noteHeader).attr('data-date', today);
            $(noteHeader).append('<h3 class="noteDate">' + getDisplayDate(getDateFromISO(today)) + '</h3>');


            // admin note display
                if (adNotes.length > 0){
                    $(noteHeader).append('<ul class="adNotes"><lh><h4>Admin Notes</h4></lh></ul>');
                    var adNoteList = $(noteHeader).find('.adNotes');
                    var noteText = '';
                    for (var a=0; a<adNotes.length; a++){
                        $(adNoteList).append(getNoteDisplay(adNotes[a], 1, a));
                    }
                }
                
            // member note display
                if (memNotes.length > 0){
                    $(noteHeader).append('<ul class="memNotes"><lh><h4>Member Notes</h4></lh></ul>');
                    var memNoteList = $(noteHeader).find('.memNotes');
                    var noteText = '';
                    for (var m=0; m<memNotes.length; m++){
                        $(memNoteList).append(getNoteDisplay(memNotes[m], 0, m));
                    }
                }
        }

    if (noNotes) { // no notes showing
        var message;
        if (currentSelection != false){
            message = '<h4>No notes for the selected dates.</h3>'
        } else {
            message = '<h4>No notes this month.</h3>'
        }
        $(noteContainer.append(message))
    }

}

$.fn.showPanel = function(){
    $(this).closest('div').find('.calendarPanel').show();
}

$.fn.hidePanel = function(){
    $(this).closest('div').find('.calendarPanel').hide();
}

// CALENDAR HELPER FUNCTIONS

    $.fn.getCalMonth = function(){
        var c = $(this).closest('.calendarWrapper').find('.monthHeader');
        return $(c).attr('data-month');
    }

    $.fn.getCalYear = function(){
        var c = $(this).closest('.calendarWrapper').find('.monthHeader');
        return $(c).attr('data-year');
    }

    $.fn.getCurrSelection = function(){
        if (!currentSelection)
            return "None";
        else if (currentSelection.constructor === Array){
            var startDate = currentSelection[0];
            var endDate = currentSelection[1];

            startDate = getDateFromISO(startDate);
            endDate = getDateFromISO(endDate);

            // make sure start date is before end date
            if (compareDates(startDate, endDate) < 0){
                var temp = startDate;
                startDate = endDate;
                endDate = temp;
            }

            startDate = getDisplayDate(startDate);
            endDate = getDisplayDate(endDate);

            return startDate + ' to ' + endDate;
        } else if (currentSelection.includes('-')){ // date
            var myDate = getDateFromISO(currentSelection);
            return getDisplayDate(myDate);
        } else return currentSelection; //weekday or month
    }

    $.fn.liveSelect = function(startDate, endDate){

        var myCalendar = $(this).closest('.calendarWrapper').find('.calendar');
        var inc = 1;

        // swap order if selected backwards
        if (endDate < startDate){
            inc = -1;
        }

        selectedDates = [];
        $(this).removeSelected();
        currentSelection = [getISOFromDate(startDate), getISOFromDate(endDate)];

        for (var d = startDate; compareDates(d,endDate) != 0; d.setDate(d.getDate() + inc)){
            var date = getISOFromDate(d);
            if (!selectedDates.includes(date))
                selectedDates.push(date);
        }
        selectedDates.push(getISOFromDate(endDate));

        $(myCalendar).find('td').each(function(){
            if (selectedDates.includes($(this).attr('data-date'))){
                $(this).addClass('selected');
            }
        })

        $(myCalendar).addClass('selected');
        $(myCalendar).updatePanel();
    }

    $.fn.selectWeekday = function(day){
        var myCalendar = $(this).closest('div').children('.calendar');

        var weekday = options.WEEKDAYS[day].toLowerCase();

        $(myCalendar).find('.weekHeader').find('th').each(function(){
            $(this).removeClass('selected');
        });

        $(myCalendar).find('.weekHeader').find('th').eq(day).addClass('selected');

        $(myCalendar).find('.'+weekday+'').each(function(){
            var myDate = $(this).attr('data-date');
            $(this).addClass('selected');
            selectedDates.push(myDate);
        });

        $(myCalendar).addClass('selected');
        currentSelection = options.WEEKDAYSLONG[day];
    }

    // called from
    $.fn.removeSelected = function(){
        var myCalendar = $(this).closest('.calendarWrapper').find('.calendar');

        $(myCalendar).removeClass('selected');

        $(myCalendar).find('th').each(function(){
            $(this).removeClass('selected');
        });

        $(myCalendar).find('td').each(function(){
            $(this).removeClass('selected');
        });

        $(myCalendar).removeClass('selected');
        currentSelection = false;
    }

    // returns a date object given the iso string
    function getDateFromISO(iso){
        var year = parseInt(iso.substring(0, 4));
        var month = parseInt(iso.substring(5, 7)) - 1;
        var day = parseInt(iso.substring(8));

        return new Date(year, month, day)
    }

    function getISOFromDate(date){
        var year = date.getFullYear();
        var month = date.getMonth() + 1;
        var day = date.getDate();

        if (month < 10) month = '0' + month;
        if (day < 10) day = '0' + day;

        return year + '-' + month + '-' + day;
    }

    function compareDates(A, B){

        var dateA = new Date(A.getFullYear(),
                            A.getMonth(),
                            A.getDate());

        var dateB = new Date(B.getFullYear(),
                           B.getMonth(),
                           B.getDate());

        if (dateA < dateB){
            return 1;
        }
        else if (dateA > dateB){
            return -1;
        }
        else
            return 0;
    }

    // Accepts an ISO date
    // Returns true if this date was yesterday or before
    function isPast(date){
        var today = new Date();
        var myDate = getDateFromISO(date);
        return (compareDates(myDate, today) > 0)
    }

    $.fn.refreshCalendar = function(){
        var myCalendar = $(this).closest('.calendarWrapper').find('.calendar');
        var month = parseInt($(myCalendar).getCalMonth());
        var year = parseInt($(myCalendar).getCalYear());
        monthSelect = false;
        $(myCalendar).generateCalendar(month, year);
        console.log("Refreshed calendar");
    }

// DISPLAY BOX HELPER FUNCTIONS

    $.fn.getButtonType = function(){
        if ($(this).hasClass('btnSetAvailable')){
            return 'btnSetAvailable';
        } else if ($(this).hasClass('btnSetUnavailable')){
            return 'btnSetUnavailable';
        } else if ($(this).hasClass('btnSelectAll')){
            return 'btnSelectAll';
        } else if ($(this).hasClass('btnSelectNone')){
            return 'btnSelectNone';
        } else if ($(this).hasClass('btnEditNote')){
            return 'btnEditNote';
        } else if ($(this).hasClass('btnDeleteNote')){
            return 'btnDeleteNote';
        } else if ($(this).hasClass('btnAddNote')){
            return 'btnAddNote';
        } else if ($(this).hasClass('btnSaveNote')){
            return 'btnSaveNote';
        }
    }

    $.fn.editNote = function(){
        var oldText = $(this).find('.noteText').html();
        $(this).empty()
        $(this).append('<textarea class="editNoteField" maxlength="150">' + oldText + '</textarea><button class="btnSaveNote">Save</button>')
    }

    // display admin and member notes
    function getNoteDisplay(myNote, type, index){

        var text = '';

        // member note
        if (myNote != '' && type == 0) {
            text += '<li ' + 'data-index=' + index + '>'
            text += '<span class="noteText">' + myNote + '</span>'
            text += '<button class="btnEditNote">Edit</button>'
            text += '<button class="btnDeleteNote">Delete</button>'
            text += '</li>'
        }

        // admin note
        if (myNote != '' && type == 1) {
            text += '<li ' + 'data-index=' + index + '>'
            text += '<span class="noteText">' + myNote + '</span>'
            text += '</li>'
        }

        return text;
    }

    function getDisplayDate(myDate){
        var d, m, y;
        var str = getISOFromDate(myDate);
        y = str.substring(0, 4);
        m = str.substring(5, 7);
        d = str.substring(8, 10);

        str = d + '/' + m + '/' + y;
        return str;
    }

// GETTER FUNCTIONS

    /* myDate = the date requested in iso format
     * $ = the calendar object
    */

    $.fn.getPrice = function(myDate){
        if (data.get(myDate) != undefined)
            return data.get(myDate).price;
        else {
            console.warn("Date specified does not exist in data")
            return defaultData.price;
        }
    }

    $.fn.getDefaultPrice = function(){
        return defaultData.price;
    }

    $.fn.getLocked = function(myDate){
        if (data.get(myDate) != undefined)
            return data.get(myDate).locked;
        else {
            console.warn("Date specified does not exist in data")
            return defaultData.locked;
        }
    }

    $.fn.getBlocked = function(myDate){
        if (data.get(myDate) != undefined)
            return data.get(myDate).blocked;
        else {
            console.warn("Date specified does not exist in data")
            return defaultData.blocked;
        }
    }

    $.fn.getBooked = function(myDate){
        if (data.get(myDate) != undefined)
            return data.get(myDate).booked;
        else {
            console.warn("Date specified does not exist in data")
            return defaultData.booked;
        }
    }

    $.fn.getAvailable = function(myDate){
        if (data.get(myDate) != undefined)
            return data.get(myDate).available;
        else {
            console.warn("Date specified does not exist in data")
            return defaultData.available;
        }
    }

    $.fn.getAdminNotes = function(myDate){
        if (data.get(myDate) != undefined)
            return data.get(myDate).adminNotes;
        else{
            console.warn("Date specified does not exist in data")
            return defaultData.adminNotes;
        }
    }

    $.fn.getMemberNotes = function(myDate){
        if (data.get(myDate) != undefined)
            return data.get(myDate).memberNotes;
        else{
            console.warn("Date specified does not exist in data")
            return defaultData.memberNotes;
        }
    }

// SETTER FUNCTIONS
    
    // returns undefined if the date is in the past
    $.fn.getDefaultData = function(myDate){

        
        var myData = {
            price: defaultData.price,
            blocked: defaultData.blocked,
            locked: defaultData.locked,
            available: defaultData.available,
            booked: defaultData.booked,
            adminNotes: defaultData.adminNotes,
            memberNotes: defaultData.memberNotes
        };
        
/*
        var myData = {
                price: "No price",
                blocked: false,
                locked: false,
                available: true,
                booked: false,
                adminNotes: [],
                memberNotes: []
            };
            */

        if (isPast(myDate)){
            return;
        }

        return myData;
    }

    $.fn.setPrice = function(myDate, newPrice){
        var newData;

        if (data.get(myDate) == undefined){
            newData = $(this).getDefaultData(myDate);
        } else {
            newData = data.get(myDate);
        }

        newData.price = newPrice;

        data.set(myDate, newData);
        $(this).refreshCalendar();
    }

    $.fn.setDefaultPrice = function(newPrice){
        defaultData.price = newPrice;
    }

    $.fn.setLocked = function(myDate, newLocked){
        var newData;

        if (data.get(myDate) == undefined){
            newData = $(this).getDefaultData(myDate);
        } else {
            newData = data.get(myDate);
        }
        
        newData.locked = newLocked;

        data.set(myDate, newData);
    }

    $.fn.setBlocked = function(myDate, newBlocked){
        var newData;

        if (data.get(myDate) == undefined){
            newData = $(this).getDefaultData(myDate);
        } else {
            newData = data.get(myDate);
        }
        
        newData.blocked = newBlocked;

        data.set(myDate, newData);
        $(this).refreshCalendar();
    }

    $.fn.setBooked = function(myDate, newBooked){
        var newData;

        if (data.get(myDate) == undefined){
            newData = $(this).getDefaultData(myDate);
        } else {
            newData = data.get(myDate);
        }
        
        newData.booked = newBooked;
        if (newBooked){ // if book = true, avail = false
            newData.available = false;
        } else if (!newBooked){
            newData.available = true;
        }

        console.log("SETTING " + myDate)
        data.set(myDate, newData);
        $(this).refreshCalendar();
    }

    $.fn.setAvailable = function(myDates, value){

        var dateArr;
        if (myDates.constructor !== Array){
            dateArr = { myDates };
        } else {
            dateArr = myDates;
        }

        for (var i=0; i<dateArr.length; i++){

            var newData;

            if (data.get(dateArr[i]) == undefined){
                newData = $(this).getDefaultData(dateArr[i]);
            } else {
                newData = data.get(dateArr[i]);
            }
            
            if ((newData != undefined) && !newData.locked){
                newData.available = value;
                if (value){ // if we are setting it to available
                    newData.booked = false;
                } else if (!value){ // if we are setting it to unavailable
                    newData.available = false;
                }
            }

            data.set(dateArr[i], newData);
        }
    }

// ADD or DELETE notes

    $.fn.addAdminNote = function(myDate, newNote){
        var newData;

        if (data.get(myDate) == undefined){
            newData = $(this).getDefaultData(myDate);
        } else {
            newData = data.get(myDate);
        }

        newData.adminNotes.push(newNote);

        data.set(myDate, newData);

        $(this).refreshCalendar();
    }

    // if index = -1, deletes all notes
    $.fn.deleteAdminNote = function(myDate, index){
        var newData;
        if (data.get(myDate) == undefined){
            newData = $(this).getDefaultData(myDate);
        } else {
            newData = data.get(myDate);
        }

        if (index == -1){
            newData.adminNotes = [];
        } else {
            newData.adminNotes.splice(index, 1);
        }

        $(this).refreshCalendar();
    }

    $.fn.addMemberNote = function(myDates, newNote){
        var dateArr;
        if (myDates.constructor !== Array){
            dateArr = { myDates };
        } else {
            dateArr = myDates;
        }

        for (var i=0; i<dateArr.length; i++){

            var newData;

            if (data.get(dateArr[i]) == undefined){
                newData = $(this).getDefaultData(dateArr[i]);
            } else {
                newData = data.get(dateArr[i]);
            }
            
            if ((newData != undefined) && !newData.locked){
                newData.memberNotes.push(newNote);
            }

            data.set(dateArr[i], newData);
        }
    }

    $.fn.setMemberNote = function(myDate, index, note){
        var newData;
        if (data.get(myDate) == undefined){
            newData = $(this).getDefaultData(myDate);
            newData.memberNotes.push(note);
        } else {
            newData = data.get(myDate);
            newData.memberNotes[index] = note;
        }

        data.set(myDate, newData);

        $(this).refreshCalendar();
    }

    $.fn.deleteMemberNote = function(myDate, index){
        var newData;
        if (data.get(myDate) == undefined){
            newData = $(this).getDefaultData(myDate);
        } else {
            newData = data.get(myDate);
        }

        if (index == -1){
            newData.memberNotes = [];
        } else {
            newData.memberNotes.splice(index, 1);
        }

        $(this).refreshCalendar();
    }

$.fn.getData = function(){
    return data;
}

}(jQuery));
