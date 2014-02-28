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
            allDaySlot: false,
            slotDuration: '00:15:00',
            selectable: true,
            selectHelper: true,
            defaultView: 'agendaWeek',
            editable: true,
            axisFormat: 'HH:mm',
            timeFormat: 'H(:mm)',
            weekends: false,
            select: function (start, end) {
                $('#txtTitle').val('');
                currentEvent = {
                    start: start,
                    end: end
                };
                $('#btnDelete').hide();
                $('#eventModal').modal('toggle');
            },
            eventClick: function (event, element) {
                if (event.editable) {
                    currentEvent = event;
                    $('#btnDelete').show();
                    $('#eventModal').modal('toggle');
                    $('#txtTitle').val(event.title);
                }
            },
            eventDrop: function (event, revertFunc) {
                updateEvent(event.start, event.end, event.id, event.title);
            },
            eventResize: function (event, revertFunc) {
                updateEvent(event.start, event.end, event.id, event.title);
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
                        $.each(data, function (key, value) {
                            if ($('#hdnUserName').val() === value.Person) {
                                events.push({
                                    id: value.ID,
                                    title: value.Title,
                                    start: value.DateFrom,
                                    end: value.DateTo,
                                    editable: true,
                                    person: value.Person
                                });
                            } else {
                                events.push({
                                    id: value.ID,
                                    title: value.Title,
                                    start: value.DateFrom,
                                    end: value.DateTo,
                                    editable: false,
                                    color: '#B5B8B8',
                                    textColor: '#000000',
                                    person: value.Person
                                });
                            }

                        });
                        callback(events);
                    }
                });
            },
            eventRender: function (event, element) {
                element.popover({
                    container: "body",
                    html: true,
                    trigger: 'hover',
                    title: 'Reservation',
                    placement: 'right',
                    content: '<b>Title:</b> ' + event.title + '<br /><b>Start:</b> ' + event.start.format('HH:mm') + '<br /><b>End:</b> ' + event.end.format('HH:mm') + '<br /><b>Creator:</b> ' + event.person,
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
                },
                error: function (xhr, textStatus, errorThrown) {
                    alert('Error, could not save event!');
                }
            });
        }

        $('#btnDelete').on('click', function () {
            $('#eventModal').modal('toggle');
            $('#confimationModal').modal('toggle');
        });

        $('#btnYes').on('click', function () {
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

        $('#btnNo').on('click', function () {
            $('#confimationModal').modal('toggle');
        });
    }
    return {
        setupCalendar: setupCalendar
    };
})();