<div>
<h3><a href="https://kylechua.github.io/calendar/">Demo</a></h3><br>
<h2>Calendar Plugin</h2>

<div>
<ul>
<lh><b>Selection</b></lh>
<li>Can select days by clicking or dragging</li>
<li>Can select weekdays by clicking on the weekday in the header</li>
<li>Can select all days of the month by clicking on the month header</li>
<li>Days will only be unselected when clicking on the "Select None" button, or by clicking on a singularly selected day</li>
</ul>

<ul>
<lh><b>Available/Unavailable</b></lh>
<li>Selected dates can be set to available or unavailable</li>
<li>Locked days, or days in the past cannot be changed</li>
</ul>

<ul>
<lh><b>Notes</b></lh>
<li>Inputted note will be added to every selected day when "Add Note" is pressed</li>
<li>Locked days, or days in the past cannot be changed</li>
</ul>
</div>

</div>

<h2>Functions</h2>

<b>$.Calendar(myData, defaultData)</b>

    Initializes the calendar plugin with

    myData is a Map(Key, Value) with Key = date in ISO format (e.g. "2017-05-15") and Value = an object literal with the format of defaultData

    var defaultData = {
                price: 0,
                blocked: false,
                locked: false,
                available: true,
                booked: false,
                adminNotes: [],
                memberNotes: []
            };

<b>$.get{Value}(myDate)</b>

    Returns the value of [Price, Blocked, Locked, Available, Booked, AdminNotes, MemberNotes] for the given date in ISO format. If date does not exist in data, returns default. getDefaultPrice(anyDate) can also be called.

<b>$.set{Value}(myDate, newValue)</b>
    
    Sets the value of [Price, Blocked, Locked, Available, Booked, AdminNotes, MemberNotes] for the given date in ISO format. setDefaultPrice(newPrice) can also be called.

<b>$.getData()</b>
    
    Returns the dataset

</div>