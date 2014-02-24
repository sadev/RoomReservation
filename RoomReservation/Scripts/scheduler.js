var schedulerNS = schedulerNS || {};

schedulerNS.calendar = (function () {

    var currentEvent = null;

    function setupCalendar() {
        $('#calendar').fullCalendar({
            header: {
                left: 'prev,next today',
                center: 'title',
                right: 'agendaWeek,agendaDay'
            },
            defaultDate: '2014-01-12',
            selectable: true,
            selectHelper: true,
            defaultView: 'agendaWeek',
            editable: true,
            select: function (start, end) {
                $('#txtTitle').val('');
                var eventData;
                $('#eventModal').modal('toggle');
                if ($('#txtTitle').val()) {
                    eventData = {
                        title: title,
                        start: start,
                        end: end
                    };
                    $('#calendar').fullCalendar('renderEvent', eventData, true); // stick? = true
                }
                $('#calendar').fullCalendar('unselect');
            },
            eventClick: function (event, element) {
                currentEvent = event;
                $('#eventModal').modal('toggle');
                $('#txtTitle').val(event.title);
                //$('#calendar').fullCalendar('updateEvent', event);
            },
            eventDrop: function (event, dayDelta, minuteDelta, allDay, revertFunc) {

                alert(
                    event.title + " was moved " +
                    dayDelta + " days and " +
                    minuteDelta + " minutes."
                );

                if (allDay) {
                    alert("Event is now all-day");
                } else {
                    alert("Event has a time-of-day");
                }

                if (!confirm("Are you sure about this change?")) {
                    revertFunc();
                }

            },
            eventResize: function (event, dayDelta, minuteDelta, revertFunc) {

                alert(
                    "The end date of " + event.title + "has been moved " +
                    dayDelta + " days and " +
                    minuteDelta + " minutes."
                );

                if (!confirm("is this okay?")) {
                    revertFunc();
                }

            },

            events: [
                {
                    title: 'All Day Event',
                    start: '2014-01-01'
                },
                {
                    title: 'Long Event',
                    start: '2014-01-07',
                    end: '2014-01-10'
                },
                {
                    id: 999,
                    title: 'Repeating Event',
                    start: '2014-01-09T16:00:00'
                },
                {
                    id: 999,
                    title: 'Repeating Event',
                    start: '2014-01-16T16:00:00'
                },
                {
                    title: 'Meeting',
                    start: '2014-01-12T10:30:00',
                    end: '2014-01-12T12:30:00'
                },
                {
                    title: 'Lunch',
                    start: '2014-01-12T12:00:00'
                },
                {
                    title: 'Birthday Party',
                    start: '2014-01-13T07:00:00'
                },
                {
                    title: 'Click for Google',
                    url: 'http://google.com/',
                    start: '2014-01-28'
                }
            ]
        });

        $('#btnSave').on('click', function () {
            if ($('#txtTitle').val()) {
                currentEvent.title = $('#txtTitle').val();
                $('#calendar').fullCalendar('updateEvent', currentEvent);
                $('#eventModal').modal('toggle');
            }
        });

        $('#btnDelete').on('click', function () {
            if (currentEvent.id) {
                $('#calendar').fullCalendar('removeEvents', currentEvent.id);
                $('#calendar').fullCalendar('rerenderEvents');
            }
        });
    }
    return {
        setupCalendar: setupCalendar
    };
})();