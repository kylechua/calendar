<h1><a href="https://kylechua.github.io/calendar/">Demo</a></h1>

<div>

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

    Returns the value of [Price, Blocked, Locked, Available, Booked, AdminNotes, MemberNotes] for the given date in ISO format

<b>$.set{Value}(myDate, newValue)</b>
    
    Sets the value of [Price, Blocked, Locked, Available, Booked, AdminNotes, MemberNotes] for the given date in ISO format

<b>$.getData()</b>
    
    Returns the dataset

</div>