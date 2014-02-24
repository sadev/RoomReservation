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
            //defaultDate: '2014-01-12',
            allDaySlot: true,
            slotDuration: '00:15:00',
            selectable: true,
            selectHelper: true,
            defaultView: 'agendaWeek',
            editable: true,
            axisFormat: 'HH:mm',
            select: function (start, end) {
                $('#txtTitle').val('');
                currentEvent = {
                    start: start,
                    end: end
                };
                $('#eventModal').modal('toggle');
            },
            eventClick: function (event, element) {
                currentEvent = event;
                $('#eventModal').modal('toggle');
                $('#txtTitle').val(event.title);
                //$('#calendar').fullCalendar('updateEvent', event);
            },
            eventDrop: function (event, revertFunc) {
                if (confirm("Confirm move?")) {
                    updateEvent(event.start, event.end, event.id, event.title);
                }
                else {
                    revertFunc();
                }
            },
            eventResize: function (event, revertFunc) {
                if (confirm("Confirm change appointment length?")) {
                    updateEvent(event.start, event.end, event.id, event.title);
                }
                else {
                    revertFunc();
                }
            },

            events: function (start, end, timezone, callback) {
                $.ajax({
                    type: 'GET',
                    url: '/api/events/room/' + $('#hdnRoomId').val(),
                    dataType: 'json',
                    contentType: 'application/json',
                    data: {
                        start: start.format(),
                        end: end.format()
                    },
                    success: function (data) {
                        var events = [];
                        $.each(data, function(key, value) {
                            events.push({
                                id: value.ID,
                                title: value.Title,
                                start: value.DateFrom,
                                end: value.DateTo
                            });
                        });
                        callback(events);
                    }
                });
            }
        });

        $('#btnSave').on('click', function () {
            if ($('#txtTitle').val()) {
                if (!currentEvent.id) {
                    var newEvent = {
                        'Title': $('#txtTitle').val(),
                        'DateFrom': currentEvent.start.format(),
                        'DateTo': currentEvent.end.format(),
                        'Person': $('#hdnUserName').val(),
                        'RoomID': $('#hdnRoomId').val(),
                    };
                    $.ajax({
                        type: 'POST',
                        url: "/api/events",
                        data: newEvent,
                        success: function (response) {
                            $('#calendar').fullCalendar('refetchEvents');                  
                        },
                        error: function (xhr, textStatus, errorThrown) {
                            alert('Error, could not save event!');
                        }

                    });
                } else {
                    updateEvent(currentEvent.start, currentEvent.end, currentEvent.id);
                }
               // currentEvent.title = $('#txtTitle').val();
                //$('#calendar').fullCalendar('updateEvent', currentEvent);
                $('#eventModal').modal('toggle');
            }
        });

        function updateEvent(start, end, eventId, title) {
            var event = {
                'Title': title ? title : $('#txtTitle').val(),
                'DateFrom': start.format(),
                'DateTo': end.format(),
                'ID': eventId,
                'Person': $('#hdnUserName').val(),
                'RoomID': $('#hdnRoomId').val(),
            };

            $.ajax({
                type: 'PUT',
                url: '/api/events/' + $('#hdnRoomId').val(),
                data: event,
                success: function () {
                    $('#calendar').fullCalendar('refetchEvents');
                    //var updatedEvent = $('#calendar').fullCalendar('clientEvents', eventId);
                    //if (updatedEvent) {
                    //    $('#calendar').fullCalendar('updateEvent', updatedEvent[0]);
                    //    $('#calendar').fullCalendar('rerenderEvents');
                    //}
                   // alert('Event has been updated!');
                },
                error: function (xhr, textStatus, errorThrown) {
                    alert('Error, could not save event!');
                }
            });
        }

        $('#btnDelete').on('click', function () {
            if (currentEvent.id) {
                $.ajax({
                    type: 'DELETE',
                    url: '/api/events/' + currentEvent.id,
                    success: function () {
                        $('#calendar').fullCalendar('removeEvents', currentEvent.id);
                        $('#calendar').fullCalendar('rerenderEvents');
                    },
                    error: function (xhr, textStatus, errorThrown) {
                        alert('Error, could not delete event!');
                    }
                });
            }
        });
    }
    return {
        setupCalendar: setupCalendar
    };
})();